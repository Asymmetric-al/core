# ADR-CD-010: Each designation line has one eligible giving destination

**Status:** Accepted 2026-05-28; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

Equal first-class gift lines need unambiguous money destinations and exact owner evidence for downstream documents, credit and reporting.

## Decision

- Each Phase 13 designation line carries amount/currency and exactly one
  eligible source-owned giving destination, with stable line identity.
- Multiple lines are peers. Do not infer a primary missionary or fund from
  array order or legacy scalar donation columns.
- Apply the owning Phase 13 General Fund rule when donor intent is unspecified;
  do not resolve an invalid/restricted named destination to it silently.
- Giving Campaign remains a separate effort/attribution axis.
- The shared read model exposes permitted destination context; corrections
  preserve ledger conservation and history through the owning command.

## Consequences

Validate source eligibility and tenant/entity/currency scope server-side. A missing legacy staged-gift record does not determine availability of an otherwise admitted owner command. No CRM posting adapter is required.

## Historical decision and rationale

The [original 2026-05-28 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0010-designation-lines-require-funds.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
