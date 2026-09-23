# Phase 23 D4 Navigation and Publication — Research Evidence

**Status:** Supporting research for founder-ratified Phase 23 D4 C-prime-R  
**Date:** 2026-08-15  
**Authority:** Evidence only; D4 authority is recorded in the Phase 23 decision
log and ADR-0148. This document does not create a PRD, authorize
implementation, select a provider, or change production behavior.

## Decision seam

Founder-ratified D1 makes Navigation independently versioned presentation
structure that references stable Pages and activates only through an immutable
Public Site Generation. D2 makes the Page tree authoritative for ordinary Page
hierarchy, canonical paths, and breadcrumbs, while explicitly prohibiting a
tree move from silently moving a menu item. D3 preserves former ordinary Page
addresses without turning redirects into a staff-managed rules product.

The next founder decision is therefore:

> How closely should a Site's curated menus follow its Page tree, which item
> types should staff be allowed to add, and how should related Page and menu
> drafts become public without broken links or extra publishing work?

This decision must preserve D1–D3. It must not recreate Page hierarchy, route
continuity, or Phase 22 Public Ministry Page authority inside Navigation.

## Architecture verdict

**C-prime is architecturally sound and aligned with current CMS practice, but
the first formulation needs bounded amendments before ratification.** Its core
choices are the right ones:

- curate menus separately from the Page tree;
- use stable references for internal destinations;
- help editors from the Page workspace without making the Page own menu state;
- draft and preview Navigation independently; and
- make related Page and Navigation changes public through D1's one coherent
  Public Site Generation.

That is not needless custom machinery. D1 already requires an immutable
generation that closes over independently versioned presentation inputs.
Navigation is one of those inputs. A second Navigation publication system
would be debt; selecting an exact Navigation Revision inside the existing D1
generation is not.

The review found six changes needed to prevent future debt:

1. **Reuse one provider-neutral semantic revision contract and D1 release
   compiler.** “Navigation Revision” means the immutable semantic snapshot D1
   selects; it does not mandate a new event store, revision database, or second
   copy of Payload history. Do not build a bespoke menu publish head or menu
   release orchestrator alongside Page revisions and Payload Versions.
2. **Make Page-aware assistance a command into Navigation, not synchronization.**
   The Page screen may derive where a Page is used and invoke the same
   Navigation-draft command as the Navigation screen. It must not store a
   `showInMenu` field, duplicate menu placement on the Page, or rely on hooks to
   keep two records aligned.
3. **Distinguish managed internal destinations from arbitrary URLs.** Ordinary
   and source-owned public Pages use stable Page references. The next decision
   must define any other bounded destination types rather than letting editors
   represent a managed internal route as an “external” raw URL.
4. **Keep purposes, item behavior, and depth bounded without deciding them
   here.** D5 should select the smallest useful purpose catalog, item type
   catalog, and nesting contract. D4 must not pre-empt that decision or permit a
   tenant-defined menu schema, arbitrary CSS, per-item workflow, audience
   expressions, or unbounded recursive composition.
5. **Compile a bounded public projection.** Resolve and validate target closure
   at preview/release time, then serve the projection selected by the active D1
   generation. Do not recursively query Payload relationships on each public
   request.
6. **Use ordinary optimistic concurrency, not collaborative-editor machinery.**
   Expected-revision checks, Payload document locking where exact-version tests
   prove it, retained drafts, and a clear stale-edit comparison are sufficient.
   CRDTs, operational transforms, and per-item branches are unjustified for
   nonprofit menu editing.

With those amendments, the architecture has one owner per fact, one release
authority, predictable migration seams, and no unusual long-term maintenance
burden.

## Current repository evidence

- The current
  [`navigation.ts`](../../../apps/admin/src/cms/collections/navigation.ts)
  is one tenant-scoped Payload collection with `versions: false`, one label,
  and one flat array of raw `href`, label, and `openInNewTab` values. It has no
  environment, Site, locale, purpose, stable Page relationship, nested
  structure, draft lineage, or D1 release binding.
- The current public reader in
  [`published-content-reader.ts`](../../../apps/admin/src/cms/public/published-content-reader.ts)
  asks for the newest readable Navigation document by `updatedAt`. That is not
  an exact Navigation Revision selected by the active D1 Public Site
  Generation.
- The current serializer in
  [`serializer.ts`](../../../packages/api/src/cms/public/serializer.ts)
  allowlists output fields and rejects unsafe URL schemes through
  `sanitizePublicCmsHref`. This is a useful safety seam, but sanitizing a raw
  string does not give an internal link stable Page identity, prove the target
  is released and safe, or coordinate Page and Navigation publication.
- Current Web Studio describes Navigation as a tenant-scoped array of link
  items. The native collection wrapper improves shell consistency but does not
  change the underlying flat, unversioned product semantics.
- The donor-facing
  [`navbar.tsx`](../../../packages/ui/components/public/navbar.tsx) still reads
  `siteConfig.nav.main`, while
  [`footer.tsx`](../../../packages/ui/components/public/footer.tsx) hard-codes
  separate link sections and
  [`site-shared.ts`](../../../packages/config/site-shared.ts) contains another
  static Navigation definition. Current CMS rows, static configuration, and
  hard-coded chrome are therefore migration inputs and competing presentation
  truths; none may survive as a fallback authority after D1 cutover.
- The current public tenant resolver in
  [`resolve-tenant.ts`](../../../apps/admin/src/cms/public/resolve-tenant.ts)
  returns `siteId: null`, while the accepted Phase 2 foundation requires
  Navigation to carry non-null Site scope. That missing Site/locale substrate
  is a genuine implementation blocker for safe D4 delivery, not a reason to
  weaken D4 to tenant-only identity or let the picker act as authorization.
- The repository pins Payload and its first-party packages to
  `4.0.0-internal.1f9ae9a`. Phase 23 cannot treat newer public documentation or
  a canary feature as production-qualified behavior without an adapter and
  exact-version proof. The repository's vendored Payload mirror is deliberately
  still `v3.77.0`, is not imported at runtime, and therefore also cannot prove
  the internal v4 package behavior.
  [Payload vendor and upgrade policy](../../vendor/payload.md)

The current Navigation collection is therefore a migration input, not the D4
authority to preserve unchanged.

## Payload v4 capabilities and limits

