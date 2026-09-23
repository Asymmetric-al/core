# Phase 23 D2 Page-tree and public-path authority — Research Evidence

**Status:** Pre-decision research for the active Phase 23
`grill-with-docs` session
**Date:** 2026-08-15
**Authority:** Evidence only; this document does not ratify D2, create a PRD,
approve a provider, authorize implementation, or change production behavior

## Decision seam

Phase 23 D1 established one stable Site-scoped Page identity, separate
Editorial and Page Placement Revision axes, and one coherent Public Site
Generation. It did not decide what a Page's parent means to public URLs or when
a move becomes public.

The next founder decision is whether the Page tree:

1. organizes Pages for staff but does not determine URLs;
2. determines live hierarchical URLs immediately; or
3. determines candidate hierarchical URLs that become public only through a
   validated Site Plan release.

Stable Page identity survives path changes under every credible option. The
decision is about public-path derivation and activation, not record identity.

## Current repository evidence

- [`pages.ts`](../../../apps/admin/src/cms/collections/pages.ts) stores a flat
  slug with no durable parent, Site, locale, or full-path authority.
- [`resolve-tenant.ts`](../../../apps/admin/src/cms/public/resolve-tenant.ts)
  currently leaves `siteId` unresolved, so the present implementation cannot
  satisfy the accepted first-class Site boundary.
- [`navigation.ts`](../../../apps/admin/src/cms/collections/navigation.ts) is a
  mutable/versionless structure containing literal URLs. It is evidence of a
  temporary bridge, not a safe move or publication contract.
- The current CMS migration indexes slugs but does not establish the required
  same-scope route uniqueness or concurrent route-claim invariant.
- The governed public content reader is a durable seam, but its current
  newest-row/limited-query behavior is not collision resolution or route
  authority.
- Phase 2 requires Site to be a first-class presentation/attribution boundary;
  Phase 5 requires public CMS resolution by Site; Phase 10 retains current
  adverse publication authority; and founder-ratified Phase 22 keeps Public
  Ministry Page identity Site-scoped.

The existing flat slug, raw navigation URL, and provider-document lifecycle are
therefore current-state evidence only. They do not settle D2.

## Official benchmark findings

### SiteStacker

SiteStacker separates Content Explorer from Site Plan. Its Site Plan uses
folders and Page aliases to affect public addresses, while menus remain a
separate content type. That validates the usefulness of a public structural
tree without requiring Asym to copy SiteStacker's arbitrary inherited-content
or visibility model.

Sources:

