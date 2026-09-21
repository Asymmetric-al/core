# Design: Web Studio CMS

## Decision Authority

This design implements the founder-ratified Phase 23 decisions D1-D36 without
reopening them. The Phase 23 PRD supplies the complete implementation narrative;
the decision log, closure checklist, and ADR-0145 through ADR-0180 preserve the
exact clauses, negative boundaries, proof obligations, and rationale. D36
formally freezes D1-D35. A later implementation, ticket, provider release, or
prototype may change them only through a new explicit numbered founder
amendment. D1-D35 control wherever the original prompt, current prototype,
provider behavior, implementation convenience, ticket wording, or an agent
assumption conflicts with their ratified authority.

Existing OpenSpec principles, platform boundaries and surfaces, identity/access
rules, and every owning-phase contract remain binding. Resolve apparent
conflicts through the repository source-of-truth order and the canonical
priority ladder in `platform-principles`; do not create a Phase 23-local
override ladder or weaken an invariant because a provider feature is absent.

Current code and provider behavior are census and qualification evidence, not
grandfathered authority. D34 requires fresh official Payload v4 research at
implementation start and release freeze. D35 requires one clean-target
replacement. D36 prohibits claiming Built, Live, or Confirmed from the
existence of this design, schema, fixtures, Preview, provider support, or unit
tests alone.

## Public Application Boundary

The **Web Studio Operations boundary** is the only Phase 23 application
boundary. It is a thin facade over feature-owned typed command/query modules,
not a god service, generic CMS facade, workflow engine, data-access service, or
provider wrapper.

Human commands are constructed from trusted server-resolved context:

- validated Supabase Principal and actual actor;
- Tenant, environment, Site, verified host where relevant, and exact BCP-47
  locale;
- Phase 12 purpose, capability decision, governance epoch, and required
  assurance;
- typed resource identity, current lifecycle, expected source or serving-head
  revision, and Active Editor Lease generation where applicable;
- semantic operation, correlation, and idempotency identity; and
- explicit source-owner, compiler, storage, media, dispatch, provider, and
  public-runtime ports.

Non-interactive commands use a separately registered service-command port with
one code-owned purpose, exact scope, bounded payload, and narrower capabilities.
They never impersonate a human or inherit service-role omnipotence.

Clients and jobs may submit opaque targets, expected revisions, sealed plan or
manifest digests, bounded user input, and requested actions. They may not assert
Tenant, actor, role, capability, Site, locale authority, lifecycle, eligibility,
source-owner meaning, provider outcome, release state, diagnostic scope, or
public admission. Every mutation and private read re-resolves current authority
before enumeration or effect.

Every command returns a discriminated outcome such as applied, exact replay,
stale, semantic conflict, blocked, invalid, not permitted or not found,
incomplete proof, or external outcome unknown. A generic success Boolean is
insufficient. Routes, server actions, Payload hooks, jobs, importers, migrations,
rebuilders, and repair tools delegate identifiers through the same boundary.
No browser, plugin, service-role script, provider callback, raw Payload API, or
database trigger may create Phase 23 product truth directly.

`PublishedContentReader` is the only public observation seam. It resolves one
active immutable Public Site Generation and returns provider-neutral public
DTOs. Public routes never read mutable editorial records, compile content,
perform migrations, traverse unbounded relationships, call providers, or
interpret a floating latest revision.

## Bounded Contexts And Authority Map

### Phase 23 ordinary CMS authority

Phase 23 owns ordinary Page and Article identity; exact-locale Editorial and
Placement revision lineages; Site Plan generation compilation and activation;
ordinary hierarchy, route continuity, Navigation, bounded semantic composition,
Reusable Sections, Rich Text, working revisions, Preview, scheduling, dynamic
lists, public Site search, Content Library organization, Topics, Saved Library
Views, Trash, exact-locale starts, Copy to Site, public forms, public still-image
media semantics, search/share presentation, portability, staff CMS operations,
Content Health, Accessibility Assistance, and its provider/capacity/cutover
proofs.

These facts do not become operational CRM truth, Phase 10 safety, Phase 12
authorization, payment or giving truth, generalized byte custody, communication
delivery, locale lifecycle, provider outcome, or authenticated-app authority
merely because Phase 23 references them.

### Owner-domain authority

