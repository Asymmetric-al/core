# ADR-CD-009: Giving destinations, campaigns, restrictions and memos are distinct

**Status:** Accepted 2026-05-28; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

Keep what a gift supports separate from the effort that prompted it, applicable legal limits and donor-provided evidence.

## Decision

- **Fund / giving destination:** the eligible purpose to which a Phase 13
  Designation line directs an amount; missionary/project context comes from
  the corresponding source owner.
- **Giving Campaign:** a fundraising effort and attribution/reporting axis,
  not a Fund, Designation, public page or email blast. One campaign may span
  many designations; campaign and destination rollups must not be added.
- **Restriction:** the applicable source-owned legal/accounting limitation,
  not a synonym for every giving destination.
- **Memo:** donor-provided supporting evidence, never the resolved destination.
- A line keeps destination, campaign attribution, restriction and memo context
  separate. Reports use Phase 13 source-code/campaign semantics.

## Consequences

Use these meanings across CRM, Hub, documents and exports. Resolve memo input through the owning eligibility/intent flow; a campaign is not a fund subtype and a label cannot redefine financial purpose.

## Historical decision and rationale

The [original 2026-05-28 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0009-designation-fund-restriction-memo-language.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
