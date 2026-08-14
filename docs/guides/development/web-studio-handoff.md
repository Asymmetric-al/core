# Web Studio — human handoff (current state)

**Last aligned with:** codebase on branch containing Web Studio Phases 1–3 + Phase 4 validation fixes.  
**Living spec:** [`web-studio-living-spec.md`](../architecture/web-studio-living-spec.md)  
**Runbook:** [`web-studio-runbook.md`](./web-studio-runbook.md)

---

## Where work stands

**Shipped:** Native shell + list + default document views for all editorial collections including Phase 3 (`page-templates`, `missionary-giving-pages`, `project-pages`). Template gallery, wizards, `POST /api/web-studio/create-from-template`, additive public routes, donor client helpers, staff missionary/fund directory APIs (via `@asym/api`), data-boundary–compliant route files.

**Partial:** Stock Payload UI for some nested document subviews (versions, live preview, API). Full CMS Playwright in every environment. Donor pages may not all consume new public helpers yet.

**Fallbacks:** Per-collection `CMS_WEB_STUDIO_NATIVE_*` env flags (default
enabled) change only the staff editor shell. They are not public publication,
D20 catalog, or D21 reader-authority switches.

---

## What is safe to build next

- More `@cms` Playwright coverage for `/web-studio/templates` and wizards.
- Donor wiring for `fetchPublishedMissionaryGivingPage` /
  `fetchPublishedProjectPage` is migration evidence only. Do not make those
  legacy helpers a second public reader; final Phase 22 wiring must enter the
  sole Phase 5/D18 gateway through the D21 complete-surface cutover.
- Thin native wrappers for versions/live preview **only if** Payload’s export surface supports it without fork.
- A thin D22 Public Pages operations view may be built only over the complete,
  permission-filtered derived projection, with exactly **To review**, **Needs
  attention**, and **All pages** views and source-owner actions.
- A thin D23 Public Page setup/settings view may be built only over exact
  source-owner descriptors and versions, with complete visible scope and one
  owner-specific immutable-successor action at a time.
- A thin D24 editor integration may be built only over D1's sole coherent
  working head and the existing D4/D5/D2 lane. It must use the exact Phase 12
  staff Page-content-edit capability, D3/D20 allowlist, immutable attributed
  successor, and current-reproved CAS rather than stock Payload authority.
- A thin D25 recovery integration may add only a derived action resolver and
  one coalesced Page-and-locale recovery buffer beneath that D1 head. It must
  seal deliberate immutable semantic versions, re-prove each action, and leave
  reference-safe scratch cleanup to D24's reconciler.

---

## What is risky to touch

- `apps/admin/src/cms/public/resolve-tenant.ts` — security-sensitive.
- Public route handlers — must stay **published-only** and tenant-scoped.
- D21-adopted public cohorts — never restore old public handlers, mock data,
  raw Payload reads, or old caches through a UI/deployment rollback.
- `apps/admin/payload.config.ts` access / hooks / collection order.
- Bypassing `withOperation` patterns for new staff APIs.
- Reusing Payload `_status`, the public directory, or generic Mission Control
  **Needs attention**/task lifecycle as Page health or resolution truth. These
  are migration/UI evidence only; D22 is not implemented, and task state closes
  no source cause or Page impact.
- Reusing `org_settings`, Payload preferences/defaults, tenant-only browser
  scope, or a generic Save all form as D23 configuration authority. These are
  migration/UI evidence only; D23 stores no setting and cannot activate,
  publish, resolve operations, or change per-Page truth.
- Mutating a submitted candidate in place, authoring through a broad staff or
  Payload role, using native publish/restore as product authority, or creating
  a second staff draft, review queue, branch, merge, or override workflow. D24
  derives an ordinary attributed successor and releases only through D4/D5/D2.
- Adding D25 actionability/stale/archive/expiry/recovery state, actor-specific
  durable drafts, per-autosave audit/outbox rows, age-based tasks, native
  restore, blind version pruning, or cleanup that cannot prove the content is
  unreferenced. Stored bytes and elapsed time grant no access or authority.
- Treating upload, sanitization, terms, Payload role, `_status`, autosave, or
  native publish as D26 evidence; adding a checkbox, mutable Page permission,
  D26 table, rights workflow, public-render lookup, inherited attestation, or
  alternate release path. Only the existing final D4/D5 command may record the
  actual actor's exact candidate-bound attestation.

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
