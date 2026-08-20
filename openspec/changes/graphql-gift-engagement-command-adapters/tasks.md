# Tasks

## 1. Gift Intake Begin Command

- [x] 1.1 Add `beginGiftIntake` in `@asym/api` with amount field `amountCents`,
      currency trim then lowercasing, and typed `not_found` / `incomplete` /
      `invalid` / `failed` results. Do not process the outbox.
- [x] 1.2 Rewire HTTP donate and HTTP donations onto the command. Keep Stripe
      resolve before begin and `processDonationSagaOutboxEvent` after.
- [x] 1.3 Add GraphQL Gift intake adapter that stays enqueue-only and does not
      convert dollars to cents.

## 2. Ministry Update engagement commands

- [x] 2.1 Add `applyMinistryUpdateReaction` owning RPC names and cache
      revalidation. Rewire HTTP like, prayer, and fire adapters onto kinds.
- [x] 2.2 Add `addMinistryUpdateComment`. GraphQL selects and maps after the
      command; HTTP comments POST remains the read-only demo no-op.
- [x] 2.3 Add GraphQL engagement adapters. Like/pray/unpray/unlike only; no
      fire mutations.

## 3. GraphQL handler

- [x] 3.1 Replace direct `begin_donation_saga` and atomic engagement RPC calls
      in `packages/graphql/handler.ts` with the adapters. Keep mutation names
      and payload shapes.
- [x] 3.2 Wrap Yoga `rpc` once for the structural command client. Do not leak
      `any` into adapters.

## 4. Documentation and verification

- [x] 4.1 Record Gift Intake Begin Command, Ministry Update Reaction Command,
      and Ministry Update Comment Command in `CONTEXT.md`.
- [x] 4.2 Add ADR-0119, this OpenSpec change, runbook, and data-access-boundary
      updates.
- [x] 4.3 Focused Vitest for command modules, GraphQL adapters, HTTP reaction
      handlers, and comments demo characterization.
- [x] 4.4 `bunx turbo run lint typecheck --filter=@asym/api --filter=@asym/graphql`
- [x] 4.5 `bunx @fission-ai/openspec@latest validate --change graphql-gift-engagement-command-adapters --strict`
      (do not repair unrelated existing OpenSpec failures).