Phase 10 owns current public eligibility and adverse containment. Phase 12 owns
human action authority. Phase 22 retains specialized Missionary Pages,
Project/Campaign Pages, Ministry Updates, contributor/review/reach, specialized
media, Designation/giving bindings, and their source-owned public semantics.
Phases 6/17 own message contracts and delivery evidence. Phase 29 owns physical
byte custody and disposition. Every future source or Primary Outcome owner must
publish the smallest certified projection or command port Phase 23 needs.

Phase 23 stores references or immutable projections, never copied operational
truth. An absent, unauthorized, stale, restricted, or uncertified owner seam is
unavailable. It is never repaired through fallback data, a generic record, or a
hidden provider call.

### Provider authority

Payload is qualified private editing and persistence machinery. It owns no
human identity, capability, public release, route, public audience, operational
truth, or product recovery semantics. Vercel is the qualified initial runtime,
not capacity or overload policy. Inngest is an executor for committed
identifier-only work, not schedule, content, authorization, receipt, or release
truth. Postgres search, Resend delivery, object storage, image processing, and
other providers remain replaceable adapters behind product-owned contracts.

## Core Revision And Generation Model

### Page and locale lineages

A `Page` is one stable Site-scoped ordinary presentation identity with one
immutable family: `general_page` displayed as **Page**, or `article` displayed
as **Article**. Locale is not Page identity. Each admitted locale has a sparse,
explicit `Editorial Revision` lineage and a separate `Page Placement Revision`
lineage exposed through one staff Page experience.

Editorial Revision owns localized author-written meaning, semantic sections,
editorial SEO inputs, and explicit source references. Placement Revision owns
exact-locale parent, normalized local path segment, and sibling order. Complete
canonical path, descendants, hierarchy and breadcrumbs derive
deterministically. Navigation remains a separately versioned semantic snapshot.

Each typed editable resource retains its own identity, permission, Working
Revision, expected Source Revision, Active Editor Lease, commands, and release
dependencies. Page prose autosave cannot move a Page, rewrite Navigation,
change shared content, switch a Presentation Package, or mutate Phase 22 truth.

### Working revisions and editor fencing

Each admitted resource has exactly one private server-authoritative Working
Revision and at most one current Active Editor Lease for Tenant × environment ×
Site × locale × typed resource. Actor plus editing session owns the lease; one
monotonically increasing Lease Generation fences every renewal, save, takeover,
restore, import, migration, and other mutation. Expected-revision compare-and-
swap remains mandatory; the lease coordinates people but never replaces CAS.

A short platform-owned idle debounce coalesces routine work into one rolling
recovery autosave. Deliberate saves, release selection, publication markers,
takeover/conflict recovery, restore, import, and migration create bounded
semantic checkpoints. Restore always appends a new private draft. There is no
last-write-wins, destructive rollback, persistent offline queue, CRDT/OT, live
cursor, automatic merge, or second version engine. Launch baselines are a near
two-second idle debounce, five-minute inactive lease, one rolling autosave and
100 ordinary unpinned history entries. These are code-owned, evidence-adjusted
platform baselines, not Tenant settings or permanence promises.

### Deterministic compilation and activation

D1 compiles a complete exact Tenant × environment × Site × locale dependency
closure into one immutable content-addressed Public Site Generation. The
compiler validates current authority and safety, exact revisions, hierarchy,
route claims, Navigation, Reusable Sections, dynamic sources, locale, Rich Text
profile, Presentation Package, media, forms, metadata, and every required owner
projection. It produces deterministic provider-neutral artifacts and a manifest
of exact inputs and compatibility versions.

Activation uses one expected serving-head CAS only after the generation is
complete and ready. Failure or stale proof changes no public head. Public
requests read one active generation through `PublishedContentReader`. Search,
cache invalidation, sitemap delivery, CDN propagation, crawler/social-provider
observation, notifications, and analytics converge separately and cannot
retroactively define publication success.

## Page Structure Routes And Navigation

Placement derives canonical paths. Sibling reorder is URL-neutral. A move or
segment change prepares the complete affected descendant closure, proves cycles,
scope, depth, reserved claims and uniqueness, and activates the branch or none.
Released hierarchy owns breadcrumbs; it does not create visitor menus.

