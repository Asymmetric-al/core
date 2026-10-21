## Purpose

Define private managed Stripe sandbox ingestion and repeatable operational
evidence without introducing a new application or financial source of truth.

## ADDED Requirements

### Requirement: Managed copies remain private provider data

The setup MUST use Stripe's managed real-time PostgreSQL Data Pipeline into
Core's canonical development Supabase project, with an independently verified
sandbox source and discovered provider-managed schema. Raw copies MUST remain
unreadable to ordinary `anon` and `authenticated` roles, outside API exposure
and Realtime publications, and free of Core-owned table modifications or
application consumers. Pipeline absence or delay MUST NOT affect application behavior.

#### Scenario: Provider rows arrive or the connection is absent

- **WHEN** provider data arrives, is delayed, or is unavailable
- **THEN** Core does not derive gifts, payment completion, receipts, refunds,
  access grants, or ledger repairs from the mirror
- **AND** provider ownership and private access remain intact

### Requirement: Verification is explicit read-only evidence

Verification MUST require explicit destination, source account, schema, and
selected-table expectations, use bounded read-only access, and disclose no
credentials or sensitive provider payloads. Selected managed relations MUST be
ordinary or partitioned tables. Privacy MUST remain incomplete until the operator
records a review of indirect API exposure through views/RPCs and application consumers.
The helper and operational source record MUST distinguish repository preparation,
authorization, configuration, backfill, ongoing sync, and second-source proof.
Helper success MUST be scoped to a single-source observation and explicitly leave
provider authorization, configuration, and second-source proof unverified by the helper.
A second source MUST NOT be required for a successful single-source observation.
Empty tables or old timestamps alone MUST NOT establish success or failure.

#### Scenario: A target is wrong or movement is unproved

- **WHEN** target or source evidence contradicts expectations, or fixtures are absent
- **THEN** verification reports failure or incomplete evidence, as appropriate
- **AND** only matched known synthetic objects and a later controlled change can
  establish backfill and ongoing-sync observations respectively

### Requirement: Source operations remain independently scoped

Each source MUST have a non-secret operational record of its actual account,
sandbox, destination, schema, tables, pipeline identity if available, and status.
Tenant association MUST require independent authority. Additional sources MUST
use supported separate-schema setup and independent authorization. Stopping a
connection MUST target its recorded pipeline without dropping schemas or
disrupting other connections by default.

#### Scenario: A second account is unavailable or a connection is stopped

- **WHEN** source-two access is unavailable, or an operator stops source one
- **THEN** untested source separation remains pending and no Connect coverage is inferred
- **AND** retained copies remain private and other connections are preserved
