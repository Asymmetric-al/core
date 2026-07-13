# Design: Inngest durable workflow executor runtime scope

## Runtime placement

- **One Inngest app for the platform**, id `asym-core-workflows`. Tenants are
  identified inside event envelopes, never by separate Inngest apps,
  environments, or billing accounts.
- **Workflow function owner: staff operations.** The serve endpoint lives in
  the Mission Control app (`apps/admin`) at `/api/inngest` as a thin re-export.
  Rationale: the Resend webhook boundary, Support Hub services, reconciliation
  and replay surfaces already run there, and Mission Control owns workflow
  summaries. The owner names where workflow code is served, not which tenant
  the work belongs to.
- **All workflow logic lives in `packages/api/src/workflows/`**: the Inngest
  client, serve configuration, event envelope builder/validator, dispatch
  adapter, dispatch ledger service, work claims service, recovery scan, and
  workflow functions. App route files only re-export handlers, in line with
  `docs/guides/architecture/data-access-boundary.md`.
- Route files do not export runtime segment config (repo `cacheComponents`
  policy). New routes are recorded in
  `docs/guides/architecture/runtime-map.md`.

## Event model

- Event names use product-domain object/action language (for example
  `donations/saga.recovery.requested`), never app route locations.
- Every event body is the standard envelope: `tenantId`, `workflowName`,
  `schemaVersion`, durable product record reference (type + id), `dispatchRequestId`,
  and bounded safe context. The envelope validator rejects the prohibited field
  classes listed in the proposal.
- Inngest event `id` is set from the dispatch request for handoff-level
  deduplication. Business effects are still guarded by product idempotency
  keys and product work claims.

## Durable execution rules

- All non-deterministic work inside workflow functions — database reads and
  writes, Stripe calls, Resend calls — happens inside durable steps.
- Flow control is deliberate: per-tenant and per-work-item concurrency keys,
  provider-aware throttling, bounded retries with dead-letter transitions
  recorded in product records.
- Workflow functions load current authorized product state inside steps using
  existing `packages/api` services; events are pointers, not payloads.

## Data model (additive only)

- `workflow_dispatch_requests` — the shared dispatch ledger (tenant-scoped,
  status-tracked handoff records shared by donations, email, Support Hub, and
  future areas).
- `workflow_work_claims` — reusable product work claims keyed by tenant +
  work item, guarding manual replay, recovery scans, and workflow retries.
- Run summary and notification policy records are product-owned projections
  (no raw Inngest step-log mirror).

## Local development

- `INNGEST_DEV=1` in `.env.local`; run the app (`bun run dev:admin`) and the
  Inngest dev server (`npx --ignore-scripts=false inngest-cli@latest dev -u
http://localhost:3030/api/inngest`); the dev server UI runs at
  `http://localhost:8288`. No secrets are required in dev mode.

## Fallback and rollback

- Manual recovery routes (donation outbox processing, replay endpoints) remain
  functional throughout adoption.
- Disabling workflow dispatch (unsetting keys / removing the serve route)
  leaves all product tables valid; the dispatch ledger keeps recording intent
  so work can be recovered when dispatch is re-enabled.
