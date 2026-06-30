# Goal: DriveForFedex.com — Candidate Pre-Qualification Platform

## Vision

Build a candidate-facing web app that lets people looking for FedEx Ground driving jobs pre-qualify themselves through background checks and drug testing. By the time they talk to a contractor, they have a FedEx ID number and are ready for a road test — 4+ days ahead of unqualified candidates.

The long-term play: FedEx Ground contractors pool their recruiting budgets and pull from a shared qualified candidate pool, eliminating duplicate job postings and reducing cost-per-hire.

## Scope — Phase 1 (This Build)

**Candidate-side app only.** No contractor dashboard yet. No Stripe billing. No FirstAdvantage API integration (manual workflow for now).

### What we're building:
1. **Landing page** — marketing/selling points for candidates
2. **Auth** — Google OAuth + magic link (same pattern as Bangers WC)
3. **Candidate onboarding** — profile creation + qualification process walkthrough
4. **Status tracking** — candidates see where they are in the process
5. **Admin view** — John can see all candidates and their statuses

### What we're NOT building yet:
- ❌ Contractor dashboard / subscription system
- ❌ FirstAdvantage API integration (manual for now)
- ❌ Stripe billing
- ❌ Multi-terminal expansion (Portland area first)
- ❌ Automated drug test ordering

---

## Tech Stack

Reuse existing patterns from Bangers WC and frankie-babysitting:

| Component | Technology | Source Pattern |
|-----------|-----------|----------------|
| Framework | Next.js 14 App Router | All projects |
| Auth | NextAuth v4 — Google OAuth + Magic Link (JWT) | fifa-world-cup |
| Magic Link Email | n8n webhook (`srv1310080.tail4fc6b2.ts.net/webhook/magic-login`) | fifa-world-cup |
| Database | Turso/LibSQL + Drizzle ORM | fifa-world-cup |
| UI Components | shadcn/ui (Radix + Tailwind) | frankie-babysitting |
| Validation | Zod 4 | fifa-world-cup |
| Data Fetching | TanStack React Query | fifa-world-cup |
| Deployment | Vercel (default URL for now) | All projects |
| Version Control | GitHub (witfawn org) | All projects |

### Reused Credentials / Services
- **Google OAuth:** Reuse existing Google Cloud credentials from fifa-world-cup (or create new client ID for this domain)
- **Turso:** Same Turso account, new database instance
- **n8n:** Same magic link webhook endpoint
- **Vercel:** Same Vercel account

---

## Database Schema

### Tables

```typescript
// lib/db/schema.ts

// Candidates (users who sign up)
candidates: {
  id: UUID (primary key)
  email: TEXT (unique, not null)
  name: TEXT
  firstName: TEXT
  lastName: TEXT
  phone: TEXT
  avatarColor: TEXT (random on creation, 8 colors)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}

// Candidate profiles (additional details collected during onboarding)
candidateProfiles: {
  id: UUID (primary key)
  candidateId: UUID (FK → candidates)
  workExperience: TEXT (freeform or structured)
  availableDays: TEXT (JSON array: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"])
  preferredTerminals: TEXT (JSON array: ["971","961"])  // Portland area terminals
  hasCDL: BOOLEAN
  hasVehicle: BOOLEAN
  additionalNotes: TEXT
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}

// Qualification pipeline stages
qualificationStages: {
  id: UUID (primary key)
  candidateId: UUID (FK → candidates)
  status: TEXT (enum: see below)
  bgResult: TEXT (enum: pending | pass | fail | null)
  drugResult: TEXT (enum: pending | pass | fail | null)
  firstAdvantageId: TEXT (John's internal tracking ID)
  drugTestDate: TIMESTAMP
  bgSubmittedDate: TIMESTAMP
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}

// Activity log (audit trail for candidate progression)
candidateActivity: {
  id: UUID (primary key)
  candidateId: UUID (FK → candidates)
  action: TEXT (e.g., "bg_invite_sent", "bg_app_started", "drug_test_ordered")
  details: TEXT (JSON, optional context)
  createdAt: TIMESTAMP
}
```

