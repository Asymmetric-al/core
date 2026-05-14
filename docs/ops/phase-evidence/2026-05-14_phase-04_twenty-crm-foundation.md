# Phase 4 - Twenty CRM Foundation and API Gateway Evidence

Generated: 2026-05-14
Phase source commit at start: `44a3c24c4eabcaed0f32001f204c51b2326356d3`
Phase 3 source commit: `6f47c0701118b25d30d0f050ec12dfc6501e7237`
Status: complete; focused proof and full local gate passed

## Scope

Phase 4 locked down the Twenty Cloud headless CRM foundation without recreating
Phase 3 gateway proof or mutating production donor/payment/CRM data.

No production CRM posting was enabled. No Twenty schema object was created,
deleted, or recreated during this phase.

## Source Evidence

- Root `AGENTS.md`, `docs/ai/rules/{general,backend,testing}.md`,
  `docs/guides/architecture/data-access-boundary.md`, and
  `docs/ai/skills/{repo-entry,supabase,nextjs-app-router}/SKILL.md` were used.
- Bundled Next.js 16 route-handler docs were read from
  `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`.
- Nia tools were not exposed in this Codex session after tool discovery.
  Fallback was repo-scoped `rg`, direct file reads, local package evidence, and
  bundled docs.

## Configuration

- Active Twenty Cloud REST base shape is documented as
  `TWENTY_API_URL=https://api.twenty.com/rest`.
- `TWENTY_WORKSPACE_ID` remains optional in current repo code.
- `NEXT_PUBLIC_TWENTY_*` remains forbidden and no app source exposure was found.
- `packages/env/README.md` and `docs/guides/development/getting-started.md`
  now document the Cloud REST base and staging health command.
- `.vercelignore` now excludes generated local artifacts so targeted Vercel
  proof deploys do not upload `node_modules`, prior `.next` output, coverage,
  or local environment files.

### Vercel scope check

Command shape used without printing values:

```bash
tmpdir=$(mktemp -d)
vercel link --yes --project admin --scope asymmetric-al --cwd "$tmpdir"
vercel env ls <environment> --cwd "$tmpdir" --scope asymmetric-al --format=json
rm -rf "$tmpdir"
```

Sanitized result:

- `production`: no `TWENTY_*` or `CRM_SYNC_*` keys.
- `preview`: no `TWENTY_*` or `CRM_SYNC_*` keys.
- `development`: no `TWENTY_*` or `CRM_SYNC_*` keys.
- custom `staging`: `TWENTY_API_KEY` exists as a Vercel `sensitive` value.

`vercel env pull --environment=staging` into a temp file showed that
`TWENTY_API_KEY` is intentionally not materialized for local CLI execution, so
the local script correctly returned a sanitized missing-key state. This did not
print the key value, and the temp file was deleted.

Production/admin runtime should not receive Twenty values yet. That remains
aligned with the stop condition that production gift posting needs explicit
owner approval.

### Staging metadata-read proof

A no-Payload staging health adapter was added at
`/api/admin/crm/gateway/staging-health`. The app route is a thin re-export to
package-owned CRM health logic, stays disabled for production target envs, and
returns only sanitized configuration and metadata status.

Staging proof deployment:

- Deployment URL:
  `https://admin-gx8tkh3ta-asymmetric-al.vercel.app`.
- Deployment id: `dpl_EicXuJN73g3W5C47biQYnGZHp49g`.
- Build result: `READY`.
- Route proof command:
  `vercel curl /api/admin/crm/gateway/staging-health --deployment admin-gx8tkh3ta-asymmetric-al.vercel.app --scope asymmetric-al`.
- Sanitized result: `configured: true`, `apiBaseUrlKind:
"twenty_cloud_rest"`, `metadataRead.ok: true`, `giftSummaries.exists: true`,
  `giftSummaries.missingFields: []`, `objectInventory.includesGiftSummaries:
true`, `objectInventory.count: 29`, `workspaceConfigured: false`.

## Gateway Status

Changed package behavior:

- Missing env returns `mode: "missing_config"` with only missing key names.
- Malformed env returns `mode: "degraded"` with safe invalid reasons.
- Configured, unprobed env returns `mode: "ready"` and only reports
  `apiBaseUrlKind`, `workspaceConfigured`, and `hasWebhookSecret`.
- Provider probe failures return `mode: "provider_error"` with provider status
  only, not secret values or raw configured URLs.
- Staging health route returns package-owned `status: "ready"` only after a
  successful Twenty metadata read and does not require Payload initialization.

Production protected deployments still block the smoke route. A protected
production deployment returned Vercel auth protection first, and `vercel curl`
against the route returned app-level `Unauthorized` after Vercel protection
bypass. The original staging gateway status route returned a Payload
initialization error before app auth, so the staging proof route was added to
exercise the Twenty metadata read through server-side code without weakening the
admin gateway route.

## Metadata Object Inventory

Repo contract now records `giftSummaries` as an existing custom provider object
in `packages/api/src/crm/schema/twenty-object-model.ts`.

Required `giftSummaries` fields:

- `asymTenantId`
- `asymDonationId`
- `asymStagedGiftId`
- `donorId`
- `missionaryId`
- `fundId`
- `amountCents`
- `currencyCode`
- `stripePaymentIntentId`
- `stripeChargeId`
- `receiptStatus`
- `paymentStatus`

