# Delta for Platform Principles And Decision Criteria

## ADDED Requirements

### Requirement: Contribution Operations Protect Donor Trust Through Corrections

Contribution operations MUST prioritize donor trust, operational truth, and
money integrity over staff convenience. When staff corrections alter money,
identity, designation, provider state, refunds, receipts, statements, or
donor-visible contribution history, the platform MUST preserve an explainable
correction trail rather than silently overwriting truth.

#### Scenario: A fast edit would hide money-state history

- GIVEN a direct database update would quickly change a contribution amount,
  refund state, payment state, or designation
- WHEN the change would affect money truth or donor-visible history
- THEN the platform records a contribution correction and audit event
- AND it does not silently overwrite the original operational explanation

### Requirement: Contribution Operations Prefer Shared System Behavior

Repeated contribution operations MUST be implemented as shared system behavior
inside the Contribution Operations Core rather than as disconnected UI or
route-specific workflows.

#### Scenario: Two surfaces need the same contribution action

- GIVEN both the Contribution Hub and donor CRM record need to perform the same
  contribution action
- WHEN the action is implemented
- THEN the action is implemented once behind a shared server-side interface
- AND each surface calls that interface rather than re-implementing local
  business rules

### Requirement: Contribution Operation Completion Requires Trustworthy Feedback

A contribution operation MUST NOT be treated as product-complete if staff
cannot tell what happened, whether a provider action succeeded, whether a donor
visible state changed, or where to find the audit trail.

#### Scenario: Provider outcome is uncertain

- GIVEN Stripe or another provider returns a pending, failed, partial, or
  ambiguous outcome
- WHEN staff reviews the operation result
- THEN the platform shows an honest state and next action
- AND it does not hide uncertainty behind reassuring language
