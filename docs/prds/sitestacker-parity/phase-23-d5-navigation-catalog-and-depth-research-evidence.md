# Phase 23 D5 Navigation Catalog and Depth — Research and Adversarial Evidence

**Status:** Founder-ratified Phase 23 D5 B-prime-R; supporting evidence, not an
implementation authorization.  
**Date:** 2026-08-21  
**Authority:** Supporting evidence for founder-ratified Phase 23 D5. The exact
decision authority is the Phase 23 decision log and ADR-0149. This document
does not create a PRD, authorize implementation, select a provider, or change
production behavior.

## Decision seam

Founder-ratified D4 established one provider-neutral Navigation Revision under
D1's coherent Public Site Generation and deliberately left the exact
Navigation purposes, item grammar, destination behavior, duplicate policy, and
maximum depth for D5. Founder-ratified D5 resolves that seam through the exact
B-prime-R formulation preserved below.

The bounded founder decision is:

> What is the smallest public Navigation vocabulary that covers Core's real
> header and footer, remains clear on desktop and mobile, and does not become a
> generic recursive menu builder?

D5 must not reopen D1–D4. It must not move Page hierarchy into Navigation,
create a second publication head, or absorb authenticated application chrome,
breadcrumbs, social profiles, search, Phase 22 giving bindings, or arbitrary
audience and schedule rules.

## Current repository evidence

- [`site-shared.ts`](../../../packages/config/site-shared.ts) defines one
  `nav.main` list and one `nav.cta`; there is no public utility-menu source.
- [`navbar.tsx`](../../../packages/ui/components/public/navbar.tsx) and
  [`navbar-client.tsx`](../../../packages/ui/components/public/navbar-client.tsx)
  consume the same primary links and call to action for desktop and mobile.
- [`footer.tsx`](../../../packages/ui/components/public/footer.tsx) already
  proves a second public purpose: grouped Footer columns plus a flat legal row.
  Its content currently competes with the separate Footer configuration in
  `site-shared.ts`, so both are migration inputs rather than future authority.
- [`navigation.ts`](../../../apps/admin/src/cms/collections/navigation.ts)
  stores unversioned flat `label`, raw `href`, and `openInNewTab` values. The
  newest `updatedAt` row is selected by
  [`published-content-reader.ts`](../../../apps/admin/src/cms/public/published-content-reader.ts),
  but neither the public Header nor Footer consumes that record. One complete
  authority cutover is therefore required by D4.
- Current authenticated Navigation in
  [`packages/config/navigation.ts`](../../../packages/config/navigation.ts) is
  application chrome, not tenant public Site Navigation, and must not be
  imported into D5.
- The static configuration currently contains broken or placeholder `#`
  destinations. Migration must map, intentionally exclude, or quarantine them;
  it must not make fake anchors valid future Navigation.
- Exact non-null Site and locale scope remains an implementation prerequisite;
  current public resolution still carries `siteId: null`. D5 must define the
  product vocabulary without weakening the accepted Site/locale identity.

The repository therefore demonstrates two real public purposes—Primary and
Footer—but no evidence-backed third Utility purpose.

## Current official-product evidence

