# Web Studio CMS Capability

## ADDED Requirements

### Requirement: D1 Page-Local Composition Releases One Coherent Site Generation

The platform SHALL model one stable Site-scoped `Page` identity separately from its exact-locale `Editorial Revision` and `Page Placement Revision`.

Every clause in `openspec/contracts/web-studio-cms.md#contract-e3bafa4cb52e4493c8ed` MUST apply without exception.

#### Scenario: A qualified Primary Domain successor spans public locales

- **GIVEN** the Phase 24 D73 owner has prepared compatible origin successors for
  every current public locale and all exact Domain and generation heads
- **WHEN** its current-proofed domain command commits
- **THEN** the Domain role generation and complete expected public-origin head
  cohort advance atomically through the owning contract
- **AND** unrelated content drafts and enabled nonpublic locales remain unchanged

#### Scenario: A prepared same-Tenant Domain move loses a final head race

- **GIVEN** the Phase 24 D76 Moving barrier has been durably established and
  acknowledged for the exact prepared source/destination closure
- **WHEN** expected Domain or public-head proof no longer matches before the
  final authority swap
- **THEN** no partial source/destination favorable head swap commits
- **AND** the command retains the existing adverse state and follows D76's
  receipt-backed recovery rather than claiming nothing changed or publishing
  drafts through D10

#### Scenario: An editor publishes a valid Page successor

- **GIVEN** one authorized editor has an acknowledged exact-locale Page draft
  and every dependency is current and qualified
- **WHEN** the editor previews and publishes that exact candidate
- **THEN** D1 seals one immutable generation and advances the expected locale
  serving head once
- **AND** the public reader returns only the exact activated artifact closure

#### Scenario: Candidate proof or activation fails

- **GIVEN** a Page candidate contains a stale input, scope mismatch, invalid
  reference, compile/storage failure, or lost serving-head race
- **WHEN** publication runs
- **THEN** no part of the candidate becomes public and the prior generation
  remains live
- **AND** staff receive the owning cause and truthful statement of what stayed
  public

### Requirement: D2 Hierarchical Paths Are Staged And Atomically Released

Each exact-locale Page Placement Revision SHALL own its parent Page, normalized local web-address segment and sibling order.

Every clause in `openspec/contracts/web-studio-cms.md#contract-f9ab176632148bded063` MUST apply without exception.

#### Scenario: Staff move a Page with descendants

- **GIVEN** an authorized editor selects a valid new parent for a Page whose
  descendants have released paths
- **WHEN** the editor reviews and publishes the prepared move
- **THEN** the moved Page and every affected descendant path and breadcrumb
  change in one generation
- **AND** no descendant requires a separate approval or request-time mutation

#### Scenario: A proposed hierarchy is unsafe

- **GIVEN** a placement would create a cycle, reserved or duplicate path,
  cross-scope parent, invalid segment, or excessive depth
- **WHEN** any UI, API, import, migration or service command attempts it
- **THEN** the platform rejects the successor before release
- **AND** preserves the private draft with the exact conflicting cause

#### Scenario: A large branch is prepared

- **GIVEN** a placement change affects at least 2,000 descendants
- **WHEN** staff prepare and inspect its impact
- **THEN** the review and compiler remain bounded, searchable and resumable
- **AND** public requests perform no descendant writes or recursive source work

### Requirement: D3 Same-Page Continuity And Exact-Path Repair Stay Bounded

Every released predecessor path for the same Page SHALL remain reserved and resolve directly to that Page's current eligible canonical path without a chain, expiry or automatic reclamation.

Every clause in `openspec/contracts/web-studio-cms.md#contract-780406e83ade58ca43a0` MUST apply without exception.

#### Scenario: A visitor follows an old address after a move

- **GIVEN** a Page has a previously released path and a newer eligible canonical
  path in the active generation
- **WHEN** a visitor requests the predecessor with GET or HEAD
- **THEN** the request resolves directly to the Page's current canonical route
- **AND** no mutable source lookup or redirect chain is traversed

#### Scenario: Staff repair one legacy path

- **GIVEN** one exact historical path is unused and one ordinary target Page is
  eligible in the same Site and locale
- **WHEN** an authorized actor publishes the repair
- **THEN** the active generation resolves that exact path by stable target
  identity
- **AND** any wildcard, external, query-transforming, chained or conflicting
  request is rejected while the prior route state remains live

#### Scenario: A Page is unpublished without a replacement

- **GIVEN** staff deliberately choose no replacement for a Page leaving public
  service
- **WHEN** the unpublish successor activates
- **THEN** former Page addresses return the Site's branded not-found experience
- **AND** the system does not invent an alternative destination

### Requirement: D4 Navigation Revisions Remain Independent And Page-Aware

A provider-neutral immutable `Navigation Revision` SHALL own visitor-menu membership, menu-local copy, purpose, grouping, destination and order.

Every clause in `openspec/contracts/web-studio-cms.md#contract-7331b2034fc3ed5560fd` MUST apply without exception.

#### Scenario: A Page is added to Navigation from Page context

- **GIVEN** an editor is authorized for the Page and the relevant Navigation
  draft
- **WHEN** the editor chooses Add to navigation
- **THEN** the operation updates the one expected Navigation Revision
- **AND** the Page gains no duplicate menu-membership or label field

#### Scenario: A referenced Page moves or becomes ineligible

- **GIVEN** a Navigation Link references a stable managed Page identity
- **WHEN** the Page moves or its owner withdraws current public eligibility
- **THEN** a move resolves through the Page's new released route while adverse
  ineligibility suppresses or blocks the item
