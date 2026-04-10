# Web Studio Phase 1 — architecture handoff

**Superseded for “current system” truth by:** [`web-studio-living-spec.md`](./web-studio-living-spec.md) (this file remains as Phase 1 history).

## Goal

Ship a **Mission Control–owned shell and list/edit chrome** around the **Payload-owned document runtime** for the **`pages`** collection only, without changing public CMS contracts or donor rendering.

This document now also acts as the handoff baseline for **Phase 2**, where the shared shell/list/document workspace abstractions were extracted and reused across the current editorial collections.

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

## Phase 2 update

- Shared collection metadata now lives in `apps/admin/src/cms-ui/web-studio/collections/config.ts`.
- Shared list workspace now lives in `apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionListView.tsx`.
- Shared document workspace now lives in `apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx`.
- Native default list/edit routes now cover:
  - `pages`
  - `navigation`
  - `missionary-profiles`
  - `ministry-updates`
  - `media`
- `Tenants` and `CmsUsers` remain outside the editorial shell and continue to use stock/admin-only Payload surfaces.
- Preview URL support is collection-specific:
  - `pages`: donor public page route
  - `ministry-updates`: donor homepage/update stream context only
  - `navigation`, `missionary-profiles`, `media`: no public preview path registered
- Versions/API/live-preview nested subviews still rely on stock Payload nested routes in this phase. The native document workspace exposes links into those routes rather than wrapping unstable internal server views directly.

## Phase 2 / 3 setup (intentional gaps)

- Reuse `StudioLayout` + collection config + shared list/document workspaces for additional collections.
- Live preview iframe + draft token flow remains a follow-up item; current Phase 2 keeps stock nested live-preview routes where supported and avoids undocumented internal view imports.

## Tests

- Unit: `tests/unit/cms/web-studio-preview-url.test.ts`
- E2E: `tests/e2e/cms-web-studio-native.spec.ts` (`@cms`), included in `bun run test:e2e:smoke:cms`
