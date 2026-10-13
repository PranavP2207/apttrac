# Current state: AptTraC

Last updated: 2026-10-13

## Project and scope

- Goal: Complete a polished Applicant Tracking System using the user's stack and seven delivery phases.
- Current stage: Phase 3 complete, verified locally and published to the private repository. Stop before Phase 4 until the user says `continue`.
- App root: `C:/Users/prana/Documents/ChatGPT/ATS`.
- Requirements and phase gates: [instructions.md](instructions.md); architecture/schema: [docs/architecture.md](docs/architecture.md).

## Implemented and verified

- Phase 1: complete architecture, feature folders and portable Prisma schema (20 models, 13 enums).
- Phase 2: pinned Next.js 15.5.27, React 18, TypeScript, Tailwind/shadcn-style Radix UI, Prisma 6.19.3/SQLite, NextAuth credentials login/logout, three roles, active-user/session-version checks, scoped queries and synthetic seed.
- Seed: 6 users, 5 jobs, 30 profiles, 36 applications, 12 interviews, 4 scorecards, 8 notes, 4 templates. Idempotent reruns preserve existing data/passwords.
- Responsive shell, collapsible sidebar/mobile navigation, keyboard global search, themes, profile menu, empty/loading/error states and confirmation/toast primitives.
- Phase 3 jobs: validated create/edit, assignments, matching keywords, copied company stages, independent Draft duplication, close, reversible archive/restore, status/type/text filters, sort and pagination.
- Phase 3 candidates: normalized unique email, contact/source/summary, tags/ratings, create/edit, reversible archive/restore, optional initial application and additional applications to open jobs, each with Applied history and audit in one transaction.
- Profiles combine scoped applications, activity, stage history, existing interviews/scorecards, notes and email logs. Managers cannot edit global records or view another job's private content on a shared candidate.
- Candidate filters: name/email, job, stage, source, tag, exact rating, inclusive UTC creation dates and archive status. Job/stage match the same application. Ten records per page, stable sorting, bounded selection, atomic bulk tags and filtered/selected CSV with formula-prefix protection.
- JSON writes use shared Zod validation, role/origin checks, stale updatedAt rejection and transactional audit. Bulk tags advance the profile revision to protect older edit forms.
- Read-only foundations remain for overview, interviews, activity and Admin company/team settings. Later-phase mutation workflows are not implemented.

## Validation evidence

- 2026-10-13: TypeScript, ESLint (no warnings), production build and formatting pass. Production dependency audit reports zero findings.
- Final full Playwright suite: 17 passed in 128.5 seconds; zero failures, skips or flaky tests. Includes auth, roles, job/candidate workflows, dialogs, stale writes, validation failures, manager privacy, filters/export, bulk tags and mobile overflow/console checks.
- Final production smoke passes after the final build: guards/login/logout, job form validation, candidate profile/timeline, light/dark/mobile layouts and no rendering/runtime console errors. No hiring records were changed by production smoke; login/logout audit is expected.
- Desktop job form, profiles and dark/mobile screenshots were visually inspected. Evidence and initial fixes: [docs/phase-3-verification.md](docs/phase-3-verification.md), I-005.
- Generated HTML/JSON reports and screenshots are in `playwright-report/` and `test-results/`, ignored by Git.
- SQLite and provider-switched PostgreSQL schema validation passed in Phase 2. No schema changes in Phase 3; no live PostgreSQL migration or deployment performed.
- Full development-tool audit findings remain open in I-002; production audit is clear.

## Environment and delivery

- Full source: `app/`, `components/`, `features/`, `lib/`, `prisma/`, `types/`; tests/docs in `e2e/`, `scripts/`, `docs/`.
- Fresh setup: `npm.cmd install`, `npm.cmd run setup`, `npm.cmd run dev`; see README. Existing .env and local accounts were preserved through the AptTraC rename.
- Local development data: ignored `prisma/dev.db`. E2E resets only `prisma/e2e.db`, runs at port 3100 and builds to `.next-e2e`.
- Final production preview runs at `http://localhost:3000`, bound to 127.0.0.1, in a tool-managed process. Restart with `npm.cmd run start -- --hostname 127.0.0.1` after a build if needed. Use the configured NEXTAUTH_URL origin for writes.
- Official GitHub CLI 2.102.0 is installed/authenticated as PranavP2207. Private repo: https://github.com/PranavP2207/apttrac; local main tracks origin/main over HTTPS. Phase 3 source commit `4a03d9afc71cb6ef2a8f0127977498a58fe948e4` was pushed, and its full SHA matched GitHub main. The staged 52-file publication inspection excluded the local authentication secret, credentials, generated outputs and hiring data.
- Keep .env, credentials, databases, uploads, build outputs and browser artifacts out of Git. Only synthetic example/test credentials belong in source.

## Remaining work

- Phase 4: per-job Kanban, accessible drag/drop and bulk stage/reject actions, pipeline customization, private PDF/DOCX uploads, text parsing and explainable match scores.
- Phase 5: interview scheduling/calendar, scorecard submission, internal notes/mentions/attachments, editable email templates and simulated sending.
- Phase 6: public careers/application workflow, complete dashboard and reports/CSV analytics.
- Phase 7: editable settings/users/tags/default stages, notification actions, polish and final testing; revisit I-002.

## Next actions

1. Wait for the user's next `continue`; no implementation is pending in Phase 3.
2. Start Phase 4 with acceptance cases and context reconciliation. Reuse existing application/history services and preserve scoped profiles, revision checks and private data boundaries.

## Latest checkpoint

- 2026-10-13: Phase 3 complete and published privately; final E2E/build/production checks pass. Source inspection passed and GitHub's source commit was verified. Phase 4 has not started.
