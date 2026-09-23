# ADR-CD-005: Money operations use active audit and optional second approval

**Status:** Accepted 2026-05-28; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

Finance teams need accountable money actions without forcing a one-person team into a second-approver queue.

## Decision

- Default admission is the exact Phase 13 action capability, mandatory reason
  for high-risk money work and immutable active audit.
- Second approval is optional per tenant and off by default. Phase 12 enforces
  enabled action/threshold policy and requester-not-approver separation.
- A prior receipt, refund, statement or export does not by itself create a
  mandatory second-approval default. Its owner still controls required source
  corrections and document/communication consequences.
- Only authorized owner-policy changes alter future admission. No local
  superadmin suppression switch bypasses authorization, audit, idempotency,
  current source versions, money invariants or provider constraints.

## Consequences

Keep normal finance work direct under the default policy; present a pending request only when current policy requires it. Explain controls and downstream consequences before execution; audit policy changes separately.

## Historical decision and rationale

The [original 2026-05-28 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0005-approval-policy-for-external-effect-corrections.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
