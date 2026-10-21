# Multi-Site Foundation platform-boundaries Delta

## ADDED Requirements

### Requirement: Site Is A Tenant-Owned Presentation And Attribution Entity

The platform SHALL model Site as a first-class entity beneath Tenant for public presentation and giving attribution.

Every clause in `openspec/contracts/platform-boundaries.md#contract-6d422b44a032b307a303` MUST apply without exception.

#### Scenario: A public Site changes presentation

- GIVEN a Site has accepted gifts with frozen financial facts and attribution
- WHEN its authorized owners change domains, locale policy, or branding
- THEN historical Site attribution and financial ownership remain intact
- AND future requests use current owner-qualified scope without treating CMS
  fields or provider success as domain or financial authority

#### Scenario: A future import maps a SiteStacker website

- GIVEN an import source describes a website as a SiteStacker site channel
- WHEN its public-presence meaning is mapped into Asym
- THEN it maps approximately to one Tenant-owned Site without a second channel
  level
- AND Entry Method, Source Code, and Designation retain their separate meanings
  without granting identity, money, or authorization ownership to the Site
