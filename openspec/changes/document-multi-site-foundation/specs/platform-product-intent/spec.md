# Multi-Site Foundation platform-product-intent Delta

## MODIFIED Requirements

### Requirement: Unified Platform Span

The platform SHALL unify four major areas at a high level as one ministry
system rather than four unrelated products:

- Mission Control / admin
- the public tenant website experience through one or more Tenant-owned Sites
- the donor experience
- the missionary workspace

Site SHALL be a first-class entity beneath Tenant for public presentation and
giving attribution. Every Tenant MUST have at least one Site and exactly one
Default Site, and MAY operate additional Sites. Site MUST NOT be a Tenant,
billing account, payment identity, Legal Entity, or authorization boundary.
Mission Control, Donor Portal, and Missionary Workspace MUST NOT be Sites;
donor accounts and authorized history SHALL stay Tenant-wide, with one Tenant
account experience that entry Sites neither fragment nor reskin.

Work inside the core repo MUST keep those areas aligned as one coherent
platform span. Agents MUST NOT treat any major area as an optional add-on that
can drift independently without an explicit product decision.

#### Scenario: A change would improve one surface while weakening platform coherence

- GIVEN a change improves one of the four major areas
- WHEN it would silently redefine the others as out of scope, duplicate their
  job, or fork vocabulary and mental models across areas
- THEN the agent redesigns or rescopes so the four areas still read as one
  ministry platform
- AND they document cross-area impact before implementation proceeds

#### Scenario: An organization adds a regional public Site

- GIVEN a Tenant already has a Default Site and connected operational surfaces
- WHEN it adds a regional public presence with its own presentation and giving
  entry points
- THEN the new presence is a Site beneath the same Tenant
- AND it adds public presentation and attribution without creating another
  Tenant, billing account, payment identity, or authorization boundary
- AND donor accounts and authorized history remain one Tenant-wide experience
