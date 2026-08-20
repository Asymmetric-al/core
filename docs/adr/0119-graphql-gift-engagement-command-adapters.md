# ADR-0119: GraphQL Gift and engagement adapters share Core command modules

**Status:** Accepted

## Context

GraphQL Yoga in `packages/graphql/handler.ts` created Gifts through
`begin_donation_saga` and applied Ministry Update likes, prayers, and comments
through the atomic engagement RPCs. HTTP donate, donations, and reaction
routes already owned those same writes. Two money paths and two engagement
paths meant a Gift or reaction bug had to be fixed twice, and GraphQL could
drift from HTTP on amount units, cache tags, or outbox processing.

The public-content contract already lives in `packages/api`
([ADR-0027](./0027-transport-agnostic-public-content-reader.md)). The data
access boundary names `packages/api/src/*` as the canonical layer for business
database logic. GraphQL is a shared-record surface adapter, not a second
product surface and not a second command owner.

Folding GraphQL comments onto the HTTP comments POST would be wrong: that
route is a read-only demo no-op. Adding GraphQL fire mutations, converting
GraphQL amounts, or starting Stripe from GraphQL `createDonation` would change
product contracts this slice does not own. Reopening the donation saga outbox
shape is out of scope.

## Decision

Gift begin, Ministry Update reactions, and GraphQL Ministry Update comments go
through Core command modules in `@asym/api`. HTTP and GraphQL adapters call
those modules; they do not name the RPCs.

- **Gift Intake Begin Command** (`beginGiftIntake`) starts a Gift through
  `begin_donation_saga` and returns donation id, outbox id, and replayed.
  It does not process the outbox and does not import `next/cache`. Amount
  units stay adapter-owned: HTTP donate converts dollars to cents; GraphQL
  and HTTP donations pass stored cents.
- HTTP donate and donations adapters still resolve Stripe before begin and
  still call `processDonationSagaOutboxEvent` after a successful begin.
  GraphQL Gift intake stays enqueue-only. Outbox workers remain the Stripe
  side-effect path for GraphQL `createDonation`.
- **Ministry Update Reaction Command** (`applyMinistryUpdateReaction`) owns
  RPC names for like, prayer, and fire plus cache revalidation when a change
  applied. HTTP reaction adapters name the kind and own surface copy. GraphQL
  still exposes only like and prayer; fire stays HTTP-only.
- **Ministry Update Comment Command** (`addMinistryUpdateComment`) persists a
  comment through `atomic_add_post_comment` and returns the comment id. It
  does not revalidate. GraphQL selects, maps, and revalidates after the
  command returns. HTTP comments POST remains the read-only demo no-op.

Generated Supabase RPC overloads are not assignable to the structural command
client. Yoga wraps `rpc` once with `as never` at that seam instead of leaking
`any` into adapters.

## Consequences

- A Gift begin or reaction persistence change lives in one module. HTTP and
  GraphQL adapters keep their contracts (status codes, GraphQL error strings,
  enqueue-only GraphQL Gift, HTTP outbox processing).
- GraphQL handler mutations for Gift and engagement no longer contain
  `begin_donation_saga` or the atomic like/pray/comment RPC names.
- The GraphQL gateway exception on the data access boundary covers remaining
  queries and selects, not Gift or engagement mutations.
- Guest Giving fee policy and cover-fees stay off GraphQL `createDonation`.
  Contribution-command deepening stays on its own branch.

## Related decisions

- [ADR-0027 — Transport-agnostic public-content reader](./0027-transport-agnostic-public-content-reader.md)
  (`packages/api` as the shared package home)
- [Data access boundary](../guides/architecture/data-access-boundary.md)
- Donation saga outbox runbook:
  [donation-saga-outbox.md](../guides/operations/donation-saga-outbox.md)
