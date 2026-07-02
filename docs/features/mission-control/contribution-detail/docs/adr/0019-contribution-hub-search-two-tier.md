# ADR-CD-019: Contribution Hub search is two-tier

**Status:** Accepted (grill session 2026-05-28)

## Context

Staff open contribution detail from the Contributions Hub. The Hub must remain easy to use for everyday lookup while supporting operational finance workflows such as receipt review, CRM post failures, refunds, corrections, recurring gifts, and audit lookup.

## Decision

Use a two-tier search model:

- Simple default search for donor name/email, amount, date, fund/designation name, and Stripe/payment reference.
- Advanced filters for receipt status, CRM post status, refund status, pending approval, correction state, recurring agreement, fund type, campaign/project/missionary fund, memo/check text, and audit/action id.

Opening a result uses the shared contribution detail overlay keyed by `donation.id`.

## Consequences

- The default Hub stays approachable.
- Finance users can still find gifts by operational state and technical references.
- The search API needs to index designation lines and payment references without flattening multi-designation truth.

## Alternatives rejected

- **Basic search only:** Too weak for finance operations.
- **Everything in one search/filter surface:** Too noisy for everyday staff use.
- **Separate operational search tool:** Splits contribution lookup across surfaces.
