# Known issues: AptTraC

Last updated: 2026-10-09

## Active issues

### I-002: Development dependency audit findings

- Status: open
- Impact: High advisory severity in development tools; production dependency audit is clear.
- First observed: 2026-10-09.
- Evidence: `npm.cmd audit --json` reports 9 findings (7 high, 2 moderate). Underlying advisories: braces stack-exhaustion ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)) and selector parsing CPU exhaustion ([GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)), propagated through Tailwind 3 and Next's ESLint plugin.
- Expected: No known dependency advisories.
- Actual: `npm.cmd audit --omit=dev --json` has zero findings; full audit retains development chains.
- Cause: Confirmed installed versions. npm's suggested fixes include major Tailwind changes and a mismatched ESLint downgrade.
- Workaround: Build trusted source locally; preserve verified framework/runtime versions. Avoid blind `audit fix --force`.
- Next action: Recheck patched packages during Phase 7 and verify any build-tool migration with UI/build checks.

## Resolved issues

### I-001: Next.js 14 support and critical advisories

- Status: resolved on 2026-10-09
- Impact: Critical dependency advisories in originally requested Next.js 14.2.35, including a Windows-server advisory; 14 is outside LTS support.
- Evidence: Next support policy and actual installed npm audit during Phase 2.
- Resolution: User explicitly approved patched Next.js 15 (D-006). Installed 15.5.27 and matching ESLint configuration; production audit returned zero findings and a production build passed.
- Next action: Keep dependencies pinned and re-audit at later checkpoints.

### I-003: SQLite first-run migration startup on Windows

- Status: resolved on 2026-10-09
- Impact: Medium; an absent SQLite file caused Prisma's engine to return a blank `Schema engine error` on initial migration.
- Evidence: First isolated E2E bootstrap failed with the file absent; deploy/seed succeeded after precreating the empty file.
- Resolution: Environment setup and E2E bootstrap precreate only a missing target SQLite file. Existing databases are preserved.
- Cause: Windows/engine startup behavior; exact native-engine cause remains unconfirmed.
- Next action: Preserve bootstrap behavior and verify fresh setup if the Prisma engine changes.

### I-004: Sidebar controls on short screens

- Status: resolved on 2026-10-09
- Impact: Medium; fixed-height desktop sidebar placed the collapse button outside a 720px viewport. Next's development indicator also covered the collapsed control.
- Evidence: Browser traces showed overflow and pointer interception.
- Resolution: Navigation now scrolls inside the sidebar, footer controls remain fixed within it, and the development indicator is disabled. Desktop collapse/expand/theme/logout E2E passed after these changes.
- Next action: Preserve the scrollable layout as navigation grows in later phases.
