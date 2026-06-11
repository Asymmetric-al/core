# Plan 002: Stop stranding failed Stripe events and protect pledge state integrity

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 1b2afd5a..HEAD -- packages/api/src/workflows/functions/stripe-event-processing.ts packages/api/src/workflows/adapters packages/api/src/workflows/serve.ts packages/api/src/stripe/recurring.ts packages/env/src/schema.ts tests/unit/packages/api`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (touches payment-event recovery; all changes additive + guarded)
- **Depends on**: none (001 can land in either order)
- **Category**: bug
- **Planned at**: commit `1b2afd5a`, 2026-06-12

## Why this matters

Four verified defects around Stripe event handling on this branch:

1. **One transient failure permanently strands a payment event.** The
   `stripe-event-processing` Inngest function treats `claimed:false` as terminal
   success, but the DB claim RPC refuses claims for `failed` events still inside
   their 60-second `next_attempt_at` backoff — and Inngest's first retry fires at
   ~15–45s, *always* inside that window. The run completes "skipped", retries
   stop, Stripe already got a 200, and nothing ever re-claims the event.
2. **No automated re-driver exists for `failed` stripe_raw_events.** The dispatch
   recovery scan only repairs LEDGER handoffs (the ledger row is already
   `dispatched`). Only the manual staff replay route remains.
3. **A keyless/Inngest-down deploy silently stalls payments.** `INNGEST_EVENT_KEY`
   / `INNGEST_SIGNING_KEY` are optional in the env schema, the webhook ACKs 200
   with `dispatch:'failed'`, and the recovery scan itself runs ON Inngest.
4. **Out-of-order `invoice.paid` reactivates cancelled pledges**, and on Stripe
   API version `2025-03-31.basil`+ webhook endpoints, `invoice.subscription` no
   longer exists (moved to `invoice.parent.subscription_details`), so all
   recurring lifecycle events get recorded "ignored".

## Current state

- `packages/api/src/workflows/functions/stripe-event-processing.ts` (~line 57):

  ```ts
  const claim = await claimStripeRawEvent({ supabaseAdmin, rawEventId });
  if (!claim.claimed) {
    return { action: "stripe_event_already_claimed", handled: true, skipped: true,
             processingStatus: claim.rawEvent.processingStatus };
  }
  ```

- `supabase/migrations/20260512190000_phase_03_giving_pipeline.sql` (~lines
  258–272): `claim_stripe_raw_event` claims only when
  `processing_status IN ('received','failed') AND next_attempt_at <= NOW()`.
  `record_stripe_raw_event_failure` sets `next_attempt_at = NOW() + 60s` and
  dead-letters after a threshold (read the RPC for the exact column names).
- `packages/api/src/workflows/adapters/donations.ts` — `runDonationSagaRecoveryScan`
  is the established "scan due product rows → dispatch one event per row through
  the ledger with attempt-scoped idempotency keys" pattern. **Model the new
  Stripe scanner on it.**
- `packages/api/src/workflows/functions/donation-saga-recovery.ts` — contains
  the matching cron function pattern (`donationSagaRecoveryScan`, cron
  `*/2 * * * *`, single concurrency).
- `packages/api/src/workflows/serve.ts` — functions array where every Inngest
  function must be registered.
- `packages/api/src/stripe/recurring.ts`:
  - `updateInvoicePledge` (~lines 164–178) patches `status: "active"`
    unconditionally on `outcome === "paid"`; `pledge.status` is selected but
    never consulted.
  - `getInvoiceSubscriptionId` (~lines 121–134) reads only
    `invoice.subscription`.
- `packages/env/src/schema.ts` (~lines 133–150): `INNGEST_EVENT_KEY` is
  `z.string().min(1).optional()` and `INNGEST_SIGNING_KEY` is optional with a
  `signkey-` prefix refine. The file defines `requireInProtectedDeployments(name)`
  (~line 52) used by `STRIPE_SECRET_KEY` etc. — that is the repo's mechanism for
  "must be set in staging/production".
- Event name constants live in `packages/api/src/workflows/events.ts`
  (`STRIPE_EVENT_PROCESS_EVENT = "giving/stripe-event.process.requested"`).
- Inngest v4 exports `RetryAfterError` from `"inngest"` — throwing it fails the
  current attempt and schedules the next retry no sooner than the given
  duration/date, without counting classes of backoff guesswork.

## Commands you will need

| Purpose       | Command                                                                                                                                  | Expected on success |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Install       | `bun install`                                                                                                                                | exit 0              |
| Focused tests | `bunx vitest run tests/unit/packages/api/workflows/stripe-event-workflow.test.ts tests/unit/packages/api/stripe-recurring-pledges.test.ts` | all pass            |
| All workflows | `bunx vitest run tests/unit/packages/api/workflows`                                                                                         | all pass            |
| Typecheck     | `bunx turbo run typecheck --filter=@asym/api --filter=@asym/env`                                                                            | exit 0              |
| Lint          | `bunx turbo run lint --filter=@asym/api`                                                                                                    | exit 0              |

## Scope

**In scope** (the only files you should modify/create):

- `packages/api/src/workflows/functions/stripe-event-processing.ts`
- `packages/api/src/workflows/adapters/stripe-events.ts` (create — the scanner)
- `packages/api/src/workflows/serve.ts` (register the new cron function)
- `packages/api/src/stripe/recurring.ts`
- `packages/env/src/schema.ts`
- `tests/unit/packages/api/workflows/stripe-event-workflow.test.ts`
- `tests/unit/packages/api/stripe-recurring-pledges.test.ts`
- `tests/unit/packages/api/workflows/stripe-event-recovery-scan.test.ts` (create)

**Out of scope** (do NOT touch):

- `packages/api/src/stripe/webhooks.ts` — the ACK-after-storage contract is by
  design (OpenSpec change `add-inngest-durable-workflow-executor`); the inline
  fallback dual-path is addressed separately in Plan 004's notes.
- `supabase/migrations/*` — no schema changes; the claim RPC semantics are
  correct, the consumer must respect them.
- `packages/api/src/stripe/event-store.ts`, `packages/api/src/donate/**`.

## Git workflow

- Current branch `claude/inngest-durable-workflow-executor`; conventional
  commits (e.g. `fix(workflows): retry stripe claims after backoff and add failed-event recovery scan`).
- Do NOT push unless the operator instructed it.

## Steps

### Step 1: Respect the claim backoff in `stripe-event-processing`

In `packages/api/src/workflows/functions/stripe-event-processing.ts`, change the
`!claim.claimed` branch: when `claim.rawEvent.processingStatus` is `"failed"` or
`"received"` (claim refused only because `next_attempt_at` has not elapsed),
throw `new RetryAfterError("stripe_event_claim_backoff", "70s")` instead of
returning a skip result. Keep the skip result for genuinely terminal/owned
states (`"processing"`, `"processed"`, `"ignored"`, `"dead_letter"`). Import
`RetryAfterError` from `"inngest"`.

**Verify**: `bunx vitest run tests/unit/packages/api/workflows/stripe-event-workflow.test.ts` → the existing "skips work when the stored event is already claimed elsewhere" test still passes (its mock uses `processingStatus: "processed"`).

### Step 2: Add the failed-Stripe-event recovery scan adapter

Create `packages/api/src/workflows/adapters/stripe-events.ts` modeled directly on
`packages/api/src/workflows/adapters/donations.ts` (same structure: a
`requestStripeEventRecoveryDispatch(deps, { tenantId, rawEventId, attempts })`
wrapper around `requestWorkflowDispatch`, and a
`runStripeEventRecoveryScan(deps, options)` that:

- selects `id, tenant_id, process_attempts` from `stripe_raw_events` where
  `processing_status = 'failed'` and `next_attempt_at <= now` and
  `tenant_id is not null`, ordered by `next_attempt_at`, limit 25
  (use `.eq("processing_status", "failed")` — do NOT include 'received': those
  are pre-claim rows the webhook already dispatched);
- dispatches `STRIPE_EVENT_PROCESS_EVENT` per row with `productArea: "giving"`,
  `subject: { type: "stripe_raw_event", id: row.id }`, and idempotency key
  `` `stripe-event-recovery/${row.id}/attempt-${row.process_attempts}` `` —
  attempt-scoped so later failures get a fresh handoff while duplicate scanner
  ticks reuse one;
- returns `{ scanned, dispatched, failed, alreadyDispatched }` like the donations
  scanner.

Then add a cron function `stripeEventRecoveryScan` in the SAME new adapter's
sibling pattern — put it in
`packages/api/src/workflows/functions/stripe-event-processing.ts` next to the
existing function (mirroring how `donation-saga-recovery.ts` holds both):
`id: "stripe-event-recovery-scan"`, `triggers: [{ cron: "*/2 * * * *" }]`,
`retries: 2`, `concurrency: [{ limit: 1 }]`, one step running
`runStripeEventRecoveryScan({ client })` with the admin client (copy the
`getAdminClient` unwrap used by `donationSagaRecoveryScan`).

