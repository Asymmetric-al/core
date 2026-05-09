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

- [ ] Twenty credentials are server-only.
- [ ] No `NEXT_PUBLIC_TWENTY_*` secret exists.
- [ ] App frontends do not call Twenty directly.
- [ ] Route handlers stay thin.
- [ ] Authorization uses Supabase Auth and tenant membership, not client-supplied role or tenant values.
- [ ] Machine-to-machine Twenty calls still log the real Supabase actor.
- [ ] Non-idempotent retries require idempotency keys.
- [ ] Request logs omit secrets and sensitive payloads.
- [ ] Package exports expose stable Asym contracts, not raw Twenty internals.
- [ ] Boundary checks cover no direct Twenty imports from app code.

## Exit Gate

Do not proceed until one authenticated staff-only route can call the CRM gateway in a non-production environment, all credentials stay server-side, and tests prove the app boundary cannot import raw Twenty clients.
