# AptTraC: architecture and data model

Status: Phase 1 design, amended for the user-approved Next.js 15 update and repository organization. Phases 2–3 are implemented and verified locally; Phases 4–7 remain planned. Schema validates for SQLite and PostgreSQL.
Last updated: 2026-10-13.

The product is a working hiring workspace for recruiters, with a separate public careers experience. This document records the implementation plan, rather than claiming planned features already work.

## 1. Architecture

Use the user-approved Next.js 15 App Router with React 18 and strict TypeScript. The application runs on Node.js and starts with a local SQLite database. It serves one company per installation. The initial Next.js 14 constraint was superseded after actual critical audit findings; see D-006.

```text
Recruiter workspace / Public careers page
                  |
    Server Components: initial reads
    Client Components: forms, tables, drag/drop, charts, calendar
                  |
    JSON Route Handlers: authenticated mutations, auth, search, CSV
    Planned Route Handlers: multipart applications/uploads, downloads
                  |
    Current-user authorization + Zod validation
                  |
    Feature services: jobs, candidates, pipeline, interviews, etc.
                  |
    Prisma transactions + SQLite
         |                    |
    Private file storage   Email transport adapter
    (local filesystem)     (simulation, later SMTP)
```

Routes compose small components and call feature queries/services. Feature services own the business rules and transaction boundaries; shared `lib/` code owns infrastructure. Avoid generic repository wrappers over Prisma: direct, well-scoped queries are easier for a beginner to follow. Phase 3 uses thin JSON Route Handlers for validated writes (D-009).

Shared Zod schemas validate both browser forms and server input. React Hook Form supplies inline errors. Prisma-generated types represent stored entities; explicit view models exclude password hashes, resume text, and unrelated private fields from browser responses.

Use Server Components for initial data, and Client Components only where interactivity requires them. Mutations return typed success or field/form errors; after a successful write, revalidate affected routes. Search, filtering, sorting, and pagination live in URL query parameters so pages are linkable and retain state.

## 2. Dependency choices

