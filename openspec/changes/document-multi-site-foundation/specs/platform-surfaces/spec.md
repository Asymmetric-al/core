# Multi-Site Foundation platform-surfaces Delta

## MODIFIED Requirements

### Requirement: Mission Control As The Staff Operations Surface

Mission Control SHALL be the main staff operations console and the most heavily
used daily surface in the platform. It MUST serve as the control center for the
organization's operations and the conceptual home of operational depth.
Mission Control MUST NOT be modeled as a Site.

Mission Control MUST carry the deepest staff capabilities across CRM,
contributions, Support Hub, communications, reporting, content administration,
documents, mobilization, automations, and tenant configuration. Support Hub
SHALL be conceptually anchored in Mission Control as the staff home for
support conversations and inbound email routing.

Mission Control MUST NOT be treated as optional back-office overflow. When a
capability carries organization-wide operational depth, staff control,
exception-handling, or administrative truth, its first conceptual home SHALL be
Mission Control.

#### Scenario: A new capability carries operational depth

- GIVEN a feature includes staff controls, organization-wide visibility,
  exception handling, reporting impact, or administrative setup
- WHEN an agent decides where that feature belongs first
- THEN Mission Control is the primary surface unless product truth is
  explicitly changed in OpenSpec
- AND other surfaces may expose role-appropriate slices without becoming the
  conceptual home of that depth

### Requirement: Donor Portal As The Donor Self-Service Surface

The donor portal SHALL be the donor self-service surface. It MUST let donors
control their giving, recurring gifts, payment methods, receipts, statements,
and related self-service actions without exposing staff-style complexity.

The donor portal SHALL feel calm, clear, confidence-building, and easy to use.
It MUST highlight the most common donor actions clearly and MUST NOT bury them
inside staff workflows, internal terminology, or operational detours.

The Donor Portal MUST NOT be modeled as a Site. Donor accounts and authorized
giving history SHALL remain Tenant-wide across all Sites. Per Phase 24 D57/D58,
each activated Tenant/environment SHALL use exactly one verified Tenant Donor
Portal Host and one stable Tenant Donor Account Brand. Neither the Default Site
nor the entry Site SHALL fragment or reskin that account experience; source-Site
attribution MAY remain visible on authorized gift records.

The donor portal MUST NOT become a staff operations surface. It SHALL present
only the depth needed for a donor to manage their relationship to giving with
clarity and confidence.

#### Scenario: A donor wants to complete a common giving task

- GIVEN a donor wants to update a recurring gift, change a payment method, find
  a receipt, or review giving history
- WHEN an agent designs or changes the donor portal flow
- THEN the action is surfaced clearly in donor language and completed without
  staff-style setup, review queues, or operational clutter
- AND the portal remains focused on donor self-service rather than internal
  administration

### Requirement: Missionary Workspace As The Missionary Support-Raising Surface

The missionary workspace SHALL be the fundraising and communication home for
missionaries. It MUST help missionaries understand support progress, donor
information, recent giving, tasks, Ministry Updates, and the public pages or
projects they are allowed to manage.

The missionary workspace MUST stay focused on what helps a missionary
understand support, respond to donors, manage updates, and manage the public
presence they are authorized to control.

The Missionary Workspace MUST NOT be modeled as a Site. Managing public pages
from this workspace SHALL NOT turn the workspace into their public destination.

The missionary workspace MUST NOT become a replacement for Mission Control. It
SHALL avoid staff-style operational depth that would overload missionaries or
turn the workspace into a second admin console.

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

The public tenant website SHALL be the public face of the ministry. A Tenant
MAY operate one or more Sites, each with its own domains, branding,
language/locale policy, public content, and giving entry points. Every Tenant
MUST have at least one Site and exactly one Default Site. Each Site MUST be
tenant-branded, highly customizable, content-managed, and tightly connected to
missionary pages, project pages, public storytelling, and giving flows.

Gifts entered through a public Site MUST retain attribution to that entry Site
without changing their Designation or financial ownership. The Default Site
SHALL be a workspace/default-attribution convenience, never a fallback for an
unknown public host. Public Site presentation SHALL follow the explicit Phase
24 amendments: operational Domain authority governs host bindings (D72), public
routes and content use exact admitted locales without cross-language fallback
(D15/D66), the applicable release authority pins complete immutable Site Brand
Versions (D59), and payment owners independently qualify donor presentment
currency (D61). Site count SHALL NOT determine payment-account count.

The public tenant website MUST remain a public-facing ministry experience. It
MUST NOT drift into a logged-in operational surface or become a disguised staff
tool.

Public giving MUST feel native to the tenant website rather than like a
disconnected external tool. Missionary and project pages SHALL conceptually
belong to the public tenant website surface even when authorized users initiate
or edit related changes from other surfaces.

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
