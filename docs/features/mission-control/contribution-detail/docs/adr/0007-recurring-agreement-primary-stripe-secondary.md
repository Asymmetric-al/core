# ADR-CD-007: Recurring agreement is primary; Stripe references are secondary

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail must show recurring gift links and Stripe references. Stripe may expose payment intents, charges, subscriptions, setup intents, and payment methods, but Mission Control needs a stable tenant-owned business concept for recurring giving.

## Decision

When a contribution is part of recurring giving:

- The primary link is the internal recurring agreement / recurring gift detail.
- Stripe references are secondary technical/provider links.
- If provider data indicates recurrence but no internal recurring agreement is linked, show a reconciliation warning.
- The recurring agreement should explain donor, cadence, amount, designation, status, next expected gift, and linked gift history.

## Consequences

- Detail APIs need to include both internal recurring agreement references and provider references.
- The UI must label provider references as Stripe evidence, not the recurring gift itself.
- Missing internal agreement links are data quality issues that should be visible and actionable.
- A future recurring agreement detail experience should become the canonical home for cadence, schedule, and recurrence health.

## Alternatives rejected

- **Stripe-only link:** Couples staff workflow to one provider and treats provider objects as business truth.
- **Internal-only link:** Hides useful payment/provider evidence from finance/admin users.
- **No navigation yet:** Delays a key support and finance workflow even though the detail can expose the relationship incrementally.
