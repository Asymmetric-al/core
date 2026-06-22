# ADR-CD-015: Save responses return rich operation results with progressive disclosure

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail actions can update gift context, create adjustments, trigger approvals, affect receipts, require CRM reposts, touch Stripe, create tasks, and write audit events. The product goal requires no duplicate data, crossed wires, or sync delay.

At the same time, contribution detail must stay simple, easy to understand, and easy to use. Staff should not be overwhelmed by ids, job metadata, provider payloads, or technical downstream state.

## Decision

Save/action APIs return a rich operation result:

- Updated canonical contribution detail
- Audit event id
- Adjustment, correction, or correction request id
- Applied vs pending approval status
- Downstream effects
- Provider outcome when applicable
- Task ids created
- Safe user-facing warnings/errors

The UI uses progressive disclosure:

- Show the core outcome in plain staff language.
- Keep technical metadata hidden behind expandable sections, audit rows, or role-gated drawers.
- Use concise chips/warnings for important downstream effects.
- Let finance/admin users expand into proof when needed.

## Consequences

- The client can update immediately from the authoritative response instead of guessing or stitching local state.
- The API contract must clearly separate staff-facing messages from technical proof.
- Detail UI needs expandable summaries for operation effects and audit proof.
- Rich response data must still respect role and tenant boundaries.

## Alternatives rejected

- **Minimal success response:** Forces broad refetches and makes UI state more error-prone.
- **Updated detail only:** Hides audit ids, downstream effects, and approval state that staff need to understand next steps.
- **Async job only:** Useful for long-running provider work but too slow/noisy as the default save pattern.
