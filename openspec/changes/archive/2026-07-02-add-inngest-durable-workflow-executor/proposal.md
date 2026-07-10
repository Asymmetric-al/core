# Proposal: Adopt Inngest as the durable workflow executor

## Why

Asymmetric.al needs durable background workflow execution for donation saga
recovery, Stripe webhook follow-up, Resend inbound email processing, Support
Hub routing and moves, operator recovery, and future CRM/document automation.

Today the repo has strong product-owned patterns — donation saga and outbox
processing, Stripe raw event storage with claim/complete semantics, Resend
webhook verification with fail-closed tenant resolution, tenant-scoped Support
Hub routing, audit logs, and Mission Control operational surfaces — but no
scheduler, queue, or durable retry runtime. All recovery today is manual
(admin-triggered outbox processing and replay routes). The Inngest integration
makes retryable work durable, inspectable, and recoverable without replacing
product-owned patterns with fire-and-forget jobs or broad workflow payloads.

This change makes runtime adoption explicit before any code adds packages,
routes, migrations, environment variables, or workflow functions, per the PRD
at `.scratch/inngest-durable-workflow-executor/PRD.md` (parent issue #285).

## What Changes

- Adopt the Inngest TypeScript SDK (v4) as the durable workflow executor
  runtime, served through the existing server-side boundary: workflow setup and
  business behavior live in `packages/api` (and shared server-side packages),
  with thin app route re-exports only.
- Introduce a shared, product-owned **workflow dispatch ledger** that records
  every request to hand work to workflow orchestration, plus a **dispatch
  recovery scan** that finds stored-but-not-handed-off requests.
- Introduce a standard **workflow event envelope**: tenant ID, workflow name,
  schema version, durable product record ID, dispatch request ID, and safe
  audit/routing context only.
- Introduce reusable **product work claims** that guard each retryable business
  effect against concurrent manual replay, recovery scans, and workflow
  retries.
- Implement the first workflow phases in order:
  1. **Workflow foundation** — runtime endpoint, no-op smoke workflow, dispatch
     ledger, event envelope, work claims, recovery scan.
  2. **Donation recovery** — one-time donation saga outbox recovery and Stripe
     webhook / recurring donation lifecycle dispatch, with honest payment
     status and ACH language across giving surfaces.
  3. **Resend inbound workflow** — verified tenant-resolved inbound handoff,
     placeholder records, durable body/attachment retrieval, Support Hub
     routing, and inbound routing review with saved route management.
  4. **Support Hub moves** — explicit audited single-message moves, bulk moves
     with partial success, and Retry failed recovery.
  5. **Mission Control summaries** — product-owned workflow run summaries and
     notification policy.

## Authority Boundaries

- **Product records, provider records, audit logs, and tenant authorization
  remain authoritative.** Inngest executes durable recovery and follow-up work
  after authoritative product records exist; it does not own donations, email,
  CRM state, documents, payment status, permissions, tenant data, or audit
  truth.
- **Tenants are product boundaries, not separate Inngest apps, environments,
  or billing accounts.** The platform operates one shared Inngest setup; tenant
  identifiers travel in event envelopes, concurrency keys, work claims, audit
  entries, and Mission Control summaries.
- **Stripe remains the payment authority.** Workflows must not invent payment
  success or become the billing engine; recurring donations use Stripe Billing
  lifecycle semantics.
- **Provider webhook boundaries stay in the product.** Stripe and Resend
  signature verification, raw request handling, tenant resolution, and durable
  event storage stay in the existing webhook route boundary; workflows receive
  only safe envelopes after durable storage.
- **Product idempotency keys and work claims guard business effects.** Inngest
  event deduplication only reduces duplicate handoffs; it is never the only
  protection against duplicate business effects.

## Workflow Event Payload Prohibitions

Workflow events must carry identifiers and safe routing metadata only. They
must never include:

- secrets, API keys, signing keys, or provider credentials
- full database records or row snapshots
- payment internals, Stripe client secrets, or bank details
- email bodies, rendered HTML, attachment bytes, or signed attachment URLs
- rendered documents
- broad CRM payloads

The event envelope builder/validator must reject these fields, and tests must
prove the rejection.

## Runtime Environments

Environment variable names (values are never committed):

- `INNGEST_EVENT_KEY` — event key for sending events (production/preview).
- `INNGEST_SIGNING_KEY` — serve endpoint signing key (production/preview).
- `INNGEST_SIGNING_KEY_FALLBACK` — optional rotation fallback.
- `INNGEST_DEV` — set to `1` in local development to force dev mode against the
  local Inngest dev server; never set in production.
- `INNGEST_BASE_URL` — optional override for a non-default dev server URL.

Environment model:

- **Local development** — `INNGEST_DEV=1` with the Inngest dev server
  (`npx --ignore-scripts=false inngest-cli@latest dev`); no keys required; the
  serve endpoint is discovered at `/api/inngest` on the app that owns workflow
  serving.
- **Production** — Inngest Cloud with `INNGEST_EVENT_KEY` and
  `INNGEST_SIGNING_KEY` set through the deployment platform's secret store.
- **Previews/branches** — may use Inngest branch environments with the same
  variable names; preview behavior must never require committing secrets.

All new variables are added to `packages/env/src/schema.ts` as optional server
vars (required only in protected deployments that enable workflow dispatch), so
`SKIP_ENV_VALIDATION=1` sandboxes keep working.

## Rollback Boundaries

- The serve endpoint, dispatch adapter, and recovery scan can be disabled or
  removed without data loss: the dispatch ledger, work claims, and product
  records are plain product tables that remain valid without Inngest.
- Existing manual recovery paths (admin-triggered outbox processing and replay
  routes) remain in place during adoption and act as the fallback if workflow
  dispatch is disabled.
- Database migrations introduced by this change are additive (new tables and
  columns only); rollback means stopping dispatch, not destructive schema
  reversal.
- Provider webhook acceptance never depends on Inngest availability: webhooks
  store events durably and return success before/independent of workflow
  handoff.

## What Does Not Change

- Product records, provider records, audit logs, and tenant authorization stay
  authoritative everywhere.
- Donor-facing one-time checkout keeps creating/retrieving the Stripe payment
  object immediately; Inngest replaces recovery/backfill work first.
- Outbound email delivery status, suppression, bounce, complaint, and send-log
  handling stay on the current path until separately approved.
- No per-tenant Inngest apps, environments, or billing accounts.
- App route handlers stay thin; no direct Supabase or provider secret access
  from app route handlers or client UI.
- Mission Control shows product-owned run summaries, not a raw Inngest step-log
  mirror.

## Expected Outcome

- The repo serves Inngest functions through the approved server-side boundary
  with local dev server discovery proven by a no-op smoke workflow.
- Donation saga recovery, Stripe webhook follow-up, Resend inbound processing,
  Support Hub routing/moves, and Mission Control summaries run as durable,
  tenant-scoped, claim-guarded workflows.
- Every workflow event is a small, schema-versioned, identifier-only envelope
  recorded in the shared dispatch ledger and recoverable by scan.
- All work passes the repo's data-boundary, workspace-contract, lint,
  typecheck, and unit-test gates.
