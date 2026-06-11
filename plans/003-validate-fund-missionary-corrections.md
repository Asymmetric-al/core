# Plan 003: Validate fund/missionary IDs in corrections

## Status
- **Priority**: P1 — **Effort**: M — **Risk**: MED — **Depends on**: none
- **Category**: bug — **Planned at**: commit `36cc941b`, 2026-06-12

## Why this matters
`fund_correction`, `designation_correction`, and `allocation_correction` write
operator-supplied fund/missionary IDs into `contribution_adjustments.effective_values`
with **no** existence or tenant check (`correctionEffectiveValues` only
type-checks the string). `amount_correction` validates non-negative and
`payment_state_correction` validates against an allowlist — these do not. The id
comes from a free-text "Destination fund ID" input. A bogus or cross-tenant fund
id becomes part of the gift's effective financial truth, flowing into effective
values, the designation read model (which silently falls back to "General Fund"),
receipts, and CRM posting, with no later guard. Corrections are supposed to never
corrupt financial truth.

## Current state (verified at 36cc941b)
- `packages/api/src/admin/contribution-operations/operations.ts:159-235` `correctionEffectiveValues`: `:175-177` fund/designation returns `{ fundId: typeof fundId === "string" ? fundId : null }`; `:204` allocation line `record.fundId` unvalidated; `:218-219` allocation fallback `fundId`/`missionaryId` unvalidated.
- `applyContributionCorrection` (`operations.ts:402+`) inserts `effective_values: effectiveValues` into `contribution_adjustments` (`:466-481`).
- Exemplar tenant-scoped guard to mirror: `relinkContributionDonor` (`operations.ts:567+`) loads the donor with `.eq("tenant_id", ...)` and 404s on mismatch.
- `funds` and `missionaries` are tenant-scoped tables (`funds.tenant_id`, `missionaries` via tenant). Follow `docs/ai/skills/supabase-postgres-best-practices/SKILL.md` for the lookup (select id only, `.in("id", ids).eq("tenant_id", tenantId)`).

## Scope
**In scope**: `operations.ts` (add a tenant-scoped fund/missionary resolver and call it in `applyContributionCorrection` before the insert); a new/extended test in `tests/unit/packages/api/admin/contribution-adjustment-operations.test.ts`.
**Out of scope**: the operation-shell free-text input (a real fund picker is a separate direction item), `amount_correction`/`payment_state_correction`.

## Steps
1. Add a helper that collects every non-null `fundId` and `missionaryId` referenced by the `effectiveValues` (top-level + each designation line), queries `funds`/`missionaries` scoped to `tenantId`, and throws `ApiHttpError(400, ...)` listing any that do not exist for the tenant. `null` is allowed (clears a designation).
2. Call it in `applyContributionCorrection` after `correctionEffectiveValues` and before the `contribution_adjustments` insert. Do the lookup only when there is at least one id to check (skip a round-trip otherwise).
3. Tests: (a) `fund_correction` with a fund id that exists for the tenant → applies; (b) with an unknown/cross-tenant id → 400, no adjustment row inserted; (c) `allocation_correction` with one valid + one invalid line id → 400; (d) `null` fundId still clears.

## Verify / Done criteria
- New tests pass; existing adjustment-operations tests stay green.
- `bunx turbo run lint typecheck --filter=@asym/api` exits 0.

## STOP conditions
- The `missionaries` table is not tenant-scoped the way assumed (verify the column before filtering); if so, scope only `funds` and note the gap.
- A correction legitimately needs to reference a fund created in the same request (it does not — funds pre-exist).

## Maintenance note
When a real fund-picker replaces the free-text input, this server guard stays as
defense-in-depth. Optional consistency add (folded here): `crm/detail/service.ts`
`donor_pledges` query can also gain `.eq("tenant_id", ...)` — defense-in-depth only.
