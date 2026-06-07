# 01: OpenSpec and runtime scope for Inngest adoption

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## What to build

Create the OpenSpec change and implementation scope for adopting Inngest as the
durable workflow executor. This slice should make runtime adoption explicit
before code adds packages, routes, migrations, environment variables, or
workflow functions.

## Acceptance criteria

- [ ] The OpenSpec change states that product records, provider records, audit
      logs, and tenant authorization remain authoritative.
- [ ] The OpenSpec change states that tenants are product boundaries, not
      separate Inngest apps, environments, or billing accounts.
- [ ] The OpenSpec change defines the first implementation phases: workflow
      foundation, donation recovery, Resend inbound workflow, Support Hub moves,
      and Mission Control summaries.
- [ ] The OpenSpec change forbids secrets, full records, payment internals,
      email bodies, attachments, rendered documents, and broad CRM payloads in
      workflow events.
- [ ] Runtime environment names, local development expectations, and rollback
      boundaries are documented without committing secret values.
- [ ] The OpenSpec validation command for this repo is run or a blocker is
      recorded.

## Blocked by

None - can start immediately.
