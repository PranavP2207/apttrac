# Instructions: AptTraC

Last updated: 2026-10-13

## Product goal

Create a working, polished Applicant Tracking System for non-technical recruiters, with beginner-friendly, feature-based source code and complete runnable files.

- Current product name: **AptTraC**, explicitly selected by the user on 2026-10-09 after checking the proposed Talentra name against existing recruitment brands.
- GitHub delivery: publish verified source to the existing **private** PranavP2207/apttrac repository. Phase 3 was separately authorized by `continue` on 2026-10-13; pause again when it is complete.
- Install the official GitHub CLI on this Windows machine and use it for repository creation and Git pushes, per the user's follow-up request.
- Repository maintenance authorized on 2026-10-13: organize files, inspect unnecessary published content and improve GitHub presentation. Preserve app behavior; this request does not start Phase 4.

## Scope and acceptance criteria

From the user's product brief:

1. Credentials authentication, logout, and Admin, Recruiter, and Hiring Manager roles; seed an admin.
2. Dashboard: open jobs, candidates, interviews this week, pending offers, time-to-hire, hiring funnel, and recent activity.
3. Jobs: create, edit, duplicate, close, archive; title, department, location, employment type, salary range, description, requirements; Draft, Open, On Hold, Closed.
4. Candidates: manual creation and public applications; name, email, phone, LinkedIn, source, PDF/DOCX resume, tags, 1-5 rating, profile and full activity timeline.
5. Per-job customizable Kanban pipeline; initial Applied, Screening, Interview, Assessment, Offer, Hired, Rejected; drag and drop and log each transition.
6. Resume text extraction, explainable keyword-match percentage, colored badges.
7. Interviews: date/time, interviewer, online/onsite, calendar, upcoming list, scheduled/completed/cancelled status.
8. Scorecards: technical, communication, culture fit ratings and comments; aggregate candidate score.
9. Internal notes, user mentions, file attachments.
10. Editable email templates with candidate/job variables; simulated sending with logs and an SMTP adapter seam.
11. Branded public careers listing and validated applications with resumes; insert into Applied.
12. Global search; job/stage/source/tag/rating/date filters; sortable paginated tables; bulk stage move, tagging, rejection, CSV export.
13. Funnel conversion, time in stage, source effectiveness, hires by month; CSV exports.
14. Settings: company profile, default and per-job pipeline stages, tags, users, email templates.
15. Auditable key actions.
16. In-app applicant, interview reminder, and mention notifications.

## Project constraints

- Next.js 15 App Router and TypeScript. The user explicitly approved a patched Next.js 15 release on 2026-10-09 after the actual Next.js 14 dependency audit revealed critical advisories; this supersedes the initial Next.js 14 requirement.
- Tailwind CSS, shadcn/ui, and lucide-react; Prisma and local SQLite, with a PostgreSQL-portable schema.
- NextAuth credentials login; Zod and React Hook Form; dnd-kit and Recharts.
- Feature folders: `app/`, `components/`, `features/`, `lib/`, `prisma/`, `types/`.
- Indigo accent on neutral surfaces, rounded cards, subtle shadows, generous spacing.
- Collapsible sidebar, global search, profile menu, light/dark themes, responsive layouts.
- Loading skeletons, helpful empty states, toasts, destructive confirmation dialogs.
- Accessible labels, focus states, ARIA, keyboard navigation including pipeline moves.
- Common actions (add candidate, schedule interview, move stage) reachable within three clicks.
- Short comments for non-obvious logic; README and complete source code.
- Realistic seed: 5 jobs, 30 candidates, interviews, and notes.

## Working conventions

- Deliver phases in order and wait for an explicit `continue` between phases:
  1. Architecture, folder tree, Prisma schema.
  2. Install commands, configuration, authentication, layout, design system.
  3. Jobs and candidates.
  4. Pipeline and resume parsing.
  5. Interviews, scorecards, notes, email templates.
  6. Careers, dashboard, reports.
  7. Settings, notifications, polish, testing.
- Maintain these four root context files before implementation and at meaningful checkpoints and handoff, per the user-provided AGENTS.md instruction.
- Applicable ancestor `C:/Users/prana/Documents/AGENTS.md`: never write unit tests after implementation; strongly prefer E2E tests, produce repeatable verification artifacts. If isolated tests are needed, enumerate failure cases before implementing the system.
- Clearly distinguish planned, implemented, and verified behavior. Do not claim the app works before running it.
- Role permission defaults, single-company operation, and report definitions are agent design choices recorded in decisions and architecture, rather than additional user mandates.

## Instruction sources

- User's AptTraC product brief and explicit phase gating in this chat.
- User-provided project-context AGENTS.md instruction in this chat.
- Ancestor repository instructions: `C:/Users/prana/Documents/AGENTS.md` (read 2026-10-09).
