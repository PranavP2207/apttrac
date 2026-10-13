# Decisions: AptTraC

Last updated: 2026-10-13

## Active decisions

### D-001: Requested stack and phased delivery

- Date: 2026-10-09
- Status: superseded (framework major only; see D-006). Other stack choices and phase gating remain accepted.
- Source: Explicit user direction.
- Decision: Next.js 14 App Router, TypeScript, Tailwind/shadcn/ui, Prisma/SQLite, NextAuth credentials, Zod/React Hook Form, dnd-kit, Recharts. Deliver one of seven phases per user continuation.
- Reason: Match the user's requested local setup and copy-paste-ready project.
- Alternatives: A newer Next.js major or a hosted Site starter would change the requested stack and delivery.
- Consequences: Verify and pin compatible packages in Phase 2. Next.js currently lists 14.x as unsupported; record this actual constraint (I-001), without silently upgrading.

### D-002: One company, separate candidates and applications

- Date: 2026-10-09
- Status: accepted
- Source: Agent design choice within delegated architecture scope.
- Decision: One company per installation. A normalized email identifies a candidate; each candidate can have one application per job. Store pipeline placement, source attribution, match result, and application resume per application.
- Reason: Prevent duplicated profiles and allow the same person to apply for different roles.
- Alternatives: A candidate tied to exactly one job would lose cross-job history; multi-tenant SaaS adds requirements absent from the brief.
- Consequences: Company profile uses a singleton settings row. All mutation services must normalize email and handle duplicate application conflicts safely.

### D-003: Server-side feature services and authorization

- Date: 2026-10-09
- Status: accepted
- Source: Agent design choice within delegated architecture scope; JWT sessions are required by the NextAuth v4 Credentials provider.
- Decision: Thin Server Components/Server Actions/Route Handlers call feature services, using shared Zod validation and centralized current-user authorization. Prisma stores users and password hashes directly; NextAuth v4 uses JWT sessions.
- Reason: Keep business rules readable and enforce permission checks at data boundaries.
- Alternatives: UI-only authorization does not protect data. OAuth/session adapter tables are unnecessary for credentials-only JWT authentication.
- Consequences: Recheck active status, session version, and current role from the database. Scope Hiring Managers to job membership and assigned interviews. Route Handlers use Node.js for Prisma, files, and parsers.

### D-004: Portable schema, explainable scores, and immutable history

- Date: 2026-10-09
- Status: accepted
- Source: Agent design choice within delegated architecture scope.
- Decision: Prisma 6.x >= 6.2 with SQLite-compatible enums/JSON, scalar IDs, integer money amounts, and no provider-specific native types or scalar arrays. Use per-job stages with a composite application-to-stage relation, stage transition snapshots, structured match evidence, and archived/disabled records.
- Reason: Enforce same-job pipeline placement, preserve reporting evidence, and allow a PostgreSQL migration with the same logical models.
- Alternatives: Current stage alone cannot measure past conversion/time-in-stage. Text embeddings or external AI scoring would add services and reduce explainability.
- Consequences: Services enforce rating ranges, stage semantics, JSON shapes, file ownership, interview constraints, and score freshness. Switching providers needs new PostgreSQL migrations and data transfer, not reuse of SQLite SQL migrations.

### D-005: Reversible hiring actions and local integration adapters

- Date: 2026-10-09
- Status: accepted
- Source: Agent design choice within delegated architecture scope.
- Decision: Archive jobs/candidates, disable users, and retire stages instead of deleting hiring history. Keep uploaded files private behind authorized download routes. Use filesystem storage and simulated email adapters initially.
- Reason: Meet local setup and audit requirements while leaving clear storage/email seams.
- Alternatives: Public upload folders expose private resumes; immediate hard deletion loses audit evidence; real SMTP is outside the requested requirement.
- Consequences: Store generated file keys, metadata, and parse results. Application resumes preserve job-specific documents. Email logs retain rendered content and explicit simulated status. Interview reminders use scheduled database notifications displayed when due.

## Decision history

### D-009: Phase 3 write and list contracts

- Date: 2026-10-13
- Status: accepted
- Source: Implementation choices within the authorized jobs/candidates phase, following D-003 through D-005.
- Decision: Shared Zod schemas and thin JSON Route Handlers call transactional feature services. Cookie-authenticated writes require the exact configured NEXTAUTH_URL origin. Job/profile edits and lifecycle actions compare the supplied updatedAt revision; bulk tagging advances that revision too.
- Reason: Keep business rules readable, reject cross-site writes, and prevent silent overwrites. Manager reads scope each related application, note, email and scorecard independently, including CSV exports.
- Alternatives: Browser-only validation or unversioned writes would not protect data integrity. Global candidate visibility alone would expose unrelated application history.
- Consequences: Use the configured app URL in the browser. Refresh after a stale-edit conflict. Lists show ten records per page with URL filters; selection stays on the current page, up to 100 IDs per API action. Dates filter candidate creation using inclusive UTC days. CSV exports neutralize formula prefixes and fail above 10,000 rows so recruiters can narrow their filters. Phase 3 bulk tagging/export are implemented; stage moves/rejection remain Phase 4.

### D-008: Official GitHub CLI for delivery

- Date: 2026-10-09
- Status: accepted
- Source: Explicit user request to install GitHub CLI for repository creation and Git pushes.
- Decision: Install official GitHub CLI 2.102.0 via Windows WinGet/MSI and use its authenticated HTTPS workflow under PranavP2207.
- Reason: The connector could not create repositories, and browser creation required a separate sign-in. The user preferred CLI-based delivery.
- Alternatives: Browser creation plus connector uploads; replaced by the requested CLI workflow.
- Consequences: Private repository is PranavP2207/apttrac; local main tracks origin/main. Exclude credentials, local databases, uploads and generated artifacts from every push. CLI authentication is machine-local and is never stored in the repository.

### D-007: AptTraC branding and private GitHub delivery

- Date: 2026-10-09
- Status: accepted
- Source: Explicit user replies selecting AptTraC and a private GitHub repository.
- Decision: Rename the original HireFlow app to AptTraC and publish its current Phase 2 source to a private repository under the connected GitHub account.
- Reason: The user requested a distinctive project name and source backup. Talentra was initially selected, then replaced by AptTraC after finding existing recruitment brands using Talentra.
- Alternatives: Keep HireFlow or Talentra; user selected AptTraC instead. Preliminary search found no clear hiring-product match for AptTraC; global name exclusivity has not been established.
- Consequences: Update UI/metadata/package/docs/demo defaults and tests. Preserve existing local database accounts and environment values. Exclude credentials, databases, uploads and generated artifacts from Git. Keep phased delivery intact.

D-001's Next.js 14 choice was superseded by D-006 with explicit user approval; the original decision is retained above.

### D-006: Patched Next.js 15

- Date: 2026-10-09
- Status: accepted
- Source: Explicit user reply: "Use a patched Next.js 15 release (Recommended)".
- Decision: Pin Next.js and eslint-config-next 15.5.27, verified from the npm registry. Retain App Router, TypeScript, React 18 and NextAuth v4, whose declared peers include Next.js 15 and React 18.
- Reason: The latest 14.2.35 audit reports critical Windows/server vulnerabilities. The user approved changing the framework major.
- Alternatives: Keeping 14 for local-only work was offered; the user selected patched 15.
- Consequences: Use Next.js 15 config and asynchronous request APIs. Re-audit after installation and verify authentication/build in the actual environment. Update the original plan to distinguish this approved change from the initial request.
- Supersedes: D-001's framework-major constraint.
