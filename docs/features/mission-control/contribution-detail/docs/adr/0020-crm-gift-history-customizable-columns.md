# ADR-CD-020: CRM gift history supports per-user customizable columns

**Status:** Accepted (grill session 2026-05-28)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

CRM donor gift history is an entry point into contribution detail, but it should not become a second Contributions Hub. Admin users still need different table views depending on their role, habits, and current workflow.

Existing admin tables use shared table components with column visibility, but current examples are initial-state driven. The desired product behavior requires automatic per-user persistence.

## Decision

CRM donor gift history uses compact issue-aware rows by default and supports per-user customizable columns.

Default visible row:

- Amount
- Gift date
- Designation summary
- Meaningful status chips / issue indicators

Admins can add/remove optional columns such as receipt status, source posting status, refund status, recurring status, fund type, memo present, restriction present, pending approval, payment method, source, last updated, Stripe reference present, and canonical gift id.

Column choices are saved automatically per user and restored when the admin returns.

## Consequences

- The CRM page stays simple by default but flexible for admin workflows.
- Table preferences need a user-scoped persistence model, reset-to-default, and forward-compatible handling when columns are added/renamed.
- Required identity/action affordances should be protected from accidental removal.
- The implementation should reuse shared data-table patterns and design tokens.

## Alternatives rejected

- **Fixed minimal row only:** Too limiting for admins with different workflows.
- **Rich mini-card for every row:** Too noisy and duplicates contribution detail.
- **Global table preferences:** Does not respect individual admin needs.
- **Browser-only preferences:** Does not reliably follow the signed-in admin across devices/sessions.

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0020-crm-gift-history-customizable-columns.md) preserves earlier wording and
rationale. Current terminology and applicability were amended on 2026-09-16;
documentation does not establish runtime activation.