- **AND** Navigation history is not rewritten or silently relabelled

### Requirement: D5 Navigation Has Two Purposes And Link-Or-Group Composition

The platform SHALL expose exactly `Primary Navigation` and `Footer Navigation`.

Every clause in `openspec/contracts/web-studio-cms.md#contract-91fa56e1513a5b055c38` MUST apply without exception.

#### Scenario: Staff compose a bounded menu

- **GIVEN** an editor is working in Primary or Footer Navigation
- **WHEN** the editor adds managed Links and one-level Groups and reorders them
- **THEN** the resulting revision contains only the admitted Link-or-Group
  grammar
- **AND** every operation has an accessible non-drag path

#### Scenario: Invalid menu structure is submitted

- **GIVEN** an input contains a nested Group, destination-bearing Group,
  child-bearing Link, second prominent Primary action, or destructive nonempty
  Group removal
- **WHEN** any write path validates it
- **THEN** the platform rejects the successor with a specific repair cause
- **AND** the prior Navigation draft and live generation remain intact

### Requirement: D6 Ordinary Content Uses Immutable Page Or Article Families

Ordinary content SHALL use exactly `general_page`, displayed as **Page**, and `article`, displayed as **Article**.

Every clause in `openspec/contracts/web-studio-cms.md#contract-47cdc352e6a244114417` MUST apply without exception.

#### Scenario: An editor starts ordinary content

- **GIVEN** the entry point already identifies New Page or New Article
- **WHEN** the editor creates content
- **THEN** the platform selects the corresponding immutable family without a
  redundant family question
- **AND** offers only compatible authorized starters and semantic controls

#### Scenario: A released family change is attempted

- **GIVEN** an ordinary Page or Article has a released generation
- **WHEN** an actor tries to mutate its family or apply a starter as live
  inheritance
- **THEN** the operation is rejected
- **AND** any correction proceeds only through explicit replacement or a
  qualified non-auto-publishing migration

### Requirement: D7 Composition Uses A Closed Versioned Semantic Catalog

The launch catalog SHALL contain Hero, Rich Text, Media, Gallery, Call to Action, Cards, FAQ, Quote and Impact Statistics.

Every clause in `openspec/contracts/web-studio-cms.md#contract-6035b301d9bd08f33243` MUST apply without exception.

#### Scenario: An editor composes a family-qualified Page

- **GIVEN** an editor opens the section chooser for one ordinary family
- **WHEN** the editor inserts, duplicates, reorders or removes sections
- **THEN** only that family's admitted semantic types and constraints apply
- **AND** identity, focus, announcements and recovery remain correct without
  requiring drag

#### Scenario: Unknown or invalid section data is encountered

- **GIVEN** a source contains an unknown schema version, invalid Hero placement,
  arbitrary style/layout field, nested v1 content, unqualified v2 structure or unsafe reference
- **WHEN** it is saved, imported, migrated, previewed or compiled
- **THEN** the affected successor fails closed with one exact cause
- **AND** unknown retained source is quarantined privately rather than silently
  dropped or publicly guessed

### Requirement: D8 Reusable Sections Are Explicit Shallow Shared Leaves

Every family-qualified D7 leaf except Hero MAY become one presentation-neutral `Reusable Section` scoped to exact Tenant × environment × Site × locale.

Every clause in `openspec/contracts/web-studio-cms.md#contract-9ea890037b489436513e` MUST apply without exception.

#### Scenario: An editor changes shared content

- **GIVEN** one released Reusable Section has qualified placements on multiple
  Pages in the same Site and locale
- **WHEN** an authorized editor chooses Change every use and publishes the
  shared successor
- **THEN** D1 advances every qualified active use coherently or none
- **AND** unrelated Page drafts remain private

#### Scenario: One Page needs an independent variation

- **GIVEN** a Page placement references a Reusable Section
- **WHEN** the editor chooses Make a local copy
- **THEN** the placement receives fresh Page-local semantic identity and no
  longer follows shared authority
- **AND** the shared subject and its other uses remain unchanged

### Requirement: D9 Bespoke Presentation Uses Certified Site-Bound Packages

A `Presentation Package` SHALL be source-controlled presentation code admitted as first-party only after qualification for one exact Tenant × environment × Site.

Every clause in `openspec/contracts/web-studio-cms.md#contract-bbf615437eb7dcf8fcee` MUST apply without exception.

#### Scenario: A bespoke package is qualified

- **GIVEN** a tenant design team supplies source-controlled presentation code
  and complete manifest evidence
- **WHEN** qualification proves exact scope, dependencies, isolation,
  accessibility, performance, hydration, SSR/no-JS and fallbacks
- **THEN** the package becomes available for candidate review
- **AND** it remains inactive until D10 selects it through D1

#### Scenario: Presentation code crosses an authority boundary

- **GIVEN** a package imports private data/auth clients, performs arbitrary
  network or write work, owns routes/money/publication, or lacks compatible
  evidence
- **WHEN** it is built, previewed or activated
- **THEN** qualification or candidate preparation fails closed
- **AND** the last known-good public package remains active without silent
  substitution

### Requirement: D10 Site Design Activates For The Complete Locale Cohort

One immutable `Site Presentation Activation Manifest` SHALL cover the exact current public-locale census and a proved disposition for every enabled nonpublic locale.

Every clause in `openspec/contracts/web-studio-cms.md#contract-1f40fac9025b0f1f73d5` MUST apply without exception.

#### Scenario: A complete Site design is activated

- **GIVEN** one candidate package is qualified for every current public locale
  and every enabled nonpublic locale has a proved disposition
