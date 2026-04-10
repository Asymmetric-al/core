# Web Studio — AI agent handoff (index)

**Goal:** Fast orientation for the next agent. Full detail: [`docs/guides/architecture/web-studio-living-spec.md`](../guides/architecture/web-studio-living-spec.md).

---

## Invariants (do not break)

1. **Tenant safety:** public CMS routes use `resolveTenantFromRequest` + `published` filters; never leak cross-tenant.
2. **Data boundary:** `apps/*/app/api/**/*.ts` — no direct `@asym/database/supabase/*` imports; delegate to `packages/api`.
3. **Payload owns document forms:** do not put main collection fields on TanStack Form.
4. **Single Payload runtime** in `apps/admin` — no second CMS stack.

---

## Key paths

| Area | Path |
|------|------|
| Payload config | `apps/admin/payload.config.ts` |
| Collections | `apps/admin/src/cms/collections/*.ts` |
| Shared page builder helpers | `apps/admin/src/cms/collections/page-builders.ts` |
| Create-from-template | `apps/admin/src/cms/create-from-template-endpoint.ts` |
| Web Studio UI root | `apps/admin/src/cms-ui/web-studio/` |
| Native list | `.../collections/shared/list-workspace/NativeCollectionListView.tsx` |
| Native edit | `.../collections/shared/document-workspace/NativeCollectionEditView.tsx` |
| Feature flags | `.../web-studio/feature-flags.ts` |
| Preview URL | `.../web-studio/adapters/preview-url.ts` |
| Public serialize | `apps/admin/src/cms/public/serialize-published-page.ts` |
| Tenant resolve | `apps/admin/src/cms/public/resolve-tenant.ts` |
| Donor CMS client | `apps/donor/lib/cms/client.ts` |
| Staff APIs | `packages/api/src/admin/missionary-directory.ts`, `fund-directory.ts` |

---

## Key flows

1. **List/edit:** Collection `admin.components.views` → native components wrap Payload `DefaultEditView` / list hooks.
2. **Templates:** `/web-studio/templates` → wizard routes → `POST /api/web-studio/create-from-template` → redirect to new document.
3. **Public read:** `apps/admin/app/api/cms/public/*` → `getPayloadClient` + `resolveTenantFromRequest`.

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

- `docs/guides/architecture/web-studio-living-spec.md` (primary)
- `docs/guides/architecture/cms-runtime.md` (API tables)
- `docs/guides/development/site-studio-payload.md` (dev workflow)
