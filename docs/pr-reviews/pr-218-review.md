# PR #218 Review - Add Mission Control Payouts Phase 0 and 1 foundation

- URL: https://github.com/Asymmetric-al/core/pull/218
- Base: `epic`
- Head: `payout-phase0-docs`
- Draft: no
- GitHub state at review: `DIRTY`, `REVIEW_REQUIRED`
- Size: 14 changed files, +1,969 / -0
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/epic`: failed.

Conflict:

- `docs/ai/working-set.md`

Tests were not run because the PR does not produce a merged tree against current `epic`.

## Verdict

Do not merge until the conflict is resolved and the payout env/config boundary is tightened.

## Findings

### P1 - Current branch cannot merge into `epic`

Impact: no reliable local gate can be run on the final merge result.

Suggested fix:

- Rebase or merge current `epic`.
- Resolve `docs/ai/working-set.md`.
- Re-run `bun install --frozen-lockfile && bun run ci:preflight`.

### P1 - Payout env config is resolved at module import time and re-exported broadly

Evidence: `packages/config/payouts.ts` exports `payoutFeatureConfig = resolvePayoutFeatureConfig()` at module load around line 121, and `packages/config/index.ts` re-exports `./payouts`.

Impact: shared/client consumers can import a server-sensitive feature config after all server-only env flags resolve false. That can create environment-dependent behavior that looks disabled even when server env is configured.

Suggested fix:

- Remove the module-level resolved constant from shared barrels.
- Prefer a server-only call site: `resolvePayoutFeatureConfig(env)`.
- If a shared type is needed, export types only from the shared barrel.
- Add a test that proves server env is read only in server/config code.

### P2 - Test fixture uses keys outside the declared env contract

Evidence: `tests/unit/packages/config/payouts.test.ts` line 75 passes object literals with keys such as `WISE_API_TOKEN` and `PAYOUTS_PROVIDER_SECRET` that are not in `PayoutFeatureEnv`.

Impact: the test weakens the type-level contract and can hide drift between docs, env schema, and resolver.

Suggested fix:

- Use `satisfies Record<string, string | undefined>` if arbitrary env is intentional.
- Or update `PayoutFeatureEnv` to include the exact supported keys.

### P2 - Webhook status mapping docs need more provider detail

Impact: Phase 0/1 docs are intended as implementation contracts. Airwallex cancellation and funding states are not detailed enough to prevent follow-up ambiguity.

Suggested fix:

- Add a provider-state table for Wise and Airwallex.
- Include cancellation, funding, failed, returned, and completed transitions.

### P2 - External v7 payout spec is referenced without a local source of truth

Impact: future implementers may not have access to the external spec or may use the wrong revision.

Suggested fix:

- Add a local summary of the relevant v7 decisions.
- Link to the external source as supporting context, not the only authority.

## Required Before Merge

- Resolve conflict.
- Fix server-only payout config resolution.
- Tighten env-contract tests and provider-state docs.
- Run full preflight on the resolved merge tree.
