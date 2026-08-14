# CMS runtime architecture

**Canonical Web Studio narrative (phases 1–3+, diagrams, stack map):** [`web-studio-living-spec.md`](./web-studio-living-spec.md)

## Runtime placement

Payload runs in `apps/admin` and is exposed through:

- Admin UI: `/web-studio`
- REST/GraphQL routes under `(payload)` route group
- Public CMS routes: `/api/cms/public/*`

This keeps CMS management inside Mission Control and avoids running multiple Payload runtimes.

### Web Studio (Phase 2–3 — editorial collections + product flows)

Mission Control–native Web Studio shell + shared list/document workspaces cover editorial collections under `apps/admin/src/cms-ui/web-studio/`, including Phase 3 builder collections:

- `pages`
- `navigation`
- `missionary-profiles`
- `ministry-updates`
- `media`
- `page-templates`
- `missionary-giving-pages`
- `project-pages`

Top-level Payload admin views (still under `/web-studio`) provide template gallery and create wizards:

- `/web-studio/templates` — browse `page-templates` (includes `draft=true` so draft templates appear)
- `/web-studio/missionaries` — Supabase-backed missionary directory shortcuts
- `/web-studio/pages/give` — missionary giving page wizard
- `/web-studio/projects/new` — fund-backed project page wizard
- `/web-studio/pages/new-from-template` — standard page from template
- `/web-studio/ministry-updates/new` — ministry update starter from template

Draft instantiation uses the Payload root endpoint `POST /api/web-studio/create-from-template` (see `apps/admin/src/cms/create-from-template-endpoint.ts`), which runs inside Payload so collection access hooks apply.

Registration is collection-scoped via `admin.components.views` in each collection config and guarded by env rollout flags:

- `CMS_WEB_STUDIO_NATIVE_PAGES`
- `CMS_WEB_STUDIO_NATIVE_NAVIGATION`
- `CMS_WEB_STUDIO_NATIVE_MISSIONARY_PROFILES`
- `CMS_WEB_STUDIO_NATIVE_MINISTRY_UPDATES`
- `CMS_WEB_STUDIO_NATIVE_MEDIA`
- `CMS_WEB_STUDIO_NATIVE_PAGE_TEMPLATES`
- `CMS_WEB_STUDIO_NATIVE_MISSIONARY_GIVING_PAGES`
- `CMS_WEB_STUDIO_NATIVE_PROJECT_PAGES`

Payload remains authoritative for schema, access, list state, and the document form runtime (including Lexical, relationships, arrays, and uploads). The native shell currently owns the **default** list/edit surfaces; nested document subviews such as versions/API/live-preview still use stock Payload routing/components unless a collection-specific wrapper is added later. See:

- `docs/guides/architecture/web-studio-phase1.md`
- `docs/guides/architecture/web-studio-phase2.md`

## Data model boundaries

- Existing platform tables remain in `public`.
- Payload-managed CMS tables live in `cms` schema.
- SQL schema creation: `supabase/migrations/20260223100000_create_cms_schema.sql`
- Payload migration execution is handled by `bun run cms:migrate`.

## Authentication model

- Supabase remains the identity provider.
- Payload auth uses a custom Supabase session strategy (`supabase-strategy`).
- Admin middleware enforces staff/admin/super-admin access before `/web-studio` routes.

## Tenant isolation model

- Shared tenant context is derived from authenticated CMS user data.
- Collection access is deny-by-default and tenant-scoped for non-super-admin users.
- Public endpoints resolve tenant from:
  1. host / forwarded host primary-domain match
  2. subdomain slug fallback when the host is not `www` or `localhost`
  3. `?tenant=<slug>` fallback only when the host does not resolve a tenant
  4. development/test-only loopback fallback from `CMS_LOCAL_DEFAULT_TENANT_SLUG`
- Public endpoints use explicit tenant + published-only filters.

## Public rendering flow

1. Donor app requests CMS data from `apps/admin` public CMS endpoints.
2. Admin endpoint resolves tenant context and applies published-only filters.
3. Donor app classifies public CMS read results before routing: content misses become `notFound()`, while CMS outages remain unavailable errors.
4. Donor app renders fallback content for unmatched routes from returned CMS page data.

### Published page-like content module

Published page-like content has one conceptual module with runtime-owned adapters:

- `packages/lib/cms/public-page.ts` owns shared descriptors, response/result types, path normalization, and cache tags for standard pages, missionary giving pages, and project pages.
- `packages/lib/cms/public-page-renderer.tsx` owns the supported server-side Lexical renderer and URL sanitization for public page content.
- `apps/admin/src/cms/public/published-page-read.ts` owns the Payload Local API adapter: collection selection, tenant predicate, `_status = published`, and JSON response shaping.
- `apps/donor/lib/cms/client.ts` owns the donor HTTP/cache adapter: `CMS_BASE_URL`, forwarded host, `fetch` cache policy, and result classification.

Payload runtime access stays in `apps/admin`; donor and shared packages must not import the Payload client directly.

## API surface and contracts

### Staff-only management APIs (Payload runtime)

