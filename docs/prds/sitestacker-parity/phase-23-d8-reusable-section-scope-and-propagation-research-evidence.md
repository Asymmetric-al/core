# Phase 23 D8 Reusable Sections — Decision Brief and Research Evidence

- **Status:** Founder-ratified Phase 23 D8 B-prime-R on 2026-08-21 after
  delegated option selection and full adversarial review.
- **Date:** 2026-08-21
- **Authority:** Research and decision support only. This document does not
  authorize implementation, migration, issue publication, deployment, or a
  production change.

## Decision seam

D1 already established an explicit, independently versioned, one-level
Reusable Section inside the same exact Tenant, environment, Site, and BCP-47
locale. D1 also established the user-visible choices **Change every use** and
**Make a local copy**, prohibited recursive reuse and per-placement workflow,
and required every public use to be pinned inside one immutable Public Site
Generation. D7 then established a flat launch composition made only of typed
semantic leaves.

D8 must not reopen those decisions. It must decide the smallest complete
authoring and release experience around them:

- which D7 leaves may be reusable;
- where a staff member can create, find, inspect, and edit a Reusable Section;
- how the product makes the blast radius unmistakable without making ordinary
  Page editing noisy;
- how a Page may safely diverge;
- how shared drafts, current public uses, retirement, and failure behave; and
- whether ordinary shared content needs library-only editing, a contextual
  handoff, or a separate release ceremony.

The founder's additional concern makes one distinction essential: a bigger
shared-content unit does not create more visual freedom. A live multi-section
assembly synchronizes more structure and therefore tends to make its uses more
alike. Tenant distinctiveness instead comes from Page-local section choice and
order, authored copy and media, one-time Page Starters, and a separate bounded
versioned presentation system. D8 must preserve that presentation seam without
silently deciding its token or variant catalogs.

## Plain-language question

When a staff member encounters a shared section while editing a Page, how
should Web Studio let them change it without either hiding the consequences or
turning a simple content correction into a miniature release-management
project?

## Concrete example

Grace Fellowship uses the same **Volunteer inquiry** Call to Action on
`/give`, `/serve`, and `/contact` in its English (United States) Site.

Maya selects that section while editing `/serve`. It is visibly labelled:

> Shared · Volunteer inquiry CTA · used on 3 public Pages

Web Studio does not let ordinary inline typing silently alter all three Pages.
Maya instead sees three plain actions:

- **Change every use**
- **Make a local copy on this Page**
- **View uses**

**Change every use** opens one focused shared draft. Its header says exactly
which Site and locale it belongs to and that nothing public changes until the
shared change is published. The impact review lists `/give`, `/serve`, and
`/contact`, distinguishes current public uses from draft-only uses, provides
direct previews, and points to any blocker.

If Maya chooses **Make a local copy on this Page**, Web Studio materializes the
exact selected shared revision as a new Page-local D7 section. `/serve` can
then diverge normally and no longer receives future shared changes. There are
no field-level overrides or hidden inheritance rules.

## Settled constraints inherited from D1 and D7

Every viable D8 option preserves all of the following:

- ordinary inserted sections are Page-local by default;
- reuse requires an explicit author action and remains visibly shared;
- a Reusable Section is a root-level, one-level, non-recursive reference;
- the exact scope is Tenant × environment × Site × BCP-47 locale;
- public output resolves no live `latest` relationship and traverses no
  recursive provider graph;
- a new shared draft changes nothing public by itself;
- one D1 successor Public Site Generation selects exact compatible Page and
  Reusable Section revisions, compiles a flat projection, and advances one
  serving head through compare-and-swap;
- every current active use changes coherently or none does;
- a Page that must diverge takes a complete local copy rather than adding
  placement-specific overrides;
- in-use shared content cannot be destructively deleted; and
- cross-Tenant, cross-Site, cross-locale, recursive, implicit folder, or
  template inheritance remains prohibited.

## Current repository findings

The current code is a prototype and does not yet implement the D1 Reusable
Section contract:

- `apps/admin/payload.config.ts` registers Pages, Page Templates, Phase 22
  public-page collections, Navigation, Media, and related collections, but no
  Reusable Section collection or equivalent provider-neutral subject.
- `apps/admin/src/cms/collections/page-templates.ts` defines the current Page
  Template authoring collection.
- `apps/admin/src/cms/create-from-template-endpoint.ts` reads
  `defaultLayout` and copies that value into a newly created Page's `layout`.
  That is one-time starter behavior compatible with D6; it is not shared live
  content and must not be reinterpreted as such.
- The current generic block definitions are concentrated in
  `apps/admin/src/cms/collections/page-builders.ts`. D7 supersedes that
  prototype as product authority with one provider-neutral semantic catalog
  and family profiles.
- `apps/admin/package.json` pins Payload
  `4.0.0-internal.1f9ae9a`. Current public Payload v4 documentation is useful
  directional evidence, but the pinned internal build must be qualified at
  implementation time rather than presumed equivalent.
- `apps/admin/src/cms/collections/pages.ts` currently scopes Pages by Tenant but
  has no authoritative Site or locale lineage, while
  `apps/admin/src/cms/public/resolve-tenant.ts` deliberately leaves `siteId`
  null until the earlier Site-resolution contract is implemented. D8 cannot
  rely on the current shape to enforce its exact scope.
