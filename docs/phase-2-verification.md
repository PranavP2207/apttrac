# Phase 2 verification plan

Written before implementation on 2026-10-09. Prefer browser E2E checks per the ancestor AGENTS.md; no post-implementation unit tests.

## Failure cases and acceptance flows

- Unauthenticated page/API requests: redirect pages to login; return 401 from private APIs without exposing hiring data.
- Malformed email, missing credentials, excessive password length: inline accessible errors or a generic server rejection.
- Unknown email, wrong password, inactive user: same generic sign-in error; no successful session.
- Valid seeded credentials: authenticate, show current role/name and a scoped workspace; logout removes access.
- Role changes and session revocation: resolve the current database role and active/sessionVersion values; existing cookies must not bypass new permissions.
- Recruiter/Hiring Manager admin access: hide admin navigation, reject direct admin page/API access; Admin can read safe user data.
- Hiring Manager scope: workspace/search/results only include assigned jobs and their applications. Recruiter and Admin see all hiring data.
- Seed integrity: five jobs, 30 candidate profiles, 36 applications, 12 interviews, valid history versions, four scorecards, eight notes, four templates, and consistent related records. Rerunning seed must not duplicate or reset existing user data.
- Schema portability: validate the Prisma schema against SQLite and a temporary PostgreSQL-provider copy without connecting to a PostgreSQL database.
- Shell accessibility: keyboard-operable sidebar, mobile drawer, profile menu, search, theme controls, skip link and visible form errors.
- Theme and viewport: persistent light/dark preference; desktop collapse; mobile navigation with no document overflow.
- Framework/configuration: TypeScript, lint, production build and production startup succeed.

## Evidence

Use a separate `prisma/e2e.db` database with synthetic test credentials. Playwright saves an HTML report, test result JSON, traces/screenshots for failures, and desktop/mobile screenshots. Never mutate the development database in tests. Exact commands/results are recorded after they run.

## Completed checks — 2026-10-09

| Check                                       | Result                                                                      |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| `npm.cmd run db:validate`                   | SQLite schema valid                                                         |
| `npm.cmd run db:validate:postgres`          | Provider-switched PostgreSQL schema valid; no database connection attempted |
| Initial migration and `npm.cmd run db:seed` | Database created and populated                                              |
| `npm.cmd run db:seed` again                 | Existing seed detected; records/passwords preserved                         |
| `npm.cmd run typecheck`                     | Pass                                                                        |
| `npm.cmd run lint`                          | Pass with no warnings/errors                                                |
| `npm.cmd run build`                         | Optimized production build passes on Next.js 15.5.27                        |
| `npm.cmd run test:e2e`                      | 9 passed, 0 skipped/failed/flaky; 117.1 seconds                             |
| `npm.cmd run start -- --hostname 127.0.0.1` | Server ready at local port 3000                                             |
| `npm.cmd run test:production`               | Guest guards, admin login, summary, themes, mobile navigation, logout pass  |
| `npm.cmd audit --omit=dev --json`           | 0 findings                                                                  |
| `npm.cmd audit --json`                      | 9 development findings: 7 high, 2 moderate; I-002 remains open              |

The nine browser flows cover seed/history relations, guest boundaries, generic failed login, admin login/theme persistence/sidebar/logout, recruiter administrator denial, Hiring Manager job scope, keyboard global search, revoked/disabled accounts, and mobile navigation without document overflow. The failure-case list above also guides future phases; it does not mean every listed edge case already has its own automated test.

Tests run with an isolated database, port and browser profile. Windows sandbox restrictions required outside-sandbox execution for Prisma generation/build and browser network access. This is a local environment limitation. No real emails or external messages are sent.

## Repeatable artifacts

- [HTML browser report](../playwright-report/index.html)
- [Nine-test JSON result](../test-results/results.json)
- [Production smoke result](../test-results/production-smoke.json)
- [Production login](../test-results/production-login.png)
- [Production desktop](../test-results/production-desktop.png)
- [Production dark theme](../test-results/production-dark.png)
- [Production mobile](../test-results/production-mobile.png)

Production viewport screenshots are the preferred visual evidence. Full-page dev screenshots can place sticky navigation at the scroll position used by the last interaction. Visually inspected the production login/desktop/dark screens and mobile job-list screen: neutral surfaces, indigo accent, readable spacing, accessible controls, and no document overflow.

Two observed setup/UI defects are resolved: missing-file SQLite startup (I-003) and sidebar overflow/development-indicator overlap (I-004). Failed login test ambiguity was corrected by giving its alert an accessible name; navigation links also have stable names independent of count badges.

Live PostgreSQL execution, deployment, and the remaining ATS workflows have not been tested or implemented in this phase. See the phased scope in README and current-state.md.

## AptTraC rename verification — 2026-10-09

The user selected AptTraC and private GitHub delivery after the Phase 2 handoff. UI, metadata, package name, documentation, fresh-seed defaults, test accounts and browser storage keys were renamed. Existing local accounts and .env values were preserved.

Reran lint, TypeScript, formatting, production build, all nine browser flows (51.1 seconds, no failures/skips/flaky tests), and production smoke successfully. Production preview runs the renamed build. Git excludes local credentials, databases, uploads and generated reports. Repository publication requires the newly installed GitHub CLI to finish authentication.