Each released predecessor path for the same Page is permanently reserved and
resolves directly to the Page's current eligible route, never through a chain.
One separate exact-path repair may bind one unused historical path to one
current eligible ordinary Page in the same Site and locale. Patterns, external
targets, query transformations, schedules, priorities, chains, and source-owned
claims are not admitted. Unpublish uses an explicit eligible replacement or a
real branded not-found result.

Navigation owns exactly Primary Navigation and Footer Navigation. A terminal
Navigation Link has one managed Page, code-registered Site, or HTTPS destination
and no children. A Navigation Group has one non-navigating label, terminal
Links, no destination, and no nesting. At most one ordinary top-level Primary
Link is the Prominent action. Page-aware assistance edits the same Navigation
draft and never creates duplicate `showInMenu`, label, parent, or position
fields.

## Semantic Content And Reuse

The launch catalog is closed and versioned. Page admits Hero, Rich Text, Media,
Gallery, Call to Action, Cards, FAQ, Quote, and Impact Statistics. Article
admits Rich Text, Media, Gallery, Quote, and Call to Action. Composition is one
flat ordered sequence under an implicit root. Each section has stable lineage-
local identity, exact type and schema version, and typed semantic content.

Hero is Page-only, first and singular. Impact Statistics are editorial claims,
not operational, financial, CRM, or giving truth. Media and Call to Action use
typed owner references. Presentation packages own qualified rendering, while
code owns semantic DOM order, heading structure, baseline spacing, responsive
reflow, and accessibility floors. Future capability requires additive catalog
evolution with retained readers; no dormant generic children, rows, columns,
arbitrary styles, nested builder, or best-effort unknown block meaning ships.

A Reusable Section contains exactly one family-qualified semantic leaf other
than Hero, including its bounded repeater. It is exact Tenant × environment ×
Site × locale, presentation-neutral, shallow, and explicitly created. Every Page
use has its own placement identity. Shared edits are deliberate through **Change
every use**; **Make a local copy** detaches one placement. One shared successor
advances all qualified live uses in one D1 closure or none. Generation manifests
own public impact; reverse-use indexes are rebuildable assistance only.

## Presentation Packages And Complete-Cohort Design

A Presentation Package is source-controlled first-party presentation code
qualified for one exact Tenant × environment × Site. Its immutable manifest
binds provenance, source commit, accountable human owner, support terms,
compatibility, renderer registry, assets and CSP, dependencies, SBOM and
licenses, performance/cost budgets, accessibility, no-JavaScript and failure
fallbacks, and qualification evidence.

The package consumes only the serialized Public Presentation View Model and
narrow registered capability islands. It cannot import raw Payload, Supabase,
auth, secrets, operational providers, arbitrary fetch or writes; own routes,
canonical/SEO truth, money, Give/checkout, consent, safety or publication; or
introduce new authorable semantics without catalog evolution. AI may assist
source creation but cannot certify, merge, deploy, or activate it.

Design activation uses one Site Presentation Activation Manifest covering every
currently public locale and a proved disposition for every enabled nonpublic
locale. One short transaction advances every expected locale generation head or
none, and changes presentation only. Restoring a prior design creates a newly
proved successor over current content. Package deployment makes code available;
it is not public activation.

## Rich Text Contract

One code-owned CMS Rich Text Profile Version governs authoring features,
TypeScript shape, backend validation, paste/import, compilation, preview/public
rendering, plaintext, search, export, and migration. Version 1 admits only root,
paragraph, line break, H2-H4, bounded ordered/unordered lists, block quote,
bold, italic, typed internal/HTTPS/email/phone links, and one typed YouTube or
Vimeo video. Page title owns H1. Every other node, mark, arbitrary style,
upload, relationship, block, embed, HTML, Markdown, MDX, CSS, JavaScript, and
tenant custom node fails closed.

Payload Lexical JSON is private editable source. D1 emits an exhaustive
provider-neutral semantic projection. Meaning-bearing unsupported paste is
never silently discarded. Typed video stores only provider, canonical public
resource ID, bounded start, visible accessible title, and captions or nearby-
equivalent-text disposition. It performs no metadata fetch and stores no iframe
or mutable embed HTML. Public playback is responsive, click-to-load,
privacy-conscious, non-autoplaying, sandboxed, and retains an accessible
provider-link fallback.

