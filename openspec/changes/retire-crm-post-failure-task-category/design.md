## Context

See `proposal.md` for motivation. Needs Attention is read through
`listContributionNeedsAttention` in
`packages/api/src/admin/mission-control-tasks/store.ts`, which both the
Contributions hub and the Home tile in `apps/admin` consume. That read already
excludes the issue kinds in `RETIRED_NEEDS_ATTENTION_ISSUE_TYPES`
(`crm_post_failed`) in the query and again in memory. The rows are kept.

## Goals / Non-Goals

**Goals:**

- Make the accepted requirement match the shipped behavior and ADR-0001.

**Non-Goals:**

- Any change to apps, packages, APIs, jobs, stores, providers, routes or data.

## Decisions

1. Modify the existing requirement instead of adding a new one. The stale
   wording is inside it, and a MODIFIED delta keeps both existing scenarios.
   Alternative considered: leave the list and add a separate "retired kinds"
   requirement. Rejected, because the list would still name a category that
   has no work behind it.
2. State the replacement behavior in terms of "issue kinds left by a retired
   integration" instead of naming only CRM posting. The implementation is a
   list of retired kinds, so the requirement stays true if another kind is
   retired. The scenario names CRM posting as the current case.
3. Require the records to stay in place. The implementation excludes them from
   the view and keeps the rows, and the gift keeps its historical CRM posting
   status. Deleting history is out of scope and would need its own change.

## Risks / Trade-offs

- [The new sentence adds a rule that was not in the accepted text] → It
  describes behavior that is already implemented and tested, and the owner
  accepts or rejects the wording at review. Tenant, authorization, money and
  provider boundaries are unchanged.

## Migration Plan

None. Rollback is described in `proposal.md`.
