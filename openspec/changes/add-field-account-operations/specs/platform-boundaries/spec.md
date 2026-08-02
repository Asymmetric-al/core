# Delta for Platform System Boundaries

## ADDED Requirements

### Requirement: Field Accounts Preserve Organization-Controlled Support Truth Without Becoming Accounting Or Payroll

Phase 21 MUST own organization-controlled Support Assignments, currency-scoped
Field Account occurrences, exact source coverage, Support Cycle close facts,
derived Finance-confirmed Field Account Balances, expense-claim operational
truth, and the Phase 21 packages handed to owning downstream systems. It MUST
NOT derive authoritative balances by summing donation rows or treat a Field
Account as a donor restriction, worker-owned wallet, bank balance, payroll
balance, accounts-payable subledger, general ledger, or money-movement system.

Phase 13 and Phase 15 MUST remain authoritative for their contribution and
offline/noncash source facts. Phase 20 MUST remain the only owner of QBO/Xero
accounting delivery and accounting reconciliation assistance. External payroll
or AP providers MUST remain authoritative for classification, calculation,
approval, execution, completion, and payment according to their certified
capabilities. Phase 29 MUST own protected Phase-21 evidence and D26 package
bytes, retention holds, and disposal; independently owned artifact bytes,
including Phase 18 generated documents, MUST remain with their owner. Phase 30
MUST own inbound transport, and Phase 31 outbound support-feed transport.

Each cross-phase handoff MUST carry exact Tenant, Legal Entity, purpose,
Support Assignment, Field Account, ISO currency, source identity/version,
coverage, policy version, and authority evidence required by the receiving
contract. A downstream acceptance, artifact, provider draft, accounting post,
bank match, payslip, or notification MUST NOT rewrite Phase 21 history or be
presented as another authority's success.

#### Scenario: A missionary dashboard requests a support balance

- GIVEN source-owned contribution activity exists for a Support Assignment
- WHEN the missionary opens Support balances
- THEN the product reads an authorized Phase 21 projection of the latest
  Finance-confirmed Field Account Balance and separately labelled provisional
  activity
- AND it does not calculate the balance from contribution rows or describe the
  amount as available, withdrawable, payroll-ready, payable, or paid

#### Scenario: Phase 21 prepares an accounting handoff

- GIVEN an exact closed Phase 21 occurrence family is certified for accounting
- WHEN the accounting handoff is requested
- THEN Phase 21 supplies the immutable source contract and artifact required by
  Phase 20
- AND only Phase 20 may compile, release, deliver, read back, or reconcile a QBO
  or Xero accounting operation

#### Scenario: A payroll provider accepts a draft input

- WHEN a certified Phase 21 adapter proves that a provider-native draft or input
  was created
- THEN Phase 21 records that exact capability-specific result
- AND it does not mark payroll complete, compensation paid, accounting posted,
  or bank reconciliation complete

#### Scenario: A mandatory adverse source fact produces a deficit

- GIVEN a closed Field Account later receives an exact source-owned refund,
  return, or other mandatory adverse correction
- WHEN the correction enters the qualified append-only path
- THEN Phase 21 preserves and displays the resulting deficit as cause-owned
  review truth
- AND it does not suppress the source fact, invent a plug, or treat a general
  nonnegative-balance constraint as more authoritative than the correction

### Requirement: Support Assignment Participation Never Implies Financial Access Or Ownership

A Support Assignment MUST be the stable organization-controlled financial
subject. Participant Membership, Phase 12 Workspace Access, source-owned
operational responsibility, claimant identity, review authority, payee status,
and notification preferences MUST remain independent, versioned facts. Spouse,
household, teammate, leader, project, contact, or participant relationships MUST
NOT imply one another or grant transitive access.

All Phase 21 commands and projections MUST enter through the trusted
`FieldAccountOperationsService` boundary with a server-resolved principal,
Active Tenant Assignment, exact Tenant and Legal Entity, environment,
authorization epoch, assurance level, capabilities, and resource scope.
Application authorization MUST use the Phase 12 server policy decision point;
forced row-level security and same-scope database constraints MUST provide
defense in depth. Financial grants MUST NOT be stored in client state or JWT
claims, and raw financial tables MUST NOT be exposed through Realtime.

Authorization and privacy filtering MUST happen before enumeration, counts,
arithmetic, pagination, caching, export, notification, provider delivery, or
diagnostics. A denied or stale cross-scope identifier MUST return the same
non-enumerating outcome as a nonexistent resource and MUST create no side
effect.

#### Scenario: Two spouses use separate accounts for one assignment

- GIVEN each spouse has an independently accepted participant membership and
  exact Phase 12 Workspace Access to the same Support Assignment
- WHEN either spouse opens the missionary workspace
- THEN each sees only the projections independently authorized for that
  principal
- AND neither login, membership, notification preference, nor activity becomes
  shared identity or transitive authority

#### Scenario: A project leader receives notifications

- GIVEN a leader has an authorized participant role and a compatible
  Notification Preference Version
- WHEN a purpose-minimized support notification is emitted
- THEN receipt of the notification grants no claimant, approver, payee,
  reallocation, compensation, expense, or financial-administration authority

#### Scenario: A client submits a cross-tenant Field Account identifier

- WHEN an authenticated principal submits an identifier outside the exact
  authorized Tenant, Legal Entity, Support Assignment, purpose, or currency
- THEN the service returns `not_permitted_or_not_found`
- AND authorization filtering prevents existence, count, amount, cache, timing,
  or diagnostic leakage and commits no write or external effect
