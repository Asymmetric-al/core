# Site Studio CMS: DOM + interaction matrix

Date: 2026-02-23  
Scope: `apps/admin` Payload collections and public CMS APIs

This matrix is derived from the live collection configs and API handlers currently wired in this branch.

---

## 1) Collection interaction matrix (one row per collection)

| Collection            | Admin list route                         | Create/edit route                                                                             | Core interactions                                                      | Validation behavior                                                                                                  | Publish behavior                                                                             | API wiring                                                                                                      |
| --------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pages`               | `/admin/collections/pages`               | `/admin/collections/pages/create`, `/admin/collections/pages/:id`                             | Rich text page authoring, autosave drafts, save/publish actions        | `tenant`, `title`, `slug`, `content` required; `slug` and `tenant` indexed; tenant auto-injected for non-super-admin | Drafts enabled (`versions.drafts.autosave.interval=300`); publish via `_status: "published"` | Payload REST `POST/PATCH /api/pages`; public read via `GET /api/cms/public/pages/[...slug]` (published only)    |
| `navigation`          | `/admin/collections/navigation`          | `/admin/collections/navigation/create`, `/admin/collections/navigation/:id`                   | Array repeater (`items`) with add/remove/reorder for nav links         | `tenant`, `label`, `items` required; each item requires `label` + `href`; `openInNewTab` defaults false              | No draft layer; save is immediately current                                                  | Payload REST `POST/PATCH /api/navigation`; public read via `GET /api/cms/public/navigation`                     |
| `missionary-profiles` | `/admin/collections/missionary-profiles` | `/admin/collections/missionary-profiles/create`, `/admin/collections/missionary-profiles/:id` | Profile editing with optional portrait relationship to media library   | `tenant`, `fullName`, `slug` required; portrait optional relationship                                                | No draft layer                                                                               | Payload REST `POST/PATCH /api/missionary-profiles`                                                              |
| `ministry-updates`    | `/admin/collections/ministry-updates`    | `/admin/collections/ministry-updates/create`, `/admin/collections/ministry-updates/:id`       | Rich text updates linked to missionary profile, optional `publishedAt` | `tenant`, `missionary`, `title`, `slug`, `content` required; indexed by tenant/missionary/slug                       | Drafts enabled (`versions.drafts.autosave.interval=300`); publish via `_status: "published"` | Payload REST `POST/PATCH /api/ministry-updates`; public read via `GET /api/cms/public/updates` (published only) |
| `media`               | `/admin/collections/media`               | `/admin/collections/media/create`, `/admin/collections/media/:id`                             | File upload with metadata + generated sizes                            | `tenant` + `alt` required; upload collection stores file metadata and generated sizes                                | No draft layer                                                                               | Payload REST multipart `POST/PATCH /api/media`                                                                  |
| `tenants`             | `/admin/collections/tenants`             | `/admin/collections/tenants/create`, `/admin/collections/tenants/:id`                         | Tenant metadata management                                             | `name`, `slug` required; `slug` unique; `isActive` defaults true                                                     | No draft layer                                                                               | Payload REST `POST/PATCH /api/tenants`; used by tenant resolver for public APIs                                 |
| `cms-users`           | `/admin/collections/cms-users`           | `/admin/collections/cms-users/create`, `/admin/collections/cms-users/:id`                     | Staff user records tied to Supabase identities                         | `email` required + unique; `role` select defaults `staff`; local auth disabled                                       | N/A                                                                                          | Payload auth collection (`disableLocalStrategy: true`) with Supabase strategy                                   |

---

## 2) Field-level DOM control matrix

> Control mapping follows Payload admin defaults for each field type.

| Collection            | Field            | Field type     | Expected DOM control             | Required | Notes                                              |
| --------------------- | ---------------- | -------------- | -------------------------------- | -------- | -------------------------------------------------- |
| `pages`               | `tenant`         | `relationship` | Relationship picker/select modal | Yes      | Auto-stamped from staff tenant context             |
| `pages`               | `title`          | `text`         | Single-line text input           | Yes      | Used as admin title                                |
| `pages`               | `slug`           | `text`         | Single-line text input           | Yes      | Indexed                                            |
| `pages`               | `summary`        | `textarea`     | Multi-line textarea              | No       | Optional teaser text                               |
| `pages`               | `content`        | `richText`     | Lexical editor                   | Yes      | Main body content                                  |
| `navigation`          | `tenant`         | `relationship` | Relationship picker/select modal | Yes      | Tenant scope anchor                                |
| `navigation`          | `label`          | `text`         | Single-line text input           | Yes      | Used as admin title                                |
| `navigation`          | `items`          | `array`        | Repeater rows                    | Yes      | Each row has `label`, `href`, `openInNewTab`       |
| `navigation.items`    | `label`          | `text`         | Single-line text input           | Yes      | Link label                                         |
| `navigation.items`    | `href`           | `text`         | Single-line text input           | Yes      | Relative or absolute URL                           |
| `navigation.items`    | `openInNewTab`   | `checkbox`     | Checkbox/toggle                  | No       | Default `false`                                    |
| `missionary-profiles` | `tenant`         | `relationship` | Relationship picker/select modal | Yes      | Tenant scope anchor                                |
| `missionary-profiles` | `fullName`       | `text`         | Single-line text input           | Yes      | Used as admin title                                |
| `missionary-profiles` | `slug`           | `text`         | Single-line text input           | Yes      | Indexed                                            |
| `missionary-profiles` | `tagline`        | `text`         | Single-line text input           | No       | Optional                                           |
| `missionary-profiles` | `bio`            | `textarea`     | Multi-line textarea              | No       | Optional                                           |
| `missionary-profiles` | `location`       | `text`         | Single-line text input           | No       | Optional                                           |
| `missionary-profiles` | `portrait`       | `relationship` | Media relationship picker        | No       | Relation to `media`                                |
| `ministry-updates`    | `tenant`         | `relationship` | Relationship picker/select modal | Yes      | Auto-stamped from tenant context                   |
| `ministry-updates`    | `missionary`     | `relationship` | Relationship picker/select modal | Yes      | Relation to `missionary-profiles`                  |
| `ministry-updates`    | `title`          | `text`         | Single-line text input           | Yes      | Used as admin title                                |
| `ministry-updates`    | `slug`           | `text`         | Single-line text input           | Yes      | Indexed                                            |
| `ministry-updates`    | `excerpt`        | `textarea`     | Multi-line textarea              | No       | Optional summary                                   |
| `ministry-updates`    | `content`        | `richText`     | Lexical editor                   | Yes      | Main update content                                |
| `ministry-updates`    | `publishedAt`    | `date`         | Date/time picker                 | No       | Optional explicit publish timestamp                |
| `media`               | `tenant`         | `relationship` | Relationship picker/select modal | Yes      | Tenant scope anchor                                |
| `media`               | `alt`            | `text`         | Single-line text input           | Yes      | Accessibility metadata                             |
| `media`               | `caption`        | `text`         | Single-line text input           | No       | Optional                                           |
| `tenants`             | `name`           | `text`         | Single-line text input           | Yes      | Tenant display name                                |
| `tenants`             | `slug`           | `text`         | Single-line text input           | Yes      | Unique tenant identifier                           |
| `tenants`             | `primaryDomain`  | `text`         | Single-line text input           | No       | Domain-based resolution                            |
| `tenants`             | `isActive`       | `checkbox`     | Checkbox/toggle                  | No       | Default `true`                                     |
| `cms-users`           | `email`          | `email`        | Email input                      | Yes      | Unique + indexed                                   |
| `cms-users`           | `supabaseUserId` | `text`         | Single-line text input           | No       | Unique if present                                  |
| `cms-users`           | `tenantId`       | `text`         | Single-line text input           | No       | Indexed tenant linkage                             |
| `cms-users`           | `role`           | `select`       | Select dropdown                  | No       | Default `staff`; options `staff/admin/super_admin` |

---

## 3) Expected admin API payload matrix (collection-by-collection)

| Collection            | Create endpoint                         | Update endpoint                      | Publish endpoint (if applicable)                              | Expected payload shape                                                                                                                                                                                         |
| --------------------- | --------------------------------------- | ------------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------- |
| `pages`               | `POST /api/pages`                       | `PATCH /api/pages/:id`               | `PATCH /api/pages/:id` with `_status: "published"`            | `{ "tenant": <tenantId>, "title": "About", "slug": "about", "summary": "...", "content": { "root": { ... } }, "\_status": "draft                                                                               | published" }` |
| `navigation`          | `POST /api/navigation`                  | `PATCH /api/navigation/:id`          | N/A                                                           | `{ "tenant": <tenantId>, "label": "Main Nav", "items": [{ "label": "Home", "href": "/", "openInNewTab": false }] }`                                                                                            |
| `missionary-profiles` | `POST /api/missionary-profiles`         | `PATCH /api/missionary-profiles/:id` | N/A                                                           | `{ "tenant": <tenantId>, "fullName": "Jane Doe", "slug": "jane-doe", "tagline": "...", "bio": "...", "location": "...", "portrait": <mediaId> }`                                                               |
| `ministry-updates`    | `POST /api/ministry-updates`            | `PATCH /api/ministry-updates/:id`    | `PATCH /api/ministry-updates/:id` with `_status: "published"` | `{ "tenant": <tenantId>, "missionary": <profileId>, "title": "Q1 Update", "slug": "q1-update", "excerpt": "...", "content": { "root": { ... } }, "publishedAt": "2026-02-23T12:00:00.000Z", "\_status": "draft | published" }` |
| `media`               | `POST /api/media` (multipart form-data) | `PATCH /api/media/:id`               | N/A                                                           | multipart fields: `file=<binary>`, `tenant=<tenantId>`, `alt="..."`, `caption="..."`                                                                                                                           |
| `tenants`             | `POST /api/tenants`                     | `PATCH /api/tenants/:id`             | N/A                                                           | `{ "name": "Acme Missions", "slug": "acme", "primaryDomain": "acme.example.org", "isActive": true }`                                                                                                           |
| `cms-users`           | `POST /api/cms-users` (super admin)     | `PATCH /api/cms-users/:id`           | N/A                                                           | `{ "email": "staff@org.org", "supabaseUserId": "uuid", "tenantId": "tenant_1", "role": "staff                                                                                                                  | admin         | super_admin" }` |

---

## 4) Expected public API response matrix (published content surfaces)

| Endpoint                              | Handler behavior                                                                                                                                         | Expected response payload                                                                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/cms/public/pages/[...slug]` | Resolves tenant (`?tenant`, domain, then subdomain), normalizes slug, filters by `tenant` + `slug` + `_status=published`, returns newest by `-updatedAt` | Success: `{ "tenant": { "id": "<tenantId>", "slug": "<slug>" }, "page": { ...pageDoc } }`; Errors: `404 Tenant not found`, `404 Page not found`, `500 Failed to fetch page content` |
| `GET /api/cms/public/navigation`      | Resolves tenant, queries `navigation` by tenant sorted `-updatedAt`, returns first doc or `null`                                                         | Success: `{ "tenant": { "id": "<tenantId>", "slug": "<slug>" }, "navigation": { ...navDoc } \| null }`; Errors: `404 Tenant not found`, `500 Failed to fetch navigation content`    |
| `GET /api/cms/public/updates?limit=N` | Resolves tenant, clamps `limit` to `1..20` (default `5`), filters by `tenant` + `_status=published`, sorted by `-publishedAt`                            | Success: `{ "tenant": { "id": "<tenantId>", "slug": "<slug>" }, "updates": [{ ...updateDoc }] }`; Errors: `404 Tenant not found`, `500 Failed to fetch ministry updates`            |