The contract explicitly uses `currencyCode`, not `currency`.

## Webhook Ingress

- App route remains a thin re-export:
  `apps/admin/app/api/admin/crm/webhooks/twenty/route.ts`.
- Package handler uses `TWENTY_WEBHOOK_SECRET` through `serverEnv`.
- Signed fixture tests cover missing secret rejection, accepted signed delivery,
  `sha256=`-prefixed signature normalization, duplicate delivery idempotency,
  ignored events, failed events, and paused inbound sync.

## Outbound Observability And Retry

`processCrmOutboundJob` now records provider lifecycle hooks after Twenty
responses:

- Success extracts a returned Twenty record id from common nested response
  shapes.
- Gift summary success promotes matching `staged_gifts` rows to
  `status: "posted"` and `crm_post_status: "posted"`.
- Gift summary success promotes matching `donation_crm_links` rows to
  `link_status: "active"` and stores correlation metadata:
  `crmOutboundJobId`, `crmOutboundIdempotencyKey`, `crmOutboundStatus`,
  `twentyObjectName`, and `twentyRecordId` when available.
- Gift summary failure marks `staged_gifts` as retryable failed CRM post state
  and marks existing `donation_crm_links` as failed with the outbound job
  correlation.
- Existing replay path remains the retry surface for outbound jobs.

## Added/Updated Tests

Focused tests passed:

```bash
bun test tests/unit/packages/api/crm-client.test.ts tests/unit/packages/api/crm-client-config.test.ts tests/unit/packages/api/crm-gateway.test.ts tests/unit/packages/api/crm-outbound-sync.test.ts tests/unit/packages/api/crm-webhook-signature.test.ts tests/unit/packages/api/crm-webhook-ingress.test.ts tests/unit/packages/api/crm-gift-summaries-contract.test.ts tests/unit/packages/api/giving-staged-gifts.test.ts tests/unit/packages/api/crm-boundary.test.ts tests/unit/packages/api/crm-notes.test.ts tests/unit/packages/api/crm-relationships.test.ts tests/unit/packages/api/crm-replay-reconciliation.test.ts
```

Result: 48 passed, 0 failed.

Coverage added:

- CRM client config and REST path construction.
- Missing/malformed `TWENTY_API_URL` and `TWENTY_API_KEY`.
- Gateway missing, degraded, configured, and provider-error states.
- Signed Twenty webhook ingress and duplicate delivery behavior.
- `giftSummaries` metadata and payload contract.
- Staging CRM health proof helper and production target disablement.
- Outbound success/failure correlation and retry visibility.
- App/browser raw Twenty boundary and `NEXT_PUBLIC_TWENTY_*` guard.

## No-secret Scan

Commands used during the pass printed only key names, sanitized statuses,
documented placeholders, or test fixtures. No `.env.local`, provider key,
webhook secret, database password, auth cookie, or connection string was
committed.

Sanity checks:

```bash
rg -n "(sk_live_|sk_test_|whsec_|sb_secret_|service_role|postgresql://|ghp_|SENTRY_AUTH_TOKEN|TWENTY_API_KEY|STRIPE_SECRET_KEY|RESEND_API_KEY|SUPABASE_SERVICE_ROLE_KEY|PAYLOAD_SECRET|PAYLOAD_DATABASE_URI|SUPABASE_DB_URL)" .vercelignore docs/ops/phase-evidence/2026-05-14_phase-04_twenty-crm-foundation.md docs/guides/development/getting-started.md docs/guides/architecture/runtime-map.md packages/env/README.md scripts/verify/twenty-crm-health.ts package.json packages/api/src/crm/health.ts packages/api/src/admin/crm/twenty-health.ts apps/admin/app/api/admin/crm/gateway/staging-health/route.ts tests/unit/packages/api/crm-health.test.ts
git diff --check
```

Result: only variable names, documented placeholders, and fake test fixtures
were found; whitespace check passed.

## Full Gate

Required commands passed:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run build
bun run test:unit
bun run verify:data-boundary
bun run verify:workspace-contract
bun run verify:eslint
bun run verify:shadcn-diff
bun run skills:verify
bun run verify:vercel-production -- --commit $(git rev-parse HEAD)
```

Full gate results:

- `bun run format:check`: passed.
- `bun run lint`: passed, 13 package tasks successful.
- `bun run typecheck`: passed, 13 package tasks successful.
- `bun run build`: passed, 13 package tasks successful.
- `bun run test:unit`: passed, 201 files, 891 tests, 1 skipped.
- `bun run verify:data-boundary`: passed, including app-source Twenty boundary
  and `NEXT_PUBLIC_TWENTY_*` guard.
- `bun run verify:workspace-contract`: passed.
- `bun run verify:eslint`: passed.
- `bun run verify:shadcn-diff`: passed, no component drift.
- `bun run skills:verify`: passed, agent skill sync complete.
- Vercel production readiness for commit
  `44a3c24c4eabcaed0f32001f204c51b2326356d3`: passed. Admin, donor, and
  missionary production deployments for the target commit are `READY`, with
  live `/api/health` returning HTTP 200.

Migrations did not change, so `verify:supabase-migrations` was not required.
Payload code did not change, so CMS verification commands were not required by
this phase.
