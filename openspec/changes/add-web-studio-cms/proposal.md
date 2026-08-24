# Add Web Studio CMS

## Why

Nonprofit missions organizations need to build distinctive multilingual public
Sites without learning a CMS provider's data model. Occasional staff must be
able to tell where a Page lives, whether work is saved, what a change affects,
and exactly what will become public. Designers need bespoke presentation
freedom without creating per-Tenant forks, tenant-uploaded executable plugins,
or a second permission, data, routing, or publication authority.

The current repository proves a Payload-backed admin application, Supabase
staff identity, a Web Studio shell, one published-content reader, and a strict
local CMS harness. It does not implement Phase 23's coherent Page, locale,
generation, Preview, discovery, form, media, health, portability, or cutover
contracts. Current CMS records and mutable published reads collapse authorities
that Phase 23 deliberately separates. Treating Payload drafts, versions,
folders, Trash, jobs, APIs, search, or plugins as product authority would risk
mixed public output, draft leakage, scope confusion, hidden provider coupling,
and irreversible technical debt.

Phase 23 therefore needs one provider-neutral Web Studio capability. Private
editing must remain recoverable and simple, while public serving must consume
only one complete immutable generation. Every failure must preserve the last
safe public result and identify one owner and next action. Healthy operation
must remain quiet.

## What Changes

- Add one `web-studio-cms` capability behind the actor-bound and registered
  service-command **Web Studio Operations boundary**. Human and non-interactive
  operations use distinct trusted contexts and feature-owned typed commands.
- Add stable Site-owned ordinary `Page` identity with immutable **Page** or
  **Article** family, exact-locale `Editorial Revision` and Page Placement
  Revision lineages, staged hierarchy and paths, exact-path continuity, and
  independently curated `Navigation Revision` state.
- Add D1's deterministic Site Plan compiler, immutable content-addressed
  `Public Site Generation`, expected-head compare-and-swap activation, and the
  sole public `PublishedContentReader` boundary.
- Add a small family-qualified semantic section catalog, explicit shallow
  `Reusable Section` reuse, bounded Rich Text and typed video, versioned Page
  Starters, and one server-authoritative `Working Revision` with a fenced
  recoverable `Active Editor Lease`.
- Add source-controlled certified `Presentation Package` support and complete-
  locale-cohort design activation without granting presentation code data,
  auth, route, money, safety, or publication authority.
- Add exact-revision scheduled publication, one versioned Dynamic Source
  Catalog, three bounded curation strategies, one link-native Public Page
  Window protocol, and one derived public Site search projection.
- Add a calm Content Library with authority-free folders, a bounded Site Topic
  Profile, personal and Site-shared Saved Library Views, reference-aware Trash,
  and an exception-first Content Health Workspace.
- Add explicit exact-locale editorial starts and releases, independent Copy to
  another Site, one exact `public` audience, and complete private Whole-Site
  Preview Candidates.
- Add purpose-bounded public forms whose durable Form Submission Occurrence
  routes to exactly one domain-owned Primary Outcome, with independently
  recoverable notifications and acknowledgement.
- Add one Tenant-wide public-still-image DAM with opaque logical identity,
  immutable byte and rendition custody, rights/safeguarding qualification,
  placement-local accessibility, neutral metadata and bounded tags, non-
  authoritative duplicate suggestions, complete use evidence, protected
  visibility, bounded delivery retention, and adverse-first withdrawal.
- Add one versioned Site Search & Sharing Profile with generated locale-exact
  defaults and exactly three Page-locale overrides.
- Add governed staff exports and staged privileged imports that create only
  private D12 revisions, never direct public or operational effects.
- Preserve Supabase Auth as the sole human identity/session/MFA authority and
  Phase 12 as the sole permission brain. Add narrowly scoped, read-only,
  incident-bound Engine Diagnostics and typed owner recovery commands.
- Add quiet, cause-owned Content Health and non-policing Accessibility
  Assistance without scores, certification, broad suppression, or a second
  release-blocking policy.
- Add provider-neutral Production Capacity qualification with an exact Vercel
  attachment, implementation-time admission of one coherent Payload v4 cohort,
  and a census-gated clean-target one-authority cutover.
- Freeze D1-D35 behind formal D36 evidence-gated handoff. Built, Live, and
  Confirmed remain separate claims, and owner-bounded downstream seams cannot
  be widened by implementation convenience.

## Capability Deltas

### New capability: `web-studio-cms`

The capability owns the complete Phase 23 D1-D36 contract: ordinary Page and
Article identity; exact-locale editorial and placement revisions; bounded
composition and reuse; hierarchy, routes, Navigation, Preview, release and
serving generations; presentation packages; scheduling; dynamic lists; public
search; Content Library organization; Topics, views and Trash; localization;
copying; public forms; public-still-image media; search/share presentation;
portability; staff authority and diagnostics; Content Health; Accessibility
Assistance; capacity and provider qualification; clean cutover; and evidence-
gated closure.

