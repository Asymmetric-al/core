# ADR-CD-014: Stripe references are role-gated with safe operations only

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail must show Stripe references and support operational recovery, but provider IDs and raw events are technical proof, not the staff-facing gift identity. Some Stripe operations, such as refunds and webhook replay, can affect financial state and must not bypass Mission Control policy.

## Decision

Contribution detail presents Stripe information by role:

- Staff see payment summary, payment method summary, amount/refund summary, and understandable processor evidence labels.
- Finance/admin users can expand Stripe technical proof and safe operations.
- Allowed safe operations are refund workflow, webhook replay, and sync status.
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
