# R13r3 PDF local viewport trial

Date: November 12, 2026 (Asia/Bangkok).

Worktree: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`.

Status: implemented and locally unit-verified; real-browser interaction and visual acceptance remain with root after integration. This report does not accept the trial or requalify round13r2 evidence.

## Authority and RED evidence

- Followed root's closed-collection/lifted-freeze decision in [next-candidate-repair-decision.md](../refreeze/next-candidate-repair-decision.md) and the exact PDF trial in [qualification-20261112-email-pdf.md](../round13r2-tools-qualification/qualification-20261112-email-pdf.md).
- Inspected the [original PDF390 PNG](../round13r2-support-tools/run-20261111T210346808Z/batches/tools-02/capture/pdf-studio--mobile.png) offline. It confirms legacy editor clipping. The qualification's **17 x 30 pixels** describe visible blue fill, not logical button dimensions or a measured hit target.
- Existing visual evidence is RED, not a fresh treatment capture. No new image, manifest, ledger, harness, or capture artifact was authored.
- Read applicable root/admin/shared-UI instructions, frontend/testing/protected-path rules, relevant OpenSpec intent and matching skills before editing. Read the installed Next.js 16.4.2 `use-client` guide and committed `.next-docs` CSS/Vitest fallback sections; no route boundary, server await, or cache behavior changes.

## Repair

- `apps/admin/app/(app)/pdf/page-client.tsx:1937`: added `min-w-0` to the existing flex editor host for containment.
- `apps/admin/app/(app)/pdf/page-client.tsx:1946`: only the legacy branch gains a region named **PDF editor canvas**, `tabIndex={0}`, `absolute inset-0 overflow-x-auto overflow-y-hidden`, and semantic `ring-ring` inset focus styling.
- `apps/admin/app/(app)/pdf/page-client.tsx:1952`: the inner canvas uses `relative h-full min-w-5xl lg:min-w-0`. The **64rem width is an interaction trial, not an established vendor minimum**. The minimum releases at `lg`; the existing iframe editor remains absolutely positioned inside the canvas.
- `apps/admin/app/(app)/pdf/page-client.tsx:659`: legacy guidance now explains scrolling left/right **within the editor**, and remains visible below `lg`, matching the canvas breakpoint. Native guidance retains its original larger-screen wording and `md` breakpoint; it does not claim local panning.
- Preserved the native editor branch, legacy editor ID/ref/readiness/design callbacks, right-docked uncollapsed tools, and shared iframe lifecycle/options. No shared component, dependency, global style, provider configuration, or export-policy change.

## Meaningful regression coverage

- `tests/unit/apps/admin/app/pdf/pdf-studio-controls.test.tsx:45`: renders the real route with a no-source mock iframe. The named region contains the editor, declares `tabIndex={0}`, and accepts DOM focus. Export starts disabled and becomes enabled only after the editor-ready callback. A design-update callback still exposes the Unsaved status; the region and mock iframe retain their DOM identities through these updates.
- The new regression was run before the product change and failed because no region named **PDF editor canvas** existed: one expected failure, five skipped tests. This is accessibility/ownership RED in addition to the original visual RED, not a class-string layout assertion.
- `tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx:100`: native header coverage rejects legacy panning guidance. Free-mode coverage also attempts the disabled PDF item and confirms no PDF callback, then activates the available HTML item and confirms its callback. Existing warning/description linkage remains covered.
- Existing focused PDF suites retain dirty-replacement cancellation/confirmation, export policy, native UI/feedback, preview feedback, and clipboard compatibility coverage.

The iframe in the new test is a mock with no remote editor. These tests do **not** prove real vendor readiness, scrolling geometry, Add Row activation, focus traversal across the real iframe, visible focus-ring paint, or absence of page overflow. No synthetic Add Row substitute was used to claim acceptance.

## Verification

Commands ran from the worktree above; only PDF unit tests, scoped lint, and scoped formatting were run.

```text
bunx --no-install vitest run tests/unit/apps/admin/app/pdf/pdf-studio-controls.test.tsx --maxWorkers=2 -t 'named focusable viewport'
```

Expected pre-repair RED: one failed, five skipped; missing named region.

```text
bunx --no-install vitest run tests/unit/apps/admin/app/pdf/pdf-studio-controls.test.tsx tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx --maxWorkers=2
```

Post-repair GREEN: two files, 10 tests passed.

```text
bunx --no-install vitest run tests/unit/apps/admin/app/pdf tests/unit/apps/admin/pdf-studio-native-ui.test.ts --maxWorkers=2
```

Focused compatibility gate: **seven files, 47 tests passed**. After the import-order-only cleanup, the controls file was rerun separately with `--maxWorkers=2`: all six tests passed.

```text
bun run lint:ui 'apps/admin/app/(app)/pdf/page-client.tsx' tests/unit/apps/admin/app/pdf/pdf-studio-controls.test.tsx tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx --raw --format json
```

Exit 0, **zero errors**. Product source has zero warnings. Two existing `@typescript-eslint/consistent-type-imports` warnings remain on the unchanged `typeof import(...)` module aliases in the controls test at line 32 and header test at line 19. New import-order warnings were fixed; no suppression or ledger was changed.

```text
bunx --no-install prettier --check 'apps/admin/app/(app)/pdf/page-client.tsx' tests/unit/apps/admin/app/pdf/pdf-studio-controls.test.tsx tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r3-repairs/pdf.md
```

Scoped formatting passes. No broad typecheck, build, repository-wide lint/test gate, browser, server, environment-file/provider operation, Git operation, payment operation, Save, or real export was performed.

## Root postintegration acceptance still required

- Load the real legacy editor at 390, 640, 1024 and 1440 widths. Check local overflow and actual viewport/canvas geometry, as well as no page-level horizontal overflow. Do not treat the presence of classes, an iframe, or an overflow metric alone as acceptance.
- At 390 after local horizontal panning, require the entire Add Row control and label to be visible, unobscured by the tool rail and reachable. Activate the real Add Row in the authorized disposable unsaved design; observe the new row and Unsaved state. Do not Save or export.
- Verify keyboard entry/exit, local panning, real iframe focus behavior, visible focus treatment and touch scrolling. Check guidance visibility around the actual `lg` breakpoint and ensure loading does not remount the editor.
- Recheck native and desktop behavior, including no legacy panning guidance in native mode. The native branch has no new scroll wrapper.
- For the separately owned Export catalogue repair, wait for enabled Export before clicking and require actual menu postconditions. Keep the readiness/exporting guard, free-plan PDF restriction and HTML alternative intact. This task does not repair or qualify that harness state.

Reject or revise the 64rem trial if real interaction acceptance fails. No visual score, fresh capture qualification, or final usability approval is claimed here.
