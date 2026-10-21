# Platform Boundaries Delta

## ADDED Requirements

### Requirement: Phase 22 Separates Editorial Content From Public Authority

The CMS SHALL own authored content and compatible presentation revisions for
Public Ministry Pages. CRM and the applicable owning phases SHALL retain
operational subject, relationship, designation, financial, identity,
authorization, safety, and communication truth. Phase 22 SHALL own Page
identity, assignments, immutable editorial/release lineage, route and public
projection composition, current-serving admission, and adoption. A CMS publish
flag SHALL NOT constitute an eligible public release.

#### Scenario: CMS content appears ready to publish

- **WHEN** an authored CMS revision exists without a current Phase 22 release
- **THEN** the public runtime does not serve it
- **AND** release requires current scope, actor, safety, dependency, and CAS
  proof through `PublicMinistryPagesService`

#### Scenario: Operational truth changes

- **WHEN** an authoritative subject, assignment, Designation, financial,
  safety, or supporter fact changes
- **THEN** Phase 22 re-resolves or contains the affected projection
- **AND** it does not repair the owner by mutating a copied CMS value

### Requirement: Phase 22 Uses One Application Boundary For Private Editing And Public Serving

All authenticated revision, attestation, review, preview, release, assignment, settings, operations, adoption, and recovery behavior SHALL cross `PublicMinistryPagesService`.

Every clause in `openspec/contracts/platform-boundaries.md#contract-b0dee2b17457f195a3dc` MUST apply without exception.

#### Scenario: An authenticated actor saves Page work

- **WHEN** the actor submits a revision command
- **THEN** the service resolves current identity, tenant, legal entity, Site,
  Page, locale, assignment, action permission, and revision head
- **AND** the command cannot bypass those checks through Payload or Supabase

#### Scenario: A visitor requests a Page

- **WHEN** Phase 5 asks for the public presentation
- **THEN** the service returns only the exact admitted release/profile composite
- **AND** a missing or unproved admission returns a safe no-store outcome

#### Scenario: Newer work is saved during exact preview

- **WHEN** another editor saves after an actor opens one exact Revision or
  submitted candidate
- **THEN** preview remains pinned to the originally requested immutable version
- **AND** no Payload latest, mutable working head, or current public release is
  substituted as fallback

### Requirement: Phase 22 Public Composition Is Exact Gate-Before-Cache And Adverse-First

Public serving SHALL compose one exact route, Page-locale release, D27 Site-family presentation activation, D2/Phase-10 admission, media and public projection manifest.

Every clause in `openspec/contracts/platform-boundaries.md#contract-e3fe1903406c4bce0915` MUST apply without exception.

#### Scenario: A positive release propagates

- **WHEN** a newly released compatible Page is safe but one downstream cache is
  still refreshing
- **THEN** the system reports the exact bounded freshness class
- **AND** does not mislabel provider refresh as completed publication everywhere

#### Scenario: Safety narrows while cached content exists

- **WHEN** current Phase 10 or publication reach becomes more restrictive
- **THEN** pre-cache admission blocks the affected response immediately
- **AND** cleanup and provider invalidation remain observable separate outcomes

#### Scenario: Provider acceptance does not prove convergence

- **WHEN** a provider accepts expiration but an exact controlled response still
  serves the superseded generation or cannot be verified
- **THEN** the operation remains incomplete for that residual coverage
- **AND** bounded fenced recovery continues without force-success, blind retry,
  destructive rollback, or an older cache namespace

### Requirement: Phase 22 Adoption Transfers One Complete Public Reader Cohort

Legacy-to-Phase-22 adoption SHALL use private, resumable, non-authoritative preparation and shadow comparison over a complete Tenant, Legal Entity, environment, Site, immutable enumerated verified-host membership generation and digest, and locale cohort.

Every clause in `openspec/contracts/platform-boundaries.md#contract-56c06244372b57c09a69` MUST apply without exception.

#### Scenario: Preparation is incomplete

- **WHEN** one Page, route, asset, release, index artifact, or cached presentation
  lacks an exact disposition
- **THEN** cutover is blocked for that cohort
- **AND** current public authority remains unchanged

#### Scenario: Verified-host membership drifts after shadow proof

- **WHEN** the current Phase 2/24 host-membership generation or digest differs
  from the value pinned by the selected adoption evidence
- **THEN** final CAS aborts without changing public reader authority
- **AND** no host string or mutable membership query repairs the selected case

#### Scenario: A cutover response is lost

- **WHEN** the process crashes before learning whether the local CAS committed
- **THEN** recovery inspects the generation and manifest identity
- **AND** it resumes idempotently without executing a second authority change

#### Scenario: A shared artifact crosses the proposed cohort

- **WHEN** its owner cannot prove an atomically selectable generation-pinned
  partition for the exact cohort
- **THEN** every dependent case remains not ready
- **AND** the shared artifact participates in one coordinated authority CAS

#### Scenario: A compatible legacy release advances after cutover

