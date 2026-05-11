# Phase 01 - Core Seam And Authorization

## Trigger

Use this phase after Phase 00 proves Twenty can run safely beside Asym and the OpenSpec change defines the durable platform contract.

## Goal

Build the server-side anti-corruption layer between Asym and Twenty. This layer owns credentials, rate limits, auth decisions, command logs, and stable Asym-facing CRM contracts.

## Scope

- Vendor-neutral CRM gateway under `packages/api`.
- Twenty Core API and Metadata API client wrappers.
- Server-only env schema entries.
- Supabase Auth to CRM authorization bridge.
- CRM permission model.
- CRM command log.
- Thin app route handlers that re-export from `@asym/api`.
- Initial unit tests and boundary tests.

## Not In Scope

- Full sync engine.
- Bulk import.
- Native CRM UI expansion beyond simple smoke routes.
- Production cutover.
- Donor or missionary surface behavior.

## Recommended Package Shape

Use a root CRM subsystem for vendor-facing and Asym-facing contracts:

```text
packages/api/src/crm/
  index.ts
  client/
  auth/
  types/
  mapping/
  commands/
  queries/
  sync/
  projections/
  audit/
```

Keep admin-specific route handlers and admin read models under `packages/api/src/admin/crm/*` as adapters that call the root CRM subsystem.

## Workflow

1. Add server-only Twenty env entries to `packages/env`.
2. Build client wrappers that attach credentials, time out, retry safe transient failures, throttle requests, parse errors, and support pagination/batching.
3. Implement `requireCrmAccess` using existing Supabase auth context and tenant role resolution.
4. Define `ActorContext` so every command can preserve the real Supabase actor.
5. Add a command log table and API helper for audited writes.
6. Export stable Asym-facing CRM functions only.
7. Add thin app route handlers that delegate to `@asym/api`.
8. Add tests that prevent browser or app-route code from importing Twenty clients.

## Checklist

- [x] Twenty credentials are server-only.
- [x] No `NEXT_PUBLIC_TWENTY_*` secret exists.
- [x] App frontends do not call Twenty directly.
- [x] Route handlers stay thin.
- [x] Authorization uses Supabase Auth and tenant membership, not client-supplied role or tenant values.
- [x] Machine-to-machine Twenty calls still log the real Supabase actor.
- [x] Non-idempotent retries require idempotency keys.
- [x] Request logs omit secrets and sensitive payloads.
- [x] Package exports expose stable Asym contracts, not raw Twenty internals.
- [x] Boundary checks cover no direct Twenty imports from app code.

## Phase 01 Artifact Status

Phase 01 is implemented as a server-side seam only:

- `packages/api/src/crm/*` owns the stable CRM gateway, Supabase Auth actor
  bridge, command log helper, and internal Twenty Core/Metadata wrappers.
- `apps/admin/app/api/admin/crm/gateway/status/route.ts` is the non-production
  staff-only smoke route and only re-exports from `@asym/api`.
- `packages/env` defines server-only Twenty variables. There are no
  `NEXT_PUBLIC_TWENTY_*` variables.
- `supabase/migrations/20260507234343_crm_command_logs.sql` adds the
  tenant-scoped CRM command log with staff RLS and idempotency indexing.
- `eslint.config.mjs`, `scripts/verify/data-boundary-check.mjs`, and unit tests
  enforce that app code cannot import raw Twenty client wrappers or reference
  server-only Twenty credentials.

Phase 02 is not started here: no Twenty schema bootstrap, link tables,
projection sync, production cutover, or native CRM UI expansion is included.

## Exit Gate

Do not proceed until one authenticated staff-only route can call the CRM gateway in a non-production environment, all credentials stay server-side, and tests prove the app boundary cannot import raw Twenty clients.
