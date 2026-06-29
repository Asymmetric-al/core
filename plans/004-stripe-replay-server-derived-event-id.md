# Plan 004: Make inline stripe_replay derive its event id server-side

## Status

- **Priority**: P2 — **Effort**: M — **Risk**: LOW — **Depends on**: none
- **Category**: bug — **Planned at**: commit `36cc941b`, 2026-06-12

## Why this matters

The inline operation shell offers "Replay provider webhook" (`stripe_replay`),
but its `buildPayload` returns `{}` and it has no field to collect a Stripe
event id. The server dependency `replayStripeEvent` reads `payload.stripeEventId`
and throws `ApiHttpError(400, "stripeEventId is required.")` when absent. So an
authorized admin who clicks the inline action always gets a 400 — the affordance
is non-functional. The dedicated batch replay path passes `stripeEventId`
explicitly, so the contract is satisfiable; only the inline shell omits it.

Best practice: do not make the client carry a Stripe event id. Derive the
replayable event server-side from the contribution's stored raw event.

## Current state (verified at 36cc941b)

- `apps/admin/app/contributions/operation-shell.tsx:165-178` `stripe_replay`: `fields: []`, `buildPayload: () => ({})`.
- `packages/api/src/admin/contribution-operations/dependencies.ts:70-85` `replayStripeEvent`: requires `payload.stripeEventId`, else 400; calls `replayStripeEventThroughContributionOperations({ supabaseAdmin, tenantId, stripeEventId })`.
- `packages/api/src/admin/contribution-operations/operations.ts:598-609` `replayStripeEventThroughContributionOperations` takes `stripeEventId`, loads + marks the raw event.
- `actions.ts:565-574` passes `contributionId` and `tenantId` to the dependency already.
- `stripe_raw_events` has a `donation_id` column (per `stripe/replay.ts`), so a latest-event-by-donation lookup is possible.

## Scope

**In scope**: the replay dependency/operation to accept a contribution id and resolve the event id when none is supplied; the inline `buildPayload` stays `{}` (server derives). A test in `tests/unit/packages/api/admin/contribution-operations-actions.test.ts` (or the operations test) proving inline replay no longer 400s when a stored event exists, and a clear "no replayable event" error when none exists.
**Out of scope**: the dedicated batch replay route (must keep passing `stripeEventId` and working unchanged).

## Steps

1. Add a server resolver: given `tenantId` + `contributionId`, find the most recent `stripe_raw_events` row by `donation_id` + `tenant_id` and return its event id; return null if none.
2. In the `replayStripeEvent` dependency, when `payload.stripeEventId` is absent, fall back to the resolver using the contribution id; if still none, throw a clear `ApiHttpError(404/422, "No stored provider event to replay for this gift.")`. Keep honoring an explicit `stripeEventId` for the batch path.
3. Test: inline replay (empty payload) with a stored event → succeeds (queued_for_replay); with no stored event → the new explicit error, not the generic "stripeEventId is required".

## Verify / Done criteria

- New test passes; existing replay/batch tests stay green.
- `bunx turbo run lint typecheck --filter=@asym/api --filter=@asym/admin` exits 0.

## STOP conditions

- `stripe_raw_events` does not actually carry `donation_id`/`tenant_id` (verify before writing the query). If it links via a different key, adjust the resolver or, if no link exists, **remove `stripe_replay` from the inline OPERATION_DEFINITIONS** instead (a webhook replay belongs in the provider proof drawer, not inline) and document that as the chosen fix.
