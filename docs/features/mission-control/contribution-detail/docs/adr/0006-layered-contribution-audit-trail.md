# ADR-CD-006: Contribution detail audit trail is layered

> **Note (2026-07-06):** The CRM/Twenty post state and repost/retry actions
> referenced in this ADR target the now-retired Twenty pipeline and are dormant
> per
> [ADR-0001](../../../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
> (2026-07-06); "CRM post" survives only as a label over the dormant
> staged-gift pipeline pending the Phase 8 re-groom.

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail needs to explain corrections, receipts, CRM/Twenty post state, refunds, Stripe references, approvals, and system jobs. Staff need a readable operational story. Finance/admin users also need evidence for reconciliation, debugging, and compliance.

A raw log view would overwhelm normal staff and could expose unsafe payloads. A simplified activity feed alone would hide proof needed by finance operators.

## Decision

Use a layered audit trail:

- Default staff view shows human-readable events and outcomes.
- Authorized finance/admin users can expand entries for technical proof.
- Audit entries are append-only and filterable by category.
- Technical errors are translated into staff language first, with raw details behind role-gated expansion.
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
