# Contributing to AptTraC

Follow [Getting started](docs/getting-started.md) for installation. Read the four [project context files](docs/README.md#project-context) before changing the app; they preserve requirements and distinguish implemented workflows from planned phases.

## Code organization

Keep routes thin and feature code together:

```text
app/                     Compose pages and expose API handlers
features/<feature>/
  components/            Feature-specific forms and presentation
  queries.ts             Authorized, scoped server reads
  service.ts             Business rules and transactions
  validation.ts          Shared Zod input schemas
  types.ts               Browser-safe view models, when needed
components/ui/           Reusable UI primitives
components/shared/       Reusable product presentation
lib/                     Infrastructure and shared utilities
tests/e2e/               Browser acceptance tests
```

Use only files a feature needs. Prefer small components and direct Prisma queries over generic abstractions. Private data modules import server-only; browser responses must exclude password hashes and unrelated private fields.

New business rules belong in feature services. Validate both browser forms and server input, check the current database user, scope related records and write audit events in the same transaction. Phase 3 JSON writes require the configured app origin and reject stale updatedAt revisions with HTTP 409.

Preserve archives and immutable application history. Explain non-obvious logic with short comments. Keep the indigo/neutral theme, accessible labels, visible keyboard focus, responsive layouts and helpful loading/error/empty states.

## Permissions

| Role           | Hiring data                       | Job/candidate editing | Company/team area |
| -------------- | --------------------------------- | --------------------- | ----------------- |
| Admin          | All                               | Yes                   | Yes               |
| Recruiter      | All                               | Yes                   | No                |
| Hiring Manager | Assigned jobs and related records | No                    | No                |

Scope each application, interview, note, scorecard, email and activity record independently on shared candidate profiles. Middleware provides an early redirect; services enforce the actual permission boundary.

Guests receive private-page redirects and API 401 responses. Insufficient API roles receive 403. Protected reads/writes recheck active status, current role and sessionVersion. Future user-management actions must increment sessionVersion when revoking access.

## Verification

Run from the repository root:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run test:e2e
```

Use `npm run format` to format source intentionally. Tests use installed Chrome on the verified Windows machine; otherwise install Chromium:

```bash
npx playwright install chromium
```

Playwright starts its own server at `127.0.0.1:3100`, uses `prisma/e2e.db` and builds into `.next-e2e`. The global setup resets only that isolated database. Keep the normal development database and private uploads out of test fixtures.

Open the browser report with `npm run test:report`. Generated outputs include:

- `playwright-report/index.html`: browser report.
- `test-results/results.json`: machine-readable results.
- `test-results/`: desktop/mobile screenshots and failure traces.

Reports and screenshots are local artifacts, excluded from Git. Recorded outcomes live under [docs/verification](docs/README.md#verification-evidence).

For production smoke, first build and start the local preview as described in [Getting started](docs/getting-started.md#run-a-local-production-preview). In another terminal:

```bash
npm run test:production
```

This uses the seeded admin configuration in .env, checks the running production build, logs out and saves `test-results/production-smoke.json` plus screenshots. It adds login/logout audit events without resetting hiring records.

Prefer meaningful browser acceptance coverage. Enumerate failure cases before complex implementation; do not append implementation-mirroring unit tests after writing code, per the project instructions.

## Changes and delivery

Keep each change focused and preserve the phase gate. Phases 1–3 are complete; Phases 4–7 require the next user continuation.

For schema changes, commit the Prisma schema and migration together, then verify the seed and schema validation. Keep pinned dependencies and the lockfile in sync. Avoid unrelated package upgrades during structural changes.

Before committing, inspect `git status` and `git diff --staged`. Commit source, migrations, documentation and synthetic fixtures. Exclude .env, credentials, local databases, private uploads, build outputs, browser reports, logs and machine-specific configuration.

Update current-state.md, relevant decisions and known issues with actual evidence and the next action. Pull requests should explain the resulting behavior and checks that ran. Known dependency audit findings are tracked in [known issues](known-issues.md); local credentials and GitHub authentication remain outside the repository.
