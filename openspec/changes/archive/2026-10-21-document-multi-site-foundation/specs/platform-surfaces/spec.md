# Multi-Site Foundation platform-surfaces Delta

## MODIFIED Requirements

### Requirement: Mission Control As The Staff Operations Surface

Mission Control SHALL be the main staff operations console and the most heavily used daily surface in the platform.

Every clause in `openspec/contracts/platform-surfaces.md#contract-d7751393e2d5158f854e` MUST apply without exception.

#### Scenario: A new capability carries operational depth

- GIVEN a feature includes staff controls, organization-wide visibility,
  exception handling, reporting impact, or administrative setup
- WHEN an agent decides where that feature belongs first
- THEN Mission Control is the primary surface unless product truth is
  explicitly changed in OpenSpec
- AND other surfaces may expose role-appropriate slices without becoming the
  conceptual home of that depth

### Requirement: Donor Portal As The Donor Self-Service Surface

The donor portal SHALL be the donor self-service surface.

Every clause in `openspec/contracts/platform-surfaces.md#contract-ccf6ed5bf8f1875ad962` MUST apply without exception.

#### Scenario: A donor wants to complete a common giving task

- GIVEN a donor wants to update a recurring gift, change a payment method, find
  a receipt, or review giving history
- WHEN an agent designs or changes the donor portal flow
- THEN the action is surfaced clearly in donor language and completed without
  staff-style setup, review queues, or operational clutter
- AND the portal remains focused on donor self-service rather than internal
  administration

### Requirement: Missionary Workspace As The Missionary Support-Raising Surface

The missionary workspace SHALL be the fundraising and communication home for missionaries.

Every clause in `openspec/contracts/platform-surfaces.md#contract-cc75810832968927b8ec` MUST apply without exception.

#### Scenario: A capability would add staff-style depth to the missionary experience

- GIVEN a proposal would expose the missionary surface to staff-style controls,
  broad operational setup, or organization-wide administrative detail
- WHEN an agent decides whether that capability belongs in the missionary
  workspace
- THEN the workspace keeps only the depth that directly helps missionaries raise
  support, communicate clearly, and manage what they are authorized to control
- AND the broader operational depth stays conceptually anchored in Mission
  Control

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
- THEN the same Tenant Donor Portal Host and Tenant Donor Account Brand present
  the donor's authorized history across both Sites
- AND neither entry Site creates a separate account or reskins the account shell
