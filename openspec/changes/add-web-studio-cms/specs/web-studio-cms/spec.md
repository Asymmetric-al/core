# Web Studio CMS Capability

## ADDED Requirements

### Requirement: D1 Page-Local Composition Releases One Coherent Site Generation

The platform SHALL model one stable Site-scoped `Page` identity separately from
its exact-locale `Editorial Revision` and `Page Placement Revision`. Ordinary
semantic sections SHALL remain Page-local unless an authorized editor
explicitly creates or selects one bounded `Reusable Section`. Staff SHALL use
one Page experience and one Edit, Preview, Publish journey rather than editing a
second placement document, giant mutable Site Plan, raw provider draft, or
release manifest.

D1 SHALL deterministically compile the complete affected Tenant × environment ×
Site × BCP-47 locale dependency closure into one immutable content-addressed
`Public Site Generation`. Publication SHALL re-prove authority, scope, exact
revisions, routes, hierarchy, references, renderer compatibility, public
eligibility, safety and artifact completeness before one expected serving-head
compare-and-swap. `PublishedContentReader` SHALL be the only public read seam;
downstream search, cache, sitemap, CDN and crawler convergence SHALL remain
separate facts.

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

Each exact-locale Page Placement Revision SHALL own its parent Page, normalized
local web-address segment and sibling order. The canonical Public Path and
breadcrumbs SHALL derive deterministically. Sibling reorder alone SHALL be URL-
neutral. The platform SHALL reject self-parenting, cycles, cross-scope parents,
invalid normalization, duplicate or reserved claims, and configured depth
violations through every write path.

A move or segment change SHALL prepare the complete affected descendant closure
and show exact old/new paths. Small changes SHALL receive concise review;
high-fan-out changes SHALL use a searchable resumable impact set and one
closure-level confirmation. One D1 activation SHALL release all affected paths
and breadcrumbs or none. Navigation SHALL remain independently versioned.

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

Every released predecessor path for the same Page SHALL remain reserved and
resolve directly to that Page's current eligible canonical path without a
chain, expiry or automatic reclamation. Automatic predecessors SHALL be
inspectable but not editable.

One separately authorized repair MAY bind one exact normalized unused
historical path to one currently eligible ordinary Page in the same Site and
locale by stable identity. Patterns, wildcards, query transformations, external
targets, priorities, schedules, chains and source-owned claims SHALL be
rejected. Unpublish SHALL require an explicit eligible replacement or produce a
real branded not-found result; it SHALL NOT invent a homepage, parent, sibling
or similar destination. Resolution SHALL apply only to public GET and HEAD and
fail without disclosing private target state.

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

A provider-neutral immutable `Navigation Revision` SHALL own visitor-menu
membership, menu-local copy, purpose, grouping, destination and order. It SHALL
NOT own hierarchy, paths or breadcrumbs. Managed internal destinations SHALL
use stable source-qualified references so Page moves do not require Navigation
rewrites. Source title changes SHALL NOT silently overwrite customized menu
copy.

The Page workspace MAY show a derived Navigation summary and **Add to
navigation** or **Edit placement**, but those actions SHALL edit the same
expected-revision Navigation draft as the Navigation workspace. No Page-level
`showInMenu`, label, parent, order or reverse-truth fields SHALL exist. D1 MAY
release related Page and Navigation revisions coherently. Current owner
ineligibility SHALL suppress or block the destination without mutating
Navigation history.

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
Staff SHALL NOT create another purpose or separate desktop/mobile trees. A
`Navigation Link` SHALL be terminal and have exactly one managed Page,
code-registered Site destination or qualified HTTPS external destination. A
`Navigation Group` SHALL have one non-navigating label, contain only terminal
Links, have no destination and never contain another Group.

At most one ordinary top-level Primary Link MAY be `Prominent action`. Removing
a nonempty Group SHALL never silently delete children. Public rendering SHALL
use semantic navigation, lists, links and disclosures, preserve native anchor
and current-location semantics, and SHALL NOT use application `menubar`
semantics.

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

Ordinary content SHALL use exactly `general_page`, displayed as **Page**, and
`article`, displayed as **Article**. Pages MAY be roots, parents, standalone or
temporary presentation. Articles SHALL be hierarchy leaves with dated,
repeatable editorial and chronological/release-order semantics. Creating an
Article SHALL NOT implicitly create an archive, feed, taxonomy, search rule,
schedule, notification or byline.

Family SHALL be immutable. A never-released mistake MAY be discarded and
recreated; a released correction SHALL use explicit create/replace or qualified
migration with route consequences. One exact family-compatible versioned `Page
Starter` MAY seed fresh independent local identities once. Starter changes
SHALL NOT propagate. Phase 22 specialized Page families and Ministry Updates
SHALL remain source-owned and separate.

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

The launch catalog SHALL contain Hero, Rich Text, Media, Gallery, Call to
Action, Cards, FAQ, Quote and Impact Statistics. Page SHALL admit all nine;
Article SHALL admit only Rich Text, Media, Gallery, Quote and Call to Action.
Composition SHALL be one flat ordered sequence under an implicit root. Each
section SHALL have stable lineage-local identity, exact type/schema version and
typed semantic content. Duplication SHALL create fresh identity and repeat
proof.

