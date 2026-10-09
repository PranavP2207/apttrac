# Current state: AptTraC

Last updated: 2026-10-09

## Project and scope

- Goal: Build a complete Applicant Tracking System named AptTraC using the user's specified stack and seven delivery phases.
- Current stage: Phase 2 complete; paused at the requested phase boundary. Wait for `continue` before implementing Phase 3.
- App root: `C:/Users/prana/Documents/ChatGPT/ATS`.
- Scope and acceptance criteria: See [instructions.md](instructions.md).

## Implemented and verified

- Next.js 15.5.27 app, pinned dependencies, environment setup, Prisma client and committed SQLite migration are installed. The user explicitly approved Next.js 15 (D-006).
- Complete Prisma schema: 20 models and 13 enums; SQLite and PostgreSQL-provider schema validation passed.
- Synthetic seed ran: 6 users, 5 jobs, 30 profiles, 36 applications, 12 interviews, 4 scorecards, 8 notes and 4 templates. Rerunning seed preserves existing records/passwords.
- Credentials authentication, logout auditing, active-user/session-version checks, role permissions, and scoped database queries are implemented.
- Responsive workspace shell, global keyboard search, light/dark themes, shared Radix/shadcn UI primitives, and read-only overview/jobs/candidates/interviews/activity/company/team screens are implemented.
- Production dependency audit: zero findings. Full audit: 9 development-tool findings (7 high, 2 moderate), documented in I-002.
- Final TypeScript check, lint and production build pass. All 9 Playwright flows pass (no failures/skips/flaky tests); production browser smoke also passes.
- Login/logout, guest guards, recruiter/manager scope, revoked/disabled accounts, keyboard search, sidebar collapse, persistent themes and mobile navigation are verified locally.
- Production login/desktop/dark screenshots and mobile job-list screenshots were visually inspected. Repeatable artifacts are in `test-results/` and `playwright-report/`; see `docs/phase-2-verification.md`.
- Deployment: Not requested or performed.
- AptTraC rename and GitHub delivery are complete. Private repository: https://github.com/PranavP2207/apttrac. Initial source commit b846260 was pushed and its full SHA matched GitHub's main branch.

## Structure and environment

- Stack: Next.js 15.5.27 App Router, React 18, TypeScript, Tailwind 3, Radix/shadcn components, lucide-react, Prisma 6.19.3, SQLite, NextAuth 4.24.15, Zod, React Hook Form, dnd-kit, Recharts.
- Full source tree: `app/`, `components/`, `features/`, `lib/`, `prisma/`, `types/`; verification in `e2e/`, `scripts/`, `docs/`.
- Setup: `npm.cmd install`, `npm.cmd run setup`, `npm.cmd run dev`. See README for synthetic account details; no secrets are stored in context.
- Tests use isolated `prisma/e2e.db`, port 3100 and `.next-e2e`; development DB is `prisma/dev.db`.
- Local production preview runs at `http://localhost:3000` (bound to 127.0.0.1). It is a running tool-managed process, not an installed background service; restart with `npm.cmd run start -- --hostname 127.0.0.1` after a build if needed.
- GitHub CLI 2.102.0 is installed at `C:/Program Files/GitHub CLI/gh.exe`, on the installed Windows PATH, and authenticated as PranavP2207. Git uses HTTPS; local main tracks origin/main at the private repository above.

## Remaining work

- Renamed-app verification on 2026-10-09: build, lint, TypeScript and formatting pass; 9 browser flows pass in 51.1 seconds; production smoke passes. Local preview now displays AptTraC. Fresh setup uses AptTraC demo defaults; existing local accounts and .env values are preserved.
- Publishing inspection passed for 89 source files: actual local authentication secret, .env, databases, uploads and generated artifacts were excluded. Only synthetic example/test credentials are part of the source.

- No Phase 2 implementation remains pending. PostgreSQL schema validation passed without a live PostgreSQL connection; no production deployment was requested.
- Phase 3 onward remains planned: job/candidate editing, complete filters/pagination/bulk actions, candidate profiles, pipeline/resumes, interviews/feedback/notes/email, careers/reports, editable settings and notification actions.
- Existing overview and module screens are read-only foundations; do not describe later-phase workflows as implemented.

## Next actions

1. Wait for the user's `continue` before Phase 3.
2. Begin Phase 3 with job/candidate editing and browser acceptance cases written before implementation. Reuse current permission checks/schema invariants and keep I-002 visible.
3. Maintain GitHub's private visibility, excluded local data and all four context files as implementation continues.

## Latest checkpoint

- 2026-10-09: Phase 2 complete and renamed to AptTraC. Official GitHub CLI installed/authenticated; verified source published to the private repository. Build, lint, TypeScript, formatting, nine E2E flows and production smoke pass after renaming. Development-tool advisories remain open (I-002); Phase 3 awaits continuation.
