# ADR-CD-010: Every designation line requires a fund

> **Note (2026-07-06):** The CRM/Twenty post state and repost/retry actions
> referenced in this ADR target the now-retired Twenty pipeline and are dormant
> per
> [ADR-0001](../../../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
> (2026-07-06); "CRM post" survives only as a label over the dormant
> staged-gift pipeline pending the Phase 8 re-groom.

**Status:** Accepted (grill session 2026-05-28)

## Context

Multiple designations per gift are first-class and equal. A designation line needs a stable giving destination for receipts, CRM/Twenty posting, reporting, corrections, and reconciliation.

The product owner clarified that if a donor does not provide a specific designation, the gift should typically default to General Fund. Later edits must remain possible, but every line must always be tied to a fund.

## Decision

Every designation line must point to exactly one fund.

- If donor intent is unspecified, assign the line to General Fund.
- "Unassigned" is not a valid final contribution detail state.
- Memo text can support fund resolution but does not replace a fund.
- Each designation line can be edited later through audited designation corrections.
- Multiple designation lines are allowed and equal; the invariant is one fund per designation line.

## Consequences

- Detail APIs should not expose final fundless designation lines.
- External effects should be blocked or resolved before using any non-final intake state.
- Correction workflows must support changing a designation line's fund after the fact.
- General Fund must be available as a valid tenant fund for fallback designation.

## Alternatives rejected

- **Fundless designation lines:** Ambiguous for receipts, CRM posting, and reporting.
- **Freeform final designations:** Hard to reconcile and easy to duplicate.
- **Single fund per gift:** Conflicts with first-class multiple designations.