Hero SHALL be Page-only, first and singular. Impact Statistics SHALL be
editorial claims rather than CRM, giving or financial truth. Media and Call to
Action SHALL reference owning systems. Every move SHALL have named keyboard-
accessible controls and removal SHALL be recoverable. Catalog evolution SHALL
be additive and separately qualified with retained readers. No dormant generic
children, rows, columns, arbitrary styles, nesting, unbounded provider blocks or
best-effort unknown public meaning SHALL ship.

#### Scenario: An editor composes a family-qualified Page

- **GIVEN** an editor opens the section chooser for one ordinary family
- **WHEN** the editor inserts, duplicates, reorders or removes sections
- **THEN** only that family's admitted semantic types and constraints apply
- **AND** identity, focus, announcements and recovery remain correct without
  requiring drag

#### Scenario: Unknown or invalid section data is encountered

- **GIVEN** a source contains an unknown schema version, invalid Hero placement,
  arbitrary style/layout field, nested content or unsafe reference
- **WHEN** it is saved, imported, migrated, previewed or compiled
- **THEN** the affected successor fails closed with one exact cause
- **AND** unknown retained source is quarantined privately rather than silently
  dropped or publicly guessed

### Requirement: D8 Reusable Sections Are Explicit Shallow Shared Leaves

Every family-qualified D7 leaf except Hero MAY become one presentation-neutral
`Reusable Section` scoped to exact Tenant × environment × Site × locale. It
SHALL contain exactly one typed semantic leaf, including its bounded repeater,
and SHALL NOT contain multiple sections, another Reusable Section, route, SEO,
Navigation, hierarchy or style authority.

Every Page use SHALL have a fresh placement identity. Staff SHALL explicitly
choose **Save this section for reuse**, **Reuse existing**, **Change every
use**, **Make a local copy**, or **View uses** and SHALL see whether content is
local or shared. Saving a shared draft SHALL have no public effect. A shared
successor SHALL advance every qualified live use through one D1 closure or
none. Retiring SHALL prevent new selection while preserving references and
history; referenced or ever-released shared content SHALL NOT be destructively
deleted. Generation manifests, not a rebuildable reverse-use index, SHALL own
release impact.

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

A `Presentation Package` SHALL be source-controlled presentation code admitted
as first-party only after qualification for one exact Tenant × environment ×
Site. Its immutable/content-addressed manifest SHALL include provenance, source
commit, accountable human owner, support terms, compatibility, renderer
registry, assets/CSP, dependencies, SBOM/licenses, performance and cost budgets,
no-JavaScript/failure fallbacks, accessibility and evidence. Tenant-uploaded
executables, runtime plugins and remote modules SHALL be prohibited.

The package SHALL consume only the serialized `Public Presentation View Model`
and narrow registered capability islands. It SHALL NOT access raw Payload,
Supabase, auth, secrets, operational providers, arbitrary fetch or writes; own
routes, canonical/SEO truth, money, Give/checkout, consent, safety or
publication; or reinterpret unknown semantics. New authorable meaning SHALL
require D7 evolution. AI assistance SHALL NOT replace human ownership, review,
merge, deployment or certification.

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

One immutable `Site Presentation Activation Manifest` SHALL cover the exact
current public-locale census and a proved disposition for every enabled
nonpublic locale. Activation SHALL re-prove current authority, cohort equality,
expected heads, candidate generations, package compatibility and evidence. One
short transaction SHALL advance every expected locale head or none.

The operation SHALL change presentation only. It SHALL NOT edit content,
translations, drafts, visibility, URLs, Navigation, SEO, safety, Designations,
giving, locale enablement or dates. Idempotent replay SHALL return the same
receipt; a changed request with the same identity SHALL fail. **Restore previous
design** SHALL create a newly proved successor over current content. Published
and downstream delivery convergence SHALL remain separate statuses.

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

One code-owned versioned `CMS Rich Text Profile Version` SHALL govern field
features, TypeScript shape, backend validation, paste/import, D1 compilation,
preview/public rendering, plaintext, search, export and migration. Version 1
SHALL admit only root, paragraph, line break, H2-H4, bounded ordered/unordered
lists, block quote, bold, italic, typed internal/HTTPS/email/phone links, and one
typed YouTube or Vimeo video. Page title SHALL own H1. Every other heading,
mark, arbitrary style, upload, arbitrary relationship/embed, provider block,
HTML, Markdown, MDX, CSS, JavaScript or tenant custom node SHALL fail closed.

Payload Lexical SHALL be the exact-qualified private authoring adapter, not
public authority. Supported paste meaning SHALL be preserved; meaning-bearing
unsupported input SHALL require supported-text, plain-text or cancel and SHALL
never be silently dropped or stored as unsafe HTML. Internal links SHALL use
eligible exact-scope stable identities. Typed video SHALL store only provider,
canonical public ID, bounded start, visible accessible title and captions-or-
nearby-equivalent-text disposition; it SHALL be click-to-load, non-autoplaying,
privacy-conscious, sandboxed and retain an accessible provider-link fallback.
Migrations SHALL be pure, idempotent, previewable and never auto-publish.

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

Every D12-admitted typed resource SHALL have exactly one private server-
authoritative Working Revision, one opaque expected Source Revision, and at most
one current Active Editor Lease for Tenant × environment × Site × locale ×
typed resource. Actor and editing session SHALL own the lease. A monotonically
changing Lease Generation and expected-revision CAS SHALL fence every renewal,
save, takeover, restore, import, migration and system mutation. Same-user tabs
SHALL be distinct sessions; no stale write, blind retry or last-write-wins path
SHALL exist.

