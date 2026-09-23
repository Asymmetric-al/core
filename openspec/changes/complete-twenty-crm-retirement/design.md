# Design: Complete Twenty CRM Retirement

## Current architecture

Asym Postgres owns CRM truth. Native notes and relationships run through
`packages/api/src/admin/crm/notes/**` and `relationships/**`, with tenant,
permission and restricted-data checks. Notes persist in `crm_notes` and return
the authoritative local record; no queued-to-Twenty result or vendor request is
part of the accepted contract. The implementation merged through PR #1325 on
2026-08-19; AL-1861 synchronizes the durable specification and current prose.

## Historical transition

Before that replacement, notes queried Twenty and queued `crm_outbound_jobs`;
relationships read vendor objects and `crm_notes` did not yet exist. Those
observations describe the pre-retirement source, not today's baseline. Original
proofs and the archived integration package remain dated historical evidence.

## Decisions

- Relationships use local Asym reads, scoped search/pagination and native source
  labels. Apply current tenant/role visibility and care-sensitive exclusions.
- Notes authenticate and authorize, validate, insert locally, record the
  required command audit and return a persisted record immediately readable
  through the same scoped contract. Do not enqueue a vendor sync operation.
- Preserve forward-only migrations, RLS and composite tenant keys. Do not drop
  generalized command/merge/link records or reinterpret historical identifiers
  as live Twenty ownership. Any remaining compatibility cleanup follows its
  source-owned migration with evidence; it is not an automatic schema rewrite.
- Do not restore vendor clients, gateway, health, webhook, mapping, projection,
  queue, sync or environment machinery. Use the existing data-boundary guard;
  historical evidence and the guard's negative fixtures are not live dependencies.
- External variable/key/workspace cleanup requires exact authorized environment
  inspection. Its unverified status stays explicit in `tasks.md`.

## Affected surfaces

- `packages/api/src/admin/crm/notes/**` and `relationships/**`
- `packages/database` hooks, `packages/env` schema and native Admin CRM pages
- Historical forward migrations, verification scripts and tests
- Durable `crm-core` and the retired integration documentation

## Recovery

Restore only a proved native Asym CRM version that preserves tenant, permission,
audit and data compatibility. Never roll back to pre-retirement Twenty services
or credentials. Keep source-owned records and forward migration history intact;
deployment or external cleanup requires its own evidence.
