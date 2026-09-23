# ADR-CD-007: Phase 16 recurring commitment is primary; Stripe is evidence

**Status:** Accepted 2026-05-28; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

Contribution detail needs stable recurring context while provider execution objects change independently of donor intent.

## Decision

- Link to the Phase 16 Recurring Commitment and exact group/line/cohort context
  authorized for the viewer. The local UI does not create another agreement.
- Provider subscriptions/items, schedules, attempts and payment methods remain
  execution evidence with explicit owner mappings, never the intent record.
- Missing or conflicting mappings route to Phase 16 controlled recovery;
  provider discovery cannot grant access, recreate intent or collect.
- Show cadence, destination, lifecycle/support-health and linked gift history
  only from the owning Phase 16/13 projections.

## Consequences

Replace current Recurring agreement copy with owner vocabulary. Technical references remain progressively disclosed under the exact provider visibility/action capability.

## Historical decision and rationale

The [original 2026-05-28 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0007-recurring-agreement-primary-stripe-secondary.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
