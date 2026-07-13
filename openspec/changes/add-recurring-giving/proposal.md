# Add Recurring Giving Creation

## Why

`donation-lifecycle` reflects existing subscription/pledge state from Stripe
webhooks, but no code path lets a donor start a recurring gift: the donate
schema has no interval field, nothing creates a Stripe subscription, and the
only `donor_pledges` insert is demo seed data. Recurring creation is also a
prerequisite for `add-donor-self-service` (a donor cannot pause or cancel a
recurring gift that can never be created).

## What Changes

- Add donor-initiated recurring giving at checkout: the donate contract accepts
  a recurring frequency, and the server creates a Stripe subscription linked
  one-to-one with a new donor pledge, server-authoritative and idempotent.
- Recurring gifts join the existing reflection path so invoice/subscription
  webhooks update pledge state and progress (already shipped).

## Impact

- Affected specs: `donation-lifecycle`
- Affected code: `packages/api/src/donate/**` (schema + saga),
  `packages/api/src/stripe/**` (subscription creation), donor checkout UI,
  `supabase/migrations` if pledge creation needs columns
- Prerequisite for `add-donor-self-service`.