Register `stripeEventRecoveryScan` in the `functions` array of
`packages/api/src/workflows/serve.ts`.

**Verify**: `bunx turbo run typecheck --filter=@asym/api` → exit 0.

### Step 3: Guard pledge status transitions and add the basil fallback

In `packages/api/src/stripe/recurring.ts`:

1. `updateInvoicePledge`, `outcome === "paid"` branch: build the patch without
   `status`, then only include `status: "active"` when
   `pledge.status !== "cancelled"`. (Counters — `payments_completed`,
   `failed_charge_count: 0`, `last_charge_at` — still update either way; a
   cancelled pledge keeps its `cancelled` status.)
2. `getInvoiceSubscriptionId`: after the existing two checks, add a fallback for
   newer API shapes:

   ```ts
   const parent = (invoice as { parent?: { subscription_details?: { subscription?: string | { id?: string } } } }).parent;
   const parentSub = parent?.subscription_details?.subscription;
   if (typeof parentSub === "string" && parentSub.length > 0) return parentSub;
   if (parentSub && typeof parentSub === "object" && typeof parentSub.id === "string") return parentSub.id;
   ```

   (The cast is required because the pinned `stripe@17` types predate the basil
   shape; keep it local to this function with a comment naming API version
   `2025-03-31.basil` as the reason.)

