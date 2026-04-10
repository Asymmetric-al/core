# Web Studio Phase 1 — architecture handoff

## Goal

Ship a **Mission Control–owned shell and list/edit chrome** around the **Payload-owned document runtime** for the **`pages`** collection only, without changing public CMS contracts or donor rendering.

## Boundaries

| Layer | Owner | Notes |
| ----- | ----- | ----- |
| Outer shell (top bar, breadcrumbs, left rail, MC navigation exit) | Mission Control (`apps/admin/src/cms-ui/web-studio/shell/*`) | Rendered inside Payload `(payload)` layout; `MCShell` still bypasses `/web-studio` at the Next root — do not double-wrap. |
| List query, pagination, column prefs, access | Payload | Custom list view composes `ListControls`, `PageControls`, `Table`, `TableColumnsProvider`, `SelectionProvider`, `useListQuery`. |
| Document form, drafts, autosave, publish, Lexical | Payload | Custom edit view wraps `DefaultEditView` and relocates **Preview / Save draft / Publish** to a MC header band using stock `@payloadcms/ui` buttons. |
| Preview URL for Pages | `Pages.admin.preview` → `pagesGeneratePreviewURL` | Opens **published** donor route matching `[...cmsSlug]` (`buildDonorPreviewPathForPageSlug`). Set `NEXT_PUBLIC_DONOR_URL` when donor is not on `127.0.0.1:3000`. |
| Non-Payload settings UI | TanStack Form + Zod | Example: `PagesWorkspaceSettingsDialog` → Payload `usePreferences`. |

## Kill switch (rollback)

Set `CMS_WEB_STUDIO_NATIVE_PAGES=false` (or `0`) in the environment, then:

```bash
NODE_ENV=test bun run cms:importmap
```

Redeploy. `Pages` falls back to **stock** Payload list/edit; `admin.preview` remains for Preview button support.

## Key files

- Feature flag: `apps/admin/src/cms-ui/web-studio/feature-flags.ts`
- Collection wiring: `apps/admin/src/cms/collections/pages.ts`
- Native list: `apps/admin/src/cms-ui/web-studio/pages/list/PagesNativeListView.tsx`
- Native edit: `apps/admin/src/cms-ui/web-studio/pages/document/PagesNativeEditView.tsx`
- Preview helper: `apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts`
- Preference keys: `apps/admin/src/cms-ui/web-studio/preferences/keys.ts`
- Import map post-process: `scripts/dev/postprocess-payload-importmap.mjs` (supports `web-studio/importMap.js`)

## Phase 2 / 3 setup (intentional gaps)

- Reuse `StudioLayout` + preference key pattern for additional collections.
- Extract shared “native list” / “native edit” wrappers once a second collection needs the same framing.
- Live preview iframe + draft token flow is **out of scope** for Phase 1; preview links target the **public donor URL** only.

## Tests

- Unit: `tests/unit/cms/web-studio-preview-url.test.ts`
- E2E: `tests/e2e/cms-web-studio-native.spec.ts` (`@cms`), included in `bun run test:e2e:smoke:cms`
