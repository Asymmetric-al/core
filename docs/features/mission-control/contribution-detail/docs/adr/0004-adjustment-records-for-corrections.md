# ADR-CD-004: Corrections and refunds use adjustment records

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail must support corrections and refund state without duplicate data, crossed wires, or hidden sync delay. Existing donations already store payment/refund summary fields, and staged gift audit events exist, but the repo does not yet have a first-class correction model for staff-entered contribution detail changes.

## Decision

Persist corrections and refunds as separate adjustment records linked to `donation.id`.

- Original donation rows remain intact.
- Current effective values are derived from the original donation plus applied adjustments.
- Contribution detail shows original and effective values when corrections materially changed what staff see or report.
- Routine staff-safe corrections can apply immediately when permissions and state allow.
- High-risk corrections create correction requests that require approval before becoming effective.
- Every adjustment and correction request appears in the audit trail with actor, reason, source surface, before/after values, and downstream effects.
- Corrections use the same backend operation contract regardless of whether staff entered from CRM donor gift history, Contributions Hub, contribution detail, or an inline row action.

## Consequences

- Detail APIs need to return original values, effective values, adjustment history, and pending correction requests.
- Reporting, CRM display surfaces, and receipt workflows must consume effective values intentionally rather than reading donation rows blindly.
- The UI must explain whether a correction is applied, pending approval, rejected, or superseded.
- The correction model can support reversals without mutating history.
- CRM donor gift history may introduce inline contribution edits only when they submit the same backend operation contract, collect the same required reasons/fields, enforce the same permissions, and produce the same audit/operation result as contribution detail.

## Alternatives rejected

- **In-place amendment:** Simpler queries but weak audit semantics and higher risk around receipts/CRM/reconciliation.
- **Versioned donation snapshots only:** Useful for technical history, but less explicit for finance users who need named adjustment events and reasons.
- **All corrections as approval requests:** Too slow for low-risk metadata corrections and note updates.