A short platform-owned idle debounce SHALL coalesce at most one rolling
recovery autosave. Launch qualification SHALL start near a two-second idle
debounce, five-minute inactive lease, one rolling autosave and 100 ordinary
unpinned history entries; only measured platform evidence, never Tenant
settings, MAY tune those baselines. **Saved** SHALL mean exact server
acknowledgement only.
**Save now** and the standard keyboard shortcut SHALL flush without publishing.
A second session SHALL open read-only with bounded editor identity/activity.
Only separate current authority SHALL expose **Take over editing**; successful
takeover SHALL checkpoint and atomically issue a new Lease Generation. Failure
states SHALL distinguish not sent/rejected, committed with lost acknowledgement,
stale revision, auth expiry and authorization/safety revocation. History SHALL
use bounded semantic immutable checkpoints and **Restore as a new draft**.
There SHALL be no offline-first durability promise, CRDT/OT, automatic merge,
multiple branches, destructive restore or per-keystroke permanent audit.

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

The platform SHALL support one-time publish and unpublish `Scheduled
Publication Appointment` records for one exact Tenant × environment × Site ×
locale × typed Page, with at most one unresolved appointment per action and
publish-before-unpublish ordering. An appointment SHALL pin exact D1 inputs,
civil time, IANA timezone, selected offset, resolved UTC not-before instant,
timezone-data generation, creator, current owner evidence and an immutable
idempotency fingerprint. Reschedule or replace SHALL create an attributable
successor; later edits SHALL NOT silently rebind it. Recurring scheduling SHALL
not ship.

Core SHALL retain long-horizon truth. Only identifier-based work within the
bounded six-day execution horizon MAY be handed to Inngest. At due time one
worker SHALL reload current state, re-prove authority, scope, Phase 10 safety,
routes, references, renderer/package compatibility, exact semantic pins and
expected head, then invoke the ordinary idempotent D1 command. Duplicate,
delayed, missing, stale and superseded delivery SHALL no-op or become actionable
without changing prior Live. Page context and **Scheduled changes** SHALL expose
Upcoming, Needs attention and History without provider terminology.

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

The platform SHALL expose one code-owned provider-neutral versioned `Dynamic
Source Catalog` behind one staff-facing Content list block. Each source contract
SHALL define stable key/version, scope availability, public DTO and identity,
filters/operators/sorts/limits, deterministic ordering and null handling,
presentation compatibility, empty/unavailable/safety behavior, cost bounds,
cache dimensions, migration, retirement, observability and conformance tests.

A Content list SHALL persist only source key/version, canonical typed
source-discriminated `Selection Intent`, semantic presentation variant and
bounded localized copy. It SHALL NOT persist matching records, copied
operational facts, provider query syntax, collection/field paths, relationship
depth, scripts, expressions, arbitrary fields or cross-source joins. Article
SHALL be the required launch source. Phase 22 and future sources SHALL remain
unavailable until their owner certifies the required public projection. Preview
and public rendering SHALL use the same exact-scope resolver. Unknown or stale
catalog versions and one-list failures SHALL fail narrowly without breaking the
Page.

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

One Content list SHALL use exactly one versioned curation branch: **Updates
automatically**, storing bounded filters, deterministic sort/limit and optional
exact exclusions; **Featured first**, adding an ordered bounded set of currently
matching featured identities before a deduplicated deterministic automatic
tail; or **Choose every item**, storing one ordered bounded set of exact source-
qualified identities with no filters, substitution or automatic tail.

The owning Page Editorial Revision, or Reusable Section revision when nested
there, SHALL own curation intent. One server resolver SHALL re-prove scope,
publication, routeability, Phase 10 safety, eligibility, exclusions, feature
order, deduplication and limit. Pickers SHALL expose only current public-safe
candidates. Withdrawn or ineligible references SHALL suppress immediately;
automatic and featured-first MAY deterministically refill, while choose-every-
item SHALL shrink without substitution. No ranking/query DSL, personalization,
recommendation, weighting, global featured field or silent strategy fallback
SHALL ship.

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

One versioned `Public Page Window` profile SHALL consume only D15's final
sequence and support **Show one set**, **Page links**, **Load more**, or bounded
**Auto-load while scrolling**, plus one compatible bounded window size. D1
SHALL assign one opaque public-safe browse handle per Page placement; duplicates
receive fresh handles and removals retire them. Handles SHALL reveal no internal
section, reusable, source, provider or authorization identity.

The clean Page SHALL render each list's first window. Every later window SHALL
have one canonical server-rendered link using its browse handle, positive
ordinal and focus target. One URL SHALL name at most one handle and ordinal.
Other lists MAY retain bounded ephemeral session/History state, but copy,
refresh, crawler, canonical and no-JavaScript guarantees SHALL apply only to the
one URL-named lane. Load more SHALL be button-led while progressively enhancing
the same real anchor; ordinary anchor and no-JavaScript discovery SHALL remain
available, and a button-only implementation SHALL be prohibited.
Launch SHALL admit at most one automatically loading list per Page, pause
automatic loading after a small code-owned bound, preserve manual continuation
and footer access, and bound DOM growth. Invalid or excessive input SHALL be
rejected before source/cache work.

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