| Area              | Planned dependency / approach                                                            |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Framework         | Next.js 15.5.27, React 18.3.1, TypeScript; pinned in Phase 2 with explicit user approval |
| Interface         | Tailwind CSS 3, shadcn/ui source components, Radix primitives, lucide-react              |
| Forms             | React Hook Form, Zod, compatible `@hookform/resolvers`                                   |
| Database          | Matching `prisma` and `@prisma/client` 6.x, at least 6.2                                 |
| Authentication    | NextAuth v4 Credentials provider, JWT sessions, bcryptjs password hashes                 |
| Pipeline          | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`                               |
| Analytics         | Recharts                                                                                 |
| Themes / feedback | next-themes and Sonner                                                                   |
| Dates             | date-fns/date-fns-tz with explicit IANA timezone conversion                              |
| Resume extraction | Server-side PDF and DOCX parsers behind one interface; versions checked in Phase 4       |
| Verification      | TypeScript, ESLint, production build, Playwright E2E and saved artifacts                 |

NextAuth v4 credentials sessions require JWTs. The application stores users itself; no Account, Session, or VerificationToken adapter models are necessary for this credentials-only design. See [NextAuth credentials documentation](https://next-auth.js.org/providers/credentials).

SQLite enum and JSON support arrived in Prisma 6.2. The schema therefore explicitly targets Prisma 6.x >= 6.2, retaining the classic `prisma-client-js` generator and datasource URL syntax. See the [official Prisma 6.2 release](https://github.com/prisma/orm/releases/tag/6.2.0).

The original Next.js 14 major is outside LTS support and the latest 14.2.35 package audit revealed critical advisories. The user explicitly selected a patched Next.js 15 release; 15.5.27 is pinned and the production dependency audit is clear. See [Next.js support policy](https://nextjs.org/support-policy), D-006, and I-001 in [known-issues.md](../known-issues.md).

## 3. Planned folder and route tree

The tree below describes the intended completed project. See README/current-state for which routes and workflows exist in the current phase.

```text
ATS/
  app/
    layout.tsx
    page.tsx                         # Redirect to dashboard or login
    globals.css
    error.tsx
    not-found.tsx
    (auth)/
      login/page.tsx
    (workspace)/
      layout.tsx                     # Protected application shell
      loading.tsx
      dashboard/page.tsx
      jobs/
        page.tsx
        new/page.tsx
        [jobId]/
          page.tsx
          edit/page.tsx
          pipeline/page.tsx
      candidates/
        page.tsx
        new/page.tsx
        [candidateId]/page.tsx
      interviews/page.tsx
      reports/page.tsx
      activity/page.tsx
      settings/
        page.tsx
        company/page.tsx
        pipeline/page.tsx
        tags/page.tsx
        users/page.tsx
        email-templates/page.tsx
    careers/
      layout.tsx                     # Public company branding
      page.tsx
      [slug]/
        page.tsx
        apply/page.tsx
    api/
      auth/[...nextauth]/route.ts
      public/applications/route.ts
      uploads/route.ts
      files/[fileId]/route.ts
      search/route.ts
      exports/[report]/route.ts
  components/
    ui/                              # shadcn/ui primitives
    layout/
      sidebar.tsx
      topbar.tsx
      profile-menu.tsx
      mobile-navigation.tsx
    shared/
      data-table.tsx
      pagination.tsx
      empty-state.tsx
      confirm-dialog.tsx
      page-header.tsx
      rating-input.tsx
    providers.tsx                    # Session, theme, toasts
  features/
    auth/
    dashboard/
    jobs/
    candidates/
    pipeline/
    resumes/
    interviews/
    scorecards/
    notes/
    email/
    careers/
    reports/
    settings/
    activity/
    notifications/
  lib/
    db.ts                            # Development-safe Prisma singleton
    auth/
      options.ts                     # NextAuth configuration
      session.ts                     # Read current active DB user
      permissions.ts                 # Roles and job scoping
    storage/
      types.ts
      local.ts                       # Private upload/download adapter
    email/
      types.ts
      simulated.ts                   # Email transport interface/implementation
    csv.ts
    dates.ts
    utils.ts
  prisma/
    schema.prisma
    seed.ts
    migrations/
  types/
    next-auth.d.ts
  docs/
    README.md
    getting-started.md
    architecture.md
    assets/
      banner.svg
    verification/
      phase-2.md
      phase-3.md
      repository-cleanup.md
  scripts/
    setup.mjs
    verification/
      smoke-production.mjs
      validate-portability.mjs
  public/
    brand/                           # Public brand assets; never resumes
  storage/
    uploads/                         # Generated locally; ignored by Git
  tests/
    e2e/
      environment.ts
      global-setup.ts
      auth.spec.ts
      jobs-candidates.spec.ts
      fixtures/                      # Planned browser fixtures
      careers.spec.ts                # Planned Phase 6 coverage
  playwright.config.ts
  middleware.ts                      # Early session redirect; services enforce access
  .env.example
  .gitignore
  components.json
  next.config.mjs
  tailwind.config.ts
  postcss.config.mjs
  tsconfig.json
  package.json
  package-lock.json
  README.md
  CONTRIBUTING.md
  current-state.md
  decisions.md
  instructions.md
  known-issues.md
```

A feature uses only the files it needs. For example:

```text
features/jobs/
  components/job-form.tsx
  components/job-table.tsx
  queries.ts          # Server-only, scoped read queries
  service.ts          # Mutation rules and transactions
  validation.ts       # Shared Zod schemas
  types.ts            # Browser-safe view models, where necessary
