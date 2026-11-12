# Web Studio published-page address fix

Implementation completed in `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12` on 2026-11-12 (Asia/Bangkok).

## Scope and behavior

- Updated only `NativeCollectionEditView.tsx`, added its adjacent `use-published-page-url.ts`, added `tests/unit/apps/admin/web-studio-published-page-link.test.tsx`, and wrote this report. Earlier builders' editor changes were preserved.
- The header, phone menu and inspector now share one resolved published URL. The editable document's `_status` no longer removes the action when an older published copy exists.
- The address comes from the authenticated Payload find-by-ID REST endpoint using the configured API route, `credentials: "include"`, `depth=0`, the selected locale with `fallback-locale=null` when applicable, and no `draft=true`. Requests use `cache: "no-store"` and the query's abort signal. The published record is passed through the existing `previewPathForData` and configured donor-origin resolver.
- A newer draft may change its slug; public actions use the returned published slug exclusively. Home and nested/encoded slug mappings remain unchanged. Missing/blank published slugs cannot silently produce a homepage action.
- Missing origin, published-copy flag, path configuration, document/tenant identity or read permission suppresses the lookup and public action. Initializing/trashed documents do likewise. Edit and publish permission are not required for an authorized reader's public link. Existing authenticated previews and save/publish controls were preserved.
- HTTP, transport and parsing failures remove the action without exposing provider diagnostics. Non-published responses, mismatched document/tenant identities and malformed records fail closed. Pending/revalidating reads expose no public action. Only the resolved URL is stored as query data; the document body is not cached or rendered.
- Document, locale, API, origin, tenant, acknowledged-save/version and eligibility changes fence query identity. Superseded or unmounted reads abort; late responses cannot restore another scope's link. Eligibility changes also cancel pending reads, including loss of read permission/publication and entering trash/initialization.

## Context inspected

Read root/admin instructions, shared UI ownership, frontend/testing/backend rules and the data-access boundary; canonical Payload skill and `reference/PUBLIC-V4.md`; TDD/Vitest guidance and the installed test harness. The lint skill is present at `.agents/skills/lint-and-validate/SKILL.md` in this checkout.

Reviewed `openspec/project.md`, CMS publication/preview/localization requirements and binding contracts, relevant platform publication/tenant boundaries, and the active Web Studio CMS/hybrid deltas. These active Phase 23 contracts do not establish runtime activation; this change repairs the current native editor's existing published-link journey, and does not qualify or introduce D1 publication machinery.

Inspected current collection/access configuration, `native-revert-status.tsx`, Payload public `4.0.0-beta.3` installed query reference, REST find-by-ID/access implementation and document-provider declarations/source. Read installed Next `16.4.2` client-boundary and Vitest guidance. The supplied `studio-review.md` path was absent in this checkout when inspected; the supplied finding was reproduced directly.

## TDD evidence

The seam is the native editor receiving Payload document/provider state and an authenticated REST response. Its real header/phone/inspector components render; the Payload form, surrounding shell, settings and pin boundary are replaced with deterministic test doubles. This is not proof of the installed async form or the authenticated route.

First behavioral RED, before production changes:

```powershell
bunx --no-install vitest run tests/unit/apps/admin/web-studio-published-page-link.test.tsx --maxWorkers=1 --no-file-parallelism
```

The published state initially exposed both live links; after transition to a newer same-slug draft, the second link assertion failed because no `View live page` links remained. Earlier import/router harness setup failures were corrected before this behavioral RED and are not counted as regression evidence.

After the initial lookup implementation, expanded tests produced three additional behavioral RED cases: published responses with absent, empty or whitespace-only slugs incorrectly linked to `/`. The implementation now rejects those responses. A separate unmount assertion was corrected to await TanStack Query's asynchronous zero-time garbage collection; that assertion timing issue was not a product failure. The focused suite then passed all 28 tests.

Cancellation RED:

```powershell
bunx --no-install vitest run tests/unit/apps/admin/web-studio-published-page-link.test.tsx --maxWorkers=1 --no-file-parallelism -t 'cancels a pending read'
```

All four new eligibility tests failed with `signal.aborted === false`: disabling an observer alone does not cancel its existing request. Including eligibility in query identity made the same command GREEN: 4 passed, 28 excluded by the name filter. Later additions verify nonlocalized reads, URL-only caching and revalidation after a successor publication.

Final dedicated suite: 35 tests. It covers published-to-draft continuity, changed draft slug/prior published address, all three link surfaces, pending states, never published/no origin/pathless collections, reader permissions, invalid/mismatched/non-published responses, errors without diagnostic leakage, document/locale stale responses, removal of configuration/eligibility, unmount cancellation and publication refresh.

## Final verification

All commands ran from the r12 root unless explicitly stated otherwise.

Bounded regression run — PASS, 6 files / 85 tests:

```powershell
bunx --no-install vitest run tests/unit/apps/admin/web-studio-published-page-link.test.tsx tests/unit/apps/admin/web-studio-document-preview-links.test.tsx tests/unit/apps/admin/web-studio-revert-status.test.tsx tests/unit/cms/web-studio-editor-state.test.ts tests/unit/cms/web-studio-preview-url.test.ts tests/unit/cms/web-studio-native-routes.test.ts --maxWorkers=1 --no-file-parallelism
```

Targeted production ESLint — PASS, exit 0:

```powershell
bun tooling/eslint-config/lint.mjs apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/use-published-page-url.ts
```

Admin TypeScript — PASS, exit 0 (`tsc --noEmit`):

```powershell
bun run --cwd apps/admin typecheck
```

Targeted formatting — PASS, exit 0:

```powershell
bunx --no-install prettier --write apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/use-published-page-url.ts tests/unit/apps/admin/web-studio-published-page-link.test.tsx
bunx --no-install prettier --check apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/use-published-page-url.ts tests/unit/apps/admin/web-studio-published-page-link.test.tsx
```

Design-system information — PASS (`base-maia`, Base UI, Zinc), run from `packages/ui`:

```powershell
bunx --no-install shadcn info --json
```

Test-file lint limitation — exit 1, four `no-restricted-imports` diagnostics and zero warnings:

```powershell
bun tooling/eslint-config/lint.mjs tests/unit/apps/admin/web-studio-published-page-link.test.tsx
```

The existing root lint policy applies its universal app-import prohibitions to tests outside apps as well. It rejects the established test imports of the app component and app-installed QueryClient. Reproduction on the unchanged neighboring preview test exits 1 with the same two boundary diagnostics for its app import:

```powershell
bun tooling/eslint-config/lint.mjs tests/unit/apps/admin/web-studio-document-preview-links.test.tsx
```

The initial combined source/test lint command also exited 1 for these imports (plus an inline import-type warning subsequently eliminated by making the Payload boundary mock explicit):

```powershell
bun tooling/eslint-config/lint.mjs apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/use-published-page-url.ts tests/unit/apps/admin/web-studio-published-page-link.test.tsx
```

No lint rule/configuration was changed or disabled, and no import-path evasion was introduced. Resolving this test-policy mismatch would require a separately owned tooling change. Production files pass their targeted lint command.

## Lead verification boundary

Account-backed real-route/browser verification remains the lead's task. Verify published page → newer draft → changed draft slug using the installed Payload form, confirm the authenticated published read returns the prior address and all responsive actions agree, then confirm a newly published successor refreshes the address. Unit doubles do not establish session authentication, tenant enforcement against a real store, public-route delivery or the installed async form's behavior.

No servers, localhost requests, external provider/database effects, environment/secret files, Git mutations, Turbo invocations or subagents were used. Broader React Doctor ledger qualification remains with the root after all area changes; this report does not claim it passed.