---

## 5) Verification: wiring + behavior tests executed

### Unit/integration contract checks (pass)

- `bun run test:unit:cms`
  - 8 files, 40 tests passing.
  - Includes:
    - collection contract assertions (`tests/unit/cms/collection-contracts.test.ts`)
    - pages/public route contract tests (`tests/unit/cms/public-pages-route.test.ts`)
    - navigation route contract tests (`tests/unit/cms/public-navigation-route.test.ts`)
    - updates route contract tests (`tests/unit/cms/public-updates-route.test.ts`)
    - tenant resolution and access tests.

### Browser smoke checks (pass)

- `bun run test:e2e:cms --project=chromium`
  - 4 tests passing.
  - Validates CMS route guards and CMS integration smoke surfaces.

### Static quality checks (pass)

- `bunx eslint apps/admin/app/api/cms/public/navigation/route.ts apps/admin/app/api/cms/public/updates/route.ts tests/unit/cms/public-navigation-route.test.ts tests/unit/cms/public-updates-route.test.ts tests/unit/cms/collection-contracts.test.ts`
- `bunx turbo run typecheck --filter=@asym/admin`

---

## 6) Practical limitation note

In this cloud runtime, full authenticated in-browser authoring (create draft -> publish via real Payload admin UI against a live Postgres-backed CMS) still depends on a reachable Postgres service for Payload runtime. The contract-level and route-level wiring is validated above, and CMS smoke routes are green, but deep live authoring remains environment-dependent.

---

## 7) Machine-readable exports for agent ingestion

- JSON data: `docs/audits/site-studio-dom-interaction-matrix.json`
- JSON schema: `docs/audits/site-studio-dom-interaction-matrix.schema.json`
- CSV (collections): `docs/audits/site-studio-dom-interaction-matrix.collections.csv`
- CSV (field controls): `docs/audits/site-studio-dom-interaction-matrix.field-controls.csv`
- CSV (admin API): `docs/audits/site-studio-dom-interaction-matrix.admin-api.csv`
- CSV (public API): `docs/audits/site-studio-dom-interaction-matrix.public-api.csv`