- **WHEN** an authorized design publisher confirms Publish website design
- **THEN** all expected locale heads advance in one transaction
- **AND** content and every non-presentation authority remain unchanged

#### Scenario: The cohort or evidence changes during review

- **GIVEN** a locale head, locale census, package compatibility or qualification
  proof no longer matches the sealed manifest
- **WHEN** activation is attempted
- **THEN** no locale head advances
- **AND** the UI states that nothing changed and requires a new proved successor

### Requirement: D11 Rich Text Uses One Bounded Provider-Neutral Profile

One code-owned versioned `CMS Rich Text Profile Version` SHALL govern field features, TypeScript shape, backend validation, paste/import, D1 compilation, preview/public rendering, plaintext, search, export and migration.

Every clause in `openspec/contracts/web-studio-cms.md#contract-a75d8a6292defbd741f9` MUST apply without exception.

#### Scenario: Staff author supported rich content

- **GIVEN** an editor uses the bounded toolbar or pastes supported semantic
  prose
- **WHEN** the server validates and D1 compiles the acknowledged revision
- **THEN** authoring, Preview, public rendering, plaintext, search and export
  preserve the same provider-neutral meaning
- **AND** complete-Page heading and exact-scope link rules are enforced

#### Scenario: Unsupported or unsafe content enters Rich Text

- **GIVEN** pasted, imported or retained source includes a table, image, code,
  arbitrary embed, unsafe link, wrong-scope target, unknown node or oversize
  structure
- **WHEN** it is processed
- **THEN** the user receives an explicit supported-text/plain-text/cancel or
  repair path and the successor cannot activate
- **AND** source content is neither logged, silently destroyed nor publicly
  interpreted best-effort

#### Scenario: A visitor activates a typed video

- **GIVEN** one released video has a supported provider ID, title and required
  accessibility disposition
- **WHEN** the visitor chooses to load it
- **THEN** the code-owned component loads the privacy-conscious sandboxed player
  without autoplay
- **AND** provider failure leaves a useful accessible outbound-link fallback

### Requirement: D12 Autosave Uses One Recoverable Active Editor

Every D12-admitted typed resource SHALL have exactly one private server- authoritative Working Revision, one opaque expected Source Revision, and at most one current Active Editor Lease for Tenant × environment × Site × locale × typed resource.

Every clause in `openspec/contracts/web-studio-cms.md#contract-b99947759d0a490d5841` MUST apply without exception.

#### Scenario: Routine autosave is acknowledged

- **GIVEN** the active editor holds the current lease generation and Source
  Revision
- **WHEN** idle debounce or Save now sends the exact candidate
- **THEN** the server atomically advances the Working Revision and returns an
  exact receipt
- **AND** the UI calls it Saved only after that acknowledgement and does not
  publish it

#### Scenario: Another session opens the same resource

- **GIVEN** one visible active session owns the current lease
- **WHEN** another same-user or different-user session opens the resource
- **THEN** it receives the acknowledged draft read-only with bounded holder
  identity and activity
- **AND** only a separately authorized takeover can checkpoint and transfer a
  newly fenced lease generation

#### Scenario: A save outcome is uncertain or stale

- **GIVEN** acknowledgement is lost or the expected Source Revision changed
- **WHEN** the editor attempts to continue
- **THEN** an uncertain save replays only the identical idempotent command and
  resolves its receipt, while stale work stops automation and preserves Started
  from, Current draft and Your unsaved work
- **AND** no successor write occurs until the authoritative outcome and current
  permission are re-proved

### Requirement: D13 Scheduled Publication Pins One Exact Revision

The platform SHALL support one-time publish and unpublish `Scheduled Publication Appointment` records for one exact Tenant × environment × Site × locale × typed Page, with at most one unresolved appointment per action and publish-before-unpublish ordering.

Every clause in `openspec/contracts/web-studio-cms.md#contract-8d09c31c6d0de2c00fb7` MUST apply without exception.

#### Scenario: An exact Page revision publishes at the scheduled time

- **GIVEN** one valid appointment pins an acknowledged Page revision and exact
  semantic dependencies
- **WHEN** its due execution re-proves current authority and the expected head
- **THEN** it invokes the same D1 publication command as Publish now
- **AND** later private edits are excluded from the released generation

#### Scenario: Delivery is replayed or the scheduled meaning is stale

- **GIVEN** Inngest delivers a duplicate, delayed or superseded identifier, or a
  required source fact materially changed
- **WHEN** the worker reloads the appointment
- **THEN** exact replay no-ops through receipt/generation fencing and material
  change becomes Needs attention
- **AND** no silent rebase, duplicate publication or change to prior Live occurs

#### Scenario: Staff choose an ambiguous civil time

- **GIVEN** a requested Site-local time is ambiguous or nonexistent because of
  a daylight-saving transition
- **WHEN** staff schedule or reschedule publication
- **THEN** the UI requires an explicit valid offset/instant choice before save
- **AND** displays both Site time and viewer conversion truthfully

### Requirement: D14 Dynamic Content Uses One Versioned Source Catalog

The platform SHALL expose one code-owned provider-neutral versioned `Dynamic Source Catalog` behind one staff-facing Content list block.

Every clause in `openspec/contracts/web-studio-cms.md#contract-379d6e5e2e86543de9c5` MUST apply without exception.

#### Scenario: An editor configures an Article list

- **GIVEN** Article is certified in the current Dynamic Source Catalog
- **WHEN** an editor selects Article and configures admitted filters, sort,
  limit and presentation
- **THEN** the block stores one canonical typed Selection Intent
- **AND** Preview and D1 resolve identical bounded public-safe semantics without
  storing result rows

