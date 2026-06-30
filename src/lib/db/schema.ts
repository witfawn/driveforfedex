import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

// Candidates (users who sign up)
export const candidates = sqliteTable("candidates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  avatarColor: text("avatar_color"),
  profileComplete: integer("profile_complete", { mode: "boolean" }).notNull().$defaultFn(() => false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Candidate profiles (additional details collected during onboarding)
export const candidateProfiles = sqliteTable("candidate_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  candidateId: text("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  workExperience: text("work_experience"),
  availableDays: text("available_days"), // JSON array: ["Mon","Tue",...]
  preferredTerminals: text("preferred_terminals"), // JSON array: ["971","961"]
  hasCDL: integer("has_cdl", { mode: "boolean" }),
  hasVehicle: integer("has_vehicle", { mode: "boolean" }),
  additionalNotes: text("additional_notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  candidateIdx: uniqueIndex("profile_candidate_idx").on(t.candidateId),
}));

// Qualification pipeline stages
export const qualificationStages = sqliteTable("qualification_stages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  candidateId: text("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: [
      "new",
      "profile_complete",
      "bg_invite_sent",
      "bg_app_started",
      "bg_app_complete",
      "bg_submitted",
      "drug_test_invite_sent",
      "drug_test_collected",
    ],
  }).notNull().$defaultFn(() => "new"),
  bgResult: text("bg_result", { enum: ["pending", "pass", "fail"] }),
  drugResult: text("drug_result", { enum: ["pending", "pass", "fail"] }),
  firstAdvantageId: text("first_advantage_id"),
  drugTestDate: integer("drug_test_date", { mode: "timestamp" }),
  bgSubmittedDate: integer("bg_submitted_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  candidateIdx: uniqueIndex("stage_candidate_idx").on(t.candidateId),
}));

// Activity log (audit trail for candidate progression)
export const candidateActivity = sqliteTable("candidate_activity", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  candidateId: text("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  details: text("details"), // JSON, optional context
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Type exports
export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;
export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type NewCandidateProfile = typeof candidateProfiles.$inferInsert;
export type QualificationStage = typeof qualificationStages.$inferSelect;
export type NewQualificationStage = typeof qualificationStages.$inferInsert;
export type CandidateActivity = typeof candidateActivity.$inferSelect;
export type NewCandidateActivity = typeof candidateActivity.$inferInsert;