The platform SHALL build one derived search projection per Tenant × environment
× Site × locale × exact `public` audience × active D1 generation from versioned
allowlisted public-safe Search Documents. Launch SHALL use bounded PostgreSQL
weighted full-text search with deterministic ordering and only qualified safe
trigram support, behind a provider-neutral contract. Public result resolution
SHALL perform one bounded set-based current admission/version proof over the
candidate batch before response.

Every source transition SHALL advance one latest desired present/absent target
with source, publication, safety, D1 and content-version fences. Adverse change
SHALL suppress synchronously, priority-delete asynchronously, verify exact
absence and retain a resurrection-prevention watermark. Rebuilds SHALL use
bounded shadow generations, checkpoints, expected/actual proof, mass-deletion
guards and atomic derived-head switch. Failure SHALL retain the prior safe index
under current admission proof. Public UX SHALL provide submitted search,
shareable query, ordinary links, escaped excerpts, bounded filter/windowing,
clear zero/unavailable states and `noindex`; raw queries SHALL not enter ordinary
logs, profiles or analytics. Staff SHALL see bounded lag, oldest pending work,
deletion failure and owner recovery.

Initial engineering evidence objectives SHALL be zero returned ineligible hits;
adverse containment on the first request; p99 removal proof no greater than 60
seconds; warning after 60 seconds and owner action at five minutes; p99 add no
greater than 60 seconds and p99.9 add no greater than five minutes; a five-minute
repair scan; full reconciliation no greater than 24 hours; zero known adverse or
orphan drift; and general drift no greater than 0.1 percent. These objectives
SHALL be qualification targets, not Tenant controls or public promises.

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

The platform SHALL provide one optional staff-only folder tree per exact Tenant
× environment × Site for stable ordinary Pages and Articles. Each identity SHALL
have one nonlocalized placement in one folder or derived **Unfiled**. Folders
SHALL have stable opaque identity, display label, optional same-scope parent,
case-insensitive normalized sibling uniqueness and a five-level maximum.

Folder facts SHALL NOT affect Page hierarchy, paths, Navigation, revisions,
publication, Topics, search, cache, safety, permission, lifecycle, retention,
storage path or public output. Create, rename, item move, bounded bulk move,
folder move and folder remove SHALL use current capability, scope, expected
generation, idempotency and structural invariants. Removing a folder SHALL
rehome directly filed items to its parent or Unfiled, reparent immediate child
folders, and delete only the selected now-empty folder in one atomic operation.
Existing and imported content SHALL begin Unfiled without public mutation.

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

Each exact Site SHALL have at most one stable versioned `Site Topic Profile`
with no more than eight active Topic Sets, 500 active Topics, three single-
parent levels including root and 20 direct assignments per eligible Page or
Article. Topic Set and Topic identities SHALL be opaque, stable and never
reused. One immutable direct Topic Assignment Snapshot SHALL be nonlocalized
and shared by every locale lineage. Direct assignment SHALL bind identities
rather than labels, paths, slugs or provider fields; parent and child
assignments SHALL remain explicit.

Default-locale labels SHALL be required. Another locale SHALL use its exact
localized label or an explicit visible use-default acknowledgement; otherwise
the Topic SHALL be omitted and reported as missing-label health. Topic rename,
reparent and localization SHALL preserve identity and history. Topics SHALL
confer no path, Navigation, permission, workflow, lifecycle, publication,
archive, public facet or operational meaning. Each locale D1 generation SHALL
pin compatible profile structure, exact labels, assignments and current safety.
Unknown, retired, cyclic, over-bound or unresolved use SHALL block the affected
successor with a repair cause.

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

Every Saved Library View SHALL be scoped to one Tenant × environment × Site ×
Content Library surface. The product SHALL provide protected **All content**,
actor-owned **My views** and capability-managed Site-owned **Shared views**.
Each view SHALL store only one versioned typed definition with no more than ten
AND conditions, 20 values per any-of condition, one allowlisted sort plus stable
identity tie-breaker and 12 ordered semantic columns. It SHALL NOT store result
rows, counts, cursors, page, selection, bulk actions, permissions, free-text
search or provider query language.

Applying a view SHALL clear volatile pagination, selection, actions and search,
and current authorization SHALL still govern definitions, operands, names,
results, fields, counts, previews, exports and actions. Membership-affecting
invalidity SHALL return no rows and Needs attention; presentation-only missing
columns or sort MAY degrade visibly without widening membership. Definitions
SHALL not autosave. Shared edits SHALL use CAS; sharing or privatizing SHALL
create a copy. Limits SHALL be 20 personal views per actor/scope, five actor-
local favorites and 20 shared views per scope.

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

Trash SHALL apply to one stable ordinary Page or Article identity and every
locale lineage together. Move to Trash SHALL atomically make the identity
ineligible for favorable public service and new selection. Routes, Navigation,
lists, search, sitemap, cache, social, schedules and other owners SHALL converge
adverse-first without cascading deletion into referenced content, folders,
Topics, Navigation history, media or bytes.

A bounded impact preview SHALL cover exact references, routes, schedules,
active editors, reusable uses, Navigation and media. Unknown or truncated
impact SHALL block a destructive claim. D12's acknowledged revision and active-
editor fences SHALL apply. Restore SHALL revalidate current collisions and
create a private draft only; it SHALL NOT republish, re-enable schedules or
revive expired proof. Retention SHALL be 90 complete days. There SHALL be no
Empty Trash or launch bulk permanent delete. Only a proved never-released
simple draft MAY auto-purge; all other purge SHALL be separately authorized,
reference-safe, non-cascading, expected-state fenced and receipt-backed.

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

