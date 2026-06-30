import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDb } from "@/lib/db";
import { candidates, candidateProfiles, qualificationStages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ADMIN_EMAILS } from "@/lib/config";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ADMIN_EMAILS.includes(token.email as string)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = getDb();
  const allCandidates = await db.select().from(candidates).orderBy(candidates.createdAt);
  
  const result = [];
  for (const c of allCandidates) {
    const [profile] = await db.select().from(candidateProfiles).where(eq(candidateProfiles.candidateId, c.id)).limit(1);
    const [stage] = await db.select().from(qualificationStages).where(eq(qualificationStages.candidateId, c.id)).limit(1);
    result.push({ ...c, profile, stage });
  }

  return NextResponse.json({ candidates: result });
}