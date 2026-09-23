# ADR-CD-030: Approval rechecks proposed receipt follow-up through its owners

**Status:** Accepted 2026-05-29; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

Recording donor-care context does not give a requester issuance or sending authority.

## Decision

- Store the exact proposed follow-up as non-executing correction-request
  context, not an artifact or message intent.
- On decision, recheck Phase 12/13 approval and Phase 7/18 purpose, source,
  artifact and recipient access. Changed choices are explicit and audited.
- Approval invokes only the admitted owner command. Artifact readiness and
  Phase 17/6 preparation/delivery remain separate results and repair paths.
- Rejection never issues, generates or sends; it preserves protected proposal
  context and follows the rejection/follow-up contract.
- Pending provider effects reconcile their existing identity, not another send
  or issuance on repeated approval.

## Consequences

One contextual flow may show multiple honest owner states; it must not collapse approval, money, PDF and email into one success flag or retry the whole bundle.

## Historical decision and rationale

The [original 2026-05-29 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0030-receipt-delivery-proposal-confirmation.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