#### Scenario: A source or catalog version is unavailable

- **GIVEN** a block references an unknown, retired, incompatible or uncertified
  source/version or unsafe filter
- **WHEN** staff preview or D1 compiles the Page
- **THEN** only that list reports its exact unavailable or repair cause
- **AND** unrelated Page content and the previous live generation remain usable

### Requirement: D15 Content Lists Have Three Bounded Curation Strategies

One Content list SHALL use exactly one versioned bounded branch: Updates automatically, Featured first, or Choose every item.

Every clause in `openspec/contracts/web-studio-cms.md#contract-259f3199de16e2c57391` MUST apply without exception.

#### Scenario: Staff choose one curation strategy

- **GIVEN** an editor opens **How should items be chosen?** for one list
- **WHEN** the editor selects Automatic, Featured first or Choose every item
- **THEN** only that strategy's relevant controls and future-change explanation
  appear
- **AND** the saved revision contains exactly one valid curation branch

#### Scenario: A selected item becomes ineligible

- **GIVEN** a featured or explicitly chosen identity is withdrawn, unsafe,
  wrong-scope or no longer routeable
- **WHEN** the list is resolved
- **THEN** the identity is suppressed before response
- **AND** automatic/featured-first may refill deterministically while fully
  chosen output shrinks without silent substitution

### Requirement: D16 Public Page Windows Stay Link-Native And Independent

One versioned `Public Page Window` profile SHALL consume only D15's final sequence and support **Show one set**, **Page links**, **Load more**, or bounded **Auto-load while scrolling**, plus one compatible bounded window size.

Every clause in `openspec/contracts/web-studio-cms.md#contract-05e62dbd4cce3154922b` MUST apply without exception.

#### Scenario: A visitor loads a later list window

- **GIVEN** one released list has a valid opaque browse handle and later results
- **WHEN** the visitor uses a Page link, Load more button, or bounded automatic
  trigger
- **THEN** the server returns the same canonical link-native later window
- **AND** focus and announcements remain correct while the URL guarantees only
  that named lane and other lists retain at most bounded ephemeral state

#### Scenario: A malformed or conflicting window request arrives

- **GIVEN** the request contains an unknown/retired handle, duplicate or array
  parameters, excessive ordinal, arbitrary limit or more than one durable list
  position
- **WHEN** the public boundary validates it
- **THEN** the request is rejected or canonicalized before source or cache work
- **AND** it cannot enumerate internal identities or affect another list

### Requirement: D17 Public Site Search Is One Derived Safe Projection

The platform SHALL build one derived search projection per Tenant × environment × Site × locale × exact `public` audience × active D1 generation from versioned allowlisted public-safe Search Documents.

Every clause in `openspec/contracts/web-studio-cms.md#contract-4bbbb92f44cac62f04f7` MUST apply without exception.

#### Scenario: A visitor searches the active Site locale

- **GIVEN** the active generation has indexed public-safe Search Documents
- **WHEN** a visitor submits a query
- **THEN** the response contains only currently admitted exact-Site/locale
  results with ordinary canonical links and escaped excerpts
- **AND** zero, unavailable and later-window states remain accessible and
  privacy-safe

#### Scenario: Indexed content is withdrawn before deletion converges

- **GIVEN** a formerly indexed Page is unpublished, trashed, restricted or
  otherwise currently ineligible
- **WHEN** a visitor searches before asynchronous cleanup completes
- **THEN** current admission suppresses the hit immediately
- **AND** durable priority deletion and resurrection fencing converge without
  serving the stale result

#### Scenario: A search rebuild is interrupted

- **GIVEN** a shadow rebuild is partial, fails control totals or encounters an
  unsafe mass-deletion condition
- **WHEN** finalization runs
- **THEN** the derived head does not switch
- **AND** staff see bounded cause-owned health while the prior safe projection
  remains available under current admission

### Requirement: D18 Content Library Folders Organize Without Authority

The platform SHALL provide one optional staff-only folder tree per exact Tenant × environment × Site for stable ordinary Pages and Articles.

Every clause in `openspec/contracts/web-studio-cms.md#contract-686816cfdd0fe8f7107f` MUST apply without exception.

#### Scenario: Staff organize content in folders

- **GIVEN** an authorized staff member is viewing one Site's Content Library
- **WHEN** they create folders or move Pages and Articles by named action
- **THEN** only the authority-free Library placement changes
- **AND** URLs, Navigation, permissions, lifecycle, release, cache and public
  output remain byte-equivalent

#### Scenario: Staff remove a folder

- **GIVEN** a folder has directly filed items and immediate child folders and
  its previewed destination has no collision or depth violation
- **WHEN** staff confirm removal
- **THEN** items and child folders are rehomed exactly as previewed and only the
  selected empty folder is deleted
- **AND** stale, changed, colliding or over-depth consequences block atomically

### Requirement: D19 Sites Use One Bounded Versioned Topic Profile

Each exact Site SHALL have at most one stable versioned `Site Topic Profile` with no more than eight active Topic Sets, 500 active Topics, three single- parent levels including root and 20 direct assignments per eligible Page or Article.

Every clause in `openspec/contracts/web-studio-cms.md#contract-49b387da8eb4146d95b6` MUST apply without exception.

#### Scenario: Staff classify ministry content

- **GIVEN** one Site has an active bounded Topic Profile
- **WHEN** an editor assigns Topics through the search-first picker
- **THEN** the Page or Article stores only direct stable Topic identities
- **AND** its route, folder, Navigation, permission and publication state do not
  change

