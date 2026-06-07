# 04: Product work claims and dispatch recovery scan

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## What to build

Add reusable product work claims and a dispatch recovery scan so manual replay,
scheduled recovery, and Inngest retries cannot run the same business effect at
the same time.

## Acceptance criteria

- [ ] A product work claim can be acquired per tenant and product work item.
- [ ] Active claims prevent concurrent attempts for the same product work item.
- [ ] Stale or failed claims can become eligible for safe recovery.
- [ ] The recovery scan finds dispatch requests that were stored but not handed
      to workflow orchestration successfully.
- [ ] Recovery attempts create or reuse claims before redispatching work.
- [ ] Tests cover duplicate clicks, manual replay, recovery scan replay, stale
      claim recovery, and tenant isolation.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/03-workflow-dispatch-ledger.md