### Status Enum (Process Stage)

```
new                          — Just signed up, profile incomplete
profile_complete             — Minimum info provided (first name, last name, email)
bg_invite_sent               — FirstAdvantage background check invite email sent
bg_app_started               — Candidate began the FirstAdvantage application
bg_app_complete              — Candidate finished the FirstAdvantage application
bg_submitted                 — System submitted for processing (manual step by John)
drug_test_invite_sent        — Drug test instructions emailed to candidate
drug_test_collected          — Candidate completed the drug test (specimen collected)
```

### Result Enums (Separate Axes)

```
bgResult:    null | "pending" | "pass" | "fail"
drugResult:  null | "pending" | "pass" | "fail"
```

A candidate can be at status `bg_submitted` with `bgResult: "pending"` — the process stage and result are independent.

---

## User Flows

### Flow 1: Candidate Signs Up

```
Landing Page
    ↓
Click "Get Started" / "Pre-Qualify Now"
    ↓
Auth Page: Google OAuth button + "Sign in with Email" (magic link)
    ↓
Magic link email → click → verify → signed in
    ↓
Onboarding Wizard:
  Step 1: First Name + Last Name (required)
  Step 2: Phone Number (optional, for SMS updates later)
  Step 3: Work Experience (optional — moving, delivery, truck driving, etc.)
  Step 4: Available Days (checkboxes)
  Step 5: Preferred Terminals (checkboxes — 971 Troutdale, 961 Swan Island, expandable)
    ↓
Profile Complete → Status: "profile_complete"
    ↓
Qualification Status Dashboard shows next steps
```

### Flow 2: Candidate Progresses Through Qualification

```
Candidate sees status dashboard:
  ✅ Profile complete
  → Background Check: Not started
  → Drug Test: Not started

Candidate clicks "Start Background Check"
    ↓
App displays FirstAdvantage instructions:
  - What to expect
  - Step-by-step walkthrough
  - Common pitfalls / FAQ
  - Link to FirstAdvantage portal
    ↓
Status updates to "bg_invite_sent" (manual trigger by John for now)
    ↓
Candidate completes FirstAdvantage app on their own
    ↓
Status updates to "bg_app_complete" (manual trigger or candidate self-reports)
    ↓
John submits for processing
    ↓
Status: "bg_submitted" | bgResult: "pending"
    ↓
Results come in (email to John)
    ↓
John updates: bgResult: "pass" or "fail"
    ↓
If pass → Drug test instructions sent
Status: "drug_test_invite_sent"
    ↓
Candidate completes drug test
    ↓
Status: "drug_test_collected" | drugResult: "pending"
    ↓
Results come in
    ↓
John updates: drugResult: "pass" or "fail"
    ↓
If both pass → Candidate is "Qualified" ✅
```

### Flow 3: Candidate Checks Status

```
Candidate logs in → sees dashboard:
  ┌─────────────────────────────────────┐
  │  Welcome, [Name]                    │
  │                                     │
  │  Your Status: In Progress           │
  │                                     │
  │  ✅ Profile Complete                │
  │  ✅ Background Check — Passed       │
  │  🔄 Drug Test — Pending             │
  │                                     │
  │  [View FirstAdvantage Instructions] │
  │  [Update Profile]                   │
  └─────────────────────────────────────┘
```

---

## Landing Page

### Content Sections

1. **Hero** — "Get Ahead of the Crowd. Pre-Qualify for FedEx Driving Jobs."
2. **Value Prop** — "When you walk into a FedEx contractor with a background check passed and drug test cleared, you're 4 days ahead of every other applicant."
3. **How It Works** — 3-step visual:
   - Step 1: Create your profile (2 minutes)
   - Step 2: Complete background check + drug test
   - Step 3: Get matched with FedEx contractors in Portland
4. **FAQ** — Common questions about the process
5. **CTA** — "Start Your Pre-Qualification" → auth page

### Design
- Clean, professional, mobile-first
- FedEx-inspired color palette (purple + orange accents on neutral background)
- shadcn/ui components
- Tailwind CSS

---

## Pages

