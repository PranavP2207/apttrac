# Phase 3 verification

Plan written before implementation on 2026-10-13. Verify with browser E2E using the isolated test database; do not add post-implementation unit tests.

## Acceptance flows and failure cases

- Recruiter creates a validated job with salary, editable match terms and manager assignment. Creation copies stages; audit and lifecycle timestamps agree with status.
- Missing fields, reversed/negative salary, unsafe URLs, invalid ratings, unknown tags/managers, forged timestamps and malformed JSON are rejected without writes.
- Job edits persist, update matching requirements version only when requirements/terms change, and reject stale saves. Closed/archived jobs are excluded from new candidate application options.
- Duplicating a job creates an independent Draft, stages/members and zero applications; close/archive require UI confirmation. Archive preserves history; archived jobs can be viewed and restored.
- Candidate emails are normalized/unique. Manual creation starts an optional job application in Applied with initial history and audit in the same transaction. Duplicate candidate/applications and invalid/non-open jobs reject atomically.
- Candidate edit preserves applications/notes/resumes, changes tags/rating, logs visible changes and rejects stale edits. Archive is reversible and requires confirmation.
- Candidate profile combines activity, stage history, interviews, notes, emails and feedback available to the current user's scope. Managers cannot see another job's applications, notes, emails or scorecards on a shared candidate.
- Guest/manager direct mutation requests are rejected; manager detail/filter/export reads stay scoped. Mutation endpoints reject cross-site origins.
- Filters for job/stage/source/tag/rating/date, sorting and pagination retain URL state; job and stage filters must match the same application. Selection is bounded and reset on list navigation; bulk tagging is atomic and audited.
- CSV exports reflect filters/selection/permissions, use escaped cells and neutralize spreadsheet formula prefixes. Unknown/inaccessible selected IDs fail instead of leaking data.
- Accessible forms, loading/error/empty states, responsive lists/profile, readable light/dark styling and working navigation. Add candidate is reachable from its list or a job in three clicks.

## Evidence

- TypeScript and ESLint pass with no errors or warnings; production build passes.
- Browser suite: all 17 flows passed on 2026-10-13 in 128.5 seconds, with zero failures, skips or flaky tests. The final suite includes the stricter mobile console check after duplicate React keys were corrected.
- Production smoke passes for login/guards, job form validation, profile/timeline, light/dark/mobile layouts and logout, with no browser console or runtime errors. Missing icon was identified and fixed first.
- Production dependency audit on 2026-10-13: zero findings. Full development audit remains tracked in I-002.
- Initial failures and fixes are documented in I-005. Tests were strengthened using test-oracle-review: independently created fixtures, positive and negative visibility sentinels, a known 5.0 aggregate score, same-application filter evidence, compound filter/export assertions, malformed input and guest writes.
- Artifacts: `test-results/results.json`, `playwright-report/index.html`, Phase 3 jobs/profile/mobile screenshots, and production form/profile/light/dark/mobile screenshots. These are generated locally and ignored by Git.
- Final production smoke was run after the final build, including the React-key correction and removal of duplicate stage-move timeline entries. Desktop job form, candidate profile and dark/mobile screenshots were visually inspected; labels, spacing and responsive layout are readable. The mobile workflow has no horizontal overflow or console/runtime errors.
- No schema migration was needed in Phase 3. Existing SQLite/PostgreSQL schema validation remains historical Phase 2 evidence; a live PostgreSQL migration and deployment were not performed.
