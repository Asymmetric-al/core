# Platform Surfaces And User Experience Intent

## Purpose

Define durable **experience intent** for each major surface in this monorepo.
Route groups and folder names are implementation details; this spec states what
each app is for and what “good” feels like for users.

Canonical structural detail (paths, packages, diagrams) lives in
`docs/guides/architecture/overview.md` and should stay aligned with this intent.

## Requirements

### Requirement: Mission Control As The Staff Operations Surface

Mission Control SHALL be the main staff operations console and the most heavily
used daily surface in the platform. It MUST serve as the control center for the
organization's operations and the conceptual home of operational depth.

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

The public tenant website SHALL be the public face of the ministry. It MUST be
tenant-branded, highly customizable, content-managed, and tightly connected to
missionary pages, project pages, public storytelling, and giving flows.

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

### Requirement: Surface Ownership And Shared Records

The same underlying record SHALL be allowed to appear across multiple surfaces
according to role and privilege without changing its conceptual home.

When the same information appears in both a deeper staff surface and a narrower
logged-in surface, the surface that owns the deeper operational purpose SHALL
remain the conceptual home. Narrower surfaces SHALL carry only the slice needed
for that user's role and task.

Missionary and project pages MUST remain part of the public tenant website
experience even when related edits or submissions begin in missionary or admin
surfaces.

#### Scenario: A feature could live in Mission Control or the missionary workspace

- GIVEN the same record or capability could appear in both Mission Control and
  the missionary workspace
- WHEN an agent decides where it belongs first
- THEN the surface that owns the deeper operational purpose keeps conceptual
  ownership
- AND the missionary workspace carries only the role-appropriate view or action
  needed by the missionary

#### Scenario: A missionary updates public page content

- GIVEN a missionary updates a photo, bio, or page content they are allowed to
  control
- WHEN that change moves through the connected review or publication flow
- THEN the public tenant website remains the public-facing destination of the
  page experience
- AND the product does not invent a second conceptual owner for that page in a
  logged-in surface

### Requirement: Cross-Surface Continuous Flows

Important actions SHALL feel like one connected flow across public, donor,
missionary, and staff experiences. The platform MUST avoid manual re-entry,
broken handoff, and confusion about where a user goes next.

The public giving flow MUST continue cleanly through donor confirmation, donor
history, staff awareness, and missionary-relevant visibility as one connected
product flow. Likewise, staff actions with downstream effects MUST reflect
across the related surfaces without requiring side-channel correction.

Ministry Updates MAY appear across surfaces according to visibility and
moderation settings. They SHALL remain part of one connected product flow even
when missionaries manage them, admins review them, public pages display them,
donor experiences surface them, or communication flows reference them.

#### Scenario: A public gift becomes part of the connected ministry flow

- GIVEN a donor gives through the public tenant website
- WHEN the donor moves into follow-up experiences
- THEN the donor sees a connected path through confirmation and donor history
- AND staff and missionary-relevant experiences reflect that same flow rather
  than acting like detached products

#### Scenario: An admin triggers a refund

- GIVEN an admin triggers a refund or similar corrective action from the staff
  operations surface
- WHEN the result affects donor-visible history or missionary-relevant support
  context
- THEN the connected surfaces reflect the new state without manual re-entry
- AND the platform does not rely on side-channel cleanup to keep the experience
  coherent

### Requirement: Coherence, Visibility, And Simplicity Across Surfaces

The major surfaces SHALL feel like one connected platform rather than separate
products. Shared concepts MUST use shared product language and predictable
behavior across surfaces unless an intentional difference is explicitly defined
in OpenSpec.

Role-based visibility MUST shape every surface. Users SHALL see the depth that
fits their role, and staff depth MUST NOT leak into donor or missionary
surfaces.

Hidden capability MUST be handled cleanly so the product still feels
intentional, coherent, and complete rather than broken, chopped apart, or half
revealed.

#### Scenario: A role should not see certain depth

- GIVEN a user does not have the role or privilege for certain operational depth
- WHEN an agent designs how that surface behaves for the user
- THEN the product hides or simplifies that depth cleanly within the intended
  surface experience
- AND the result feels purposeful rather than like missing pieces of a staff
  tool leaked into the wrong place

#### Scenario: Naming or behavior drift would make the platform feel like separate products

- GIVEN a new flow introduces different names, states, or mental models for the
  same concept across staff, donor, missionary, or public surfaces
- WHEN an agent decides whether that difference is acceptable
- THEN they push back toward shared product language and connected behavior
- AND they reject drift that would make the platform feel like separate apps
  with disconnected logic or unsynced records

### Requirement: Outbound Communications Are A Governed Platform Channel

Outbound communications — email today, additional channels as adopted — SHALL
be treated as a governed channel of the connected platform rather than as a
fifth surface.

Communications that reach donors, missionaries, or the public MUST use shared
product language, honest states, and tenant-controlled templates and policy,
and they MUST reflect the same underlying truth as the surfaces they reference.

#### Scenario: An outbound email would diverge from surface truth

- GIVEN an outbound communication describes gift, support, or account state
- WHEN it is composed or sent
- THEN it reflects the same operational truth the platform surfaces show
- AND it does not soften, overstate, or contradict the real state for the sake
  of nicer copy
