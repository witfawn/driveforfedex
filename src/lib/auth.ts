import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyMagicToken } from "@/lib/magic-link";
import { getRandomColor } from "@/lib/config";

// Debug: log env var availability on module load
const _gcid = process.env.GOOGLE_CLIENT_ID;
const _gcsec = process.env.GOOGLE_CLIENT_SECRET;
const _nurl = process.env.NEXTAUTH_URL;
console.log(`[AUTH INIT] GOOGLE_CLIENT_ID=${_gcid ? "SET(" + _gcid.substring(0, 10) + "...)" : "EMPTY"}`);
console.log(`[AUTH INIT] GOOGLE_CLIENT_SECRET=${_gcsec ? "SET(" + _gcsec.substring(0, 5) + "...)" : "EMPTY"}`);
console.log(`[AUTH INIT] NEXTAUTH_URL=${_nurl || "EMPTY"}`);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Magic Link",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;

        const email = await verifyMagicToken(credentials.token);
        if (!email) return null;

        // Look up or create user in DB
        try {
          const { getDb } = await import("@/lib/db");
          const { candidates } = await import("@/lib/db/schema");
          const { qualificationStages } = await import("@/lib/db/schema");
          const { eq } = await import("drizzle-orm");

          const db = getDb();
          const existing = await db
            .select()
            .from(candidates)
            .where(eq(candidates.email, email))
            .limit(1);

          if (existing.length > 0) {
            return {
              id: existing[0].id,
              email: existing[0].email,
              name: `${existing[0].firstName || ""} ${existing[0].lastName || ""}`.trim() || email.split("@")[0],
              image: null,
            };
          }

          // New user — create candidate record + qualification stage
          const id = crypto.randomUUID();
          await db.insert(candidates).values({
            id,
            email,
            avatarColor: getRandomColor(),
            profileComplete: false,
          });

          // Create initial qualification stage
          await db.insert(qualificationStages).values({
            candidateId: id,
            status: "new",
          });

          return { id, email, name: email.split("@")[0], image: null };
        } catch (err) {
          console.error("Magic link auth error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.id = account.providerAccountId || user?.id;
      }
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const { getDb } = await import("@/lib/db");
          const { candidates } = await import("@/lib/db/schema");
          const { qualificationStages } = await import("@/lib/db/schema");
          const { eq } = await import("drizzle-orm");

          const db = getDb();
          const existing = await db
            .select()
            .from(candidates)
            .where(eq(candidates.email, user.email))
            .limit(1);

          if (existing.length === 0) {
            // First time — create candidate in DB
            const id = user.id || crypto.randomUUID();
            await db.insert(candidates).values({
              id,
              email: user.email,
              firstName: user.name?.split(" ")[0] || null,
              lastName: user.name?.split(" ").slice(1).join(" ") || null,
              avatarColor: getRandomColor(),
              profileComplete: false,
            });

            // Create initial qualification stage
            await db.insert(qualificationStages).values({
              candidateId: id,
              status: "new",
            });
          }
        } catch (err) {
          console.error("Error creating candidate in DB:", err);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
};