#### Scenario: A locale lacks an eligible Topic label

- **GIVEN** an assigned Topic has neither an exact-locale label nor explicit
  visible use-default acknowledgement
- **WHEN** that locale is prepared for release or discovery
- **THEN** the Topic is omitted and missing-label health identifies the repair
- **AND** no silent locale fallback supplies public text

### Requirement: D20 Saved Library Views Stay Bounded And Permission-Neutral

Every Saved Library View SHALL be scoped to one Tenant × environment × Site × Content Library surface.

Every clause in `openspec/contracts/web-studio-cms.md#contract-92ef7ab820580738918e` MUST apply without exception.

#### Scenario: Staff apply a saved view

- **GIVEN** one actor can read a valid personal or shared semantic view
- **WHEN** they apply it
- **THEN** volatile search/pagination/selection clears and every returned record
  is reauthorized under current scope
- **AND** the view cannot reveal or grant content access

#### Scenario: Shared view membership semantics are stale

- **GIVEN** a shared definition contains an invalid filter, operand or schema
  version that could change membership
- **WHEN** staff open the view
- **THEN** it returns no rows and reports Needs attention
- **AND** no best-effort broader query, silent autosave or ownership conversion
  occurs

### Requirement: D21 Trash Is Whole-Identity Recoverable And Reference-Aware

Trash SHALL apply to one stable ordinary Page or Article identity and every locale lineage together.

Every clause in `openspec/contracts/web-studio-cms.md#contract-bc93c70d22de386b45d3` MUST apply without exception.

#### Scenario: Staff move released content to Trash

- **GIVEN** impact proof completely identifies the Page's public, scheduled and
  referenced consequences and no active-editor conflict exists
- **WHEN** an authorized actor confirms Move to Trash
- **THEN** favorable public and new-selection eligibility stops for every locale
- **AND** downstream cleanup cannot reactivate content or cascade-delete its
  references

#### Scenario: Staff restore trashed content

- **GIVEN** one trashed identity remains inside retention and current path,
  reference and safety proof succeeds
- **WHEN** staff choose Restore
- **THEN** a private draft successor is created with identity/history preserved
- **AND** nothing is published, scheduled or made newly selectable

### Requirement: D22 Localization Uses Exact Independent Locale Lineages

One bounded `Localized Editorial Profile` SHALL govern sparse exact BCP-47 locale lineages.

Every clause in `openspec/contracts/web-studio-cms.md#contract-3c7f041e0e0d421d6a99` MUST apply without exception.

#### Scenario: A translator starts from another locale

- **GIVEN** the translator may read one exact acknowledged source revision and
  create the target locale
- **WHEN** they choose Copy from that revision
- **THEN** the platform creates one private target lineage with provenance and
  independent revision identity
- **AND** copied prose is not represented as completed translation or released

#### Scenario: A requested locale is missing

- **GIVEN** no exact released lineage exists for the visitor's requested locale
- **WHEN** public or Preview resolution runs
- **THEN** the locale is honestly unavailable or links to a separately released
  alternative according to the owning locale contract
- **AND** no field, block, metadata or Navigation value silently falls back

### Requirement: D23 Copy To Another Site Creates One Independent Private Draft

Copy to another Site SHALL be an explicit preflight and commit operation.

Every clause in `openspec/contracts/web-studio-cms.md#contract-5b3a391a92c0edcf4a3f` MUST apply without exception.

#### Scenario: Staff copy an ordinary Page to another Site

- **GIVEN** one authorized source revision and one authorized target Site have a
  complete valid transfer plan
- **WHEN** staff commit that sealed plan
- **THEN** one independent private target draft with fresh identities and
  explicit repairs is created
- **AND** source content, public heads and every non-copy authority remain
  unchanged

#### Scenario: Transfer semantics are incomplete or stale

- **GIVEN** the manifest encounters unknown content, unresolved required link/
  media/source mapping, changed plan inputs or lost target authority
- **WHEN** commit is attempted
- **THEN** no target draft is created and the source is untouched
- **AND** the target editor or plan identifies the exact repair instead of
  silently omitting meaning

### Requirement: D24 Ordinary CMS Output Has One Exact Public Audience

Every Phase 23 public context and artifact SHALL carry exactly the code-owned audience discriminator `public`.

Every clause in `openspec/contracts/web-studio-cms.md#contract-340d8bece3aa578f7258` MUST apply without exception.

#### Scenario: Authenticated and anonymous visitors request the same Page

- **GIVEN** both requests resolve the same verified host, Site, locale,
  generation, route and `public` audience
- **WHEN** one request has no session and the other has donor, missionary or
  staff authentication
- **THEN** normalized HTML, RSC, Navigation, lists, media, metadata, search and
  discovery are equivalent
- **AND** no private field or personalized cache branch appears

#### Scenario: Public content links to a private task

- **GIVEN** an ordinary public Page contains an admitted app-owned action link
- **WHEN** a visitor follows it
- **THEN** the owning authenticated application performs its own identity and
  permission flow
- **AND** private-app failure or state does not alter the public CMS artifact

### Requirement: D25 Whole-Site Preview Candidates Are Complete Private Closures

The platform SHALL support three preview tasks over the same D1 compiler: acknowledged-save Page Preview, exact pinned review/schedule Preview, and deliberate **Prepare site preview** for complete-Site review.

Every clause in `openspec/contracts/web-studio-cms.md#contract-8560350773fb77ff246d` MUST apply without exception.

#### Scenario: Staff prepare and browse a whole-Site candidate

- **GIVEN** an authorized Site-wide actor deliberately selects acknowledged
  changes for one exact Site locale
