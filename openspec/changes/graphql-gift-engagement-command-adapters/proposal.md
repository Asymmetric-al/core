# GraphQL Gift And Engagement Command Adapters

## Why

GraphQL Yoga created Gifts and applied Ministry Update likes, prayers, and
comments by calling Postgres RPCs directly. HTTP donate, donations, and
reaction routes already owned those same writes. Two money paths and two
engagement paths meant a persistence bug had to be fixed twice, and GraphQL
could drift from HTTP on amount units, cache tags, or outbox processing.

GraphQL is a shared-record surface adapter, not a second product surface. Gift
begin and Ministry Update engagement must share Core command modules so HTTP
and GraphQL keep one write owner.

## What Changes

- Add a Gift Intake Begin Command in `@asym/api`. HTTP donate, HTTP donations,
  and GraphQL `createDonation` start a Gift through that module. GraphQL stays
  enqueue-only. HTTP donate and donations still process the outbox after begin.
  Amount units stay adapter-owned.
- Add a Ministry Update Reaction Command that owns like, prayer, and fire RPC
  names and cache revalidation. HTTP reaction adapters name the kind and own
  copy. GraphQL still exposes only like and prayer.
- Add a Ministry Update Comment Command for `atomic_add_post_comment`. GraphQL
  selects and maps after the command returns. HTTP comments POST remains the
  read-only demo no-op.
- Keep GraphQL mutation names and payload shapes. Do not add GraphQL fire,
  cover-fees on GraphQL Gift, or GraphQL Stripe side effects.

## Impact

- Affected specs: `donation-lifecycle`, `platform-surfaces`
- Affected code: `packages/api/src/donate/begin-gift-intake.ts`,
  `packages/api/src/posts/ministry-update-reaction.ts`,
  `packages/api/src/posts/ministry-update-comment.ts`, HTTP donate/donations
  and reaction adapters, `packages/graphql/handler.ts` plus Gift and
  engagement adapters
- Depends on existing `begin_donation_saga` and atomic engagement RPCs; does
  not reopen the saga outbox shape
- Related ADR: `docs/adr/0118-graphql-gift-engagement-command-adapters.md`