- `apps/admin/src/cms/public/published-content-reader.ts` currently selects the
  latest published provider document by `-updatedAt`; it does not yet serve
  through a D1 Site/locale generation or exact reusable dependency closure.
- `packages/api/src/cms/public/serializer.ts` returns `null` for an unknown
  block while `apps/admin/src/cms/public/serialize-published-page.ts` emits a
  skeletal base record. Shared content would amplify this divergent unknown-
  content behavior across multiple Pages; D7's single exhaustive compiler must
  replace it before D8 activation.
- `apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx`
  uses Payload's ordinary publish controls and has no shared/local distinction,
  reverse-use view, detachment action, or D1 consequence review.
- Existing CMS tests cover collection shape, drafts, preview wiring, and a
  narrow unknown-tenant 404 case. They do not prove D8 exact-scope denial,
  impact closure, concurrent-use reproof, coherent fan-out, local-copy
  identity, retirement, or prior-generation recovery.

Migration therefore needs explicit source dispositions. Similar-looking
legacy sections must not be heuristically deduplicated into shared content:
visual similarity is not proof that staff intended future edits to propagate.
The current Template Gallery also requests draft-inclusive records while its
copy says “published template,” reinforcing that current UI state cannot be
treated as migration or release authority.

## Primary-source findings

### Payload v4