One bounded `Localized Editorial Profile` SHALL govern sparse exact BCP-47
locale lineages. The default locale SHALL NOT be storage or silent fallback
authority for another locale. **Start blank** or **Copy from...** SHALL create
one idempotent private lineage with exact source-revision provenance. Later
source change SHALL display **Source changed** comparison and SHALL never
overwrite translated work.

Authoring, internal links, placement, Navigation, Topics, Rich Text, metadata,
search, Preview and public reads SHALL request exactly one locale with Payload
fallback disabled. Each locale SHALL save, review, schedule, release, unpublish,
Trash and recover independently. No ordinary Publish all locales or mixed-
language Page SHALL ship. A one-locale Site SHALL keep locale machinery out of
the routine interface.

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
Preflight and commit SHALL independently re-prove source-revision read authority
and target-Site create/edit authority and show target Site, domain, locale,
family and proposed path. One code-owned versioned transfer manifest SHALL
classify every field, node, block, package and relationship as copy,
materialize/remap, review or never copy. Unknown content SHALL fail closed.

Reusable Sections SHALL materialize locally; section and anchor identities
SHALL be fresh; internal links, media and dynamic sources SHALL require explicit
qualified mapping. Source path, Navigation, folder, Topics, view, editor,
approval, schedule, publication, cache/search/sitemap, Trash, presentation,
Site settings, safety, audit and operational facts SHALL never transfer as
authority. Commit SHALL use an expiring immutable plan digest, fresh proof,
short transaction, idempotency receipt and no remote I/O, and create one private
target draft or none. Future edits SHALL not synchronize. Raw provider duplicate
and copy-to-locale paths SHALL be unavailable for ordinary content.

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

Every Phase 23 public context and artifact SHALL carry exactly the code-owned
audience discriminator `public`. Missing, null, unknown, mixed, conditional,
segmented or client-selected audience SHALL fail closed. At one exact trusted
scope, authentication, role, cookies, headers, query/campaign parameters,
referrer, geography, experiment, analytics, device, crawler, request mode and
history SHALL NOT alter CMS-authored body, Navigation, lists, media, metadata,
search or discovery.

Listed and Shared by link SHALL be reach dispositions within `public`, not
audiences. Public links to authenticated tasks SHALL enter app-owned routes;
private DTOs, permissions, search and caching SHALL remain with those apps.
Preview SHALL remain private/no-store/noindex and explain that it shows what
anyone will see. Cache identity SHALL include every trusted byte-varying
dimension and structurally exclude auth/personalization imports. A future
second audience SHALL require a new founder decision and complete authority,
route, release, cache, search, migration and incident contract.

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

The platform SHALL support three preview tasks over the same D1 compiler:
acknowledged-save Page Preview, exact pinned review/schedule Preview, and
deliberate **Prepare site preview** for complete-Site review. Page Preview SHALL
advance only after D12 server acknowledgement and preserve the last safe frame
during save, conflict, takeover, offline or outcome-unknown state. A whole-Site
candidate SHALL bind exact Tenant × environment × Site × locale, current D1
generation or empty genesis, deliberately included acknowledged revisions, and
the complete immutable dependency/version closure. It SHALL NOT sweep every
draft or another user's browser state. Page-limited actors SHALL receive only
exact Page preview.

Preparation SHALL capture identities in a short snapshot, compile outside locks
with bounded concurrency/content-addressed reuse, re-prove current facts and
seal through short CAS finalization. Ready SHALL mean complete; partial output
SHALL never be browsable. Candidate routes, Navigation, links, history, 404s and
redirects SHALL remain candidate-local and never fall through to Live. Every
HTML, RSC/data, route, redirect, asset, source and management request SHALL
reauthorize. Responses SHALL be private/no-store/noindex/nofollow/noarchive.
Candidate identifiers or signed URLs SHALL grant nothing. Giving, forms,
subscriptions, notifications, analytics, tracking, prefetch, external embeds
and consequential downloads SHALL be side-effect-dark. Expiry, Trash, safety or
authorization loss SHALL invalidate without redirecting to Live. D1 MAY reuse
proved artifact work but SHALL never promote a Preview Candidate itself.

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

Every public form SHALL use one small code-owned versioned `Public Form Purpose
Profile` defining semantic fields, mappings, sensitivity, consent, retention,
eligible Primary Outcomes, messages and abuse bounds. Tenant customization MAY
change bounded localized presentation, labels/help/options/order, approved
optional fields, confirmation copy and supplemental questions. It SHALL NOT
change protected semantics, classification, retention, consent, domain mapping,
recipient authority or executable routing.

Every released Route Plan SHALL have exactly one domain-owned `Primary Outcome`.
Launch MAY admit a certified Support Hub handoff or one qualified Verified Email
Destination; every other owner SHALL remain unavailable until certified. Zero
or more staff notifications and zero or one visitor acknowledgement SHALL be
independent child effects. Before returning **Received**, one short transaction
SHALL record the immutable `Form Submission Occurrence`, exact Route Plan,
Primary Outcome work, child intents and every corresponding product-owned
workflow-dispatch/outbox request, or record none. Only identifier-only Inngest
execution SHALL occur after commit. Child delivery failure SHALL NOT roll back
successful Primary work.

