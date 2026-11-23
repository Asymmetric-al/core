# Delta for Platform Surfaces

## MODIFIED Requirements

### Requirement: Donor Portal As The Donor Self-Service Surface

The donor portal SHALL be the donor self-service surface.

Every clause in `openspec/contracts/platform-surfaces.md#contract-55420748c0d4a6018d5a` MUST apply without exception.

#### Scenario: A donor wants to complete a common giving task

- GIVEN a donor wants to update a recurring gift, change a payment method, find
  a receipt, or review giving history
- WHEN an agent designs or changes the donor portal flow
- THEN the action is surfaced clearly in donor language and completed without
  staff-style setup, review queues, or operational clutter
- AND the portal remains focused on donor self-service rather than internal
  administration

#### Scenario: The donor account lives on the Tenant's home domain

- GIVEN a Tenant has designated `ministry.org` as its verified home domain
- WHEN a donor signs in, recovers a password, or opens their giving history
- THEN every page and link of that flow is on `ministry.org`, under the account
  path
- AND no step uses, redirects through, or falls back to an Asym address

### Requirement: Public Tenant Website As The Public Ministry Surface

The public tenant website SHALL be the public face of the ministry.

Every clause in `openspec/contracts/platform-surfaces.md#contract-31f7d1c749c3160ca2b2` MUST apply without exception.

#### Scenario: A public website change starts to behave like an operational surface

- GIVEN a proposal would solve a staff or authenticated workflow by placing more
  operational depth on the public tenant website
- WHEN an agent evaluates whether it fits the public surface
- THEN they preserve the website as a branded, public-facing ministry
  experience centered on discovery, storytelling, pages, and giving
- AND they move operational depth back to staff or role-appropriate surfaces
  instead of letting the website become a public admin console

#### Scenario: A Tenant operates two branded public Sites

- GIVEN one Tenant operates two Sites with independently admitted domains,
  brands, locales, and giving entry points
- WHEN visitors discover ministry stories and give through each Site
- THEN each public experience uses its exact admitted Site presentation
- AND each accepted gift retains the correct entry-Site attribution and its
  independently resolved financial ownership and Designation

#### Scenario: A donor reviews gifts from multiple Sites

- GIVEN a donor has authorized gifts attributed to two Sites in the same Tenant
- WHEN the donor follows either Site's validated account action
- THEN the same designated Tenant home domain and Tenant Donor Account Brand
  present the donor's authorized history across both Sites
- AND neither entry Site creates a separate account or reskins the account shell
