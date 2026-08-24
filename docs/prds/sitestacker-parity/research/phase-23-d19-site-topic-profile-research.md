# Phase 23 D19 — Site Topic Profile research, UX, and adversarial review

- **Status:** Founder-ratified and adversarially hardened; documentation
  authority is the Phase 23 decision log.
- **Date:** 2026-08-23
- **Founder decision:** Ratified C-prime-R — one versioned, D1-release-bound
  Site Topic Profile with a small catalog of tenant-named Topic Sets.
- **Scope:** Public-discovery classification for the two D6 ordinary content
  families, Page and Article.
- **Explicitly separate later decisions:** Public topic landing pages, private
  staff tags, operational CRM segmentation, forms, permissions, generalized
  media taxonomy, AI classification, and implementation ticket slicing.
- **Mutation authorization:** None. Ratification authorizes documentation only.

## Executive verdict

Option C-prime is the right product shape, but the original one-line option is
not sufficiently precise to ship.

The permanent answer is one exact Tenant × environment × Site **Site Topic
Profile** whose immutable versions contain a deliberately small catalog of
tenant-named **Topic Sets** and stable **Topics**. Page and Article identities
may hold one nonlocalized, versioned **Topic Assignment Snapshot**. Each
locale-exact D1 Public Site Generation independently pins the exact profile
version, assignment snapshot, and localized public-safe labels it compiled.

Five amendments are mandatory:

1. **Topics are controlled public-discovery vocabulary, not generic tags.** A
   Topic classifies public meaning. D18 folders remain the private staff filing
   system; workflow state, ownership, permissions, donor segments, and internal
   notes remain source-owned elsewhere.
2. **Small is a product rule.** Launch supports a code-bounded maximum of eight
   active Topic Sets, 500 active Topics across the Site, three single-parent
   levels, and 20 direct assignments on one Page or Article. Starter content is
   much smaller. These are capacity ceilings, not goals or tenant-configurable
   matrices.
3. **Site-wide does not mean cross-locale atomic.** Assignment is nonlocalized
   and applies to all language lineages, but D1 still activates one exact locale
   generation at a time. The UI must report per-locale readiness and activation
   honestly; D10's presentation-only cohort exception does not extend to D19.
4. **Stable identity outranks labels and provider fields.** D14 filters, D17
   search projection, releases, migration, and audit evidence bind opaque Topic
   IDs plus exact profile versions, never a localized label, slug, Payload
   relationship field, or newest-row lookup.
5. **The complete content-and-topic projection must pass Phase 10.** A seemingly
   harmless Topic can make a Page unsafe in combination with copy, a generalized
   region, a ministry method, or a people group. No generic taxonomy engine may
   bypass that whole-projection proof.

This is simpler than either free-form tags or a universal ontology: one managed
profile, a few named sets, an approachable picker, stable identities, and one
existing D1 release path.

## Authority already settled by D1–D18

D19 composes with, and cannot reinterpret:

- **D1:** stable ordinary Page identity, locale Editorial Revision, Page
  Placement Revision, one immutable locale-exact Public Site Generation, and
  one CAS serving head;
- **D2:** Page hierarchy, canonical public paths, and ordinary breadcrumbs;
- **D4–D5:** independently authored Primary and Footer Navigation;
- **D6:** exactly two ordinary families, Page and Article;
- **D7–D9:** semantic blocks, bounded reuse, and qualified Site Presentation;
- **D10:** the sole narrow cross-locale activation exception, limited to one
  complete Site Presentation cohort;
- **D12:** recoverable Editorial Working Revisions and one active-editor lease;
- **D13:** exact-revision scheduled publication and execution-time reproof;
- **D14–D16:** source-qualified dynamic lists, Page-local curation, and
  link-native public windows;
- **D17:** a disposable derived Public Site Search Projection with adverse-first
  containment; and
- **D18:** private, authority-free Content Library folders.

Phase 10 still owns the current publication ceiling and restricted-ministry
safety. Phase 22 still owns Missionary Ministry Pages, Project/Campaign Pages,
Ministry Updates, their directory, contributors, reach, routes, lifecycle, and
release. Those specialized records are excluded from D19 even if their public
presentation resembles an Article or Page. A later source-owned Phase 22
classification contract may deliberately map into public discovery; D19 may not
infer or absorb it.

## How a missions ministry would actually use this

### Scenario 1 — A modest ministry launches without a taxonomy project

A ten-person ministry wants donors, churches, candidates, and prayer partners to
find relevant resources. During Site setup, staff choose **Start with examples**
and receive three editable Topic Sets:

| Topic Set      | Example Topics                                                                                         | What staff mean                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Ministry focus | Church planting, Bible translation, Medical and health, Education, Relief and development, Member care | The kind of ministry the content discusses                      |
| Audience       | Supporting churches, Donors and supporters, Mission candidates, Prayer partners, Volunteers            | Who may find the content useful; never who is allowed to see it |
| Resource theme | Prayer, Field stories, Training, News, Stewardship                                                     | The editorial lens or resource purpose                          |

The examples are copied into that Site's draft profile, not shared live
platform records. Staff can rename, remove, or replace them before the first
release. **Start empty** remains equally valid. Assignment is optional; an
organization can publish useful content before its taxonomy is mature.

### Scenario 2 — A larger mission needs real domain structure