Verified Email Destinations SHALL be same-Tenant governed resources with owner,
allowed use, verification, monitored-address attestation and sensitivity
ceiling. Recipient membership SHALL freeze per occurrence and every recipient
SHALL have independent delivery evidence. Staff notifications and visitor
acknowledgements SHALL select separate compatible **Live** Phase 17 Email Studio
publications. Email Studio and the communication owners SHALL control message
content, sender/reply identity, suppression and consent; D26 SHALL store no raw
Resend template authority. Resend SHALL remain per-recipient bounded transport.
Asym semantic idempotency SHALL outlive Resend's 24-hour provider window;
accepted, receiving-server delivered, bounced, suppressed, complained and
failed SHALL remain distinct facts; opened/clicked telemetry SHALL be non-
authoritative; and duplicate/out-of-order webhooks SHALL be verified,
deduplicated and reduced monotonically.

Public forms SHALL be native semantic, server-validated, no-JavaScript capable,
answer-preserving, accessible and abuse-bounded. Browser answers SHALL never
choose recipients, sender, subject, template, headers, tracking, reply identity
or redirects. Inngest SHALL receive only committed identifier intents. The
five-step staff builder SHALL reuse the accessibility-proven, version-pinned
shared `useAsymForm` adapter for local interaction state and server-error
reconciliation. It SHALL NOT become public or server truth, and D26 SHALL add no
generic JSON-form engine or client-authoritative validation.

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

The platform SHALL provide one Tenant-wide DAM-grade Media catalog for reusable
public still images only. Launch SHALL expose one versioned
`public-still-image` profile admitting bounded JPEG, PNG, WebP, AVIF and
qualified HEIC/HEIF through certified decode and deterministic re-encode.
Animated/multiframe input, SVG/active content, documents, video/audio, fonts,
icons and unknown formats SHALL fail closed. Media SHALL use opaque stable
logical identities and append-only semantic revisions. Provider paths,
filenames, folders and object names SHALL not be identity.

D27 SHALL own the bounded logical catalog, neutral metadata, revision lineage,
public-media rights/safety evidence and review, current target-Site
qualification, derived `Used in`, purpose-retention references, hold requests,
disposition authorization and placement/public semantics. Exact Page/locale
placements SHALL own contextual accessibility, caption, displayed credit, crop
and action meaning. Phase 29 SHALL be the sole owner of physical byte identity,
private intake, quarantine/inspection, renditions, provider copies/access and
access audit, application of exact owner-requested holds, and physical
disposition mechanics. D1 alone SHALL activate exact public use; no owner SHALL
weaken Phase 10 or another governing source.

Immutable originals and renditions SHALL remain behind a provider-neutral Phase
29-compatible custody port. Every byte/rendition SHALL bind digest, verified
type/size/dimensions, provenance, exact source/profile/processor/output identity,
storage copy and readiness. Upload grants SHALL be short-lived, private, exact-
scope, capability-, asset/revision-, kind/size- and idempotency-bound. Finalize
SHALL independently verify object existence, digest/signature, decoded type,
byte/pixel/frame/decompression/CPU/memory/time bounds, scan/sandbox, orientation
and color normalization, sensitive-metadata removal and deterministic outputs.
Raw provider/signed URLs, quarantine, originals, EXIF/GPS, hidden names,
evidence and diagnostics SHALL never serialize publicly.

Each asset SHALL store a neutral staff title, bounded source/credit facts,
ordinary Media folders and bounded tags, plus privileged original-name and
provenance references. Ordinary search SHALL index only permitted neutral terms.
Sensitive person, location, consent, review, safety or evidence data SHALL stay
in protected fields/owners and SHALL NOT enter ordinary search, URLs, analytics,
logs, traces, metrics, provider tags, public projection or unprivileged export.
Folders and tags SHALL never control Tenant, permission, identity, storage path,
Site qualification, retention, release or deletion. Same-Tenant digest equality
MAY suggest **Use existing** but SHALL never auto-merge or rewrite distinct
logical identity, rights, consent or retention meaning; cross-Tenant duplicate
signals SHALL remain invisible.

Media SHALL have only ordinary Tenant visibility and one safety-restricted
class, not arbitrary per-asset ACL matrices. An unauthorized actor SHALL NOT
enumerate restricted Media through search, count, title, thumbnail, duplicate
result, direct URL, error or timing. An authorized safety reviewer SHALL
explicitly reveal a protected preview, and every reveal and verdict SHALL be
audited. Sensitive evidence SHALL be referenced rather than copied into the
catalog.

Site use SHALL derive current **Allowed**, **Needs review** or **Blocked** from
the exact revision, rights, consent, safeguarding, Phase 10, public audience,
policy/evidence/profile and expiry. Unknown/stale proof SHALL fail closed and
governing expiry SHALL be an adverse transition. Every placement SHALL pin
asset revision and rendition profile and own Site, locale, slot, accessibility
treatment, localized alt/caption, displayed credit, link/action, equivalent
content and crop/art direction. D1 SHALL verify qualification, evidence,
renditions, delivery bytes/digests and exact routes before activation. Public
delivery SHALL use only Asym-owned immutable release-qualified URLs. Current
anonymous delivery SHALL prove either the current active generation or one
delivery-retained generation created only when an active head is replaced and
bounded by the maximum published response/cache lifetime plus clock-skew margin.
Delivery retention SHALL provide read-only route continuity only. Recovery-
retained bytes SHALL never be anonymously readable. Time-bounded rights or
consent SHALL cap cache freshness, stale allowances and delivery-retention
deadline before the earliest governing expiry after skew. Current adverse state
SHALL deny origin immediately for active and delivery-retained routes without
silent substitution; raw provider URLs SHALL never serialize.

