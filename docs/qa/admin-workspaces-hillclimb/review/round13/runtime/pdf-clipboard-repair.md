# PDF clipboard repair

Date: 2026-11-12 (Asia/Bangkok, UTC+07:00).

## Scope and authorization

- Worktree: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12` only.
- Product ownership: `apps/admin/app/(app)/pdf/page-client.tsx` and its nearest PDF tests, with this requested evidence document.
- Context: `docs/qa/admin-workspaces-hillclimb/review/round13/historical-tools-reconciliation.md:14` identifies premature clipboard success and missing-API crashes in the frozen historical checkpoint.
- The current user confirms capture collectors are terminal and authorizes the product repair. This is an explicit post-capture local checkpoint, not a change to the historical review or its scores.
- Root, admin, shared UI, frontend, testing, and relevant platform/OpenSpec instructions were read before implementation. Existing shared Base UI / `base-maia` components and semantic tokens remain in use.
- Pre-existing and concurrent work is preserved. The complete page already contains other work; its entire Git diff must not be attributed to this repair.

## Repaired behavior

The handler at `apps/admin/app/(app)/pdf/page-client.tsx:1621` awaits the clipboard write and catches asynchronous rejection and synchronous failures. Reducer-backed pending state and an immediate in-flight guard cover both existing copy controls.

| State                                         | Feedback and behavior                                                                                                                                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pending write                                 | Clears previous copied feedback; no success toast or `Copied!`. The footer action shows the shared spinner and `Copying…`, is disabled, and exposes `aria-busy`. The dialog also exposes busy state. |
| Fulfilled write                               | Shows `Copied!` and the matching `HTML copied to clipboard` or `JSON copied to clipboard` toast only after fulfillment.                                                                              |
| Rejected or synchronously failed write        | Shows `Copy failed` with format-specific retry/download guidance; no copied state or success toast; pending clears so retry is possible.                                                             |
| Clipboard API or callable `writeText` missing | Shows `Copy unavailable` with download guidance without propagating a TypeError or reporting success.                                                                                                |

- Both copy callbacks share the in-flight guard, so clicking the preview copy action while the footer copy is pending does not start another clipboard write. The shared preview action itself is not restyled or disabled.
- Close and Download remain available while copying; the export data is unchanged.
- Each fulfilled copy gets its own two-second feedback window, including immediately fulfilled retries batched by React. The timer is cleared on retry and unmount.
- Native documents retain JSON payloads and success/failure wording; legacy documents retain HTML payloads.

## Red-green evidence

Regression file: `tests/unit/apps/admin/app/pdf/pdf-clipboard.test.tsx`.

1. **Original RED:** the initial pending-write regression failed because copied state became `true` before the controlled clipboard promise settled.
2. **Await-only limitation:** awaiting the write made the first regression pass, but expanded coverage produced **7 failures / 1 pass** for missing pending state, rejected/synchronous or unavailable clipboard behavior, and stale feedback. This established that adding `await` alone was insufficient.
3. **Repair GREEN:** the initial expanded cases passed, then controller and rendered-dialog coverage reached **12 passing tests**.
4. **Rapid-retry RED:** `bunx --no-install vitest run tests/unit/apps/admin/app/pdf/pdf-clipboard.test.tsx -t 'gives each immediately fulfilled copy its full feedback window'` produced **1 failure / 12 skipped**. The first success timer cleared the second success too early (`expected false to be true`).
5. **Timer repair GREEN:** replacing the copied-boolean effect timer with a request-owned browser timer made all **13 clipboard tests pass**. An intermediate admin typecheck caught a Node/browser timeout-type mismatch; using the browser's numeric timeout ID resolved it.
6. **Final scoped GREEN:** **8 test files / 49 tests passed**, with clean scoped lint, formatting, and admin typecheck.

The tests cover controlled pending/fulfilled HTML and JSON promises, exact payloads and format labels, rejected writes and retry, missing clipboard and missing `writeText`, synchronous failure, duplicate calls, clearing old success while pending, delayed and immediately fulfilled retry timing, timer cleanup, and the rendered HTML export dialog's pending-to-success and pending-to-failure transitions.

## Final commands and results

All commands run from the r12 worktree root; no dependency installation is required.

```powershell
bunx --no-install vitest run tests/unit/apps/admin/app/pdf/pdf-clipboard.test.tsx
```

Result: **1 test file / 13 tests passed** after the timer repair.

```powershell
bunx --no-install vitest run tests/unit/apps/admin/app/pdf tests/unit/apps/admin/pdf-studio-native-ui.test.ts tests/unit/apps/admin/tools-studio-followups.test.ts
```

Result: **8 test files / 49 tests passed**, exit 0. Final run started at 02:38:18 local time; reported duration 7.72 seconds.

```powershell
bun run lint:ui 'apps/admin/app/(app)/pdf/page-client.tsx' 'tests/unit/apps/admin/app/pdf/pdf-clipboard.test.tsx'
```

Result: exit 0, no warnings or errors.

```powershell
bun run --cwd apps/admin typecheck --incremental false
```

Result: `tsc --noEmit --incremental false`, exit 0. No incremental compiler artifact is requested.

```powershell
bunx --no-install prettier --check 'apps/admin/app/(app)/pdf/page-client.tsx' 'tests/unit/apps/admin/app/pdf/pdf-clipboard.test.tsx' 'docs/qa/admin-workspaces-hillclimb/review/round13/runtime/pdf-clipboard-repair.md'
git --no-optional-locks diff --check -- 'apps/admin/app/(app)/pdf/page-client.tsx' 'tests/unit/apps/admin/app/pdf/pdf-clipboard.test.tsx' 'docs/qa/admin-workspaces-hillclimb/review/round13/runtime/pdf-clipboard-repair.md'
```

Results: Prettier reports all three files formatted; the scoped tracked diff whitespace check exits 0. Git diff does not inspect untracked files; Prettier covers the new test and this document explicitly.

## Source checkpoint

SHA-256 hashes collected at `2026-11-12T02:38:18+07:00` after the last product/test edit and successful source/test formatting check:

| File                                                   | SHA-256                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `apps/admin/app/(app)/pdf/page-client.tsx`             | `FCA5ED238D366088CDD978D011BDE2F0A6C40AA3079492EF78BBBA4514391465` |
| `tests/unit/apps/admin/app/pdf/pdf-clipboard.test.tsx` | `C3236B943625430FE894E63672FAB99B26326C665D850BA238C0CAD11817E11C` |

These are complete-file checkpoints, not claims of ownership over every existing change in the page.

## Evidence boundaries and remaining acceptance

- Tests run in jsdom. `navigator.clipboard` is stubbed with controlled promises; success and error toasts are mocked and their arguments asserted. This proves local asynchronous state/feedback behavior, not an actual operating-system clipboard write.
- Rendered dialog tests use the real PDF Studio page and shared dialog/button components. The legacy remote editor is mocked with a ready callback and deterministic HTML export; no remote editor script or provider request is needed. Native JSON copy is covered at the controller seam, not through a live native editor/browser session.
- No dev server, browser session, new screenshot, clipboard-permission prompt, keyboard/screen-reader session, responsive review, or deployed acceptance check was run. Existing PDF captures remain historical and do not show this repaired checkpoint; affected PDF evidence still needs recapture in an authorized browser pass.
- No Git mutation, commit, branch operation, deployment, environment/provider configuration operation, or child agent was used. Only the owned PDF source, new nearby regression test, and this report are repair outputs.
- No full monorepo check, production build, external-provider validation, or new visual score is claimed. Unrelated PDF/export and financial-review findings remain outside this repair.