| Method                              | Endpoint                         | Auth                    | Source file                                       | Notes                                                                 |
| ----------------------------------- | -------------------------------- | ----------------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| `GET/POST/PATCH/PUT/DELETE/OPTIONS` | `/api/*` (Payload REST handlers) | Staff/Admin/Super Admin | `apps/admin/app/(payload)/api/[...slug]/route.ts` | Includes collection CRUD and upload operations from Payload REST API. |
| `POST/OPTIONS`                      | `/api/graphql`                   | Staff/Admin/Super Admin | `apps/admin/app/(payload)/api/graphql/route.ts`   | Payload GraphQL endpoint for admin-authorized queries and mutations.  |

### Public, tenant-scoped read APIs

| Method | Endpoint                               | Tenant resolution                                      | Source file                                                    | Response contract                                                                    |
| ------ | -------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `GET`  | `/api/cms/public/pages/:slug*`         | host domain match, subdomain fallback, then `?tenant=` | `apps/admin/app/api/cms/public/pages/[...slug]/route.ts`       | `{ tenant: { slug }, page }` on success, `404` with `{ error }` otherwise            |
| `GET`  | `/api/cms/public/missionary-pages/:id` | same                                                   | `apps/admin/app/api/cms/public/missionary-pages/[id]/route.ts` | `{ tenant, page }` for published `missionary-giving-pages` matched by `missionaryId` |
| `GET`  | `/api/cms/public/project-pages/:slug`  | same                                                   | `apps/admin/app/api/cms/public/project-pages/[slug]/route.ts`  | `{ tenant, page }` for published `project-pages` matched by `slug`                   |
| `GET`  | `/api/cms/public/navigation`           | host domain match, subdomain fallback, then `?tenant=` | `apps/admin/app/api/cms/public/navigation/route.ts`            | `{ tenant: { slug }, navigation }` where `navigation` can be `null`                  |
| `GET`  | `/api/cms/public/updates?limit=5`      | host domain match, subdomain fallback, then `?tenant=` | `apps/admin/app/api/cms/public/updates/route.ts`               | `{ tenant: { slug }, updates: [] }` with `limit` clamped to `1..20`                  |

### Consumer contract in donor app

`apps/donor/lib/cms/client.ts` is the canonical integration layer for downstream apps. It forwards `x-forwarded-host` and normalizes CMS responses into app-safe helpers:

- `fetchPublishedCmsPage(slugSegments, hostOverride?)`
- `fetchPublishedCmsPageResult(slugSegments, hostOverride?)`
- `fetchPublishedMissionaryGivingPage(missionaryId, hostOverride?)`
- `fetchPublishedProjectPage(slug, hostOverride?)`
- `fetchPublishedCmsUpdates(limit?, hostOverride?)`

This file should be reused as a reference when wiring additional apps (missionary/public microsites) to avoid tenant-resolution drift.

## Operational guarantees

- CI integration job executes SQL migrations + Payload migrations in deterministic order.
- Payload migration status is checked in CI to catch drift.
- Tenant access logic is covered with unit tests and focused Playwright checks.

## Phase 22 D17 current-state qualification

The shipped fund-backed Project Page wizard, Payload `fundId`, copied fund
title/description, and public project-page serializer are prototype and migration
evidence only. They do not establish the Page subject, an operational Ministry
Project, the D7 Giving destination, D6 progress, permissions, or publication.
The target runtime reads one operational D17 Page identity and its immutable
release-pinned Phase-10-safe subject snapshot; Payload remains presentation only
and anonymous public requests never join to raw source tables.

## Phase 22 D18 current-state qualification

The shipped published-only Payload read plus donor fetch cache is Phase 5
runtime infrastructure, not the complete D18 Public Ministry composition
contract. Phase 5 executes reader/cache mechanics; Phase 22 owns current-serving
admission, public-ministry semantics, and adverse-first controlled-surface
convergence. No Asym-controlled response may bypass that current-serving
evaluation, and Payload `_status`, cached bytes, deployment state, or provider
acceptance cannot become a second public authority. See
[ADR-0135](../../adr/0135-release-bound-public-ministry-runtime-composition.md).

## Phase 22 D19 current-state qualification

The shipped single-person `missionary_id`, service-role data path, and any
page/CMS relationship are prototype and migration evidence only. They do not
make a Party, household, page, Designation, Support Assignment, or Field Account
the Missionary Ministry Page subject, and they grant no support access. The
target page references one CRM-authoritative organization-owned Ministry
Assignment. Every spouse, teammate, leader, and contributor keeps a separate
Party, principal, participant membership, display/contributor assignment, and
Phase 12 authorization. One optional Phase-21-owned Support Binding may connect
the Ministry Assignment to one Support Assignment, but public/CMS reads never
traverse raw financial tables and browser-visible credentials never decide
access. See
[ADR-0136](../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md).

## Phase 22 D20 current-state qualification