- **WHEN** an editor changes content that was served through the one selected
  compatible-legacy release
- **THEN** the next release uses an ordinary current-catalog successor
- **AND** no mutable legacy read, second compatibility release, or fallback
  reader is created

### Requirement: Phase 22 Optional Services Never Gain Publication Or Financial Authority

Writing assistance, first-party measurement, search, social presentation, comments/reactions, notifications, provider invalidation, and external adapters SHALL consume bounded release projections and SHALL fail independently.

Every clause in `openspec/contracts/platform-boundaries.md#contract-f8a5a3c28523dcbbc16e` MUST apply without exception.

#### Scenario: An optional service is unavailable

- **WHEN** measurement, AI, search, comments, or a provider fails
- **THEN** the owning Page and Giving flows continue when their own authorities
  remain healthy
- **AND** the UI reports only the failed capability's honest state

#### Scenario: An optional result arrives late

- **WHEN** an AI suggestion, measurement POST, index build, social-card build,
  or response write returns after its source authority changed
- **THEN** exact scope and source version are re-proved before acceptance
- **AND** stale work cannot mutate or expose the current release

#### Scenario: Translation source language is uncertain

- **WHEN** provider detection conflicts with Phase-24-owned locale truth or the
  selected range contains materially mixed languages
- **THEN** the actor confirms or separates the exact ranges before any egress
- **AND** the service does not guess, flatten the content, or switch the
  provider, model, locale, or certified language pair

### Requirement: Phase 22 Operations And Settings Remain Derived Projections

Mission Control's Public Pages operations and setup/settings workspaces SHALL be disposable projections over source-owned current facts.

Every clause in `openspec/contracts/platform-boundaries.md#contract-ac554d91b10698f92025` MUST apply without exception.

#### Scenario: One cause affects many Pages

- **WHEN** one profile, host, source, or provider cause affects several Pages
- **THEN** the operations projection coalesces impact around that owner cause
- **AND** repair updates the source rather than dismissing a duplicate status

#### Scenario: Sibling-scope causes exist before aggregation

- **WHEN** the operations workspace prepares rows or aggregates for one exact
  authorized Site and locale
- **THEN** structural scope and current authorization exclude sibling evidence
  before grouping, counting, searching, exporting, notifying, linking, badging,
  subscribing, or caching
- **AND** a host, route, selected row, task link, or prior authorization cannot
  widen the result

#### Scenario: An administrator requests a portable publication audit

- **WHEN** the actor is currently authorized for the exact operations scope
- **THEN** the product export uses its versioned schema, stable opaque IDs,
  immutable lineage, source provenance, and privacy-filtered record families
- **AND** an infrastructure backup cannot substitute for that result

#### Scenario: An owner adapter is missing or incompatible

- **WHEN** a participating D1–D21 owner has no compatible current adapter
- **THEN** operations coverage is `Partial` or `Unavailable`
- **AND** production authorization fails for a core or launch-selected owner
  without fabricating a tenant task or reading the owner's raw table

#### Scenario: An administrator changes one setting

- **WHEN** a permitted owner-specific form is submitted
- **THEN** the owner creates a prospective successor by CAS
- **AND** the projection refreshes from that result without storing a second
  value

### Requirement: Phase 22 Editorial Recovery Is Fenced And Reference-Safe

One private non-semantic recovery buffer MAY exist per exact Page and locale beneath the expected coherent working head.

Every clause in `openspec/contracts/platform-boundaries.md#contract-5396fff1169250154520` MUST apply without exception.

#### Scenario: A late autosave loses its generation race

- **WHEN** an older in-flight write returns after a newer exact recovery-buffer
  generation is authoritative
- **THEN** late-write fencing prevents it from replacing the current buffer
- **AND** it creates no semantic Revision, candidate, notification, or public
  effect

#### Scenario: Cleanup lacks complete reference closure

- **WHEN** references to scratch content or an inert prepare are missing,
  contradictory, or changing
- **THEN** cleanup preserves the item and opens a private exception
- **AND** age, actor revocation, task state, or provider retention settings do
  not imply deletion eligibility

### Requirement: Phase 22 Financial And Giving State Remains Capability-Honest

Public progress SHALL use only a certified, purpose-specific owning-phase projection, and every released MVP Page SHALL bind exactly one eligible Phase 13 Designation; an incomplete draft MAY exist but SHALL NOT release.

Every clause in `openspec/contracts/platform-boundaries.md#contract-bbd55362eabde3c8450d` MUST apply without exception.

#### Scenario: Progress is unavailable but giving is eligible

- **WHEN** the Page's optional progress source cannot prove current coverage
  while its Designation remains eligible
- **THEN** the Page omits or marks progress unavailable
- **AND** the independently admitted Give action may remain available

#### Scenario: Giving eligibility becomes stale

- **WHEN** Phase 13 cannot re-prove the exact Designation before a consequential
  handoff
- **THEN** Give is disabled or checkout rejects the action before provider work
- **AND** the Page never claims a gift, settlement, or payment occurred
