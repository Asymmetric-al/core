# Phase 23 D1 Page-Local Composition Adversarial Research Evidence

Research date: 2026-08-15

**Candidate under review:** **C-prime — Page-local composition with explicit
reuse under one Site Plan release**

**Evidence status:** Focused adversarial research only. This document does not
ratify D1, write the Phase 23 specification, or approve a Payload version or
plugin.

**Authority posture:** Current primary and official sources only. Statements
labelled **DOCUMENTED** describe source behavior. Statements labelled
**INFERRED** are recommended Asym safeguards drawn from that evidence, not
vendor claims.

**Interpretation tested:** A Page owns an ordered set of typed, local content
blocks by default. An editor may deliberately replace a local block with a
reference to an independently reusable content item. Draft editing can remain
document-oriented, but a public Site Plan release resolves every included Page
and reusable reference to exact immutable versions and activates one complete
published generation.

## Executive verdict

**Keep C-prime, but harden the word “reuse.”** Page-local composition is the
right default because most edits have a naturally small blast radius. Explicit
reuse is valuable for genuinely shared material, but only if the editor can
see that it is shared, understand which pages are affected, choose a local
copy, and release an exact version instead of a live “latest” pointer.

The smallest permanent hardening is:

1. Local typed blocks are the default. **Reuse existing** is a separate,
   deliberate action.
2. Reusable content is one level deep in D1; reusable items cannot contain
   other reusable items. This prevents cycles and makes the release closure
   understandable.
3. A draft reference may follow the editor's selected reusable item, but a
   release pins the exact reusable item version, reach, locale, and renderer
   schema version.
4. The system compiles and validates the complete candidate release before one
   compare-and-swap activation of an immutable generation. A failed build
   leaves the prior public generation active.
5. The ordinary experience remains one Page editor and one **Publish** action.
   The UI reveals release machinery only when there are blockers or a shared
   change affects multiple pages.

This is materially simpler than a free-form placement graph and materially
safer than storing one mutable shared document ID in every public page.

## What current systems prove

### Payload: local blocks and relationships are different primitives