The shipped generic Payload block builder, copied templates, free-form CTA
URLs, generic collection forms, and duplicated public/preview serializers are
authoring and migration evidence only. They are not Page Family Semantic
Catalog, role, profile, release, or compatibility authority. The target runtime
accepts only D20-certified family-qualified presentation, rejects unknown roles
fail closed, and serves a D2 release pinned to its exact catalog, renderer,
profile, content, locale, brand, and managed-reference generations. See
[ADR-0137](../../adr/0137-two-bounded-page-family-semantic-catalogs.md).

## Phase 22 D21 current-state qualification

The public CMS endpoints and donor helpers listed above, the mock `/workers`
surface, Payload `_status`, free slugs, serializers, feature flags, and stock-
admin fallbacks are legacy implementation evidence, not D21 adoption or public-
reader authority. D21 prepares one complete dependency-closed Site/host/locale
cohort privately, then one separately authorized CAS advances its sole reader-
generation head. Before that event, legacy responses remain behind the Phase
5/10/D8 safety choke point or fail closed. After it, every request uses the sole
Phase 5/D18 gateway; disabling a Web Studio UI or rolling back a deployment may
not restore the old reader, raw Payload public path, mock source, or old cache.

A compatible legacy appearance is allowed only as a one-time normalized,
immutable, family-qualified D2 release in the new gateway. It is never a raw
request-time Payload read, fallback reader, or continuing legacy editor. D10
continues to own exact-version human preview; D21's distinct private full-
surface shadow creates no release, serving, Giving, measurement, cache, search,
or social-refresh truth. See
[ADR-0138](../../adr/0138-complete-public-ministry-surface-authority-cutover.md).

## Phase 22 D22 current-state qualification

D22 is not implemented by the current Payload collection lists and `_status`,
the public directory, or generic Mission Control **Needs attention** and task
records. Those surfaces are migration and UI evidence only. The target is one
private, derived, permission-filtered Public Pages operations projection with
exactly **To review**, **Needs attention**, and **All pages** views. It derives
source causes and their Page impacts without creating Page health or resolution
truth. Every action routes to the applicable current owner; optional shared task
lifecycle is non-authoritative and closes nothing. See
[ADR-0139](../../adr/0139-derived-public-page-operations-with-cause-owned-actions.md).

## Phase 22 D23 current-state qualification

D23 is not implemented by the current `org-settings` route,
`tenants.org_settings`, Payload preferences or collection defaults, or any
client-side settings form. Those seams are migration and UI evidence only. The
target is one private, scope-first, disposable Public Page Setup & Settings
Projection over exact current source-owned versions. It stores no setting and
invokes only one current-authorized owner command per amendment. D23 failure
must not block public serving or a direct owner workflow, and no CMS status,
default, global save, or restore may activate D21, clear D22 work, publish a
Page, or mutate per-Page truth. See
[ADR-0140](../../adr/0140-derived-public-page-setup-and-settings.md).

## Phase 22 D24 current-state qualification

D24 is not implemented by current broad tenant staff/admin update access,
Payload locks, autosave/version history, `_status`, restore, Publish/Unpublish,
REST/GraphQL/Local API access, or the coarse CMS audit hook. Those are storage,
editor, and migration seams only. The target uses one exact Phase 12 staff
Page-content-edit capability, the D3/D20 semantic allowlist, and the D1/D24
server command to append an attributed ordinary Page Revision and CAS-advance
one coherent head. Actor-context Payload calls use `overrideAccess: false` and
`overrideLock: false`; Payload stores bounded private content/version bytes but
does not own staff authority, provenance, review, release, or the working head.
See
[ADR-0141](../../adr/0141-attribution-preserving-staff-authored-page-revisions.md).

## Phase 22 D25 current-state qualification

D25 is not implemented by current Payload autosave, locks, version history,
`maxPerDoc`, `_status`, restore, trash, audit hooks, or native publish. The
target derives action-specific current permission from existing owner heads and
stores no D25 lifecycle state in operational Postgres. Payload may hold one
private, coalesced recovery buffer beneath the exact Page-and-locale coherent
head, but a revision or candidate may reference only a sealed immutable
semantic version and digest. The adapter uses the fixed two-second trailing
dirty debounce, 15-second maximum wait, explicit save/flush, digest no-op
suppression, one in-flight write, and generation fencing. Blind native pruning
is disabled for the governed Page collections; D24's reconciler alone may
reclaim reference-proved scratch or inert prepares. Exact behavior must be
certified against the installed Payload prerelease. See
[ADR-0142](../../adr/0142-derived-editorial-actionability-and-bounded-recovery.md).

## Phase 22 D26 current-state qualification

D26 is not implemented by current Payload uploads, media configuration, terms,
autosave, roles, `_status`, version history, or native publish. The target uses
the existing D4/D5 final command to atomically freeze one exact candidate and
its actual-actor Public Content Sharing Attestation; D2 or D11 only pins that
candidate at release. No checkbox, D26 table, Page Boolean, rights or consent
system, public-render lookup, inherited evidence, fabricated legacy evidence,
or Payload-native bypass is permitted. See
[ADR-0143](../../adr/0143-candidate-bound-public-content-sharing-attestation.md).
