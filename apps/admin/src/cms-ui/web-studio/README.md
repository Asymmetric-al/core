# Web Studio (`cms-ui/web-studio`)

Mission Control–native UI that wraps **Payload CMS** (mounted at `/web-studio` in `apps/admin`). Payload remains the source of truth for schemas, access control, document forms, drafts, versions, uploads, and Lexical rich text.

## Documentation (read before large changes)

- **Primary:** [`docs/guides/architecture/web-studio-living-spec.md`](../../../../../docs/guides/architecture/web-studio-living-spec.md)
- **Runbook:** [`docs/guides/development/web-studio-runbook.md`](../../../../../docs/guides/development/web-studio-runbook.md)
- **AI index:** [`docs/guides/development/web-studio-handoff.md`](../../../../../docs/guides/development/web-studio-handoff.md)

## Directory map

| Path                    | Role                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| `shell/`                | `StudioLayout`, nav rail, top bar                                               |
| `collections/config.ts` | Per-collection labels, paths, preview hints, preference keys                    |
| `collections/shared/`   | `NativeCollectionListView`, `NativeCollectionEditView`, workspace dialogs       |
| `flows/`                | TanStack Form wizards + template gallery (top-level Payload admin views)        |
| `adapters/`             | Interim authenticated preview + published public URL helpers (`preview-url.ts`) |
| `feature-flags.ts`      | `CMS_WEB_STUDIO_NATIVE_*` kill switches                                         |
| `preferences/keys.ts`   | Payload preference key strings                                                  |

## Rules of engagement

1. **Do not** replace Payload’s document field form with TanStack Form for collection bodies.
2. **Do** use TanStack Form (or `useAsymForm` from `@asym/ui`) for wizards and Mission Control–only dialogs.
3. After changing Payload component paths: `NODE_ENV=test bun run cms:importmap` from repo root.
4. New **staff** HTTP handlers that touch Supabase belong in `packages/api` with thin re-exports under `apps/admin/app/api/`.
5. Keep the interim draft preview authenticated under
   `/web-studio/preview/:collection/:id`; public donor routes stay
   published-only. Do not treat its Payload login, `overrideAccess: false`, or
   URL as Phase 22 D10 authority: Public Ministry Preview must migrate to one
   exact saved revision/candidate with current Phase 12/10/D9 authorization,
   the production-equivalent renderer, inert effects, and private/no-store/
   non-indexable responses.
6. Treat Payload SEO fields/plugins, CMS publish state, public URL helpers,
   mutable/original media, provider status, and current social controls as
   authoring or migration seams only—not Phase 22 D14 authority. D14 permits one
   collapsed optional **Search & sharing** section with generated defaults and
   bounded locale title/description plus D9-certified image selection inside
   the existing D4/D5 review/release lane. It creates no editable canonical,
   robots, sitemap, `hreflang`, schema, keyword, provider, or route controls and
   no second release head or review queue.
7. Treat any Payload/Lexical AI control, generated field, or plugin as migration
   evidence only—not Phase 22 D16 authority. Public Page writing assistance must
   use the shared Phase 21 D10 control plane and a Phase-22 semantic authoring
   port keyed to the exact D1 working revision, field/block path, digest, and
   optional selection. Staff and missionary editors may present the same D16
   actions through thin adapters, but provider calls, source authorization,
   suggestion truth, CAS application, the Translate-to-English warning, and
   Phase 10/24 boundaries do not belong in Lexical, Tiptap, or Payload hooks.
8. Treat the current Project Page `fundId`, copied fund title/description, and
   create-wizard duplicate precheck as migration evidence only—not Phase 22 D17
   Page Subject authority. The operational command boundary must select one
   exact owner-certified CRM Ministry Project, Phase 13 Giving Campaign, or
   separately eligible Designation; Payload receives only the opaque Page
   reference and presentation draft. Subject, Giving, progress, contributors,
   and release remain separate, and a released subject is never repointed.
9. Treat Payload publish state, public-read success, cache tags, revalidation,
   deployment, and provider acceptance as runtime inputs or effects—not Phase
   22 D18 serving authority. Phase 5 executes runtime/cache mechanics; Phase 22
   owns current-serving admission and adverse-first controlled-surface
   convergence. No Asym-controlled response may bypass that evaluation, and no
   cache or effect path may become a second public authority. See
   [ADR-0135](../../../../../docs/adr/0135-release-bound-public-ministry-runtime-composition.md).