| Route | Auth Required | Description |
|-------|--------------|-------------|
| `/` | No | Landing page with marketing content |
| `/auth/login` | No | Google OAuth + magic link login |
| `/auth/verify` | No | Magic link verification endpoint |
| `/dashboard` | Yes | Candidate status dashboard |
| `/dashboard/profile` | Yes | Edit profile (name, experience, days, terminals) |
| `/dashboard/qualification` | Yes | Qualification process status + FirstAdvantage instructions |
| `/admin` | Yes (admin only) | John's admin view — all candidates, statuses, manual status updates |

---

## Admin View (John Only)

Simple table view of all candidates:

| Name | Email | Status | BG Result | Drug Result | Last Updated |
|------|-------|--------|-----------|-------------|-------------|
| John Doe | john@email.com | bg_submitted | pending | null | 2026-06-30 |
| Jane Smith | jane@email.com | drug_test_collected | pass | pending | 2026-06-30 |

Admin can:
- Click into a candidate to see full profile
- Manually update status (for FirstAdvantage workflow steps)
- Manually update BG/drug results
- Add activity notes

---

## Auth Implementation

Follow the **fifa-world-cup** pattern exactly:

1. **NextAuth v4** with `CredentialsProvider` (magic link) + `GoogleProvider`
2. **JWT session strategy** (no database sessions)
3. **Magic link flow:**
   - POST `/api/auth/magic-link` → generate JWT (jose, HS256, 10min expiry)
   - Send to n8n webhook for email delivery
   - User clicks → `/auth/verify?token=...` → signIn("credentials", { token })
   - CredentialsProvider.authorize() verifies JWT via jose/jwtVerify
   - Auto-create user in DB on first login
4. **Google flow:** Standard OAuth → signIn callback creates user in DB if new
5. **Middleware:** Check `getToken()` — public paths: `/`, `/auth/*`, `/api/auth/*`

### Environment Variables Needed

```
# Turso
TURSO_DATABASE_URL=libsql://driveforfedex-witfawn.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=...

# NextAuth
NEXTAUTH_URL=https://drive-for-fedex.vercel.app  # update when custom domain configured
NEXTAUTH_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# n8n (magic link)
N8N_MAGIC_LINK_WEBHOOK=srv1310080.tail4fc6b2.ts.net/webhook/magic-login
```

---

## Implementation Order

1. **Scaffold** — Next.js 14 App Router, shadcn/ui, Tailwind, Drizzle + Turso setup
2. **Auth** — NextAuth v4 with Google + magic link (copy from fifa-world-cup, adapt)
3. **Database** — Drizzle schema for candidates, profiles, qualification stages, activity log
4. **Landing page** — Marketing content, hero, value props, CTA
5. **Onboarding wizard** — Profile creation flow (first name, last name, experience, days, terminals)
6. **Candidate dashboard** — Status display, FirstAdvantage instructions, profile editing
7. **Admin view** — Candidate list, status management, manual updates
8. **Deploy** — Push to GitHub, deploy to Vercel, test

---

## Key Constraints

- **Mobile-first** — candidates will mostly use phones
- **No contractor features yet** — keep it simple
- **FirstAdvantage is manual** — the app provides instructions, John does the backend work
- **Portland area first** — terminal options: 971 (Troutdale), 961 (Swan Island)
- **Minimize new subscriptions** — reuse existing Turso, Vercel, n8n, Google Cloud
- **Lean UI** — color over icons, minimal design, shadcn/ui components

---

## Reference Materials

- **Brain dump:** `~/projects/RECRUITING-KB.md` — full current-state recruiting process, pain points, competitor analysis
- **Auth reference:** `~/projects/fifa-world-cup/` — NextAuth v4 + magic link + Turso + Drizzle pattern
- **UI reference:** `~/projects/frankie-babysitting/` — shadcn/ui setup with Radix primitives
- **Deploy pattern:** Any Vercel-deployed project's `vercel.json`

---

*Goal created: 2026-06-30*
*Phase 1 scope: Candidate-side pre-qualification app*
*Deployment: Vercel (default URL) → custom domain later*
