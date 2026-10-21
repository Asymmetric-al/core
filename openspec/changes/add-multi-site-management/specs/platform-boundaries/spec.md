# Delta for Platform Boundaries

## ADDED Requirements

### Requirement: Site Context Never Owns Money Authorization Or Provider Truth

Site, domain, locale, brand, public generation, CMS content, browser state, and provider evidence MUST remain presentation, attribution, routing, or execution contexts only.

Every clause in `openspec/contracts/platform-boundaries.md#contract-eae20970244c12e53074` MUST apply without exception.

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
