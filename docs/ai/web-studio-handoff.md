# Web Studio — AI agent handoff (index)

**Goal:** Fast orientation for the next agent. Use the [document-authority guide](document-authority.md), [Phase 23 owner contract](../prds/sitestacker-parity/phase-23-web-studio-cms.md), and [Phase 42 hybrid authoring contract](../prds/web-studio-hybrid/README.md) for intended behavior. The [living specification](../guides/architecture/web-studio-living-spec.md) distinguishes dated implementation observations from adopted targets; source presence does not prove runtime qualification.

---

## Invariants (do not break)

1. **Public serving:** use the sole `PublishedContentReader` and its independent public-read policy. Re-prove the exact trusted Tenant, Site, locale, generation and current safety dimensions required by the affected owner. A Tenant resolver or Payload `published` filter alone does not satisfy the adopted Phase 22/23/24 release and serving contract.
2. **Data boundary:** `apps/*/app/api/**/*.ts` — no direct `@asym/database/supabase/*` imports; delegate to `packages/api`.
3. **One editorial state owner:** current Payload-controlled document forms must not be wrapped in a competing TanStack Form session. Phase 42 permits Asym-owned inspectors with one authoritative form session and a qualified canonical/Puck adapter; saves, leases, history and recovery still use Phase 23 D12. Replace a resource writer only after the required parity and isolation evidence passes.
4. **One private Payload runtime** in `apps/admin`; inject its adapter through provider-neutral ports. Phase 42's isolated composer receives bounded authorized data and edit intents, not CMS credentials, another content authority or public-release permission.

---

## Existing implementation orientation paths

| Area                        | Path                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| Payload config              | `apps/admin/payload.config.ts`                                           |
| Collections                 | `apps/admin/src/cms/collections/*.ts`                                    |
| Shared page builder helpers | `apps/admin/src/cms/collections/page-builders.ts`                        |
| Create-from-template        | `apps/admin/src/cms/create-from-template-endpoint.ts`                    |
| Web Studio UI root          | `apps/admin/src/cms-ui/web-studio/`                                      |
| Native list                 | `.../collections/shared/list-workspace/NativeCollectionListView.tsx`     |
| Native edit                 | `.../collections/shared/document-workspace/NativeCollectionEditView.tsx` |
| Feature flags               | `.../web-studio/feature-flags.ts`                                        |
| Preview URL                 | `.../web-studio/adapters/preview-url.ts`                                 |
| Public serialize            | `apps/admin/src/cms/public/serialize-published-page.ts`                  |
| Tenant resolve              | `apps/admin/src/cms/public/resolve-tenant.ts`                            |
| Donor CMS client            | `apps/donor/lib/cms/client.ts`                                           |
| Staff APIs                  | `packages/api/src/admin/missionary-directory.ts`, `fund-directory.ts`    |

---

## Existing implementation flows

1. **List/edit:** Collection `admin.components.views` → native components wrap Payload `DefaultEditView` / list hooks.
2. **Templates:** `/web-studio/templates` → wizard routes → `POST /api/web-studio/create-from-template` → redirect to new document.
3. **Public read:** `apps/admin/app/api/cms/public/*` → the sole `PublishedContentReader` with the independent public-read policy; internal Payload access remains behind the private reader adapter. Preserve current protections while qualifying the adopted exact-generation serving contract.

These paths describe the existing prototype surface. They do not make raw Payload forms, publish controls or provider APIs the required final product. The Phase 42 implementation must qualify its Asym-owned editor, isolated composer and owner commands before enabling them; a UI failure must not expose raw Payload Admin.

---

## Commands (first 5 minutes)

```bash
NODE_ENV=test bun run cms:importmap
bun run typecheck:admin
bun run test:unit:cms
bun run verify:data-boundary
```

---

## Open issues / debt

- E2E `test:e2e:cms` needs Postgres + free ports (see runbook).
- `@tanstack/db` in admin **not** used by Web Studio tree (used elsewhere).
- TipTap **not** Payload editor path (Lexical).

---

## Docs to update when you change behavior

- The affected Phase 22/23/24 owner PRD, ADR and OpenSpec; Phase 42 canonical contract/projections when its successor scope changes
- `docs/guides/architecture/web-studio-living-spec.md` (implementation narrative)
- `docs/guides/architecture/cms-runtime.md` (API tables)
- `docs/guides/development/site-studio-payload.md` (dev workflow)
