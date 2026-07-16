# Phase 4 Follow-Up Evidence

> **Note (2026-07-06):** Twenty CRM has since been retired (ADR-0001); this
> file records the state as of its date.

Generated: 2026-05-14T10:16:00Z
Repo: Asymmetric-al/core
Branch: production
Commit: 691afecd98e5bc8e089da237bacd168dce8f87b9

## Summary

Phase 4 implementation and evidence were still local at the start of this
follow-up. This pass prepared the Phase 4/follow-up evidence for commit,
archived Phase 3 proof cleanup by evidence, configured safe production/admin
Twenty env values in Vercel without enabling writes, and kept Twenty webhook
delivery unchanged.

Production CRM posting was not enabled. No real donor, payment, gift, or CRM
records were mutated. No Phase 5 implementation was started.

Final status is complete-with-owner-accepted-risk. The production/admin
`TWENTY_API_KEY` was configured by adding the existing Vercel sensitive development
env entry to the Production target through a metadata-only Vercel API edit. The
secret value was not read, printed, copied, or regenerated, and the development
custom-environment association was preserved.

## Phase 4 Evidence Commit/Push

- Phase 4 evidence file:
  `docs/ops/phase-evidence/2026-05-14_phase-04_twenty-crm-foundation.md`
- Start state: untracked.
- Commit: `691afecd98e5bc8e089da237bacd168dce8f87b9`.
- Push status: pushed to `origin/production`; local branch is even with upstream.
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
- `TWENTY_API_KEY`: present in production/admin and development as the same Vercel
  sensitive env entry.
- `CRM_SYNC_INBOUND_ENABLED`: present as disabled.
- `CRM_SYNC_OUTBOUND_ENABLED`: present as disabled.
- `CRM_SYNC_REPLAY_ENABLED`: present as disabled.
- `CRM_SYNC_RECONCILIATION_ENABLED`: present as disabled.
- `CRM_SYNC_WEBHOOK_TOLERANCE_SECONDS`: present as repo default `300`.

The production/admin `TWENTY_API_KEY` was set without reading the secret value.
Vercel CLI/API checks showed the development value is a `sensitive` env entry whose
decrypted value is not retrievable after creation. A temporary dummy env var
proved Vercel accepts metadata-only target edits without sending a value. The
same metadata-only edit was then applied to `TWENTY_API_KEY`, preserving development
and adding Production targeting.

Admin redeployed: yes. Earlier production deployment
`admin-63lfru8mf-asymmetric-al.vercel.app` was `READY` for commit
`691afecd98e5bc8e089da237bacd168dce8f87b9`; the final evidence update push
will trigger the final production deployment for the current commit.

Vercel readiness: passed for admin, donor, and missionary production
deployments on commit `691afecd98e5bc8e089da237bacd168dce8f87b9`. Re-run the
same readiness command after the final evidence commit push.

Secrets printed: no.

## Twenty Webhook Secret Handling

- Webhook secret exposure known: yes.
- Owner declined required rotation solely because it was seen: yes.
- Rotation attempted: no.
- New secret printed: no.
- Vercel updated with current webhook secret: yes.
- Admin redeployed: yes.
- Signed webhook proof: skipped for production because inbound sync remains
  disabled and no production webhook delivery change was made.
- Old webhook disabled: not applicable.
- Blocking Phase 4/5 solely on rotation: no.
- Residual risk documented: yes.

Twenty UI check:

- Existing webhook list shows `development-admin.asymmetric.al`.
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

Post-push Vercel production readiness:

```bash
bun run verify:vercel-production -- --commit 691afecd98e5bc8e089da237bacd168dce8f87b9
```

Result: passed. Admin, donor, and missionary production deployments were
`READY` for the pushed commit and each live `/api/health` endpoint returned
HTTP 200.

## Remaining Owner Decisions

- Keep the current Twenty webhook secret as owner-accepted residual risk, or
  approve a deliberate future rotation with development and production delivery
  verification.

## Final Status

complete-with-owner-accepted-risk