`Used in` SHALL be a rebuildable complete projection across draft, Preview,
scheduled, active, delivery/recovery-retained, reusable, Navigation, Phase 22,
Gallery, quarantined legacy Rich Text, SEO/social and package uses. Stale use
evidence SHALL never claim Unused or authorize disposal. New Media revision
SHALL never auto-activate. Media Trash SHALL prevent new selection without
cascade or unpublish; Restore SHALL remain private. Retention SHALL be
strictest-wins with legal/records, consent, safeguarding, incident, hold, source
and disposition facts; launch SHALL have no automatic purge or Empty Trash.
Optional Media folders SHALL be one separate private Tenant-wide Media-only tree
with Unfiled and no more than five levels. They SHALL never control custody,
Site use, permission, qualification, retention, release or deletion.

Production qualification SHALL prove private hostile intake, weak-mobile
resumption, per-file progress/recovery, 25,000-item bounded browse/search,
50-item bulk intake, complete use evidence, accessibility, Tenant isolation,
object backup/restore, checksum-first provider exit, redacted health and exact
storage/transform/egress cost budgets.

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

One versioned `Site Search & Sharing Profile` SHALL be pinned per exact locale by
D1 and generate title, description, D27-qualified share image, canonical,
alternate-locale links, crawler disposition, sitemap/lastmod, robots, safe
structured data and social output from verified released facts. One Page-locale
MAY override exactly semantic title portion, one shared short description and
one qualified share-image placement. Reset SHALL remove an override. No fourth
override, tenant title template, arbitrary head/meta field, JSON-LD editor or
crawler DSL SHALL exist.

Exact locale and verified host SHALL be mandatory. Forwarded-host spoofing,
cross-Site cache, draft/private metadata, provider fallback and auth-dependent
output SHALL be impossible. Listed content SHALL be discoverable; Shared by
link SHALL be public but no-index. Accessible Share SHALL use Web Share or Copy
link with confirmed success and manual recovery, not a passive third-party SDK.
Release truth, public verification, sitemap/robots/cache convergence and
optional external-provider observation SHALL remain separate statuses and retry
lanes.

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
**Archive or move content** SHALL create one versioned neutral Asym Content
Package from one sealed authorized scope/version/relationship snapshot. Export
artifacts SHALL be private, encrypted, opaque-keyed and bounded-retention. Every
download SHALL reauthorize the actor and exact object scope, record a receipt,
and fail after expiry or revocation.

Only certified adapters SHALL produce typed import candidates. Hostile archives,
paths, formulas, remote fetches, scripts, widgets, users, provider internals and
unknown versions SHALL fail or be explicitly excluded. Import preparation SHALL
be one saved full-page **Source → Destination → Match content → Check and resolve
→ Review plan** journey. **Check the import** SHALL perform zero writes and seal
one immutable expiring plan with **Must fix before creating drafts**, **Needs
review before release**, **Will not be imported** and **Information** totals. A
separate fresh privileged commit SHALL re-prove scope, plan and target and create
idempotent private D12 revisions through owner commands only; results follow
that command rather than becoming a preparation step. Partial, interrupted,
stale, resumed, reconciled and reversal outcomes SHALL be truthful. No import
SHALL directly publish or create routing, form, message, schedule, search or
operational effects.

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

Supabase Auth SHALL be the sole human identity, session and MFA authority, and
Phase 12 SHALL be the sole capability authority. `Payload Principal Link` SHALL
be immutable attribution only and SHALL NOT create a Payload account, role,
login or fallback. Every human operation SHALL use the actor-bound Web Studio
Operations port with current request, user, access, lock and transaction
context. Every non-interactive operation SHALL use one separately registered
narrower purpose/scope/idempotency service-command port. Raw Payload Admin,
auth, REST, GraphQL, Local API and hooks SHALL NOT become product, integration,
repair or rollback paths. D1 SHALL own release and `PublishedContentReader`
alone SHALL observe public state.

Tenant, environment, Site and locale switching SHALL be deliberate and never
default to a guessed scope. Session expiry SHALL preserve acknowledged work;
revocation SHALL stop new privileged action and fail non-enumerating. `Engine
Diagnostics` SHALL require an active incident, fresh AAL2, exact least-
disclosure scope, ledger-before-read, 15-minute default and 60-minute maximum
duration, immediate revocation and zero mutation. Repairs SHALL remain
separately authorized typed commands.

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

The platform SHALL maintain one rebuildable private Content Health projection
using a small versioned issue-family registry and stable Tenant/environment/
Site/locale/resource/cause identity. Projection loss, acknowledgement or edits
SHALL NOT change source truth. Missing, stale, contradictory or unavailable
evidence SHALL be the coverage notice **Health check incomplete**, never
healthy. Link-native views SHALL be exactly **Needs your action**, **Being
handled automatically**, **Needs platform attention**, and **Recently
resolved**. Recently resolved SHALL use a code-owned 30-day presentation window,
not a data-retention promise.