## Scheduling Dynamic Lists And Search

One-time publish and unpublish Scheduled Publication Appointments pin one exact
acknowledged D1 input, civil time, IANA timezone, selected offset, resolved UTC
instant, creator, and idempotency fingerprint. Core retains long-horizon truth;
only identifier-based work inside the bounded six-day execution horizon reaches
Inngest. Execution re-proves everything and invokes the ordinary D1 command.
Later edits never silently rebind the appointment. Each Page/locale has at most
one unresolved publish and one unresolved unpublish appointment, and a paired
publish must precede its unpublish.

One code-owned versioned Dynamic Source Catalog defines exact public DTO,
filters, operators, sorts, deterministic ordering, null behavior, limits,
eligibility, adapter, cache dimensions, migration, retirement and conformance
for each admitted source. A Content list stores only source key/version,
canonical typed Selection Intent, semantic presentation variant and bounded
copy. It stores no provider query, matching row, raw field path, relationship
depth, executable logic, copied operational fact, or cross-source join.

Exactly three curation branches exist: Updates automatically; Featured first,
which adds an ordered bounded featured set and exclusions before a deduplicated
automatic tail; and Choose every item, which contains only an ordered bounded
explicit set. One server resolver re-proves current exact-scope public safety
and deterministic ordering. Withdrawn items suppress immediately.

One versioned Public Page Window contract offers Show one set, Page links, Load
more, and bounded Auto-load. One public URL names at most one opaque placement
handle and ordinal; other lists retain bounded ephemeral state. Page links and
the Load more button are progressive enhancement over the same real canonical
anchor, so ordinary navigation, crawlers and JavaScript-off use remain complete.
A button-only implementation is prohibited. At most one list per Page auto-
loads. Keyboard, focus, announcement, reduced-motion, bounded-DOM, end, empty
and unavailable paths remain complete.

D17 builds one disposable derived public search projection per exact Tenant ×
environment × Site × locale × `public` × active generation. Launch uses bounded
Postgres full-text search behind a provider-neutral Search Document contract.
Every response applies one current set-based public-admission proof before
returning results. Adverse withdrawal suppresses synchronously, then priority-
deletes and verifies absence asynchronously. Rebuilds use bounded shadow
generations and an atomic derived-head switch; a partial index never replaces a
safe one. Launch engineering evidence targets are zero returned ineligible hits;
adverse first-request containment; p99 removal proof within 60 seconds with a
warning after 60 seconds and owner action at five minutes; p99 addition within
60 seconds and p99.9 within five minutes; a five-minute repair scan; full
reconciliation within 24 hours; zero known adverse or orphan drift; and no more
than 0.1 percent general drift. They are measured platform objectives, not
Tenant controls or public promises.

## Content Library Organization And Recovery

Content Library folders form one optional five-level staff-only organization
tree plus derived Unfiled for stable D6 ordinary Page and Article identities. Folder
identity, name, parent and item placement never affect Page hierarchy, paths,
Navigation, permissions, lifecycle, publication, Topics, search, cache, safety,
or public output. Removal atomically rehomes direct items and immediate child
folders exactly as previewed.

One Site Topic Profile selects a bounded catalog of stable Topic Set and Topic
identities: no more than eight active sets, 500 active Topics, three levels, and
20 direct assignments per eligible Page or Article. Each identity has one
immutable nonlocalized direct Topic Assignment Snapshot shared by all of its
locale lineages. Labels are localized;
missing exact-locale labels omit rather than fall back. Topics grant no scope,
permission, route, Navigation, lifecycle, public facet, or operational meaning.

Saved Library Views persist only bounded semantic filter, sort and column
definitions. Free-text search, result rows, counts, cursor, page, selection,
actions, permissions and provider query language are volatile. Personal and
Site-shared ownership are distinct; sharing creates a copy rather than changing
ownership. Each actor may hold 20 personal views and five actor-local favorites;
each Site may hold 20 shared views. Applying a view reauthorizes every result and
cannot widen access.

Trash moves one stable Page or Article identity and all locale lineages
together. It immediately removes favorable public and new-selection
eligibility, then downstream owners converge adverse-first without cascading
deletion. Restore creates a private draft after current collision and safety
proof. There is no Empty Trash. Only a proved never-released simple draft may
auto-purge after 90 complete days; every other permanent deletion is separately
authorized, non-cascading, expected-state fenced, receipt-backed and evidence-
gated.

