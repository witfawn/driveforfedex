import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDb } from "@/lib/db";
import { candidates, candidateProfiles, qualificationStages, candidateActivity } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ADMIN_EMAILS } from "@/lib/config";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ADMIN_EMAILS.includes(token.email as string)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = getDb();
  const [candidate] = await db.select().from(candidates).where(eq(candidates.id, params.id)).limit(1);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [profile] = await db.select().from(candidateProfiles).where(eq(candidateProfiles.candidateId, params.id)).limit(1);
  const [stage] = await db.select().from(qualificationStages).where(eq(qualificationStages.candidateId, params.id)).limit(1);
  const activity = await db.select().from(candidateActivity).where(eq(candidateActivity.candidateId, params.id)).orderBy(candidateActivity.createdAt);

  return NextResponse.json({ candidate, profile, stage, activity });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ADMIN_EMAILS.includes(token.email as string)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const db = getDb();

  const [stage] = await db.select().from(qualificationStages).where(eq(qualificationStages.candidateId, params.id)).limit(1);
  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  const updateData: any = { updatedAt: new Date() };
  if (body.status) updateData.status = body.status;
  if (body.bgResult !== undefined) updateData.bgResult = body.bgResult;
  if (body.drugResult !== undefined) updateData.drugResult = body.drugResult;
  if (body.firstAdvantageId !== undefined) updateData.firstAdvantageId = body.firstAdvantageId;
  if (body.drugTestDate) updateData.drugTestDate = new Date(body.drugTestDate);
  if (body.bgSubmittedDate) updateData.bgSubmittedDate = new Date(body.bgSubmittedDate);

  await db.update(qualificationStages).set(updateData).where(eq(qualificationStages.id, stage.id));

  // Log activity
  if (body.status || body.bgResult || body.drugResult) {
    const action = body.status || `bg:${body.bgResult}` || `drug:${body.drugResult}`;
    await db.insert(candidateActivity).values({
      candidateId: params.id,
      action,
      details: body.notes || null,
    });
  }

  return NextResponse.json({ success: true });
}