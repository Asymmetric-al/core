# Donation Saga Outbox Operations

## Purpose

This runbook documents the Stripe donation saga/outbox flow used by `POST /api/donate`, `POST /api/donations`, GraphQL `createDonation`, and the admin outbox processor endpoint `POST /api/donate/outbox`.

The goal is to keep all database mutations transactional while coordinating cross-system side effects (Stripe customer + PaymentIntent creation) with retries and dead-letter handling.

## Flow Summary

1. Donation entry points validate input and start the DB transaction via `begin_donation_saga`.
2. `begin_donation_saga` atomically:
   - creates/reuses donor
   - inserts a donation row (`status=processing`)
   - inserts transactional audit log (`donation_initiated`)
   - enqueues one row in `donation_saga_outbox`
3. `POST /api/donate` and `POST /api/donations` attempt immediate processing via `processDonationSagaOutboxEvent`.
4. GraphQL `createDonation` currently enqueues saga work and returns the donation; side-effect processing is handled by the outbox worker.
5. If immediate processing does not finish, outbox processing continues through `POST /api/donate/outbox`.

## Guest Giving charged amount

Guest Giving `POST /api/donate` treats `amount` as the donor-entered gift in
dollars. Gift processing-fee policy recomputes charged cents from `cover_fees`
and `payment_method` before `begin_donation_saga`. `p_amount` is still charged
cents.

First-shot processing from that POST may attach quote extras to PaymentIntent
metadata (`gift_amount_cents`, `cover_fees`, `payment_method`,
`cover_amount_cents`, `estimated_fee_cents`) without overriding `donation_id`.

Recovery and batch workers (`processDueDonationSagaOutboxEvents`, admin
replay) may create a first-shot PaymentIntent without those extras. That is
acceptable: charged cents already live in `p_amount`. Do not treat missing fee
metadata on a recovered intent as a failed donation.

Gift intake is USD-only. Non-USD `currency` values fail validation before
`begin_donation_saga`. First-shot Gift intake binds the PaymentIntent to the
quoted method (`card`/`wallet` → `payment_method_types: ["card"]`, `ach` →
`["us_bank_account"]`). Recovery and batch workers without extras keep
`automatic_payment_methods`.

On idempotent replay (`begin_donation_saga.replayed`), Gift intake loads the
stored `donations.amount` and:

- returns `409` when it does not match the recomputed charged cents
- processes the existing outbox without attaching a new fee-quote extra

Verification:

1. POST the same idempotency key with a different charged amount → `409`.
2. POST the same key with matching charged cents → `200` and no new fee extras.
3. POST `currency=eur` → `400` before `begin_donation_saga`.
4. First-shot card Gift PaymentIntents use `payment_method_types: ["card"]`
   and omit `automatic_payment_methods`.

Staff `POST /api/donations` does not run Gift processing-fee policy. That path
already sends charged cents as `p_amount`.

## Outbox State Model

`donation_saga_outbox.status` values:

- `pending`: ready to process
- `processing`: currently locked by a worker
- `failed`: temporary failure, retry scheduled
- `completed`: Stripe side effects successfully applied
- `dead_letter`: terminal failure after max retries

Related donation status transitions:

- `processing` -> `pending` on successful Stripe PaymentIntent creation
- `processing`/`pending` -> `failed` when moved to dead letter

## Idempotency

- Caller idempotency key is required and read from `idempotency-key` / `x-idempotency-key`.
- Requests missing an idempotency key fail with `400`.
- `begin_donation_saga` enforces idempotency through:
  - advisory transaction lock by key
  - unique `donation_saga_outbox.idempotency_key`
  - replay response with existing `outbox_id`/`donation_id`
- Stripe side effects are idempotent per saga key:
  - customer creation uses `<idempotencyKey>:customer`
  - PaymentIntent creation uses `<idempotencyKey>:payment_intent`

## Stripe API Version

Server-side Stripe clients use the shared `STRIPE_API_VERSION` pin in
`packages/api/src/stripe/api-version.ts`. When upgrading the Stripe SDK, confirm
the Stripe Dashboard account default and production webhook endpoint API version
match the repo pin before deploying.

