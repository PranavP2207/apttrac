# Getting started

AptTraC runs locally with Node.js, npm and SQLite. No external database or mail service is required for the currently implemented workflows.

## Requirements

- Node.js **22.12 or later**, as specified in package.json.
- npm and Git.
- Access to the private [PranavP2207/apttrac](https://github.com/PranavP2207/apttrac) repository when cloning.

The app was verified with Node.js 24.19.0 and npm 11.17.0 on Windows. Commands below use npm; in PowerShell use `npm.cmd` and `npx.cmd` if execution policy blocks npm's PowerShell wrapper.

## Clone and run

If using GitHub CLI:

```bash
gh auth login
gh repo clone PranavP2207/apttrac
cd apttrac
```

From the repository root:

```bash
npm ci
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Keep the terminal running while using the app.

Setup copies .env.example into a local .env when needed, generates a random NEXTAUTH_SECRET, prepares private storage, generates Prisma Client, applies the committed SQLite migrations and runs the synthetic seed. Existing environment values, records and account passwords are preserved.

## Choose your admin credentials

Before the first seed:

```bash
npm ci
npm run env:setup
# Edit SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.
npm run setup
```

Passwords need at least 12 characters and at most 72 UTF-8 bytes. Editing seed values after an account exists does not reset its password. Use the credentials from the original setup for an existing installation.

NEXTAUTH_URL must match the browser's origin. The default is `http://localhost:3000`; switching to a different host or port also requires updating this local setting.

## Demo accounts

Fresh setups use the example password **`AptTraCDemo!2026`** for all synthetic accounts unless SEED_ADMIN_PASSWORD was customized.

| Role           | Email                                           |
| -------------- | ----------------------------------------------- |
| Admin          | `admin@apttrac.local`, or your SEED_ADMIN_EMAIL |
| Recruiter      | `recruiter@apttrac.local`                       |
| Recruiter      | `recruiter2@apttrac.local`                      |
| Hiring Manager | `manager@apttrac.local`                         |
| Hiring Manager | `design.manager@apttrac.local`                  |
| Hiring Manager | `people.manager@apttrac.local`                  |

The seed includes one company, six users, five jobs, 30 candidate profiles, 36 applications, seven stages per job, 12 interviews, four scorecards, eight notes, four email templates, eight simulated email logs, six tags and related history/notifications.

Candidate identities are fictional and use example contact domains. The seed refuses to run with NODE_ENV=production. Seeded resumes are not presented as downloadable files; resume uploads arrive in Phase 4. Existing interview, note and email records can be viewed; their editing workflows arrive in Phase 5.

## First recruiter workflows

1. **Jobs → Create job:** enter the role, salary, requirements and hiring managers. Open jobs are available for new applications.
2. **Job profile:** edit, duplicate as a fresh Draft, close, archive or restore. Lifecycle actions preserve existing history.
3. **Candidates → Add candidate:** enter contact details, source, tags and rating; optionally select an open job to start an application in Applied.
4. **Candidate profile → Add application:** apply an existing person to another open job. Each person can have one application per job.
5. **Candidate list:** search, expand filters, sort, paginate, add a tag to selected people or export a filtered/selected CSV.

Archived records are available through the Show filter. Duplicate emails are rejected with guidance to find the existing candidate.

## Database commands

```bash
npm run db:validate
npm run db:validate:postgres
npm run db:seed
npm run db:studio
```

SQLite data lives in the ignored `prisma/dev.db`. Rerunning the seed preserves existing records and passwords.

For an intentional schema change:

```bash
npm run db:migrate -- --name describe_change
```

Commit the schema and generated migration together. PostgreSQL validation checks a temporary provider-switched schema using a dummy URL; it does not connect to a live PostgreSQL database. Moving to PostgreSQL requires a provider/URL change, new PostgreSQL migrations and data transfer. SQLite migration SQL cannot be reused.

## Run a local production preview

Stop the development server before using its port:

```bash
npm run build
npm run start -- --hostname 127.0.0.1
```

Use the browser origin configured by NEXTAUTH_URL. This is a local production preview; repository publication does not deploy the app.

## Troubleshooting

| Symptom                                            | Action                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| PowerShell blocks npm.ps1                          | Use `npm.cmd` or `npx.cmd`                                                                 |
| Prisma Client is missing                           | Run `npm run db:generate` after installing dependencies                                    |
| Empty or missing development database              | Run `npm run setup`; it creates only a missing SQLite file                                 |
| Fresh-demo credentials fail on an existing install | Use the credentials originally seeded; seed reruns preserve passwords                      |
| A write returns an origin error                    | Match the browser host/port to NEXTAUTH_URL and restart the server                         |
| An edit reports a conflict                         | Refresh the record before saving again                                                     |
| Playwright cannot find a browser                   | Run `npx playwright install chromium`; see [verification](../CONTRIBUTING.md#verification) |

See [known issues](../known-issues.md) for confirmed limitations and [Contributing](../CONTRIBUTING.md) for development and verification commands.
