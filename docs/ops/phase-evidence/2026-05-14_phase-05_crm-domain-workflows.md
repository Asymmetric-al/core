# Phase 05 CRM Domain Workflows Evidence

> **Note (2026-07-06):** Twenty CRM has since been retired (ADR-0001); this
> file records the state as of its date.

Generated: 2026-05-14
Baseline commit: `c9b688fc6bdee222b8722f0e291eae376580e358`
Final status: `complete-with-deferred-mobilization`

## Scope

Phase 5 promoted the Phase 3/4 Twenty CRM foundation into nonprofit CRM
workflows without enabling production CRM writes. Production donor, payment,
CRM, and CMS data were not mutated.

## Instruction And Source Checks

- Loaded repo root `AGENTS.md`, `docs/ai/skills/repo-entry/SKILL.md`,
  `docs/ai/rules/general.md`, `docs/ai/rules/backend.md`,
  `docs/ai/rules/frontend.md`, `docs/ai/rules/testing.md`, and
  `docs/guides/architecture/data-access-boundary.md`.
- Loaded Supabase and Next.js repo skills for backend/App Router work.
- Read bundled Next.js 16 docs from `node_modules/next/dist/docs/`:
  Route Handlers, Server and Client Components, and Fetching Data.
- Nia was requested by repo rules, but no Nia MCP tool was available in this
  Codex session. Fallback was repo-scoped `rg` plus direct source reads.

## Current CRM Inventory

```txt
Twenty mode: Twenty Cloud REST shape from current config contract; production writes disabled.
giftSummaries present: yes, proved by Phase 4 evidence and preserved in object model.
required fields present: yes, Phase 4 evidence lists no missing giftSummaries fields; Phase 5 added no production schema mutation.
currencyCode confirmed: yes, gift summary payloads and Phase 5 report/detail models use currencyCode, not currency, for CRM gift context.
workspace id required: no, TWENTY_WORKSPACE_ID remains optional in packages/api/src/crm/client/config.ts and packages/env/src/schema.ts.
production CRM write flags: CRM_SYNC_* remain intentionally disabled per Phase 4 follow-up; Phase 5 did not enable them.
```

## Implemented Workstreams

- Nonprofit object model: extended the versioned Twenty object model with
  donor/person workflow fields, `designations`, `giftAllocations`, and a
  documented `mobilizationCandidates` deferred submodule. `giftSummaries` was
  not renamed.
- Donation CRM link lifecycle: reconciliation now checks queued/failed
  `donation_crm_links` drift in addition to orphan links, stale projections,
  stalled jobs, duplicate candidates, and failed webhooks.
- Donor care: Mission Control CRM drawer now loads donor detail, gift history,
  timeline, support totals, duplicate warnings, note creation, and receipt
  resend through the app Resend route.
- Privacy: donor detail response marks restricted note visibility by role and
  explicitly keeps restricted donor contact data away from missionary users.
- Support model: donor detail aggregates support by designation/fund and
  missionary, recurring commitments, lapsed commitments, at-risk support, and
  lifetime support while keeping Twenty out of payment truth.
- Reporting/export: added CRM report slices for funds, missionaries, donors,
  and sync failures; CSV export logs actor, tenant, filters, row count, and
  timestamp through `audit_logs`.
- Receipt resend audit: Mission Control receipt resends now write staged gift
  audit events before and after app Resend send attempts.

## Deferred Mobilization Submodule

Mobilization was documented in the Twenty object model as
`mobilizationCandidates`, but the full stage-transition workflow is deferred.
Reason: the current repo already has separate Mission Control mobilization
collections, and connecting those to Twenty would require provider schema
mutation and stage-transition UX beyond the safe no-production-write Phase 5
boundary. No production Twenty schema was bulk-mutated.

## Acceptance Proof

