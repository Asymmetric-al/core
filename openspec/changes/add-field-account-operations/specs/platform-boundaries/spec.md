# Delta for Platform System Boundaries

## ADDED Requirements

### Requirement: Field Accounts Preserve Organization-Controlled Support Truth Without Becoming Accounting Or Payroll

Phase 21 MUST own organization-controlled Support Assignments, currency-scoped Field Account occurrences, exact source coverage, Support Cycle close facts, derived Finance-confirmed Field Account Balances, expense-claim operational truth, and the Phase 21 packages handed to owning downstream systems.

Every clause in `openspec/contracts/platform-boundaries.md#contract-c669c207c2a508e8e183` MUST apply without exception.

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

A Support Assignment MUST be the stable organization-controlled financial subject.

Every clause in `openspec/contracts/platform-boundaries.md#contract-1f2188a9475cdc122a87` MUST apply without exception.

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
