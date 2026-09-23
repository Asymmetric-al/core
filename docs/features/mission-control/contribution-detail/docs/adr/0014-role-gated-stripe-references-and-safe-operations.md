# ADR-CD-014: Stripe references are role-gated with safe operations only

**Status:** Accepted (grill session 2026-05-28)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

Contribution detail must show Stripe references and support operational recovery, but provider IDs and raw events are technical proof, not the staff-facing gift identity. Some Stripe operations, such as refunds and webhook replay, can affect financial state and must not bypass Mission Control policy.

## Decision

Contribution detail presents Stripe information by role:

- Staff see payment summary, payment method summary, amount/refund summary, and understandable processor evidence labels.
- Finance/admin users can expand Stripe technical proof and safe operations.
- Provider operations are only exact source-authorized refund, replay and execution-status paths qualified under Phase 13/16. An apparent sync gap never grants a new mutation.
- Copy/open dashboard links are available only where role and tenant policy allow.

Contribution detail must not provide casual actions for:

- Updating Stripe metadata
- Exposing raw provider payloads to normal staff
- Running provider actions outside permissions, approval policy, idempotency, audit, or processor constraints

## Consequences

- Detail APIs need role-gated Stripe references and action availability.
- Refund and replay actions must be audited and idempotent.
- Raw event details must be filtered for secrets and tenant boundaries.
- The UI should treat Stripe as technical proof and provider operation, not as the canonical gift record.

## Alternatives rejected

- **Read-only references only:** Too weak for finance/admin recovery workflows.
- **Full Stripe operations panel:** Too risky and likely to duplicate provider dashboard behavior.
- **Raw IDs for all staff:** Noisy, confusing, and potentially unsafe.

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0014-role-gated-stripe-references-and-safe-operations.md) preserves earlier wording and
rationale. Current terminology and applicability were amended on 2026-09-16;
documentation does not establish runtime activation.