Pre-deploy checklist for Stripe API-version changes:

- Confirm the Stripe Dashboard account default API version matches the repo pin.
- Confirm the production webhook endpoint API version matches the repo pin.
- Run a staging donor checkout payment end-to-end.
- Replay one test/staging donation saga outbox row from the admin contribution
  replay tooling before using replay against production data.
- Verify the billing portal opens for a donor with a Stripe customer.
- Deliver a signed Stripe webhook smoke event and confirm duplicate delivery is
  ignored rather than reprocessed.

## Admin contribution replay

`POST /api/admin/contributions/replay` (staff/admin) can replay one target at a
time: a stored Stripe raw event, a donation saga outbox row, a staged gift, or a
receipt send log.

Stripe clients created for replay use the shared `createStripeClient` factory and
therefore the repo pin (`STRIPE_API_VERSION`, currently `2026-05-27.dahlia`).

- **Donation saga outbox replay** (`donationSagaOutboxId`): calls
  `processDonationSagaOutboxEvent` with a live Stripe client. Customer and
  PaymentIntent creation run against Stripe at the pinned API version. Use only
  in staging or after validating one row in a lower environment.
- **Stripe raw event replay** (`stripeEventId`): re-processes the stored webhook
  payload through `handleStripeWebhookEvent`. It does not re-fetch the event from
  Stripe; side effects depend on the stored JSON and current DB idempotency
  guards (for example `claim_stripe_raw_event`).

Before replaying production rows after an API-version bump, complete the
pre-deploy checklist above and confirm Dashboard + webhook endpoint versions
match the repo pin.

## Processing Endpoints

### Donor request path

- `POST /api/donate`
- Starts saga and attempts immediate processing.
- Returns:
  - `200` with `clientSecret` + `paymentIntentId` when completed
  - `202` when still processing
  - `4xx/5xx` on validation or terminal error

### Admin/staff backfill path

- `POST /api/donate/outbox?limit=<n>`
- Requires role: `admin | staff | super_admin`
- Claims due outbox rows in one DB call using `claim_due_donation_saga_events(p_limit, p_lock_id)`, then processes each claimed row.
- Use for scheduled retries and operational catch-up.

## Retry and Dead-Letter Behavior

- Failure recording is done through `record_donation_saga_failure`.
- Retry delay defaults to 60 seconds.
- Dead-letter threshold defaults to 5 attempts.
- On dead-letter transition:
  - donation row is marked `failed`
  - audit log `donation_failed` is written transactionally

## Recommended Scheduler

Use a secure internal scheduler to call:

- `POST /api/donate/outbox?limit=25`
- interval: every 1-2 minutes

Run with an account that has `admin`/`staff` role in each tenant context used for processing.

## Monitoring Queries

Pending/failed backlog:

```sql
select status, count(*)
from public.donation_saga_outbox
group by status
order by status;
```

Stale processing rows:

```sql
select id, donation_id, processor_locked_at, attempt_count
from public.donation_saga_outbox
where status = 'processing'
order by processor_locked_at asc;
```

Dead-letter rows:

```sql
select id, donation_id, attempt_count, last_error_code, last_error_message, updated_at
from public.donation_saga_outbox
where status = 'dead_letter'
order by updated_at desc;
```

## Manual Recovery Steps

1. Inspect outbox row + donation row + Stripe dashboard event history.
2. If Stripe side effect did not occur, reset row to retry:
   - set `status='failed'`
   - clear lock fields
   - set `next_attempt_at=now()`
3. If Stripe already succeeded but DB transition failed, run the completion RPC with the known PaymentIntent id.
4. For permanently invalid requests, keep `dead_letter` and resolve through support workflows.

## Safety Notes

- Never expose Stripe secret keys to client code.
- Keep RLS assumptions unchanged for app reads; admin client remains server-only.
- Do not manually delete outbox rows unless the linked donation lifecycle is fully reconciled.
