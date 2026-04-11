# Platform Surfaces And User Experience Intent

## Purpose

Define durable **experience intent** for each major surface in this monorepo.
Route groups and folder names are implementation details; this spec states what
each app is for and what “good” feels like for users.

Canonical structural detail (paths, packages, diagrams) lives in
`docs/guides/architecture/overview.md` and should stay aligned with this intent.

## Requirements

### Requirement: Mission Control (Admin)

The `apps/admin` (`@asym/admin`) application SHALL serve organization staff
(Mission Control): finance, operations, communications, and leadership roles who
run the ministry’s fundraising and engagement programs.

#### Scenario: Staff use the admin surface

- WHEN designing or changing admin features
- THEN workflows favor clarity, auditability, least privilege, and operational
  throughput
- AND destructive or sensitive actions are explicit, reversible where possible,
  and permission-aware

### Requirement: Missionary Workspace

The `apps/missionary` (`@asym/missionary-app`) application SHALL serve
missionaries as a personal workspace for support, donor relationships, progress,
and communication—not as a replacement for full org admin tooling.

#### Scenario: A missionary uses the app daily

- WHEN presenting data or tasks
- THEN the experience prioritizes focus, low cognitive load, and respectful
  handling of donor and financial information
- AND the surface avoids duplicating Mission Control complexity unless the
  missionary role truly requires it

### Requirement: Donor Portal And Public Giving

The `apps/donor` (`@asym/donor`) application SHALL serve donors and public
visitors: self-service giving, impact and relationship context, account and
compliance artifacts (for example receipts), and tenant-branded public giving
pages.

#### Scenario: A donor manages giving or follows impact

- WHEN designing donor-facing flows
- THEN the experience is calm, trustworthy, and honest about permissions and
  payment state
- AND errors and edge cases are understandable without internal jargon

#### Scenario: A visitor gives on a public page

- WHEN a visitor completes checkout or discovery flows
- THEN the path is fast, accessible, and consistent with the tenant’s brand
- AND money movement follows Stripe-aligned patterns described in
  `openspec/specs/platform-boundaries/spec.md`

### Requirement: Cross-Surface Coherence

The three Next.js apps SHALL present as one platform: shared auth patterns,
shared UI language where appropriate, and consistent vocabulary for roles,
giving, and impact.

#### Scenario: Naming or flows diverge between apps

- WHEN a new flow introduces different terms or patterns for the same concept
- THEN the change either reconciles with existing surfaces or documents an
  intentional split in an OpenSpec change before shipping