- [Site Planner overview](https://training.sitestacker.com/support/solutions/articles/151000113983-site-planner-overview)
- [Overview of menus](https://training.sitestacker.com/support/solutions/articles/151000118914-overview-of-menus)

### Payload

Payload's nested-docs plugin adds parent and breadcrumb fields and recursively
updates descendants after a parent or ancestor slug changes. That is a useful
hierarchy primitive but also demonstrates why plugin mutation cannot itself be
Asym's public release authority: one edit can cascade across every descendant
before public route, redirect, search, cache, and source-safety proof has
converged.

Source: [Payload nested-docs plugin](https://payloadcms.com/docs/plugins/nested-docs)

### Search and URL continuity

Google's current site-move guidance recommends preparing and testing the new
site, making an exact old-to-new URL mapping, and configuring server-side
redirects. Public URL changes therefore require a coherent mapping and
observable crawl convergence; a CMS parent mutation alone is insufficient.

Source:
[Google Search Central — site moves with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)

### Accessibility

WCAG 2.2 requires a single-pointer alternative to dragging functionality, and
keyboard access remains separately required. A Page-tree product may offer
drag-and-drop, but must also offer a named **Move Page** action, parent selector,
and ordering controls with correct focus and announcements.

Sources:

- [WCAG 2.2 Understanding 2.5.7 — Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)
- [WAI-ARIA Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)

## Options

### Option A — Flat public paths; tree is staff organization only

A Page stores an independently managed full path. Moving it in Web Studio
changes only staff organization.

**Benefits**

- no descendant URL cascade from tree movement;
- smaller redirect fan-out; and
- simpler initial structural writes.

**Costs and risks**

- the visible tree, public URL, and breadcrumbs can disagree;
- staff must manage two structural truths;
- “Move Page” has a surprising non-public meaning;
- path consistency relies on manual work; and
- Web Studio loses much of the useful Site Plan model.

### Option B — Live hierarchical paths

The current parent plus slug always determines the live path. Moving a Page
immediately changes its address and every descendant address.

**Benefits**

- direct hierarchy/URL mental model; and
- fewer explicit draft-versus-live concepts.

**Costs and risks**

- one drag can immediately break many public URLs;
- draft work leaks into public structure;
- collision, redirect, search, sitemap, menu, and cache work can partially
  converge;
- concurrent moves can create cycles or duplicate paths; and
- provider rollback can resurrect obsolete or unsafe routes.

This is not safe enough for Asym's multi-tenant public boundary.

### Option C-prime — Staged hierarchical paths under one Site Plan release

The released Page tree determines ordinary canonical paths and breadcrumbs:

```text
released parent path + released slug = released canonical path
```

Moving a Page or changing a slug changes only the candidate Site Plan until one
validated successor Public Site Generation activates the complete new route
mapping. Reordering siblings does not change paths. Menus remain separate and
use stable Page references. Staff-only content folders do not become public
URL structure.

Before release, Web Studio shows the exact affected descendants, old-to-new
paths, conflicts and reservations, generated redirects, stable internal-link
effects, menu warnings, and search/sitemap/cache consequences. Healthy moves
remain concise; only real blast radius or blockers expand the review.

**Benefits**

- tree, canonical paths, and ordinary breadcrumbs stay coherent;
- no public route changes while an editor experiments;
- D1's generation has one precise structural responsibility;
- redirects and dependent public artifacts share one exact route manifest;
- stable Page references survive moves; and
- the contract is provider-neutral and compatible with Phase 2/5/10/22.

**Costs and permanent mitigations**

- impact calculation is required: keep it bounded, chunked, content-addressed,
  and generation-observable;
- draft versus live must be clear: show current and proposed paths side by side
  only when they differ;
- concurrent structure requires proof: use database-enforced same-scope route
  claims, cycle checks, expected base generations, and CAS activation; and
- large moves can be expensive: prepare them non-authoritatively while the
  prior complete generation continues serving.

## Concrete scenario

Hope Mission currently serves:

```text
/about
/about/our-team
/about/our-team/kenya
```

A staff editor moves **Our Team** beneath **Where We Serve**. Under C-prime,
Web Studio previews:

```text
/about/our-team       → /where-we-serve/our-team
/about/our-team/kenya → /where-we-serve/our-team/kenya
```

The product reports two path changes and two required redirects, warns about a
menu reference without silently moving it, confirms that stable internal Page
links will resolve to the new routes, and blocks release on a reserved-route or
same-scope collision. The old complete tree remains public until activation.
If preparation fails, nothing public changes.

The same operation is available through **Move Page** and a parent selector;
drag-and-drop is optional.

## Recommendation

Recommend **Option C-prime — staged hierarchical paths under one Site Plan
release** with these initial constraints:

- Page identity never equals URL;
- released parent plus released slug determines the ordinary canonical path;
- candidate structure has no public effect;
- sibling order does not change URLs;
- internal links and menus use stable Page references;
- menus never move automatically with Pages;
- route scope includes exact Tenant, Site, and locale seam from the start;
- route claims and hierarchy integrity are structurally enforced;
- the hierarchy provider/plugin is an adapter, never public authority;
- no arbitrary full-path override ships initially; and
- current Phase 10/22 adverse narrowing outranks ordinary release cadence.

## Adversarial scenarios required after founder selection

- two editors concurrently claim the same normalized path;
- a stale structural candidate attempts to activate after a newer generation;
- moving one parent changes 2,000 descendant paths;
- the home/root Page is moved, duplicated, or retired;
- a candidate creates a parent cycle;
- one locale lacks the candidate parent;
- a path collides with checkout, API, media, preview, donor portal, or Phase 22;
- a restricted missionary's old route could reveal protected identity;
- a menu points to an unavailable destination;
- generated redirects form a chain or loop;
- cache/search/sitemap convergence fails after activation;
- migration contains duplicate or Unicode-equivalent current paths; and
- recovery would restore a now-unsafe route.

## Non-decisions

This evidence does not yet ratify D2 or decide:

- exact maximum tree depth or capacity budget;
- home/root UX;
- slug normalization and transliteration rules;
- redirect retention and chain-flattening policy;
- locale-tree alignment or fallback;
- exact menu types or publication cadence;
- exact Page families or block catalog;
- a Payload hierarchy plugin or Payload version; or
- schema, migration, issue, or implementation details.

## UX benchmark and adversarial audit

This section tests C-prime as an editorial product, not only as a route model.
Its recommendations remain **INFERRED** planning guidance and do not ratify D2.

### What current authoring products establish

- **WordPress:** selecting a parent creates a visible Page hierarchy and the
  permalink reflects it, while adding the Page to navigation is a separate
  action. This supports one understandable parent/path relationship without
  silently treating the tree as a menu.
  [WordPress — Create pages](https://wordpress.org/documentation/article/create-pages/)
- **Webflow:** staff can choose a parent folder in Page settings as an
  alternative to drag-and-drop. Its own documentation warns that moving a
  published Page or folder changes URLs and can break links; changing a slug
  can create an automatic 301 when the editor selects that option. This is a
  strong usability benchmark but a warning that Asym should generate required
  continuity by construction instead of making it an easy-to-miss checkbox.
  [Webflow — Pages panel](https://help.webflow.com/hc/en-us/articles/33961360067987-Pages-panel-overview),
  [Webflow — 301 redirects](https://help.webflow.com/hc/en-us/articles/33961294898835-How-do-I-set-up-redirects-in-Webflow)
- **Payload:** folders are an internal grouping primitive distinct from the
  nested-docs parent/breadcrumb cascade. Preview can link directly to a draft
  front end. These are useful adapter capabilities, but neither says that a
  provider tree mutation is a safe public move.
  [Payload folders](https://payloadcms.com/docs/folders/overview),
  [Payload preview](https://payloadcms.com/docs/admin/preview)
- **Sanity:** its Presentation tool keeps draft and published perspectives
  distinct and provides desktop/mobile preview controls. This supports showing
  a candidate route in context before release; it does not justify exposing a
  provider-specific release model to ordinary staff.
  [Sanity — Preview and page building](https://www.sanity.io/docs/user-guides/preview-and-page-building)
- **Drupal:** its current guide pairs drag reordering with a non-drag numeric
  “row weights” mode. The capability is useful; the jargon is not. Asym should
  expose plain **Move up**, **Move down**, and **Move Page** controls rather
  than ask staff to understand weights.
  [Drupal — Changing the order of navigation](https://www.drupal.org/docs/user_guide/en/menu-reorder.html)

### Four-action interaction contract

| Staff action        | Default experience                                                                                                | Consequence disclosure                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reorder siblings    | Reorder inline by drag, keyboard, or named up/down actions; keep the Page selected and announce the new position. | Quiet “Order updated in draft”; no URL warning because no address changes.                                                                            |
| Change one slug     | Label the field **Web address** and show the complete current and proposed URL beneath it.                        | “1 address will change; the old address will redirect.” Show collision/reserved-route errors beside the field before release.                         |
| Move a small branch | Use **Move Page** with a searchable parent selector; drag is only a shortcut.                                     | A concise confirmation names the destination and exact affected count, then offers **Review changes** or **Move in draft**. No generic danger dialog. |
| Move a large branch | Use the same action, then open a dedicated impact review rather than expanding thousands of rows in the tree.     | Group old-to-new paths, support search/export, identify blockers first, and prepare in the background while the current Site remains live.            |

### Preview, progress, and failure language

- Preview must show **Current public address** and **After publish** only when
  they differ. An ordinary reorder should not display route machinery.
- Generated redirects are part of the candidate consequence summary, not a
  separate settings chore. Staff may inspect them, but a safe permanent move
  does not depend on remembering a checkbox.
- For a large preparation, show determinate progress when the total is known
  (for example, “Checking 384 of 1,240 addresses”) and a calm status message.
  Do not steal keyboard focus for routine progress.
- A blocker names the Page, the conflicting path or rule, and the corrective
  action. On failure, say **Nothing was published; the current site is still
  live**. Preserve the candidate so staff can correct and retry.
- Activation success reports the generation and affected-address count without
  claiming that Google, Bing, caches, or sitemaps have already converged.

Google requires an old-to-new URL mapping, permanent server-side redirects,
updated internal links, and testing; Bing likewise emphasizes crawl checks,
canonicals, sitemaps, redirects, and monitoring. That evidence supports one
prepared route manifest and honest post-release convergence, not extra editor
ceremony.
[Google site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes),
[Google redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects),
[Bing website migration](https://blogs.bing.com/webmaster/december-2020/Website-Migration-with-Bing)

### Mobile, keyboard, and screen-reader requirements

- On narrow screens, default to searchable Page rows and the parent-selector
  action; do not shrink a wide desktop tree into a precision-drag surface.
- A visible single-pointer alternative is required for every drag operation.
  Keyboard support alone is not a substitute.
- If a tree widget is used, implement the APG tree keyboard model—arrow keys,
  Home/End, expand/collapse, visible focus, and type-ahead—while keeping focus
  distinct from selection.
- Announce reorder results, affected counts, preparation progress, and success
  as programmatically determinable status messages without moving focus.
- Identify each collision or invalid destination in text, link the summary to
  the affected control, and move focus to the review heading only when a
  blocking review or failure view opens.

Sources:
[WCAG 2.2 — Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements),
[WAI-ARIA Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/),
[W3C ARIA25 progress status](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA25),
[WCAG 2.2 — Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)

### UX conclusion

C-prime stays low-friction when consequence disclosure is proportional: no
confirmation for URL-neutral reorder, one-line continuity for a slug change,
and a searchable impact review only for a genuinely large branch. Use one
**Move Page** action everywhere; change the depth of review, not the mental
model.
