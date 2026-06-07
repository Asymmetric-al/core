# 03: Workflow dispatch ledger and event envelope

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## What to build

Create the shared product-owned workflow dispatch ledger and safe event envelope
contract. Product areas should be able to create or reuse dispatch requests,
attempt an immediate workflow handoff, and record handoff status without making
Inngest the source of truth.

## Acceptance criteria

- [ ] Dispatch requests store tenant identity, product area, durable product
      record identity, status, attempts, last error, schema version, and safe
      audit context.
- [ ] Repeated create requests for the same product-owned idempotency key reuse
      the existing dispatch request instead of creating duplicates.
- [ ] The event envelope validator accepts identifier-only payloads and rejects
      sensitive or broad product payloads.
- [ ] Immediate dispatch success and failure are both recorded durably.
- [ ] Dispatch failure after product storage leaves work recoverable by a later
      scan.
- [ ] Unit tests cover create, reuse, dispatch success, dispatch failure, and
      sensitive-field rejection.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/01-openspec-runtime-scope.md
- .scratch/inngest-durable-workflow-executor/issues/02-inngest-runtime-smoke.md