## Localization Copy Preview Forms And Media

Exact-locale Editorial lineages are sparse and explicit. **Start blank** or
**Copy from...** creates an idempotent private lineage with provenance. Later
source changes show a comparison and never overwrite translation work. Every
authoring, link, placement, Navigation, Topic, Rich Text, metadata, search,
Preview and public read requests one exact locale with provider fallback off.

Copy to another Site creates one new independent private target draft or none.
An immutable plan classifies every field, semantic node and relationship as
copy, materialize/remap, review, or never copy. Reusable Sections materialize
locally; identities and anchors are fresh; links, media and dynamic sources
require qualified mapping. No permission, public, route, Navigation, schedule,
search, Trash, operational or future-sync authority transfers.

The ordinary public audience discriminator is exactly code-owned `public`.
Authentication, role, cookie, campaign, referrer, geography, experiment,
device, crawler, or history cannot alter public CMS output at the same trusted
scope. Listed and Shared by link are reach dispositions inside `public`.
Authenticated tasks hand off to app-owned routes.

Whole-Site Preview Candidates are immutable private exact Tenant × environment
× Site × locale closures over deliberately included acknowledged revisions.
Preparation snapshots briefly, compiles outside locks, re-proves current facts,
and seals by CAS. Ready means complete; partial candidates are not browsable.
Every request reauthorizes. Candidate routes never fall through to Live, and
giving, forms, notifications, analytics, tracking, prefetch, external embeds
and consequential downloads are side-effect-dark.

Public forms use a small versioned Purpose Profile and one released Route Plan
with exactly one domain-owned Primary Outcome. Tenant configuration is bounded
to admitted labels, help, options, order, confirmation copy and supplemental
questions; protected meaning, sensitivity, consent, retention, mappings,
recipient authority and executable routing remain code/owner-owned. One
transaction records the immutable Form Submission Occurrence, route plan,
Primary Outcome work, optional staff notification intents, optional visitor
acknowledgement and every corresponding product-owned workflow-dispatch/outbox
request before returning **Received**, or records none. Only identifier-only
Inngest execution occurs after commit. Child delivery failure never rolls back
the Primary Outcome. Staff notification and visitor acknowledgement select
separate compatible Live Phase 17 Email Studio publications; Resend remains
per-recipient bounded transport with product-owned durable idempotency and
monotonic delivery evidence. The five-step staff builder reuses the version-
pinned shared `useAsymForm` adapter, while the public form remains native,
no-JavaScript capable and exactly server-authoritative.

Media is one Tenant-wide public-still-image catalog. D27 owns opaque logical
identity, append-only semantic revisions, neutral catalog metadata, rights and
safety evidence/review, current Site qualification, Used in and placement/public
semantics. Placements own contextual accessibility and art direction. Phase 29
alone owns physical bytes, quarantine/inspection, renditions, provider copies/
access, applied holds and disposition mechanics; D1 alone activates exact
public use. Private hostile-file intake admits only certified bounded still-
image formats.

Current Site qualification derives Allowed, Needs review, or Blocked from exact
rights, consent, safeguarding, Phase 10, audience, expiry, revision and rendition
evidence. Neutral title/source/credit, bounded tags and the Media-only folder
tree improve discovery without granting authority. Protected provenance and
safety data stay out of ordinary search and telemetry. Same-Tenant digest
matches may suggest **Use existing** but never auto-merge identities or rights;
cross-Tenant duplicates are invisible. Safety-restricted Media is non-
enumerable, and authorized reveal/verdict is audited. Each placement pins asset
revision/rendition and owns locale, slot, accessible meaning, localized alt/
caption/credit, crop and equivalent content. D1 verifies exact delivery bytes
and qualification.

Anonymous delivery admits only the active generation or one delivery-retained
generation created on head replacement and bounded by maximum response/cache
lifetime plus skew; recovery-retained bytes are never public. Time-bounded
rights/consent cap cache freshness, stale allowances and retention before the
earliest expiry. Withdrawal and expiry deny origin adverse-first without
substitution. Optional Media folders form a separate private Tenant-wide Media-
only tree with derived Unfiled and at most five levels; they convey no custody,
use, permission, qualification, retention, release, or deletion authority.

