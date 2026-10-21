# Multi-Site Foundation platform-product-intent Delta

## MODIFIED Requirements

### Requirement: Unified Platform Span

The platform SHALL unify Mission Control, Tenant-owned public Sites, the donor experience, and the missionary workspace as one ministry system.

Every clause in `openspec/contracts/platform-product-intent.md#contract-9475d9f5f1bcd7b6fd2e` MUST apply without exception.

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
