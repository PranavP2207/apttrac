# Repository cleanup verification

Date: 2026-10-13.

Scope: organize the repository and improve its GitHub presentation. Keep the application behavior, pinned dependencies, database schema and Phase 4 gate intact.

## Published-content review

Inspected all four commits reachable from the local main/origin history before cleanup: 146 unique file blobs, with 128 tracked files at the starting checkpoint.

- No tracked local .env files, databases, candidate uploads, build outputs, dependency folders or browser artifacts found.
- No copy of the actual local NEXTAUTH_SECRET found in that history.
- No matches for common GitHub token, AWS access-key or private-key header patterns found.
- Eleven representative private/generated paths matched the ignore rules.
- Synthetic example/test credentials are intentional; machine-local authentication remains ignored.

The inspection covered tracked file paths, the known local secret and the credential patterns above. No history rewrite was needed.

## Organization changes

- Browser acceptance tests moved from e2e/ to tests/e2e/.
- Production smoke and schema portability helpers moved into scripts/verification/.
- Phase verification notes moved into docs/verification/.
- README shortened; setup and contributor guidance have dedicated documents, with a documentation index and local SVG brand banner.
- Unused ListSearch and ActionResult source removed after confirming they had no imports or callers.
- Framework configuration, runtime feature folders, migrations, lockfile and canonical context files retained.
- Package commands, Playwright configuration and relative documentation references updated together.
- Ignore rules grouped and expanded for local logs, editor settings and database files.
- Existing GitHub description retained; seven descriptive topics added and private visibility confirmed.

## Regression checks

| Check                               | Result                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Local Markdown links and anchors    | 44 resolve across 12 Markdown files                                                                                 |
| Package Node script paths           | All three resolve                                                                                                   |
| Moved test/helper source comparison | All six retain their original contents                                                                              |
| Runtime source review               | Only the two unused source files removed; no behavior changes                                                       |
| `npm.cmd run typecheck`             | Pass                                                                                                                |
| `npm.cmd run lint`                  | Pass, no warnings/errors                                                                                            |
| `npm.cmd run format:check`          | Pass                                                                                                                |
| `npm.cmd run build`                 | Optimized Next.js production build passes                                                                           |
| `npm.cmd run db:validate:postgres`  | Provider-switched schema validates; no live database connection                                                     |
| `npm.cmd run test:e2e`              | 17 passed in 106.6 seconds; zero failed/skipped/flaky                                                               |
| `npm.cmd run test:production`       | Guards, login/logout, job form, candidate profile, themes and mobile navigation pass with no runtime/console errors |

Playwright artifacts are in `playwright-report/` and `test-results/`. Audit and link-check summaries are in the ignored `.tmp/` folder. Restore the ordinary .next route-type reference after the isolated test server regenerates next-env.d.ts; keep that generated test-only change out of the commit.

The existing development dependency findings in I-002 remain open. Dependencies and the schema were unchanged in this maintenance task.