- Payload Blocks embed ordered values in a document. `blockReferences` reuse
  block **configuration**, not an editor-owned shared content instance. Actual
  content reuse requires an explicit relationship or other product model.
  [Payload Blocks](https://payloadcms.com/docs/fields/blocks)
- A Relationship field can filter candidate records through `filterOptions`,
  and a Join can expose reverse uses without duplicating relationship truth.
  These are useful provider mechanisms, but picker filtering and reverse-use
  views are not substitutes for server-side scope, permission, compatibility,
  and release proof.
  [Payload Relationships](https://payloadcms.com/docs/fields/relationship),
  [Payload Join](https://payloadcms.com/docs/fields/join)
- Payload versions are separately addressable, so an Asym release can and
  should bind an exact qualified version rather than resolving a mutable
  relationship at public request time.
  [Payload Versions](https://payloadcms.com/docs/versions/overview)
- Payload localization supports fallback behavior. Authorization, impact
  calculation, compilation, and public projection must not silently substitute
  another locale where the D1 exact-locale contract forbids it.
  [Payload Localization](https://payloadcms.com/docs/configuration/localization)
- Payload's multi-tenant plugin, collection access, and relationship filtering
  may assist an adapter, but they do not replace Asym's exact
  Tenant × environment × Site × locale command and release reproof.
  [Payload multi-tenant plugin](https://payloadcms.com/docs/plugins/multi-tenant)
- Payload locking helps its Admin UI, while Local API and privileged operations
  need explicit access and concurrency handling. A shared edit still needs an
  expected-revision guard and D1 final reproof.
  [Payload document locking](https://payloadcms.com/docs/admin/locked-documents),
  [Payload Local API](https://payloadcms.com/docs/local-api/overview)

### Comparable CMS authoring models

- WordPress Synced Patterns make edits affect every use and offer **Detach**
  to create an independent local copy. That validates a familiar
  change-everywhere versus local-copy mental model. WordPress can leave an
  unavailable marker after deletion; Asym should prevent that outcome through
  retirement and in-use deletion guards.
  [WordPress Synced Patterns](https://wordpress.org/documentation/article/reusable-blocks/)
- WordPress also supports per-instance overrides. Those require inherited and
  overridden value states, reset behavior, eligible-field rules, and migration
  semantics. They solve a different, more complex problem than D8 and would
  contradict the settled complete-local-copy escape hatch.
  [WordPress Synced Pattern Overrides](https://developer.wordpress.org/news/2024/06/an-introduction-to-overrides-in-synced-patterns/)
- Webflow Components show use counts, distinguish the main component from an
  instance, propagate main-component edits, allow an instance to be unlinked,
  and block deletion while instances remain. Its properties, variants, slots,
  and nesting also show how quickly a simple shared-content model can become
  an inheritance system.
  [Webflow Components](https://help.webflow.com/hc/en-us/articles/33961303934611-Components-overview),
  [Webflow component properties](https://help.webflow.com/hc/en-us/articles/33961219350547-Component-properties)
- Contentful references provide centrally shared content, while its reference
  view and release tooling expose dependency impact and validation. Contentful
  also warns that highly connected content becomes difficult to navigate. The
  useful pattern is explicit reference plus impact visibility—not unrestricted
  connectivity.
  [Contentful References](https://www.contentful.com/help/references/),
  [Contentful Reference view](https://www.contentful.com/help/references/reference-view-overview/)
- Sanity distinguishes Page-local embedded objects from reusable referenced
  documents and exposes where documents are used in its presentation tooling.
  This supports local-by-default sections plus an explicit shared-content lane
  with direct Page previews.
  [Sanity structured Page building](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building),
  [Sanity Presentation Tool](https://www.sanity.io/docs/visual-editing/configuring-the-presentation-tool)
- Storyblok uses explicit references for centrally managed content and advises
  keeping universal header/footer material separate from individual Page
  composition. Site-wide chrome should remain a named Site-presentation
  concern rather than a Reusable Section inserted into every Page.
  [Storyblok References](https://www.storyblok.com/docs/concepts/references),
  [Storyblok global components](https://www.storyblok.com/tp/global-components-references.html)
- SiteStacker's folder inheritance and nested Wrappers demonstrate useful
  parity outcomes but also hidden source and blast-radius behavior. They are
  evidence for explicit consequence review, not architecture to reproduce.
  [SiteStacker Site Planner](https://training.sitestacker.com/support/solutions/articles/151000113983-site-planner-overview),
  [SiteStacker Wrappers](https://training.sitestacker.com/support/solutions/articles/151000114031-structuring-your-site-with-wrappers)

### Evidence on tenant visual freedom

Modern systems do not ordinarily make the shared-content graph carry the
entire visual identity:

- Sanity recommends meaning-first structured content that maps into a frontend
  design system and explicitly cautions against putting colors, floats, and
  similar presentation details into durable content models. This preserves
  editor control and future redesignability without making layouts arbitrary.
  [Sanity structured Page building](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building)
- Shopify gives merchants substantial control by letting them add, remove,
  reorder, and configure bounded sections and blocks while recommending that
  developers choose an appropriate—not maximal—flexibility level. Theme,
  section, and block settings supply different look-and-feel options.
  [Shopify sections and blocks](https://shopify.dev/docs/storefronts/themes/best-practices/templates-sections-blocks)
- Shopify's color guidance combines a named brand palette with deliberately
  bounded local overrides and accessibility checks. This is evidence for a
  Site design profile plus qualified section variants, not an arbitrary style
  bag inside shared content.
  [Shopify color-system best practices](https://shopify.dev/docs/storefronts/themes/best-practices/design/color-system)
- WordPress separates global settings and styles—color, typography, spacing,
  element treatment, block treatment, and named style variations—from synced
  content. It separately distinguishes synced patterns from unsynced patterns
  used as editable starting points.
  [WordPress global settings and styles](https://developer.wordpress.org/themes/global-settings-and-styles/),
  [WordPress work with blocks and patterns](https://wordpress.org/documentation/article/work-with-blocks/)
- Webflow separately models centrally managed Variables, reusable Components,
  bounded Component properties/variants, and Page templates. The same
  component can have distinctive content or treatment without turning a
  shared content record into a nested Page subtree.
  [Webflow Variables](https://help.webflow.com/hc/en-us/articles/33961268146323-Variables),
  [Webflow component properties](https://help.webflow.com/hc/en-us/articles/33961219350547-Component-properties)
- The Design Tokens Community Group format gives portable names, groups, and
  aliases to design decisions. A versioned token profile is the cleaner future
  seam for tenant color, typography, spacing, radius, and related brand choices
  than free-form styles embedded in D8 content.
  [Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/)
- Blackbaud's current nonprofit giving products deliberately combine a stable,
  streamlined giving interaction with organization-specific branding cards,
  imagery, mission copy, and selected style controls. That reinforces the
  distinction between brand expression and the safety-critical interaction
  contract.
  [Blackbaud branding cards](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/donfm-branding-card-tutorial.html),
  [Blackbaud form styling](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/ogf-style.html)

WCAG requires consistent identification of same-function controls within a
Site; it does not require unrelated tenants to share one visual identity.
Every qualified presentation still needs meaningful structure, contrast,
keyboard operation, and narrow-viewport reflow.
[WCAG 2.2 consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification)
and [WCAG 2.2](https://www.w3.org/TR/WCAG22/) establish those boundaries.

### Accessibility

The shared state, consequence summary, and actions must be perceivable and
operable without color, hover, a visual canvas, or drag-and-drop. Validation
and publication results need programmatic status announcements, and focus must
return predictably after a drawer, dialog, local-copy conversion, or publish
action.

[W3C Authoring Tool Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/atag/)
and
[WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
support this authoring-tool and feedback posture.

## Permanent common contract for all viable options

The decision should vary the editing surface and ceremony, not the safety
model. Each option therefore uses this same bounded contract:

1. A Reusable Section is one stable independently versioned D1 subject. D8
   decides whether its content is one eligible D7 leaf or a bounded sequence;
   it never becomes a generic wrapper, template, slot, arbitrary tree, or
   recursive reference graph.
2. Reusable eligibility is one closed code-owned profile. It is never inferred
   from current content and cannot be expanded through a tenant schema knob.
   Family eligibility still applies at every use.
3. The stable Reusable Section subject and its immutable revisions are scoped
   to exactly one Tenant × environment × Site × BCP-47 locale. There is no
   silent locale fallback or cross-scope picker result.
4. **Add section** remains local by default. **Reuse existing** and **Make
   reusable** are deliberate, separately labelled actions.
5. A use is a typed reference inside a Page Editorial Revision, not an
   independently owned placement row, workflow, status, or override record.
6. The public compiler flattens the exact section revision selected by the D1
   generation. Public rendering performs no live provider relationship
   traversal.
7. The authoring UI shows separate current-public and draft-only use counts.
   A rebuildable reverse-use projection may accelerate those views, but the
   Page revision closure and D1 generation manifest remain authoritative.
8. An ordinary **Publish Page** does not silently promote an unrelated shared
   draft. It pins the current released shared revision unless inclusion of a
   new shared revision is explicit.
9. **Publish shared changes** compiles all current qualified public uses with
   the exact new section revision and advances one D1 serving head. Independent
   Page drafts remain drafts. One invalid use blocks only the candidate and
   leaves the prior safe generation live.
10. **Make a local copy** copies the exact selected revision into a new local
    D7 section with fresh local identity and removes future shared propagation
    on that Page. There are no field overrides, merges, rebases, or reset-to-
    inherited semantics.
11. **Retire** removes a Reusable Section from new selection but preserves its
    existing references and immutable released history. A currently referenced
    or ever-released section is not destructively deleted through ordinary UI.
12. Missing, incompatible, cross-scope, or unsafe references remain visible as
    actionable candidate errors. They are never silently omitted or replaced
    with another locale or version.
13. Restoring an older Page or shared revision creates a new candidate and
    repeats current permission, scope, compatibility, dependency, reach, and
    safety proof. It never rewrites history or resurrects withdrawn public
    content by implication.
14. Capability checks reuse the Phase 12 model: Page editing, shared-content
    management, and publication may be distinct capabilities, without adding
    per-section ACLs, inherited folder roles, or a new role hierarchy.
15. High-fan-out compilation is deduplicated and bounded before one serving-
    head compare-and-swap. The reviewed impact is reproved at activation so a
    concurrent new use cannot make the confirmation stale.
16. Phase 10 adverse privacy/reach containment remains immediate and does not
    wait for the ordinary positive shared-change workflow.

## Options

### Option A-prime — Narrow reusable-leaf allowlist

A Reusable Section contains exactly one D7 semantic leaf, but launch permits
only Rich Text, Call to Action, FAQ, and Quote. Every other D7 type remains
Page-local. Shared content is available through a small library and through the
explicit contextual handoff described in the example.

**Benefits**

- minimizes the launch eligibility and test matrix;
- covers several common shared-copy needs; and
- keeps higher-structure or identity-sensitive sections local.

**Costs and downstream consequences**

- creates a second arbitrary catalog that staff and developers must remember;
- denies useful, understandable reuse of Media, Gallery, Cards, or editorial
  Impact Statistics even though D7 already defines their safe semantics;
- is likely to grow through one-off requests; and
- still requires the same impact, release, permission, and recovery machinery
  as a broader single-leaf model.

### Option B-prime — Family-qualified reusable semantic leaves — Recommended

Every D7 leaf except Hero may become one explicit Reusable Section. Each
Reusable Section contains exactly one semantic leaf and declares the ordinary
families in which that type is valid. A Page may use any of the eight eligible
types; an Article may use only Rich Text, Media, Gallery, Quote, or Call to
Action. Hero remains Page-local because D7 makes it Page-only, first, singular,
and identity-defining.

The small **Shared sections** library remains available, while a visibly shared
instance in the Page editor offers **Change every use**, **Make a local copy**,
and **View uses**. **Change every use** hands the author into one focused shared
editor; it never turns casual inline typing into a global edit. One accessible
impact review precedes one D1 release.

**Benefits**

- avoids a second arbitrary type catalog by reusing D7's closed family
  profiles;
- preserves the Page context while making the blast radius explicit;
- matches the proven change-everywhere versus detach/local-copy mental model;
- naturally behaves like Option A for staff who lack shared-content
  permission, without a tenant setting;
- uses one shared draft and one release consequence review, not a workflow per
  placement; and
- provides real reuse without inheritance, overrides, or recursive graphs.

**Costs and downstream consequences**

- requires a carefully designed contextual handoff and impact panel;
- requires current-public and draft-only use counts plus direct preview links;
  and
- needs final expected-revision and affected-closure reproof so the impact
  summary cannot become stale before activation.

### Option C-prime — Reusable multi-section assemblies

A Reusable Section may contain an ordered bounded sequence of several D7
semantic leaves, but never another Reusable Section. Staff could share a
multi-part promotional band or campaign assembly as one unit.

**Benefits**

- permits larger repeated assemblies without recreating them Page by Page; and
- can express a few use cases that one semantic leaf cannot.

**Costs and downstream consequences**

- introduces internal ordering, partial-edit, family-compatibility, preview,
  migration, and larger blast-radius questions;
- begins to overlap the bounded-container composition work that D7 explicitly
  deferred to a separately researched future generation;
- makes local-copy behavior heavier because a bundle must materialize several
  new local identities; and
- adds complexity before evidence establishes a recurring multi-section reuse
  need.

## Decision after founder delegation

Choose **Option B-prime — Family-qualified reusable semantic leaves**, then
amend and harden it as B-prime-R below.

Option C-prime does not solve the stated cookie-cutter concern. It causes more
Pages to share the same multi-section structure, increases the change blast
radius, and creates nested version, detachment, family-intersection, partial-
edit, and migration problems. It is a content-governance capability for a
future proven need to synchronize an exact multi-section assembly—not a brand-
expression capability.

A D7 leaf is not necessarily visually small. Gallery, Cards, FAQ, Media, Call
to Action, and Impact Statistics may contain rich typed internal content and
bounded same-kind repeaters. “Leaf” means only that the section cannot contain
an arbitrary graph of other semantic sections.

The durable split is:

| User need                                                 | Correct owner                                                  |
| --------------------------------------------------------- | -------------------------------------------------------------- |
| Keep one exact message synchronized across Pages          | D8 Reusable Section: one shared semantic leaf                  |
| Start from a useful multi-section design and then diverge | D6 Page Starter: one-time local copies                         |
| Arrange one Page distinctly                               | D1/D7 Page-local section selection and order                   |
| Express tenant branding                                   | A separately ratified versioned Site Presentation Profile      |
| Offer tested visual alternatives                          | A small separately ratified code-owned Section Variant catalog |
| Add richer Page-local layout later                        | D7's separately ratified bounded-container evolution           |
| Supply distinctive imagery                                | Phase 29-owned Media and privacy-safe renditions               |
| Share a whole synchronized subtree                        | A future Reusable Assembly only after measured demand          |

The B-prime UX remains explainable in one sentence:

> A shared section changes everywhere; make a local copy when this Page needs
> to be different.

The shared subject owns semantic content, not a fixed tenant-neutral skin. D8
preserves a separate versioned presentation-resolution seam so an exact Page
placement may later select a compatible named presentation variant without
becoming a content override or a separate approval workflow. D8 does not
silently decide that future token or variant catalog and creates no arbitrary
style fields.

## Complete adversarial review

### 1. Brittleness — Concern: Yes

- **What could go wrong:** A shared leaf could be hard-coded to today's
  renderer, family profile, or eight eligible types. A future schema or
  presentation generation could invalidate many uses at once.
- **Why it matters:** Reuse magnifies one compatibility mistake across every
  consuming Page.
- **Severity:** High. **Likelihood:** Medium.
- **Permanent prevention:** Use one stable provider-neutral Reusable Section
  envelope containing the D7 type, schema version, family qualification, and
  immutable revision. Local and shared leaves use the same exhaustive D7
  registry, validation, dependency extraction, migration, compiler, and
  renderer. An incompatible successor fails only its candidate while the prior
  generation stays live.

### 2. Technical debt — Concern: Yes

- **What could go wrong:** Separate local/shared schemas or renderers drift.
  Option C would also duplicate D6 Page Starters and prematurely implement
  D7's deferred container grammar.
- **Why it matters:** Every new section, migration, renderer, and accessibility
  fix would need parallel maintenance.
- **Severity:** High. **Likelihood:** Medium–high without one registry.
- **Permanent prevention:** Reuse changes ownership and version/reference
  semantics only; it never forks the D7 content schema. Use B-prime's one-leaf
  envelope, D6 starters for copied assemblies, and one provider-neutral
  compiler. Keep presentation profiles and variants in their own versioned
  contract.

### 3. Edge cases — Concern: Yes

- **What could go wrong:** Hero conversion, a Page-only type entering an
  Article, the same shared subject appearing several times on one Page,
  draft-only uses, first publication without a live shared revision, retired
  content, locale duplication, stale restores, missing media, or an unrelated
  Page draft can produce surprising behavior.
- **Why it matters:** These are ordinary editorial events, not theoretical
  anomalies.
- **Severity:** High. **Likelihood:** High over the product's lifetime.
- **Permanent prevention:** Exclude Hero structurally; enforce family,
  cardinality, scope, assets, and schema at commands and release; preserve
  unrelated Page drafts; distinguish distinct Pages from exact placements in
  use counts; give each placement its own stable Page-local identity; restore
  as a new candidate; and retire rather than destructively delete.

### 4. Footguns — Concern: Yes

- **What could go wrong:** Casual inline typing changes many Pages, **Make a
  local copy** appears to remain linked, an ordinary Page publish promotes an
  unrelated shared draft, or deletion blanks public content.
- **Why it matters:** One routine editing action could cause a large unintended
  public change.
- **Severity:** High. **Likelihood:** High without explicit interaction design.
- **Permanent prevention:** Shared instances are textually and visually
  labelled and not casually edited inline. Offer exactly **Change every use**,
  **Make a local copy**, and **View uses**. Open one focused shared editor and
  consequence review. A local copy gets a fresh identity and confirmation;
  in-use destructive deletion is unavailable.

### 5. Tenant safety — Concern: Yes

- **What could go wrong:** A picker, relationship, reverse-use query, copy
  command, Payload Local API call, or release could cross Tenant, environment,
  Site, or locale boundaries.
- **Why it matters:** This could expose or publish another organization's
  content.
- **Severity:** Critical. **Likelihood:** Low–medium after controls; materially
  higher if UI filtering is trusted.
- **Permanent prevention:** Enforce exact composite scope structurally and in
  every server command; use current Phase 12 membership/capability proof;
  disable unauthorized locale fallback; treat Payload filters as assistance;
  reprove scope and authority during D1 activation; flatten the public
  projection; and maintain negative isolation tests across every mutation,
  preview, export, restore, and read path.

### 6. Over-engineering — Concern: Yes, principally under C-prime

- **What could go wrong:** Multi-section subjects require internal ordering,
  partial detachment, family intersections, child identity/version closure,
  conflict UX, and safeguards against future recursive containers.
- **Why it matters:** This recreates a miniature nested Page builder before
  evidence establishes the need and still does not make tenants look unique.
- **Severity:** High. **Likelihood:** High if visual freedom is conflated with
  shared-bundle size.
- **Permanent prevention:** Select B-prime. Use Page-local composition,
  versioned presentation profiles, bounded variants, rich media, and D6
  starters for expression. Reconsider a Reusable Assembly only from measured
  atomic multi-section synchronization demand in a separate decision.

### 7. UX/UI and user friction — Concern: Yes

- **What could go wrong:** A noisy library of tiny shared items, unclear local
  versus shared state, too many appearance controls, repetitive confirmation,
  or previews that ignore the tenant's real brand can frustrate staff and
  reinforce a cookie-cutter impression.
- **Why it matters:** Staff will avoid reuse, copy content manually, or publish
  unintended changes.
- **Severity:** Medium–high. **Likelihood:** Medium.
- **Permanent prevention:** Keep local insertion as the default. Provide
  contextual **Save this section for reuse**, purpose-first visual search,
  thumbnails, type/locale/usage context, separate public and draft counts, and
  one proportional impact review only for shared publication. Preview the
  section inside the actual Site profile at desktop and narrow widths. Hide
  advanced appearance choices behind progressive disclosure and never require
  drag, hover, or color perception.

### 8. Hidden coupling — Concern: Yes

- **What could go wrong:** A reusable leaf captures Page width, grid, theme,
  route, SEO, Site chrome, or mutable operational facts and then behaves
  differently across contexts.
- **Why it matters:** Content edits would secretly change layout or source-
  authoritative behavior, and future redesigns would require content
  migration.
- **Severity:** High. **Likelihood:** Medium.
- **Permanent prevention:** The reusable subject stores semantic leaf content
  and typed owner references only. Page composition and the separately
  versioned presentation contract resolve bounded outer treatment. Navigation,
  routes, SEO, media truth, forms, dynamic facts, and Phase 22/29 records retain
  their owners. D1 pins exact content, compiler, renderer, and presentation
  generations.

### 9. Failure modes — Concern: Yes

- **What could go wrong:** A missing reference, incompatible use, stale impact
  review, compile timeout, provider error, permission revocation, or serving-
  head race could yield partial propagation or the wrong public result.
- **Why it matters:** Shared publication must never leave different Pages in an
  unexplained half-state.
- **Severity:** High. **Likelihood:** Medium.
- **Permanent prevention:** Prepare a non-authoritative candidate; show exact
  blockers and repair links; final-reprove the affected closure, permissions,
  revisions, schemas, assets, and expected serving head; and activate through
  one D1 CAS. Any failure retains the prior public generation and recoverable
  drafts. Recovery creates a new validated successor rather than rewriting
  history.

### 10. Data integrity risks — Concern: Yes

- **What could go wrong:** Mutable `latest` references, duplicated subject or
  placement IDs, stale reverse-use counts, draft leakage, copied IDs after
  detachment, or partial dependency manifests make Pages disagree about what
  was released.
- **Why it matters:** Staff, public output, audit records, and recovery would no
  longer describe the same content.
- **Severity:** High. **Likelihood:** Medium.
- **Permanent prevention:** Use opaque stable subject IDs, immutable revisions,
  fresh local-copy and placement identities, exact foreign-scope constraints,
  and a D1 manifest that pins subject revision, schema version, digest, and
  every active consumer. Reverse-use indexes are rebuildable projections;
  released manifests remain authority. Reconcile Pages and placements after
  activation.

### 11. Security and privacy risks — Concern: Yes

- **What could go wrong:** Shared media, links, location clues, PII, unsafe
  embeds, or restricted-worker facts propagate widely; privileged Payload
  access bypasses checks; or a custom appearance escape hatch permits script,
  spoofing, or exfiltration.
- **Why it matters:** Reuse increases the exposure radius of one unsafe fact.
- **Severity:** Critical. **Likelihood:** Low–medium with typed content; medium
  without release reproof.
- **Permanent prevention:** Apply D7 validation and Phase 10 public-projection
  rules to every affected Page; consume only Phase 29 privacy-safe media;
  revalidate typed destinations; prohibit raw HTML/CSS/JavaScript and
  unqualified embeds; reprove current safety at release; audit privileged
  operations; and preserve adverse-first containment independent of positive
  publication.

### 12. Scalability and performance risks — Concern: Yes

- **What could go wrong:** High-fan-out shared edits produce expensive impact
  lists, previews, dependency traversal, and N × M recompilation. Option C
  makes every dependency heavier.
- **Why it matters:** A feature that works for five Pages may time out for a
  large tenant or delay urgent containment.
- **Severity:** Medium–high. **Likelihood:** Medium.
- **Permanent prevention:** Maintain an indexed scope-qualified reverse
  dependency projection; paginate the UI; deduplicate compilation by content,
  profile, and renderer digest; structurally reuse unchanged generation
  artifacts; compile bounded chunks before one small CAS; keep public
  projections flat; define measured capacity/SLO budgets; and load-test real
  maximum shapes without imposing an arbitrary low product cap.

### 13. Operational burden — Concern: Yes

- **What could go wrong:** Poorly named duplicates, abandoned zero-use items,
  manual Page censuses, named release packages for small edits, and tribal
  knowledge make the shared library unusable.
- **Why it matters:** Staff return to copy/paste and developers become routine
  operators.
- **Severity:** Medium. **Likelihood:** Medium–high without lifecycle UX.
- **Permanent prevention:** Require a plain staff-only title and optional
  description; show type, thumbnail, scope, current/draft uses, last release,
  and health; suggest possible duplicates without auto-merging; allow safe
  zero-use archival; automate the dependency closure; and use one shared draft
  plus one D1 release rather than a workflow per placement.

### 14. Observability gaps — Concern: Yes

- **What could go wrong:** Counts conflate public Pages, draft Pages, and exact
  placements; operators cannot identify the live shared revision, release
  cause, failed consumer, cache state, or safety containment.
- **Why it matters:** Failures become difficult to diagnose and staff cannot
  trust the impact summary.
- **Severity:** High. **Likelihood:** Medium.
- **Permanent prevention:** Expose distinct Page and placement counts by public
  versus draft status, exact affected paths, revision/digest, generation ID,
  actor/cause, candidate and activation states, and freshness. Emit privacy-
  safe structured diagnostics and metrics, link each blocker to its repair,
  and reconcile the manifest after activation.

### 15. Dependency and integration risks — Concern: Yes

- **What could go wrong:** Payload relationship population, Join fields,
  localization fallback, locking, or current internal v4 behavior becomes
  accidental product authority and later changes underneath Asym.
- **Why it matters:** Core pins an internal Payload v4 cohort while public v4
  documentation continues to evolve.
- **Severity:** High. **Likelihood:** Medium–high.
- **Permanent prevention:** Keep a provider-neutral Reusable Section envelope,
  command service, compiler, and release manifest. Payload Relationships,
  Joins, Versions, and locks may assist authoring but never define access,
  scope, dependency closure, or live version. Qualify the exact pinned build
  with contract tests before implementation and every upgrade.

### 16. Migration and upgrade risks — Concern: Yes

- **What could go wrong:** SiteStacker Wrappers, inherited folder content,
  copied Page Templates, or visually similar blocks are incorrectly inferred
  as one shared subject. Nested C assemblies or style bags would also be hard
  to export and migrate.
- **Why it matters:** An inferred shared edit could unexpectedly propagate
  where the source system never expressed that intent.
- **Severity:** High. **Likelihood:** High for legacy migration.
- **Permanent prevention:** Give every legacy source occurrence one explicit
  disposition: local Page content, D6 starter provenance, proved D8 reusable
  leaf, Site-presentation input, owner-domain reference, retired item, or
  quarantined unknown. Never infer reuse from similarity. Preserve source IDs
  and evidence, reconcile counts/digests, and use direct versioned migrations
  that leave released history immutable.

### 17. Other development hazards — Concern: Yes

- **What could go wrong:** Concurrent shared edits, autosave races, stale
  impact views, permission revocation, recursive hooks, blind retries,
  incompatible variant removal, weak test fixtures, or destructive rollback
  publish the wrong closure.
- **Why it matters:** These failures cross authoring, provider, compiler, and
  serving boundaries and can evade ordinary unit tests.
- **Severity:** High. **Likelihood:** Medium.
- **Permanent prevention:** Use optimistic expected-revision checks and D1 CAS,
  idempotent commands, final authority reproof, guarded provider hooks, retained
  historical renderer/profile compatibility, successor recovery, and contract,
  property, concurrency, security-negative, migration, maximum-shape,
  accessibility, and end-to-end tests at public seams.

## Ruthless synthesis and ordered path

1. **Select B-prime, not C-prime.** One shared semantic leaf is the smallest
   unit with clear ownership, consequence, versioning, and recovery.
2. **Amend B so reuse shares content, not a fixed visual skin.** Preserve one
   separate versioned presentation-resolution seam and actual branded Page
   preview. Do not smuggle the presentation catalog into D8.
3. **Use D6 Page Starters for multi-section inspiration.** Starters copy; they
   never create hidden live inheritance or synchronized bundles.
4. **Keep Page composition expressive.** Tenants choose local/shared sections,
   order, copy, media, and—after a separate decision—compatible named visual
   variants under their Site Presentation Profile.
5. **Resolve the presentation system as the next dedicated founder decision.**
   Research a small versioned Site design-token profile, bounded accessible
   section variants, preview, impact, migration, and a qualified platform-
   authored custom presentation-package escape hatch. Do not promise literal
   arbitrary no-code output, executable tenant code, or inaccessible
   combinations.
6. **Build only after proof.** Qualify the pinned Payload cohort, define the
   provider-neutral contract, prove exact-scope commands and D1 closure, migrate
   with explicit dispositions, capacity-test fan-out, and pass accessibility,
   privacy, concurrency, recovery, and public-projection tests before
   activation.

This path provides broad creative range without forcing ordinary staff to
understand nested content graphs or making every tenant inherit the same large
shared assembly.

## Ratified formulation

> **B-prime-amended-and-hardened (B-prime-R) — Family-qualified exact semantic
> Reusable Sections with presentation-neutral sharing and expressive Page-local
> composition:** every family-qualified D7 leaf except Hero may become one
> explicit, independently versioned Reusable Section containing exactly one
> typed semantic leaf, including its bounded same-kind repeater where defined,
> and bound to one stable subject, exact Tenant × environment × Site × BCP-47
> locale, qualified family/type/catalog/schema generation, and immutable
> revision. A Page may deliberately interleave local and shared leaves in any
> D7-valid order and may use the same subject in more than one valid placement;
> every placement retains fresh stable Page-local identity, and consequence
> views distinguish distinct Pages from exact placements.
>
> The Reusable Section owns shared semantic content and typed source-owner
> references only—never route, SEO, Navigation, Site chrome, Page hierarchy,
> multi-section structure, layout inheritance, style data, or copied
> operational truth—and does not impose one fixed tenant-neutral skin. D8
> preserves a separate versioned presentation-resolution seam: an exact Page
> placement may later select only a compatible named code-owned presentation
> variant permitted by the separately ratified Site Presentation Profile and
> Section Variant contract, without becoming a semantic-content override,
> independent placement workflow, or approval authority. D8 itself creates no
> token catalog, arbitrary style field, CSS/JavaScript lane, tenant component
> schema, or promise that any imagined design is safe no-code configuration.
> D6 Page Starters provide expressive multi-section beginnings as one-time
> local copies, Page-local composition provides selection and order, and D7's
> separately ratified bounded-container evolution remains the only path to
> richer local composition.
>
> Ordinary insertion remains local by default. **Save this section for reuse**
> and **Reuse existing** are deliberate actions. Saving an existing local leaf
> for reuse atomically creates the shared draft and replaces only that exact
> local placement with its reference under one expected-revision command;
> failure leaves the original local leaf intact. Every shared placement is
> visibly labelled with type, Site, locale, exact live/draft state, and separate
> current-public-Page, draft-only-Page, and placement counts; selecting it
> offers exactly **Change every use**, **Make a local copy**, and **View uses**.
> **Change every use** enters one focused accessible shared editor rather than
> casual inline global editing. **Make a local copy** atomically materializes
> the exact selected shared revision as a fresh local D7 section and replaces
> only that reference, permanently removing that placement from future shared
> propagation; failure preserves the reference. Staff without shared-content
> management authority may inspect consequences and make a local copy on an
> otherwise authorized Page but cannot change every use.
>
> A shared draft changes nothing public. Ordinary **Publish Page** pins the
> current released shared revision unless inclusion of a new shared revision is
> explicit; it never promotes another author's unrelated shared draft.
> Creating a Page's first use of a never-released shared subject may offer one
> explicit **Publish Page and shared section** action rather than requiring two
> disconnected publications.
> **Publish shared changes** shows one proportional accessible consequence
> review with exact current public Pages and placements, draft-only uses,
> responsive previews in the actual Site presentation, and cause-owned
> blockers. It compiles the exact successor shared revision with the active
> qualified Page revisions—preserving unrelated Page drafts—inside one
> non-authoritative D1 candidate. Final activation re-proves actor, permission,
> complete scope, locale without unauthorized fallback, family/cardinality,
> exact section and Page revisions, schema/catalog/compiler/renderer/
> presentation compatibility, assets and source projections, current safety,
> complete affected closure, manifest digests, and expected serving head before
> one idempotent CAS. Every qualified public use changes coherently or none
> does; public rendering consumes one flattened exact-version projection and
> never traverses mutable provider relationships.
>
> Retirement removes a shared subject from new selection while preserving
> qualified uses and immutable history; a referenced or ever-released subject
> is not destructively deleted through ordinary UI. Missing, incompatible,
> cross-scope, unsafe, or restored historical references remain explicit
> candidate errors with repair paths, never silent omission, substitution, or
> locale fallback. Restoration and rollback create newly proved successor
> candidates; candidate or provider failure leaves the prior safe generation
> live; Phase 10 adverse privacy/reach containment remains immediate and
> independently authoritative. The public-use graph is owned by D1 manifests;
> indexed reverse-use data is a rebuildable authoring/diagnostic projection.
> Payload Blocks, Relationships, Joins, Versions, drafts, locks, and Local API
> remain qualified adapter mechanisms rather than Tenant, access, scope,
> dependency, or release authority.
>
> D8 therefore creates no shared Hero, narrow arbitrary type subset,
> multi-section shared subject, synchronized Page subtree, recursive reuse,
> cross-Tenant/Site/locale reuse, per-placement semantic override, wrapper or
> folder inheritance, live `latest` reference, partial fan-out, copied Page
> draft, manual dependency census, giant release transaction, repeated Page
> approval, raw HTML/CSS/JavaScript or unqualified embed, inferred legacy
> sharing, destructive rollback, or claim that shared content, Page Starter,
> presentation profile, section variant, Site chrome, or public release are the
> same fact. C-prime remains a future separately researched option only if
> measured demand proves that an exact multi-section assembly must remain one
> synchronized editorial fact across Pages; visual uniqueness alone is not
> that evidence.

## Deliberate non-decisions

D8 does not decide:

- the exact Site Presentation Profile, design-token, or Section Variant
  catalogs and their tenant authoring UX;
- site-wide chrome, branch regions, or folder inheritance;
- future bounded containers under D7's additive Option C seam;
- generalized templates beyond D6 Page Starters;
- detailed Rich Text, media, forms, dynamic-list, SEO, search, scheduling,
  taxonomy, localization, or preview-token contracts;
- the final Payload storage topology; or
- any implementation, migration, ticket, deployment, or production change.

## Ratification record

On 2026-08-21 the founder ratified the exact B-prime-R formulation above as
Phase 23 D8. That complete quoted formulation is the authority; the surrounding
research and adversarial analysis support it but do not independently expand
it. The authority is also recorded in the
[Phase 23 decision log](./phase-23-web-studio-cms-decision-log.md#d8--family-qualified-exact-semantic-reusable-sections)
and
[ADR-0152](../../adr/0152-family-qualified-semantic-reusable-sections.md).
Ratification authorizes no implementation, schema, migration, provider
adoption, issue publication, deployment, release activation, or production
change.
