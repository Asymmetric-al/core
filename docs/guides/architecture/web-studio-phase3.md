# Web Studio Phase 3 — missionary/project pages, templates, and public compatibility

**Superseded for “current system” truth by:** [`web-studio-living-spec.md`](./web-studio-living-spec.md) (this file remains as Phase 3 history).

## What shipped

- **Hybrid content model (documented choice):** separate Payload collections for `missionary-giving-pages`, `project-pages`, and `page-templates`, while `pages` keeps standard URLs and gains optional `pageType`, `template` relationship, `layout` blocks, and legacy `content` + `legacyContentFallback` for rollout-safe rendering.
- **Template gallery + wizards:** Payload `admin.components.views` routes under `/web-studio` for gallery, missionary hub, and create flows. Wizards use **TanStack Form + Zod** (non-Payload forms). Document editing remains Payload-owned (`DefaultEditView` wrappers).
- **Server-backed instantiation:** `POST /api/web-studio/create-from-template` (`webStudioCreateFromTemplateEndpoint`) uses Payload `req` + Local API `create` with normal access hooks. Missionary rows are validated against `public.missionaries`; fund rows against `public.funds`.
- **Public read APIs (additive):**
  - `GET /api/cms/public/missionary-pages/:id` — published `missionary-giving-pages` by `missionaryId`
  - `GET /api/cms/public/project-pages/:slug` — published `project-pages` by `slug`
  - Existing `GET /api/cms/public/pages/*` now returns a **stable subset** of fields via `serializePublishedPageLike` (adds `layout`, `pageType`, etc.; does not remove prior fields).
- **Donor client helpers:** `fetchPublishedMissionaryGivingPage` and `fetchPublishedProjectPage` in `apps/donor/lib/cms/client.ts`.

## Modeling answers (Phase 3 prompt)

1. **Missionary giving pages:** own collection (`missionary-giving-pages`) for clear access, preview, and public routing while storing canonical `missionaryId` (UUID).
2. **Project pages:** own collection (`project-pages`) anchored to canonical `fundId` (UUID).
3. **Templates:** own collection (`page-templates`) as editorial assets with `pageType`, `defaultLayout` blocks, and `templateKey`.
4. **Preview URLs:** still use `pagesGeneratePreviewURL` where configured; list config adds donor paths for giving (`/workers/:id`) and projects (`/projects/:slug`) as editorial hints.
5. **Public compatibility:** additive routes; standard pages contract preserved; tenant resolution unchanged (`resolveTenantFromRequest`).
6. **Legacy `Pages.content`:** retained and required; `layout` optional; `legacyContentFallback` documents public precedence during rollout.
7. **Migration:** Payload schema evolves via `bun run cms:migrate` / `payload migrate`; no destructive SQL in this change set. Roll back UI via env flags (below) without dropping tables.
8. **Template stability:** templates are versioned Payload documents; `templateKey` indexed for reporting.
9. **UI distinction:** collection boundaries + Web Studio section labels + template `pageType` badges in gallery.
10. **Editable vs prefilled:** canonical IDs (`missionaryId`, `fundId`) are set at creation time from Supabase truth; marketing copy/layout remain editorial in Payload.

## Rollout and rollback

- Disable native slices per collection with existing `CMS_WEB_STUDIO_NATIVE_*` env vars (see `apps/admin/src/cms-ui/web-studio/feature-flags.ts`).
- Remove or avoid custom admin views by disabling the whole Web Studio path is **not** required for rollback; stock collection URLs remain under `/web-studio/collections/...`.
- If instantiation must be disabled urgently, remove `endpoints: [webStudioCreateFromTemplateEndpoint]` from `payload.config.ts` (wizards will fail closed until restored).

## Staff-only Next routes (not Payload)

- `GET /api/admin/missionaries` — tenant-scoped missionary list for wizards/hub
- `GET /api/admin/funds` — tenant-scoped fund list for project wizard

These are thin re-exports to `@asym/api` handlers built with `withOperation` (staff/admin/super_admin roles) and are independent of the public CMS surface. See `docs/guides/architecture/data-access-boundary.md`.