- **WHEN** preparation completes and final proof seals the closure
- **THEN** the actor may browse complete candidate-local routes with persistent
  Site preview, locale, preparation time and included-change chrome
- **AND** no public head or consequential downstream effect changes

#### Scenario: Candidate preparation is partial or later becomes stale

- **GIVEN** compilation fails, a dependency changes, or newer acknowledged work
  exists after preparation
- **WHEN** staff attempt to browse or rely on the candidate
- **THEN** partial output remains unavailable and a sealed candidate is labelled
  stale or Newer saved changes available
- **AND** staff must deliberately prepare a successor rather than receiving
  mixed or Live fallback output

#### Scenario: Candidate access expires or is revoked

- **GIVEN** a previously authorized actor loses permission or the candidate
  expires
- **WHEN** any candidate route or asset is requested
- **THEN** the server denies it without revealing private content
- **AND** it does not redirect, fall through or substitute the current public
  Site

### Requirement: D26 Public Forms Route One Durable Primary Outcome

Every public form SHALL use one small code-owned versioned `Public Form Purpose Profile` defining semantic fields, mappings, sensitivity, consent, retention, eligible Primary Outcomes, messages and abuse bounds.

Every clause in `openspec/contracts/web-studio-cms.md#contract-536c2085ac68317209ad` MUST apply without exception.

#### Scenario: A visitor submits a valid public form

- **GIVEN** one released Purpose Profile and Route Plan have exactly one
  certified Primary Outcome and currently valid destinations
- **WHEN** the visitor passes server validation and submits once or retries the
  same idempotent occurrence
- **THEN** one transaction records one occurrence, exact Route Plan, Primary
  work, complete child intents and their dispatch/outbox requests before
  returning Received
- **AND** duplicate delivery cannot create a second Primary Outcome

#### Scenario: A notification fails after the Primary Outcome succeeds

- **GIVEN** the domain-owned Primary Outcome is durably accepted and one staff
  or visitor email child later fails
- **WHEN** recovery runs
- **THEN** only the failed child is retried or marked for owner action
- **AND** the successful Primary Outcome is neither rolled back nor repeated

#### Scenario: Email transport evidence arrives twice and out of order

- **GIVEN** one recipient intent has durable Asym idempotency and prior accepted
  evidence
- **WHEN** verified Resend webhooks repeat or report later adverse delivery
  evidence out of order
- **THEN** the platform deduplicates and monotonically reduces the distinct
  delivery facts without recreating the intent
- **AND** opens or clicks cannot prove delivery or operational completion

#### Scenario: Form input attempts to control routing

- **GIVEN** a browser submits a recipient, sender, template, header, redirect,
  unknown field, upload, payment instruction or executable expression
- **WHEN** the public command validates the request
- **THEN** protected or unsupported input is ignored/rejected according to the
  Purpose Profile before any outcome is recorded
- **AND** the response preserves safe answers and exposes accessible field and
  summary errors without sensitive leakage

### Requirement: D27 Public Media Uses Tenant-Wide Immutable Qualified Custody

The platform SHALL provide one Tenant-wide DAM-grade Media catalog for reusable public still images only.

Every clause in `openspec/contracts/web-studio-cms.md#contract-a1985747b271e7f1b80e` MUST apply without exception.

#### Scenario: Staff upload and qualify a public image

- **GIVEN** an authorized contributor receives one exact private upload grant
  for an admitted still-image profile
- **WHEN** upload finalization and processing independently verify the bytes and
  a reviewer supplies current rights/safety evidence for one Site
- **THEN** one immutable logical revision and qualified renditions become
  selectable as Allowed for that Site
- **AND** upload, processing, editorial completeness, qualification, use and
  Live state remain distinct

#### Scenario: An editor places qualified media

- **GIVEN** one exact asset revision is Allowed for the Page's Site and an
  editor provides the required placement-local accessibility and crop semantics
- **WHEN** D1 compiles the Page
- **THEN** it pins exact rendition bytes, qualification and delivery route into
  the generation
- **AND** another Page or locale may reuse bytes without inheriting that
  placement's alt, caption, credit, crop or meaning

#### Scenario: Rights expire after public release

- **GIVEN** a governing right, consent or safeguarding fact expires or is
  adversely restricted
- **WHEN** the public media route is requested before caches fully converge
- **THEN** current origin authorization denies active and retained delivery
  routes immediately
- **AND** cache freshness and delivery retention cannot cross the governing
  expiry, while no newer revision or different image is silently substituted

#### Scenario: Unauthorized staff try to discover restricted Media

- **GIVEN** one safety-restricted asset exists in the same Tenant
- **WHEN** an actor without its reveal capability searches, counts, requests,
  compares duplicates or follows a direct identifier
- **THEN** the response remains non-enumerating across title, thumbnail, error
  and timing
- **AND** an authorized reviewer's later explicit reveal and verdict are audited

#### Scenario: A same-Tenant byte duplicate is detected

- **GIVEN** one new upload has the same verified digest as an existing logical
  asset but may have distinct rights, consent or retention meaning
- **WHEN** the Media workspace reports the match
- **THEN** it may offer **Use existing** with authorized context
- **AND** it never auto-merges, rewrites identity or exposes cross-Tenant matches

#### Scenario: Staff organize Media in folders

- **GIVEN** one Tenant-wide Media catalog contains eligible logical identities
- **WHEN** staff create or move through the optional five-level Media-only tree
- **THEN** only private organization and Unfiled placement change
- **AND** custody, Site qualification, rights, release, retention and deletion
  remain unchanged

