# ADR-CD-028: Contribution source policy owns approval reminders and escalation

**Status:** Accepted 2026-05-29; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

Pending work may need timely attention while financial decisions remain with authorized humans under current source policy.

## Decision

- The contribution source evaluates configured pending intervals, reminders
  and optional escalation against current request state.
- Emit exact due occurrences only while applicable; recheck eligible recipient,
  source revision and current policy.
- Phase 17 consumes exact reminder/escalation keys. It adds no independent
  timer, recipient, urgency claim or auto-approval. Phase 6 delivers.
- Required in-product attention and optional email follow the manifest.
- Derive pending-too-long display from source timestamps/policy. Notifications,
  worker delay and engagement cannot extend or revive old work.
- Reminders/escalations never approve, execute money or bypass separation of
  duties. Keep source occurrence and delivery audit idempotent.

## Consequences

Configure timing through the contribution owner, not the message editor. Expose actual due/recovery state; a reminder receipt is not evidence a human reviewed the request.

## Historical decision and rationale

The [original 2026-05-29 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0028-simple-correction-approval-sla.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
