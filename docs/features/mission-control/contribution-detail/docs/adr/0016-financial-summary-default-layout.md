# ADR-CD-016: Contribution detail opens on financial summary

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail has to serve many needs: financial truth, actions, audit, corrections, receipt state, CRM post state, Stripe references, recurring context, and designation details. The product owner wants the UI to remain simple, easy to understand, easy to use, and low-noise.

## Decision

The default visible detail view starts with the financial summary:

- Amount and payment status
- Donor identity/context
- Gift date, source, and payment method
- Equal designation rows
- Receipt, CRM post, refund, recurring, correction, and approval status chips
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
