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

## Dated Phase 22 D17 qualification (2026-08-06)

This document preserves what Phase 3 shipped; it is not final Phase 22 subject
authority. The `project-pages.fundId` field and fund picker remain exact migration
input only. D17 supersedes the assumption that `fundId` canonically states what
a Project/Campaign Page is about. The operational Page now binds to one certified
CRM Ministry Project, Phase 13 Giving Campaign, or separately eligible
Designation, while Payload holds only presentation and an opaque Page reference.
Subject, Giving, progress, contributors, reach/release, and lifecycle are
independent, and no released subject can be repointed in place.

## Dated Phase 22 D18 qualification (2026-08-06)

The Phase 3 published endpoints and cache hints are Phase 5 implementation
seams, not Phase 22 serving authority. D18 requires Phase 5 to execute runtime/
cache mechanics under Phase 22's current-serving admission and adverse-first
convergence semantics. No Asym-controlled response may bypass that evaluation,
and no Payload state, cache, deployment, or provider result may become a second
public authority. See
[ADR-0135](../../adr/0135-release-bound-public-ministry-runtime-composition.md).

## Dated Phase 22 D19 qualification (2026-08-06)

The Phase 3 `missionaryId` field and any single-person, CMS-user, or service-role
shortcut are migration evidence only. D19 makes one CRM-authoritative,
organization-owned Ministry Assignment the Missionary Ministry Page subject.
Spouses and teammates retain separate Party/principal identities and require
separate participant, display, contributor, and Phase 12 Support Workspace
authorization facts. Phase 21 alone owns any finance-authorized Support Binding
write; neither Payload nor a page editor may infer, grant, widen, or copy
financial access. See
[ADR-0136](../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md).

## Dated Phase 22 D20 qualification (2026-08-14)

The Phase 3 generic layout blocks, copied templates, `pageType`, free CTA URLs,
and additive serializers are migration evidence only. D20 owns two small,
non-interchangeable, code-owned semantic catalog generations under D3. Tenant
profiles may configure only bounded certified roles/zones, and every D2 release
pins the exact compatible catalog, renderer, profile, content, locale, brand,
and managed-reference generations. Generic Payload data or unknown blocks are
never public compatibility authority. See
[ADR-0137](../../adr/0137-two-bounded-page-family-semantic-catalogs.md).

## Dated Phase 22 D21 qualification (2026-08-14)

The Phase 3 additive public routes and `legacyContentFallback` support private
migration work; they do not authorize page-by-page public rollout or continuing
dual readers. D21 prepares the complete dependency-closed cohort privately and
advances one reader-generation head through a separately authorized CAS. After
that event, collection flags, stock Payload UI, deployment rollback, and old
cache namespaces cannot restore the legacy public reader. `legacyContentFallback`
may survive only after one certified normalization into a frozen,
family-qualified D2 release served by the sole Phase 5/D18 gateway. See
[ADR-0138](../../adr/0138-complete-public-ministry-surface-authority-cutover.md).

## Dated Phase 22 D22 qualification (2026-08-14)

The Phase 3 Payload collection lists, document status, public directory, and
any generic Mission Control **Needs attention** or task surface are migration
and UI evidence only. D22 is not implemented by those surfaces. Its private,
derived, permission-filtered Public Pages operations projection has exactly
three stable views—**To review**, **Needs attention**, and **All pages**—and
does not own Page health or resolution. Every action routes to the applicable
current source-owning workflow. An optional same-scope shared task may support
follow-up, but task completion, dismissal, or deletion closes no source cause
or Page impact. See
[ADR-0139](../../adr/0139-derived-public-page-operations-with-cause-owned-actions.md).

## Dated Phase 22 D23 qualification (2026-08-14)

Phase 3 Payload preferences, collection defaults, mutable `org-settings`, and
tenant-only browser controls are migration and UI evidence only. They do not
implement D23. The target privately composes one complete-scope,
permission-filtered setup/settings projection from exact source-owned versions
and invokes one owner command per amendment. It stores no setting, readiness,
release, activation, operations resolution, AI credential, or per-Page truth;
missing owner data fails honestly without changing public serving. See
[ADR-0140](../../adr/0140-derived-public-page-setup-and-settings.md).

## Dated Phase 22 D24 qualification (2026-08-14)

Phase 3's broad staff/admin access, stock Payload editing, locks, autosave,
version history, `_status`, restore, Publish/Unpublish, APIs, and audit hook are
implementation and migration evidence only. They do not implement D24. The
target appends one ordinary D1 Staff-authored Page Revision through an exact
Phase 12 capability and D3/D20 allowlist, with current-reproved
actor/source/predecessor provenance and working-head CAS. Payload stores only
bounded private content/version bytes; D4/D5 and D2 retain review and release.
See
[ADR-0141](../../adr/0141-attribution-preserving-staff-authored-page-revisions.md).

## Dated Phase 22 D25 qualification (2026-08-14)

Phase 3's 300 ms autosave, Payload version history/caps, locks, `_status`,
restore, trash, audit hook, and browser state are implementation evidence only.
They do not implement D25. The target derives action-specific permission from
existing owner heads, adds no operational status or per-autosave stream, and
permits one coalesced Page-and-locale recovery buffer beneath the coherent D1
head. Only sealed immutable semantic versions may be referenced; blind Payload
pruning is disabled and D24's reconciler alone may reclaim reference-proved
scratch or inert prepares. See
[ADR-0142](../../adr/0142-derived-editorial-actionability-and-bounded-recovery.md).

## Dated Phase 22 D26 qualification (2026-08-14)

Phase 3 uploads, terms, media settings, autosave, roles, `_status`, and native
publish do not implement D26. The target adds one calm sentence beside the
existing final D4/D5 action and records its actual-actor evidence atomically in
the immutable candidate. It adds no checkbox, Page permission flag, D26 table,
rights workflow, public field, evidence inheritance, or native Payload release
path. See
[ADR-0143](../../adr/0143-candidate-bound-public-content-sharing-attestation.md).
