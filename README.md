# 🎓 OpportunityHub — Student Opportunity Finder

**Author:** DHARUNYASHREE · [dharunyashree156@gmail.com](mailto:dharunyashree156@gmail.com)

A responsive web application that helps students in India discover **scholarships, internships, free online courses, skill-development programs and government exam notifications** — all aggregated in one trustworthy place, with honest verification badges and deadline tracking.

---

## 🧭 Why this project?

Students today face four recurring problems:

1. **Scattered information** — opportunities live across dozens of government portals, university sites and provider pages.
2. **Confusing eligibility** — criteria are buried in dense PDFs and notices.
3. **Missed deadlines** — there is no single place to see what closes when.
4. **Outdated or unreliable listings** — random blogs and WhatsApp forwards often point to expired or fake links.

OpportunityHub tackles all four with a verified, structured catalogue, powerful filtering, deadline tracking and optional AI-assisted matching that **always explains its reasoning**.

---

## ✨ Features

| Area | What you get |
|------|--------------|
| 🏠 **Home** | Hero search, browse-by-category cards, *verified opportunities closing soon*, upcoming deadlines panel |
| 🔎 **Explore** | Full-text search + filters for **type, qualification level, subject/field, location, paid/unpaid internships, free/paid courses, verification status and deadline window**, plus sorting |
| 📄 **Opportunity Details** | Eligibility, benefits, required documents, deadline countdown, original source, verification badge, *last-verified date* and the official application link |
| 👤 **Student Profile** | Voluntary education level, field, region, skills, interests and career goal — used only for matching inside the app |
| ⭐ **Saved Opportunities** | One-click save/unsave with toast feedback (requires a free account) |
| ⏰ **Deadline Tracker** | Urgency-grouped timeline (≤7 days, 8–30 days, later) with in-app reminders — no fake email claims |
| 🛠 **Admin Dashboard** | Role-protected: add, edit, verify, mark-expired and delete listings; verification stamps the *last-checked* date honestly |
| 🤖 **AI Matching (optional)** | Rule-based + LLM-assisted matching that explains *why* each opportunity is suggested. It can never invent opportunities, deadlines or links, and never guarantees selection |

### Trust & safety principles

- Official government / university / provider sources are prioritised; every listing shows its **source type, official URL and last-verified date**.
- Listings are honestly labelled **Verified / Unverified / Expired** — the app never claims a listing is verified when it is not.
- Sample catalogue data is clearly marked as **demo data**; always confirm on the official page before applying.
- No API keys or secrets live in the frontend; sessions use signed HTTP-only cookies with hashed passwords.
- The AI feature is advisory-only with visible guardrail messaging.

---

## 🧰 Tech stack

- **Next.js 16 (App Router)** + **TypeScript 5** — pages and API routes
- **Tailwind CSS 4** + **shadcn/ui** (New York) + Lucide icons — navy + white + teal design system
- **Prisma ORM + SQLite** — database (swappable to Postgres/Supabase via the Prisma datasource)
- **Zustand** — lightweight client state (active view, session user)
- Cookie-based session auth with role access control (`STUDENT` / `ADMIN`)

---

## 🚀 Run locally

```bash
# 1. Install dependencies (bun or npm both work)
bun install        # or: npm install

# 2. Configure environment
cp .env.example .env

# 3. Push the Prisma schema to the SQLite database
bunx prisma db push

# 4. Seed demo accounts + 32 realistic sample listings
bun prisma/seed.ts

# 5. Start the dev server
bun run dev        # or: npm run dev
```

Open http://localhost:3000 in your browser.

### Demo accounts (created by the seed script)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@opportunityhub.in` | `Admin@1234` |
| Student | `student@demo.in` | `Student@123` |

> The student account can browse, save and track deadlines; only the admin account can add/edit/verify/delete listings.

---

## 📦 Build & deploy

```bash
bun run lint       # code quality check
bunx prisma generate && bunx prisma db push
bun run build      # production build
bun run start      # production server
```

**Deploying elsewhere (e.g. Vercel + hosted Postgres/Supabase):**

1. Create the hosted database and copy its connection string.
2. Set `DATABASE_URL` in the host's environment variables (never in client code).
3. Point the Prisma `datasource` at the target provider, run `prisma db push`, optionally re-seed.
4. Deploy the Next.js app and set the same env var in the dashboard.

---

## 🗂 Project structure

```
src/
  app/
    page.tsx                  # single entry — client-side view switching
    api/                      # REST endpoints
      opportunities/          # list / create / update / verify / delete
      saved/                  # save & unsave
      profile/                # student profile
      recommendations/        # AI + rule-based matching
      auth/                   # register / login / logout / me
  components/
    views/                    # home, explore, detail, profile, saved, deadlines, admin
    opportunity/              # cards & verification badges
    layout/                   # navbar, footer
  lib/                        # db client, auth, matching query builder, types
prisma/
  schema.prisma               # User, StudentProfile, Opportunity, SavedOpportunity
  seed.ts                     # demo accounts + 32 sample listings
```

---

## ✅ Tested user journeys

- Guest browsing, search, filtering and detail viewing
- Register / sign in / sign out; saving is gated behind a free account
- Save → Saved list → Deadline tracker with urgency groups
- Profile → recommendations with visible "why this is recommended" explanations and honest AI-unavailable fallback
- Role-based admin access control (students are blocked from admin)
- Admin: create, edit, mark verified/expired, delete listings

---

## ⚠️ Honest limitations

- The seeded catalogue is **sample data for demonstration** (deadlines set around Oct 2026 – Mar 2027) — not a live government feed. Connecting a real feed requires an authenticated data pipeline and re-verification.
- Deadline reminders are **in-app only**; email/SMS delivery is intentionally *not* faked.
- The AI matcher works from the platform's own verified catalogue only and cannot create new listings, links or deadlines.