```txt
Safe staged gift fixture: covered by unit fixture in admin-crm-detail-report.test.ts; no production data touched.
Outbound CRM job: existing Phase 4 job path preserved; focused tests rerun.
Twenty record id captured: existing gift summary outbound success extraction preserved and covered by crm-outbound-sync.test.ts.
donation_crm_links promoted: existing promotion path preserved; new reconciliation drift check covers queued/failed links.
retry/idempotency proof: existing outbound idempotency tests rerun.
reconciliation proof: crm-replay-reconciliation.test.ts now includes donation CRM link drift counts.
```

## Files Changed

- `apps/admin/app/(app)/crm/page-client.tsx`
- `apps/admin/app/api/admin/crm/records/[recordId]/route.ts`
- `apps/admin/app/api/admin/crm/reports/route.ts`
- `apps/admin/app/api/admin/crm/reports/export/route.ts`
- `packages/api/package.json`
- `packages/api/src/admin/contributions/staged-gifts.ts`
- `packages/api/src/admin/crm/detail/index.ts`
- `packages/api/src/admin/crm/detail/service.ts`
- `packages/api/src/admin/crm/notes/index.ts`
- `packages/api/src/admin/crm/notes/model.ts`
- `packages/api/src/admin/crm/notes/service.ts`
- `packages/api/src/admin/crm/reports/export.ts`
- `packages/api/src/admin/crm/reports/index.ts`
- `packages/api/src/admin/crm/reports/query.ts`
- `packages/api/src/admin/crm/reports/service.ts`
- `packages/api/src/crm/reconciliation/run.ts`
- `packages/api/src/crm/schema/twenty-object-model.ts`
- `packages/api/src/crm/sync/store.ts`
- `packages/api/src/crm/sync/types.ts`
- `packages/api/src/crm/types/index.ts`
- `packages/database/hooks/admin-crm-detail.ts`
- `packages/database/hooks/index.ts`
- `packages/database/types/crm-detail.ts`
- `packages/database/types/crm-notes.ts`
- `packages/database/types/crm-reports.ts`
- `packages/database/types/index.ts`
- `packages/lib/audit/logger.ts`
- `tests/unit/packages/api/admin-crm-detail-report.test.ts`
- `tests/unit/packages/api/crm-notes.test.ts`
- `tests/unit/packages/api/crm-replay-reconciliation.test.ts`
- `tests/unit/packages/api/crm-schema-model.test.ts`
- `tests/unit/packages/api/crm-sync-test-store.ts`

## Focused Verification

```bash
bunx vitest run tests/unit/packages/api/crm-schema-model.test.ts tests/unit/packages/api/crm-notes.test.ts tests/unit/packages/api/crm-replay-reconciliation.test.ts tests/unit/packages/api/admin-crm-detail-report.test.ts --coverage=false
bun run typecheck --filter=@asym/api --filter=@asym/database --filter=@asym/admin
```

Both focused checks passed locally.

## Final Gate

Final gate executed locally:

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

Results:

- `bun run format:check`: passed.
- `bun run lint`: passed.
- `bun run typecheck`: passed.
- `bun run build`: passed for admin, donor, and missionary apps.
- `bun run test:unit`: passed, 202 test files, 897 passed, 1 skipped.
- `bun run verify:data-boundary`: passed; no direct Supabase imports in app
  API routes and no raw Twenty access in app source.
- `bun run verify:workspace-contract`: initially caught missing runtime-map
  entries for the new CRM routes; `docs/guides/architecture/runtime-map.md`
  was updated, then the command passed.
- `bun run verify:eslint`: passed.
- `bun run verify:shadcn-diff`: passed; no component drift.
- `bun run skills:verify`: passed.
- `bun run verify:vercel-production -- --commit $(git rev-parse HEAD)`:
  passed. Admin, donor, and missionary were all `READY`, with HTTP 200 health
  checks for the production domains at commit
  `c9b688fc6bdee222b8722f0e291eae376580e358`.

Database migrations did not change, so `verify:supabase-migrations` is not
required for this phase.

## Stop Conditions Observed

- Did not enable production CRM writes.
- Did not bulk mutate Twenty objects.
- Did not auto-merge contacts.
- Did not expose donor private data to missionary users.
- Did not change `giftSummaries` production schema.
- Did not print or commit secrets.
