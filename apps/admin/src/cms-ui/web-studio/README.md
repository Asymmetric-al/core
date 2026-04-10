# Web Studio (`cms-ui/web-studio`)

Mission Control–native UI that wraps **Payload CMS** (mounted at `/web-studio` in `apps/admin`). Payload remains the source of truth for schemas, access control, document forms, drafts, versions, uploads, and Lexical rich text.

## Documentation (read before large changes)

- **Primary:** [`docs/guides/architecture/web-studio-living-spec.md`](../../../../docs/guides/architecture/web-studio-living-spec.md)
- **Runbook:** [`docs/guides/development/web-studio-runbook.md`](../../../../docs/guides/development/web-studio-runbook.md)
- **AI index:** [`docs/ai/web-studio-handoff.md`](../../../../docs/ai/web-studio-handoff.md)

## Directory map

| Path | Role |
|------|------|
| `shell/` | `StudioLayout`, nav rail, top bar |
| `collections/config.ts` | Per-collection labels, paths, preview hints, preference keys |
| `collections/shared/` | `NativeCollectionListView`, `NativeCollectionEditView`, workspace dialogs |
| `flows/` | TanStack Form wizards + template gallery (top-level Payload admin views) |
| `adapters/` | Preview URL helpers (`preview-url.ts`) |
| `feature-flags.ts` | `CMS_WEB_STUDIO_NATIVE_*` kill switches |
| `preferences/keys.ts` | Payload preference key strings |

## Rules of engagement

1. **Do not** replace Payload’s document field form with TanStack Form for collection bodies.
2. **Do** use TanStack Form (or `useAsymForm` from `@asym/ui`) for wizards and Mission Control–only dialogs.
3. After changing Payload component paths: `NODE_ENV=test bun run cms:importmap` from repo root.
4. New **staff** HTTP handlers that touch Supabase belong in `packages/api` with thin re-exports under `apps/admin/app/api/`.
