# ADR-CD-006: Contribution detail audit trail is layered

**Status:** Accepted (grill session 2026-05-28)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

Contribution detail needs to explain corrections, receipts, Phase 13 posting state, refunds, Stripe references, approvals, and system jobs. Staff need a readable operational story. Finance/admin users also need evidence for reconciliation, debugging, and compliance.

A raw log view would overwhelm normal staff and could expose unsafe payloads. A simplified activity feed alone would hide proof needed by finance operators.

## Decision

Use a layered audit trail:

- Default staff view shows human-readable events and outcomes.
- Authorized finance/admin users can expand entries for technical proof.
- Audit entries are append-only and filterable by category.
- Technical errors are translated into staff language first, with safe source details behind current capability-gated expansion.
- Restricted details must respect tenant and role boundaries.

Technical proof may include request ids, Stripe event ids, idempotency keys, before/after values, job ids, provider refs, and safe error details.

Technical proof must not include provider credentials, secrets, unsafe raw payloads, or data outside the current tenant.

## Consequences

- The detail API needs audit categories, display labels, role-gated detail payloads, and pagination/filtering.
- The UI needs a readable timeline plus expandable technical sections.
- Backend action handlers must write structured audit events, not only prose notes.
- Existing staged gift audit events can seed part of the trail but are not enough for the full contribution detail model.

## Alternatives rejected

- **Staff-facing events only:** Too little proof for finance/admin debugging and reconciliation.
- **Full operational history by default:** Too noisy and increases accidental exposure risk.
- **Separate tabs for every source:** More navigation overhead; categories and expansion should handle most cases first.

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0006-layered-contribution-audit-trail.md) preserves earlier wording and
rationale. Current terminology and applicability were amended on 2026-09-16;
documentation does not establish runtime activation.
