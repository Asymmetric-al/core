# ADR-CD-027: Approval decisions and downstream execution have separate outcomes

**Status:** Accepted 2026-05-29; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

A closed approval task must not be mistaken for a finished refund, generated document or delivered notice.

## Decision

- An approve/reject command rechecks source version and current Phase 12/13
  policy, records one idempotent decision and resolves linked approval work.
- Approval admits the exact next owner command; it does not prove provider
  effect, ledger posting, artifact or message delivery. Those states remain
  independently observable and recoverable.
- Rejection records its required reason on the protected source and may create
  source-owned revision/abandonment follow-up work.
- Notify the active requester through Phase 17 outcome preparation and Phase 6
  delivery. The minimal message excludes rejection-reason bodies.
- Repeat submissions never duplicate decisions, postings, tasks or messages.
  Downstream work exists only for a real source-owned consequence.

## Consequences

Show decision, source execution and downstream results separately in the same shell, preserving context and safe retry. Notification engagement cannot change a decision or resolve another owner failure.

## Historical decision and rationale

The [original 2026-05-29 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0027-simple-correction-approval-outcomes.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
