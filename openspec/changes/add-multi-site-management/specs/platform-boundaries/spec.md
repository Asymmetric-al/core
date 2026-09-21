# Delta for Platform Boundaries

## ADDED Requirements

### Requirement: Site Context Never Owns Money Authorization Or Provider Truth

Site, domain, locale, brand, public generation, CMS content, browser state, and
provider evidence MUST remain presentation, attribution, routing, or execution
contexts only. They MUST NOT select or redefine Legal Entity, Settlement Account
Binding, Stripe account, merchant, settlement, payout, bank, receipt issuer,
ledger, accounting, donor authorization, or historical money ownership.

Asym Postgres MUST own operational Site/domain/locale/currency policy and public
head truth through structurally scoped command boundaries. Payload, Vercel, DNS,
Stripe, caches, analytics, and UI projections MUST be isolated behind owner-
specific adapters/read models and MUST NOT write product authority back. A
privileged/server path MUST enforce the same Tenant/scope/business boundary even
where the database role can bypass RLS.

#### Scenario: A Site changes its domain locale or brand

- WHEN any Site presentation fact changes
- THEN no accepted gift, recurring agreement, Legal Entity, connected-account
  binding, receipt, ledger, settlement, or accounting fact changes
- AND future financial admission independently resolves and freezes its exact
  owner facts

#### Scenario: A provider reports success

- WHEN Vercel, DNS, Stripe, or Payload returns a successful result
- THEN the appropriate Core owner may record bounded evidence or complete a
  preauthorized effect
- AND provider success alone cannot advance Site lifecycle, public head, host
  claim/role, currency policy, accepted money, or authorization