10. Treat `missionaryId`, a CMS relationship, a shared page, household/spouse
    association, Designation, or contributor role as migration or presentation
    input only—not Phase 22 D19 Ministry Assignment or support-access authority.
    Web Studio may present the quiet **People & access** workflow, but CRM owns
    Assignment/membership facts, Phase 21 owns any finance-authorized Support
    Binding write, and Phase 12 authorizes each person's exact Support Workspace
    projection. Never store copied support data, permission arrays, or implied
    spouse/team grants in Payload.
11. Treat generic Payload blocks, copied templates, free CTA URLs, and generic
    document forms as D20 migration inputs only. Every public release must be
    family-qualified and pin the exact catalog, renderer, profile, content,
    locale, brand, and managed-reference generations. Unknown semantics fail
    closed; Web Studio preferences are never catalog or release authority.
12. Treat native/stock Payload collection toggles, public CMS endpoints,
    serializers, mock `/workers` data, and deployment rollback as D21 migration
    evidence only. They must never select public-reader authority. D21 may
    prepare Pages privately and incrementally, but public traffic moves only by
    one complete-cohort, separately authorized, CAS-guarded reader-generation
    transition. Afterward no Web Studio fallback may restore the legacy reader,
    raw Payload public access, mock source, or old cache namespace. A compatible
    legacy appearance is permitted only as an immutable D2 release normalized
    into the sole Phase 5/D18 gateway. See
    [ADR-0138](../../../../../docs/adr/0138-complete-public-ministry-surface-authority-cutover.md).
13. Treat Payload collection lists and `_status`, the public directory, and
    generic Mission Control **Needs attention** or task state as D22 UI and
    migration evidence only. D22's private Public Pages workspace is one
    derived, permission-filtered projection with exactly three stable views:
    **To review**, **Needs attention**, and **All pages**. It does not create a
    Page health or resolution state. Every action routes to the source-owning
    applicable current source-owning workflow, and completing, dismissing, or
    deleting an optional shared
    task closes no Page cause or impact. See
    [ADR-0139](../../../../../docs/adr/0139-derived-public-page-operations-with-cause-owned-actions.md).
14. Treat the current `org-settings` route, `tenants.org_settings`, Payload
    preferences, collection defaults, and simulated settings success as D23
    migration or UI evidence only. D23 is one private, scope-first, disposable
    setup/settings projection over exact source-owned versions. Each Change
    action invokes one owner command and appends one immutable successor; Web
    Studio must not add a universal settings blob, global Save all, mutable
    reset, inferred default, D21 activation, D22 resolution, or per-Page
    authority. See
    [ADR-0140](../../../../../docs/adr/0140-derived-public-page-setup-and-settings.md).
15. Treat current native Payload update/delete, broad staff/admin access,
    locks, autosave/version history, `_status`, restore, Publish/Unpublish,
    APIs, audit hooks, and feature flags as editor, storage, or migration seams
    only. D24 uses one exact Phase 12 staff Page-content-edit capability and
    D3/D20 allowlist to append an ordinary attributed D1 successor and
    CAS-advance the sole working head. Actor-context Local API calls use
    `overrideAccess: false` and `overrideLock: false`; Payload never supplies
    staff authority, provenance, review, release, or working-head truth. See
    [ADR-0141](../../../../../docs/adr/0141-attribution-preserving-staff-authored-page-revisions.md).
16. Treat the current 300 ms autosave, Payload version cap, locks, restore,
    trash, audit hook, and native status as prototype/provider seams only. D25
    derives permitted actions from current owner truth and adds no operational
    status, queue, expiry scan, per-autosave audit/outbox row, or actor draft
    branch. The exact adapter may keep one Page-and-locale recovery buffer with
    a fixed two-second trailing dirty debounce, 15-second maximum wait, digest
    no-op suppression, one in-flight write, and late-write fencing. A revision
    or candidate may reference only a sealed immutable semantic version;
    Payload blind pruning stays disabled for the governed Page collections and
    D24's reconciler may delete only reference-proved scratch or inert prepares.
    Certify these behaviors against the exact installed Payload prerelease;
    older vendored or public documentation is comparator evidence, not proof.
    See
    [ADR-0142](../../../../../docs/adr/0142-derived-editorial-actionability-and-bounded-recovery.md).
17. Treat current uploads, terms, media configuration, roles, autosave,
    `_status`, and native publish as non-authoritative for D26. The existing
    Phase 22 final command alone atomically records the exact candidate and its
    actual-actor Public Content Sharing Attestation. Add no checkbox, D26 table,
    Page Boolean, rights workflow, public-render lookup, evidence inheritance,
    or native Payload bypass. See
    [ADR-0143](../../../../../docs/adr/0143-candidate-bound-public-content-sharing-attestation.md).