### What Payload can provide

- Payload documents Globals as a common way to store singleton header
  navigation and demonstrates an array of relationship fields pointing to
  Pages. A Collection is available when more than one Navigation document is
  needed.
  [Payload Global Configs](https://payloadcms.com/docs/configuration/globals)
- Relationship fields store document references and can be restricted to one
  or more configured collections. This is the appropriate provider primitive
  for an internal Page target; a raw URL is not.
  [Payload Relationship Field](https://payloadcms.com/docs/fields/relationship)
- Collections and Globals can enable Versions and Drafts. Payload then keeps a
  published document while newer draft versions remain unpublished, and its
  Admin surfaces Draft, Published, and Changed states.
  [Payload Drafts](https://payloadcms.com/docs/versions/drafts),
  [Payload Versions](https://payloadcms.com/docs/versions/overview)
- Payload supports field-level localization, including localized arrays and
  blocks. Locale-specific draft status is currently an opt-in beta feature,
  however, and fallback is enabled by default unless deliberately disabled.
  D4 must not infer exact-locale release truth from current public docs or a
  default Payload fallback.
  [Payload Localization](https://payloadcms.com/docs/configuration/localization)
- Payload's multi-tenant plugin can add a Tenant field to configured
  Collections and offers a collection-as-tenant-global mode. Its own frontend
  example still supplies an explicit Tenant query and `overrideAccess: false`.
  [Payload Multi-Tenant Plugin](https://payloadcms.com/docs/plugins/multi-tenant)

### What Payload does not provide

- The current official Payload website template models Header and Footer as
  separate Globals with at most six items each. Each item chooses an internal
  Page/Post relationship or a custom URL and may request a new tab. Both
  Globals have `versions: false`. This is an illustrative starting point, not
  a versioned, multi-Tenant, multi-Site, locale-exact, coherent publication
  product.
  [current Header source](https://github.com/payloadcms/payload/blob/main/templates/website/src/Header/config.ts),
  [current Footer source](https://github.com/payloadcms/payload/blob/main/templates/website/src/Footer/config.ts),
  [current link field](https://github.com/payloadcms/payload/blob/main/templates/website/src/fields/link.ts)
- Payload does not automatically prove that an internal target belongs to the
  same Asym Tenant, environment, Site, and locale; is included in the intended
  D1 generation; satisfies Phase 10/22 public reach; or will not disappear
  after an independently published change.
- Payload Drafts version one document. They do not atomically release an exact
  Page revision, its Page Placement, a Navigation Revision, and D3 route
  continuity as one D1 generation.
- A Payload Global is one provider singleton. Using one directly as “the
  header” would hide the required Tenant × environment × Site × locale scope.
  The multi-tenant plugin can emulate one Navigation record per Tenant, but it
  still does not supply Site, locale, purpose, release, or source-family
  eligibility semantics.
- Local API calls bypass access control by default. Any user-scoped operation
  must pass the user and `overrideAccess: false`; public delivery should consume
  the active compiled projection rather than raw Payload documents.
  [Payload Local API Access Control](https://payloadcms.com/docs/local-api/access-control)
- Current Payload Local API documentation also says document locks are ignored
  by default unless `overrideLock: false` is supplied. A Page-aware edit command
  cannot claim concurrency safety merely because the Admin UI displays a lock.
  [Payload Local API](https://payloadcms.com/docs/local-api/overview)

**Provider conclusion:** Payload is capable of persisting Navigation fields,
relationships, drafts, and versions. It should not determine Navigation
purpose, target eligibility, Site/locale scope, release coherence, or public
serving authority.

## Current official CMS benchmark findings

### Structured internal references are the modern baseline

- Sanity's current navigation guidance recommends a lightweight structured
  Navigation document with separate internal and external link types. It
  explicitly recommends references for internal documents so a Page slug
  change does not break the link, advises modeling content rather than the
  current visual implementation, and says to start simple.
  [Sanity scalable navigation patterns](https://www.sanity.io/docs/developer-guides/navigation-with-sanity)
- Contentful documents a dedicated Navigation content type as a way to support
  multiple menus and explicitly notes that navigation may represent, but need
  not equal, the content hierarchy. Its entry-link model uses stable IDs and
  content-type validation rather than copied URLs.
  [Contentful navigation modeling](https://www.contentful.com/help/modeling-navigation/),
  [Contentful entry links](https://www.contentful.com/developers/docs/concepts/links/)
- Drupal lets an editor deliberately add a Page to a chosen menu with a
  menu-specific title, menu parent, and order. That demonstrates a useful
  relationship between Page editing and menu membership without making Page
  hierarchy and menu hierarchy the same fact.
  [Drupal: Adding a Page to Navigation](https://www.drupal.org/docs/user_guide/en/menu-link-from-content.html)
- WordPress supports named Navigation menus that are separately curated from
  Pages, internal and custom links, submenus, and both drag controls and named
  move controls. It also offers a Page List block when automatic listing is
  actually wanted. This is evidence that curated and derived navigation are
  different authoring needs, not one universal model.
  [WordPress Navigation block](https://wordpress.org/documentation/article/navigation-block/),
  [WordPress Page List block](https://wordpress.org/documentation/article/page-list-block/)
- Storyblok's current Link field is a bounded typed destination picker for a
  website, internal story, asset, or email and can restrict internal links to
  selected content types or folders. Its authoring guidance separately treats
  a Release as a group of content changes and reports save conflicts when two
  editors change the same document. These are useful corroborating patterns:
  typed destinations, grouped publication, and visible concurrency conflicts
  rather than raw-string links and last-write-wins.
  [Storyblok fields](https://www.storyblok.com/docs/concepts/fields.html),
  [Storyblok content authoring](https://www.storyblok.com/docs/manuals/content-authoring)

### Draft and release coherence is a product responsibility

- Payload Drafts correctly keep a newer menu document private, but do not
  coordinate it with referenced Page drafts.
- Drupal's current Content Moderation guidance distinguishes the live version
  from a newer working copy. That same mental model is valuable for Navigation:
  staff must be able to edit the next menu while the current menu keeps serving.
  [Drupal Content Moderation](https://www.drupal.org/docs/8/core/modules/content-moderation/overview)
- No reviewed CMS primitive proves Asym's exact Page + Navigation + route
  closure. D1's generation must remain that authority.

### What the benchmarks do and do not prove

The sources consistently support **separate curated navigation plus typed
references**. They do not prove that copying any provider's menu schema will
meet Asym's contract. Contentful explicitly documents that an unpublished
linked entry can become unresolvable; Payload drafts version one document at a
time; Storyblok's grouped Releases are provider product behavior; and
WordPress can create and publish an empty Page from the Navigation editor.
Those behaviors may be reasonable for their products, but Asym must preserve
D1's exact dependency closure, Phase 10/22 reach, and existing live generation
when a candidate is unsafe.

## Accessibility and public navigation findings

- W3C recommends navigation menus whose markup reflects their structure and
  whose current state is identifiable. Descriptive link labels help screen
  reader, keyboard, and cognitive users understand destinations.
  [WAI Menus Tutorial](https://www.w3.org/WAI/tutorials/menus/),
  [WCAG Link Purpose](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)
- WAI cautions that the ARIA `menubar` pattern has complex application-style
  keyboard behavior unnecessary for most public websites; ordinary semantic
  navigation with disclosure buttons is usually the better public pattern.
  [WAI Navigation Menubar caution](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/)
- Dragging cannot be the only way to reorder or nest menu items. WCAG 2.2
  requires a single-pointer alternative, while keyboard requirements apply
  independently. The editor should provide named Move up, Move down, Move into
  group, and Move out actions.
  [WCAG Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html),
  [WCAG Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- Opening a new tab should not be the default. WAI recommends doing it only
  when necessary and warning users in advance when it is used.
  [WAI G200](https://www.w3.org/WAI/WCAG22/Techniques/general/G200.html),
  [WAI G201](https://www.w3.org/WAI/WCAG22/Techniques/general/G201.html)

## Founder-level options

### Option A — Page tree is the menu

Every eligible Page automatically appears in Navigation in Page-tree order.
Staff may optionally hide a Page or change its label.

**Advantages**

- least initial setup;
- Page creation can appear immediately in navigation; and
- one hierarchy is easy to explain on very small Sites.

**Material drawbacks**

- moving a Page for URL or breadcrumb reasons silently changes visitor
  navigation;
- utility Pages, campaigns, legal links, footer links, and curated donor paths
  rarely match the content tree;
- “hide from menu” becomes a second implicit menu model scattered across Pages;
- multiple menus require increasing numbers of Page-level toggles and ordering
  fields; and
- this directly weakens D1–D2's ratified separation of hierarchy and
  Navigation.

**Assessment:** Reject as the general Phase 23 model. A derived Page list can
remain a future typed component for a specific use, but it should not own the
Site's curated Navigation.

### Option B — Fully independent manual menus with independent publication

Menus are separate documents. Every target, label, order, and release is
managed independently from Pages.

**Advantages**

- maximum editorial freedom;
- Page moves never change menu membership or order; and
- multiple menus are straightforward.

**Material drawbacks**

- staff copy work that the system already knows;
- raw URLs break when Pages move unless editors remember to repair them;
- separate Page and menu publication can expose a link before its target or
  remove the target while the old link remains; and
- routine publication requires too much coordination for nonprofit staff.

**Assessment:** Better separation than A, but insufficient without stable Page
references and D1 dependency-aware release.

### Option C-prime-amended-and-hardened (C-prime-R) — Curated Navigation Revisions with Page-aware assistance under D1

Navigation and the Page tree remain separate. For one exact Tenant ×
environment × Site × locale, each later-approved Navigation purpose has one
stable identity and provider-neutral immutable semantic revisions. A
“Navigation Revision” is the exact semantic snapshot D1 selects; Payload may
store its private authoring history and the D1 compiler may materialize the
snapshot without requiring a new revision database or event store.

The structure is bounded and typed, and internal Page destinations use stable
references to eligible ordinary or source-owned public Page projections. **D5,
not D4, owns the exact purpose catalog, item type catalog, destination kinds,
and nesting depth.** D4 only requires that those later choices remain
structurally validated and do not become scripts, dynamic queries, arbitrary
markup, tenant-defined schemas, per-item workflow/audience expressions,
presentation CSS, or unbounded recursion.

Navigation owns menu membership, the menu-specific label, purpose, grouping,
and order. Page hierarchy owns canonical path and breadcrumbs. When an editor
adds a Page, Web Studio may seed the menu label from the Page title, but the
saved label becomes explicit Navigation copy. A later Page-title change never
silently rewrites visitor navigation; the editor may deliberately reset the
label to the current title.

The Page workspace obtains `Shown in Main navigation` and similar summaries
from a derived reference lookup. **Add to navigation** and **Edit navigation
placement** invoke the same authorized Navigation application command as the
Navigation workspace, with the exact Navigation identity and expected base
revision. There is no `showInMenu` Page field, stored reverse-placement list,
after-save hook cascade, or second write path.

Internal Page items resolve the released path from their stable reference in
the candidate D1 generation. A Page move therefore preserves Navigation
without changing menu position or label. The safety and presentation behavior
of any other D5-approved destination kind remains owned by that typed contract,
not by an unvalidated raw-string fallback.

Visibility is intentionally simple: an item is present in the selected
Navigation Revision or it is not, and its target must independently remain
eligible for the exact public context. D4 adds no mutable `visible` switch,
item publication status, audience formula, permission-group condition, or
per-item date window. A later schedule may select one prepared D1 generation;
it must not turn every item into a workflow record.

Locale binding follows D1 and remains subordinate to Phase 24. D4 requires an
exact locale-qualified candidate and disables accidental provider fallback
during proof; it does not yet decide whether staff edit separate locale
revisions, copy a structure, or use another Phase 24-approved authoring aid.

Saving changes only private authoring state. Payload Versions, Drafts,
relationships, field validation, and document locks may implement that state
after exact-pin qualification, but they are adapter primitives rather than
public truth. Preview compiles the exact candidate. Publish validates the
complete dependency closure and selects the exact Navigation Revision only
inside one successor D1 Public Site Generation. There is no independently
advancing Navigation serving head.

The public runtime reads a bounded, pre-resolved Navigation projection keyed by
the active D1 generation. It does not read the latest Payload document, follow
recursive provider relationships, or calculate menu eligibility with request-
time N+1 queries.

An ordinary planned Page retirement or unpublish must remove or deliberately
replace its Navigation references in the same successor generation. A current
Phase 10/22 adverse safety withdrawal suppresses the unsafe item through the
source-owned adverse projection without waiting for ordinary positive
publication. History remains immutable; repair and rollback are forward
successor generations.

**Advantages**

- matches the modern CMS pattern of curated Navigation plus typed references;
- uses D1's existing revision and release machinery instead of creating a
  second publication platform;
- gives staff Page-context shortcuts without dual ownership or hook coupling;
- keeps routine Page moves maintenance-free and labels editorially stable;
- prevents draft links and raw same-Site URL debt; and
- keeps public request work bounded and provider-independent.

**Proportionate cost**

- requires a provider-neutral Navigation contract, one application command,
  one derived usage query, candidate dependency validation, and a compiled
  projection. Those are necessary seams for the already-ratified D1 contract,
  not speculative infrastructure.

**Assessment:** Recommend C-prime-R, not the unamended C-prime. It is the
smallest architecture that preserves staff flexibility, stable internal links,
coherent public truth, and long-term provider portability without turning menu
editing into a rules engine.

## Recommended staff experience

The `Main navigation` and `Footer links` names below are concrete UX examples,
not D4 catalog decisions; D5 owns the exact purposes, item kinds, and depth.

### From a Page

The Page workspace shows a quiet **Navigation** summary:

- `Shown in Main navigation` or `Not in navigation`;
- exact menu label and location when present; and
- **Add to navigation** or **Edit navigation placement** when the actor has
  authority.

This is a contextual shortcut into the Navigation draft, not a Page-owned
membership field. Moving a Page in the Site Plan says:

> Its public address will change. Its positions in Main navigation and Footer
> links will stay the same.

### From Navigation

The default screen is an exact previewable list, not a database table:

```text
Main navigation                         Draft changes

Home
About                                  Page · /about
Get involved                           Group
  Serve                                Page · /serve
  Give                                 Page · /give       Button
Partner resources                      External · partner.example.org

[Add item]                                      [Preview] [Publish]
```

- **Add item** first asks **Page**, **External link**, or **Group heading**.
- **Page** opens a same-Site, same-locale searchable picker showing title,
  public address, Page family, and `Public`, `Included with this publish`, or
  an exact blocker.
- **External link** shows the parsed destination and rejects unsupported or
  malformed schemes inline.
- Dragging is optional. Each row also exposes **Move up**, **Move down**,
  **Move into group**, and **Move out**.
- **Preview** uses the real public renderer, exact Site, locale, menu purpose,
  responsive presentation, and candidate generation.
- The normal Publish review shows only consequences and blockers, not version
  IDs or generation machinery.

Suggested messages:

> **Navigation draft saved. Your public Site has not changed.**

> **This Page is not public yet. Publish it with this navigation change, or
> choose another Page.**

> **This Page is managed in Public Ministry Pages and cannot be shown to this
> audience.**

> **Nothing was published. Your current navigation is still live.**

> **Published. Main navigation and the related Page are now live together.**

## Concrete nonprofit scenario

Hope Mission has an English Site with Main navigation and Footer links. A staff
member drafts a new ordinary Page, **Short-Term Teams**, under
`/serve/short-term-teams`, then adds that Page beneath **Get involved** in Main
navigation. The Page is not currently public.

With Option C-prime-R:

1. The menu picker identifies the Page as `Included with this publish` rather
   than producing a broken public link.
2. Preview shows the candidate Page and the candidate desktop and mobile
   Navigation together.
3. One Publish action proves the Page, its placement, route continuity,
   Navigation Revision, permissions, and Phase 10 reach, then advances the D1
   serving head once.
4. A later move to `/go/short-term-teams` changes no menu item or menu order;
   the stable Page reference resolves the new path and D3 protects the former
   path.
5. If a safety owner later withdraws the Page, the public Navigation item is
   suppressed immediately. The authored revision and audit history remain,
   while Web Studio identifies the source owner and repair needed.

The staff member never copies a URL, coordinates two independent publishes,
edits an HTTP rule, or sees provider terminology.

## Ruthless 17-category adversarial review of C-prime-R

The ratings describe the risk if the design were implemented without the named
control. They are deliberately proportionate: a high-severity tenant leak can
still have low likelihood, while common editor friction can be medium severity
and high likelihood.

### 1. Brittleness

**Concern: Yes.**

- **What could go wrong:** Internal items could depend on mutable slugs, the
  newest Payload row, provider population depth, or a Page-save hook. A Page
  move, locale change, provider upgrade, or skipped hook would then break or
  silently stale Navigation.
- **Why it matters:** Navigation is repeated across the public Site; one fragile
  assumption affects nearly every visitor and every Page.
- **Severity:** High.
- **Likelihood:** Medium in the unrefined design; low after the controls below.
- **Permanent fix:** Store stable typed destination references, resolve them in
  the D1 candidate compiler, pin the compiled result to one generation, and
  make Page assistance call the ordinary Navigation command. Contract-test the
  provider adapter at the exact installed Payload pin. Never serve provider
  `latest`, slugs stored in menu items, or hook-maintained copies.

### 2. Technical debt

**Concern: Yes; the original C-prime could create debt if interpreted as a
second versioning and publication platform.**

- **What could go wrong:** Teams could implement Payload Versions, a custom
  Navigation Revision table, and a separate menu publish status as three
  overlapping histories. Page and Navigation screens could also grow separate
  mutation logic.
- **Why it matters:** Duplicate lifecycle machinery produces divergent state,
  harder migrations, and permanent maintenance cost.
- **Severity:** High.
- **Likelihood:** High without an explicit boundary.
- **Permanent fix:** Use the common provider-neutral revision envelope and D1
  generation compiler for all independently versioned presentation inputs.
  Payload Versions are an authoring adapter, not a second domain release. Both
  screens call one application command. Keep each bounded purpose revision as
  one document-sized immutable aggregate with stable item IDs unless measured
  production limits later prove normalization necessary; do not prematurely
  build a general graph editor.

### 3. Edge cases

**Concern: Yes.**

- **What could go wrong:** A menu can reference a Page being published in the
  same candidate, a Page missing in one locale, a disabled Site action, a Page
  being retired, a Phase 22 Page whose reach narrows, the same Page in multiple
  purposes, or an external destination that is syntactically valid but no
  longer reachable.
- **Why it matters:** These are normal editorial situations, not theoretical
  anomalies; mishandling them causes dead ends or safety leaks.
- **Severity:** High for unsafe/cross-scope targets; Medium for ordinary dead
  links.
- **Likelihood:** Medium.
- **Permanent fix:** Validate target kind, exact scope, locale, candidate
  inclusion, lifecycle, and source-owned public reach against the complete D1
  candidate. Treat external reachability as a diagnostic, not a publication
  guarantee. Add explicit tests for same-generation creation, move,
  retirement, adverse withdrawal, repeated use, missing locale, and disabled
  capability.

### 4. Footguns

**Concern: Yes.**

- **What could go wrong:** Staff or developers could paste a same-Site URL into
  the external lane, publish a menu item before its Page, enable a surprising
  new tab, reorder only by drag, query draft data publicly, or use
  `overrideAccess: true` / ignored locks in a user-scoped Local API call.
- **Why it matters:** Each is an easy, plausible action with a public or
  security consequence.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Recognize and reject managed same-Site raw destinations;
  provide the bounded typed destination pickers approved by D5; publish only
  through D1 closure; offer named move controls; and require user context,
  `overrideAccess: false`, exact scope checks, and concurrency enforcement on
  every user mutation path. If D5 permits external or new-context destinations,
  it must separately define safe parsing and accessible disclosure.

### 5. Tenant safety

**Concern: Yes.**

- **What could go wrong:** A relationship picker filter could be mistaken for
  authorization, while a crafted API call stores another Tenant's Page ID or a
  public query resolves a destination using the wrong Site or locale.
- **Why it matters:** Cross-Tenant content disclosure or navigation is a severe
  trust failure.
- **Severity:** High.
- **Likelihood:** Low after structural controls; Medium if UI filtering is the
  only defense.
- **Permanent fix:** Scope Navigation identity and target resolution to exact
  Tenant × environment × Site × locale, enforce actor authorization and
  structural/database constraints, re-prove scope during D1 compilation, and
  expose only the compiled public projection. Relationship `filterOptions` is
  usability help, not the security boundary.

### 6. Over-engineering

**Concern: Yes.**

- **What could go wrong:** A reasonable menu editor could become a general
  recursive graph, mega-menu builder, audience rule engine, workflow matrix,
  tenant schema designer, CRDT collaboration system, and presentation editor.
- **Why it matters:** That complexity would slow delivery and make common
  nonprofit Sites harder to operate.
- **Severity:** Medium.
- **Likelihood:** Medium because Navigation products attract incremental
  exceptions.
- **Permanent fix:** Have D5 choose the smallest code-owned purpose catalog,
  item vocabulary, and bounded depth supported by observed needs; keep one
  revision-level workflow, ordinary optimistic concurrency, and
  presentation-owned rendering. Add new typed capability only from observed
  demand through a versioned catalog change.

### 7. UX/UI and user friction

**Concern: Yes.**

- **What could go wrong:** Staff could face separate Page and menu publishing
  chores, unclear Draft versus Live state, provider jargon, drag-only ordering,
  an unexplained label that no longer matches its Page, or a desktop preview
  that hides mobile failure. Errors discovered only after Publish waste work.
- **Why it matters:** Nonprofit staff often update Sites infrequently; the flow
  must be understandable without specialist training.
- **Severity:** Medium.
- **Likelihood:** High if the raw Payload collection UI is exposed unchanged.
- **Permanent fix:** Provide one quiet Navigation workspace, Page-context
  shortcuts, explicit `Live` and `Draft changes` summaries, inline target
  status, keyboard and pointer movement controls, responsive real-renderer
  preview, consequence-first Publish review, and plain-language blocker repair.
  Seed labels from Page titles but explain that menu wording is independently
  editable. Keep unused purposes absent from setup and UI.

### 8. Hidden coupling

**Concern: Yes.**

- **What could go wrong:** Navigation could couple to Page slugs, Payload field
  shapes, one header component, theme-specific `button` flags, Phase 22 private
  records, or Page hooks that reverse-update menus.
- **Why it matters:** A route, provider, presentation, or source-family change
  would then require risky coordinated edits.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Keep a provider-neutral item contract and source-owned
  destination resolvers behind D1. Navigation owns semantic labels and order;
  presentation profiles own rendering; Phase 22 exposes only eligible public
  references; Page assistance uses a derived reference query and the same
  command. No reverse write or theme CSS belongs in Navigation data.

### 9. Failure modes

**Concern: Yes.**

- **What could go wrong:** Draft save, target resolution, projection compile,
  cache write, or D1 CAS activation can fail. A compiled item can also become
  unsafe after release.
- **Why it matters:** Partial success could publish a broken menu or leave staff
  unsure what visitors see.
- **Severity:** High.
- **Likelihood:** Medium across the system's lifetime.
- **Permanent fix:** Draft failures preserve the last saved draft and current
  live generation; compile failures activate nothing and identify exact items;
  one CAS winner selects one complete generation; public readers fail to the
  last valid generation; current adverse safety suppresses the affected item
  through its owning projection; recovery and rollback create forward
  successor generations rather than mutating history.

### 10. Data integrity risks

**Concern: Yes.**

- **What could go wrong:** Duplicate scoped Navigation identities, dangling or
  polymorphically invalid references, recursive groups, unstable item IDs,
  nondeterministic ordering, or partial migration dispositions can make preview
  differ from public output.
- **Why it matters:** Incorrect Navigation is highly visible, and corrupt
  revision history is expensive to repair.
- **Severity:** High.
- **Likelihood:** Medium without structural enforcement.
- **Permanent fix:** Enforce scoped uniqueness, discriminated target shape,
  stable item identity, deterministic sibling order, bounded acyclic nesting,
  and exact target compatibility on write and compile. Canonicalize projection
  output deterministically and account for every legacy document/item during
  migration.

### 11. Security and privacy risks

**Concern: Yes.**

- **What could go wrong:** Navigation could reveal a restricted missionary,
  draft title, private path, or cross-Tenant Page; unsafe schemes could enable
  script execution; deceptive external domains or unannounced new tabs could
  mislead visitors.
- **Why it matters:** Navigation is public, prominent, and often trusted as an
  organization's endorsement.
- **Severity:** High.
- **Likelihood:** Low to Medium after typed controls.
- **Permanent fix:** Resolve only source-approved public projections, apply
  Phase 10/22 reach at compile and adverse projection time, output-encode all
  labels, parse and normalize destinations with an allowlisted scheme catalog,
  never fetch or execute remote content, show external destinations during
  authoring, default to same-tab, and add accessible disclosure where a new
  context is deliberately used.

### 12. Scalability and performance risks

**Concern: Yes, but ordinary bounded menus do not require exotic infrastructure.**

- **What could go wrong:** Recursive provider population and per-item public
  lookups create N+1 queries; unbounded nesting or thousands of versions inflate
  compile, storage, and preview cost; Page usage checks scan all revisions.
- **Why it matters:** Every public request needs Navigation, so inefficient
  resolution multiplies quickly.
- **Severity:** Medium.
- **Likelihood:** Medium if serving raw Payload graphs; Low with compilation.
- **Permanent fix:** Bound purposes, depth, and item counts using measured
  presentation capacity; index scoped stable target references and active
  generation keys; compile a small public projection once per candidate; serve
  it directly; retain/prune provider autosaves under a documented history
  policy without deleting domain release history; and capacity-test large but
  realistic nonprofit menus. Do not add a separate search service or graph
  database.

### 13. Operational burden

**Concern: Yes.**

- **What could go wrong:** Staff could need to repair every Page move, configure
  empty menus, reconcile Page and menu publication manually, or depend on a
  developer to diagnose broken references.
- **Why it matters:** The product should reduce, not institutionalize, Web Site
  administration work.
- **Severity:** Medium.
- **Likelihood:** High in a raw-URL/manual-publication model.
- **Permanent fix:** Stable references make moves automatic; one D1 Publish
  action coordinates related drafts; unused purposes stay quiet; planned
  retirement opens a focused remove-or-replace repair; the workspace shows
  cause-owned blockers and exact affected placements. No recurring manual
  certification or background menu repair job is required.

### 14. Observability gaps

**Concern: Yes.**

- **What could go wrong:** Operators may not know which revision/generation is
  live, why an item was suppressed, whether compile failed, or whether a cache
  is serving an old projection. Editors may see a generic Publish error with no
  actionable item.
- **Why it matters:** Silent divergence is harder to repair than a blocked
  candidate.
- **Severity:** Medium.
- **Likelihood:** Medium.
- **Permanent fix:** Record correlation-safe generation, Navigation revision,
  purpose, Site, locale, compile result, CAS result, and source-owned
  suppression reason; expose a privacy-filtered health view and item-level
  blockers; alert on impossible active-generation projection misses or
  cross-scope attempts. Do not log private draft labels or restricted subject
  details into broad telemetry.

### 15. Dependency and integration risks

**Concern: Yes.**

- **What could go wrong:** The internal Payload v4 pin can differ from current
  public docs in draft, localization, locking, relationship validation, or
  Admin behavior. A future stable upgrade could change generated schema or hook
  timing.
- **Why it matters:** Making provider behavior the domain contract would turn
  every CMS upgrade into a Navigation rewrite.
- **Severity:** High.
- **Likelihood:** Medium because the repository explicitly identifies the pin
  as a spike dependency and the vendored mirror is v3.77.0.
- **Permanent fix:** Keep Payload behind a provider adapter; qualify required
  APIs against `4.0.0-internal.1f9ae9a` before implementation; maintain adapter
  contract tests for drafts, versions, relationship validation, access,
  localization fallback, locks, migrations, and import maps; and graduate to a
  supported stable channel through the existing upgrade workflow. Never expose
  `_status`, provider version IDs, or hook completion as D1 public truth.

### 16. Migration and upgrade risks

**Concern: Yes.**

- **What could go wrong:** Current Navigation rows have no exact Site, locale,
  purpose, or stable targets; the reader chooses newest `updatedAt`; public
  header/footer links also exist outside that collection. A fuzzy migration
  could choose the wrong Page, silently drop links, or leave dual serving
  authorities.
- **Why it matters:** A clean new model can still launch with wrong content if
  legacy facts are not completely accounted for.
- **Severity:** High.
- **Likelihood:** High unless migration is explicit.
- **Permanent fix:** Census collection rows and static public surfaces; bind
  each to an exact Tenant/Site/locale/later-approved purpose or quarantine it;
  classify every item into one exact D5-approved type, intentional exclusion,
  or unresolved exception; prohibit fuzzy title/slug matching; shadow-compile
  and compare before one surface-authority cutover; then remove dual reads.
  Provider upgrades use versioned migrations and the same contract suite.

### 17. Other development hazards

**Concern: Yes.**

- **What could go wrong:** Concurrent editors can overwrite ordering, autosave
  can race an explicit action, array diffs can lose item identity, two publish
  requests can compete, rollback can destructively mutate history, or tests can
  validate storage without validating the public seam.
- **Why it matters:** These hazards produce intermittent, hard-to-reproduce
  failures and false confidence.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Give items stable IDs; use expected-revision writes and a
  clear stale comparison; preserve user work on conflict; make compilation
  deterministic; use D1 CAS for activation; recover with a forward successor;
  name source owners; and test domain validation, adapter behavior, application
  commands, release closure, public projection, accessibility, and migration
  separately. Do not introduce automatic list merging until real conflict data
  proves it necessary.

## Refined formulation offered for founder ratification

> **C-prime-amended-and-hardened (C-prime-R) — Curated, provider-neutral
> Navigation Revisions with Page-aware assistance under D1:** for one exact
> Tenant × environment × Site × BCP-47 locale, every later-ratified Navigation
> purpose has one stable identity and an immutable semantic revision lineage.
> A Navigation Revision is the provider-neutral content snapshot and digest
> selected by D1—not a mandatory new table, event store, duplicate of Payload
> history, per-item lifecycle, or independently advancing public head—and its
> exact purpose catalog, item vocabulary, destination behavior, and nesting
> limit remain D5 decisions. Navigation alone owns visitor-menu membership,
> menu-local copy, purpose, grouping, and order; D2 Page hierarchy alone owns
> canonical paths and breadcrumbs; D3 owns ordinary Page route continuity; and
> each source phase alone owns whether its destination is eligible for the
> exact public context. Managed internal Page destinations use stable eligible
> references rather than copied URLs, so a Page move can reuse the same
> Navigation Revision while a successor D1 generation resolves the new path
> without silently moving or relabelling the item. The Page workspace exposes
> one scoped, derived Navigation-usage summary and authorized **Add to
> navigation** / **Edit placement** commands into the same expected-revision
> Navigation draft used by the Navigation workspace; it stores no Page-owned
> menu flag, label, parent, position, reverse-placement authority, hook-synced
> copy, or second mutation path. Saving and autosave remain private; exact
> real-renderer preview compiles the candidate; and a Navigation-only change or
> related Page-and-Navigation change becomes public through one ordinary
> Publish action, D1's complete dependency and permission proof, one immutable
> successor Public Site Generation, and one CAS-guarded serving-head advance.
> Planned Page retirement or ordinary unpublish must remove or deliberately
> replace affected Navigation references in that candidate, while current
> Phase 10/22 adverse safety truth suppresses an unsafe public item immediately
> without mutating authored or released history. The public runtime reads only
> the bounded, deterministic, pre-resolved Navigation projection pinned to the
> active generation—never Payload `latest`, raw provider documents, recursive
> request-time population, or N+1 eligibility checks. Exact scope is enforced
> structurally and re-proved through authorization, access control, and the D1
> compiler; expected-revision conflicts retain staff work; failures leave the
> prior complete generation live; recovery is a forward successor; and legacy
> CMS Navigation rows, static header configuration, hard-coded footer links,
> and other public consumers receive a complete exact disposition before one
> surface-authority cutover. Payload Drafts, Versions, relationships,
> validation, and locks may serve as qualified private authoring adapters but
> never define domain release or public truth. Staff receive one quiet ordered
> workspace, Page-aware shortcuts, clear **Live** versus **Draft changes**,
> cause-owned repair actions, responsive exact preview, named non-drag movement
> controls, preserved focus, and one consequence-first Publish action—without
> a Page-tree-generated menu, duplicate Page menu fields, copied managed
> internal URLs, dual writes or reads, provider hooks as publication, a second
> revision system, a second public head, per-item workflow/schedule/audience
> rules, tenant-defined schemas, arbitrary presentation data, unbounded graph
> composition, CRDT machinery, fuzzy migration, partial activation,
> destructive rollback, or a claim that activation proves downstream cache,
> search, sitemap, crawler, or third-party convergence.

## Required proof and test seams inherited by a later specification if C-prime-R is ratified

### Domain and structural proof

1. Navigation identity is structurally unique for its exact Tenant ×
   environment × Site × locale × purpose, and a revision cannot cross any
   scope dimension.
2. Every item validates exactly one D5-approved discriminated type; any
   approved nesting is bounded and acyclic; sibling order and compiled output
   are deterministic; item identity survives reorder and revision diff.
3. A Page destination survives a Page slug and ancestor move without a
   Navigation edit, while Page hierarchy and menu placement remain visibly
   independent.
4. A same-Site managed destination cannot be stored through an incompatible
   D5-approved lane. Wrong-family and unavailable semantic destinations fail
   safely.

### Application and concurrency proof

5. **Add to navigation** from a Page and **Add Page** from Navigation invoke the
   same authorized command and produce the same invariant checks and audit
   shape. No Page field, reverse-placement copy, or hook is required.
6. Derived Page-usage summaries are scoped, indexed, and correct for multiple
   purposes and repeated references; they never become write authority.
7. Two editors starting from the same revision receive one successful write
   and one clear stale result. The stale editor's proposed item and placement
   remain recoverable; autosave and explicit actions cannot silently overwrite
   each other.

### Release and failure proof

8. A Navigation draft, autosave, Payload `_status`, raw Local/REST/GraphQL
   query, document restoration, or stale provider cache cannot change public
   Navigation.
9. A new Page and its Navigation item activate together or not at all; a
   failed compile, projection write, or D1 CAS leaves the current generation
   complete and live.
10. A planned unpublish cannot leave an invalid released item; a current Phase
    10/22 adverse safety change suppresses the item before ordinary positive
    convergence and records only privacy-safe cause information.
11. Rollback and repair create an exact forward successor generation; released
    revisions and prior generations remain immutable.

### Authorization and security proof

12. Wrong-Tenant, wrong-environment, wrong-Site, wrong-locale, draft-only,
    restricted, deleted, and incompatible targets fail safely through Web
    Studio, application commands, Payload REST/GraphQL, and Local API paths.
13. User-scoped Payload operations prove access enforcement and concurrency at
    the exact pin; tests specifically catch default `overrideAccess: true` and
    ignored-lock behavior.
14. If D5 permits external destinations, tests cover malformed values, control
    characters, protocol-relative values, credentials in authority,
    unsupported schemes, Unicode/ASCII hostname presentation, context-change
    behavior, output encoding, and accessible disclosure. No test or
    production path fetches the destination as part of validation.

### UX and accessibility proof

15. Staff can create a Page, add it to Navigation, preview desktop and mobile,
    understand blockers, and publish the coherent result in one normal flow
    without copying a URL or learning provider terms.
16. Keyboard, screen-reader, touch, zoom, reflow, focus, drag alternative,
    validation, error-summary, status-announcement, public current-page, and
    disclosure interactions pass the repo accessibility gates. Public Site
    navigation uses semantic navigation/list/disclosure behavior rather than
    an application `menubar` unless that more complex pattern is separately
    justified and fully implemented.

### Provider, performance, migration, and observability proof

17. Exact-pin adapter tests cover Payload drafts, versions, relationships,
    validation, access, localization fallback disabled for exact proof,
    document locks, migrations, and generated import-map behavior. Current
    public docs or the v3.77 vendor mirror alone are not acceptance evidence.
18. D5-approved Navigation purposes cannot collide, recursively reference one
    another, or resolve raw provider documents at public request time.
19. Production-shaped capacity covers representative upper-bound menus,
    compile time, Page-usage lookup, preview, public response size, and request
    volume without recursive population, N+1 queries, or whole-history scans.
20. Migration accounts for every current Navigation document, item, and static
    header/footer link without inventing a newest-row winner, fuzzy Page match,
    silent exclusion, or long-lived dual read.
21. Logs and health views identify the exact generation, Navigation revision,
    purpose, Site, locale, compile/CAS outcome, and privacy-filtered suppression
    cause; impossible active-projection misses and cross-scope attempts alert.

### Minimum verification matrix

| Seam                      | Required verification                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Domain unit               | Item union, scope, stable identity, ordering, depth, label, destination parsing, deterministic compile            |
| Provider adapter          | Exact Payload pin drafts/versions/access/locks/locales/relationships/migration contract                           |
| Application integration   | One command from both entry points, expected-revision conflict, derived usage, retirement repair                  |
| D1 release integration    | Dependency closure, preview identity, projection persistence, CAS loss, no partial activation, forward successor  |
| Public seam               | Active-generation-only read, Page move, source-owned adverse suppression, safe external rendering, cache identity |
| Web Studio and public E2E | Plain-language flow, responsive preview/navigation, keyboard/touch/AT behavior, actionable failures               |
| Migration and capacity    | Complete disposition manifest, shadow comparison, cutover, realistic upper bounds, no N+1 or full-history scan    |

## Explicit non-decisions

This evidence does not decide:

- exact database table names, Payload collection/global choice, or migration
  SQL;
- whether Payload v4 or any plugin/internal build is production-qualified;
- the exact numeric item caps and provider autosave-retention limit, which must
  be chosen from presentation constraints and production-shaped capacity data;
- the exact Navigation purpose catalog, item type catalog, destination
  behavior, duplicate-placement policy, and nesting depth, which belong to D5;
- the initial keys in the bounded code-owned Site-action catalog;
- Phase 24 locale enablement, domain binding, or fallback policy;
- the Phase 24-approved authoring aid, if any, for copying Navigation structure
  or translating labels between locales;
- scheduled activation executor or missed-schedule recovery;
- a tenant-specific custom menu-purpose builder;
- mega menus, arbitrary icons/media, menu-to-menu nesting, dynamic menu queries,
  personalization, user-group visibility, or per-item schedules;
- anchor-link identity and lifecycle;
- external destination uptime monitoring or a tenant allowlist of external
  domains; syntactic and scheme safety remain required regardless;
- exact desktop/mobile visual design beyond the semantic item contract;
- approval policy for who may publish Navigation;
- public cache/CDN/search/sitemap convergence; or
- implementation, PRD, issue, deployment, or production authorization.

## Research synthesis

Modern CMSs converge on a useful split: Navigation is curated structured
content, internal links use references, and automatic Page lists are a separate
feature. Payload supplies the necessary storage primitives but its official
template deliberately remains much simpler than Asym's product contract.

C-prime-R is the best Phase 23 direction. Its core architecture is not a
departure from modern CMS practice: Payload, Sanity, Contentful, Drupal,
WordPress, and Storyblok all provide evidence for separately curated
Navigation, stable/typed internal references, explicit drafts, or grouped
publication. The Asym-specific piece—one D1 generation proving the exact Page
and Navigation closure—is required by already-ratified multi-Tenant, safety,
and coherent-release boundaries rather than speculative menu complexity.

The permanent path is therefore:

1. reuse the D1 revision envelope, compiler, projection, and serving-head
   machinery;
2. define the small provider-neutral Navigation purpose and item catalogs;
3. implement one authorized expected-revision command and one derived usage
   lookup shared by the Page and Navigation workspaces;
4. prove exact scope and destination closure at candidate compile time;
5. serve only the active generation's bounded projection; and
6. migrate all current collection and static Navigation facts through a
   complete, shadow-compared disposition manifest before one authority cutover.

Do not build a separate menu publishing service, hook synchronization, recursive
graph engine, or collaborative text-editor infrastructure. Those would be the
technical debt. The refined design keeps the necessary complexity at the
release boundary and keeps the staff experience to one ordinary, explainable
Publish flow.

## Primary-source index

Sources were checked on 2026-08-15. Current public provider documentation is
benchmark evidence; it is not exact-pin acceptance evidence for the repo's
internal Payload v4 packages.

- Payload:
  [concepts](https://payloadcms.com/docs/getting-started/concepts),
  [Globals](https://payloadcms.com/docs/configuration/globals),
  [relationships](https://payloadcms.com/docs/fields/relationship),
  [drafts](https://payloadcms.com/docs/versions/drafts),
  [versions](https://payloadcms.com/docs/versions/overview),
  [localization](https://payloadcms.com/docs/configuration/localization),
  [Local API access](https://payloadcms.com/docs/local-api/access-control),
  [Local API options](https://payloadcms.com/docs/local-api/overview), and
  [multi-tenant plugin](https://payloadcms.com/docs/plugins/multi-tenant)
- Payload first-party template:
  [Header](https://github.com/payloadcms/payload/blob/main/templates/website/src/Header/config.ts),
  [Footer](https://github.com/payloadcms/payload/blob/main/templates/website/src/Footer/config.ts),
  and
  [link field](https://github.com/payloadcms/payload/blob/main/templates/website/src/fields/link.ts)
- Sanity:
  [scalable navigation patterns](https://www.sanity.io/docs/developer-guides/navigation-with-sanity)
- Contentful:
  [navigation modeling](https://www.contentful.com/help/modeling-navigation/)
  and
  [entry links](https://www.contentful.com/developers/docs/concepts/links/)
- Drupal:
  [menu concept](https://www.drupal.org/docs/user_guide/en/menu-concept.html),
  [adding a Page to Navigation](https://www.drupal.org/docs/user_guide/en/menu-link-from-content.html),
  and
  [Content Moderation](https://www.drupal.org/docs/8/core/modules/content-moderation/overview)
- WordPress:
  [Navigation block](https://wordpress.org/documentation/article/navigation-block/)
  and
  [Page List block](https://wordpress.org/documentation/article/page-list-block/)
- Storyblok:
  [fields](https://www.storyblok.com/docs/concepts/fields.html),
  [references](https://www.storyblok.com/docs/concepts/references), and
  [content authoring](https://www.storyblok.com/docs/manuals/content-authoring)
- W3C WAI:
  [Menus tutorial](https://www.w3.org/WAI/tutorials/menus/),
  [Navigation Menubar caution](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/),
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/),
  [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements),
  [Link Purpose](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html),
  [Consistent Navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html),
  and
  [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
