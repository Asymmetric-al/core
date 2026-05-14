# Phase 4 Follow-Up Evidence

Generated: 2026-05-14T10:16:00Z
Repo: Asymmetric-al/core
Branch: epic
Commit: 44a3c24c4eabcaed0f32001f204c51b2326356d3

## Summary

Phase 4 implementation and evidence were still local at the start of this
follow-up. This pass prepared the Phase 4/follow-up evidence for commit,
archived Phase 3 proof cleanup by evidence, configured safe production/admin
Twenty non-write env values in Vercel, and kept Twenty webhook delivery
unchanged.

Production CRM posting was not enabled. No real donor, payment, gift, or CRM
records were mutated. No Phase 5 implementation was started.

Final status is blocked on a production/admin `TWENTY_API_KEY` value that can
be supplied only by a safe owner/provider credential path. The staging
`TWENTY_API_KEY` exists in Vercel as a sensitive value, but Vercel does not
materialize it through CLI pull/run output. Twenty UI access confirms existing
keys can be regenerated, but regeneration would disrupt the existing staging
key unless the full rotation chain is deliberately approved.

## Phase 4 Evidence Commit/Push

- Phase 4 evidence file:
  `docs/ops/phase-evidence/2026-05-14_phase-04_twenty-crm-foundation.md`
- Start state: untracked.
- Commit: pending.
- Push status: pending.
- Unrelated working tree changes intentionally excluded:
  - `docs/ai/working-set.md`
  - untracked local agent/tool directories such as `.adal/`, `.augment/`,
    `.claude/`, `.continue/`, `.goose/`, `.roo/`, and similar local config
    folders
  - untracked `skills/stripe-best-practices`, `skills/stripe-projects`, and
    `skills/upgrade-stripe`

## Phase 3 Proof Artifact Cleanup

- Cleanup evidence:
  `docs/ops/phase-evidence/2026-05-14_phase-03-proof-cleanup.md`
- Mode: archive-only.
- Final status: archived-for-audit.
- Known proof marker: `PHASE3_PROOF_DELETE_20260513175115`.
- Known Twenty proof record:
  `f7bd4680-5d66-4d58-b15f-c5d206a706fa`.
- Production data touched: no.

## Production/Admin Twenty Env Setup

Production/admin Vercel project: `asymmetric-al/admin`.

Values set or verified without printing secrets:

- `TWENTY_API_URL`: present in production/admin.
- `TWENTY_WEBHOOK_SECRET`: present in production/admin.
- `TWENTY_API_KEY`: blocked; not present in production/admin.
- `CRM_SYNC_INBOUND_ENABLED`: present as disabled.
- `CRM_SYNC_OUTBOUND_ENABLED`: present as disabled.
- `CRM_SYNC_REPLAY_ENABLED`: present as disabled.
- `CRM_SYNC_RECONCILIATION_ENABLED`: present as disabled.
- `CRM_SYNC_WEBHOOK_TOLERANCE_SECONDS`: present as repo default `300`.

The production/admin `TWENTY_API_KEY` was not set because the existing staging
key is stored as a Vercel sensitive value that is not materialized. The Twenty
UI was checked and shows existing API keys can be regenerated, but regeneration
would interrupt the existing key. Creating a new API key would likely expose a
one-time value in the browser/clipboard workflow, which is not a clean no-leak
credential path in this agent session.

Admin redeployed: pending commit/push deployment.

Vercel readiness: pending final verification.

Secrets printed: no.

## Twenty Webhook Secret Handling

- Webhook secret exposure known: yes.
- Owner declined required rotation solely because it was seen: yes.
- Rotation attempted: no.
- New secret printed: no.
- Vercel updated with current webhook secret: yes.
- Admin redeployed: pending commit/push deployment.
- Signed webhook proof: skipped for production because inbound sync remains
  disabled and no production webhook delivery change was made.
- Old webhook disabled: not applicable.
- Blocking Phase 4/5 solely on rotation: no.
- Residual risk documented: yes.

Twenty UI check:

- Existing webhook list shows `staging-admin.asymmetric.al`.
- No production `admin.asymmetric.al` webhook was created, because adding it
  would start production provider delivery and live write behavior remains
  gated for later owner-approved cutover.

## Verification Commands

Focused CRM tests:

```bash
bun test tests/unit/packages/api/crm-client.test.ts tests/unit/packages/api/crm-client-config.test.ts tests/unit/packages/api/crm-gateway.test.ts tests/unit/packages/api/crm-outbound-sync.test.ts tests/unit/packages/api/crm-webhook-signature.test.ts tests/unit/packages/api/crm-webhook-ingress.test.ts tests/unit/packages/api/crm-gift-summaries-contract.test.ts tests/unit/packages/api/giving-staged-gifts.test.ts tests/unit/packages/api/crm-boundary.test.ts tests/unit/packages/api/crm-notes.test.ts tests/unit/packages/api/crm-relationships.test.ts tests/unit/packages/api/crm-replay-reconciliation.test.ts tests/unit/packages/api/crm-health.test.ts
```

Result: passed, 48 tests.

Full local gate:

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
```

Results:

- `bun run format:check`: passed.
- `bun run lint`: passed, 13 package tasks successful.
- `bun run typecheck`: passed, 13 package tasks successful.
- `bun run build`: passed, 13 package tasks successful.
- `bun run test:unit`: passed, 201 files, 891 tests, 1 skipped.
- `bun run verify:data-boundary`: passed.
- `bun run verify:workspace-contract`: passed.
- `bun run verify:eslint`: passed.
- `bun run verify:shadcn-diff`: passed.
- `bun run skills:verify`: passed.

Post-push Vercel production readiness remains required for the pushed commit:

```bash
bun run verify:vercel-production -- --commit $(git rev-parse HEAD)
```

## Remaining Owner Decisions

- Provide a secure, non-chat path for the existing verified Twenty API key, or
  approve creating a new production API key with a human-controlled secret
  capture path so `TWENTY_API_KEY` can be set in production/admin.
- Keep the current Twenty webhook secret as owner-accepted residual risk, or
  approve a deliberate future rotation with staging and production delivery
  verification.

## Final Status

blocked-provider-access