Mission organizations often classify material along different axes. OMF's
[resource library](https://omf.org/ca/resources/all-resources/) separates
Country, Ministry, Content Type, and People Group. TEAM presents distinct
ministry lenses such as church planting, medical ministries, education, and
unreached people groups on its [public ministry site](https://www.team.org/).
Cru's first-party
[taxonomy guide](https://www.cru.org/content/dam/cru/gsw/How-To-Use-Crus-Taxonomy.pdf)
defines separate Topic, Location, Target Audience, Ministry Affiliation,
Experience, and Language families, counsels authors to skip irrelevant sets and
avoid over-tagging, and shows a useful three-level ministry hierarchy such as
Faith Topics → Spiritual Growth → Bible Study.

D19 therefore permits a tenant to name a small set **Ministry focus**,
**Audience**, **Resource theme**, or **Public region**, and to use up to three
single-parent levels. It does not hard-code a universal missions ontology.
Content type, language, author, publication state, private folder, and
operational geography are already authoritative facts and must not be copied
into Topics.

### Scenario 3 — Restricted ministry makes ordinary taxonomy dangerous

A restricted worker's Page may safely say “Central Asia.” A Topic such as a
narrow people group, combined with “underground church” and a specific ministry
method, may reveal more than any field reveals alone. TEAM has described work
across many closed-access areas and the importance of cybersecurity in its
[mission security guidance](https://www.team.org/article/a-call-to-prayer-for-the-global-church-and-the-future-of-missions/).
OCHA's current
[data-responsibility guidance](https://centre.humdata.org/data-responsibility/)
likewise treats disclosure risk as capable of harming communities, including
through combined data.

D19 therefore provides no starter People Group or exact Geography set. If a
tenant deliberately creates one, the manager says plainly that Topic labels may
become public and should use Phase-10-approved generalized terms. The complete
compiled Page-or-Article projection, including directly assigned Topic labels
and only the ancestry semantics an owning consumer explicitly requests, must
pass current Phase 10 proof before each favorable release.
The Topic catalog itself is not automatically publicly enumerable.

### Scenario 4 — One classification applies across translations

An English, French, and Thai version of one Article describes the same ministry
focus. Staff select **Church planting** once. They do not repeat that selection
three times or reconcile divergent locale copies.

The assignment is one nonlocalized Topic Assignment Snapshot on the stable
Article identity. Each English, French, and Thai Public Site Generation
independently pins that exact snapshot and one exact Site Topic Profile Version,
then compiles the available public-safe label for its own locale. If Thai has no
label and no explicit default-label acknowledgement, the ordinary Article may
still publish while omitting that Topic from Thai public presentation and D17.
The system says **Topic omitted in Thai — add a label**. Only an exact D14 or
D17 consumer whose own versioned contract explicitly requires that label blocks
its affected candidate and preserves the prior generation. The system must not
claim an all-locale transaction, silently fall back, or roll back already valid
locale heads.

## Current repository evidence

### Web Studio ownership and Core visual language

The current repository already establishes the correct product boundary:

- Web Studio is a Mission Control-native experience around Payload rather than
  a stock Payload Admin surface;
- StudioLayout, StudioTopBar, and StudioNavRail own the shell and navigation;
- NativeCollectionListView composes PageShell, FilterBar, Payload query/list
  primitives, Core empty states, and stored preferences;
- NativeCollectionEditView preserves Payload's document form while Core owns
  action framing, preview, status, and inspector context; and
- shared controls come from the Base UI-backed Maia + Zinc system in @asym/ui.

Relevant sources:

- apps/admin/src/cms-ui/web-studio/README.md
- apps/admin/src/cms-ui/web-studio/shell/studio-layout.tsx
- apps/admin/src/cms-ui/web-studio/shell/studio-top-bar.tsx
- apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail.tsx
- apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionListView.tsx
- apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx
- docs/guides/architecture/web-studio-living-spec.md
- docs/guides/development/site-studio-payload.md

The existing shared list and document workspaces are useful seams, not a
finished taxonomy manager. D19 needs a purpose-built manager and picker while
preserving the same typography, spacing, focus treatment, Sheet/Dialog
patterns, quiet-status language, and narrow-layout behavior. It must not fork a
second component system or expose generic relationship fields.

### Existing tenant and public boundaries

Current Payload tenant resolution and enforcement live in:

- apps/admin/src/cms/access/tenant-context.ts
- apps/admin/src/cms/access/tenant-access.ts
- apps/admin/src/cms/hooks/tenant.ts
- apps/admin/src/cms/hooks/audit.ts

Payload uses a privileged direct PostgreSQL connection to the private cms
schema. Supabase RLS must not be claimed as the protection for these provider
operations. Tenant ID and public tenant UUID are distinct identifiers and must
not be interchanged. D19 requires trusted server resolution of Tenant,
environment, and Site plus structural same-scope constraints.

The current public boundary already avoids importing Payload into runtime DTOs:

- apps/admin/src/cms/public/published-content-reader.ts
- packages/api/src/cms/public/README.md

D19 must extend that compiled, allowlisted boundary. A public renderer or search
request must never recursively populate the current Payload topic hierarchy or
resolve mutable newest records.

### Current content model is not D19

apps/admin/src/cms/collections/pages.ts currently has Payload drafts, versions,
autosave, and tenant relationship fields. It does not implement D19's exact
Site Topic Profile, Topic Set identities, localized label contract,
nonlocalized assignment snapshots, D1 pinning, Phase 10 whole-projection proof,
or lifecycle commands. Current generic fields or provider capabilities are not
evidence that D19 exists.

The generated migration
apps/admin/src/migrations/20260515_173042_init_payload_cms.ts also permits a
nullable Page tenant relation with on-delete set-null behavior even though the
current collection config marks the relation required. There are no final
environment/Site constraints or Topic indexes. That config/migration drift is
direct evidence that D19 needs one reviewed additive migration plus database-
invariant tests; schema-push inference is not an activation plan.

## Exact Payload 4 evidence and implications

Core pins the Payload family to **4.0.0-internal.1f9ae9a** in package.json,
apps/admin/package.json, and bun.lock. That build corresponds to upstream commit
**1f9ae9ab37bd7a69894762c833fad3e65124c314**. The repository's
vendor/payload-upstream snapshot is historical v3.77 evidence, not this
runtime.

Payload's [v4 announcement](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more)
describes hierarchies as a developing core primitive for folders, tags, and
taxonomies. The exact pinned source is more specific:

- [createTagField.ts](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/createTagField.ts)
  produces an indexed relationship field, defaulting to has-many and a
  hierarchy-aware field provider;
- [presets.ts](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/presets.ts)
  allows many tag relationships but not many folder relationships;
- [hierarchy types](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/types.ts)
  expose self-referential hierarchy configuration, a tree limit, parent fields,
  and virtual title/slug paths; and
- [collection configuration types](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/config/types.ts)
  keep folders, tags, and generic hierarchy modes distinct and expose compound
  indexes separately.

That provider primitive is directionally useful but does not define D19's
product semantics. It does not supply Site Topic Profile versions, Topic Sets,
localized preferred labels, editor-search aliases, exact D1 pins, Phase 10
proof, nonlocalized assignment snapshots, replacement/retirement semantics, or
authority-negative guarantees.

D18's folder relationship and D19's topic relationship may share Payload's
general hierarchy machinery only behind separate product adapters and distinct
field/hierarchy identities. Exact-pin qualification must prove that both can
coexist on Page and Article schemas without field-name, hook, version,
localization, access, or migration collisions. Payload's mutually exclusive
hierarchy presets must not be stacked onto one hierarchy collection as though
folders and Topics were the same semantic tree.

Payload's [Relationship field documentation](https://payloadcms.com/docs/fields/relationship)
supports has-many relationships, filterOptions, row limits, and indexes. It is
not authorization or a release contract. Payload's
[Local API access documentation](https://payloadcms.com/docs/local-api/access-control)
states that Local API calls bypass access by default unless the caller passes a
user and sets overrideAccess false. Its
[Local API overview](https://payloadcms.com/docs/local-api/overview) also
documents lock-bypass behavior. Every staff-origin Topic command must pass the
authenticated request and user, set overrideAccess false and overrideLock
false, and await all nested writes.

Payload's [migration documentation](https://payloadcms.com/docs/database/migrations)
requires related operations to share the same request/transaction context.
Provider hooks, saves, and versions must never be mistaken for D1 activation or
for one committed product command.

Direct inspection of the installed exact build closes three additional gaps:

- hierarchy collection deletion recursively deletes descendants, and its
  related-collection after-delete hook clears the complete matching hierarchy
  field rather than removing only one member; raw Topic deletion could therefore
  erase both Topic descendants and unrelated assignments;
- hierarchy path computation intentionally performs privileged reads and may
  degrade an inaccessible or missing parent to a root path, so provider virtual
  slug/title paths cannot be tenant, safety, ancestry, or public truth; and
- stock hierarchy selection permits document creation from the drawer and does
  not carry D19's 20-assignment product maximum, making it the wrong author
  surface for a controlled vocabulary.

Exact evidence is in the installed package at
packages/payload/dist/hierarchy/hooks/collectionBeforeDelete.js,
collectionAfterDelete.js, utils/computePaths.js, and the corresponding
@payloadcms/ui hierarchy Field and Drawer modules. Qualification must pin these
behaviors in conformance tests. Ordinary users receive no raw delete or inline
create path; D19 uses replace/retire and the Core picker instead.

## Comparable CMS, taxonomy, and accessibility evidence

Modern CMS practice favors a controlled taxonomy over unbounded tags when the
terms drive discovery:

- [Contentful Taxonomy](https://www.contentful.com/help/taxonomy/) groups
  controlled terms into concept schemes and explicitly recommends taxonomy,
  rather than generic tags, for organization and search.
- Contentful's
  [taxonomy manager](https://www.contentful.com/help/taxonomy/taxonomy-manager/)
  provides preferred labels, notes, schemes, hierarchy, and connection impact
  before destructive changes.
- Its
  [taxonomy assignment](https://www.contentful.com/help/taxonomy/application-of-taxonomy/assignment-of-taxonomy/)
  uses search and hierarchy rather than requiring authors to remember codes.
- [Drupal Taxonomy](https://www.drupal.org/docs/user_guide/en/structure-taxonomy.html)
  distinguishes curated fixed vocabularies from free tagging that creates terms
  inline. D19 deliberately chooses the curated lane.
- The W3C [SKOS reference](https://www.w3.org/TR/skos-reference/) provides the
  durable conceptual precedent: stable concepts, preferred and alternate
  labels, broader relationships, and concept schemes are distinct things.

The launch UI must implement established accessibility behavior rather than a
custom token picker:

- [WAI-ARIA Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) for a
  searchable topic picker;
- [WAI-ARIA Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) for
  the management hierarchy, with focus and selection kept distinct;
- WCAG 2.2 [Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
  [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
  and [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html);
  and
- WCAG's [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html),
  which requires a non-drag path for any optional drag interaction.

These sources support a search-first grouped picker, a bounded management tree,
plain-language scope notes, visible impact, and non-destructive lifecycle. They
do not justify copying Contentful's enterprise limits or building an ontology
workbench.

## Hardened domain contract

### Exact scope and eligibility

There is at most one stable Site Topic Profile identity for one exact Tenant ×
environment × Site. It has immutable versions and one private working successor
at a time. Profile identity and scope never derive from a hostname, slug,
browser parameter, Payload collection name, or current user preference.

One staff-visible profile does not mean one mutable live row. The stable profile
identity has immutable structure revisions for Sets, Topic identities,
parentage, applicability, lifecycle, and order, plus subordinate exact-BCP-47
label revisions. The UI presents them as one coherent Topics workspace. Each
D1 locale generation pins one exact compatible structure revision, exact locale
label revisions, and exact Topic Assignment Revisions. A **Topic Assignment
Snapshot** in this note means one such immutable nonlocalized Assignment
Revision, never a copy of mutable labels.

D19 classification applies only to stable D6 ordinary Page and Article
identities. It excludes:

- Phase 22 Missionary Ministry Pages, Project/Campaign Pages, Ministry Updates,
  directories, and their specialized projections;
- Reusable Sections and local blocks as independently classifiable records;
- Primary/Footer Navigation, routes, redirects, and Site Plan nodes;
- Content Library folders, media, templates/starters, forms, users, and roles;
- designations, donors, commitments, campaigns, parties, people groups, places,
  and other operational records; and
- drafts or provider documents that do not resolve to one eligible stable
  product identity.

### A deliberately small catalog

Launch limits are code-owned and qualification-tested:

- at most **8 active Topic Sets** in one profile;
- at most **500 active Topics** across one profile;
- at most **3 Topic levels**, including the root Topic;
- exactly one optional same-set parent per Topic; and
- at most **20 direct Topic assignments** on one Page or Article.

The setup starter contains only three sets and roughly 15–20 terms. Limits are
not tenant settings, plan entitlements, performance promises, or invitations to
fill every slot. A future increase is an additive profile-contract version only
after measured nonprofit usage, accessibility, query plans, release fan-out,
and exact Payload qualification prove it safe.

There is no tenant-authored schema, arbitrary set type, custom operator,
polyhierarchy, graph, unlimited nesting, private/public flag per term, workflow
matrix, or per-topic permission.

### Topic Set identity

Each Topic Set has:

- one stable opaque never-reused ID;
- one immutable exact Tenant × environment × Site scope;
- one localized preferred display label and short plain-language purpose;
- one code-bounded applicability value: Page, Article, or both;
- one deterministic display position; and
- active or retired lifecycle state.

Flat sets simply have no parented Topics. Hierarchical sets use the same
single-parent contract; there is no separate flat-versus-tree mode to drift.
Changing applicability can invalidate assignments and therefore requires impact
proof and a successor profile. A Topic never moves across Topic Sets. Staff
create a replacement in the destination set instead.

### Topic identity and labels

Each Topic has:

- one stable opaque never-reused ID;
- one immutable Topic Set and exact Site scope;
- one optional same-set parent;
- one localized preferred plain-text label;
- optional bounded localized alternate labels used only for staff picker
  search at launch;
- one short localized scope note for ambiguous terms;
- one deterministic sibling position; and
- active, retired, or replaced lifecycle state.

IDs, not labels, bind assignments, filters, release pins, audit, and migration.
Labels are normalized with Unicode NFKC, whitespace trim/collapse, and Unicode-
aware case folding for collision detection; punctuation and meaningful
diacritics are preserved. Preferred and alternate normalized label tokens stay
unique within exact Site × Topic Set × locale across active, retired, and
replaced identities so an old public meaning cannot be silently reused. The
default Site locale label is required. Every other active public locale may
provide its own label or record an explicit, visible **Use the default label in
this language** acknowledgement. With neither, the Topic is omitted from that
locale's public projection and becomes quiet missing-label health; there is no
silent locale fallback and no blanket block on otherwise eligible content.

Alternate labels improve staff retrieval. They do not enter public chips,
search documents, URLs, metadata, analytics, or logs at launch. A future public
synonym contract requires separate evidence.

### Hierarchy and assignment semantics

A Topic may have only one parent in the same set. Self-parenting, cycles,
cross-set parents, and depth beyond three are rejected. Optional drag may
request a move, but one named **Move topic** command is authoritative and
revalidates the complete ancestry in a short serialized exact-profile
transaction.

D19 owns the ancestry graph and explicit direct assignments only. Assigning a
child does not automatically assign, display, search, or filter by its ancestors.
D14 may explicitly choose direct-only or include-descendants semantics inside
its own versioned source contract; D19 supplies stable IDs and ancestry for that
qualified evaluation. D17 uses approved directly assigned labels at launch and
may consume ancestry only through a later explicit D17 contract. Selecting both
an ancestor and a descendant is permitted and stored as two direct choices; the
picker may explain the relationship but never deduplicates or invents an
assignment.

Authors choose existing active Topics only. They cannot create a term inline,
paste comma-separated free tags, import provider strings, or accept an AI-
generated Topic. Assignment is optional. One Topic does not become required
merely because a Topic Set exists.

### Nonlocalized assignment, localized releases

One stable Page or Article may have one immutable, nonlocalized Topic
Assignment Snapshot version containing only direct stable Topic IDs. The
editor's observed profile generation is a CAS and validation precondition, not
semantic content in the assignment; a label-only profile change therefore does
not churn every assignment. This is classification metadata, not
localized body copy, Page Placement, Navigation, a D18 folder, or a public
head.

The Page/Article editor presents assignment inside the ordinary editing
experience and participates in D12 recovery and expected-generation conflict
handling. A Topic change uses the same active-editor authority for the stable
content identity and creates a recoverable successor assignment snapshot; it
does not silently rewrite every locale Editorial Revision.

For each exact Tenant × environment × Site × BCP-47 locale, D1 independently
compiles and pins:

1. the exact eligible Page/Article and locale Editorial Revision;
2. the exact nonlocalized Topic Assignment Snapshot;
3. the exact compatible Site Topic Profile structure revision;
4. exact localized Topic Set/Topic label revisions or explicit approved
   default-label acknowledgements when used; and
5. the current Phase 10-safe direct Topic projection plus only the ancestry
   semantics explicitly required by a qualified owning consumer.

There is no D19 Site-global serving head and no cross-locale transaction.
Changing one site-wide Topic assignment or profile may prepare affected
successor candidates for every currently public locale, but each locale head
advances through ordinary D1 CAS independently. The Web Studio status must show
**Ready in 3 languages**, **Live in 2 of 3 languages**, or the exact locale and
cause that remains blocked. Single-locale tenants see no locale machinery.

### Authority-negative public contract

A Topic creates no:

- route, slug, archive, landing Page, breadcrumb, canonical URL, redirect,
  sitemap entry, or Navigation item;
- Page, Article, block, Reusable Section, Dynamic Content List, or search
  eligibility;
- publication, reach, permission, workflow, review, ownership, safety,
  lifecycle, or retention state;
- SEO meta-keyword, schema.org claim, personalization, recommendation,
  popularity, analytics, donor, CRM, financial, or operational fact; or
- Phase 22 directory, contributor, Ministry Update, Missionary, Project, or
  Campaign authority.

A tenant may explicitly select a D9 presentation variant that displays a
bounded direct Topic label row, or configure a D14 list filter that references
stable Topic IDs. D19 never turns every Topic into a public facet or badge.
D17 may index only released, public-safe, directly assigned labels carried by
its Search Document contract at launch. Those labels are the “approved tags”
eligible for D17's bounded title/topic trigram help; private alternate labels
and implicit ancestors are excluded.

The public runtime reads only flat, allowlisted compiled DTOs from the active
locale generation. It never lists the whole profile, resolves a mutable Topic
graph, or queries Payload relationships at request time.

### Profile and Topic lifecycle

Profile edits remain private until D1 releases their exact immutable successor.
The manager supports typed **Add topic set**, **Add topic**, **Rename**,
**Move topic**, **Replace and retire**, **Retire**, **Reorder**, and **Discard
unused draft** commands. D1's literal **Publish site changes** remains the sole
release action.

- Rename preserves stable identity.
- Reorder changes presentation order only but still releases through D1.
- Reparent changes ancestry and must preview affected content and any D14
  include-descendants filters; it creates no automatic D17 label effect.
- Retire prevents new assignment. A released or assigned Topic is never raw-
  deleted.
- Replace and retire is same-set only. After exact impact preview, the one staff
  operation stages an explicit successor profile plus owner-specific Page/
  Article Assignment Revisions and D14 selection-intent revisions under the
  same D1 candidate cohort. It records the old-to-new identity disposition,
  never mutates live or historical revisions, and blocks while any incompatible
  or unresolved use remains.
- Retire without replacement removes the Topic from new public projections
  only after affected assignments and D14 filters are explicitly resolved.
- A Topic Set can retire only after its active Topics are replaced or retired
  and every effect is resolved.
- Only a never-released, unused draft Topic or Topic Set may be discarded.

There is no destructive history rewrite, raw provider cascade, label reuse,
cross-set merge, automatic synonyming, or “delete anyway.” Recovery is a newly
validated forward profile version.

### Commands, integrity, and database posture

Every D19 mutation uses one authenticated server command boundary. It resolves
and re-proves actor, capability, Tenant, environment, current Site, profile and
expected generation, content family and identity where applicable, locale
contract, Topic Set, Topic, parent, assignment, current usages, D14/D17 effects,
and Phase 10 consequence. It requires an idempotency key and compare-and-set
fence, holds one short exact-profile transaction, re-reads hierarchy and
consequences before writing, awaits every effect, and emits one privacy-safe
audit receipt. Duplicate retry returns the same receipt.

For Payload-backed operations, the same authenticated request and transaction
context is threaded through every call with access and locks enforced. Browser
scope, hidden form values, client filters, relationship filters, and a successful
provider hook are never authorization.

The logical PostgreSQL model must structurally enforce:

- immutable Tenant × environment × Site scope on profile, set, Topic,
  assignment, and version identities;
- composite same-scope foreign keys for set membership, parentage, and
  assignments;
- one parent, self-parent rejection, one active profile-generation fence, and
  one assignment snapshot generation per stable content identity;
- normalized preferred/alternate label-token uniqueness within exact set and
  locale, retained across retirement/replacement;
- never-reused stable IDs and referentially intact retired/replaced history;
- exact content family eligibility and a 20-assignment ceiling; and
- indexes for scope/status, set/parent/order, normalized label lookup,
  assignment-by-content, assignment-by-Topic, profile generation, and impact
  queries.

Cycle, three-level depth, replacement impact, and ancestry paths are
revalidated while one profile-generation row is locked; launch does not need a
closure table, event-sourced ontology, or distributed lock. Physical table
shape is an implementation decision, but it must export and round-trip the
provider-neutral identities and invariants above.

[Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
requires policies plus grants and indexed policy columns on exposed tables.
[Supabase secure-data guidance](https://supabase.com/docs/guides/database/secure-data)
distinguishes trusted server connections from Data API access. D19 data should
remain in the private cms schema with least-privilege grants. If any relation is
ever exposed through the Data API, RLS, grants, exact tenant predicates, and
policy-plan tests become mandatory. Payload's privileged connection still
means the Web Studio command/access boundary and structural constraints are the
primary defense; a service role is not evidence of tenant isolation.

[PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
should carry same-scope uniqueness and referential invariants, while
[explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
supports the short serialized profile mutation. Transactional application
proof supplements—not replaces—structural constraints for recursive ancestry.

### Failure and recovery

- If the profile manager is unavailable, current public locale generations
  continue serving. Authors may save unrelated body changes while Topic changes
  remain disabled; no unknown assignment may be published.
- A stale expected generation opens a persistent conflict banner with **Reload
  current topics** and **Copy my proposed labels**. There is no last-write-wins.
- A failed profile release leaves every prior locale head intact. If some
  locales already activated, their success remains truthful and the UI lists
  the blocked locales and cause-owned retry.
- A missing optional locale label omits that Topic from the locale's public
  projection and records actionable health; it does not block otherwise
  eligible content. A D14/D17 consumer that explicitly requires the absent
  label, a retired assignment, incompatible D14 filter, unsafe combination,
  scope mismatch, or unknown profile version blocks only its favorable affected
  candidate. Adverse Phase 10 suppression remains immediate.
- A lost response is retried with the same idempotency key and returns the same
  committed receipt or the same inert rejection.
- Recovery never restores an obsolete safety classification or unconditional
  old generation. It creates a newly proved successor.

### Migration, export, and observability

Existing Page and Article identities begin with an empty Topic Assignment
Snapshot. Migration does not infer Topics from folder names, slugs, headings,
legacy provider tags, search terms, AI, geography, people groups, or content
copy. External taxonomy import belongs to a separately reviewed migration lane:
staff map source terms to explicit Topic IDs, review provenance and safety, and
release a successor. Unknown strings never create terms automatically.

A provider-neutral export includes profile/set/Topic stable IDs, exact scope,
versions, localized labels and acknowledgements, parentage, lifecycle and
replacement disposition, ordering, assignment snapshots, and released pins.
Provider field names and internal relationship IDs are adapter detail.

Private health covers profile-release progress by locale, invalid references,
missing labels, redundant or retired assignments, D14 filter incompatibility,
D17 projection convergence, safety suppression, normalization collisions,
adapter drift, and invariant/reconciliation failures. Metrics use bounded
dimensions; draft or sensitive Topic strings never become metric labels or
ordinary log fields. A healthy Site is quiet.

## Finished Web Studio UX/UI

### Information architecture

The manager lives at **Web Studio → Settings → Topics**. It is not placed under
Content Library folders, Users and permissions, Site Plan, Navigation, or
Search. The name **Topics** is used in staff UI; “taxonomy,” “ontology,”
“concept scheme,” provider “tags,” and “hierarchy collection” remain
implementation language.

The Page and Article editor includes one compact **Topics** section near other
discovery metadata, not inside body blocks:

> **Topics**
>
> Help people find related content. Topics do not change this page's address,
> menu, permissions, or publication. They apply to all languages.

Single-locale Sites omit the last sentence.

### First setup

The empty manager uses one calm setup card:

> **Help people find related content**
>
> Create a few groups such as Ministry focus, Audience, and Resource theme.
> You can change them before publishing.

Actions are **Start with examples** and **Start empty**. A secondary **See the
examples** disclosure previews the exact copied sets. Setup never asks staff to
choose taxonomy architecture, nesting mode, indexing, slugs, permissions,
search weights, or provider configuration.

### Manager overview

The default manager shows Topic Sets as a quiet ordered list of cards. Each card
contains:

- its tenant-owned name and one-sentence purpose;
- Page, Article, or Page and Article applicability;
- active Topic count and content-use count;
- a small Draft changes marker only when true;
- the first level of Topics; and
- **Open set** and an overflow menu for bounded set actions.

A persistent labeled **Search topics** field searches preferred and alternate
labels and returns the containing set plus breadcrumb path. Summary status says
**All topic changes are live**, **Draft topic changes**, or **Live in 2 of 3
languages**. It never shows generation IDs, provider records, or release
internals by default.

### Topic Set workspace

Desktop uses a two-pane search/list-first layout:

- a searchable Topic list with optional nested disclosure and breadcrumb
  context on the left, named Expand/Collapse controls, counts, and no eager
  recursive rendering; and
- a detail form on the right for labels, scope note, parent, usage impact,
  locale readiness, and lifecycle.

Search/list is the primary control. Hierarchy is a progressive disclosure and
breadcrumb explorer unless a tested Core ARIA tree primitive proves the full
tree keyboard model. Focus and selection remain distinct. Selecting an item
updates the detail heading and URL state without stealing focus unexpectedly.
**Move topic** opens a searchable parent picker that excludes self,
descendants, foreign sets, and depth-breaking destinations. Optional drag-and-
drop may call the same command, but it is never the only path.

At narrow widths, **Browse topics** opens a full-height Core Sheet. Selecting a
Topic closes the tree view into a full-width detail screen with a persistent
Back action. Forms use one column, visible labels, Core's comfortable 44-by-44
CSS-pixel control target, 320-pixel reflow, and no horizontal management canvas.

### Page and Article topic picker

The collapsed editor section shows selected Topics grouped by Topic Set and a
plain count, for example **Ministry focus: Church planting; Audience: Supporting
churches**. **Choose topics** opens:

1. a labeled search input;
2. results grouped by Topic Set;
3. preferred label, short scope note, and breadcrumb for ambiguous matches;
4. selected state with a real checkbox or listbox semantic, not color alone;
5. a clear 20-topic count and relationship context when both a parent and child
   are directly selected; and
6. **Apply topics** and **Cancel** actions that preserve the editor's focus.

The picker does not display an enormous tree first. Search is primary; a
**Browse by topic set** disclosure provides the hierarchy when useful. On
mobile it is a full-height Sheet with a sticky search field and footer actions.
No result offers inline creation. Staff without management capability see
**Can't find the right topic? Ask a site manager**; authorized managers receive
one **Manage topics** link that preserves their unsaved Page work through D12.

### Change and release UX

Low-consequence actions stay quiet:

- adding or renaming an unused draft Topic needs no confirmation;
- choosing existing Topics uses one Apply action;
- removing a Topic from one draft shows ordinary undo; and
- reordering shows no alarmist modal.

Consequential actions use an impact-first review:

- **Rename** states that addresses and permissions do not change and lists the
  locale labels affected;
- **Move topic** lists affected content and the explicit D14 include-descendants
  filters whose meaning changes;
- **Replace and retire** shows the replacement, content count, exact owner-
  specific assignment/list revisions that will be staged, languages, and any
  blocked or unresolved items; and
- **Publish site changes** summarizes added/renamed/moved/retired Topics,
  affected Pages/Articles/lists, Phase 10 blockers, missing labels, and locale
  release readiness.

The primary release action remains D1's **Publish site changes**, not “Save
taxonomy” or a second Topic release. Saving a working profile does not claim
public effect. After preparation, each locale
reports **Ready**, **Live**, or **Needs attention** with one cause-owned action.
The system never asks staff to reapprove unchanged content manually.

### Required states and feedback

The manager and picker must have distinct, persistent, accessible states for:

- loading and slow loading;
- no profile configured;
- an empty Topic Set;
- no search matches;
- no eligible Topics for this content family;
- permission-limited read-only access;
- missing locale label or explicit fallback acknowledgement;
- selected Topic retired or replaced since the editor opened;
- expected-generation conflict;
- profile/provider unavailable;
- Phase 10 safety block;
- D1 candidate preparation or activation failure;
- partial per-locale activation; and
- successful save, release preparation, and locale activation.

Errors remain next to the affected field and in a summary linked to that field.
Success and async status are visible and announced through an appropriate live
region; no outcome exists only in a toast. Focus returns to the invoking
control after Sheet/Dialog closure, and interrupted draft work remains
recoverable through D12.

### Public presentation restraint

Topics improve discovery without turning a ministry site into a tag cloud. The
default Page/Article template displays no Topic row. A D9 presentation package
may deliberately show a small direct-label row or a D14 list may expose a
bounded filter, with normal links only when D2/D14 explicitly supplies a real
destination. There are no inert clickable chips, automatically generated Topic
archive routes, public enumeration of the catalog, or badges for private
alternate labels.

## Full adversarial review

### 1. Brittleness — material concern: yes

- **What could go wrong:** Labels, provider field names, or virtual hierarchy
  paths become de facto identity; localized renames break filters; a missing
  parent is treated as root; or Site-wide assignments drift between locale
  generations.
- **Why it matters:** A routine translation, reparent, provider upgrade, or
  partial locale release could silently change discovery or show the wrong
  ministry classification.
- **Severity:** High.
- **Likelihood:** Likely without a stable product contract; low after the
  proposed pins and constraints.
- **Evidence:** SKOS and Contentful separate stable concepts from labels. The
  exact Payload hierarchy computes provider paths and can degrade a missing
  parent to root. D1 explicitly releases exact locales independently.
- **Permanent fix:** Bind opaque stable IDs, exact profile and assignment
  versions, same-scope parentage, explicit locale labels, and per-locale D1
  pins. Treat all Payload paths and labels as replaceable presentation data.

### 2. Technical debt — material concern: yes

- **What could go wrong:** Core grows one generic tag feature for public
  discovery, another for staff folders/workflow, and special lists that compare
  label strings, leaving duplicated normalization, access, and migration logic.
- **Why it matters:** Every future taxonomy change would require coordinated
  fixes across authoring, Payload, D14, D17, public rendering, imports, and
  tenants.
- **Severity:** High.
- **Likelihood:** Likely if stock provider tags are exposed directly.
- **Evidence:** Contentful now recommends controlled taxonomy for organization
  and search while generic tags remain a different primitive; D18 already owns
  private filing. The exact Payload tag field is intentionally thin.
- **Permanent fix:** One provider-neutral D19 domain contract and one exact-
  qualified adapter. Reuse shared identity, normalization, command, DTO, audit,
  and conformance seams; do not create a second generic tag engine.

### 3. Edge cases — material concern: yes

- **What could go wrong:** Two visually equivalent Unicode labels collide; one
  locale lacks a label; a selected Topic retires while an editor is open;
  direct child and parent selections are incorrectly collapsed; reparenting
  changes an include-descendants D14 result; a
  scheduled D13 publication executes against an old profile; or an Article has
  no public variant in one locale.
- **Why it matters:** These are ordinary multilingual and multi-editor ministry
  conditions, not theoretical extremes. Silent handling produces wrong filters,
  confusing staff states, or unsafe releases.
- **Severity:** High.
- **Likelihood:** Likely over the life of a real Site.
- **Evidence:** Contentful exposes taxonomy connections and localized labels;
  Cru's taxonomy is hierarchical; D13 already requires execution-time reproof.
- **Permanent fix:** Normalize and constrain label tokens, version everything,
  preserve explicit parent/child choices, show replacement state in the picker,
  calculate consumer-qualified ancestry impact, and re-prove exact profile/
  assignment/locale pins at D13 execution.

### 4. Footguns — material concern: yes

- **What could go wrong:** An author creates near-duplicate terms inline,
  publishes a sensitive people-group label, deletes a parent and loses child
  assignments, or assumes Audience controls access.
- **Why it matters:** One easy admin gesture could expose restricted-ministry
  context, fragment discovery, or erase classification from many Pages.
- **Severity:** High; Critical when a label contributes to restricted-person
  identification.
- **Likelihood:** Possible and recurrent without the hardened UI.
- **Evidence:** Drupal's free-tagging lane creates terms inline. The exact
  Payload drawer permits creation, and its hierarchy deletion hooks can
  recursively delete children and clear a complete related field.
- **Permanent fix:** No inline create, free tags, or raw delete. Use plain helper
  text, managed capability, impact preview, replace/retire commands, whole-
  projection Phase 10 proof, and a public-safety warning only where geography or
  people-group concepts are deliberately created.

### 5. Tenant safety — material concern: yes

- **What could go wrong:** A forged relation attaches a Topic, parent, or
  assignment from another Tenant, environment, or Site; a privileged Payload
  read computes a foreign path; or a cache key omits exact scope.
- **Why it matters:** Cross-tenant classification can leak another ministry's
  terminology, corrupt releases, and expose sensitive mission context.
- **Severity:** Critical.
- **Likelihood:** Unlikely after structural enforcement; possible with request-
  filter-only isolation.
- **Evidence:** Current tenant access relies on request filters and hooks, while
  Payload uses a privileged private-schema PostgreSQL connection. Supabase
  guidance distinguishes grants, RLS, and trusted server access.
- **Permanent fix:** Immutable exact scope on every identity, composite same-
  scope foreign keys and indexes, trusted server scope resolution, negative
  cross-scope tests on every access path, complete scope in release/cache keys,
  and RLS plus grants if any relation is ever exposed.

### 6. Overengineering — material concern: yes

- **What could go wrong:** A simple ministry vocabulary becomes a universal
  ontology with arbitrary schemes, polyhierarchy, per-term ACLs, public/private
  matrices, workflows, AI, semantic search, and tenant-tunable limits.
- **Why it matters:** Small nonprofit teams would face setup paralysis, weak
  data quality, high support cost, and an architecture harder to migrate than
  the content it organizes.
- **Severity:** Medium.
- **Likelihood:** Likely unless launch exclusions are binding.
- **Evidence:** Cru explicitly advises using only relevant sets and few terms.
  The common CMS exemplars support controlled schemes without requiring every
  enterprise taxonomy capability.
- **Permanent fix:** Keep eight sets, 500 active Topics, three levels, one
  parent, and 20 assignments as code-owned ceilings; ship three small optional
  starters and explicit exclusions. Expand only from measured need.

### 7. UX/UI and user friction — material concern: yes

- **What could go wrong:** Staff confront taxonomy jargon, an enormous tree,
  repeated locale assignment, confirmation fatigue, ambiguous labels, hidden
  save/publish distinction, or a topic-chip wall on public Pages.
- **Why it matters:** Mission staff publish under time pressure and may have no
  dedicated information architect. Confusion causes abandonment, over-tagging,
  and false beliefs about permissions or release.
- **Severity:** High.
- **Likelihood:** Likely with stock relationship UI or a tree-first design.
- **Evidence:** OMF and Cru use separate meaningful classification axes;
  Contentful uses search plus hierarchy; WAI defines predictable combobox and
  tree behavior. The Core Web Studio already favors quiet, cause-owned actions.
- **Permanent fix:** Use Topics language, optional starter setup, a search-first
  grouped picker, one assignment across languages, plain scope notes, impact-
  proportional confirmation, visible per-locale release state, mobile Sheet,
  and restrained opt-in public display. Validate with actual ministry staff.

### 8. Hidden coupling — material concern: yes

- **What could go wrong:** D14 filters depend on a label or tree path, D17
  indexes mutable aliases, a D9 package queries Payload directly, or changing a
  parent unexpectedly rewrites URLs, Navigation, or publication.
- **Why it matters:** An editorial classification improvement could become a
  risky cross-system release or change unrelated public behavior.
- **Severity:** High.
- **Likelihood:** Likely if integrations consume provider records.
- **Evidence:** D1–D18 deliberately separate routes, Navigation, presentation,
  dynamic sources, search, and private folders. Payload relationships carry none
  of those authority distinctions.
- **Permanent fix:** Stable Topic IDs and exact profile versions at every seam;
  one compiled public projection; D14 and D17 versioned adapters; explicit
  authority-negative tests; no raw Payload query in public or custom-package
  code.

### 9. Failure modes — material concern: yes

- **What could go wrong:** A profile transaction partially writes; a release
  fails after some locale heads advance; Payload is unavailable; a response is
  lost after commit; or old search work resurrects retired labels.
- **Why it matters:** Staff could see false success, repeat changes, or leave
  public languages with unexplained differences.
- **Severity:** High.
- **Likelihood:** Possible in normal distributed operation.
- **Evidence:** D1 separates candidate, activation, cache, and search facts.
  Payload requires the same request for transactional operations; D17 already
  uses newest-state fencing and adverse-first containment.
- **Permanent fix:** One short transactional command, idempotency and CAS,
  exact receipts, prior-generation continuity, honest per-locale status,
  D17 version watermarks, failpoint tests, and forward-only recovery.

### 10. Data integrity risks — material concern: yes

- **What could go wrong:** Duplicate labels, orphan Topics, cycles, excessive
  depth, cross-set parents, duplicate direct assignments, broken replacement
  chains,
  or stale D14 filters enter stored truth.
- **Why it matters:** Discovery and reporting become nondeterministic, and a
  future export cannot reconstruct what a public generation meant.
- **Severity:** High.
- **Likelihood:** Possible without structural constraints; low after them.
- **Evidence:** PostgreSQL distinguishes referential, check, and unique
  constraints. Provider read-before-write hooks do not structurally prove
  same-product-scope integrity or close concurrent hierarchy races.
- **Permanent fix:** Composite foreign keys, normalized label-token uniqueness,
  never-reused IDs, one-parent and assignment ceilings, serialized ancestry
  proof, referential history, exact version pins, and authoritative
  reconciliation.

### 11. Security and privacy risks — material concern: yes

- **What could go wrong:** A public label, alternate label, whole catalog,
  impact preview, error, log, or metric reveals a worker's location, people
  group, method, or restricted ministry; Local API access bypass exposes foreign
  records.
- **Why it matters:** Classification is itself information. Mosaic disclosure
  can endanger missionaries, partners, churches, and communities even when body
  copy was individually generalized.
- **Severity:** Critical.
- **Likelihood:** Possible; higher for organizations using geographic or
  people-group concepts.
- **Evidence:** TEAM documents closed-access contexts; OCHA treats combined
  disclosure as a real harm; Payload Local API access overrides by default.
- **Permanent fix:** No sensitive starter sets, complete projection Phase 10
  proof, explicit public-safe label admission, no automatic catalog
  enumeration, allowlisted DTOs, privacy-safe telemetry, access/lock enforcement,
  least privilege, and adverse-first suppression.

### 12. Scalability and performance risks — material concern: yes

- **What could go wrong:** Every picker loads the whole tree, every public
  request recursively resolves Topics, reparenting performs an N+1 impact
  census, or one rename rebuilds unbounded content synchronously.
- **Why it matters:** A model that feels instant for 30 Topics may stall for a
  multi-country mission with hundreds of Topics, many locales, and thousands of
  Articles.
- **Severity:** Medium.
- **Likelihood:** Possible at larger nonprofit scale.
- **Evidence:** Payload exposes a tree limit rather than promising unbounded
  hierarchy. Supabase recommends indexes for policy/query columns. D1 already
  supports bounded affected-closure preparation and structural reuse.
- **Permanent fix:** Hard bounds, indexed search and adjacency, lazy tree
  expansion, paginated usage views, set-based impact queries, compiled flat
  public DTOs, resumable candidate preparation, and production-shaped query-
  plan/capacity tests. No closure table at launch without evidence.

### 13. Operational burden — material concern: yes

- **What could go wrong:** Staff continually clean duplicate Topics, translate
  unused terms, explain what each set means, repair deprecated filters, and call
  developers for ordinary changes.
- **Why it matters:** Many ministry organizations have small communications
  teams; taxonomy stewardship cannot become a specialist full-time role.
- **Severity:** Medium.
- **Likelihood:** Likely if free-form creation or too many sets are allowed.
- **Evidence:** Cru recommends centralized review, uniqueness, relevant sets,
  and limited tagging. Managed CMS taxonomies use descriptions and impact
  visibility.
- **Permanent fix:** Optional small starters, clear scope notes, no inline
  create, named management capability, usage counts, rename/replace/retire,
  missing-label health, quiet defaults, and product help embedded at the point
  of use.

### 14. Observability gaps — material concern: yes

- **What could go wrong:** Staff cannot tell whether a Topic change is saved,
  released in each locale, projected to D17, blocked by safety, or still
  referenced after retirement; operators see only generic job failures.
- **Why it matters:** Discovery regressions and privacy failures remain hidden
  or are misdiagnosed as editor mistakes.
- **Severity:** High.
- **Likelihood:** Possible without a dedicated health contract.
- **Evidence:** D1 and D17 explicitly separate activation, search convergence,
  containment, and crawler facts. D19 adds profile and assignment pins that must
  remain diagnosable.
- **Permanent fix:** Per-locale profile/release state, invalid-reference and
  missing-label health, D14 incompatibility, D17 convergence, safety
  suppression, adapter-drift and invariant reconciliation; low-cardinality
  metrics and restricted correlation without label strings.

### 15. Dependency and integration risks — material concern: yes

- **What could go wrong:** The internal Payload 4 hierarchy API changes,
  folders and tags collide, a provider hook deletes descendants or assignments,
  Local API bypasses access, or an integration starts comparing labels.
- **Why it matters:** The exact runtime is an internal build whose hierarchy
  surface is actively evolving. Direct adoption would couple product truth to
  undocumented provider behavior.
- **Severity:** High.
- **Likelihood:** Likely across upgrades; low per release with a qualification
  gate.
- **Evidence:** Exact 4.0.0-internal.1f9ae9a source shows thin tag fields,
  injected hooks, privileged hierarchy reads, recursive deletion, and separate
  hierarchy presets. Payload's v4 announcement describes ongoing hierarchy
  work.
- **Permanent fix:** One replaceable adapter, exact-pin schema/hook/UI/access/
  lock/version/migration conformance, raw-delete prohibition, provider-neutral
  export, retained-reader tests, and upgrade blocked until all proof passes.

### 16. Migration and upgrade risks — material concern: yes

- **What could go wrong:** Legacy strings become Topics automatically, labels
  are used as IDs, old profile versions become unreadable, or a provider change
  cannot round-trip localized hierarchy and assignments.
- **Why it matters:** Automatic inference invents public meaning and may expose
  unsafe classifications; irreversible provider coupling makes future migration
  expensive.
- **Severity:** High.
- **Likelihood:** Possible during initial adoption and every provider upgrade.
- **Evidence:** D1 migration rules prohibit invented collision winners. Stable
  taxonomy concepts and labels are separate in SKOS/Contentful. Current Pages
  do not yet have the authoritative final D19 model.
- **Permanent fix:** Existing content starts unassigned; imports are explicit,
  reviewed, provenance-bearing maps; profile versions retain compatible readers;
  unknown versions quarantine; provider-neutral export/import and downgrade/
  rollback rehearsal are release gates.

### 17. Other development hazards — material concern: yes

- **What could go wrong:** Concurrent renames create normalized duplicates;
  inverse reparenting creates a cycle; one editor overwrites another assignment;
  a D13 appointment races profile retirement; or deployment enables the UI
  before schema, adapter, and D1 compiler support are coherent.
- **Why it matters:** These races create intermittent corruption or false
  publication success that ordinary happy-path tests will miss.
- **Severity:** High.
- **Likelihood:** Possible under realistic concurrency and staged deployment.
- **Evidence:** Read-before-write hierarchy validation cannot close concurrent
  races. D12/D13 already establish recoverable editor and exact-execution
  requirements. Payload provider state is not D1 state.
- **Permanent fix:** Expected-generation CAS, one short profile lock,
  transactionally re-read invariants, D12 conflict recovery, D13 execution-time
  reproof, capability-gated additive deployment, failpoint/race/property tests,
  and one verified rollback plan.

## Ruthless synthesis

### Must be fixed before implementation may begin

1. **Ratify the semantic boundary.** D19 is one public-discovery classification
   contract for D6 Page and Article only. D18 private folders, workflow tags,
   permissions, CRM segments, operational geography, Phase 22 specialized
   records, routes, Navigation, SEO pages, and publication remain elsewhere.
2. **Ratify identity and locale semantics.** Stable Topic IDs and nonlocalized
   assignment snapshots apply across languages. Each D1 exact-locale
   generation independently pins the exact profile, assignment, and label
   versions. D19 creates no cross-locale transaction or serving head.
3. **Freeze the small catalog.** Eight active sets, 500 active Topics, three
   single-parent levels, and 20 direct assignments are code-owned launch
   ceilings. The optional starter stays around three sets and 15–20 terms.
4. **Make safety structural.** No geography/people-group starter, no automatic
   catalog enumeration, and the complete Page-or-Article plus direct Topic and
   consumer-qualified ancestry projection must pass current Phase 10 before
   favorable release.
5. **Own one product command boundary.** All mutations require trusted exact
   scope, capability, idempotency, CAS, short transaction, ancestry and impact
   reproof, access/lock enforcement, and privacy-safe audit. Raw Payload create,
   delete, or relationship mutation is unavailable.
6. **Qualify one replaceable exact-pin adapter.** Capture field shape,
   folder/topic coexistence, inline-create behavior, hooks, recursive deletion,
   privileged path reads, access/lock defaults, versions, localization,
   transactions, migration, and rollback for 4.0.0-internal.1f9ae9a.
7. **Install structural invariants.** Exact-scope composite references, stable
   identity, normalized label-token uniqueness, same-set parentage, lifecycle
   history, bounds, indexes, and serialized cycle/depth proof are nonoptional.

### Must pass before shipping

8. **Ship the finished ministry-friendly UX.** Optional examples, Topics—not
   taxonomy—language, search-first grouped picker, clear scope notes, no inline
   creation, mobile Sheet, keyboard/touch/screen-reader support, impact-
   proportional review, and honest per-locale status.
9. **Prove release composition.** Profile edits and assignment edits remain
   private until each exact locale's D1 candidate pins them. Partial locale
   success is honest; prior heads survive failure; D13 re-proves at execution;
   D14 and D17 consume stable versioned DTOs only.
10. **Prove lifecycle without deletion.** Rename, reparent, replace, retire,
    discard-unused-draft, stale consequence, lost response, and forward recovery
    preserve immutable history and never invoke destructive provider hooks.
11. **Complete the access matrix.** Wrong Tenant, environment, Site, content
    family, locale, role, Payload REST/GraphQL/Local API, browser-forged scope,
    custom presentation package, and public runtime cannot enumerate or mutate
    forbidden Topic data.
12. **Test concurrency and failure.** Duplicate retry, simultaneous normalized
    rename, inverse reparent, edit-versus-retire, assignment conflict,
    appointment-versus-profile change, transaction failure, partial locale
    activation, adapter outage, and rollback all fail safely.
13. **Test scale and accessibility.** Production-shaped skewed tenants prove
    indexed search, set-based impact, lazy tree, bounded release fan-out, no
    public N+1, and acceptable latency. Manual plus automated tests cover
    keyboard, screen reader, focus, zoom, 320-pixel reflow, touch, reduced
    motion, and all empty/error/conflict states.
14. **Migrate and export honestly.** Existing content starts unassigned; no
    inferred terms. Explicit reviewed mapping, complete provider-neutral export,
    retained readers, compatibility, and downgrade/rollback evidence are ready
    before activation.
15. **Make health cause-owned.** Per-locale profile adoption, missing labels,
    invalid/retired assignments, D14 incompatibility, D17 convergence, safety
    containment, invariant drift, and adapter drift are observable without
    leaking Topic strings.

### Address soon after activation

- Run moderated usability tests with at least one small single-locale mission,
  one multilingual communications team, and one restricted-ministry safety
  reviewer. Measure first setup, assignment success, label clarity, and ability
  to distinguish Topics from permissions, folders, Site Plan, and publication.
- Review which starter sets and terms tenants actually keep, rename, or remove.
  Product evidence—not sales exceptions—should drive the next starter version.
- Calibrate limits and impact preparation from measured tenants before any
  additive contract-version proposal.

### Monitor without adding launch complexity

- profile adoption, unused Topic Sets, unused/overused Topics, assignment count
  distribution, and over-tagging indicators as UX signals, never quotas;
- missing-label, replace/retire, stale-generation, and conflict frequency;
- picker search, tree expansion, impact-query, D1 preparation, and public query
  latency at large-tenant percentiles;
- D17 favorable lag and adverse containment for approved Topic labels;
- Phase 10 Topic-combination suppressions and unresolved safety blocks; and
- Payload adapter/conformance drift on every dependency change.

## Required proof matrix

| Gate                    | Required evidence                                                                                                                                                                                                                                                                              | Rejects                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Authority darkness      | Topic-only changes do not alter routes, Navigation, permissions, workflow, content family, Phase 22 records, operational facts, public eligibility, or unsafe public facet counts                                                                                                              | Generic tags as hidden authority                                      |
| Exact scope             | Wrong Tenant, environment, Site, Topic Set, family, and role cannot read, count, search, assign, parent, or mutate                                                                                                                                                                             | Request-filter-only isolation                                         |
| Exact Payload pin       | Schema, relationship depth/population, hierarchy, after-read path leakage, hooks, parent/topic delete on has-many assignments, omitted access/lock overrides, UI inline creation, localization, transaction, folder coexistence, migration, and rollback conformance at 4.0.0-internal.1f9ae9a | Public-doc or v3 snapshot assumptions                                 |
| Stable identity         | Rename, translation, reorder, reparent, replacement, retained-reader, and export/import preserve opaque IDs and exact versions                                                                                                                                                                 | Labels, slugs, and provider IDs as truth                              |
| Label integrity         | NFKC/casefold/space collisions across preferred and alternate labels; missing locale; explicit default-label acknowledgement; punctuation/diacritic preservation                                                                                                                               | Silent fallback and duplicate vocabulary                              |
| Hierarchy               | Self/cross-set/cross-scope parent, cycle, depth four, inverse concurrent move, and stale parent fail atomically                                                                                                                                                                                | Read-before-write ancestry only                                       |
| Assignment              | Optional selection, 20 cap, exact parent/child direct choices, duplicate rejection, family applicability, stale retirement, D12 conflict and recovery                                                                                                                                          | Free tags, inline create, inferred ancestors, locale copies           |
| D1 locale release       | Each locale pins exact profile structure, assignment, label, compiler, and safety versions; missing optional labels omit safely; locale A may activate while locale B stays on its prior safe generation                                                                                       | Site-global head, cross-locale atomic claim, or blanket content block |
| Phase 10 safety         | Direct labels and only consumer-qualified ancestry semantics are proved with the complete public projection; adverse change suppresses before ordinary convergence                                                                                                                             | Per-term safety badges or publish-then-filter                         |
| D13 scheduling          | Scheduled execution re-proves exact profile, assignment, label, safety, D14, and public eligibility                                                                                                                                                                                            | Mutable latest at execution                                           |
| D14 integration         | Filters store stable Topic IDs plus exact compatible contract/profile versions; direct-only and explicit include-descendants modes are separately deterministic                                                                                                                                | Automatic ancestry, label/path filters and runtime provider graph     |
| D17 integration         | Only released public-safe directly assigned labels enter launch Search Documents; retired/unsafe labels contain, delete, and cannot resurrect                                                                                                                                                  | Private aliases, implicit ancestors, raw tags, stale upsert           |
| Lifecycle               | Rename, reparent, same-set replace, retire, set retirement, discard-unused-draft, retry, and lost response preserve history and exact impact                                                                                                                                                   | Raw delete, cascade, cross-set merge                                  |
| Concurrency/failure     | Duplicate retry, simultaneous normalized rename, inverse move, rename/retire/replace versus assignment/publish, stale profile/assignment CAS, audit/database/provider failure, and locale partial activation produce no partial product truth                                                  | Last-write-wins and false success                                     |
| Migration/export        | Existing content stays unassigned; mapped imports require review/provenance; exact neutral round trip and retained readers pass                                                                                                                                                                | AI/string inference and provider lock-in                              |
| Performance             | Indexed plans, lazy/paginated management, set-based impacts, bounded fan-out, flat public DTO, no public N+1 under production-shaped load                                                                                                                                                      | Whole-tree/public recursive reads                                     |
| Accessibility/usability | Ministry staff complete setup, assignment, move, replacement and release on desktop/mobile with keyboard, screen reader, touch, zoom and 320-pixel reflow                                                                                                                                      | Jargon, drag-only, toast-only, tree-only UI                           |
| Observability           | Per-locale release, label gaps, invalid references, safety, D14/D17, invariant and adapter health are actionable and privacy-safe                                                                                                                                                              | One generic CMS sync status                                           |

## Exact founder-ratified formulation

> **C-prime-amended-and-hardened (C-prime-R) — one exact-scope, versioned and
> D1-release-bound Site Topic Profile with a small tenant-named catalog of
> controlled, public-safe Topic Sets:** D19 gives each exact Tenant ×
> environment × Site at most one stable Site Topic Profile identity with
> immutable versions, at most eight active Topic Sets, 500 active Topics across
> the profile, three single-parent levels including the root, and 20 direct
> Topic assignments per eligible stable D6 Page or Article. The optional setup
> starter copies roughly three editable sets—such as Ministry focus, Audience,
> and Resource theme—and 15–20 ordinary terms into that Site's private working
> profile; staff may instead start empty. Set names and terms are tenant-owned,
> assignment remains optional, and these code-owned ceilings are guardrails,
> not targets, plan controls, or tenant-configurable matrices. Phase 22
> Missionary Ministry Pages, Project/Campaign Pages, Ministry Updates,
> directories, and all specialized Phase 22 records remain excluded.
>
> Each Topic Set and Topic has one opaque stable never-reused identity and
> immutable Tenant × environment × Site scope. A Set has one localized
> preferred label, short purpose, Page/Article/both applicability, deterministic
> position, and active/retired state. A Topic has one immutable Set, one
> optional same-set parent, localized preferred label and short scope note,
> bounded localized staff-search alternate labels, deterministic sibling
> position, and active/retired/replaced state. Preferred and alternate label
> tokens are NFKC-, whitespace-, and Unicode-case-normalized and remain unique
> within exact Site × Set × locale across active, retired, and replaced
> identities; punctuation and diacritics remain meaningful. The Site default-
> locale label is required. Another public locale may supply its own label or
> one explicit visible use-default acknowledgement; with neither, the Topic is
> omitted from that locale's public projection and reported as missing-label
> health without blocking otherwise eligible content—never silent fallback.
> IDs, not labels, paths, slugs,
> Payload fields, or provider virtual paths, bind assignments, D14 filters,
> D17 projections, releases, audit, and migration.
>
> One stable Page or Article owns one immutable, versioned and nonlocalized
> Topic Assignment Snapshot containing direct stable Topic IDs. The observed
> profile generation is only a CAS/validation precondition, not assignment
> meaning, so a label-only profile change does not churn assignments. The editor
> says **Topics help people find related content;
> they do not change this page's address, menu, permissions, or publication;
> topics apply to all languages**, lets authors choose only existing active
> Topics through a search-first grouped picker, groups selected chips by Set,
> explains scope and breadcrumbs, preserves explicit parent and child choices,
> and provides no inline creation, free tags, comma import, or AI classification.
> D19 owns ancestry and direct assignments only: a child never automatically
> assigns, displays, filters, or searches its ancestors. D14 may explicitly
> qualify direct-only or include-descendants behavior in its own versioned
> contract; launch D17 consumes approved direct labels only.
> A D9 presentation may deliberately show a bounded direct-label row, but no
> Topic automatically becomes a public badge, facet, route, archive, SEO page,
> sitemap item, Navigation item, or publicly enumerable catalog.
>
> Site-wide classification creates no cross-locale transaction or Site-global
> serving head. Each exact Tenant × environment × Site × BCP-47 locale D1
> Public Site Generation independently pins the eligible content revision, the
> exact nonlocalized assignment snapshot, exact compatible Site Topic Profile
> structure revision, exact locale label revision or acknowledged default label
> when one is used, and current Phase-10-safe direct Topic projection plus only
> consumer-qualified ancestry semantics, then CAS-advances only that locale's
> serving head. A profile or assignment change may prepare every affected
> public locale, but Web Studio reports **Ready**, **Live**, or **Needs
> attention** per locale and may truthfully say **Live in 2 of 3 languages**;
> it never extends D10's presentation-only cohort exception, claims atomic
> all-locale activation, or silently rewrites locale Editorial Revisions. D13
> re-proves every exact pin at execution, and failure leaves each prior safe
> locale generation serving.
>
> A Topic supplies no Page/Article identity, route, slug, hierarchy,
> breadcrumb, redirect, Navigation, Dynamic Content List, publication,
> permission, audience access, workflow, review, ownership, lifecycle,
> retention, content family, donor/CRM segment, operational geography,
> financial fact, search eligibility, Phase 22 authority, or Phase 10 safety.
> The complete Page-or-Article projection—including direct Topic labels, any
> ancestry semantics explicitly requested by a qualified owning consumer, and
> their combination with copy and source facts—must pass
> current Phase 10 proof before favorable release; no starter People Group or
> exact Geography set is supplied, no catalog is automatically public, and
> adverse containment outranks ordinary D1/D17 convergence. D14 consumes only
> compatible stable Topic IDs and exact profile versions. D17 consumes only
> released, public-safe directly assigned labels through its Search
> Document contract; staff alternate labels remain private and do not enter
> public search, URLs, metadata, analytics, metrics, or logs. Public delivery
> reads one flat allowlisted compiled DTO, never Payload or a recursive mutable
> Topic graph.
>
> Web Studio owns one calm **Settings → Topics** manager and Core-consistent
> Page/Article picker. Setup offers **Start with examples** or **Start empty**;
> the overview shows plain-language Set purpose, family, active and usage
> counts, search, draft changes, and honest per-locale release health. Desktop
> uses a search/list-first two-pane workspace with disclosure/breadcrumb
> hierarchy and detail; a full ARIA tree is used only if a tested Core primitive
> exists. Narrow layouts use a full-height searchable Core Sheet and Core's
> comfortable 44-pixel controls. Search is primary in the content picker;
> browse-by-set is secondary. Named Move controls are authoritative and
> optional drag invokes the same command. Rename and draft edits stay quiet;
> reparent, replace/retire, and D1 **Publish site changes** show exact affected
> content, D14/D17, safety, label, and locale consequences. Loading, empty,
> no-match, read-only, missing-label, retired-selection, conflict, unavailable,
> unsafe, preparation-failure, partial-locale, and success states remain visible,
> focus-safe, recoverable through D12, and programmatically announced—never
> toast only.
>
> Every add, rename, reorder, move, replace, retire, discard-unused-draft,
> assignment, and release command re-proves authenticated actor and capability,
> immutable exact scope, eligible family and identity, expected profile and
> assignment generations, localized labels, same-set parentage, three-level
> acyclicity, normalized uniqueness, bounds, uses, D14/D17 compatibility, and
> Phase 10 consequence; uses one idempotency key, compare-and-set fence, short
> exact-profile serialized PostgreSQL transaction, awaited effects, and
> privacy-safe audit receipt; and threads the same authenticated Payload request
> with access and locks enforced. Structural composite foreign keys, unique
> label tokens, never-reused IDs, referential history, assignment ceilings, and
> supporting indexes back the command proof. Payload's privileged connection is
> never called RLS-protected, browser filters never authorize, and raw
> hierarchy create/delete/relationship mutations are unavailable to ordinary
> users.
>
> Rename preserves identity; released or assigned Topics are never deleted;
> reparenting previews changed ancestry and qualified consumer meaning; same-set
> Replace and retire stages one explicit successor profile plus explicit owner-
> specific Page/Article Assignment Revisions and D14 intent revisions under the
> same D1 candidate, never mutates live/history, and blocks on unresolved or
> incompatible uses; retirement without replacement blocks
> until assignments and filters are resolved; a Set retires only after its
> Topics; and only an unused never-released draft may be discarded. Old
> immutable generations remain readable, recovery is a newly proved forward
> version, and raw Payload recursive deletion is forbidden. Activation requires
> additive no-inference migration with existing content unassigned; explicit
> provenance-bearing import review; provider-neutral export and retained-reader
> proof; exact 4.0.0-internal.1f9ae9a schema, hierarchy, folder-coexistence,
> hook/delete/path, UI, access, lock, version, localization, transaction,
> migration and rollback conformance; tenant, race, failpoint, D1/D12/D13/D14/
> D17, Phase 10, capacity, mobile, keyboard, screen-reader, focus, zoom, touch
> and reflow tests; and privacy-safe per-locale, label, assignment, safety,
> projection, invariant and adapter-drift health. D19 introduces no universal
> ontology, polyhierarchy, per-topic ACL, workflow tag, public/private matrix,
> cross-Site/global vocabulary, tenant-authored schema, automatic archive,
> auto-tagging, semantic vector, personalization, or second release engine.

## Decision posture

The founder ratified this exact C-prime-R as Phase 23 D19 on 2026-08-23. The
[Phase 23 decision log](../phase-23-web-studio-cms-decision-log.md) is the
authority; this file remains supporting evidence and does not independently
expand the decision. [ADR-0163](../../../adr/0163-versioned-release-bound-site-topic-profile-and-controlled-topic-sets.md)
records the architectural consequence.

Ratification authorizes no implementation, schema, migration, dependency or
provider adoption, issue publication, deployment, D1 activation, release, or
production change. Root `CONTEXT.md` remains unchanged under the Phase 22 PR
#1323 stack hold.