- Payload's official website template models Header and Footer separately,
  reuses one internal-reference-or-custom-URL field grammar, keeps both
  examples flat, and caps each example at six entries. This supports bounded
  purposes and a shared semantic grammar, but not Payload's unversioned release
  authority.
  [Payload Header](https://github.com/payloadcms/payload/blob/main/templates/website/src/Header/config.ts),
  [Payload Footer](https://github.com/payloadcms/payload/blob/main/templates/website/src/Footer/config.ts),
  [Payload link field](https://github.com/payloadcms/payload/blob/main/templates/website/src/fields/link.ts)
- Sanity recommends structured internal references plus external links and
  explicitly advises starting small rather than modeling every possible UI.
  [Sanity navigation](https://www.sanity.io/docs/developer-guides/navigation-with-sanity)
- Contentful treats Navigation independently from content hierarchy and warns
  that generic models become complicated quickly when multiple menus, devices,
  locales, and nesting are all made configurable.
  [Contentful navigation modeling](https://www.contentful.com/help/modeling-navigation/)
- Neon One's nonprofit Site Builder exposes an existing Page or external link,
  distinguishes the Navigation label from the Page title, and shows one
  indented child level. This is a useful plain-language nonprofit benchmark.
  [Neon One Navigation](https://support.neonone.com/hc/en-us/articles/4417978611213-Site-Builder-Navigation-Menu)
- Shopify supports deeper menus, but its current guidance makes theme
  compatibility explicit and treats a dropdown parent as a disclosure rather
  than a simultaneous landing link. When a landing Page is needed, it belongs
  as the first child.
  [Shopify dropdown menus](https://help.shopify.com/en/manual/online-store/menus-and-links/drop-down-menus)
- HubSpot supports managed Page links, external URLs, non-linking parents,
  children, and secondary menus. That breadth demonstrates viable concepts,
  not a requirement for Asym to expose arbitrary named menus.
  [HubSpot navigation menus](https://knowledge.hubspot.com/website-pages/set-up-your-site-s-navigation-menus)
- W3C's current guidance supports semantic list Navigation and disclosure
  buttons for fly-outs. Ordinary website Navigation should not acquire the
  heavier ARIA `menubar` interaction model. Dragging also requires a non-drag
  pointer alternative.
  [W3C menu structure](https://www.w3.org/WAI/tutorials/menus/structure/),
  [W3C fly-out menus](https://www.w3.org/WAI/tutorials/menus/flyout/),
  [WCAG dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)

There is no universal CMS maximum depth. The correct Asym limit is therefore a
product constraint based on its real Site shell, staff comprehension, mobile
behavior, accessibility, and tested presentation capacity—not a number copied
from one provider.

## D5 adversarial primary-source research

This section pressure-tests Option B-prime against current first-party CMS,
commerce, nonprofit Site Builder, Payload, and W3C guidance. It is supporting
evidence only; it did not itself ratify D5.

### What the current sources actually support

1. **Two code-owned purposes are enough for the demonstrated product, and are
   safer than a tenant-created menu catalog.** Payload documents Globals as the
   normal shape for singleton Site facts such as header navigation and footer
   content. Its current website template also models Header and Footer
   separately. HubSpot supports multiple named and secondary menus, but warns
   that changing a published menu affects every Page or template that uses it.
   Contentful likewise says a dedicated Navigation content type may serve
   multiple regions, while the hierarchy and validation should be deliberately
   flexible or inflexible for the product's real needs. These sources prove that
   more menus are possible; they do not demonstrate a need for arbitrary
   tenant-created purposes in Asym.
   [Payload Globals](https://payloadcms.com/docs/configuration/globals),
   [Payload Header template](https://github.com/payloadcms/payload/blob/main/templates/website/src/Header/config.ts),
   [Payload Footer template](https://github.com/payloadcms/payload/blob/main/templates/website/src/Footer/config.ts),
   [HubSpot Navigation menus](https://knowledge.hubspot.com/website-pages/set-up-your-site-s-navigation-menus),
   [Contentful Navigation modeling](https://www.contentful.com/help/modeling-navigation/)
2. **A managed destination must be a relationship, not a copied internal URL.**
   Shopify explicitly cautions that pasting an internal URL instead of selecting
   the Page can sever the relationship and later produce a `404`; its picker
   also seeds the menu name from the selected destination. Sanity models
   internal and external links as distinct types and limits each item to one
   selected link. Payload relationship fields can filter choices and validate
   the same filter server-side. This directly supports stable managed
   references, a separate external-website lane, and exactly one destination
   per Link.
   [Shopify menu editing](https://help.shopify.com/en/manual/online-store/menus-and-links/editing-menus),
   [Sanity Navigation](https://www.sanity.io/docs/developer-guides/navigation-with-sanity),
   [Payload Relationship field](https://payloadcms.com/docs/fields/relationship)
3. **A non-navigating Group is clearer than one control that both navigates and
   expands.** Shopify's current accessibility guidance says dropdown headers
   are generally buttons, not links, and recommends putting a category landing
   Page first inside the dropdown. The W3C disclosure Navigation example uses
   ordinary buttons to expose lists of links and intentionally does not use the
   heavier ARIA `menu` role. W3C also documents a separate-button alternative
   when the parent itself must navigate. Because Asym does not need that dual
   behavior in Phase 23, a non-linking Group plus an explicit first child such
   as **About overview** is the quieter rule.
   [Shopify dropdown accessibility](https://help.shopify.com/en/manual/online-store/menus-and-links/drop-down-menus),
   [W3C Disclosure Navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/),
   [W3C Fly-out menus](https://www.w3.org/WAI/tutorials/menus/flyout/)
4. **Two visible levels are a reasonable product boundary, not a universal CMS
   law.** Shopify supports as many as two nested dropdown levels but makes theme
   and mobile compatibility an explicit concern. Neon One's nonprofit Site
   Builder exposes one indented child level in its campaign Navigation editor;
   a newer general Website Builder permits three total levels and documents
   additional mobile-layout and deletion complications. Contentful warns that
   global Navigation becomes overwhelming when it tries to expose too many
   links. A single Group level covers Asym's actual Header and Footer while
   removing recursive editing, rendering, and query failure modes.
   [Shopify dropdown menus](https://help.shopify.com/en/manual/online-store/menus-and-links/drop-down-menus),
   [Neon One campaign Navigation](https://support.neonone.com/hc/en-us/articles/4417978611213-Site-Builder-Navigation-Menu),
   [Neon One Navigation Links](https://support.neonone.com/hc/en-us/articles/9832497489677-Widgets-Navigation-Links),
   [Contentful Navigation modeling](https://www.contentful.com/help/modeling-navigation/)
5. **Desktop and mobile should be presentations of one authored order.** W3C
   says Navigation that appears across screen sizes should keep the same
   wording, ordering, and destinations even when items are collapsed. Shopify
   tells merchants to test nested Navigation on both desktop and mobile rather
   than assuming theme compatibility. A separately authored mobile menu would
   create drift and increase staff work without adding demonstrated tenant
   value.
   [W3C Menu structure](https://www.w3.org/WAI/tutorials/menus/structure/),
   [Shopify dropdown menus](https://help.shopify.com/en/manual/online-store/menus-and-links/drop-down-menus)
6. **The label should be easy to start and safe to change.** Shopify seeds a
   menu item's Name from the selected destination unless the editor has already
   supplied a name. Neon One distinguishes a Page title from the visitor-facing
   Navigation label and supports localized labels. The safe Asym behavior is
   therefore: seed once, clearly label the field **Navigation label — shown to
   visitors**, preserve any explicit staff edit, show the current destination
   title beside it, and offer an intentional **Use Page title** action. A Page
   rename must not silently rewrite curated Navigation copy.
   [Shopify menu editing](https://help.shopify.com/en/manual/online-store/menus-and-links/editing-menus),
   [Neon One campaign Navigation](https://support.neonone.com/hc/en-us/articles/4417978611213-Site-Builder-Navigation-Menu)
7. **Drag-and-drop may accelerate ordering, but cannot be the only control.**
   Shopify, HubSpot, and Neon One all teach dragging for order and nesting. WCAG
   2.2 Success Criterion 2.5.7 requires a non-drag single-pointer alternative,
   and W3C specifically gives adjacent Move up/down controls for a sortable list
   as an acceptable pattern. Keyboard support is an additional requirement, not
   a substitute for the pointer alternative. B-prime therefore needs named Move
   commands, retained focus, result announcement, and undo in addition to any
   drag handle.
   [WCAG 2.2 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html),
   [Shopify menu ordering](https://help.shopify.com/en/manual/online-store/menus-and-links/editing-menus),
   [HubSpot Navigation menus](https://knowledge.hubspot.com/website-pages/set-up-your-site-s-navigation-menus)
8. **Preview and draft state are first-class editor aids, but not publication
   authority.** Payload's current Live Preview supports configurable device
   breakpoints and dynamic URLs for multi-tenant and localized applications.
   Its draft and autosave documentation separates unpublished work from the
   published document. Those capabilities fit D1's preview and private-work
   model, but Payload's native Publish button must not bypass D1's coherent Site
   Plan release.
   [Payload Live Preview](https://payloadcms.com/docs/live-preview),
   [Payload Drafts](https://payloadcms.com/docs/versions/drafts),
   [Payload Autosave](https://payloadcms.com/docs/versions/autosave)
9. **Tenant scoping must shape both the editor and the server invariant.**
   Payload's access-control docs explicitly support restricting records by
   organization, and the current multi-tenant plugin filters list and
   relationship choices by the selected tenant. Payload relationship
   `filterOptions` is used both to filter the picker and validate the choice.
   These are useful adapter capabilities, not sufficient authority by
   themselves: a visual tenant selector is context, not authorization. Every
   create, move, preview, compile, and read still needs exact Tenant ×
   environment × Site × locale constraints and a server-side rejection of a
   foreign target.
   [Payload Access Control](https://payloadcms.com/docs/access-control/overview),
   [Payload Multi-Tenant plugin](https://payloadcms.com/docs/plugins/multi-tenant),
   [Payload Relationship field](https://payloadcms.com/docs/fields/relationship)
10. **Opening a new tab should be exceptional and visible.** Sanity defaults its
    example `openInNewTab` value to `false`; HubSpot makes the setting an
    optional action. W3C explains that unexpected new tabs can disorient people
    with visual or cognitive disabilities and recommends advance visual and
    assistive-technology warning. Asym should default every link to the current
    context, expose **Open in new tab** only in an advanced external-link area,
    and render a consistent icon plus accessible warning when selected.
    [Sanity Navigation](https://www.sanity.io/docs/developer-guides/navigation-with-sanity),
    [HubSpot Navigation menus](https://knowledge.hubspot.com/website-pages/set-up-your-site-s-navigation-menus),
    [W3C new-window warning technique](https://www.w3.org/WAI/WCAG22/Techniques/general/G201)

### Required hardening to keep B-prime modern and tenant-safe

- **Make the two shapes structural.** Persist and validate a discriminated
  `Link | Group` grammar. A Group has terminal Link children and no destination;
  a Link has exactly one destination and no children. Do not store a recursive
  generic node and depend on the editor to hide unsupported states. Payload can
  express infinitely nested arrays, which is capability rather than evidence
  that recursion is appropriate. Its array fields support `maxRows` and shared
  admin/server validation, so the adapter can enforce the bounded contract.
  [Payload Array field](https://payloadcms.com/docs/fields/array)
- **Keep the current scope continuously visible.** The editor header should say,
  for example, **Hope Mission · Public Site · English (United States) · Draft**.
  Changing Tenant, Site, or locale is an explicit context switch. The picker
  lists only eligible targets in that scope and shows Page title, resolved path,
  type, and release eligibility. Server validation re-proves all of it.
- **Use a quiet outline, not a generic schema form.** Each collapsed row should
  show the visitor label, Link/Group icon and plain-language type, destination
  summary, validation state, and an action menu. **Add item** asks only **Page or
  Site destination**, **External website**, or **Group**. Invalid nesting actions
  are absent; staff should not learn the model through error messages.
- **Preview the actual consequences.** Keep desktop and mobile previews one
  click away, preserve the selected locale and Page, and show the Primary action
  in its real visual treatment. Preview must use the same compiler and
  projection contract as release. It is not a screenshot approximation and it
  does not imply that the draft is public.
- **Treat destination retirement as an exception, not a cascade.** Shopify
  automatically removes menu items when the selected resource is deleted. That
  behavior is convenient but too quiet for Asym: a staff member could lose an
  important Give or safety route without seeing the Navigation consequence.
  Preserve the Navigation intent, mark it **Needs repair**, offer eligible
  replacements, and block only the affected release closure while the prior
  complete generation remains live.
  [Shopify menu editing](https://help.shopify.com/en/manual/online-store/menus-and-links/editing-menus)
- **Use a nuanced duplicate rule.** Block an exact same-purpose duplicate with
  the same target, label, and role. Allow the same destination across Primary
  and Footer. Within Primary, a normal Link and the prominent action may share a
  destination only after a plain warning and explicit confirmation, because
  real nonprofit Sites commonly reinforce **Give** while the two placements
  have different visual jobs. Do not silently deduplicate or invent separate
  target records.
- **Bound visual capacity explicitly.** Shopify currently recommends seven or
  fewer top-level items; Payload's official examples cap Header items at five or
  six. Those figures support a bounded Primary, but not a universal database
  number for every locale and Site shell. D5 should require code-owned,
  presentation-tested limits for Primary top-level items, Group children,
  Footer Groups, and Footer Links; the editor shows the count and consequence
  before the limit. Seven is a defensible Primary ceiling only if D3's actual
  desktop and mobile shells pass long-label and locale-expansion tests. Limits
  must never be arbitrary tenant knobs.
  [Shopify dropdown best practices](https://help.shopify.com/en/manual/online-store/menus-and-links/drop-down-menus),
  [Payload Header guide](https://payloadcms.com/posts/guides/how-to-build-a-header-navigation-using-payload-globals)
- **Keep public semantics ordinary.** Render labelled `<nav>` landmarks and
  nested lists; Links remain anchors, Group controls remain buttons with
  `aria-expanded`, the current destination uses `aria-current="page"`, and
  `Escape` closes an open disclosure and restores focus appropriately. Do not
  apply `role="menu"`/`menubar` to ordinary website Navigation.
  [W3C Menu structure](https://www.w3.org/WAI/tutorials/menus/structure/),
  [W3C Disclosure Navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

### Primary-source adversarial conclusions

- **Sound core:** Exactly Primary plus Footer, one Link-or-Group grammar, stable
  managed references, one Group level, and one responsive source are all
  consistent with modern CMS patterns and materially reduce editor and runtime
  failure modes.
- **Necessary amendments:** The final D5 contract should add continuously
  visible scope, structural depth enforcement, production-shaped responsive
  preview, accessible non-drag ordering, retirement repair rather than cascade,
  nuanced duplicate handling, and code-owned tested capacity limits.
- **Avoided debt:** Do not copy Payload's version tables or Publish authority,
  Shopify's `#` placeholder heading, Neon One's device-specific visibility,
  HubSpot's arbitrary named-menu surface, or any provider's raw internal URL
  lane. Each would reintroduce an authority, accessibility, or drift problem
  already excluded by D1–D4.
- **Residual product choice:** Primary top-level and Footer capacity numbers
  must be fixed against D3's real responsive presentation and longest supported
  labels before implementation. The evidence supports bounded code-owned
  limits, but does not justify copying another vendor's number blindly.

## Options for the founder

### Option A — Flat Primary and Footer

- Exactly two purposes: **Primary Navigation** and **Footer Navigation**.
- Exactly one item shape: a destination link.
- Managed Page/site destinations or validated external websites.
- One visible level; no groups or submenus.
- One optional prominent Primary link uses the same destination grammar.

**Benefit:** Smallest schema, editor, renderer, and test matrix.  
**Cost:** Cannot represent Core's existing grouped Footer or a modest `About`
dropdown. Staff would eventually invent heading Pages or overloaded labels to
simulate grouping.  
**Verdict:** Clean, but too restrictive for the current product.

### Option B-prime — Two bounded purposes, Link-or-Group, two levels

- Exactly two code-owned purposes: **Primary Navigation** and **Footer
  Navigation**.
- Exactly two semantic item shapes:
  - **Link** — a visitor label plus exactly one typed destination;
  - **Group** — a non-navigating label with terminal Link children.
- A Link destination is exactly one of:
  - an eligible stable managed Page/public-subject reference;
  - a source-qualified code-owned Site destination such as Give or Sign in;
  - a validated external website.
- Groups cannot contain Groups or reference another Navigation. Both purposes
  have at most two visible levels total.
- Primary may contain ordinary Links or Groups plus one optional **Primary
  action** slot containing an ordinary Link. Footer may contain Links or
  Groups, with legal destinations remaining ordinary Footer Links.
- The same authored content and order render responsively on desktop and
  mobile. There is no separately authored mobile menu.
- The same destination may appear in Primary and Footer. An exact duplicate is
  blocked within one purpose; a same-target ordinary/Primary-action pairing
  receives an explicit warning rather than silently duplicating intent.
- A managed target initially seeds **Navigation label — shown to visitors**
  from its public title. Staff may intentionally change the label; subsequent
  Page-title changes do not silently overwrite it.
- New purposes, deeper mega menus, anchors, nested menus, arbitrary CTA styles,
  social/media items, dynamic queries, per-item audiences, and per-item
  schedules are unavailable rather than merely hidden.

**Benefit:** Covers Core's real Header, responsive menu, prominent Give action,
grouped Footer, and legal links with one non-recursive grammar. It avoids an
unused Utility configuration and makes invalid depth impossible to author.  
**Cost:** A genuinely large Site must use a landing Page, directory, search, or
a later qualified local/mega-navigation capability rather than placing its
whole Page tree in global Navigation.  
**Verdict:** Recommended. It is the smallest model that covers the repository's
actual public shell without creating compensating hacks.

### Option C — Extensible multi-region menu builder

- Primary, Utility, and Footer purposes initially, with tenant-created purposes
  available later.
- Three or more levels, recursive Groups, more destination types, independent
  mobile structures, and richer per-item presentation.

**Benefit:** Maximum theoretical flexibility for large Sites and unusual
themes.  
**Cost:** Introduces a dormant Utility workspace today, recursive validation,
cycle and movement rules, more mobile states, more locale/release combinations,
and theme-to-purpose mapping. It invites Navigation to absorb Page hierarchy,
local Navigation, and presentation responsibilities.  
**Verdict:** Valid for a proven future mega-menu product, but unnecessary debt
for Phase 23.

## Founder-ratified D5 formulation

> **Option B-prime-amended-and-hardened (B-prime-R) — Two scope-exact,
> code-owned Public Navigation purposes with bounded Link-or-Group
> composition:** for each exact Tenant × environment × Site × canonical BCP-47
> locale, **Primary Navigation** and **Footer Navigation** are the only Phase 23
> purposes, and each has D4's one stable identity and immutable,
> provider-neutral semantic revision lineage selected by exact digest into
> D1's one Public Site Generation—never an independently advancing public head.
> One structurally discriminated, ordered, capacity-bounded grammar permits
> only a stable-item-identity **Link** or **Group**. A Link has one trimmed,
> Unicode-normalized visitor label, no children, and exactly one typed
> destination: an eligible stable managed reference qualified by source family
> and complete scope, a small code-owned Site destination resolved by its
> owning capability, or a validated absolute HTTPS external website. A Group
> has a visitor label, no destination, and terminal Links only; Groups cannot
> nest, reference another Navigation, or exceed two visible levels. Primary
> alone permits one optional prominent-action role on a normal top-level Link;
> this is semantic emphasis, not a third item type or tenant styling system.
> Legal links remain ordinary Footer content, while social profiles, search,
> account chrome, breadcrumbs, language switching, in-page anchors, dynamic
> queries, and Phase 22 giving bindings remain source-owned outside D5. The same
> authored labels, grouping, order, and destinations drive desktop and mobile.
> Selecting a managed target seeds **Navigation label — shown to visitors**
> once; later source-title or path changes never overwrite curated copy, while
> the editor shows current target context and offers an explicit **Use current
> page title** action. Duplicate detection uses conservative stable destination
> identity: the same destination is blocked twice within one purpose, except
> that one ordinary Primary Link and its single prominent action may share a
> destination after a quiet warning and explicit confirmation; reuse once in
> each different purpose remains valid. External links open in the same context
> by default; an advanced external-only new-tab choice provides visible and
> assistive warning plus `noopener noreferrer`, and no save or release path
> performs a network fetch. Code-owned limits for top-level items, Group
> children, Footer Groups, total items, labels, and URLs are proved against the
> actual responsive shell, longest supported localized labels, reflow, and
> 200% zoom; they are visible before the limit and are neither copied blindly
> from another product nor exposed as tenant schema knobs. Incomplete items and
> empty Groups may exist only in private drafts; release blocks them with exact
> repair actions. Removing a nonempty Group offers **Move links to top level**
> when capacity permits, consequence-confirmed removal of the Group and Links,
> or cancel—never silent cascading deletion. Planned retirement or ordinary
> unpublish blocks the affected candidate until the reference is repaired or
> deliberately replaced; a later adverse source-safety change immediately
> suppresses the affected public Link and any newly empty Group without
> mutating authored or released history, and creates one cause-owned repair
> exception. Staff use one quiet Navigation workspace with continuously visible
> Tenant, Site, locale, environment, and Draft/Live context; Primary and Footer
> sections; plain-language **Page or site destination**, **External website**,
> and **Group** choices; server-paginated scoped pickers; compact rows showing
> visitor label, destination, resolved path or host, live difference, and one
> exact issue; real desktop/mobile preview; drag as an optional accelerator;
> named Move up/down/into/out controls; retained focus, announcement, and undo;
> and unmistakable **Saved privately**, **Draft changes**, and **Live** states.
> The Page-aware shortcut and full workspace invoke one canonical server
> command that authenticates the actor, reads current authoritative membership,
> resolves the immutable operational Tenant UUID to exactly one CMS tenant,
> re-proves explicit environment, Site, locale, purpose, capability, expected
> revision, structure, capacity, and every target under the complete scope, and
> atomically appends the winning revision or retains the losing draft on a CAS
> conflict. A mutable tenant slug, visible tenant selector, stale token claim,
> Payload role, picker filter, or client-supplied scope never authorizes the
> command; super-admin work still names and audits one exact scope. Payload
> remains a private authoring adapter in the non-exposed `cms` schema, with user
> Local API operations explicitly setting `overrideAccess: false` and mutations
> also setting `overrideLock: false`; Asym does not claim Supabase RLS protects
> a table owner, `service_role`, or `BYPASSRLS` connection. Any future table or
> view deliberately exposed through the Supabase Data API instead receives
> least-privilege grants, indexed exact-scope RLS with explicit read (`USING`)
> and write (`WITH CHECK`) policies, and security-invoker access; anonymous
> visitors read only D1's
> bounded, pre-resolved active-generation projection. D1 re-proves membership,
> targets, renderer compatibility, revision digests, and complete dependency
> closure immediately before its one serving-head CAS; ordinary save, compile,
> concurrency, or activation failure leaves the prior complete generation live
> and private work recoverable, while recovery is a forward successor.
> Privacy-safe structured evidence distinguishes validation, authorization,
> conflict, compilation, suppression, activation, and projection/cache
> convergence without logging restricted identities or private Navigation
> copy. Current CMS rows, static Header/CTA facts, hard-coded Footer/legal facts,
> placeholders, broken paths, duplicates, and every public consumer receive one
> exact mapped, excluded, or quarantined disposition, a production-shaped
> shadow compile and comparison, and one surface-authority cutover—without a
> Utility purpose, tenant-created purpose or item schemas, raw managed-internal
> URLs, fragments, protocol-relative or credential-bearing URLs, fake `#`
> headings, link-plus-disclosure ambiguity, recursive or menu-to-menu graphs,
> separately authored mobile truth, per-item workflow/audience/schedule,
> arbitrary icon/CSS controls, synchronous external-link crawling, public
> authoring-table reads, per-request relationship traversal, Payload `latest`
> or native Publish as public authority, last-write-wins, CRDT/event-sourcing
> machinery, dual authority, fuzzy migration, partial activation, destructive
> rollback, or a claim that activation proves downstream convergence.

The founder ratified the exact formulation above as **Phase 23 D5** on
2026-08-21. The decision log and ADR-0149 are the durable decision authorities;
this document preserves the research and adversarial evidence that produced
the ruling.

## Staff experience under Option B-prime

The workspace says **Primary navigation** and **Footer navigation**, not
“purpose profile” or “navigation node.” The normal flow is:

1. Open one of the two visible Navigation sections beside the exact Site
   preview.
2. Choose **Add item**.
3. Select **Page or site destination**, **External website**, or **Group**.
   These are plain-language authoring routes into the two-shape domain model,
   not three persistence schemas.
4. Selecting a managed destination seeds its visitor-facing label and shows
   its current resolved path, family, and eligibility.
5. Choose its position or, where valid, a Group. Children never expose another
   nesting action.
6. Preview desktop and mobile results immediately. Save keeps a private draft;
   D1 alone makes the generation public.

Reordering may offer drag-and-drop for convenience, but every operation also
has **Move up**, **Move down**, **Move into group**, and **Move out of group**
controls, retains focus, announces the result, and supports undo. Primary
Groups render as accessible disclosures; Footer Groups render as section
headings. A Group never also navigates. If `About` needs a landing Page, the
first child is an explicit `About overview` Link.

External websites open in the same context by default. Any later exceptional
new-context option must be limited to external links and provide visible and
accessible advance notice; it is not a default or an item type.

## Concrete scenario

Hope Mission has:

- `About` as a Primary Group with `About overview`, `Our beliefs`, and
  `Leadership` as managed Page Links;
- `Missionaries` and `Projects` as source-qualified managed directory Links;
- one Primary action, `Give`, pointing to the owning giving entry; and
- Footer Groups for `Get involved` and `Legal`.

A staff member moves `Our beliefs` under a different Page parent. D2 changes
its path, D3 preserves ordinary route continuity, and the D4 Navigation draft
still points to the stable Page identity. The editor sees the new path in
preview but does no menu repair. When the related Site Plan is published, D1
activates the compatible Page and Navigation facts together. Desktop and
mobile change from the same Navigation source.

If the staff member tries to put a Group inside `About`, the UI offers no such
action. If they need a larger information architecture, they create a landing
Page or directory instead of turning the global menu into the Page tree.

## Full adversarial review of the founder-selected B-prime

### 1. Brittleness — Concern: Yes

- **What could go wrong:** An unbounded array may appear sound with short
  English labels but overflow, hide items, or become unrenderable with long
  localized labels, more links, a disabled destination family, or a different
  responsive shell.
- **Why it matters:** Navigation is shared Site chrome; one bad candidate can
  damage every public Page in that exact scope.
- **Severity:** High.
- **Likelihood:** High if B-prime is implemented as the current generic array;
  Low after the hardened structural and renderer contract.
- **Permanent prevention:** Make Link-or-Group and the two-level ceiling
  structural; give the exact renderer a code-owned, presentation-tested
  capacity envelope; compile the complete dependency closure; preview through
  the real desktop/mobile renderer; and refuse only the incompatible candidate
  while keeping the prior generation live.

### 2. Technical debt — Concern: Yes

- **What could go wrong:** Payload fields, Page shortcuts, migrations, public
  serializers, and React shells can each acquire slightly different link,
  scope, and validation rules. Code-owned destinations can degrade into
  scattered route switch statements.
- **Why it matters:** Page-family, route, CMS, or theme changes would require
  synchronized edits and inevitably drift.
- **Severity:** High.
- **Likelihood:** High if the current raw-`href`, versionless Navigation model
  is extended.
- **Permanent prevention:** Use one provider-neutral discriminated grammar,
  canonical command/validator, small versioned Site-destination catalog,
  source-family resolver adapters, and one compiled public projection. Payload
  remains an adapter rather than a public or domain contract.

### 3. Edge cases — Concern: Yes

- **What could go wrong:** Empty Groups, blank or very long labels, Unicode
  variants, deleted or retired Pages, unavailable locales, disabled Site
  actions, duplicate destinations, removing a Group with children, target
  eligibility changing between preview and activation, or a Page moving while
  a draft is open can produce broken or confusing output.
- **Why it matters:** These are normal editorial events, not exotic failures.
- **Severity:** High overall; isolated copy issues are Medium.
- **Likelihood:** High.
- **Permanent prevention:** Trim and NFC-normalize labels; retain stable item
  IDs; permit incomplete facts only in private drafts; enforce complete release
  validation; use stable source-qualified references; re-prove eligibility at
  D1 activation; and preserve invalid references as repairable private intent
  rather than silently deleting them.

### 4. Footguns — Concern: Yes

- **What could go wrong:** Staff may paste an internal path, accidentally
  create nesting through drag, delete an entire Group, mistake Save for
  Publish, unknowingly duplicate a Give destination, or enable a surprising
  new tab.
- **Why it matters:** A small authoring mistake has Site-wide consequences.
- **Severity:** High.
- **Likelihood:** High in a generic schema or array editor.
- **Permanent prevention:** Lead with managed pickers; reject raw internal
  paths; make invalid nesting impossible; provide named movement actions and
  undo; require consequence confirmation for nonempty Group removal; show
  unmistakable Saved/Draft/Live states; and keep new-tab behavior external-only,
  secondary, and announced.

### 5. Tenant safety — Concern: Yes; shipment blocker

- **What could go wrong:** A picker, command, compiler, cache key, or public
  reader may mix Navigation or targets across Tenants, environments, Sites, or
  locales. The present tenant-only record, mutable-slug tenant bridge, and
  `siteId: null` seam cannot prove D1's scope.
- **Why it matters:** This would be a public cross-tenant disclosure and
  integrity failure.
- **Severity:** Critical.
- **Likelihood:** High if the current model is reused; Low after complete
  structural isolation and negative proof.
- **Permanent prevention:** Bind each purpose to a non-null exact-scope identity
  and immutable operational Tenant UUID; never use slug as identity; derive
  current membership server-side; reject every foreign-scope reference during
  writes, import, compile, and release; include complete scope and generation in
  projection/cache identity; and run cross-scope negative tests on every path.
  Picker filtering improves usability but is never authorization.

### 6. Over-engineering — Concern: Yes, as design pressure

- **What could go wrong:** “Flexibility” can expand into recursive menus,
  tenant-created regions, separate device copies, a utility bar, per-item
  workflows or audiences, arbitrary styling, CRDT collaboration, event sourcing,
  or a normalized graph.
- **Why it matters:** Staff comprehension, testability, and change safety would
  fall without demonstrated tenant value.
- **Severity:** Medium.
- **Likelihood:** Medium to High unless the exclusions remain explicit.
- **Permanent prevention:** Keep exactly Primary and Footer, Link or Group, one
  Group level, one semantic Primary action, one bounded revision snapshot per
  purpose, and code-owned capabilities. Add another purpose or shape only after
  a real workflow proves the need through a later decision.

### 7. UX/UI and user friction — Concern: Yes

- **What could go wrong:** Provider terminology, raw URLs, nested modals,
  ambiguous context, invisible hierarchy, unclear publication state,
  drag-only reordering, or Publish-time-only errors can make an infrequent,
  high-consequence task hard to learn and easy to get wrong.
- **Why it matters:** Many nonprofit staff are occasional Site editors and
  should not need CMS or information-architecture expertise.
- **Severity:** High for completion, confidence, and error rate.
- **Likelihood:** High with the present Payload-style array form.
- **Permanent prevention:** Use one quiet workspace with continuously visible
  scope, Primary/Footer sections, three plain-language Add choices, compact
  outline rows, paginated typed search, immediate inline validation, actual
  responsive preview, clear private/live language, direct repair actions,
  retained focus, announcement, undo, and both drag and named movement controls.

### 8. Hidden coupling — Concern: Yes

- **What could go wrong:** Purpose names can become JSX-specific; Page titles
  can silently control menu labels; Give links can copy Phase 22 routes;
  renderer limits can leak into tenant data; or Payload rows can become public
  API shapes.
- **Why it matters:** Theme, route, source-phase, and provider changes would
  become risky and require unrelated migrations.
- **Severity:** High.
- **Likelihood:** High without explicit adapters and ownership.
- **Permanent prevention:** Keep code-owned purpose and renderer-capability
  contracts; seed labels once rather than synchronize them; resolve stable
  source-qualified destinations through their owners; compile provider-neutral
  revisions; and let the Primary renderer present a Group as a disclosure while
  Footer presents the same semantic Group as a section heading.

### 9. Failure modes — Concern: Yes

- **What could go wrong:** Autosave can fail; two editors can overwrite one
  another; a target can become ineligible; compilation or serving-head CAS can
  fail; cache convergence can lag; or an unsafe released target can remain
  visible.
- **Why it matters:** Silent failure either loses staff work or exposes stale,
  broken, or unsafe public Navigation.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent prevention:** Show save state and retry; require expected-revision
  writes and retain the losing draft; re-prove membership and all dependencies
  immediately before the single D1 CAS; compile deterministically; leave the
  prior generation live on ordinary failure; suppress adverse facts first; and
  recover through an audited forward successor while monitoring convergence
  separately.

### 10. Data integrity risks — Concern: Yes

- **What could go wrong:** Multiple Primary or Footer identities may compete,
  order can drift, items can lose identity between revisions, URL normalization
  can conflate distinct destinations, or target deletion can cascade away
  historical evidence.
- **Why it matters:** Draft, preview, audit, migration, and public output would
  disagree.
- **Severity:** High.
- **Likelihood:** High if mutable arrays or “newest `updatedAt`” remain
  authoritative.
- **Permanent prevention:** Enforce one stable purpose identity per full scope;
  append immutable snapshots with stable item IDs, canonical order, schema
  version, and digest; compare external URLs conservatively; forbid cascading
  deletion of Navigation history; and have the active generation select an
  exact revision rather than `latest`.

### 11. Security and privacy risks — Concern: Yes

- **What could go wrong:** Cross-tenant references, `javascript:` or `data:`
  URLs, protocol-relative or credential-bearing links, tabnabbing, server-side
  URL fetching that enables SSRF, restricted targets in pickers, overbroad
  staff roles, or logs containing sensitive labels can harm visitors or workers.
  Developers may also falsely assume RLS protects Payload's privileged database
  connection.
- **Why it matters:** Navigation is trusted public chrome and can reach every
  visitor; false security assumptions defeat the tenant boundary.
- **Severity:** Critical for isolation; High for hostile destinations and
  privacy.
- **Likelihood:** Medium, but unacceptable without write-time and release-time
  controls.
- **Permanent prevention:** Permit only exact-scope eligible managed targets,
  code-owned destinations, and validated absolute HTTPS websites; never fetch
  external URLs; use announced `noopener noreferrer` new tabs; separate edit
  and publish capabilities; keep `cms` private and server-only; set Payload
  Local API overrides explicitly false for user operations; and redact content
  and restricted identities from broad telemetry.

### 12. Scalability and performance risks — Concern: Yes

- **What could go wrong:** The editor may load every Page, the compiler may
  query once per Link, very large menus may inflate DOM and payloads, RLS may
  perform correlated membership joins, or public requests may populate Payload
  relationships recursively.
- **Why it matters:** Larger tenants and more locales expose these patterns
  quickly.
- **Severity:** Medium.
- **Likelihood:** Medium if implemented naively.
- **Permanent prevention:** Use indexed server-paginated pickers, batched closure
  resolution, bounded item counts, efficient current-membership lookup, compact
  immutable projections, exact release-scoped cache keys, and one public
  projection read with no recursion or N+1 provider traversal. Prove query
  plans at representative scale.

### 13. Operational burden — Concern: Yes

- **What could go wrong:** Staff may need to repair Navigation after every Page
  move, synchronize separate mobile content, repeatedly certify healthy state,
  chase provider errors, or monitor external websites on every save.
- **Why it matters:** Tenants often have limited technical capacity and make
  Navigation changes infrequently.
- **Severity:** Medium.
- **Likelihood:** High without stable references and quiet derived health.
- **Permanent prevention:** Use stable managed identities, one desktop/mobile
  source, template-seeded starting Navigation, healthy-state silence,
  cause-owned exceptions, direct repair actions, and no synchronous external
  availability gate. A custom label is context, not a recurring task.

### 14. Observability gaps — Concern: Yes

- **What could go wrong:** Authorization denial, revision conflict, compile
  failure, broken released reference, adverse suppression, activation failure,
  stale projection, or cache lag may be indistinguishable or invisible.
- **Why it matters:** Staff and operators cannot tell whether the cause is
  authoring, source eligibility, permission, release, or delivery.
- **Severity:** High.
- **Likelihood:** High unless evidence is part of the contract.
- **Permanent prevention:** Emit privacy-safe structured evidence for scope,
  purpose, revision, generation, validation cause, denial, conflict,
  compilation, CAS, suppression, and projection/cache health; expose one
  actionable cause-owned staff exception; and retain actor/time audit without
  logging private copy, target URLs, tokens, or restricted identities.

### 15. Dependency and integration risks — Concern: Yes

- **What could go wrong:** Payload v4 behavior may change; Local API can bypass
  access and document locks by default; relationship filters may be mistaken
  for security; code-owned routes can drift; or a theme may be unable to render
  an accepted revision.
- **Why it matters:** Provider or shell behavior could silently change
  authorization or public output.
- **Severity:** Medium to High.
- **Likelihood:** Medium.
- **Permanent prevention:** Keep a provider-neutral domain boundary; qualify
  and test the exact installed Payload adapter; set `overrideAccess: false` and
  mutation `overrideLock: false`; validate scope independently of picker
  filters; use versioned destination resolvers; and make renderer-compatibility
  proof part of D1. Do not add Payload's multi-tenant plugin merely to duplicate
  Core's established tenant boundary.

### 16. Migration and upgrade risks — Concern: Yes

- **What could go wrong:** Current CMS Navigation rows, static Header and CTA
  facts, hard-coded Footer and legal links, `#` placeholders, broken paths,
  duplicates, and different public consumers may receive fuzzy or conflicting
  mappings.
- **Why it matters:** A partial cutover creates dual authority, route-specific
  behavior, and hard-to-reverse data loss.
- **Severity:** High.
- **Likelihood:** High because the competing sources exist now.
- **Permanent prevention:** Produce a complete Tenant/Site/locale census and
  exact mapped, excluded, or quarantined disposition for every item and
  consumer; map stable references only when proven; shadow-compile and compare
  production-shaped output; perform one surface-authority cutover with no
  permanent fallback; retain portable schema-versioned export; and recover
  forward.

### 17. Other development hazards — Concern: Yes

- **What could go wrong:** Time-of-check/time-of-use target races,
  last-write-wins autosave, React-only validation, stale preview identity,
  inconsistent URL parsers, incomplete rollback, unclear destination ownership,
  or tests limited to happy-path serialization can escape review.
- **Why it matters:** These hazards fail under concurrency and change rather
  than during a simple demonstration.
- **Severity:** High.
- **Likelihood:** Medium to High.
- **Permanent prevention:** Share one canonical invariant set across UI,
  command, import, and compiler; use expected revisions plus D1 CAS; re-prove
  exact target generation/digest; share URL validation; bind preview to the
  candidate identity; deploy expand → shadow → cut over → contract; recover by
  forward successor; assign explicit source owners; and require property,
  tenant-negative, concurrency, migration, accessibility, responsive rendering,
  URL-fuzz, and production-shaped performance tests.

## Ruthless synthesis and required order

B-prime survives the review and should advance as B-prime-R. The evidence does
not justify replacing it with a flat-only model, and it strongly argues against
an extensible menu builder. The permanent path is:

1. **Lock the semantic contract first:** exact scope and immutable Tenant
   identity, exactly Primary and Footer, structural Link-or-Group, typed
   destinations, stable item IDs, duplicate rules, two levels, and the
   renderer-tested capacity contract.
2. **Prove the tenant and command boundary:** one current-membership-based
   command for both Page-aware and Navigation-workspace actions, expected
   revision, complete target reproof, explicit Payload access/lock behavior,
   and no false RLS claim for the private privileged CMS connection.
3. **Make the simple staff experience real:** visible scope, compact outline,
   plain Add choices, accessible ordering and undo, safe destructive actions,
   source context without automatic relabelling, exact desktop/mobile preview,
   and clear private-versus-live status.
4. **Compile and activate only through D1:** complete closure and renderer
   proof, one bounded active-generation projection, one serving-head CAS,
   prior-generation continuity on ordinary failure, and adverse-first
   suppression with forward repair.
5. **Instrument and pressure-test the seams:** tenant negatives, revoked
   membership, stale writers, target races, long/localized labels, reflow,
   keyboard and pointer interaction, URL fuzzing, query plans, no-N+1 public
   reads, and cause-specific operational evidence.
6. **Migrate once and remove dual authority:** census every current source and
   consumer, quarantine ambiguous placeholders and paths, shadow-compare the
   compiled output, cut over the complete public surface, and remove lasting
   fallbacks only after proof.

This order solves the real risks without adding a Utility menu, recursive
graph, tenant-defined schemas, device-specific copies, workflow engine,
external-link crawler, CRDT, or event store. Those are not prerequisites for a
safe, flexible, or excellent nonprofit Navigation experience.

## Evidence the eventual specification must require

1. Exactly the same command and invariant set handles Page-context and
   Navigation-workspace placement.
2. Stable internal references survive Page-title, slug, and ancestor changes;
   raw internal paths are rejected.
3. Wrong-Tenant, environment, Site, locale, source-family, draft, retired, and
   restricted targets fail at every write and read path.
4. Group nesting beyond one child level is structurally impossible, not merely
   rejected by a fragile UI check.
5. Primary and Footer render semantic lists; Primary Groups use disclosure
   buttons, native Links remain anchors, current location is announced, and
   desktop/mobile wording, order, and destination stay identical.
6. Every reorder has keyboard and non-drag controls, retained focus, an
   accessible announcement, and undo.
7. D1 preview/release validates the complete destination closure, detects
   duplicate and broken intents, and leaves the prior complete generation live
   on failure.
8. Migration accounts for current CMS rows, static Header facts, CTA facts,
   Footer groups, legal links, placeholders, and every public consumer without
   dual authority.
9. Production-shaped tests prove bounded compile and public projection reads
   without recursion, N+1 queries, or per-request provider traversal.

## Explicit non-decisions

D5 will not decide global Page/block catalogs, templates, local/in-page
Navigation, search UX, authenticated application Navigation, social/profile
settings, exact Site-shell visual design, language switchers, forms, SEO,
publication scheduling, or Payload schema details. No D5 option authorizes
implementation, migration, issue publication, or deployment.