### Modified capability: `platform-boundaries`

The platform boundary contract gains one explicit split among editable CMS
source, owner-domain truth, deterministic public generation, and derived
operations. Payload remains qualified private machinery. D1 is the sole
favorable public Site Plan activation authority, and public code reads only
through `PublishedContentReader`. Search, delivery, providers, and downstream
owners cannot widen authority or substitute mutable state.

### Modified capability: `platform-surfaces`

The surface contract gains one Page-first Web Studio; one exact public Site
runtime for ordinary Pages, Articles, Navigation, lists, search, metadata,
forms, and qualified media; one calm Content Library and Content Health
experience; one private whole-Site Preview journey; and truthful, accessible,
provider-free status and recovery across staff and visitor surfaces.

### Modified capability: `identity-and-access`

The access contract gains exact Web Studio actor and registered service-command
ports, capability-separated authoring/release/library/media/form/diagnostic/
recovery actions, deliberate Site and locale context switching, current
reauthorization for every mutation and private read, one auth-invariant public
audience, and incident-bound read-only Engine Diagnostics.

## Dependencies

### Required platform contracts

- Phase 1 source-of-truth ownership and complete Tenant scope.
- Phase 2 Tenant and verified-domain/host configuration.
- Phase 3 Site identity and field-classification/privacy rules.
- Phase 5 public runtime, request resolution, HTTP, cache, and rendering
  transport.
- Phase 6/17 governed outbound communication and delivery evidence for admitted
  form notifications and acknowledgements.
- Phase 9 CRM source subjects and relationship truth where a certified dynamic
  source or form outcome consumes them.
- Phase 10 current public eligibility, restriction, safeguarding, and adverse
  containment.
- Phase 12's sole policy decision point, capabilities, governance epochs,
  purpose, assurance, and public projection context.
- Phase 13 giving and Designation authority. Web Studio may render qualified
  handoffs but never owns money, checkout, or payment truth.
- Phase 22's founder-ratified Public Ministry Page, Project/Campaign Page,
  Ministry Update, contributor, safety, media, presentation, and public-runtime
  boundaries.
- Phase 24 locale lifecycle, standards catalog, translation status, canonical
  and alternate-locale relationships where explicitly consumed.
- Phase 29 generalized private-byte custody and physical disposition through
  D27's immutable custody port.
- Phase 30 inbound staging and import-session transport where a certified D29
  adapter consumes it.
- Phase 31 and later owner contracts only after their smallest public or command
  seam is certified; absence remains unavailable rather than synthesized.

### Provider and runtime qualification

- One exact implementation-time Payload v4 cohort, preferably supported stable,
  must pass D34 qualification before production admission.
- Vercel is the initial deployment provider, but product capacity, overload,
  fairness, safety, and recovery semantics remain provider-neutral under D33.
- Inngest may execute only identifier-based committed work explicitly admitted
  by D13, D26, D27, or the shared dispatch contract. It owns no schedule,
  authorization, receipt, content, or release truth.
- Postgres full-text search is the D17 launch engine behind a replaceable
  provider-neutral projection contract.
- Resend remains transport under the owning communication contracts, never the
  form outcome or notification authority.

## Impact

- **Staff:** one coherent Web Studio journey, deliberate context, quiet truthful
  status, bounded choices, explicit consequences, and typed recovery.
- **Visitors:** exact public content, accessible navigation and list discovery,
  auth-invariant presentation, public-safe search, resilient forms, and
  qualified media from one active generation.
- **Data:** new immutable revisions, manifests, generations, receipts, and
  rebuildable projections with structural Tenant/environment/Site/locale scope.
- **Runtime:** public requests become bounded generation reads; compile,
  migration, provider, remote, and relationship work moves off the request path.
- **Operations:** production admission requires D33 capacity, D34 cohort, D35
  census/cutover, and the complete Phase 23 closure evidence inventory.

## Non-Goals

- A generic website-builder schema, arbitrary layout/style system, rich-text or
  query DSL, redirect engine, workflow builder, audience/personalization engine,
  SEO/head/JSON-LD editor, or tenant plugin marketplace.
- Raw Payload accounts, roles, Admin, REST, GraphQL, Local API, jobs, hooks,
  drafts, versions, search, folders, or Trash as product authority.
- Authenticated CMS variants, generalized file storage, payment or upload form
  outcomes, communications/workflow/BI products, AI writing or tagging,
  accessibility scoring/certification, or provider consoles.
- Live customer cutover, permanent compatibility layers, dual writes, CDC,
  active-active multicloud, per-Tenant Vercel projects, speculative sharding,
  custom CDN, or a quota/billing product.