```

## 4. Permission defaults

These defaults are architecture choices within the requested three-role system.

| Capability                                             | Admin                                        | Recruiter                 | Hiring Manager                                  |
| ------------------------------------------------------ | -------------------------------------------- | ------------------------- | ----------------------------------------------- |
| Dashboard, jobs, candidates, reports                   | All hiring data                              | All hiring data           | Assigned jobs and their applications            |
| Create/edit/duplicate/close/archive jobs               | Yes                                          | Yes                       | View assigned jobs                              |
| Add/edit/archive candidates; bulk actions; move stages | Yes                                          | Yes                       | View assigned candidates/applications           |
| Schedule/reschedule/cancel interviews                  | All                                          | All                       | Assigned jobs; complete own assigned interviews |
| Submit scorecards                                      | Own assigned interviews                      | Own assigned interviews   | Own assigned interviews                         |
| Internal notes and mentions                            | All accessible candidates                    | All accessible candidates | Assigned application context                    |
| Templates and simulated emails                         | Manage/send                                  | Manage/send               | View assigned application email history         |
| Manage tags and per-job stages                         | Yes                                          | Yes                       | View assigned jobs                              |
| Company defaults and user management                   | Yes                                          | No                        | No                                              |
| Global audit log                                       | All                                          | Hiring actions            | Assigned hiring actions                         |
| Notifications                                          | Own only                                     | Own only                  | Own only                                        |
| Public careers application                             | Public submission to an open, unarchived job | Same public flow          | Same public flow                                |

Permission checks run in every service, query, Server Action, and Route Handler boundary that handles private data. Middleware and hidden buttons improve navigation but do not enforce data security by themselves.

Each request resolves the current database user, checks `isActive`, verifies the JWT's `sessionVersion`, and reads the current role. Disabling a user, changing a role, or resetting a password invalidates existing sessions by incrementing `sessionVersion`. Protect the last active Admin from demotion or disablement.

Hiring Managers receive job-scoped timelines, notes, scorecards, search results, exports, and attachments. A candidate who applied to another job does not expose that other application's private content. Mentions must target active users authorized to view that note. Interviewers must be active and permitted to access the application.

## 5. Database schema

The complete copy-paste-ready source is [prisma/schema.prisma](../prisma/schema.prisma). It contains all requested models and the supporting relational models.

| Model                   | Responsibility                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Company                 | Singleton company profile, careers branding, timezone/currency defaults                |
| User                    | Credentials, role, active status, session invalidation version                         |
| Job                     | Vacancy fields, public slug, lifecycle timestamps, matching keywords/version           |
| JobMember               | Hiring Manager assignment to a job                                                     |
| PipelineStageTemplate   | Company defaults copied into newly created jobs                                        |
| Stage                   | Customizable column for one job; stable stage kind and display order                   |
| Candidate               | Person, normalized unique email, contact/source/rating and primary resume              |
| Application             | One candidate/job pair, current stage, application resume/source and match evidence    |
| ApplicationStageHistory | Every transition with names/kinds, timestamp, previous entry time, actor/version       |
| Interview               | UTC time interval, display timezone, interviewer, mode and lifecycle                   |
| Scorecard               | Interviewer's three ratings and comments, one submission per interview/author          |
| Note                    | Internal candidate note, optionally scoped to one application                          |
| NoteMention             | Explicit mention recipients, independent of display names                              |
| Attachment              | Private file metadata, ownership, parse lifecycle and extracted text                   |
| Tag                     | Reusable candidate label/color                                                         |
| CandidateTag            | Explicit many-to-many candidate tagging                                                |
| EmailTemplate           | Reusable subject/body and template category                                            |
| EmailLog                | Rendered recipient/subject/body, simulation/provider status and timestamps             |
| Activity                | Append-only service audit event with actor, entity and candidate/job/application links |
| Notification            | Recipient-specific applicant, reminder, and mention messages with delivery/read times  |

The schema has **20 models**: the 13 models explicitly named in the brief and seven supporting models (Company, JobMember, PipelineStageTemplate, ApplicationStageHistory, NoteMention, Attachment, and CandidateTag). Supporting joins are intentionally explicit.

Primary relationships:

```text
User --< Job (creator)
User --< JobMember >-- Job
Company --< PipelineStageTemplate
Job --< Stage
Candidate --< Application >-- Job
Stage --< Application (same job enforced by composite reference)
Application --< ApplicationStageHistory
Application --< Interview --< Scorecard >-- User
Candidate --< Note --< NoteMention >-- User
Candidate --< Attachment
Note --< Attachment
Candidate --< CandidateTag >-- Tag
EmailTemplate --< EmailLog >-- Candidate / Application
User --< Activity / Notification
```

### Stored rules and service invariants

The database enforces unique user/candidate emails, one application per candidate/job, one scorecard per interview/author, unique tag and template names, unique mention/tag memberships, and unique history versions per application. Composite keys prevent a stage belonging to another job and a note referencing another candidate's application.

Services also enforce rules not expressed by this portable Prisma schema:

- Normalize emails before lookup/write. A repeated public application does not overwrite an existing candidate's personal information or upload arbitrary data to that candidate's other applications.
- Ratings are integers from 1 to 5; match percentages are integers from 0 to 100. Null means no available result, rather than zero quality or zero rating.
- Salaries are non-negative and minimum <= maximum; use ISO currency codes and whole currency units.
- `matchKeywords` is a validated list of unique, trimmed phrases; `matchDetails` and activity metadata use explicit Zod shapes.
- Every live job pipeline has exactly one Applied, Hired, and Rejected stage. Stage names are unique within a job; customizable stages may use CUSTOM. Retire stages only after their active applications have been moved.
- Creating a job clones the company defaults. Duplicating a job copies its configuration and live stages into a new Draft job, with no candidates, notes, interviews, or historical records.
- File references must belong to the same candidate and have the appropriate RESUME/NOTE kind; a note's attachments must also belong to that note's candidate.
- Interview end > start, valid timezone and appropriate URL/location for its mode. Check interviewer availability transactionally before scheduling or rescheduling; retry bounded serialization conflicts.
- Only an assigned interviewer submits/edits their own structured feedback; ratings are not edited through another user's account.
- Dates are stored as UTC instants. Convert datetime-local inputs using the chosen IANA timezone, including invalid/ambiguous daylight-saving times, before saving.
- Archive jobs/candidates and disable users instead of ordinary hard deletion. Restrict foreign keys and event snapshots preserve history.

### Transaction boundaries and concurrency

A stage move checks the actor's access and the target stage, then atomically updates the application's expected `version`, increments it, writes ApplicationStageHistory, and appends Activity. Version 0 is the initial Applied event; subsequent events are unique per application/version. A stale browser gets a conflict and refreshes instead of silently overwriting another recruiter.

Use the same pattern for public/manual applications, job lifecycle actions, interviews, scorecards, notes/mentions, tags, and simulated email logs. Relevant notifications are written with the domain change. External parsing and actual future SMTP work occur outside an open database transaction; persist their outcome through a separate authorized service step.

Physical files cannot participate in a database transaction. Write to a temporary private path, validate the document, then commit metadata and the application together. Remove temporary files on failure. Keep short database transactions and report parser failures without losing an otherwise valid submitted application.

### PostgreSQL portability

Use Prisma-native scalar types and enums/JSON supported by both providers. Avoid native database attributes, scalar arrays, raw SQLite queries, and SQLite-only search APIs. Case-insensitive search uses shared normalization and a provider-aware query helper because collation differs.

Migration requires changing `provider = "sqlite"` to `provider = "postgresql"`, updating `DATABASE_URL`, creating a fresh PostgreSQL migration history, and transferring existing data. SQLite migration SQL must not be reused against PostgreSQL. The logical relations and services remain the same.

## 6. Resume parsing and match evidence

Resume uploads accept PDF and DOCX only, up to 5 MB, checking both extension and file signature rather than trusting browser MIME type. Generate server-owned storage keys; preserve the original name as metadata. Private downloads verify access and serve files as attachments. Note files use a separate allowlist and the same storage boundary.

Parsing extracts text server-side. A scanned PDF with no useful text produces a clear "Text could not be extracted" state, and remains downloadable. OCR is not claimed. Failed parsing records a retryable error; it does not produce a misleading zero match score.

Recruiters enter matching keywords alongside the human-readable requirements. Suggested keywords may be derived from the requirements, but recruiters can see and edit the exact terms used. Normalize case, whitespace, and phrase boundaries while preserving meaningful terms such as C++, C#, and .NET. Compare unique required terms against the extracted text; repeated occurrences do not increase the score.

```text
score = round(100 * matched_unique_keywords / total_unique_keywords)

