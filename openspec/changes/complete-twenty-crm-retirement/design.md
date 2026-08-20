# Design: Complete Twenty CRM Retirement

## Context

Live CRM notes `GET` Twenty `notes` and `POST` enqueue `crm_outbound_jobs` with
`twentyObjectName: "notes"`. Relationships fan out Twenty objects (people,
companies, churches, households, relationshipCommitments, ministryActivities).
There is no `crm_notes` table today. ADR-0001 already retires Twenty.

Phase 9 party/identity spine, `crm_command_logs`, `crm_merge_candidates`, and
`crm_record_links` stay. Reuse them. Do not duplicate models.

## Decisions

- Relationships: local Asym Postgres reads through `packages/api`, tenant and
  role isolation, search/pagination, care-sensitive exclusion, native source
  labels. No `mode: "twenty"`.
- Notes: authenticate, validate, insert into a tenant-owned local table,
  audit via `crm_command_logs`, return the persisted note, immediately
  readable. Restricted visibility stays. No Twenty outbound job.
- Forward migrations only. `ENABLE` and `FORCE` RLS. Composite tenant keys.
- After replacements are proven, delete Twenty client, gateway, health,
  webhooks, mapping, projections, sync, env fields, and `verify:twenty-crm-health`.
- Outbound queue: inspect consumers. If `staged-gifts` is the only leftover
  and has no current non-Twenty consumer, remove the dormant Twenty-named
  queue rather than keeping a speculative provider-sync framework.
- `crm_record_links` remains, made provider-neutral if a Twenty-named CHECK
  remains.
- Non-regression: extend `scripts/verify/data-boundary-check.mjs` rather than
  a new scanner. Allow ADR-0001, archives, dated evidence, the guard's
  fixtures, and explicit retirement docs.
- Do not rewrite `openspec/changes/archive/2026-07-02-integrate-twenty-crm-core/`.
  It already carries a RETIRED warning.
- External Vercel `TWENTY_*` and Twenty Cloud key/workspace cleanup happens
  only with authenticated tooling. If credentials are missing, record an
  exact human checklist. Never log secret values.

## Affected surfaces

- `packages/api/src/admin/crm/notes/**`
- `packages/api/src/admin/crm/relationships/**`
- `packages/database` hooks, `packages/env` schema
- Admin CRM pages under `apps/admin`
- Supabase migrations and generated types
- Verification scripts and unit tests

## Rollback

Keep forward migrations reversible by not dropping generalized Asym tables.
Restore previous API services only from git. Do not reintroduce Twenty
credentials.
