# ADR-CD-019: Contribution Hub search is two-tier

**Status:** Accepted (grill session 2026-05-28)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

Staff open contribution detail from the Contributions Hub. The Hub must remain easy to use for everyday lookup while supporting operational finance workflows such as receipt review, source posting exceptions, refunds, corrections, recurring gifts, and audit lookup.

## Decision

Use a two-tier search model:

- Simple default search for donor name/email, amount, date, fund/designation name, and Stripe/payment reference.
- Advanced filters for receipt status, source posting status, refund status, pending approval, correction state, Phase 16 recurring commitment, giving-destination type, separate campaign attribution and project/missionary context, memo/check text, and audit/action id.

Opening a result uses the shared contribution detail overlay keyed by `contribution_headers.id`.

## Consequences

- The default Hub stays approachable.
- Finance users can still find gifts by operational state and technical references.
- The search API needs to index designation lines and payment references without flattening multi-designation truth.

## Alternatives rejected

- **Basic search only:** Too weak for finance operations.
- **Everything in one search/filter surface:** Too noisy for everyday staff use.
- **Separate operational search tool:** Splits contribution lookup across surfaces.

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0019-contribution-hub-search-two-tier.md) preserves earlier wording and
rationale. Current terminology and applicability were amended on 2026-09-16;
documentation does not establish runtime activation.
