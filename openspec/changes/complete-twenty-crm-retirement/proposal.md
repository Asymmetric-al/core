# Change: Complete Twenty CRM Retirement

## Why

ADR-0001 and issue #602 retire Twenty CRM as a product dependency. Asym
Postgres already owns application truth, but `crm-core` still described Twenty
as the backing implementation, and live Mission Control notes and relationships
still called Twenty. The CRM capability remains. Twenty does not.

## What Changes

- Make Asym Postgres the sole CRM record authority for persons, donors,
  missionaries, households, organizations, churches, relationships, notes,
  tasks, activity, duplicate state, and merge state.
- Keep Mission Control as the native staff CRM experience and `packages/api`
  as the business boundary.
- Replace Twenty-backed relationship reads and queued-to-Twenty notes with
  tenant-safe local reads and authoritative local writes.
- Remove live Twenty clients, routes, webhooks, projections, sync, health
  checks, environment fields, and staff-facing Twenty ownership labels.
- Preserve historical OpenSpec archives, ADR-0001, and dated evidence.
- Add a CI non-regression guard against restoring Twenty runtime dependencies.
- Keep `crm-core`. Do not use `retire_capabilities: true`.

## Capabilities

- `crm-core`: Asym Postgres CRM truth, local notes and relationships, Twenty
  prohibition, provider links as references.

## Impact

- Mission Control CRM notes and relationships screens.
- `packages/api` CRM services, env schema, migrations, and verification
  scripts.
- Durable `crm-core` specification after this change is synced.

## Non-goals

- Retiring the CRM capability
- A generic provider-sync platform or CRM adapter architecture
- Rewriting historical Twenty archives to pretend Twenty was never considered
- Eve write authority or an Eve upgrade
- Dropping reusable Asym-owned CRM helpers (`crm_command_logs`, merge
  candidates, native grids)