Example:
Required: TypeScript, React, SQL, testing
Found:    TypeScript, React, testing
Score:    75%
```

No keywords or unparsed/empty resume text means `matchScore = null`, with an explanatory state. Persist keyword lists, matched/missing terms, algorithm version, job requirement version, resume reference, and calculation date. If the requirements or resume changes, display the prior result as stale until recalculated.

Badge defaults: >= 75 green, 40-74 amber, below 40 neutral/red; include percentage/text so the result does not depend on color. Show "3 of 4 keywords found" and a details popover. This percentage describes keyword overlap, rather than an automated hiring decision.

## 7. UX and accessibility

Design direction: a calm working surface with warm neutral backgrounds, white/dark raised cards, one indigo accent, rounded 12-16 px corners, fine borders, modest shadows, and readable typography. The first dashboard viewport shows useful hiring numbers and actionable upcoming interviews.

- Desktop: collapsible sidebar; top bar with global search, notification bell, theme switch, profile/logout.
- Tablet/mobile: navigation drawer and compact action bar; responsive cards; horizontally scrollable pipeline with clear stage labels. Tables provide narrow-screen summaries without dropping actions.
- Put "Add candidate" in the Candidates header and global quick actions. Scheduling opens from an application/profile or Interviews header. Pipeline cards have a "Move to stage" menu as well as drag/drop. Each flow is reachable in three clicks or fewer before completing its form.
- Provide keyboard drag sensors, an ordinary move menu, accessible drag announcements, labeled forms, focus restoration, visible focus rings, dialog semantics, and reduced-motion support.
- Dragging uses an optimistic presentation with rollback/toast on rejection or conflict. The database remains authoritative.
- Loading skeletons match page structure; empty states explain the next step; server/form errors remain visible and actionable.
- Confirmation dialogs name the affected job, candidate count, or interview. Bulk reject/archive actions require confirmation.
- Use URL filters and server-side pagination/sorting with allowlisted sort fields, deterministic tie-breakers, bounded page size, and permission checks on selected IDs.
- CSV exports respect the current scope/filters and neutralize spreadsheet formula prefixes in user-supplied cells.
- Public application success does not reveal internal notes, scores, other applications, or candidate history.

## 8. Metrics and notifications

| Metric                   | Definition                                                                                                                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open jobs                | Unarchived jobs whose status is OPEN                                                                                                                                                                             |
| Total candidates         | Unarchived candidate profiles, counted once                                                                                                                                                                      |
| Interviews this week     | Non-cancelled interviews in the company-local Monday-Sunday week                                                                                                                                                 |
| Offers pending           | Active applications currently in an OFFER-kind stage                                                                                                                                                             |
| Time-to-hire             | Mean elapsed days from application submission to the first HIRED transition; null if there are no hires                                                                                                          |
| Dashboard hiring funnel  | Current application counts grouped by stable stage kind                                                                                                                                                          |
| Funnel conversion report | For each transition, denominator = distinct applications entering the previous stage; numerator = that subset later entering the next stage. Count applications once and display skipped-stage paths separately. |
| Time in stage            | Historical visit duration from `previousEnteredAt` to transition time, plus current open interval where appropriate                                                                                              |
| Source effectiveness     | Applications, first hires, and conversion percentage by the application's original source                                                                                                                        |
| Hires per month          | First HIRED transition per application, grouped by month in the selected company timezone                                                                                                                        |
| Candidate feedback       | Mean of submitted technical/communication/culture scores; also show category averages and number of scorecards, scoped to accessible jobs                                                                        |

Date range, job scope, and archived-record inclusion are explicit filters. Reports explain the difference between historical conversions and the dashboard's current occupancy.

Create recipient-specific NEW_APPLICANT notifications during application creation and MENTION notifications during note creation. Schedule INTERVIEW_REMINDER rows with `deliverAt`; the bell queries only due notifications and filters cancelled/completed interviews. Rescheduling replaces the pending reminder, and dedupe keys prevent duplicates. The local app uses focus refresh/polling; it does not depend on a background cron service or claim push/email delivery.

## 9. Seed specification

Implement an idempotent development seed in Phase 2, taking the admin password from environment configuration. Use fictional candidates and relative interview dates so the demo remains useful whenever seeded.

| Entity                   | Planned seed                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| Company                  | One fictional company; company timezone Asia/Kolkata and explicit currency                          |
| Users                    | One Admin, two Recruiters, three Hiring Managers, with job memberships                              |
| Jobs                     | Five realistic Engineering, Design, HR, and Data jobs: two Open, one On Hold, one Draft, one Closed |
| Candidates               | Exactly 30 fictional profiles, varied source, rating, tags, and contact details                     |
| Applications             | 36 applications, including six candidates applying to a second job; spread across stages            |
| Stages                   | Seven defaults copied into each job, plus consistent initial/transition history                     |
| Interviews               | 12: six upcoming, four completed, two cancelled, relative to seeding time                           |
| Scorecards               | Four completed interview scorecards with realistic comments                                         |
| Collaboration            | Eight notes, valid mentions and private attachment fixtures where provided                          |
| Email                    | Four requested template categories and eight simulated logs                                         |
| Tags                     | Six practical labels and candidate memberships                                                      |
| Activity / notifications | Domain-consistent audit events and due/future notifications                                         |

Seed data must use the same lifecycle/score rules as application services. Retain synthetic provenance for demo resumes and avoid pretending a file is available when there is no fixture on disk.

## 10. Delivery and verification

| Phase                | Deliverables and validation                                                                                                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1: Plan              | Architecture, route/folder tree, complete schema and context files. Review feature coverage; Prisma CLI validation waits for setup.                                                                                           |
| 2: Setup             | Pinned dependencies/configuration, environment examples, Prisma validate/migration/client, idempotent seed, login/logout/roles, accessible shell, theme and shared components. Run auth/scope E2E, typecheck, lint and build. |
| 3: Jobs/candidates   | Job CRUD/duplicate/close/archive, candidate forms/profiles, tags/ratings, scoped searchable sortable paginated lists, CSV/bulk foundations. Exercise recruiter workflows and error states.                                    |
| 4: Pipeline/resumes  | Stage customization/moves and history, drag/drop/menu alternative, file validation/storage/parsing, explainable match and stale detection. Verify move conflicts, invalid documents, failed parsing and history.              |
| 5: Collaboration     | Interview calendar/list/forms, scheduling constraints, structured feedback and aggregate, notes/mentions/attachments, templates and simulated email logs. Verify permissions and date handling.                               |
| 6: Careers/analytics | Public open jobs/applications, applicant dedupe and Applied placement, branded success/errors, live dashboard, filtered reports and CSV. Exercise public-to-recruiter workflow.                                               |
| 7: Polish            | Company/users/stage/tag settings, notifications/reminders, full role audit, responsive/theme/accessibility states, production build and end-to-end verification artifacts. Update complete README/context.                    |

Before each complex feature, enumerate failure cases and E2E acceptance flows. Follow the ancestor AGENTS.md: prefer E2E tests and do not append implementation-mirroring unit tests after code. Use an isolated test database and upload directory so verification never mutates the user's ordinary local data.

Final E2E coverage should include login/logout and disabled-user access, job lifecycle, manual candidate and public application, duplicate submission, manager scoping, drag/drop and keyboard/menu moves, match scoring/failure states, interview scheduling/cancellation/overlap, feedback, notes/mentions, simulated email, filters/bulk/export, notifications, and mobile/light/dark rendering. Save the Playwright HTML report and failure traces/screenshots; provide repeatable commands.

Phase 1 ends here. Wait for the user to say `continue` before Phase 2 installs or application implementation.
