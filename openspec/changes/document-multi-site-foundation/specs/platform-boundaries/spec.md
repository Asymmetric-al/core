# Multi-Site Foundation platform-boundaries Delta

## ADDED Requirements

### Requirement: Site Is A Tenant-Owned Presentation And Attribution Entity

The platform SHALL model Site as a first-class entity beneath Tenant for public
presentation and giving attribution. Every Tenant MUST have at least one Site
and exactly one Default Site, and MAY operate additional Sites. A Site MUST NOT
be a Tenant, billing account, payment identity, or authorization boundary.
Mission Control, Donor Portal, and Missionary Workspace MUST NOT be Sites.

Asym Postgres in `public.*` MUST own operational Site identity, Tenant scope,
CRM and money truth. CMS MUST own authored public content and presentation,
aligned to the operational Site identity without becoming operational authority.
Per Phase 24 D72, operational Domain authority MUST own exact-host bindings and
Primary/Redirect Site Domain roles; CMS and Site fields MAY expose read-only
projections but MUST NOT become mutable domain authority.

A Site MUST NOT own or select Legal Entity, Settlement Account Binding,
merchant/payment account, settlement, bank, accounting, receipt issuer, or
ledger identity. Those owners MUST independently resolve and freeze their exact
financial facts. Domain, locale, branding, or presentment-policy changes MUST
NOT rewrite accepted gifts or historical attribution. The explicit Phase 24
amendments govern domain, exact-locale publication, Site Brand release, and
proof-qualified donor presentment; this foundation SHALL NOT authorize live
multi-currency giving or infer qualification from Site configuration.

Site, Entry Method, Source Code, and Designation MUST remain independent
attribution axes: where giving entered, how it entered, what drove it, and what
it funds. For future import interpretation, SiteStacker's site channel is
approximately an Asym Site. The platform MUST NOT introduce a second
Site/channel hierarchy or revive a generic gift channel field.

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
