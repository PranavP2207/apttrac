# Documentation

Start with [Getting started](getting-started.md) to run AptTraC locally. The [root README](../README.md) summarizes the available product workflows and roadmap.

## Guides

| Document                                 | Purpose                                                              |
| ---------------------------------------- | -------------------------------------------------------------------- |
| [Getting started](getting-started.md)    | Requirements, setup, demo accounts, database and troubleshooting     |
| [Architecture](architecture.md)          | Feature boundaries, planned routes, data model and permission design |
| [Contributing](../CONTRIBUTING.md)       | Development conventions, permissions and repeatable verification     |
| [Prisma schema](../prisma/schema.prisma) | Complete relational model, including planned features                |

## Verification evidence

These notes distinguish planned acceptance cases from checks that actually passed. Browser reports and screenshots are generated locally and excluded from Git.

| Checkpoint                                               | Evidence                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| [Phase 2](verification/phase-2.md)                       | Authentication, roles, shell, seed and schema portability      |
| [Phase 3](verification/phase-3.md)                       | Job/candidate workflows, filtering, export and scoped profiles |
| [Repository cleanup](verification/repository-cleanup.md) | Published-file audit, organization and regression checks       |

## Project context

The four canonical context files remain at the repository root. Read them before implementation and update them at meaningful checkpoints.

- [Current state](../current-state.md): implemented behavior, validation and next action.
- [Decisions](../decisions.md): durable architecture and delivery choices.
- [Instructions](../instructions.md): accepted requirements and phase gates.
- [Known issues](../known-issues.md): confirmed defects, limitations and resolution evidence.
