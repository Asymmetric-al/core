# ADR-CD-031: Tenant policy controls updated receipt delivery defaults and guardrails

**Status:** Accepted (grill session 2026-05-29)

## Context

Updated receipt delivery affects donor communication and tax-receipt operations. Tenants may have different finance and donor-care policies, but staff should not need to reason through a complex policy system while making a correction.

ADR-CD-029 defines the correction-time delivery choices, and ADR-CD-030 defines requester proposal plus approver confirmation when approval is required. This decision defines the tenant-level guardrails around those choices.

## Decision

Super admins can configure simple tenant-level updated receipt delivery policy:

1. **Default delivery choice:** Default to email when allowed, PDF, or defer when policy permits.
2. **Defer guardrail:** Decide whether staff may defer updated receipt delivery and whether a reason is required.
3. **Required receipt action:** Decide whether receipt-affecting corrections must select email or PDF before completion.
4. **Role guardrails:** Decide which roles can send updated receipt email and which roles can generate updated receipt PDF.
5. **Donor email opt-out:** Decide whether donor email opt-out blocks email absolutely; default should be absolute block.

Modern practice requirements:

- Keep the correction UI simple: show the allowed choices, default the safest policy-backed option, and explain blocked choices inline.
- Enforce policy server-side; UI state is only guidance.
- Audit policy changes with actor, timestamp, old/new values, and reason.
- Audit delivery decisions with the effective policy version used at the time.
- Default conservatively: respect donor email opt-out, allow PDF fallback, and require a reason when deferring receipt follow-up.

## Consequences

- Tenants can match their receipt operations without forking the core correction workflow.
- Staff get a small set of allowed actions rather than raw settings complexity.
- Receipt delivery remains preference-aware and auditable.

## Alternatives rejected

- **Always allow every choice:** Too loose for donor communication and tax-receipt operations.
- **Defaults only:** Does not let tenants enforce required receipt action or role restrictions.
- **Full automation/rules builder:** Too heavy for this phase and unnecessary for the core receipt workflow.
