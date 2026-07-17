# ADR-CD-005: External-effect corrections require approval unless suppressed by super-admin policy

> **Note (2026-07-06):** The CRM/Twenty post state and repost/retry actions
> referenced in this ADR target the now-retired Twenty pipeline and are dormant
> per
> [ADR-0001](../../../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
> (2026-07-06); "CRM post" survives only as a label over the dormant
> staged-gift pipeline pending the Phase 8 re-groom.

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail supports full corrections through adjustment records. Some corrections only affect internal notes, while others affect donor-facing receipts, CRM-posted data, reconciliation, processor state, or annual statements. Staff need a useful workflow, but externally visible financial changes need control.

Tenants may also have different operating models. Some nonprofits may require approval for every externally visible correction; others may authorize finance staff to apply certain corrections directly.

## Decision

By default, a correction requires approval when it changes a gift that has already produced an external effect:

- Receipt sent or suppressed in a donor-visible way
- CRM posted / Twenty synced
- Reconciled
- Refunded or partially refunded
- Stripe action required or already taken
- Included in an annual statement or downstream finance export

Tenant super admins can configure approval suppression in settings for specific external-effect gates. Suppression allows eligible corrections to become effective without a separate approval request.

Approval suppression must not bypass:

- Audit events
- Correction reasons
- Permission checks
- Optimistic concurrency
- Idempotency
- Downstream effect warnings
- Provider or processor requirements

## Consequences

- The settings model needs explicit approval policy fields, not one vague "disable approvals" switch.
- Policy changes are themselves audited with actor, timestamp, reason, and old/new values.
- Contribution detail must show when approval was skipped because of tenant policy.
- APIs must enforce the policy server-side; UI state is advisory only.
- Super-admin approval suppression is operational flexibility, not a weaker data-integrity mode.

## Alternatives rejected

- **Always require approval for money/reporting fields:** Safer but too rigid for tenants with trusted finance workflows.
- **Role-only enforcement:** Misses externally visible state; a finance user changing an already receipted gift is different from changing an unposted draft.
- **Unrestricted suppression:** Too vague and easy to misuse; suppression must be explicit and audited.
