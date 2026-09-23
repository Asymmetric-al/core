# ADR-CD-013: Receipt presentation consumes exact source and artifact authority

**Status:** Accepted 2026-05-28; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

Staff need truthful document context, including why a receipt is present, absent, corrected or governed by a different issuer/purpose plan.

## Decision

- Phase 7 owns legal donor, eligibility, immutable facts, issuer/purpose and
  correction/issuance authority. An annual-cumulative cash plan excludes
  per-gift official issuance; one receipt per gift is not universal.
- Phase 18 alone owns requests, exact artifacts, logical current heads and
  access. Phase 19 owns statement runs and fulfillment.
- Detail shows authorized source/artifact references and separate requested,
  ready, superseded, unavailable and delivery states.
- Present line-aware facts as permitted by the purpose; renderer/UI cannot
  decide eligibility or require every line in every output.
- Corrections emit exact source facts. Never regenerate a local snapshot or
  declare a document current because a staff action succeeded.

## Consequences

Current/download/replacement actions reauthorize exact artifact and purpose. No generic PDF fallback, live rerender, receipt-per-line default or local receipt object becomes another document authority.

## Historical decision and rationale

The [original 2026-05-28 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0013-gift-level-line-aware-receipts.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
