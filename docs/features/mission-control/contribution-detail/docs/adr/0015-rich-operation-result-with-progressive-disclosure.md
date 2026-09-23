# ADR-CD-015: Save responses return rich operation results with progressive disclosure

**Status:** Accepted (grill session 2026-05-28)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

Contribution detail actions can update gift context, append source-owned correction postings, trigger approvals, affect receipts, require source-owned repairs, touch Stripe, create tasks, and write audit events. The product goal requires no duplicate data, crossed wires, or sync delay.

At the same time, contribution detail must stay simple, easy to understand, and easy to use. Staff should not be overwhelmed by ids, job metadata, provider payloads, or technical downstream state.

## Decision

Save/action APIs return a rich operation result:

- Updated canonical contribution detail
- Audit event id
- Source/posting revision and correction-request reference
- Source acceptance and approval status, distinct from provider/document/message outcomes
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

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0015-rich-operation-result-with-progressive-disclosure.md) preserves earlier wording and
rationale. Current terminology and applicability were amended on 2026-09-16;
documentation does not establish runtime activation.
