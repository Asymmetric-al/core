# Plan 002: Redact Stripe IDs in the POST /actions result

## Status
- **Priority**: P1 — **Effort**: S — **Risk**: LOW — **Depends on**: none
- **Category**: security — **Planned at**: commit `36cc941b`, 2026-06-12

## Why this matters
`GET /api/admin/contribution-operations/[id]` redacts Stripe `paymentIntentId`/
`chargeId` for viewers lacking `contributions.use_provider_actions`
(ADR-CD-014, via `projectContributionDetailForViewer`). The `POST /actions`
handler returns `result.canonicalContribution` with **no** projection. A
donor-care "staff" user (role `staff`, not finance) can invoke the low-risk
`resend_receipt` action — `assertActorPermissions` returns early because the
action's `requiredPermission` is null — and receive the unredacted Stripe
identifiers the GET endpoint would have nulled. That is a role-gating bypass on
payment-provider data.

The correction-decision endpoint shares the shape but is **not** a leak today:
every caller who reaches its result already holds `contributions.approve_corrections`,
which only exists in the capability tier that also grants `use_provider_actions`.
Project it anyway for consistency/defense-in-depth.

## Current state (verified at 36cc941b)
- `packages/api/src/admin/contribution-operations/route.ts:100-105` GET applies the projection; `:143` POST returns `{ result, requestId }` unprojected; `:196-201` decision returns `{ result }` unprojected.
- `projectContributionDetailForViewer(detail, capabilities)` and `resolveContributionCapabilities(auth)` are already imported in `route.ts`.
- `result.canonicalContribution` is the full `ContributionDetail` (`actions.ts` `loadCanonicalContribution`) with unredacted `payment.stripe`.
- The projection only mutates `payment.stripe`, `recurring.agreement.stripeSubscriptionId`, `actionAvailability` (stripe_replay), and adds `providerProof` — it is safe to apply to the action result.

## Scope
**In scope**: `packages/api/src/admin/contribution-operations/route.ts`; a new test in `tests/unit/apps/admin/app/contribution-canonical-route.test.ts` or a focused new file.
**Out of scope**: the action executor, the projection logic itself, the GET handler.

## Steps
1. Add a small helper in `route.ts` that, given `result` and `auth`, returns the result with `canonicalContribution` replaced by `projectContributionDetailForViewer(result.canonicalContribution, resolveContributionCapabilities(auth))` (guard for null/absent canonicalContribution).
2. Apply it in POST before `NextResponse.json` and in POST_CORRECTION_REQUEST_DECISION's `result`.
3. Add a test: a low-capability (donor-care) actor POSTing `resend_receipt` receives a result whose `canonicalContribution.payment.stripe.paymentIntentId` / `chargeId` are null; a provider-capable actor receives them populated.

## Verify / Done criteria
- New test passes; existing `contribution-operations-actions` and route tests stay green.
- `bunx turbo run lint typecheck --filter=@asym/api --filter=@asym/admin` exits 0.

## STOP conditions
- The projection changes a field the action result's consumers depend on beyond `payment.stripe` (it should not).