- **DOCUMENTED:** A Payload Blocks field stores an ordered array of objects
  inside its containing document. Blocks are typed by a code-defined `slug`,
  can be validated, and support minimum and maximum row counts. Source:
  [Payload Blocks Field](https://payloadcms.com/docs/fields/blocks).
- **DOCUMENTED:** Payload's `blockReferences` reuses a **block schema
  configuration** by slug across fields; it does not create a shared editorial
  content instance. Payload says this avoids repeating config and processing.
  Source:
  [Payload Blocks Field — Block References](https://payloadcms.com/docs/fields/blocks#block-references).
- **DOCUMENTED:** Actual document reuse uses relationship fields. Payload
  relationships can be one-way, can target more than one collection, can be
  indexed, and can cap population depth. Source:
  [Payload Relationship Field](https://payloadcms.com/docs/fields/relationship).
- **DOCUMENTED:** Recursive relationships can expand indefinitely; Payload
  documents that depth increases database work and response size. Its security
  guidance recommends the smallest workable maximum depth to reduce circular
  relationship and abusive-query risk. Sources:
  [Payload query depth](https://payloadcms.com/docs/queries/depth) and
  [Preventing Production API Abuse](https://payloadcms.com/docs/production/preventing-abuse).
- **DOCUMENTED:** Payload versions preserve document history and exact versions,
  while drafts allow a newer working copy to coexist with the published
  version. Source:
  [Payload Versions](https://payloadcms.com/docs/versions/overview).
- **DOCUMENTED:** Payload document locks are enabled by default in the Admin
  Panel, but Local and REST update/delete operations ignore those locks by
  default through `overrideLock: true`. Source:
  [Payload Document Locking](https://payloadcms.com/docs/admin/locked-documents).
- **DOCUMENTED:** Payload database changes can share an all-or-nothing
  transaction only when nested Local API/database operations receive the same
  request carrying the transaction identifier. Source:
  [Payload Transactions](https://payloadcms.com/docs/database/transactions).

**INFERRED:** Use Payload Blocks for Page-local values and a deliberately small
relationship to reusable content items. Do not misname `blockReferences` as
editorial reuse. Do not ask the public runtime to recursively populate a live
content graph. Compile exact versions into the public release projection.

### SiteStacker: content and public placement are separate

**DOCUMENTED:** SiteStacker's Content Explorer creates and organizes content;
its Site Plan publishes content into sites, folders, Pages, and page
placements. A Page can contain multiple placed content items, while menus,
wrappers, views, inherited items, and dynamic publication have separate
controls. Sources:
[Site Planner Overview](https://training.sitestacker.com/support/solutions/articles/151000113983-site-planner-overview),
[Site Plan](https://training.sitestacker.com/support/solutions/articles/151000101088-site-plan),
and
[Dynamic Content](https://training.sitestacker.com/support/solutions/articles/151000101243-dynamic-content).

**INFERRED:** Preserve SiteStacker's useful content-versus-public-placement
separation, but do not reproduce its full wrapper/view/inheritance vocabulary
or expose a SiteStacker-like graph to ordinary editors.

### Explicit reuse needs an explicit blast-radius experience

- **DOCUMENTED:** WordPress Synced Patterns update every use when the shared
  pattern changes. WordPress offers **Detach pattern** when an editor wants an
  independent local block; deleting the shared pattern leaves an unavailable
  marker at its former uses. Source:
  [WordPress Synced Patterns](https://wordpress.org/documentation/article/reusable-blocks/).
- **DOCUMENTED:** Webflow distinguishes a main component from its instances,
  exposes how many times a component is used, and allows controlled per-instance
  values through properties and slots. Its page-building mode limits editors
  to designer-approved components within Page slots. Sources:
  [Webflow Components](https://help.webflow.com/hc/en-us/articles/33961303934611-Components-overview)
  and
  [Webflow Page Building](https://help.webflow.com/hc/en-us/articles/33961210206483-Page-building).
- **DOCUMENTED:** HubSpot warns that a published menu change affects every Page
  or template using it and labels the action **Publish to [number] assets**.
  Source:
  [HubSpot site navigation menus](https://knowledge.hubspot.com/website-pages/set-up-your-site-s-navigation-menus).
- **DOCUMENTED:** Drupal's still-open core proposal for converting inline
  Layout Builder blocks into reusable blocks explicitly calls for a global
  impact warning. Its discussion records the access ambiguity created when a
  block originating on a draft Page becomes independently reusable. This is an
  issue record, not shipped core documentation, but it is primary evidence of
  the design hazard. Source:
  [Drupal core issue 2999491](https://www.drupal.org/project/drupal/issues/2999491).

**INFERRED:** A reused block needs a visible **Shared on N Pages** badge. Editing
from a Page should offer two plain choices: **Change every use** and **Make a
local copy on this Page**. The affected Page list and reach/locale consequences
must be available before publishing, not hidden in an audit log.

### A release must close over dependencies

- **DOCUMENTED:** Contentful links can become unresolvable when a linked entry
  or asset is unpublished; the Delivery API omits the target from `includes`
  and returns an `unresolvableLink` error. Linked retrieval is bounded to ten
  levels. Sources:
  [Contentful entry and asset links](https://www.contentful.com/developers/docs/concepts/links/)
  and
  [Content Delivery API links](https://www.contentful.com/developers/docs/references/content-delivery-api/links/).
- **DOCUMENTED:** Contentful's release UI validates every included entry and
  asset; one invalid entity prevents the whole release from publishing. It
  warns editors to add every required referenced entity. Referenced entities
  count toward the release limit, and unpublishing a top-level Page does not
  automatically unpublish its referenced entities. Source:
  [Contentful release setup](https://www.contentful.com/help/launch/create-manage-release/setting-up-a-release/).
- **DOCUMENTED:** Sanity Content Releases group and schedule multiple document
  versions, but large releases publish in batches and may have short delays
  between documents. A release is limited to 1,000 documents and 100 MB of JSON;
  simultaneous releases can be randomly ordered. Source:
  [Sanity Content Releases](https://www.sanity.io/docs/studio/content-releases).
- **DOCUMENTED:** Payload can wrap database writes in a transaction, but hooks
  must pass the same request to nested operations; an operation that does not
  receive it is outside that transaction. Sources:
  [Payload Transactions](https://payloadcms.com/docs/database/transactions) and
  [Payload Local API](https://payloadcms.com/docs/local-api/overview).

**INFERRED:** “One Site Plan release” should mean one immutable, complete
generation and one active-generation pointer, not a promise that many mutable
documents and caches change simultaneously. Compile first, reject a release
with missing/ineligible dependencies, then activate once. Retain the prior
generation for immediate safe fallback. Reverting creates another generation;
it does not mutate history.

### Nonprofit-site evidence reinforces typed binding

- **DOCUMENTED:** Neon One's website builder separates Page management from
  the navigation widget, supports explicit up/down reordering controls, and
  caps a site at 1,000 Pages. Sources:
  [Neon One Pages](https://support.neonone.com/hc/en-us/articles/9802657875725-Pages-and-Popups)
  and
  [Neon One Navigation Links](https://support.neonone.com/hc/en-us/articles/9832497489677-Widgets-Navigation-Links).
- **DOCUMENTED:** Neon One dynamic Pages reuse one design over collection rows,
  but changing collections can disconnect fields, converting a dynamic Page to
  a regular Page disconnects connected widgets, and a dynamic Page is not
  discoverable until navigation or a collection display exposes it. Source:
  [Neon One Dynamic Pages](https://support.neonone.com/hc/en-us/articles/9805414023949-Dynamic-Content-Dynamic-Pages).

**INFERRED:** A binding must record an allowed source type and renderer contract,
validate that required fields still exist, and fail visibly when the source is
no longer eligible. Page publication, navigation inclusion, and discovery are
separate facts even if Web Studio presents them together.

### Accessibility applies to the authoring tool as well as the public site

- **DOCUMENTED:** W3C ATAG covers both making CMS authoring interfaces
  accessible and helping authors produce accessible content. It calls for
  keyboard access to authoring features, accessible previews, structure-based
  navigation, and support for creating accessible output. Sources:
  [ATAG Overview](https://www.w3.org/WAI/standards-guidelines/atag/) and
  [ATAG at a Glance](https://www.w3.org/WAI/standards-guidelines/atag/glance/).
- **DOCUMENTED:** WCAG 2.2 Success Criterion 2.5.7 requires a non-dragging
  single-pointer alternative for drag operations. W3C's technique for ordered
  content lists gives move buttons or a destination control as examples.
  Sources:
  [Understanding Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)
  and
  [Technique G219](https://www.w3.org/WAI/WCAG22/Techniques/general/G219.html).
- **DOCUMENTED:** WAI's Tree View pattern defines expected focus, arrow-key,
  expand/collapse, Home/End, and type-ahead behavior and warns that selection
  and focus are distinct. Source:
  [WAI-ARIA Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/).

**INFERRED:** Drag and drop may be an enhancement, never the only way to add,
move, nest, or reorder Page blocks. Provide named move controls, predictable
focus restoration, keyboard-operable Page and block navigation, accessible
candidate preview, and authoring guidance for headings, links, media
alternatives, and reading order.

## Ruthless category-by-category review

Ratings use **Critical / High / Medium / Low** severity and **High / Medium /
Low** likelihood. Likelihood assumes ordinary multi-tenant use, not a hostile
or uniquely broken deployment.

### 1. Brittleness — Concern: Yes

- **What could go wrong:** A reusable item is deleted, unpublished, restricted,
  moved to another locale, or changed to an incompatible type after a Page
  references it. A live recursive query can return a partial Page or time out.
- **Why it matters:** Donors could see missing sections, an internally valid
  draft could fail only after release, or public output could vary between
  requests.
- **Severity / likelihood:** **High / Medium.** Contentful officially documents
  unresolved published links, and Payload documents recursive-depth costs:
  [Contentful links](https://www.contentful.com/developers/docs/concepts/links/)
  and [Payload depth](https://payloadcms.com/docs/queries/depth).
- **Permanent prevention:** Page-local by default; one reuse level; exact
  version pinning; type and reach checks; complete dependency closure before
  activation; prior generation retained.

### 2. Technical debt — Concern: Yes

- **What could go wrong:** Provider field shapes, block slugs, relationship
  population, renderer switches, and publication logic spread through the CMS,
  API, and public application. A Payload upgrade then becomes a coordinated
  rewrite.
- **Why it matters:** Every block type or provider change becomes slower and
  riskier, and developers may implement the same rules differently.
- **Severity / likelihood:** **High / High** without a boundary. Payload is a
  code-first schema system, and block types are stored by code-owned slug:
  [Payload Blocks Field](https://payloadcms.com/docs/fields/blocks).
- **Permanent prevention:** One small provider-neutral `PageComposition`
  contract, one code-owned typed block catalog, one release compiler, and one
  renderer schema version. Keep provider IDs and Payload response shapes behind
  an adapter.

### 3. Edge cases — Concern: Yes

- **What could go wrong:** The same item appears twice on one Page; a shared item
  is used across reach or locale boundaries; its asset is unavailable; an
  editor releases an older Page while another edits the shared item; a Page is
  empty; a shared item loses all uses; or two releases target the same base.
- **Why it matters:** These are ordinary editorial events, not exotic attacks,
  and ambiguity produces stale, duplicated, or unsafe output.
- **Severity / likelihood:** **High / High.** WordPress documents global updates,
  detachment, and deleted-use markers:
  [Synced Patterns](https://wordpress.org/documentation/article/reusable-blocks/).
- **Permanent prevention:** Stable IDs, exact versions, usage index, explicit
  zero-use state, duplicate policy per block type, locale/reach compatibility,
  compare-and-swap on the release base generation, and deterministic validation
  messages.

### 4. Footguns — Concern: Yes

- **What could go wrong:** An editor thinks they are editing one Page but changes
  every use; pasting a block silently creates a second shared reference; delete
  removes content still in use; or “Publish” omits a needed dependency.
- **Why it matters:** Shared-content blast radius is invisible until a public
  mistake is noticed.
- **Severity / likelihood:** **High / High.** WordPress and HubSpot both surface
  global impact in their documented workflows:
  [WordPress Synced Patterns](https://wordpress.org/documentation/article/reusable-blocks/)
  and
  [HubSpot navigation menus](https://knowledge.hubspot.com/website-pages/set-up-your-site-s-navigation-menus).
- **Permanent prevention:** Local insertion by default; shared badge and use
  count; **Change every use** versus **Make local copy**; protected deletion;
  automatic release closure; affected-Page preview. Never use a generic
  “Convert” toggle with hidden consequences.

### 5. Tenant safety — Concern: Yes

- **What could go wrong:** A relationship picker or Local API call can resolve a
  reusable item from another tenant/site. Payload Local API skips access checks
  by default.
- **Why it matters:** A shared content feature would become a cross-tenant data
  exposure path.
- **Severity / likelihood:** **Critical / Low to Medium** after normal controls;
  **High** without them. Source:
  [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control).
- **Permanent prevention:** Enforce tenant and site in database relationships
  and server commands, use `overrideAccess: false` with the current actor for
  user actions, validate every release dependency inside the same tenant/site,
  and expose only the compiled public projection.

### 6. Over-engineering — Concern: Yes

- **What could go wrong:** D1 grows into arbitrary nested reusable blocks,
  inheritance, per-block workflow, cross-site graphs, visual design freedom,
  or independent lifecycle state for every placement.
- **Why it matters:** Editors face a programming model and the team inherits a
  graph engine before proving the basic publishing workflow.
- **Severity / likelihood:** **High / Medium.** Payload and Contentful both allow
  deep relationships, while their docs also expose depth and release limits:
  [Payload depth](https://payloadcms.com/docs/queries/depth) and
  [Contentful release setup](https://www.contentful.com/help/launch/create-manage-release/setting-up-a-release/).
- **Permanent prevention:** One-level reuse, a small typed catalog, Page-local
  ordering, no arbitrary nesting or cross-site references, no per-placement
  workflow, and one release generation. Add another layer only from measured
  tenant demand.

### 7. UX/UI and user friction — Concern: Yes

- **What could go wrong:** Editors must understand Content Item, Placement,
  Page, dependency closure, and release mechanics for a simple text edit; shared
  status is indicated only by an icon; drag-only ordering excludes users.
- **Why it matters:** Complexity causes abandoned edits, accidental copies, and
  publication mistakes.
- **Severity / likelihood:** **High / High.** Webflow demonstrates constrained
  Page slots; W3C requires accessible authoring and non-drag alternatives:
  [Webflow Page Building](https://help.webflow.com/hc/en-us/articles/33961210206483-Page-building),
  [ATAG](https://www.w3.org/WAI/standards-guidelines/atag/), and
  [WCAG dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements).
- **Permanent prevention:** One Page editor; plain block labels and thumbnails;
  local default; text-labelled sharing state; inline preview; autosave; one
  ordinary Publish action; blocker-first release review; keyboard and button
  alternatives to drag; preserve focus after reorder.

### 8. Hidden coupling — Concern: Yes

- **What could go wrong:** Page tree position silently determines route,
  navigation, breadcrumbs, permissions, and reuse; renderer code depends on
  Payload internals; Phase 22 records are copied to make them fit blocks.
- **Why it matters:** Moving a Page or changing a provider schema triggers
  unrelated public changes and makes earlier phase ownership ambiguous.
- **Severity / likelihood:** **High / Medium.** SiteStacker and Neon One both
  document separate publication/navigation concepts:
  [SiteStacker Site Planner](https://training.sitestacker.com/support/solutions/articles/151000113983-site-planner-overview)
  and
  [Neon One dynamic Pages](https://support.neonone.com/hc/en-us/articles/9805414023949-Dynamic-Content-Dynamic-Pages).
- **Permanent prevention:** Stable Page identity; explicit route and navigation
  records; typed source-owned Phase 22 references; provider-neutral renderer
  schema; release compiler as the only composition boundary.

### 9. Failure modes — Concern: Yes

- **What could go wrong:** Validation passes but activation crashes; a worker
  retries half-completed work; cache nodes serve mixed document versions; a
  scheduled release never runs; a release points at a missing asset.
- **Why it matters:** “Published” can become a false success state.
- **Severity / likelihood:** **High / Medium.** Payload documents separate queue
  and worker steps, retry logs, and stuck/error states:
  [Payload Jobs Queue](https://payloadcms.com/docs/jobs-queue/overview) and
  [Payload Queues](https://payloadcms.com/docs/jobs-queue/queues).
- **Permanent prevention:** Build candidate generation idempotently; store
  outcome and cause; activate once by compare-and-swap; keep old generation
  readable; retries address the same release ID; scheduled time and completed
  release remain separate facts.

### 10. Data integrity — Concern: Yes

- **What could go wrong:** A release records mutable document IDs instead of
  versions, duplicate ordering keys race, stale editors overwrite newer work,
  or a block type is removed while stored instances remain.
- **Why it matters:** The same release ID could render different output or
  become impossible to reproduce.
- **Severity / likelihood:** **High / Medium.** Payload documents exact versions,
  transaction threading, and lock override defaults:
  [Versions](https://payloadcms.com/docs/versions/overview),
  [Transactions](https://payloadcms.com/docs/database/transactions), and
  [Document Locking](https://payloadcms.com/docs/admin/locked-documents).
- **Permanent prevention:** Immutable version references; unique deterministic
  Page ordering; optimistic concurrency/CAS; forward-compatible renderer for
  every released schema version; transactionally persist release manifest and
  active pointer.

### 11. Security and privacy — Concern: Yes

- **What could go wrong:** Reuse lowers a Phase 10 reach ceiling, a restricted
  Page is previewed through a public URL, draft content enters search, or a
  relationship response exposes deeper private fields.
- **Why it matters:** Shared content amplifies one publication mistake across
  many Pages.
- **Severity / likelihood:** **Critical / Medium** unless reach is resolved at
  release. Payload documents depth population and draft/public separation:
  [Payload depth](https://payloadcms.com/docs/queries/depth) and
  [Payload Drafts](https://payloadcms.com/docs/versions/drafts).
- **Permanent prevention:** Resolve the most restrictive Page/item/source reach
  at every placement; tenant- and actor-scoped preview; depth-zero public
  projection; no draft/search leakage; adverse restrictions invalidate or
  contain every affected Page before positive publication proceeds.

### 12. Scalability and performance — Concern: Yes

- **What could go wrong:** A widely reused item fans out to thousands of Pages,
  recursive population creates N+1 queries or oversized responses, and one
  release attempts an unbounded synchronous rebuild.
- **Why it matters:** A healthy shared edit can overload publishing and delay
  urgent restrictions.
- **Severity / likelihood:** **High / Medium.** Payload documents depth cost;
  Contentful and Sanity publish explicit release/dependency limits:
  [Payload depth](https://payloadcms.com/docs/queries/depth),
  [Contentful release limits](https://www.contentful.com/help/launch/create-manage-release/setting-up-a-release/),
  and
  [Sanity release limits](https://www.sanity.io/docs/studio/content-releases).
- **Permanent prevention:** Maintain a bounded usage index; compute impact
  asynchronously in chunks; deduplicate by content/version hash; cap Page and
  block counts; compile flat public projections; activate only after the full
  generation is ready. Adverse containment gets a priority path.

### 13. Operational burden — Concern: Yes

- **What could go wrong:** Staff manually build dependency lists, create a named
  release for every typo, or need developer help to repair dangling reuse.
- **Why it matters:** The safe workflow will be bypassed if ordinary publishing
  feels ceremonial.
- **Severity / likelihood:** **Medium / High.** Contentful tells editors to add
  every referenced entity to a release, illustrating the burden Asym should
  automate:
  [Contentful release setup](https://www.contentful.com/help/launch/create-manage-release/setting-up-a-release/).
- **Permanent prevention:** Auto-build dependency closure and impact. A one-Page
  change is one-click Publish backed by a release; a multi-Page shared change
  shows one concise consequence review. Cause-owned repair actions replace
  manual graph maintenance.

### 14. Observability gaps — Concern: Yes

- **What could go wrong:** Logs say a CMS document published while the public
  generation, route, search entry, or cache is stale; support cannot identify
  which shared item affected a Page.
- **Why it matters:** Failures become donor reports instead of actionable staff
  exceptions.
- **Severity / likelihood:** **High / Medium.** Payload jobs expose completion,
  attempts, task status, and failure logs, showing the minimum raw evidence
  available:
  [Payload Jobs](https://payloadcms.com/docs/jobs-queue/jobs).
- **Permanent prevention:** Carry release generation ID through compiler,
  runtime, search, redirects, logs, and support UI; record exact dependency and
  Page counts; expose cause-owned blockers; monitor generation freshness and
  stale/missing projections without logging private content.

### 15. Dependency and integration risks — Concern: Yes

- **What could go wrong:** D1 depends on an internal/canary Payload behavior,
  confuses `blockReferences` with reusable content, or relies on future core
  hierarchy semantics. A provider upgrade changes stored shapes or Admin UI.
- **Why it matters:** A foundational domain decision becomes hostage to an
  unqualified provider version.
- **Severity / likelihood:** **High / High.** The live registry still marks
  `3.88.0` as `latest` and v4 as canary/internal; Payload calls v4 an early look
  with active hierarchy work. Sources:
  [official npm registry](https://registry.npmjs.org/payload) and
  [Payload 4 announcement](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more).
- **Permanent prevention:** Ratify provider-neutral D1 semantics; qualify one
  exact synchronized Payload package cohort; contract-test adapter, stored
  schema, access, migration, admin, and rollback; do not expose provider release
  or hierarchy IDs publicly.

### 16. Migration and upgrade risks — Concern: Yes

- **What could go wrong:** SiteStacker placements are mistaken for copies,
  wrapper/view behavior is lost, two source items collapse into one shared item,
  or a Payload block slug/schema change makes history unreadable. Neon One
  documents source-switch disconnections as a comparable failure.
- **Why it matters:** Migration can silently change public meaning even when all
  text appears present.
- **Severity / likelihood:** **High / High** for existing tenants. Sources:
  [SiteStacker Site Planner](https://training.sitestacker.com/support/solutions/articles/151000113983-site-planner-overview),
  [Neon One Dynamic Pages](https://support.neonone.com/hc/en-us/articles/9805414023949-Dynamic-Content-Dynamic-Pages),
  and
  [Payload Blocks Field](https://payloadcms.com/docs/fields/blocks).
- **Permanent prevention:** Non-authoritative staging; stable source IDs and
  provenance; explicit copy-versus-reference disposition; typed unknown-item
  quarantine; source/target coverage manifest; route and redirect proof;
  renderer/schema migrations that preserve old release readability.

### 17. Other development hazards — Concern: Yes

- **What could go wrong:** Two publishers race, hook recursion creates duplicate
  releases, a retry sends duplicate invalidations, a non-awaited side effect is
  lost, or tests assert provider rows instead of public behavior.
- **Why it matters:** These defects are intermittent and expensive to reproduce.
- **Severity / likelihood:** **High / Medium.** Payload warns that hook-triggered
  self-updates can recurse and that non-awaited hook work may continue after a
  request completes. Sources:
  [Payload Hook Context](https://payloadcms.com/docs/hooks/context) and
  [Payload Hooks Overview](https://payloadcms.com/docs/hooks/overview).
- **Permanent prevention:** Release idempotency key; base-generation CAS;
  transactionally queued outbox/job; no fire-and-forget release effects;
  property tests for closure/cycles/order; concurrency tests; contract tests at
  the public projection seam; keyboard and screen-reader interaction tests.

## Hardened D1 formulation recommended for founder consideration

> **C-prime-amended-and-hardened (C-prime-R) — Page-local typed composition
> with explicit, one-level reusable content under one immutable Site Plan
> release generation:** ordinary editing stores bounded typed blocks on the
> Page; **Reuse existing** deliberately references an independently versioned,
> same-tenant and same-site eligible content item, visibly labelled with its
> usage count and with plain **Change every use** or **Make a local copy**
> choices. Drafts may remain independently editable, but each candidate release
> automatically closes over the exact Page, reusable-content, asset,
> source-owned dynamic, locale, reach, route, renderer-schema, and navigation
> versions it needs; validates type, availability, tenant/site, Phase 10 reach,
> cycle, collision, and completeness; compiles flat public projections; and
> activates one complete generation by idempotent compare-and-swap while the
> previous generation remains safe to serve. One ordinary Page change still
> feels like one Page editor and one Publish action; shared or structural impact
> opens one accessible, blocker-first consequence review with affected-Page
> previews and keyboard/button alternatives to drag. No nested reusable items,
> live “latest” public references, arbitrary placement graph, per-block
> workflow, manual dependency census, provider-shaped public API, raw Payload
> population, silent detach/delete, partial multi-document publication, or
> claim that saved, scheduled, compiled, activated, cached, searchable, and
> publicly visible are the same fact.

## Minimum proof before shipping D1

1. A local edit affects exactly one Page; a shared edit lists and previews every
   affected Page before release.
2. **Make a local copy** preserves content but removes future shared impact;
   deleting an in-use shared item is blocked or explicitly replaced.
3. A release with a missing, draft-only, wrong-tenant, wrong-site,
   wrong-locale, incompatible, cyclic, or reach-ineligible dependency cannot
   activate and cannot disturb the current generation.
4. Concurrent releases against one base yield one winner and one clear stale
   result; retrying the winner is idempotent.
5. Public reads return only the exact active generation and do not recursively
   query Payload relationships.
6. Page/block reordering works with keyboard and named controls without drag;
   focus, announcements, preview, and error navigation are verified manually
   and with automated accessibility checks.
7. A high-fanout shared change compiles within an explicit capacity target,
   remains observable by release ID, and does not delay adverse containment.
8. A SiteStacker import proves every source item as local copy, explicit shared
   reference, owning-phase dynamic reference, redirect, intentional exclusion,
   or quarantined unknown—never silent conversion.

## Non-decisions

- This evidence does not choose the final block catalog, visual style controls,
  Page families, route rules, navigation model, locale release policy, review
  policy, cache topology, or scheduling UX.
- It does not approve Payload v4, nested-docs, a page-builder plugin, or any
  provider's release implementation.
- It does not move Phase 22 missionary/project truth into Phase 23 content or
  weaken Phase 10 publication reach.
- It does not require a graph database, event sourcing, a version row for every
  local block, or a separate staff workflow for ordinary Page edits.