## Search Sharing Portability And Staff Operations

One versioned Site Search & Sharing Profile is pinned per exact locale and
generates title, description, qualified share image, canonical, alternate,
crawler, sitemap/lastmod, robots, safe structured data and social output from
verified released facts. A Page locale may override only semantic title
portion, one short description and one D27-qualified share image. No arbitrary
head, template, JSON-LD or crawler DSL exists.

Exports are private encrypted artifacts over one sealed authorized snapshot.
Spreadsheet review output is formula-safe and non-reimportable. Archive/move
output is one versioned neutral Asym Content Package. Every download
reauthorizes. Import preparation is one saved full-page **Source → Destination
→ Match content → Check and resolve → Review plan** journey. **Check the import**
performs zero writes and seals an immutable plan with exact **Must fix before
creating drafts**, **Needs review before release**, **Will not be imported** and
**Information** totals. Commit is a separate fresh privileged command that re-
proves everything and creates private D12 revisions only through owner commands;
run results follow that command. Partial, resumed and reversed outcomes remain
explicit.

Supabase Auth is sole human identity/session/MFA authority; Phase 12 is sole
permission authority. A Payload Principal Link is immutable attribution only.
Engine Diagnostics is exceptional, read-only and incident-bound: active
incident, fresh AAL2, least-disclosure scope, ledger-before-read, 15-minute
default and 60-minute maximum, immediate revocation and no mutation. Every
repair remains a separately authorized typed product command.

Content Health is one rebuildable private exception projection over a small
versioned issue registry. It never owns source truth. Its exact link-native views
are Needs your action, Being handled automatically, Needs platform attention and
Recently resolved. Health check incomplete is a coverage notice, never a healthy
or resolved disposition. Recently resolved uses a code-owned 30-day presentation
window, not a retention promise. Contextual and central views resolve the same
stable issue. Only fresh source-owner proof resolves it. Direct recovery is rare,
registered, separately authorized, exact-targeted, expected-state fenced,
idempotent, bounded, read-back and receipt-backed.

Accessibility Assistance has exactly Details to finish, Suggestion, and
Technical issue. Healthy checks are quiet; unavailable evidence is never shown
as passed. Suggestions are contextual and nonblocking. Keep as written is
bounded to unchanged locale, semantic input and rule version. D32 creates no new
release blocker, score, grade, badge, shame, certification, waiver, broad
suppression or approval workflow. D1 remains the authoritative candidate check.

## Data Integrity Security And Operations

Security, lifecycle, hot-filter, version, ownership and invariant facts use
typed relational columns and same-scope composite relationships. Bounded
versioned semantic payloads and redacted provider diagnostics may use JSON.
Operational tables use deny-by-default grants and RLS where appropriate;
application commands still reauthorize before database access. A record ID,
candidate ID, version ID, object key, URL, cookie or service role grants nothing.

Every mutation binds exact owner-defined dimensions, current capability and
relationship closure, expected revision or sealed input, idempotency and a
durable receipt/outbox fact. Transactions are short and contain no remote work.
Post-commit execution uses the shared dispatch, claim, retry, dead-letter and
reconciliation pattern. External outcome unknown is inspected before retry.

Rebuildable search, use, health, count, folder-path and other projections cannot
authorize source mutation, public visibility or destructive disposition. Stale
or incomplete favorable proof fails closed. Adverse owner state is enforced
synchronously at the smallest public boundary before asynchronous convergence.

Privacy-safe telemetry contains opaque correlation, owner/family/version,
timing, count, size, lag, cause and outcome. It excludes content, search text,
form answers, routes, addresses, names, filenames, media metadata/evidence,
tokens, signed URLs and secrets.

## Capacity Payload Cohort And Clean Cutover

D33 defines one versioned provider-neutral Production Capacity Profile with
complete Minimum, Typical and Measured maximum cells for workload, UX,
correctness, freshness, recovery, fairness, headroom and unit cost. One exact
version-pinned Vercel Qualification Attachment demonstrates the chosen
implementation. Optional work sheds before safety, current public truth,
accepted work, form durability or donor access. Public and staff overload states
remain provider-free and truthful.

