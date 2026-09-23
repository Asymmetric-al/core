# ADR-CD-016: Contribution detail opens on financial summary

**Status:** Accepted (grill session 2026-05-28)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

Contribution detail has to serve many needs: financial truth, actions, audit, corrections, receipt state, source posting state, Stripe references, recurring context, and designation details. The product owner wants the UI to remain simple, easy to understand, easy to use, and low-noise.

## Decision

The default visible detail view starts with the financial summary:

- Amount and payment status
- Donor identity/context
- Gift date, source, and payment method
- Equal designation rows
- Separately owned document, posting, refund, recurring, correction and approval facts
- Correct primary actions for the gift state and user role

Technical and operational detail stays collapsed by default:

- Stripe technical proof
- Full audit trail
- Correction history
- Downstream operation effects
- Raw ids, provider event ids, job metadata, and idempotency keys

## Consequences

- The first screen answers "what is this gift, where is it going, and what needs attention?"
- Detail APIs must support concise summary fields and expandable detail fields.
- UI design should prioritize staff comprehension over maximal data density.
- Technical proof remains accessible through progressive disclosure.

## Alternatives rejected

- **Workflow dashboard first:** Makes exceptions dominate even when a gift is healthy.
- **Donor story first:** Useful context but secondary to financial truth for this surface.
- **Everything collapsed:** Too much work for staff to answer basic gift questions.

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0016-financial-summary-default-layout.md) preserves earlier wording and
rationale. Current terminology and applicability were amended on 2026-09-16;
documentation does not establish runtime activation.
