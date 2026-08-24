<!-- phase23-to-spec:web-studio-cms:v1 -->

# Phase 23 — CMS / Site Planner Dynamic Content Parity

**Status:** Implementation-ready specification; not implemented  
**Decision authority:** Phase 23 D1–D36, founder-ratified and scope-frozen
2026-08-24  
**Confirmed public testing seam:** the **Web Studio Operations boundary**—the
actor-bound and registered service-command ports that drive D1's deterministic
Site Plan compiler and activation fence, observed publicly only through the
single `PublishedContentReader`  
**OpenSpec change:** `add-web-studio-cms`  
**Parent specification issue:** [#1339](https://github.com/Asymmetric-al/core/issues/1339)

This specification publishes the complete Phase 23 product and engineering
contract for implementation planning. It authorizes neither runtime work nor a
claim that any FORWARD capability described below exists. The exact Payload v4
cohort, any retained-state disposition, production-shaped capacity values, and
every Live or Confirmed claim remain evidence-gated implementation decisions
under D33–D36.

## Problem Statement

Nonprofit missions organizations need to build distinctive multilingual public
Sites without learning a CMS vendor's model. Occasional staff must understand
where a Page lives, what changes affect, whether work is saved, and what will
become public. Designers need real presentation freedom without creating a
second permission system, publication path, operational-data copy, executable
tenant-plugin surface, or fragile per-Tenant fork.

The repository proves Payload-in-admin, a Web Studio shell, Supabase staff
identity, one published-content read choke point, and a strict local
Supabase/Postgres/Payload/Playwright harness. It does not implement D1–D36:
current shapes collapse authorities, public reads use mutable documents, and
there is no coherent generation compiler, whole-Site candidate, exact-locale
lineage, governed search/forms/DAM/health, or clean one-authority replacement.

Payload drafts, versions, folders, Trash, jobs, APIs, search, and plugins are
private machinery—not Asym permission, publication, route, safety, or recovery
authority. Publishing mutable records independently risks mixed output and
draft leakage; copying operational truth forks identity; broad schema/query/
workflow/plugin/audience builders create unbounded support and security risk.

Finally, Saved, Scheduled, Activated, Live, Indexed, and externally visible are
different facts. Every timeout, conflict, withdrawal, collision, deletion lag,
revocation, or provider outage must preserve the last safe generation and show
one plain-language cause and next action. Healthy systems stay quiet.

## Solution

Build one Page-first **Web Studio** over a provider-neutral versioned contract;
Payload v4 is a qualified private engine, never product authority. The lifecycle
is:

`Working Revision → exact candidate proof → immutable Public Site Generation → serving-head CAS → observed downstream convergence`.

1. A stable Site **Page** has immutable **Page** or **Article** family,
   exact-locale Editorial and Placement revisions, Page-local typed sections,
   explicit shallow reuse, derived hierarchy/path, and independently versioned
   Primary/Footer Navigation.
2. D1 compiles the exact affected Tenant × environment × Site × locale closure
   and advances one head only after complete proof. Public requests read that
   immutable generation; every failure leaves the previous generation live.
3. One accessible Edit → Preview → Publish journey uses acknowledged Working
   Revisions, a fenced Active Editor Lease, exact schedules, and complete
   private Whole-Site Preview Candidates without public side effects.
4. A closed section/Rich Text/Topic catalog, inert starters, three curation
   strategies, one source-discriminated Content list, and link-native windows
   cover ordinary publishing. Certified Site Presentation Packages provide
   bespoke design behind a data/auth/write/money/route safety boundary.
5. Disposable exact-public search and sharing projections, authority-free
   folders/views, reference-aware Trash, and exception-first Content Health
   organize or explain source truth without replacing it.
6. Purpose-bounded forms durably record an occurrence before exactly one
   Primary Outcome. A Tenant-wide public-still-image DAM uses immutable custody,
   current rights/safeguarding and Site qualification, usage-local presentation,
   and complete use evidence.
7. Exact-locale generated metadata allows only three overrides. Governed
   portability seals coherent private exports and no-write import plans; a
   fresh privileged commit creates private D12 drafts and no public effects.
8. Supabase Auth/Phase 12 remain human identity/permission authority. Typed
   actor and registered service ports own work; `PublishedContentReader` alone
   observes public state. D33–D35 qualify one current Payload v4 cohort, Vercel
   capacity, clean target, optional census-selected transform, one authority
   switch, and complete legacy retirement. Built, Live, and Confirmed remain
   separate evidence states.

## Scope and Dependency Boundaries

Phase 23 owns ordinary exact-locale authoring, Site structure, coherent
generation release, Preview, public discovery/sharing/forms/still-image media,
Library organization, health, and the smallest public-safe interfaces to other
owners. It depends on Phase 2 Tenants, Phase 3 Sites, Phase 5 public runtime,
Phase 10 eligibility, Phase 12 capabilities, and the founder-ratified Phase 22
contracts. Phase 22 documentation is a dependency, not proof of implementation.

Phases 6/17 and 24–34 and later authenticated applications retain their named
message, domain, renderer, search, localization, form, custody, import,
analytics, deployment, workflow, and private-product authority. An absent or
uncertified owner stays unavailable; Web Studio creates no substitute truth.
Current Payload collections and provider features are D34–D35 evidence, not
grandfathered product contracts.

## UX and Information Architecture

### Product shell and truthful status

Web Studio uses Core's established `StudioLayout`, page shells, Base UI
controls, semantic status colors, responsive patterns, and accessible form and
dialog behavior. Tenant, environment, Site, and locale remain visibly pinned.
Provider names, database terms, version counters, queue jargon, and compiler
identifiers stay out of ordinary staff journeys.

One persistent status region beside **Preview** and the release action reports
only acknowledged facts: **Unsaved changes**, **Saving…**, **Saved just now**,
**Scheduled**, **Published · Unpublished changes**, **Updating public site**,
**Live**, or one cause-owned exception with one valid next action. Routine
success is quiet; no critical outcome exists only in a toast, color, animation,
or hover state. Outcome-unknown operations say so and resolve the existing
receipt before allowing a different successor command.

### Pages, structure, and composition

The Pages workspace provides searchable hierarchy/list views, **New Page**,
**New Article**, the Page editor, a semantic section outline, current web
address, Navigation summary, Preview, and Publish. The user never edits a
second placement document, mutable Site Plan, provider draft, raw block tree,
or release manifest.

Parent selection is searchable. Drag may enhance reorder and move, but
**Move up**, **Move down**, **Move to**, and named-position controls are
first-class keyboard paths. A move or rename shows **Currently live** and
**After publish**. Small impacts are concise; large descendant changes use a
searchable, resumable review and one closure-level confirmation.

The section chooser uses plain-language names, representative previews, and a
one-sentence purpose. It shows only family-qualified sections. A placement is
visibly **Local** or **Shared**. Reuse actions are explicit: **Save this section
for reuse**, **Reuse existing**, **Change every use**, **Make a local copy**,
and **View uses**.

### Navigation and public discovery

Navigation shows exactly two ordered outlines: **Primary Navigation** and
**Footer Navigation**. **Add item** offers a managed Page or registered Site
destination, an HTTPS external website, or a non-navigating Group. Page-aware
assistance opens the same Navigation draft; it never creates `showInMenu` or
other duplicate Page fields. Groups and Links are visually and semantically
distinct, and every reorder has a non-drag path.

Content-list controls ask what to show, how to curate it, and how visitors load
more—never for a provider query. Staff choose **Updates automatically**,
**Featured first**, or **Choose every item**, then one bounded windowing
profile. Preview explains empty, unavailable, stale, and end-of-list behavior.

### Library, media, and operational clarity

The Content Library is a calm inventory, not a project-management dashboard.
It offers purpose-bounded folders, Topics, personal/shared views, Trash, and a
quiet **Needs attention** entry. Healthy state remains quiet. A contextual
status and the central Content Health workspace resolve to the same stable
issue, name the cause owner, show public impact, and offer only an authorized
typed recovery action.

Media provides **All media**, **Needs attention**, **Recently used**, and
**Trash**, with grid/list views, restrained search and filters, an optional
folder rail, a persistent upload tray, and a detail inspector ordered:
Preview/status, Details, Rights & safety, Can be used on, Used in, Versions,
Activity, Technical details. **Choose media** defaults to **Ready for this Page
and Site**, then shows slot preview, accessibility treatment, crop, and focus
return. Upload, Ready, Allowed, Used, Live, and Retained are never conflated.

### Localization, Preview, forms, and portability

Single-locale Sites remain simple. Multilingual Sites show exact locale status
and explicit **Start blank** or **Copy from…** actions. Missing translation is
missing; no field silently falls back. Source changes produce a comparison and
never overwrite translation work.

Preview supports quick Page feedback, an exact pinned preview, and deliberate
**Prepare site preview**. Persistent chrome names Site, locale, prepared time,
included change count, and **Site preview · Not public**. Candidate links stay
inside the candidate. Expiry, revocation, or invalidation never falls through
to Live.

The form builder is a short sequence: **Purpose**, **Questions**,
**Delivery**, **Confirmation**, **Review & publish**. Delivery explains
**Where the work goes**, **Who should be notified**, and **What the visitor
receives**. Imports use a saved full-page **Source → Destination → Match content
→ Check and resolve → Review plan** journey; check performs no writes, and a
separate fresh privileged commit states that results are private drafts.

### Accessibility and responsive behavior

Every critical task works by keyboard, screen reader, touch, at 320 CSS pixels,
200–400% zoom, forced colors, reduced motion, long translations, CJK, RTL and
bidirectional text, weak networks, suspended tabs, and expired sessions.
Consequential dialogs preserve context, focus the least destructive action,
support visible Cancel and Escape, restore focus, and do not use hostile or
legalistic copy. Public output remains meaningful without JavaScript; motion is
decorative, interruptible, and never blocks content or Give entry points.

## Independently Verifiable User Stories

### US23-001 — Compose and release one coherent Page (D1)

As a Site editor, I want one Page-local editing journey with deliberate reuse
and one release action so visitors never receive a mixed dependency state.

Acceptance criteria:

- One stable Site-scoped Page exposes locale Editorial and Placement revisions
  through one experience; ordinary sections remain local unless explicitly
  made or selected as a Reusable Section.
- Preview pins exact acknowledged revisions and the qualified renderer.
- Publish validates the complete affected closure, seals one immutable Public
  Site Generation, and compare-and-swaps one expected locale serving head.
- Any stale input, scope violation, compile/storage failure, or lost race keeps
  the previous generation live and identifies the owning cause.
- Public reads use only the active generation through `PublishedContentReader`;
  downstream search/cache/CDN convergence is observed separately.

### US23-002 — Stage hierarchical paths safely (D2)

As a Site editor, I want to move or rename a Page after reviewing the exact
descendant impact so paths and breadcrumbs change atomically.

Acceptance criteria:

- Placement stores the exact-locale parent, normalized local segment, and
  sibling order; the canonical path is derived deterministically.
- Cycles, self-parenting, reserved or duplicate paths, invalid normalization,
  and cross-scope parents fail before release while preserving the draft.
- Review shows old/new paths for every affected descendant and supports a
  searchable resumable impact set at high fan-out.
- One D1 activation releases the complete branch and breadcrumbs or none;
  Navigation remains independently versioned.
- A 2,000-descendant qualification proves bounded review and compilation with
  no request-time descendant writes.

### US23-003 — Preserve exact-path continuity without a redirect engine (D3)

As a Site operator, I want old Page links to remain useful while retaining one
bounded repair lane for a specific legacy address.

Acceptance criteria:

- Every released predecessor path for the same Page stays reserved and resolves
  directly to its current eligible canonical path without chains.
- An authorized repair may bind one exact unused historical path to one eligible
  ordinary Page in the same Site and locale by stable identity.
- Patterns, wildcards, query transforms, external targets, priorities,
  schedules, chains, and source-owned claims are rejected.
- Unpublishing has an explicit Page replacement or a branded not-found result;
  the system never invents a destination.
- Resolution applies only to public `GET`/`HEAD`, fails privacy-safely, and
  never traverses mutable source records at request time.

### US23-004 — Curate Navigation independently (D4)

As a Site editor, I want Page-aware Navigation assistance without coupling
menus to hierarchy or duplicating Navigation truth.

Acceptance criteria:

- A Navigation Revision owns purpose, membership, grouping, order, destination,
  and menu-local copy; it owns no path, hierarchy, or breadcrumb fact.
- Page actions open the same expected-revision Navigation draft used by the
  Navigation workspace and show Live versus Draft placement.
- Managed destinations use stable references; moving a Page does not require a
  Navigation rewrite, and a title change does not overwrite customized copy.
- D1 may release related Page and Navigation revisions coherently; invalid or
  newly ineligible destinations are blocked or source-suppressed without
  corrupting Navigation history.

### US23-005 — Build two bounded public menus (D5)

As a Site editor, I want a small Link-or-Group grammar for Primary and Footer
Navigation so menu editing stays flexible and understandable.

Acceptance criteria:

- Exactly Primary Navigation and Footer Navigation exist; staff cannot create
  more purposes or separate desktop/mobile trees.
- A Link has one managed, registered, or HTTPS destination and no children; a
  Group has one label, terminal Links, no destination, and no nested Group.
- Invalid mixed structures and destructive removal of nonempty Groups fail on
  every write path.
- At most one ordinary top-level Primary Link can be the Prominent action;
  conflict is explicit and presentation cannot change its semantics.
- Public output uses semantic `nav`, list, link, and disclosure patterns with
  accessible current-location and no application `menubar` behavior.

### US23-006 — Start one semantic Page family (D6)

As a content editor, I want clear Page and Article starts so I make only the
choice that changes meaning.

Acceptance criteria:

- **New Page** creates immutable `general_page`; **New Article** creates
  immutable `article`, using staff-facing labels only.
- Pages may be roots or parents; Articles are hierarchy leaves with dated,
  repeatable editorial semantics, without implicitly creating feeds, search,
  schedules, taxonomies, notifications, or bylines.
- A compatible versioned Page Starter seeds fresh independent local identities
  once; later starter changes never propagate.
- Released family cannot mutate in place; correction uses explicit replacement
  or qualified migration with route consequences.
- Phase 22 Missionary, Project/Campaign, and Ministry Update sources do not
  become these ordinary families.

### US23-007 — Compose from the closed semantic catalog (D7)

As a content editor, I want a small family-qualified section catalog so I can
build useful Pages without a generic layout system.

Acceptance criteria:

- Page admits Hero, Rich Text, Media, Gallery, Call to Action, Cards, FAQ,
  Quote, and Impact Statistics; Article admits Rich Text, Media, Gallery,
  Quote, and Call to Action.
- One flat ordered sequence has stable lineage-local section identities,
  versioned typed content, accessible move controls, and recoverable removal.
- Hero is Page-only, first, and singular; every type enforces its semantic and
  reference rules on all write paths.
- No dormant rows, columns, arbitrary style fields, generic children, nesting,
  or best-effort unknown block rendering ships.
- Catalog evolution is explicit and additive, with retained readers/migrations
  for every released version.

### US23-008 — Reuse one semantic leaf explicitly (D8)

As a content editor, I want to share an eligible section while always knowing
whether a change affects one placement or every use.

Acceptance criteria:

- Every eligible D7 leaf except Hero can become one Site-and-locale-scoped,
  presentation-neutral Reusable Section; nested or multi-section reuse fails.
- Every placement has its own identity and clearly offers Change every use,
  Make a local copy, and View uses; per-placement semantic overrides do not
  create hidden forks.
- Saving a shared draft has no public effect. A shared successor advances all
  qualified live uses in one D1 closure or none.
- Retiring prevents new selection but preserves references/history; referenced
  or ever-released shared content cannot be destructively deleted.
- Reverse-use projections may aid UX, but generation manifests remain release
  impact authority.

### US23-009 — Admit a certified bespoke presentation (D9)

As a tenant design owner, I want a genuinely custom Site experience without
granting presentation code application authority.

Acceptance criteria:

- A source-controlled, Site-bound Presentation Package is admitted only with an
  immutable manifest, provenance, human owner, support terms, compatibility,
  assets/CSP/dependencies, SBOM/licenses, budgets, fallbacks, and evidence.
- Tenant-uploaded bundles, remote modules, runtime plugins, arbitrary network
  clients, raw Payload/Supabase, secrets, auth, writes, routes, SEO, money,
  consent, and publication authority are unavailable.
- The package consumes only the serialized Public Presentation View Model and
  registered capability islands; new authorable meaning requires D7 evolution.
- Staff review actual candidate content with locale/family/device/reduced-motion
  controls and never manage source, npm, CSP, or deployment configuration.
- Accessibility, SSR/no-JS, deterministic hydration, isolation, cost,
  performance, failure containment, and last-known-good recovery all qualify.

### US23-010 — Activate design for the complete locale cohort (D10)

As a design publisher, I want one all-or-none Site presentation activation so
visitors never see an accidental mixed design cohort.

Acceptance criteria:

- The activation manifest exactly covers every currently public locale and a
  proved disposition for every enabled nonpublic locale.
- The server re-proves authority, cohort census, exact expected heads,
  candidate generations, package compatibility, and evidence.
- One short transaction advances all expected locale heads or none and changes
  presentation only—not content, routes, Navigation, SEO, eligibility, giving,
  locale enablement, or dates.
- Retry is receipt-idempotent; outcome unknown resolves the existing receipt,
  and Restore previous design creates a new proved successor over current
  content rather than rewinding history.
- Published and downstream delivery convergence remain distinct statuses.

### US23-011 — Author bounded rich text and typed video (D11)

As a content editor, I want useful prose and video tools without unsafe HTML or
an uncontrolled embed surface.

Acceptance criteria:

- One versioned Rich Text Profile admits paragraph/root/break, H2–H4, bounded
  lists, quote, bold, italic, typed links, and one typed YouTube/Vimeo node;
  Page title owns H1 and all other syntax fails closed.
- Paste preserves supported meaning; unsupported tables, images, embeds, code,
  or footnotes require supported-text, plain-text, or cancel—never silent loss
  or retained unsafe HTML.
- Internal links use eligible exact-scope identities; external HTTPS, email,
  and phone links are typed and unsafe schemes/fragment smuggling fail.
- Video stores only provider, canonical public ID, bounded start, visible title,
  and captions/equivalent-text disposition; it is click-to-load, privacy-
  conscious, sandboxed, and has an accessible provider-link fallback.
- Raw Payload/Lexical JSON stays private. D1 compiles a provider-neutral
  semantic projection; pure idempotent migrations are previewable and never
  auto-publish.

### US23-012 — Autosave with one recoverable active editor (D12)

As a content editor, I want server-authoritative autosave and clear conflict
recovery so sessions never silently overwrite each other.

Acceptance criteria:

- Each exact resource scope has one private Working Revision, expected Source
  Revision, and at most one actor/session Active Editor Lease whose monotonic
  Lease Generation fences every mutation.
- Launch qualification starts near a two-second idle debounce, five-minute
  inactive lease, one rolling autosave, and 100 ordinary unpinned history
  entries; only measured platform evidence—not Tenant settings—may tune them.
- A short idle debounce coalesces one rolling recovery autosave; Save now and
  `Ctrl`/`Cmd`+`S` flush without publication, and **Saved** appears only after
  exact server acknowledgement.
- Another session is read-only with bounded editor identity/activity. An
  independently authorized takeover checkpoints, transfers generation, and
  gives the displaced session compare/copy recovery.
- Not-sent, rejected, outcome-unknown, stale source, expired auth, and revoked
  access are distinct states that preserve local work and allow only the safe
  next action.
- History uses meaningful immutable checkpoints and Restore as a new draft; it
  never rewrites audit, working history, or public heads.

### US23-013 — Schedule an exact publication operation (D13)

As a publisher, I want a one-time publish or unpublish appointment pinned to an
exact revision so later edits and delayed delivery cannot change its meaning.

Acceptance criteria:

- The appointment stores exact action, D1 input/revision, IANA timezone,
  displayed local time, derived UTC instant, creator, and idempotency identity.
- Creation/reschedule previews daylight-saving ambiguity or invalid time;
  cancellation is explicit, at most one unresolved publish and one unresolved
  unpublish exist per Page/locale, and publish must precede unpublish.
- Core owns far-future records; only the bounded six-day execution horizon is
  dispatched to Inngest. Duplicate, delayed, replayed, missing, or superseded
  delivery is receipt-idempotent.
- Execution re-proves authority, Site/source eligibility, routes, exact input,
  and expected head, then invokes the same D1 command; failure leaves prior
  Live unchanged and becomes actionable **Needs attention**.
- Page context and **Scheduled changes** expose Upcoming, Needs attention, and
  History without provider or queue terminology.

### US23-014 — Configure one typed dynamic source (D14)

As a content editor, I want one Content list block whose fields match its
selected source so I can build useful listings without a query language.

Acceptance criteria:

- One versioned code-owned Dynamic Source Catalog maps a source key/version to
  exact filters, sort options, projected public fields, cursor semantics,
  eligibility, limits, adapter, and migration.
- A block stores source-discriminated semantic Selection Intent only—no raw
  provider query, collection slug, field path, relationship depth, copied
  result, script, or expression.
- Article is available at launch; Phase 22 and later sources appear only after
  their owner certifies the required public projection.
- Editor preview and D1 resolve the same intent. Unknown/stale catalog versions,
  unavailable sources, invalid filters, or unsafe items fail narrowly and do
  not break unrelated Page content.
- Resolution is bounded, stable, exact-scope, cacheable by generation and
  intent, and free of request-time N+1 work.

### US23-015 — Curate a list in one of three ways (D15)

As a content editor, I want only the curation choices that match common work so
I can understand how future eligible items will behave.

Acceptance criteria:

- Exactly **Updates automatically**, **Featured first**, and **Choose every
  item** exist and each shows a plain-language future-change explanation.
- Automatic stores filters/sort; Featured first adds ordered stable identities
  and bounded exclusions; Choose every item stores only an ordered stable
  explicit selection.
- Duplicate, invalid, cross-scope, unavailable, or ineligible selections fail
  with repair guidance; current adverse withdrawal suppresses immediately.
- Featured items do not repeat in the automatic tail, ordering is deterministic,
  and a strategy change preserves recoverable prior intent until saved.
- No ranking DSL, arbitrary query builder, personalization, per-item layout, or
  silent fallback to a different strategy ships.

### US23-016 — Browse link-native list windows (D16)

As a visitor, I want lists that can use page links, Load more, or bounded
automatic loading without losing URLs, focus, history, or other lists' state.

Acceptance criteria:

- One Public Page Window contract renders a canonical first window and stable
  server-rendered later-window anchors for **Show one set**, **Page links**,
  **Load more**, or **Auto-load** presentation.
- D1 assigns a stable handle per placement, but one URL may name at most one
  handle and ordinal. Other lists may keep bounded session/History state; copy,
  refresh, crawl, canonical, and no-JS guarantee only the named lane.
- Load more is button-led but progressively enhances the same real anchor;
  ordinary link/no-JS discovery remains, and at most one list may auto-load.
- Malformed, stale, wrong-list, cross-scope, or oversized window input is
  rejected before expensive work; changed membership avoids duplicates as far
  as the exact source contract permits and explains refresh when required.
- Empty, end, source-unavailable, JavaScript-off, crawler, keyboard, and screen-
  reader paths remain usable and link-native.

### US23-017 — Search one derived public Site projection (D17)

As a visitor, I want fast, accessible Site search that never reveals or revives
private content.

Acceptance criteria:

- The projection contains only D1-active, exact-Tenant/Site/locale, allowlisted
  public fields and canonical routes; Postgres full-text search is the launch
  engine behind a provider-neutral contract.
- Search applies current adverse suppression before returning results, so
  unpublish, Trash, withdrawal, permission loss, or deletion cannot wait for
  asynchronous index cleanup.
- Activation records durable upsert/delete work; replay, reconciliation,
  interrupted rebuild, and shadow-generation swap are idempotent and never
  replace a safe index with a partial one.
- UX provides an accessible query, result count/state, highlighted but escaped
  excerpts, clear zero results, link-native windows, and no private counts,
  facets, suggestions, or query indexing.
- Staff health exposes bounded lag, oldest pending item, deletion failures, and
  repair; public outage degrades without querying mutable drafts.
- Initial evidence objectives are zero returned ineligible hits; adverse
  first-request containment; p99 removal proof ≤60s (warn then act at 5m);
  p99 add ≤60s/p99.9 ≤5m; 5m repair scan; ≤24h full reconciliation; zero known
  adverse/orphan drift and ≤0.1% general drift. These are engineering targets,
  not Tenant controls or promises.

### US23-018 — Organize the Content Library with authority-free folders (D18)

As a staff member, I want simple folders for finding content without changing
its scope, permissions, URL, lifecycle, or public behavior.

Acceptance criteria:

- One purpose-bounded tree organizes stable D6 ordinary Page/Article identities
  only, at most five levels plus **Unfiled**; folder identity/name/parent/
  order are not content authority.
- Create, rename, move, rehome, and remove use exact expected-state commands,
  cycle/duplicate/scope checks, and atomic previewed consequences.
- Removing a folder rehomes its items/children exactly as confirmed; it never
  deletes, unpublishes, moves a Page path, changes Navigation, Topics, search,
  cache, permissions, or retention.
- Existing and imported content begins Unfiled without mass row duplication or
  public changes.
- Cross-Tenant/Site/locale visibility and counts fail non-enumerating; folders
  do not become an RLS hierarchy or storage path.

### US23-019 — Apply a bounded Site Topic Profile (D19)

As ministry staff, I want a small named Topic catalog for regions, ministry
focus, and audience discovery without an uncontrolled taxonomy project.

Acceptance criteria:

- One versioned, release-bound Site Topic Profile selects code-owned Topic Sets
  and stable identities; launch permits at most 8 sets, 500 Topics, 3 levels,
  and 20 direct assignments per item.
- Staff choose direct labels through searchable plain-language controls; Topics
  do not confer scope, permission, folder, route, hierarchy, or eligibility.
- One immutable direct Topic Assignment Snapshot is nonlocalized and shared by
  all locale lineages; only Topic labels localize. Rename/reparent preserves
  identity/history, and a missing exact-locale label is omitted, never borrowed.
- Profile/assignment changes remain private until the affected locale D1
  release; unknown, retired, cyclic, over-bound, or unresolved use fails with a
  repair cause.

### US23-020 — Save bounded personal and shared Library views (D20)

As staff, I want to save common Library arrangements without creating durable
queries that widen record access.

Acceptance criteria:

- A view stores a versioned semantic definition with at most 10 AND filters, 20
  values per filter, 12 columns, and code-owned sorts; free-text search is never
  saved.
- Each user may own 20 personal views and 5 actor-local favorites; a Site may
  have 20 shared views. Personal/shared never converts in place—sharing or
  privatizing creates a copy. Mutations require current capability and CAS.
- Applying a view still reauthorizes every returned record; counts and invalid
  fields are non-enumerating and fail narrowly with repair guidance.
- View actions change no content, folder, Topic, permission, lifecycle,
  release, search, or public truth.

### US23-021 — Trash and restore whole content identities (D21)

As staff, I want recoverable deletion with impact clarity so accidental cleanup
does not cascade or silently republish content.

Acceptance criteria:

- Trash moves one whole logical identity, all locale lineages, and new-selection
  eligibility; it suppresses public use adverse-first but does not cascade to
  referenced content.
- Before Trash, exact references, routes, schedules, active editors, reusable
  uses, Navigation, and media consequences are derived; incomplete evidence
  blocks a destructive claim.
- Restore returns a private draft only, revalidates path/reference collisions,
  and never republishes, re-enables schedules, or revives expired proof.
- Retention is 90 complete days; no Empty Trash or bulk permanent delete ships.
  Only a proven never-released simple draft may auto-purge; all other purge is
  separately authorized, fenced, non-cascading, and receipt-backed.

### US23-022 — Start and release exact-locale lineages (D22)

As a multilingual editor, I want explicit translation starts and independent
locale releases so missing or stale copy is never hidden by fallback.

Acceptance criteria:

- One bounded Localized Editorial Profile governs exact BCP-47 locale lineages;
  the default locale is not storage authority for another locale.
- **Start blank** or **Copy from…** creates an idempotent private lineage with
  provenance; later source changes show **Source changed** comparison and never
  overwrite translated work.
- Authoring, links, placement, Navigation, Topics, rich text, metadata, search,
  Preview, and public reads request one exact locale with Payload fallback off.
- Each locale can save, review, schedule, release, unpublish, Trash, and recover
  independently; no ordinary Publish all locales or mixed-language result
  ships.

### US23-023 — Copy one ordinary Page to another Site (D23)

As authorized staff, I want to copy content to another Site as an independent
draft without creating synchronization or moving source authority.

Acceptance criteria:

- Preflight and commit re-prove source read and target create/edit authority and
  show target Site, domain, locale, family, and proposed path.
- A versioned transfer manifest exhaustively classifies content as copy,
  materialize/remap, review, or never copy; unknown content fails closed.
- Reusable Sections materialize locally, identities/anchors are fresh, and
  internal links/media/dynamic sources require explicit qualified mappings.
- One immutable plan and idempotent short transaction create one private target
  draft or none; source, public heads, Navigation, schedules, search, Trash,
  permissions, operational facts, and future edits never propagate.
- The target editor preserves a persistent repair summary; native provider
  duplicate/copy-locale paths are unavailable for ordinary content.

### US23-024 — Serve one exact public audience (D24)

As a visitor, I want the same ordinary public Site regardless of authentication
state while private tasks remain in their owning applications.

Acceptance criteria:

- Exact code-owned `public` is mandatory in every public context/artifact;
  missing, unknown, conditional, segmented, or personalized audience fails
  closed.
- Normalized HTML, RSC, Navigation, lists, media, metadata, search, and discovery
  remain invariant across anonymous, donor, missionary, staff, expired session,
  crawler, campaign, geography, device, and referrer classes.
- Cache/artifact identity includes every trusted byte-varying dimension and
  structurally excludes auth/personalization imports; tags never authorize.
- Listed and Shared by link are reach states within public. App links enter
  app-owned private routes; private-app failure cannot alter public content.
- Preview is private/no-store/noindex and says it shows what anyone will see;
  future audiences require a new founder decision.

### US23-025 — Review a sealed whole-Site candidate (D25)

As staff, I want to browse an exact private Site candidate so review matches
the artifact that could be released without creating public side effects.

Acceptance criteria:

- Quick Page Preview follows acknowledged D12 saves; exact preview pins review
  truth; **Prepare site preview** seals a complete Tenant/environment/Site/
  locale closure over deliberately included revisions.
- Preparation snapshots briefly, compiles outside locks with bounded work,
  re-proves facts, and seals by CAS. Ready means complete; partial output is
  never browsable and later edits require an explicit successor.
- Routes, Navigation, links, history, redirects, and 404s stay candidate-local;
  missing targets never fall through to Live.
- Every request reauthorizes; responses are private/no-store/noindex, candidate
  IDs are not bearer authority, and expiry/revocation never redirects to Live.
- Giving, forms, subscriptions, notifications, analytics, tracking, prefetch,
  embeds, and consequential downloads are side-effect-dark. D1 may reuse proved
  artifacts but never promotes the candidate itself.

### US23-026 — Route purpose-bounded public forms (D26)

As ministry staff, I want a flexible form whose work goes to one clear owning
destination with optional notifications and acknowledgement.

Acceptance criteria:

- A small versioned Purpose Profile owns semantic fields, sensitivity, consent,
  retention, mappings, eligible outcomes, messages, and abuse bounds; tenants
  customize bounded labels/options/order/copy/questions, not protected meaning
  or executable routing.
- Every released Route Plan has exactly one Primary Outcome. Launch admits a
  certified Support Hub handoff or one governed Verified Email Destination;
  other owner adapters appear only after certification.
- One transaction records the immutable occurrence, exact Route Plan, Primary
  work, optional staff notifications, optional visitor acknowledgement, and
  dispatch intents before returning **Received**, or records none.
- Notification/acknowledgement failure never rolls back the Primary Outcome;
  recipient membership freezes per occurrence, destinations are same-Tenant,
  and each outcome remains independently observable and retry-safe.
- Notifications/acknowledgements select compatible **Live** Phase 17 Email
  Studio publications. D26 stores no Resend template authority; Resend is
  bounded per-recipient transport, and browser answers cannot choose recipient,
  sender, template, header, tracking, or redirect.
- Public forms are semantic, no-JS capable, server-authoritative, accessible,
  abuse-bounded, and upload/payment-free at launch. Inngest handles only
  committed identifier intents; TanStack Form may power the pinned staff
  builder adapter, not public truth.

### US23-027 — Use a Tenant-wide public still-image DAM (D27)

As ministry staff, I want to safely upload, qualify, find, reuse, and withdraw
public images with clear rights, accessibility, usage, and recovery state.

Acceptance criteria:

- One Tenant-wide `public-still-image` catalog accepts bounded JPEG/PNG/WebP/
  AVIF/qualified HEIC input through private hostile-file intake; active content,
  animation, documents, audio/video, fonts, and unknown types fail closed.
- Opaque logical identity and append-only revisions are separate from immutable
  originals/renditions. Every byte records digest, verified type/dimensions,
  provenance, processor/profile/output identity, storage copy, and readiness;
  raw provider URLs/metadata never serialize.
- Site use requires current **Allowed / Needs review / Blocked** qualification
  from rights, consent, safeguarding, Phase 10, audience, expiry, and exact
  revision evidence. Expiry/withdrawal suppresses origin adverse-first without
  silent substitution.
- Each placement pins revision/rendition and owns locale, slot, localized alt/
  caption/credit, accessibility treatment, crop/art direction, and equivalent
  content. D1 verifies all proof and qualified delivery bytes before release.
- **Used in** covers draft, candidate, scheduled, active, retained-delivery,
  reusable, Navigation, Phase 22, rich text, sharing, and package uses; stale
  evidence can never claim Unused or authorize disposal.
- Media Trash is non-cascading and Restore is private; retention is strictest-
  wins with holds and no launch auto-purge. Backup/restore and provider exit
  preserve digests and product identities. Qualification proves 25,000-item
  browse/search, 50-item intake, weak mobile, Tenant isolation, budgets, and
  accessible moderated nonprofit journeys.
- Optional Media folders are a separate private Tenant-wide Media-only tree,
  with Unfiled and at most five levels; they never control custody, Site use,
  permission, qualification, retention, release, or deletion.

### US23-028 — Generate exact search and sharing output (D28)

As an editor, I want strong generated defaults and only three useful overrides
so public metadata stays accurate without technical SEO work.

Acceptance criteria:

- One versioned Site profile is pinned per exact locale by D1 and generates
  title, description, qualified share image, canonical, alternates, crawler
  disposition, sitemap/`lastmod`, robots, safe structured data, and social
  output from verified released facts.
- A Page locale may override only semantic title portion, one shared short
  description, and one D27-qualified share-image placement; Reset removes the
  override and no fourth field or tenant template/JSON-LD/crawler DSL exists.
- The **Search engines & sharing** section separately shows Editing/Saving/
  Saved, Live/Not live, Ready/Needs attention, Generated/Customized n-of-3,
  planned versus current URL, and concrete preview examples.
- Exact locale and verified host are mandatory; no fallback, forwarded-host
  spoofing, cross-Site cache, draft/private metadata, or auth-dependent output
  is possible.
- Listed content is discoverable; Shared by link is public but no-index.
  Accessible Share uses Web Share/Copy link with confirmed success and manual
  recovery, no passive SDK.
- Release truth, public verification, sitemap/robots/cache work, and optional
  external-provider observation have separate truthful statuses and retries.

### US23-029 — Export and import governed content (D29)

As authorized staff, I want a coherent export and a staged import that creates
only private drafts so onboarding is understandable and reversible.

Acceptance criteria:

- **Review in a spreadsheet** emits formula-safe non-reimportable CSV;
  **Archive or move content** emits a versioned neutral Asym Content Package
  from one sealed scope/version/relationship snapshot.
- Private encrypted artifacts use opaque keys and bounded retention; every
  download reauthorizes actor and exact object scope, records a receipt, and
  fails after expiry or revocation.
- Certified adapters produce typed candidates; hostile archives, paths,
  formulas, remote fetches, scripts, widgets, users, provider internals, and
  unknown versions fail or are explicitly excluded.
- **Check the import** performs zero writes and seals one plan with **Must fix
  before creating drafts**, **Needs review before release**, **Will not be
  imported**, and **Information** totals.
- A separate fresh privileged commit re-proves scope/plan/target and creates
  idempotent private D12 revisions through owner commands only. Partial,
  interrupted, stale, resumed, reconciled, and reversal outcomes are truthful;
  no public, routing, form, message, schedule, or search effect occurs.

### US23-030 — Use one staff authority and governed diagnostics (D30)

As staff, I want one Supabase-backed Web Studio identity and clear scope, while
support diagnostics remain exceptional and read-only.

Acceptance criteria:

- Supabase Auth is sole human identity/session/MFA authority; Phase 12 is sole
  capability authority. Payload Principal Link is immutable attribution only,
  with no Payload account, role, login, or fallback.
- Every human command uses the actor-bound Web Studio Operations port with
  current request/user/access/lock/transaction context; every non-interactive
  command uses a separately registered narrower purpose/scope/idempotency port.
- Raw Payload Admin/auth/REST/GraphQL/Local API/hooks cannot become a product or
  rollback path. D1 drives release; `PublishedContentReader` alone observes the
  active immutable generation.
- Context switching is deliberate and non-defaulting. Session expiry preserves
  acknowledged work; revocation stops new privileged action and does not leak
  existence.
- Engine Diagnostics requires an active incident, fresh AAL2, exact least-
  disclosure scope, ledger-before-read, 15-minute default/60-minute maximum,
  immediate revocation, and zero mutation. Repairs are separately authorized
  typed commands.

### US23-031 — Resolve quiet, cause-owned Content Health issues (D31)

As staff, I want only actionable exceptions with plain-language ownership so I
can repair content without learning queues or operating a workflow system.

Acceptance criteria:

- A rebuildable private projection uses a small versioned issue-family registry
  and stable scoped identity; projection loss, acknowledgement, or edits never
  change source truth.
- Missing/stale/contradictory evidence is the coverage notice **Health check
  incomplete**, never healthy. Link-native views are **Needs your action**,
  **Being handled automatically**, **Needs platform attention**, and
  **Recently resolved**, with a code-owned 30-day presentation window—not a
  data-retention promise.
- Central and contextual views resolve the same issue and explain what happened,
  scope, visitor impact, owner, progress, time, and one best action.
- Resolution requires fresh source-owned proof. Attempt, reminder, queue
  acceptance, or notification never equals fixed.
- Direct recovery is exceptional, registered, separately authorized,
  exact-targeted, expected-state fenced, idempotent, bounded, read-back, and
  receipt-backed; no generic Retry/Replay/Force or provider console ships.

### US23-032 — Offer non-policing Accessibility Assistance (D32)

As an author, I want quiet visitor-centered help that preserves tenant creative
judgment and never invents a compliance ceremony.

Acceptance criteria:

- Exactly **Details to finish**, **Suggestion**, and **Technical issue** exist;
  healthy checks stay quiet and unavailable checks are never shown as passed.
- Suggestions are contextual and nonblocking. **Keep as written** is bounded to
  unchanged locale, semantic input, and rule version; no score, grade, badge,
  shame, certification, waiver, broad suppression, or approval workflow ships.
- Context-preserving **Accessibility help**, **Go to field**, and **View in
  preview** actions place the user at the exact evidence and restore focus.
- D32 cannot create a release blocker. Only an already-ratified source invariant
  or unproved platform/package contract may block the exact successor; save,
  undo, recovery, compare, and Preview remain available.
- D1 runs the same candidate checks for UI, API, import, schedule, reuse,
  dynamic, locale, package, and migration paths; client scanners cannot attest
  success.
- Disabled and occasional ministry staff complete authoring/repair/release
  journeys accessibly without blocker-versus-suggestion confusion.

### US23-033 — Qualify provider-neutral production capacity (D33)

As a release owner, I want numeric product capacity evidence and an exact Vercel
attachment so performance, safety, cost, and fairness are proven rather than
assumed.

Acceptance criteria:

- One versioned provider-neutral Production Capacity Profile defines exact
  Minimum, Typical, and Measured maximum workloads, UX/correctness/freshness,
  recovery, fairness, headroom, and unit-cost outcomes; no empty required cell
  can be claimed supported.
- One version-pinned Vercel Qualification Attachment proves the implementation
  without making Vercel settings product authority.
- Field evidence meets 75th-percentile LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 across
  representative routes/devices/networks/locales/packages/cache/adverse states.
- Functions, Postgres connections, queries, caches, transforms, builds,
  previews, queues, retries, and Tenant concurrency are bounded and measured;
  optional work sheds before safety, current public truth, accepted work, form
  durability, or donor access.
- Staff/public overload states are provider-free and truthful; D1 release is
  independent of application deployment and no unsafe stale result is served.

### US23-034 — Admit one exact Payload v4 cohort (D34)

As an implementation agent, I want current official Payload v4 evidence to
select one coherent engine cohort instead of freezing today's prerelease facts.

Acceptance criteria:

- At implementation start and release freeze, inspect current official npm,
  GitHub releases/tags/source/security/issues, and v4 migration documentation.
- Prefer supported stable v4; if none exists, only one exact coherent public
  prerelease may qualify with residual-risk owner, expiry, upgrade, and
  retirement evidence.
- One immutable qualification record binds lockstep packages/plugins, lockfile,
  generated artifacts, runtime/toolchain, migrations, Tenant/privacy/access/
  editor/public/a11y/capacity/backup/recovery proof, and requalification triggers.
- Floating versions, mixed channels, forced peers, v3 or stock-Admin fallback,
  mutable public reads, dual authority, and permanent multiversion abstraction
  fail admission; failure preserves acknowledged work and last safe public.

### US23-035 — Replace the prototype through one clean-target cutover (D35)

As a release owner, I want a census-gated nonproduction replacement so the
final system contains no legacy or temporary authority path.

Acceptance criteria:

- Re-prove exact environment and nonproduction status, then census repository
  artifacts plus hosted rows/objects read-only and classify each as discard
  fixture/demo, transform retained, regenerate derived, or unresolved/block.
- Build D1–D34 cleanly from an empty database against D34's cohort. Reset only a
  fully disposable environment; otherwise confine change to the CMS namespace.
- Any one-time transform uses neutral semantic DTOs through supported APIs, is
  deterministic/idempotent/encrypted/short-lived, and cannot gain runtime
  authority.
- One bounded switch moves every writer, reader, Preview, compiler, script, and
  test, then removes every legacy collection/schema/route/flag/fallback/fixture/
  adapter/transform and proves fresh-clone/empty-database reproducibility.
- If a target is production or customer-relied-upon, destructive work stops for
  a new decision.

### US23-036 — Preserve frozen authority through evidence-gated handoff (D36)

As an implementation or ticket agent, I want D1–D35 and owner boundaries frozen
so delivery cannot silently redesign the product or overstate completion.

Acceptance criteria:

- D1–D35 control wherever the original prompt or current prototype conflicts;
  only a later explicit numbered founder amendment may change them.
- Downstream capabilities use only their smallest certified owner contract;
  absent/unauthorized capability is existence-safe, and certified-but-unready
  work appears only with an owner-native action.
- Every mutation preserves exact owner/scope, current capability reproof,
  expected revision or sealed input, idempotency, partial-failure posture,
  receipt, recovery, and adverse-first public safety.
- D33 qualification, D34 cohort admission, D35 census/cutover, and the complete
  closure checklist are mandatory gates.
- **Built**, **Live**, and **Confirmed** remain separate evidence states; specs,
  schema, fixtures, Preview, provider features, or passing unit tests cannot be
  mislabeled as live product.

## Implementation Decisions

The acceptance criteria above are normative behavior. The exact ratified
clauses in the [Phase 23 decision log](./phase-23-web-studio-cms-decision-log.md)
and ADR-0145 through ADR-0180 are normative architecture and may not be reduced
to provider defaults. This table is the implementation index, not a replacement
for those authorities.

| Decision | Non-negotiable implementation boundary                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| D1       | Stable Page identity; separate exact revisions; deterministic closure compiler; immutable generation; one CAS head. |
| D2       | Placement owns locale parent/segment/order; paths and descendant effects derive and activate atomically.            |
| D3       | Page-identity predecessors plus one exact internal repair; no general redirect engine or chains.                    |
| D4       | Versioned semantic Navigation remains separate from hierarchy and is selected only by D1.                           |
| D5       | Code-owned Primary/Footer purposes; terminal Links or one-level non-linking Groups only.                            |
| D6       | Immutable Page/Article family; inert versioned starter provenance; Phase 22 families stay source-owned.             |
| D7       | Closed typed flat semantic catalog; no generic builder; additive versioned evolution only.                          |
| D8       | Explicit shallow Site/locale reuse; generation manifests, not reverse indexes, own release impact.                  |
| D9       | First-party certified Site package; serialized public view model and narrow capability islands only.                |
| D10      | Exact complete-locale-cohort design activation; all heads advance or none; design authority only.                   |
| D11      | One versioned prose grammar and qualified Lexical adapter; provider-neutral compiled projection.                    |
| D12      | One acknowledged Working Revision and fenced Active Editor Lease per exact resource scope.                          |
| D13      | Exact one-time appointment; Core owns long horizon, Inngest the bounded execution horizon, D1 the effect.           |
| D14      | Versioned code catalog and source-discriminated semantic intent; certified owner projections only.                  |
| D15      | Exactly automatic, featured-first, or fully chosen curation; stable identities and adverse suppression.             |
| D16      | One link-native window protocol and independent URL channel per list; progressive enhancement only.                 |
| D17      | Disposable exact-public search projection with synchronous adverse filter and durable convergence.                  |
| D18      | Five-level authority-free organization plus Unfiled; folders never drive scope, lifecycle, or public output.        |
| D19      | Small release-bound Topic profile with stable IDs and hard catalog/assignment bounds.                               |
| D20      | Bounded semantic personal/shared views; application never widens current record access.                             |
| D21      | Whole-identity, reference-aware, non-cascading Trash; private restore; tightly proved purge.                        |
| D22      | Sparse exact-locale lineages, explicit starts, Payload fallback disabled, independent locale release.               |
| D23      | Manifest-driven independent target draft; no sync, authority transfer, or public effect.                            |
| D24      | Exact code-owned `public`; auth-invariant output; private content stays in app-owned surfaces.                      |
| D25      | Immutable private candidate over pinned inputs; complete or unavailable; side-effect-dark and never authority.      |
| D26      | Versioned purpose profile; one Primary Outcome; durable occurrence before independent child delivery.               |
| D27      | Tenant-wide logical media identity; immutable custody; current Site qualification; usage-local presentation.        |
| D28      | Locale-exact generated metadata plus exactly three overrides; D1 owns all public head output.                       |
| D29      | Coherent private export; no-write sealed import plan; fresh privileged commit creates D12 drafts only.              |
| D30      | Supabase/Phase 12 authority; actor and registered service ports; read-only incident diagnostics.                    |
| D31      | Rebuildable exception projection; source proof owns resolution; recovery is typed, fenced, and rare.                |
| D32      | Three quiet assistance classes; no score/policing; only pre-existing source invariants can block release.           |
| D33      | Provider-neutral numeric profile with exact Vercel evidence, unit cost, fairness, and shedding order.               |
| D34      | Re-discover official Payload v4 state; admit one exact coherent qualified cohort, preferably stable.                |
| D35      | Read-only census, clean target, optional one-time semantic transform, one switch, complete retirement.              |
| D36      | Frozen decisions and owner seams; explicit amendments only; evidence-gated handoff and claims.                      |

### Shared engineering contract

- The **Web Studio Operations boundary** is a thin public application boundary,
  not a god service. Feature-owned modules implement typed commands/queries.
  Human commands receive a server-derived actor context; registered service
  commands receive narrower code-owned purpose. Neither accepts caller-chosen
  Tenant, role, override, or authority.
- Every mutation re-proves current capability and relationship closure, binds
  exact Tenant/environment/Site/locale/subject dimensions that its owner
  defines, carries expected revision or sealed input, is idempotent, uses short
  transactions, and writes a durable receipt/outbox fact with the state change.
- D1 compilation is pure and deterministic over exact manifests. Artifacts and
  serving heads are immutable/content-addressed or append-only. Public requests
  perform bounded reads of one active generation; they never compile, migrate,
  chase relationships, call providers, or interpret mutable “latest” rows.
- Use typed columns for security, lifecycle, hot filters, versions, ownership,
  and invariants. JSON is allowed only for bounded versioned semantic payloads
  or redacted provider diagnostics. Rebuildable projections—search, usage,
  counts, health—cannot authorize source mutation or claim favorable state when
  stale.
- Use same-scope composite relationships, deny-by-default RLS/grants where
  operational tables require them, bounded set-based reads, keyset/stable
  windows, purpose-shaped indexes, bounded concurrency/backpressure, and no
  remote work inside product transactions. This keeps the database a reliable
  authority, not a workflow engine or giant Site-document burden.
- Durable execution uses the repository's shared post-commit dispatch/claim/
  retry/dead-letter/reconciliation pattern. Inngest is an executor where a
  decision admits it, not schedule, content, receipt, authorization, or release
  truth. External/provider errors stay typed and never become empty success.
- Privacy-safe telemetry records opaque correlation, owner/family/version,
  timing, count, size, lag, cause, and outcome—not content, search text,
  addresses, routes, filenames, evidence, tokens, signed URLs, or secrets.
- D35 uses census → clean target/expand → deterministic transformation/backfill
  → totals/checksum/constraint verification → one-authority cutover → contract.
  Unknown records quarantine or block; no permanent compatibility layer ships.

## Testing Decisions

The approved public seam is the **Web Studio Operations boundary** driving D1's
compiler and atomic activation. The only public oracle is
`PublishedContentReader`. Tests assert behavior, authority, receipts, and
last-safe-public continuity—not Payload hooks, table layout, queue ordering, or
component internals.

1. **Contract tests:** Vitest covers typed actor/service commands, deterministic
   compiler manifests/digests, exact locale and route resolution, CAS,
   idempotency, stale/revoked/conflict/unknown outcomes, migrations, and pure
   projection adapters.
2. **Public-boundary proof:** extend the sole-entry static verifier and public
   serializer/reader tests so donor/public code can consume only active D1
   artifacts and qualified media routes, never mutable Payload or private data.
3. **Strict real-stack tracer:** extend the existing non-skipping Supabase Auth
   - Payload + Postgres + Playwright harness to prove staff edit → acknowledged
     save → candidate → Preview → activation → donor exact artifact. A forced
     compile/activation failure must keep the previous generation byte-stable.
4. **Feature tracers:** prove schedules, route moves, Navigation, search adverse
   deletion/rebuild, exact locale start/release, Trash/restore, Copy to Site,
   forms and independent delivery recovery, DAM intake/qualification/withdrawal,
   metadata/share, portability, diagnostics, health recovery, and accessibility
   assistance through the same ports.
5. **Structural/security proof:** real Postgres exercises RLS/grants, composite
   scope, transactions, constraints, CAS, leases, claims, outbox, and isolation.
   Negative matrices cover IDOR, direct provider/API bypass, draft/Preview/
   Trash/restricted leaks, host/cache poisoning, revoked downloads, hostile
   files/packages, diagnostics disclosure, and telemetry redaction.
6. **Experience/evidence gates:** Axe plus manual keyboard, screen-reader,
   focus/error, touch, 320px reflow, 400% zoom, forced colors, reduced motion,
   RTL/CJK, weak-network, and moderated nonprofit-staff journeys; D33
   production-shaped load/fault/cost evidence; D34 exact-cohort qualification;
   and D35 census, fresh-clone/empty-database, cutover, and retirement proof.

The complete mandatory matrix and evidence inventory in
[`phase-23-closure-testing-evidence-and-issue-readiness-checklist.md`](./research/phase-23-closure-testing-evidence-and-issue-readiness-checklist.md)
is normative. Ticket slicing may assign items but cannot omit them. No relevant
claim becomes **Live** or **Confirmed** until its applicable evidence exists.

## Out of Scope

- Reopening D1–D35 without an explicit numbered founder amendment, or letting a
  provider feature, current prototype, ticket, or implementation convenience
  silently redesign authority.
- Runtime tenant-authored schemas, queries, scripts, plugins, arbitrary
  authoring layout/style or rich-text grammars, workflow/approval DSLs,
  audience/personalization builders, arbitrary SEO/head/JSON-LD/crawler
  controls, or a general redirect engine. D9 certified source-controlled bespoke
  presentation remains in scope.
- Raw Payload Admin/accounts/roles, public REST/GraphQL/Local API, v3 fallback,
  dual engine authority, mutable public reads, or permanent multiversion/
  compatibility abstractions.
- Future-owner product truth: authenticated CMS variants, generalized files,
  Support/Mobilize/communications/workflow/BI/API products, payment/upload form
  outcomes, AI writing/tagging/approval, face recognition, stock portals,
  offline publication, or destructive autonomy.
- Accessibility scores, legal certification, tenant policing, general incident/
  task management, provider consoles, generic Retry/Force/Replay, or claims that
  external crawlers/social networks refreshed or rankings improved.
- Production customer cutover, live dual writes/CDC/shadow traffic, active-
  active multicloud, per-Tenant Vercel projects, speculative sharding, custom
  CDN, or a quota/billing product.

## Further Notes

- Canonical authority: this PRD; `phase-23-web-studio-cms-decision-log.md`;
  ADR-0145–0180; the closure checklist; and OpenSpec change
  `add-web-studio-cms` with capability `web-studio-cms`.
- Preserve compatible existing seams: the Web Studio/Supabase bridge, sole
  public reader/serializer/static verifier, and strict local CMS harness.
  Prototype collections, mutable reads, flags, and tests remain D35 evidence,
  not D1–D36 implementation.
- **FORWARD** agents re-check official Payload v4 sources at implementation
  start and release freeze; this specification pins no future version facts.
- Root `CONTEXT.md` synchronization remains held until the Phase 22 documentation
  stack is accepted or Phase 23 becomes the explicitly reviewed stack; current
  glossary terms remain useful and cannot weaken founder-ratified authority.