**Verify**: `bunx vitest run tests/unit/packages/api/stripe-recurring-pledges.test.ts` → all existing tests pass.

### Step 4: Require Inngest keys in protected deployments

In `packages/env/src/schema.ts`, change `INNGEST_EVENT_KEY` and
`INNGEST_SIGNING_KEY` from plain optional to
`requireInProtectedDeployments("INNGEST_EVENT_KEY")` (keep the existing
`signkey-` prefix refine on the signing key by chaining `.refine(...)` exactly
like `STRIPE_WEBHOOK_SECRET` does at ~line 127). Leave
`INNGEST_SIGNING_KEY_FALLBACK`, `INNGEST_DEV`, `INNGEST_BASE_URL` as-is.
This makes a keyless production deploy fail env validation instead of silently
ACKing-and-stranding payment events.

**Verify**: `bunx turbo run typecheck --filter=@asym/env` → exit 0. Then `bunx vitest run tests/unit/packages` → all pass (the unit-env fixture sets `SKIP_ENV_VALIDATION=1`, so tests are unaffected — if any test fails on env validation, STOP).

### Step 5: New tests

1. In `tests/unit/packages/api/workflows/stripe-event-workflow.test.ts` add:
   - "retries after the claim backoff instead of completing": claim mock
     resolves `{ claimed: false, rawEvent: storedEvent({ processingStatus: "failed" }) }`
     → `engine.execute(...)` returns a defined `error` (the RetryAfterError
     surfaces as a failed attempt in the test engine), and
     `completeStripeRawEventMock` was not called.
2. Create `tests/unit/packages/api/workflows/stripe-event-recovery-scan.test.ts`
   modeled on `tests/unit/packages/api/workflows/donation-saga-recovery.test.ts`
   (the scan describe-block): one test that two failed rows produce two
   dispatches with attempt-scoped idempotency keys
   (`stripe-event-recovery/<id>/attempt-<n>`), and one test that dispatch
   failures are counted without aborting the scan.
3. In `tests/unit/packages/api/stripe-recurring-pledges.test.ts` add:
   - "never reactivates a cancelled pledge": pledge row
     `{ status: "cancelled", ... }`, `outcome: "paid"` → the update payload has
     NO `status` key (assert `mock.updates[0]?.values.status` is undefined) while
     `payments_completed` still increments.
   - "resolves the subscription id from basil-shaped invoices": invoice
     `{ id, parent: { subscription_details: { subscription: "sub_basil" } } }`
     → pledge lookup called with `"sub_basil"`.

**Verify**: `bunx vitest run tests/unit/packages/api/workflows tests/unit/packages/api/stripe-recurring-pledges.test.ts` → all pass including 5 new tests.

## Test plan

See Step 5. Structural patterns: `stripe-event-workflow.test.ts` (InngestTestEngine
+ hoisted module mocks) and `donation-saga-recovery.test.ts` (scanner client mock).

## Done criteria

- [ ] `bunx vitest run tests/unit/packages/api/workflows tests/unit/packages/api/stripe-recurring-pledges.test.ts` exits 0; ≥5 new tests present
- [ ] `grep -n "RetryAfterError" packages/api/src/workflows/functions/stripe-event-processing.ts` returns ≥1 match
- [ ] `grep -n "stripe-event-recovery-scan" packages/api/src/workflows/serve.ts packages/api/src/workflows/functions/stripe-event-processing.ts` shows the function registered
- [ ] `grep -n "requireInProtectedDeployments(\"INNGEST_EVENT_KEY\")" packages/env/src/schema.ts` returns 1 match
- [ ] `bunx turbo run typecheck --filter=@asym/api --filter=@asym/env` exits 0
- [ ] `bun run format:check` exits 0; no files outside scope modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `claim_stripe_raw_event` in migration 20260512190000 does NOT gate on
  `next_attempt_at` (the premise of Step 1 would be wrong).
- `RetryAfterError` is not exported by the installed `inngest@4.5.1`
  (check `node_modules/inngest` exports; if absent, report — do not emulate
  with sleeps).
- The InngestTestEngine cannot represent RetryAfterError (test hangs or loops);
  cap the test with the engine's step-mock facility instead, and report the
  limitation in the plan status.
- Making INNGEST keys required breaks `bun run build` in this sandbox (build
  treats it as protected deployment) — report instead of weakening validation.

## Maintenance notes

- The 70s retry-after slightly exceeds the RPC's 60s backoff on purpose; if the
  RPC's `p_retry_delay_seconds` changes, update both.
- The new scanner gives `failed` Stripe events the same recovery story as
  donation saga rows; dead-lettering still comes from the event-store RPC
  threshold. Mission Control summaries already map `dead_letter` → urgent.
- Inngest-down remains a real failure mode for *dispatch* (mitigated by required
  keys + ledger dead-letter visibility); a non-Inngest watchdog (e.g. pg_cron or
  external uptime check on `/api/inngest`) is deliberately deferred — see
  plans/README "considered and rejected".