### Requirement: D28 Search And Sharing Output Uses Generated Defaults And Three Overrides

One versioned `Site Search & Sharing Profile` SHALL be pinned per exact locale by D1 and generate title, description, D27-qualified share image, canonical, alternate-locale links, crawler disposition, sitemap/lastmod, robots, safe structured data and social output from verified released facts.

Every clause in `openspec/contracts/web-studio-cms.md#contract-b4fab48e18878e7ea5f3` MUST apply without exception.

#### Scenario: D1 generates metadata for a released Page locale

- **GIVEN** one exact Page locale, verified host, Site profile and qualified
  released facts
- **WHEN** D1 compiles search, sharing and crawler output
- **THEN** the generation contains deterministic locale-exact canonical,
  alternate, metadata, structured-data and sitemap semantics
- **AND** no draft, private, fallback or authentication-dependent value appears

#### Scenario: Staff customize and reset Page metadata

- **GIVEN** an authorized editor opens the Page-locale search and sharing panel
- **WHEN** they set or reset title portion, short description or qualified share
  image
- **THEN** only those three semantic override fields enter the private revision
- **AND** every other output remains generated and code-owned

### Requirement: D29 Exports Are Governed And Imports Are Staged Privileged Commits

**Review in a spreadsheet** SHALL create formula-safe, non-reimportable CSV.

Every clause in `openspec/contracts/web-studio-cms.md#contract-ce51f3e59c73f005bbed` MUST apply without exception.

#### Scenario: Staff export a coherent content package

- **GIVEN** an authorized actor selects one exact permitted scope
- **WHEN** the export seals and later downloads the artifact
- **THEN** it contains one coherent versioned snapshot in the selected safe
  format and records a current authorized download receipt
- **AND** an expired or revoked actor/object cannot retrieve it

#### Scenario: Staff check and commit an import

- **GIVEN** a certified adapter has produced typed candidates from a safe source
- **WHEN** staff Check the import
- **THEN** the platform writes no product records and seals a reviewable plan
  with exact category totals
- **AND** only a later fresh privileged commit can create private D12 revisions,
  with no public or downstream effect

#### Scenario: Import is interrupted or the plan becomes stale

- **GIVEN** a commit partially progresses, loses acknowledgement, or its target
  scope/version changes
- **WHEN** staff resume or reconcile it
- **THEN** receipts and owner commands distinguish applied, pending, failed and
  reversed slices idempotently
- **AND** no blind replay or partial public activation occurs

### Requirement: D30 Web Studio Has One Human Authority And Governed Diagnostics

Supabase Auth SHALL be the sole human identity, session and MFA authority, and Phase 12 SHALL be the sole capability authority.

Every clause in `openspec/contracts/web-studio-cms.md#contract-71f37885341269a001ad` MUST apply without exception.

#### Scenario: A human performs a Web Studio action

- **GIVEN** one authenticated Principal deliberately selected a Site and locale
  and has the exact current capability
- **WHEN** they save, preview, publish or manage one resource
- **THEN** the actor-bound port derives scope and authority server-side and
  attributes the action to that Principal
- **AND** no client claim or Payload role can widen the operation

#### Scenario: A registered worker performs bounded work

- **GIVEN** one code-registered service command has a fixed purpose, resource
  scope and idempotency identity
- **WHEN** it executes after a delay or retry
- **THEN** the boundary re-proves its current narrower authority and exact input
- **AND** it neither impersonates a user nor inherits broad service-role access

#### Scenario: Support opens Engine Diagnostics

- **GIVEN** an active incident and authorized AAL2 actor have one ledgered exact
  least-disclosure diagnostic scope
- **WHEN** the actor reads diagnostics during the bounded session
- **THEN** output is redacted, read-only and automatically expires or revokes
- **AND** any repair requires a separate typed authorized command

### Requirement: D31 Content Health Is Quiet Derived And Cause-Owned

The platform SHALL maintain one rebuildable private Content Health projection using a small versioned issue-family registry and stable Tenant/environment/ Site/locale/resource/cause identity.

Every clause in `openspec/contracts/web-studio-cms.md#contract-3bf9d89e43f02f7edb0f` MUST apply without exception.

#### Scenario: A source-owned issue needs staff action

- **GIVEN** current evidence identifies one stable actionable cause owned by the
  current actor's capability
- **WHEN** staff open either its contextual status or Content Health
- **THEN** both resolve the same issue in Needs your action with visitor impact,
  owner and one valid next action
- **AND** healthy unrelated content remains quiet

#### Scenario: Evidence is incomplete or automatic recovery is running

- **GIVEN** proof is missing/stale/contradictory or an owner-controlled recovery
  attempt has not yet produced fresh success evidence
- **WHEN** health is derived
- **THEN** the system shows Health check incomplete or Being handled
  automatically rather than healthy/resolved
- **AND** queue acceptance, reminder or retry does not close the issue

#### Scenario: Fresh source proof resolves an issue

- **GIVEN** the owning domain publishes current evidence that the exact cause is
  resolved
- **WHEN** Content Health rebuilds
- **THEN** the issue appears in Recently resolved for the code-owned 30-day
  presentation window
- **AND** removing it from that view does not delete its source or retention
  evidence

### Requirement: D32 Accessibility Assistance Is Quiet Non-Policing Guidance

Accessibility Assistance SHALL expose exactly **Details to finish**, **Suggestion** and **Technical issue**.

Every clause in `openspec/contracts/web-studio-cms.md#contract-4a3ec0f3a6de0092a02d` MUST apply without exception.

#### Scenario: Staff receive a nonblocking suggestion

