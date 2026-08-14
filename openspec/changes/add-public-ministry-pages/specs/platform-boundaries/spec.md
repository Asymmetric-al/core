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

All authenticated revision, attestation, review, preview, release, assignment,
settings, operations, adoption, and recovery behavior SHALL cross
`PublicMinistryPagesService`. Anonymous serving SHALL resolve the exact current
Page-locale release through the same domain boundary before Phase 5 renders or
uses cache. Browsers SHALL NOT receive direct grants to private Phase 22, CRM,
financial, assignment, response, measurement-occurrence, or CMS-admin tables.

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

Public serving SHALL compose one exact route, Page-locale release, D27
Site-family presentation activation, D2/Phase-10 admission, media and public
projection manifest. Admission SHALL occur before cache access. Positive
changes MAY converge through bounded freshness classes, but adverse changes
SHALL stop the affected new behavior first and SHALL never use stale-if-error,
slug guessing, locale prose fallback, or a legacy reader.
Every owner-labelled adverse cause SHALL enqueue one append-only exact-scope
convergence operation through transactionally coupled delivery. The operation
SHALL reference the owning disposition and pin desired generation, input digest,
idempotency identity, controlled-surface coverage, deadline, fenced attempts,
and residual-only recovery. Expiration requested, provider accepted, controlled
response observed, not verifiable, and external observation SHALL remain
distinct facts and SHALL NOT individually prove convergence.

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

Legacy-to-Phase-22 adoption SHALL use private, resumable, non-authoritative
preparation and shadow comparison over a complete Tenant, Legal Entity,
environment, Site, verified-host-set, and locale cohort. Every Page and shared
artifact SHALL receive one non-overlapping disposition. One idempotent,
generation-fenced CAS SHALL transfer public reader authority; no partial tenant
enablement, mixed reader, dual write, destructive rollback, or legacy fallback
is permitted afterward.
Coverage SHALL close over shared route maps, directories and indexes, sitemaps,
canonical/alternate-locale graphs, cache generations, and every Controlled
Public Surface. A cross-cohort artifact requires an atomically selectable,
generation-pinned partition; otherwise all dependent cases SHALL participate in
one coordinated shared-authority CAS. The selected Adoption Plan Version and
Coverage Manifest SHALL be immutable, content-addressed successors; corrections
SHALL create successors rather than mutate them or resolve through a floating
latest pointer.

A Compatible Legacy Page Release MAY preserve proved-safe legacy presentation
only through a certified one-time family-qualified adapter that freezes an
immutable D2 DTO and pins the exact D20 catalog, D3 profile, compatibility
renderer, content, locale, brand, managed references, and owner generations.
Request-time raw Payload or mutable legacy reads and unknown semantics SHALL be
ineligible. No new compatible-legacy release SHALL be created after cohort
cutover, and the next edit SHALL use an ordinary current-catalog successor.

#### Scenario: Preparation is incomplete

- **WHEN** one Page, route, asset, release, index artifact, or cached presentation
  lacks an exact disposition
- **THEN** cutover is blocked for that cohort
- **AND** current public authority remains unchanged

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

Writing assistance, first-party measurement, search, social presentation,
comments/reactions, notifications, provider invalidation, and external adapters
SHALL consume bounded release projections and SHALL fail independently. They
SHALL NOT approve or publish content, widen Phase 10 or Phase 12 access, create
financial truth, prove delivery or sharing, block Giving, or become a fallback
public reader. Data egress, retention, consent/objection, and provider use SHALL
remain purpose-specific and capability-honest.

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

Mission Control's Public Pages operations and setup/settings workspaces SHALL be
disposable projections over source-owned current facts. Each action SHALL route
to its owning contract and re-prove current permission and version. The
workspaces SHALL NOT create parallel health, task, workflow, settings, or
permission authority.

#### Scenario: One cause affects many Pages

- **WHEN** one profile, host, source, or provider cause affects several Pages
- **THEN** the operations projection coalesces impact around that owner cause
- **AND** repair updates the source rather than dismissing a duplicate status

#### Scenario: An administrator changes one setting

- **WHEN** a permitted owner-specific form is submitted
- **THEN** the owner creates a prospective successor by CAS
- **AND** the projection refreshes from that result without storing a second
  value

### Requirement: Phase 22 Editorial Recovery Is Fenced And Reference-Safe

One private non-semantic recovery buffer MAY exist per exact Page and locale
beneath the expected coherent working head. It SHALL use digest no-op
suppression, at most one in-flight write per exact generation, and late-write
fencing; it SHALL NOT advance a semantic head, freeze a candidate, create an
actor branch, or emit per-autosave audit/outbox facts. Governed Page collections
SHALL disable blind native version pruning. Cleanup MAY remove only reference-
proved scratch or inert prepares after authoritative recheck; ambiguous
reference closure SHALL preserve the content and create a private operational
exception.

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

Public progress SHALL use only a certified, purpose-specific owning-phase
projection, and every released MVP Page SHALL bind exactly one eligible Phase 13
Designation; an incomplete draft MAY exist but SHALL NOT release. Page availability, progress, Give selection, cart admission,
provider acceptance, settlement, support recognition, balance, payroll, and
payment SHALL remain distinct facts. Missing or stale financial data SHALL never
become zero, inferred currency conversion, or optimistic completion.

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
