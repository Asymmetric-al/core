# Delta for Platform System Boundaries

## ADDED Requirements

### Requirement: Accounting Handoffs Preserve Source-Specific Authority

Asym source domains MUST own canonical contribution, allocation, correction,
and receipt facts. Phase 20 MAY transform those facts into an immutable,
balanced Accounting Release and evidence artifact, but that downstream
projection MUST NOT mutate or become a competing source for gift truth.

Stripe MUST remain authoritative for processor balance transactions, fees,
refunds, disputes, transfers, and payout evidence for the exact connected
account and mode. Posted bank evidence MUST remain authoritative for what the
bank recorded. QBO or Xero MUST remain authoritative for provider-native
general-ledger objects, accounting periods and locks, and the tenant's final
books reconciliation.

Every imported, derived, exported, or read-back fact MUST retain its source
label and exact source identifier. Agreement among systems MAY be shown as
evidence; disagreement MUST remain visible and route to bounded review.
Provider acceptance, bank matching, or GL posting MUST NOT rewrite another
authority's history or permit blind replay of an ambiguous operation.

#### Scenario: Stripe payout evidence and bank evidence disagree

- GIVEN Stripe records an expected payout amount
- WHEN posted bank evidence does not match it exactly
- THEN Asym preserves both source-labelled facts and opens a bounded exception
- AND it does not alter canonical gifts, claim a bank match, or mark QBO/Xero
  reconciled

#### Scenario: QBO accepts a request but the response is ambiguous

- WHEN a provider delivery might have posted but Asym lacks exact readback
- THEN the operation remains ambiguous and blind retry is blocked
- AND the immutable Accounting Release and artifact remain available while
  exact provider identity/readback or staff review resolves the operation

#### Scenario: An accounting correction is required

- GIVEN an immutable Accounting Release has already been delivered
- WHEN source-owned correction facts require a later accounting effect
- THEN Asym creates a cause-linked compensating release under the permitted
  posting-period policy
- AND it does not reopen the original release or rewrite source/provider
  history

### Requirement: Legal Entity Is Explicit Subtract-Only Financial Scope

Every independently authoritative financial root and cross-system accounting
handoff MUST store one exact tenant and Legal Entity. Legal Entity scope MUST
only narrow the containing tenant's records, permissions, connections, and
reporting; it MUST NOT widen access or action across tenants.

A processor Settlement Account Binding, read-only bank-evidence connection, and
QBO/Xero Accounting Destination Connection MUST be separate purpose-owned
records scoped to the exact tenant and Legal Entity. Accepted work MUST retain
the binding or connection identity that governed it. A mutable tenant, site, or
current-default lookup MUST NOT reroute historical work.

The product MAY quietly preselect the sole entity for a one-entity tenant, but
storage and authorization MUST remain explicit. Multi-entity activation MUST
be prospective and proof-gated. A financial operation, Accounting Release, or
Bank Match that crosses Legal Entities MUST fail closed or be split before
release.

#### Scenario: A one-entity tenant posts an Accounting Release

- GIVEN the tenant has one active Legal Entity and one proved accounting
  destination
- WHEN authorized finance staff release ready work
- THEN the UI may omit a redundant entity selector
- AND the release still stores the exact tenant, Legal Entity, destination
  connection, source coverage, and policy versions

#### Scenario: A tenant changes its accounting destination

- GIVEN an Accounting Release is pinned to one Accounting Destination
  Connection
- WHEN the tenant activates a replacement destination prospectively
- THEN the existing release, artifact, retry, and readback remain pinned to the
  original destination
- AND only later eligible work may use the replacement

#### Scenario: Work from two Legal Entities is selected together

- WHEN a proposed release or Bank Match contains facts from two Legal Entities
- THEN the operation is rejected or split into independently reviewed
  entity-scoped operations
- AND no cross-entity default or provider connection silently combines them
