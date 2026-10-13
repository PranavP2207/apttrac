![AptTraC — a calmer way to manage hiring](docs/assets/banner.svg)

# AptTraC

A modern applicant tracking workspace for recruiters and hiring teams. Manage roles, candidate profiles and application history through a responsive interface with an indigo accent and light/dark themes.

**Status:** Phases 1–3 are implemented and verified locally. Pipeline, resume uploads and the remaining workflows are planned in the [roadmap](#roadmap).

[Get started](docs/getting-started.md) · [Documentation](docs/README.md) · [Architecture](docs/architecture.md) · [Contributing](CONTRIBUTING.md)

## What works today

| Area                | Available workflows                                                                |
| ------------------- | ---------------------------------------------------------------------------------- |
| Authentication      | Credentials login/logout; Admin, Recruiter and Hiring Manager roles                |
| Jobs                | Create, edit, assign managers, duplicate, close, archive and restore               |
| Candidates          | Create/edit profiles, tags and ratings; apply to multiple open jobs                |
| Application history | Applied-stage entry, audit timeline and scoped existing interview/feedback records |
| Find and organize   | Global search, filters, sorting, pagination, bulk tagging and CSV export           |
| Workspace           | Overview, responsive navigation, themes, accessible forms and confirmation dialogs |

Hiring Managers see assigned jobs and their related records. Admins and Recruiters manage hiring data; company/team settings are restricted to Admins. See [permissions](CONTRIBUTING.md#permissions).

## Quick start

Requires **Node.js 22.12+** and npm. From the repository root:

```bash
npm ci
npm run setup
npm run dev
```

Open [localhost:3000](http://localhost:3000). Fresh demo login: **`admin@apttrac.local` / `AptTraCDemo!2026`**.

Setup creates a local `.env` with a random authentication secret, applies migrations and seeds **5 jobs, 30 candidates and 12 interviews**. Existing environment values and seeded accounts are preserved; use your existing admin credentials when resuming an installation.

On Windows PowerShell, use `npm.cmd` if script execution is restricted. See [setup and demo accounts](docs/getting-started.md) for cloning the private repository, custom credentials and troubleshooting.

## Built with

| Layer                          | Technology                                               |
| ------------------------------ | -------------------------------------------------------- |
| Application                    | Next.js 15 App Router · React 18 · TypeScript            |
| Interface                      | Tailwind CSS · shadcn/ui-style Radix components · Lucide |
| Data                           | Prisma ORM · SQLite · PostgreSQL-portable schema         |
| Authentication and forms       | NextAuth · Zod · React Hook Form                         |
| Planned pipeline and analytics | dnd-kit · Recharts                                       |
| Verification                   | Playwright · ESLint · TypeScript · Prettier              |

Dependencies are pinned in [package.json](package.json) and [package-lock.json](package-lock.json). Next.js 15 was explicitly approved after auditing the original Next.js 14 requirement.

## Repository structure

```text
app/                     Routes, layouts, pages and API handlers
components/              Reusable UI, layout and shared components
features/                Feature queries, services, validation and forms
lib/                     Database, authentication and shared utilities
prisma/                  Schema, committed migrations and synthetic seed
types/                   Shared TypeScript declarations
tests/e2e/               Browser acceptance tests and isolated bootstrap
scripts/
  setup.mjs              Local environment initialization
  verification/          Production smoke and schema portability checks
docs/
  assets/                README brand artwork
  verification/          Phase plans and verified results
  architecture.md        Architecture and planned route tree
  getting-started.md     Setup, demo data and database guide
```

The four root [project context files](docs/README.md#project-context) preserve requirements, decisions, current state and known issues. Generated builds, reports, databases, uploads and local secrets are excluded from Git.

## Development checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run test:e2e
```

Browser tests use a separate database and server. The latest verification passed **17 browser flows**, TypeScript, lint, formatting, the production build and production smoke. Repeatable commands and artifact locations are in [Contributing](CONTRIBUTING.md#verification); actual results are in [verification notes](docs/verification/repository-cleanup.md).

## Roadmap

| Phase | Scope                                                           | Status   |
| ----- | --------------------------------------------------------------- | -------- |
| 1     | Architecture and full database schema                           | Complete |
| 2     | Setup, authentication and design system                         | Complete |
| 3     | Jobs and candidates                                             | Complete |
| 4     | Pipeline board, resume uploads/parsing and match scores         | Planned  |
| 5     | Scheduling, scorecards, notes and email templates               | Planned  |
| 6     | Public careers, full dashboard and reports                      | Planned  |
| 7     | Editable settings, notifications, polish and final verification | Planned  |

Development pauses between phases until the next user continuation. This repository is a local application; hosting has not been configured. Confirmed limitations are tracked in [known issues](known-issues.md).
