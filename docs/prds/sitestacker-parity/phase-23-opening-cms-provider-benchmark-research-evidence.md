# Phase 23 Web Studio CMS Opening Provider and Benchmark Research Evidence

Research date: 2026-08-15

**Evidence status:** Opening-decision research only; no Phase 23 decision is
ratified by this document.

**Authority posture:** Primary and official sources only. Version facts were
checked against the live npm registry on the research date. Product behavior
was checked against official vendor documentation. Recommendations marked
**INFERRED** are architecture conclusions drawn from those documented facts,
not claims made by the vendors.

**Scope:** Payload release posture and the Payload capabilities most likely to
shape Phase 23; SiteStacker's content-versus-placement model; and selected
modern CMS patterns relevant to separating content, page placement, site plan,
navigation, preview, and public delivery. This is deliberately not a Phase 23
specification, implementation plan, plugin approval, or production-readiness
certification.

## Executive findings

1. **Payload 4 is not a stable provider baseline as of 2026-08-15.** The live
   registry reports `payload@3.88.0` as `latest`,
   `4.0.0-canary.28` as `canary`, and
   `4.0.0-internal.567a487` as `internal`. A GitHub tag named
   `v4.0.0-beta.0` exists, but `npm view payload@4.0.0-beta.0` returned
   `E404`; there is no corresponding npm package version. Payload's own v4
   announcement calls the release an early look, describes active work, and
   says beta and stable are future milestones. Sources:
   [official npm registry record](https://registry.npmjs.org/payload),
   [official GitHub `v4.0.0-beta.0` tag](https://github.com/payloadcms/payload/tree/v4.0.0-beta.0),
   and
   [Payload 4 announcement, 2026-06-09](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more).
2. **Payload supplies useful CMS primitives, not Asym's complete publication
   contract.** Payload documents versions, drafts, autosave, locks,
   localization, preview, jobs, and plugins. Several important defaults require
   an explicit Asym boundary: the Local API bypasses access control by default,
   Local API operations ignore locks by default, locale fallback is on by
   default, scheduled jobs require a separately running worker, the search
   plugin stores copied index rows, and the redirects plugin does not execute
   redirects. Sources:
   [Local API access control](https://payloadcms.com/docs/local-api/access-control),
   [locked documents](https://payloadcms.com/docs/admin/locked-documents),
   [localization](https://payloadcms.com/docs/configuration/localization),
   [job queues](https://payloadcms.com/docs/jobs-queue/queues),
   [search plugin](https://payloadcms.com/docs/plugins/search), and
   [redirects plugin](https://payloadcms.com/docs/plugins/redirects).
3. **The strongest cross-CMS pattern is separation, not a single giant page
   record.** SiteStacker separates reusable content in Content Explorer from
   published placement in Site Plan. Drupal distinguishes content from menus,
   views, blocks, and themes. Webflow distinguishes CMS items from page
   templates and Collection List placements. Contentful and Sanity separate
   editing/preview reads from public/published delivery. Sources:
   [SiteStacker Site Planner](https://training.sitestacker.com/support/solutions/articles/151000113983-site-planner-overview),
   [Drupal overview](https://www.drupal.org/docs/getting-started/understanding-drupal/overview-of-drupal),
   [Webflow CMS](https://help.webflow.com/hc/en-us/articles/33961307099027-Intro-to-the-Webflow-CMS),
   [Contentful API basics](https://www.contentful.com/developers/docs/references/api-basics/), and
   [Sanity presenting and previewing content](https://www.sanity.io/docs/content-lake/presenting-and-previewing-content).
4. **INFERRED: the opening founder decision should establish the canonical
   composition and release model, not choose a Payload plugin.** That decision
   controls the meaning of a page, reuse, routes, navigation, locale variants,
   Phase 22 placement, preview, redirects, release atomicity, search, and
   migration. Exact Payload v4 adoption remains a proof gate downstream.

## Payload release posture and qualification evidence

### Live package status

The following values were returned by `npm view <package> dist-tags --json` on
2026-08-15. Publication timestamps in the registry record show
`payload@3.88.0` published on 2026-08-11,
`payload@4.0.0-canary.28` on 2026-08-14, the repo-relevant older
`payload@4.0.0-internal.1f9ae9a` on 2026-06-03, and the then-current
`payload@4.0.0-internal.567a487` on 2026-08-14. Source:
[official `payload` registry metadata](https://registry.npmjs.org/payload).

| Package cohort checked                                                                                                                                              | `latest` | `canary`          | `internal`               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------- | ------------------------ |
| `payload`                                                                                                                                                           | `3.88.0` | `4.0.0-canary.28` | `4.0.0-internal.567a487` |
| `@payloadcms/db-postgres`, `@payloadcms/next`, `@payloadcms/ui`, `@payloadcms/richtext-lexical`, `@payloadcms/email-resend`, `@payloadcms/storage-vercel-blob`      | `3.88.0` | `4.0.0-canary.28` | `4.0.0-internal.567a487` |
| `@payloadcms/plugin-nested-docs`, `@payloadcms/plugin-multi-tenant`, `@payloadcms/plugin-search`, `@payloadcms/plugin-redirects`, `@payloadcms/plugin-form-builder` | `3.88.0` | `4.0.0-canary.28` | `4.0.0-internal.567a487` |

The companion-package rows were checked against their individual official
registry records:
[database adapter](https://registry.npmjs.org/%40payloadcms%2Fdb-postgres),
[Next.js package](https://registry.npmjs.org/%40payloadcms%2Fnext),
[admin UI](https://registry.npmjs.org/%40payloadcms%2Fui),
[Lexical editor](https://registry.npmjs.org/%40payloadcms%2Frichtext-lexical),
[Resend adapter](https://registry.npmjs.org/%40payloadcms%2Femail-resend),
[Vercel Blob adapter](https://registry.npmjs.org/%40payloadcms%2Fstorage-vercel-blob),
[nested-docs plugin](https://registry.npmjs.org/%40payloadcms%2Fplugin-nested-docs),
[multi-tenant plugin](https://registry.npmjs.org/%40payloadcms%2Fplugin-multi-tenant),
[search plugin](https://registry.npmjs.org/%40payloadcms%2Fplugin-search),
[redirects plugin](https://registry.npmjs.org/%40payloadcms%2Fplugin-redirects),
and
[form-builder plugin](https://registry.npmjs.org/%40payloadcms%2Fplugin-form-builder).

Payload's June 2026 announcement says the v4 admin redesign is already visible
on `main`, but describes hierarchy and asset work as still active, calls the
demo early, notes known CSS issues, and targets beta within the following
quarter with stable afterward. Source:
[Payload 4 announcement](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more).

**INFERRED consequence:** neither a Git tag nor a matching set of npm dist-tags
is sufficient production evidence. If Phase 23 retains the current internal v4
direction, it needs an exact-version qualification matrix over the entire
Payload package cohort: clean install, upgrade from the existing schema,
generated types and import map, admin build/start, PostgreSQL migrations,
draft/public access, tenant isolation, plugin behavior, background work, and a
proved data restore or stable-v3 fallback. The need for cohort qualification is
supported by the synchronized package tags above; the need for access and
worker qualification is supported by Payload's documented Local API and jobs
defaults:
[Local API access control](https://payloadcms.com/docs/local-api/access-control)
and [job queues](https://payloadcms.com/docs/jobs-queue/overview).

## Payload primitives and the boundaries they do not settle

### Versions, drafts, autosave, and locks

- Payload versions create a separate versions collection, retain full document
  snapshots, support history, diffing, restoration, draft preview, access
  control, autosave, and scheduled publishing. The default collection maximum
  is 100 versions per document; `0` keeps all versions. Source:
  [Versions overview](https://payloadcms.com/docs/versions/overview).
- Drafts add `_status`. After the first draft creates the underlying document,
  later draft saves can write only to the versions table; therefore the
  existence of a row in the main collection is not proof that it is safe to
  publish. Reads and writes have an explicit `draft` option. Source:
  [Drafts](https://payloadcms.com/docs/versions/drafts).
- Autosave is draft-based and defaults to an 800 ms interval; configuration can
  hide the manual Save Draft action. Source:
  [Autosave](https://payloadcms.com/docs/versions/autosave).
- Document locks are enabled by default and expose read-only, takeover, and
  return choices. The default lock duration is 300 seconds. Local API calls
  ignore locks by default through `overrideLock: true`; callers must opt into
  lock enforcement. Source:
  [Locked documents](https://payloadcms.com/docs/admin/locked-documents).

**INFERRED consequence:** Payload's document history can back content editing,
but Phase 23 still needs one explicit Asym release identity tying the approved
content versions to page placement, route, navigation, locale, redirect,
search, and cache consequences. Provider autosave and locks must not be
mistaken for approval or release.

### Access, tenants, and locale

- Payload's Local API skips access control by default. User-initiated requests
  must pass both a user and `overrideAccess: false`; merely supplying a user
  does not enable access control. Source:
  [Local API access control](https://payloadcms.com/docs/local-api/access-control).
- The multi-tenant plugin adds tenant relationships, an admin tenant selector,
  tenant filtering, tenant-aware relationship filtering, automatic tenant
  assignment, and optional tenant-scoped globals. It can disable its base
  filter or tenant access, and its tenant-deletion cleanup defaults to deleting
  or detaching related records. Source:
  [Multi-tenant plugin](https://payloadcms.com/docs/plugins/multi-tenant).
- Payload localization defines locales and a default locale while individual
  fields opt into localization. Locale fallback is enabled by default and can
  be disabled per query. Draft status localization is documented as a beta
  option. Sources:
  [Localization](https://payloadcms.com/docs/configuration/localization) and
  [localized draft status](https://payloadcms.com/docs/versions/drafts#draft-localization).

**INFERRED consequence:** the plugin can improve editor ergonomics but cannot
be treated as Asym's tenant firewall. All Local API calls, version queries,
preview routes, jobs, media relationships, search rows, and deletion paths need
the same proved tenant/site/locale boundary. Locale fallback needs an explicit
product rule so a missing translation cannot silently publish another locale.

### Hierarchy and placement

- The nested-docs plugin adds a parent relationship and generated breadcrumbs;
  changing a parent recursively updates descendants. It supports localized
  fields and warns custom parent filters to continue preventing a document
  from becoming its own parent. Source:
  [Nested Docs plugin](https://payloadcms.com/docs/plugins/nested-docs).
- Payload's v4 announcement says a new hierarchy experience is in active
  development and is expected eventually to replace the nested-docs plugin.
  Source:
  [Payload 4 announcement](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more).

**INFERRED consequence:** a provider hierarchy can be an adapter-level storage
or editor primitive, but it is not by itself a versioned Site Plan. Phase 23
must own cycle prevention, route collision checks, move consequences,
redirects, navigation consistency, invalidation, and migration between nested
docs and any future core hierarchy.

### Preview, schedules, search, redirects, and forms

- Payload Live Preview embeds a frontend in an iframe and sends live document
  data with `window.postMessage`; its URL can vary by tenant, locale, or other
  document conditions. Server-side preview refreshes after draft save,
  autosave, or publish rather than after every keystroke. Sources:
  [Live Preview overview](https://payloadcms.com/docs/live-preview/overview) and
  [server-side Live Preview](https://payloadcms.com/docs/live-preview/server).
- A scheduled Payload task enqueues work; it does not execute the business
  action. Jobs do not run until a worker picks them up. Payload warns against
  duplicate scheduling mechanisms and says serverless deployments should use
  an external cron-triggered endpoint rather than `autoRun`. Sources:
  [Schedules](https://payloadcms.com/docs/jobs-queue/schedules),
  [queues and workers](https://payloadcms.com/docs/jobs-queue/queues), and
  [jobs overview](https://payloadcms.com/docs/jobs-queue/overview).
- The search plugin copies configured source fields into a separate search
  collection, synchronizes create/update/delete changes, supports reindexing,
  and does not run source collection hooks while querying search rows. Source:
  [Search plugin](https://payloadcms.com/docs/plugins/search).
- The redirects plugin stores and manages redirect records but explicitly does
  not execute them; the frontend must query and apply redirects. Source:
  [Redirects plugin](https://payloadcms.com/docs/plugins/redirects).
- The form-builder plugin lets editors define form schemas, stores submissions,
  supports confirmation messages or redirects, email, and optional payment
  fields; the frontend still owns rendering. Source:
  [Form Builder plugin](https://payloadcms.com/docs/plugins/form-builder).

**INFERRED consequences:**

- Preview must use a non-public, tenant- and actor-scoped token/session and the
  same renderer as production; raw `postMessage` input is not public truth.
- Scheduled release needs one execution owner, idempotent release identity,
  late/missed-run handling, and observability. A scheduled timestamp alone is
  not evidence that a release occurred.
- Public search should index only a publication-safe release projection. The
  copied index must carry tenant, site, locale, reach, release, and safety
  qualifiers and must converge adversely on unpublish or restriction.
- Redirect execution, status codes, loop/chain prevention, locale/host scope,
  cache invalidation, and observability belong to the public runtime contract.
- Form Builder is a potential editor primitive, not authority to bypass Asym's
  existing giving, identity, consent, workflow, or operational boundaries.

## SiteStacker: the useful model and the migration trap

SiteStacker's Site Planner separates two work areas. Content Explorer creates
and organizes content, while Site Plan publishes content into sites, folders,
pages, and page placements. A single page may place multiple content items;
folders can publish dynamic content and inherited items. Menus are managed
separately, and wrappers/views influence placement and presentation. Sources:
[Site Planner Overview](https://training.sitestacker.com/support/solutions/articles/151000113983-site-planner-overview),
[Site Plan](https://training.sitestacker.com/support/solutions/articles/151000101088-site-plan),
[Dynamic Content](https://training.sitestacker.com/support/solutions/articles/151000101243-dynamic-content),
[Wrapper](https://training.sitestacker.com/support/solutions/articles/151000101240-wrapper),
and
[View Class](https://training.sitestacker.com/support/solutions/articles/151000101367-view-class).

**DOCUMENTED strength:** reusable content and public placement are different
things. Creating content does not automatically publish it, and placing an item
does not need to duplicate the content.

**INFERRED migration warning:** Asym should preserve that separation but should
not reproduce SiteStacker's provider vocabulary, wrapper/view-class model, or
every legacy visibility interaction. The Phase 23 product can present one calm
Web Studio while keeping a small typed internal model.

## Current CMS benchmarks

### Drupal

Drupal's official overview distinguishes content entities from navigation
menus, Views that create lists, blocks placed into page regions, and themes
that control presentation. It explains that the same content can be arranged
for different audiences. Source:
[Drupal conceptual overview](https://www.drupal.org/docs/getting-started/understanding-drupal/overview-of-drupal).

**INFERRED lesson:** content, navigation, list composition, placement, and
presentation should not be collapsed merely because the staff UI makes them
feel like one workflow.

### Webflow

Webflow describes Collections and Collection items as structured content. A
Collection Page supplies the shared template for every item, while Collection
Lists place filtered or sorted dynamic items on static or dynamic pages. Pages
and folders are managed in a separate Pages panel. Sources:
[Webflow CMS](https://help.webflow.com/hc/en-us/articles/33961307099027-Intro-to-the-Webflow-CMS),
[Collection Lists](https://help.webflow.com/hc/en-us/articles/33961294051347-Collection-list),
and
[Pages panel](https://help.webflow.com/hc/en-us/articles/33961360067987-Pages-panel-overview).

**INFERRED lesson:** a visual-builder experience can remain approachable while
keeping content sources, repeated templates, dynamic list placements, and the
page tree distinct.

### Contentful

Contentful provides a Content Management API for authoring, a Content Delivery
API for published content, and a Content Preview API for drafts. The Preview
API uses a separate host and preview token; a production delivery token does
not work against it. Sources:
[Contentful API basics](https://www.contentful.com/developers/docs/references/api-basics/)
and
[Content Preview API](https://www.contentful.com/developers/docs/references/content-preview-api/overview/).

**INFERRED lesson:** authoring, preview, and public delivery should be distinct
planes even when they share a renderer and one editor workflow.

### Sanity

Sanity documents draft, published, and release perspectives and recommends the
published perspective for production. Its Presentation tool connects
structured content to the frontend for visual editing and preview. Sources:
[Presenting and previewing content](https://www.sanity.io/docs/content-lake/presenting-and-previewing-content)
and
[Preview and page building](https://www.sanity.io/docs/user-guides/preview-and-page-building).

**INFERRED lesson:** visual editing is a controlled view over structured
content; production must deliberately select published truth rather than reuse
an editor or preview read path.

## Recommended opening decision

The single highest-leverage opening question is:

> **In Web Studio, is a Page the content itself, or is it a stable place in a
> versioned Site Plan that composes independently reusable content and
> source-owned dynamic records?**

### Option A — Page is content

One record owns the route, content, navigation fields, locale state, and
publication state. This is the shortest initial path, but reuse, moves,
Phase 22 specialized pages, multi-placement content, locale handling, and
atomic site changes become coupled.

### Option B — Unbounded placement graph

Every item, block, page, route, audience, and relationship can be independently
composed. This maximizes theoretical flexibility but exposes graph complexity,
creates difficult validation and release semantics, and risks recreating a
legacy CMS inside Asym.

### Option C-prime — Typed composition under one Site Plan release

**Recommended for the grill.** Keep four bounded concepts:

1. **Content Item** — independently reusable editorial material.
2. **Page** — stable site-, route-, and presentation-family identity.
3. **Page Placement** — a typed, ordered reference that composes editorial
   content or an owning-phase dynamic source into a bounded page slot.
4. **Navigation** — an intentional ordered view over eligible pages and links,
   not a side effect of the page tree.

Structural changes activate through one immutable, site- and locale-qualified
**Site Plan Release** consumed by the public runtime. Payload supplies
content-management primitives behind a version-qualified adapter. Operational
records remain referenced rather than copied. Phase 22 missionary/project
pages enter as typed source-owned page subjects or placements and are not
rebuilt by Phase 23.

This recommendation follows the reusable-content/placement separation in
[SiteStacker](https://training.sitestacker.com/support/solutions/articles/151000113983-site-planner-overview),
the content/menu/view/block separation in
[Drupal](https://www.drupal.org/docs/getting-started/understanding-drupal/overview-of-drupal),
the item/template/list/page separation in
[Webflow](https://help.webflow.com/hc/en-us/articles/33961307099027-Intro-to-the-Webflow-CMS),
and the authoring/preview/delivery separation in
[Contentful](https://www.contentful.com/developers/docs/references/api-basics/)
and
[Sanity](https://www.sanity.io/docs/content-lake/presenting-and-previewing-content).
It is deliberately a product/domain decision, not an endorsement of any one
Payload hierarchy or page-builder plugin.

## What this evidence does not decide

- It does not approve Payload v4, any internal/canary build, or any plugin for
  production.
- It does not select the Phase 23 block catalog, page families, route/slug
  policy, menu inheritance, locale-release policy, form scope, scheduling UX,
  redirect rules, migration algorithm, or cache topology.
- It does not change Phase 22 ownership of missionary/project page truth or any
  earlier phase's operational authority.
- It does not prove SiteStacker export completeness or migration feasibility;
  those require tenant export samples and a source-to-target coverage manifest.
- It does not make Payload's admin UI the tenant staff product or allow public
  runtime reads from authoring/preview paths.
