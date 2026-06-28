# ADR-CD-025: Correction approval ownership is tenant-configurable

**Status:** Accepted (grill session 2026-05-29)

## Context

High-risk correction requests can affect donor-facing receipts, CRM records, reconciliation, refunds, annual statements, and provider state. Different tenants may have different internal finance controls, but approval ownership must remain explicit and auditable.

## Decision

Correction approval ownership is controlled by tenant-level approval policy.

Supported policy modes should include:

- No approval required where super-admin approval suppression allows it.
- One approver required.
- Separation-of-duties required, where the requester cannot approve their own high-risk correction.
- Stronger approval for selected categories such as refunds, annual statement changes, large amount/tax-deductible corrections, or admin overrides.

The default should be conservative: separation of duties for high-risk corrections unless explicitly relaxed by tenant settings.

## Consequences

- Approval policy must be enforced server-side.
- Policy changes must be audited with actor, reason, and old/new values.
- The UI must explain why a correction is pending and who can approve it.
- Approval suppression or relaxed approval ownership does not suppress audit, correction reasons, concurrency checks, idempotency, or provider requirements.

## Alternatives rejected

- **Any finance approver always allowed:** Too weak for tenants that require separation of duties.
- **Hard-coded separation of duties only:** Safe but not flexible enough for every tenant operating model.
- **Amount/risk matrix only:** Useful as a policy mode, but still needs tenant configurability.
