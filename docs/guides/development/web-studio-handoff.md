# Web Studio — human handoff (current state)

**Last aligned with:** codebase on branch containing Web Studio Phases 1–3 + Phase 4 validation fixes.  
**Living spec:** [`web-studio-living-spec.md`](../architecture/web-studio-living-spec.md)  
**Runbook:** [`web-studio-runbook.md`](./web-studio-runbook.md)

---

## Where work stands

**Shipped:** Native shell + list + default document views for all editorial collections including Phase 3 (`page-templates`, `missionary-giving-pages`, `project-pages`). Template gallery, wizards, `POST /api/web-studio/create-from-template`, additive public routes, donor client helpers, staff missionary/fund directory APIs (via `@asym/api`), data-boundary–compliant route files.

**Partial:** Stock Payload UI for some nested document subviews (versions, live preview, API). Full CMS Playwright in every environment. Donor pages may not all consume new public helpers yet.

**Fallbacks:** Per-collection `CMS_WEB_STUDIO_NATIVE_*` env flags (default enabled).

---

## What is safe to build next

- More `@cms` Playwright coverage for `/web-studio/templates` and wizards.
- Donor wiring for `fetchPublishedMissionaryGivingPage` / `fetchPublishedProjectPage` where product wants CMS-backed pages.
- Thin native wrappers for versions/live preview **only if** Payload’s export surface supports it without fork.

---

## What is risky to touch

- `apps/admin/src/cms/public/resolve-tenant.ts` — security-sensitive.
- Public route handlers — must stay **published-only** and tenant-scoped.
- `apps/admin/payload.config.ts` access / hooks / collection order.
- Bypassing `withOperation` patterns for new staff APIs.

---

## Read first (ordered)

1. [`web-studio-living-spec.md`](../architecture/web-studio-living-spec.md)
2. `apps/admin/payload.config.ts`
3. `apps/admin/src/cms-ui/web-studio/collections/config.ts`
4. `apps/admin/src/cms/create-from-template-endpoint.ts`
5. `docs/guides/architecture/cms-runtime.md`

---

## Phase snapshot docs (historical)

- `docs/guides/architecture/web-studio-phase1.md`
- `docs/guides/architecture/web-studio-phase2.md`
- `docs/guides/architecture/web-studio-phase3.md`

If a snapshot conflicts with **code** or **living spec**, trust code + living spec.
