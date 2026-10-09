# AptTraC

A modern Applicant Tracking System for recruiters and hiring teams, built in seven user-approved phases.

Private repository: [PranavP2207/apttrac](https://github.com/PranavP2207/apttrac).

## Current status

**Phase 2: setup, database, authentication, layout, and design system.**

Implemented:

- Runnable Next.js app with TypeScript and pinned dependencies.
- Complete Prisma schema, initial SQLite migration, generated client, and idempotent synthetic seed.
- Credentials login/logout with bcrypt password hashes and NextAuth JWT sessions.
- Server-side active-user, session-version, role, and Hiring Manager job-scope checks.
- Responsive collapsible sidebar, accessible mobile navigation, profile/logout menu, persistent light/dark themes, and keyboard global search (Ctrl/Cmd+K).
- Shared shadcn/ui-style Radix source components: buttons, labeled inputs, cards, badges, dialogs, confirmation dialogs, dropdowns, avatars, skeletons, empty states, and toasts.
- Database-backed overview and read-only jobs, candidates, interviews, activity, and administrator company/team views.
- Playwright checks for seed integrity, authentication, permissions, search, themes, and mobile navigation using an isolated database.

Editing workflows and remaining ATS modules arrive in the next phases. The user explicitly approved **Next.js 15** after the Next.js 14 audit showed critical advisories (D-006). No hosting/deployment has been performed.

## Quick start (Windows PowerShell)

Use Node.js 22.12+ or Node.js 24 LTS. Verified here with Node.js 24.19.0 and npm 11.17.0.

To get a fresh checkout, authenticate GitHub CLI and clone the private repository:

```powershell
gh auth login
gh repo clone PranavP2207/apttrac
cd apttrac
```

Then run the setup commands below. In the existing workspace, start directly with these commands:

```powershell
npm.cmd install
npm.cmd run setup
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000). On macOS/Linux, use `npm` in place of `npm.cmd`.

`setup` creates .env from .env.example, generates a random authentication secret, generates Prisma Client, applies committed migrations, and seeds the database. Existing environment values are preserved. The authentication secret remains in the ignored .env file.

Customize the admin before the first seed:

```powershell
npm.cmd run env:setup
# Edit SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.
npm.cmd run setup
```

Seed passwords need at least 12 characters and at most 72 UTF-8 bytes. Rerunning seed preserves existing records/passwords. Changing seed environment values afterward does not reset an existing account.

## Demo accounts

All synthetic accounts use SEED_ADMIN_PASSWORD from .env. The unchanged example password is **`AptTraCDemo!2026`**.

These defaults apply to a fresh setup. Renaming the app preserves existing database accounts and local .env values; use the admin details already in .env for an existing installation.

| Person         | Role           | Email                                       |
| -------------- | -------------- | ------------------------------------------- |
| Priya Sharma   | Admin          | `admin@apttrac.local` (or SEED_ADMIN_EMAIL) |
| Alex Morgan    | Recruiter      | `recruiter@apttrac.local`                   |
| Sam Rivera     | Recruiter      | `recruiter2@apttrac.local`                  |
| Jordan Lee     | Hiring Manager | `manager@apttrac.local`                     |
| Taylor Bennett | Hiring Manager | `design.manager@apttrac.local`              |
| Casey Singh    | Hiring Manager | `people.manager@apttrac.local`              |

This synthetic seed refuses to run with NODE_ENV=production. Candidate identities are fictional and contact emails use example domains. Seeded profiles have no imaginary downloadable resumes: resume files arrive through the Phase 4 upload workflow.

## Stack

Next.js **15.5.27**, React **18.3.1**, TypeScript, Tailwind CSS 3, shadcn/ui-style Radix source components, lucide-react, Prisma **6.19.3**, SQLite, NextAuth **4.24.15**, Zod, React Hook Form, dnd-kit, and Recharts.

Matching Prisma CLI/client versions are pinned. SQLite enum/JSON support requires Prisma >= 6.2. Credentials sessions use JWT cookies; the app owns its User/password table rather than OAuth adapter tables.

## Structure

```text
app/          Routes, layouts, pages, route handlers, loading/errors
components/   Reusable UI, navigation, global search, shared presentation
features/     Auth, overview foundations, scoped job/candidate queries
lib/          Prisma, environment, current-user/permissions, dates, utilities
prisma/       Full schema, committed migration, realistic seed
types/        NextAuth extensions and shared action result types
e2e/          Browser acceptance tests and isolated database bootstrap
scripts/      Environment setup and PostgreSQL schema validation
docs/         Architecture and verification plan/evidence
```

See [architecture](docs/architecture.md) for the complete planned route tree. Private data code imports server-only. Browser responses/selects exclude password hashes and unrelated private fields.

## Permissions

- Admin: all hiring data and company/team settings.
- Recruiter: all hiring data; no administrator user/company area.
- Hiring Manager: assigned jobs and their candidate applications/interviews/notes/activity.
- Guests receive login redirects on private pages and 401 on private APIs. Insufficient API roles receive 403; restricted administrator pages show an access-restricted view.
- Every protected data boundary checks the current DB user, active flag, role and session version. Middleware is an early redirect.
- Disabling/resetting a user's access should increment sessionVersion to invalidate old cookies. User-management actions arrive in Phase 7.
- Sign-in/sign-out are audited. Login uses generic errors and bounded per-account rate limiting for this local single-process app. A multi-instance deployment needs a shared rate-limit store.

## Database and seed

The seed creates one company, six users, five jobs, 30 candidate profiles, 36 applications, seven stages per job, valid transition histories, 12 interviews, four scorecards, eight notes/mentions, four email templates, eight simulated email logs, six tags, and recipient-specific notifications.

```powershell
npm.cmd run db:validate
npm.cmd run db:validate:postgres
npm.cmd run db:seed
npm.cmd run db:studio
```

PostgreSQL validation checks a temporary provider-switched schema using a dummy URL; it does not connect to a live PostgreSQL database.

For a schema change:

```powershell
npm.cmd run db:migrate -- --name describe_change
```

SQLite lives in prisma/dev.db, ignored by Git. Moving to PostgreSQL requires changing provider/URL, creating PostgreSQL migrations, and transferring data; SQLite migration SQL cannot be reused.

## Verification and artifacts

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
npm.cmd run test:report
```

On this Windows installation, tests use installed Chrome with a fresh isolated profile. If Chrome is unavailable, install Chromium first:

```powershell
npx.cmd playwright install chromium
```

Tests start their own server on 127.0.0.1:3100, use prisma/e2e.db, and build into .next-e2e. They reset only the isolated test database, preserving the development database.

Artifacts: playwright-report/index.html, test-results/results.json, desktop/mobile screenshots and failure traces/screenshots. Generated artifacts are ignored by Git. See [Phase 2 verification](docs/phase-2-verification.md) for actual evidence.

Verified on 2026-10-09: TypeScript, lint, production build, nine browser E2E flows, seed idempotency, SQLite/PostgreSQL schema validation, and local production smoke all pass. Source formatting is available through `npm.cmd run format` and `npm.cmd run format:check`.

Production build/start locally:

```powershell
npm.cmd run build
npm.cmd run start -- --hostname 127.0.0.1
```

With that server running, use `npm.cmd run test:production` in another terminal. It logs in using the seeded admin values in .env, checks the real production build, logs out, and saves `test-results/production-smoke.json` plus production login/desktop/dark/mobile screenshots. It adds login/logout audit events to the local database without resetting hiring data.

## Dependency audit

After the approved update and supporting fixes, npm audit --omit=dev reported **zero production findings** on 2026-10-09. The full audit retains development-tool findings, primarily the Tailwind 3 glob/parser chain. See [known issues](known-issues.md); future audit results may change.

## Delivery phases

1. Plan: architecture, folders, full schema — complete.
2. Setup: packages, database/seed, authentication, layout, design system — complete and verified locally.
3. Jobs and candidates editing workflows.
4. Pipeline and resume parsing.
5. Interviews, scorecards, notes, email templates.
6. Public careers, complete dashboard, reports.
7. Settings, notifications, polish, final E2E verification.

Wait for the user's continue between phases. Maintain [current state](current-state.md), [decisions](decisions.md), [instructions](instructions.md), and [known issues](known-issues.md).