D34 begins with current official npm, GitHub release/tag/source/security/issue
and migration evidence. One coherent lockstep Payload v4 package/plugin cohort
is admitted, preferably supported stable. A prerelease is allowed only when no
stable cohort satisfies the contract and one accountable residual-risk owner,
expiry, upgrade and retirement plan is recorded. Floating ranges, mixed
channels, forced peers, v3 fallback, stock-Admin rollback, mutable public reads,
dual authority and permanent multiversion abstractions fail admission.

D35 starts with a read-only census of repository artifacts and hosted rows and
objects after proving the target environment is nonproduction and disposable
or safely namespace-confined. Each item is discard fixture/demo, transform
retained, regenerate derived, or unresolved/block. Build D1-D34 from an empty
database. Any retained-state transform uses neutral semantic DTOs and supported
APIs, is deterministic, idempotent, encrypted and short-lived, and gains no
runtime authority. One bounded switch moves every writer, reader, Preview,
compiler, script and test. Then remove all legacy collections, schemas, routes,
flags, fallbacks, fixtures, adapters and transforms and prove fresh-clone/empty-
database reproducibility. Production or customer reliance stops destructive
work for a new decision.

## Staff Experience Contract

Web Studio uses Core's established staff shell, controls, semantic statuses,
responsive patterns, and accessible form/dialog behavior. Tenant, environment,
Site and locale remain visible. Provider, queue, database, manifest and compiler
jargon stays out of ordinary work.

The ordinary Page journey is Edit, Preview, Publish. Persistent status reports
only acknowledged facts and distinguishes Unsaved changes, Saving, Saved,
Scheduled, Published with unpublished changes, Updating public site, Live, and
one cause-owned exception. Important outcomes are never toast-, color-, motion-
or hover-only. Outcome-unknown work resolves its receipt before another
successor command.

Pages, Navigation, Content Library, Media, localization, Preview, forms,
portability, health and accessibility workflows use progressive disclosure.
Drag is optional; every move, reorder and crop has a named accessible control.
Consequential dialogs preserve context, focus the least destructive action,
support visible Cancel/Escape, restore focus, and use calm plain language.

Every critical journey must work by keyboard, screen reader and touch at 320
CSS pixels, 200-400% zoom, forced colors, reduced motion, long localization,
CJK, RTL and bidirectional text, weak networks, suspended tabs and expired
sessions. Public output remains meaningful without JavaScript. Motion is
decorative, interruptible and never blocks content, Navigation or Give entry.

## Testing And Evidence Strategy

Tests target the Web Studio Operations boundary and use
`PublishedContentReader` as the sole public oracle. They assert behavior,
authority, immutable inputs, receipts, exact outcomes and last-safe-public
continuity—not Payload hooks, table layout, job order or component internals.

Required evidence layers are:

1. Pure contract tests for typed actor/service commands, deterministic compiler
   manifests/digests, exact locale and route resolution, CAS, idempotency,
   conflicts, revocation, migration and projection adapters.
2. Static and serializer proof that public code can consume only active D1
   artifacts and qualified media routes.
3. A strict non-skipping real Supabase Auth + Payload + Postgres + Playwright
   tracer from staff edit through acknowledged save, candidate, Preview,
   activation and exact visitor artifact, including a forced failure that leaves
   the prior artifact byte-stable.
4. Feature tracers for hierarchy/routes, Navigation, scheduling, lists, search,
   folders/Topics/views/Trash, locale, Copy to Site, forms, DAM, metadata/share,
   portability, diagnostics, health and accessibility assistance.
5. Real Postgres isolation, RLS/grant, composite scope, transaction, CAS, lease,
   claim, outbox, adverse-race and hostile-input matrices.
6. Axe plus manual keyboard, screen-reader, focus/error, touch, 320px, 400%
   zoom, forced colors, reduced motion, RTL/CJK, weak-network and moderated
   nonprofit-staff journeys.
7. D33 production-shaped load/fault/cost evidence, D34 exact-cohort
   qualification, and D35 census, empty-database, cutover and retirement proof.

The Phase 23 closure checklist is mandatory. Ticket slicing may assign proof
items but cannot omit them. No implementation claim becomes Live or Confirmed
until its exact required evidence and operational state exist.