Central and contextual views SHALL resolve the same stable issue and explain
what happened, exact scope, visitor impact, owner, progress, time and one best
authorized action. Resolution SHALL require fresh source-owner proof; attempt,
reminder, queue acceptance, notification or acknowledgement SHALL not equal
fixed. Direct recovery SHALL be exceptional, registered, separately authorized,
exact-targeted, expected-state fenced, idempotent, bounded, read-back and
receipt-backed. No generic Retry, Replay, Force, provider console or second task
workflow SHALL ship.

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

Accessibility Assistance SHALL expose exactly **Details to finish**,
**Suggestion** and **Technical issue**. Healthy checks SHALL remain quiet and
unavailable checks SHALL never be represented as passed. Suggestions SHALL be
contextual and nonblocking. **Keep as written** SHALL be bounded to unchanged
locale, semantic input and rule version. There SHALL be no score, grade, badge,
shame, certification, waiver, broad suppression, approval workflow or policing
of a Tenant's creative choices.

D32 SHALL NOT create a release blocker. Only an already-ratified source
invariant or an unproved platform/package contract MAY block the exact
successor. Save, undo, recovery, compare and Preview SHALL remain available.
D1 SHALL run the same candidate checks for UI, API, import, schedule, reuse,
dynamic, locale, package and migration paths; a client scanner SHALL NOT attest
success. Authoring, repair and release journeys SHALL remain accessible to
disabled and occasional ministry staff without blocker-versus-suggestion
confusion.

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

One versioned provider-neutral `Production Capacity Profile` SHALL define
numeric Minimum, Typical and Measured maximum workloads and exact UX,
correctness, freshness, recovery, fairness, headroom and unit-cost outcomes. No
required empty cell SHALL be claimed supported. One version-pinned `Vercel
Qualification Attachment` SHALL prove the implementation while Vercel settings
remain provider detail rather than product authority.

Field evidence SHALL meet 75th-percentile LCP no greater than 2.5 seconds, INP no
greater than 200 milliseconds and CLS no greater than 0.1 across representative
routes, devices, networks, locales, Presentation Packages, cache and adverse
states. Functions, Postgres connections and queries, caches, transforms, builds,
Previews, queues, retries and Tenant concurrency SHALL be bounded and measured.
Optional work SHALL shed before safety, current public truth, accepted work,
form durability or donor access. Staff/public overload states SHALL be truthful
and provider-free. D1 release SHALL remain independent of application
deployment and SHALL never serve unsafe stale output.

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

At implementation start and release freeze, the implementation SHALL inspect
current official Payload v4 npm, GitHub releases/tags/source/security/issues and
migration documentation. It SHALL prefer one coherent supported stable v4
cohort. If no stable cohort satisfies Phase 23, only one exact coherent public
prerelease MAY qualify with accountable residual-risk owner, expiry, upgrade and
retirement evidence.

One immutable qualification record SHALL bind exact lockstep Payload packages
and plugins, lockfile, generated artifacts, runtime/toolchain, migrations,
Tenant/privacy/access/editor/public/accessibility/capacity/backup/recovery proof
and requalification triggers. Floating versions, mixed release channels, forced
peer dependencies, Payload v3 or stock-Admin fallback, mutable public reads,
dual authority and permanent multiversion abstraction SHALL fail admission.
Qualification failure SHALL preserve acknowledged work and the last safe public
generation.

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

Before destructive work, the implementation SHALL re-prove exact environment
and nonproduction status, then census repository artifacts and hosted rows/
objects read-only. Every item SHALL be classified as discard fixture/demo,
transform retained, regenerate derived, or unresolved/block. D1-D34 SHALL be
built cleanly from an empty database against the admitted D34 cohort. A fully
disposable environment MAY reset; otherwise change SHALL remain confined to the
CMS namespace.

Any one-time retained-state transformation SHALL use neutral semantic DTOs
through supported APIs, be deterministic, idempotent, encrypted and short-
lived, preserve totals/checksums/constraints, and SHALL gain no runtime
authority. One bounded switch SHALL move every writer, reader, Preview,
compiler, script and test to the clean authority. The implementation SHALL then
remove every legacy collection, schema, route, flag, fallback, fixture, adapter
and transform and prove fresh-clone/empty-database reproducibility. If the
target is production or customer-relied-upon, destructive work SHALL stop for a
new decision.

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

Phase 23 D1-D35 SHALL control wherever the original prompt, current prototype,
provider behavior, implementation convenience, ticket wording or later agent
assumption conflicts. Only a later explicit numbered founder amendment MAY
change them. Downstream capability SHALL use only its smallest certified owner
contract. Absent or unauthorized capability SHALL fail existence-safely;
certified-but-unready work SHALL appear only with an owner-native action.

Every mutation SHALL preserve exact owner and scope, current capability reproof,
expected revision or sealed input, idempotency, partial-failure posture, durable
receipt, typed recovery and adverse-first public safety. D33 capacity
qualification, D34 cohort admission, D35 census/cutover and the complete closure
checklist SHALL be mandatory gates. **Built**, **Live** and **Confirmed** SHALL
remain separate evidence states. Specifications, schema, fixtures, Preview,
provider features and passing unit tests SHALL NOT be labelled as live product.

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
