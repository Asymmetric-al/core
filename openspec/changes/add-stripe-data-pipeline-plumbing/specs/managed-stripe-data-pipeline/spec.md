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

Verification MUST require explicit destination, source account, schema, and selected-table expectations, use bounded read-only access, and disclose no credentials or sensitive provider payloads.

Every clause in `openspec/contracts/managed-stripe-data-pipeline.md#contract-78de820abceec9e35dd1` MUST apply without exception.

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