- **GIVEN** authored content satisfies every source and platform invariant but
  one visitor-centered improvement is available
- **WHEN** Accessibility Assistance evaluates the current semantic input
- **THEN** it shows one quiet Suggestion with contextual rationale and Keep as
  written when eligible
- **AND** saving, Preview and release remain available without score or shame

#### Scenario: A true invariant blocks a successor

- **GIVEN** required alt/equivalent text, heading, form label or package
  accessibility proof mandated by an owning ratified contract is absent
- **WHEN** any UI, API, import, schedule or migration path prepares release
- **THEN** D1 blocks the exact successor through the owning invariant and names
  its repair
- **AND** D32 does not present its own certification or broaden the blocker

### Requirement: D33 Production Capacity Is Versioned Provider-Neutral Evidence

One versioned provider-neutral `Production Capacity Profile` SHALL define numeric Minimum, Typical and Measured maximum workloads and exact UX, correctness, freshness, recovery, fairness, headroom and unit-cost outcomes.

Every clause in `openspec/contracts/web-studio-cms.md#contract-ae1c9117bbc9c05fac11` MUST apply without exception.

#### Scenario: A workload is admitted for production

- **GIVEN** one exact product cohort has complete Minimum, Typical and Measured
  maximum evidence and a matching Vercel attachment
- **WHEN** release owners evaluate its capacity profile
- **THEN** every required correctness, UX, freshness, recovery, fairness,
  headroom and unit-cost outcome is supported by measured evidence
- **AND** no provider default or empty evidence cell is treated as qualification

#### Scenario: Demand exceeds a measured bound

- **GIVEN** one Tenant or workload exceeds a qualified capacity or cost bound
- **WHEN** backpressure and shedding activate
- **THEN** optional previews, enhancements or background convenience work shed
  before safety, current public reads, accepted form work or donor access
- **AND** the UI reports a truthful provider-neutral overload/recovery state

### Requirement: D34 Production Admits One Exact Current Payload V4 Cohort

At implementation start and release freeze, the implementation SHALL inspect current official Payload v4 npm, GitHub releases/tags/source/security/issues and migration documentation.

Every clause in `openspec/contracts/web-studio-cms.md#contract-9ededb6904a8b9e10660` MUST apply without exception.

#### Scenario: Stable Payload v4 is available at implementation time

- **GIVEN** current official evidence identifies one supported stable v4 cohort
  compatible with Phase 23
- **WHEN** the implementation freezes dependencies
- **THEN** it pins and qualifies that exact coherent cohort with complete
  access, migration, runtime and recovery evidence
- **AND** prerelease assumptions from this specification are not copied forward

#### Scenario: Only a prerelease can satisfy the contract

- **GIVEN** no supported stable cohort passes the required evidence
- **WHEN** release owners consider a prerelease
- **THEN** at most one exact coherent public prerelease may be admitted with an
  accountable residual-risk, expiry, upgrade and retirement record
- **AND** mixed channels, floating versions and permanent compatibility layers
  remain prohibited

### Requirement: D35 Prototype Replacement Uses Census-Gated One-Authority Cutover

Before destructive work, the implementation SHALL re-prove exact environment and nonproduction status, then census repository artifacts and hosted rows/ objects read-only.

Every clause in `openspec/contracts/web-studio-cms.md#contract-1351446579b1a512bae3` MUST apply without exception.

#### Scenario: A disposable nonproduction environment is replaced

- **GIVEN** read-only census proves the environment is disposable and every
  artifact has a complete disposition
- **WHEN** the clean D1-D34 target is built, verified and switched once
- **THEN** all writers/readers/tests use one new authority and every legacy or
  temporary path is removed
- **AND** a fresh clone with an empty database reproduces the target

#### Scenario: Census finds retained or ambiguous state

- **GIVEN** hosted or repository evidence contains data that is not safely
  disposable or lacks a deterministic supported transform
- **WHEN** cutover planning reaches that item
- **THEN** it is transformed through an evidence-qualified neutral DTO path or
  remains unresolved/block
- **AND** the implementation does not guess, silently discard, grant the
  transform runtime authority or perform destructive production work

### Requirement: D36 Ratified Decisions And Owner Seams Are Frozen Through Handoff

Phase 23 D1-D35 SHALL control wherever the original prompt, current prototype, provider behavior, implementation convenience, ticket wording or later agent assumption conflicts.

Every clause in `openspec/contracts/web-studio-cms.md#contract-45e5224636cef1643c7f` MUST apply without exception.

#### Scenario: A ticket or prototype conflicts with a ratified decision

- **GIVEN** implementation guidance, existing code or a provider default would
  widen or alter D1-D35 authority
- **WHEN** an implementation or ticket agent chooses the behavior
- **THEN** the ratified Phase 23 decision and owner boundary control
- **AND** any desired change stops for a new explicit numbered founder amendment

#### Scenario: A downstream owner is absent or not ready

- **GIVEN** a Page, list, form, media or recovery action depends on an owner
  capability that is absent, unauthorized or certified but currently unready
- **WHEN** staff or a worker requests the behavior
- **THEN** absence remains existence-safe and unready state offers only the
  owner-native action when authorized
- **AND** Web Studio does not fabricate fallback truth or broaden scope

#### Scenario: Delivery evidence is incomplete

- **GIVEN** code, schema, fixtures, Preview or tests exist but production
  capacity, cohort, cutover or operating evidence is incomplete
- **WHEN** release status is reported
- **THEN** the product may be described only by the evidence-backed Built state
  that actually exists
- **AND** Live and Confirmed remain unavailable until their independent gates
  pass
