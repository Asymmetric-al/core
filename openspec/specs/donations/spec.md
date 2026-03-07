# donations Specification

## Purpose

Define how the donor application exposes donation designations, provisions donor records, validates tenant-scoped targets, and creates Stripe payment intents.

## Requirements

### Requirement: Donation designations are returned from the authenticated tenant scope

The donation API SHALL return only designations that belong to the authenticated tenant.

#### Scenario: Requesting all available designations

- **WHEN** an authenticated request calls `GET /api/donate` without a specific `missionary_id` or `fund_id`
- **THEN** the response returns missionaries for the current tenant
- **AND** the response returns only active funds for the current tenant
- **AND** the response includes the authenticated donor record when one exists

#### Scenario: Requesting a specific designation

- **WHEN** an authenticated request calls `GET /api/donate` with a `missionary_id` or `fund_id`
- **THEN** the response returns only the matching designation from the current tenant
- **AND** it omits cross-tenant or inactive designations

### Requirement: Donation initiation provisions the donor record before charging

The donation API SHALL ensure the authenticated profile has a donor record before it creates a payment intent.

#### Scenario: Existing donor record

- **WHEN** an allowed authenticated user calls `POST /api/donate`
- **AND** a donor row already exists for the current profile and tenant
- **THEN** the existing donor record is reused

#### Scenario: Missing donor record

- **WHEN** an allowed authenticated user calls `POST /api/donate`
- **AND** no donor row exists for the current profile and tenant
- **THEN** the API creates a donor row for that profile and tenant before continuing

### Requirement: Donation payment intents use tenant Stripe configuration and integer cents

The donation API SHALL create Stripe payment intents with tenant-scoped metadata and store donation amounts as integer cents.

#### Scenario: Tenant-specific Stripe configuration is available

- **WHEN** `POST /api/donate` resolves a tenant with a stored Stripe secret key
- **THEN** the payment intent uses that tenant-specific secret key

#### Scenario: Tenant-specific Stripe configuration is missing

- **WHEN** `POST /api/donate` resolves a tenant without a stored Stripe secret key
- **THEN** the payment intent falls back to the server environment Stripe secret key

#### Scenario: Amounts are normalized for Stripe and persistence

- **WHEN** `POST /api/donate` receives a decimal donation amount
- **THEN** the payment intent amount is converted to integer cents before calling Stripe
- **AND** the inserted donation row stores that integer-cent amount
- **AND** the response returns the Stripe `clientSecret`, `paymentIntentId`, `donationId`, and publishable key

### Requirement: Donation targets must belong to the authenticated tenant and be active when required

The donation API SHALL reject targets that are missing, cross-tenant, or inactive.

#### Scenario: Missionary designation is invalid

- **WHEN** `POST /api/donate` references a missionary that does not belong to the authenticated tenant
- **THEN** the API returns a `404` response

#### Scenario: Fund designation is invalid or inactive

- **WHEN** `POST /api/donate` references a fund that is missing, belongs to a different tenant, or is not active
- **THEN** the API returns a `404` response

### Requirement: Donation initiation is restricted to authenticated donor-capable roles

The donation API SHALL allow donation initiation only for authenticated roles that are explicitly permitted.

#### Scenario: Allowed authenticated role initiates a donation

- **WHEN** an authenticated `donor`, `admin`, `staff`, or `super_admin` calls `POST /api/donate`
- **THEN** the API continues with donor provisioning and payment intent creation

#### Scenario: Unauthenticated request initiates a donation

- **WHEN** an unauthenticated request calls `POST /api/donate`
- **THEN** the API rejects the request through the shared auth guard
