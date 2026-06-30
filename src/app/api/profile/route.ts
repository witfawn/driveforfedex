import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDb } from "@/lib/db";
import { candidates, candidateProfiles, qualificationStages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  
  const [candidate] = await db.select().from(candidates).where(eq(candidates.id, token.id as string)).limit(1);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [profile] = await db.select().from(candidateProfiles).where(eq(candidateProfiles.candidateId, candidate.id)).limit(1);
  const [stage] = await db.select().from(qualificationStages).where(eq(qualificationStages.candidateId, candidate.id)).limit(1);

  return NextResponse.json({ candidate, profile, stage });
}

export async function PUT(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const db = getDb();
  const candidateId = token.id as string;

  // Update candidate basic info
  const updateData: any = { updatedAt: new Date() };
  if (body.firstName !== undefined) updateData.firstName = body.firstName;
  if (body.lastName !== undefined) updateData.lastName = body.lastName;
  if (body.phone !== undefined) updateData.phone = body.phone;
  
  await db.update(candidates).set(updateData).where(eq(candidates.id, candidateId));

  // Update or create profile
  const [existingProfile] = await db.select().from(candidateProfiles).where(eq(candidateProfiles.candidateId, candidateId)).limit(1);

  const profileData: any = { updatedAt: new Date() };
  if (body.workExperience !== undefined) profileData.workExperience = body.workExperience;
  if (body.availableDays !== undefined) profileData.availableDays = JSON.stringify(body.availableDays);
  if (body.preferredTerminals !== undefined) profileData.preferredTerminals = JSON.stringify(body.preferredTerminals);
  if (body.hasCDL !== undefined) profileData.hasCDL = body.hasCDL;
  if (body.hasVehicle !== undefined) profileData.hasVehicle = body.hasVehicle;
  if (body.additionalNotes !== undefined) profileData.additionalNotes = body.additionalNotes;

  // Check if profile is complete (minimum: firstName, lastName, email)
  const [updatedCandidate] = await db.select().from(candidates).where(eq(candidates.id, candidateId)).limit(1);
  const isComplete = !!(updatedCandidate.firstName && updatedCandidate.lastName && updatedCandidate.email);
  
  if (isComplete && !updatedCandidate.profileComplete) {
    await db.update(candidates).set({ profileComplete: true, updatedAt: new Date() }).where(eq(candidates.id, candidateId));
    
    // Update stage to profile_complete if currently "new"
    const [stage] = await db.select().from(qualificationStages).where(eq(qualificationStages.candidateId, candidateId)).limit(1);
    if (stage && stage.status === "new") {
      await db.update(qualificationStages).set({ status: "profile_complete", updatedAt: new Date() }).where(eq(qualificationStages.id, stage.id));
    }
  }

  if (existingProfile) {
    await db.update(candidateProfiles).set(profileData).where(eq(candidateProfiles.id, existingProfile.id));
  } else {
    await db.insert(candidateProfiles).values({ candidateId, ...profileData });
  }

  return NextResponse.json({ success: true });
}