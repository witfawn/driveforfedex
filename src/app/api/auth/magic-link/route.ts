import { NextRequest, NextResponse } from "next/server";
import { createMagicToken } from "@/lib/magic-link";

const N8N_WEBHOOK_URL =
  "https://srv1310080.tail4fc6b2.ts.net/webhook/magic-login";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Generate magic link token
  const token = await createMagicToken(normalizedEmail);
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/auth/verify?token=${token}`;

  // Extract first name from email (best effort)
  const firstName = normalizedEmail.split("@")[0].split(".")[0];

  // Send to n8n webhook (same one Bangers WC uses)
  try {
    const payload = {
      email: normalizedEmail,
      phone: "",
      first_name: firstName,
      magic_link: magicLink,
      channel: "email",
      timestamp: new Date().toISOString(),
    };

    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.MAGIC_LINK_API_KEY || "witfawn-secret-key-123",
      },
      body: JSON.stringify(payload),
    });

    console.log(`[MAGIC LINK] Sent to n8n for ${normalizedEmail}`);
  } catch (err) {
    console.error("[MAGIC LINK] Failed to trigger n8n:", err);
  }

  return NextResponse.json({
    success: true,
    message: "If an account exists, a login link has been sent.",
  });
}
