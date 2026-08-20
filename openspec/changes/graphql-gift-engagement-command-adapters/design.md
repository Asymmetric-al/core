# Design: GraphQL Gift And Engagement Command Adapters

## Architecture vocabulary

This change deepens three command **modules** so HTTP and GraphQL **adapters**
share one write **interface**. The **seam** is the command result (`ok` plus
typed failure codes), not the Postgres RPC name. **Depth** lives in the
command: RPC names, payload parse, P0002 mapping, and (for reactions) cache
revalidation. Adapters keep surface contracts. **Locality** means a Gift begin
or reaction persistence change is one module, not a hunt through Yoga and two
HTTP routes. **Leverage** is the second adapter: HTTP already existed; GraphQL
is now a real consumer instead of a parallel fork.

The deletion test: deleting `beginGiftIntake` would scatter saga payload
parsing and error codes back into three adapters. That concentrates complexity
in the command, so the module is not shallow.

## Command modules

### Gift Intake Begin Command

`beginGiftIntake` calls `begin_donation_saga` and returns donation id, outbox
id, and replayed. It does not process the outbox and does not import
`next/cache`.

Amount units stay adapter-owned:

- HTTP donate converts dollars to cents (`Math.round(amount * 100)`).
- HTTP donations and GraphQL pass stored cents as `amountCents`.

HTTP donate and donations still resolve Stripe before begin and still call
`processDonationSagaOutboxEvent` after a successful begin. GraphQL Gift intake
stays enqueue-only.

### Ministry Update Reaction Command

`applyMinistryUpdateReaction` maps kind → RPC name, parses `applied`, maps
P0002 to `not_found`, and revalidates post cache tags when the change applied.
HTTP adapters ignore the command failure message for non-P0002 errors and use
adapter-owned copy. GraphQL kinds exclude fire/unfire.

### Ministry Update Comment Command

`addMinistryUpdateComment` persists through `atomic_add_post_comment` and
returns `commentId`. It does not revalidate. GraphQL selects the comment with
author, maps it, then revalidates. HTTP comments POST remains `{ success: true,
readOnlyDemo: true }` without calling the command.

## Adapter RPC wrap

Generated Supabase RPC overloads are not assignable to the structural command
client. Yoga wraps `rpc` once with `as never` at that seam. HTTP donate and
reaction adapters do the same at their call sites. No `any` in command modules
or GraphQL adapters.

## Out of scope

- Guest Giving fee policy / cover-fees on GraphQL `createDonation`
- Contribution-command / Twenty CRM deepening
- GraphQL fire mutations
- Folding GraphQL comments onto the HTTP demo no-op
- Query-side GraphQL folding onto `@asym/api`
- Reopening ADR-0060 saga outbox shape (if present) or Stripe API version
