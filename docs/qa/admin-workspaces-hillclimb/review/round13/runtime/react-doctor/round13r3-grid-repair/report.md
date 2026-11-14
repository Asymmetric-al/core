# Round13r3 grid repair

Date: 2026-11-12. Local candidate verification, not a new React Doctor acceptance decision.

## Authorization and boundaries

- All work ran in `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`.
- Authority: `runtime/refreeze/next-candidate-repair-decision.md` lifts the old global freeze; the subsequent user/root instruction explicitly extends implementation ownership to `packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx`, the actual G2 owner.
- Read the applicable repository/shared-UI instructions, frontend/testing/protected-path rules, shared-UI spec and Base UI adoption amendment, and relevant TDD, Vitest, React component, React Doctor, shadcn/ReUI skills before editing. The scoped repair does not change the `base-maia`/Base UI/token contract.
- Read the immutable `round13r2-grid-repro/report.md`, its executable `grid-rebinding.test.tsx` and DOM infrastructure, and `round13r2-grid-qualification/report.md` under `runtime/react-doctor`. Those artifacts remain historical evidence, not files to update or tests to import from documentation.
- No children, browser, server, provider, Git operations, environment configuration changes, dependency installs, broad test/build/scanner runs, or ledger/waiver/audit-control changes. Existing concurrent work was not reset, reverted, or reformatted. Patches were limited to the files listed here; this is not a claim that the shared checkout is otherwise clean.

Paths beginning `runtime/` in this report are relative to `docs/qa/admin-workspaces-hillclimb/review/round13/`.

## Source changes

### G2: mounted live-node rebinding

Changed `packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx`:

- Keep a container-scoped, child-list/subtree MutationObserver for the enabled effect's lifetime, instead of only discovering the first late table/header and disconnecting.
- Resolve the current header, table, table viewport, and horizontal scrollbar identities. Reconcile the existing ResizeObserver target set: retain the captured scroll viewport, unobserve/delete obsolete header/table/table-viewport targets, and observe their replacements. Removal updates cached identities to null instead of retaining detached nodes.
- Requery/reconcile again inside the coalesced animation frame before measurement. Ordinary scroll/resize therefore uses live DOM even without MutationObserver support.
- Mutation delivery schedules geometry only when one of the queried identities changes. An unrelated child mutation does not schedule another grid frame; attributes are not observed, so overlay CSS writes do not feed the mutation observer.
- Cleanup retains latest-frame cancellation, both observer disconnects, removal of the exact captured passive scroll listener, and drag-state cleanup; it also clears the local target set and cached element references.
- Preserve public exports/options, horizontal/vertical/both modes, sticky-header enablement, ResizeObserver reuse during mounted replacements, RAF coalescing, geometry equations, overlay-only CSS writes, RTL handling, and pointer/drag implementation.

This repairs **mounted stale-node geometry and retention**, not an after-unmount leak. The original ordinary/StrictMode cleanup cases already passed before the repair.

### G1: ineffective builder memo

Changed `packages/ui/components/reui/data-grid/data-grid-column-header.tsx`:

- Replace the ineffective `useMemo` around menu construction with the same per-render builder body in a local immediately invoked function.
- Remove the unused `useMemo` import and memo-only `columnVisibilityKey` serialization/dependency array.
- Keep filter/sort/pin/move/visibility sections, handlers, rendered-peer and completed-order calculations, spans, outer `memo`, state `Subscribe`, label/context updates, and unpin focus/RAF handoff unchanged.

The accepted RED is the existing `react-doctor/no-effect-with-fresh-deps` finding on the former `columnOrder` dependency, fingerprint `b5ff73a52b63d47980896d361a46bfac6619860eeb07720f79a4c621d3cfebb7`. No artificial failing behavior test was created for memo removal. No claim of fewer builder calls or measured performance improvement is made.

`packages/ui/components/reui/data-grid/data-grid.tsx` did not need a change. Its SHA-256 remains `4C56B19E412C915B8BE154520A0D820F1FBD71B9A34426983A56B2275D12D528`.

## Proper regression coverage

Added only these directly relevant unit files:

- `tests/unit/packages/ui/data-grid-scroll-area-rebinding.test.tsx`
- `tests/unit/packages/ui/data-grid-scroll-area-infrastructure.ts`
- `tests/unit/packages/ui/data-grid-column-header-compatibility.test.tsx`

The rebinding cases are adapted from the immutable reproduction into the normal root Vitest harness, with a jsdom file directive, package-local source imports, restored DOM/global instrumentation, and no evidence console logging or imports from documentation. The actual DataGrid provider, DataGridScrollArea, Base UI scroll area, and actual table engine run without React/component/engine mocks. The fixture supplies ordinary table/header slots, not the full DataGridTable renderer. MutationObserver delegates to native jsdom mutation delivery; ResizeObserver and RAF are controlled platform instrumentation. Detached headers retain native zero rectangles rather than a fabricated nonzero detached height.

### RED before source repair

The first proper lifecycle run against unchanged production source reports **5 failed, 6 passed (11)**:

1. Keyed whole-table replacement, `both` plus sticky header.
2. Keyed whole-table replacement, `vertical` plus sticky header.
3. Header-only keyed replacement with a stable table/viewport.
4. Late initial discovery followed by another keyed table replacement.
5. Table to empty to table without remounting the scroll area.

The connected replacement header measures 60px while the published overlay remains 24px. In replacement probes, a later genuine subscribed viewport resize/scroll measures the detached old header as 0px. New header/table targets are absent and detached targets remain subscribed. The six baseline geometry/ordinary-cleanup characterizations pass independently.

### GREEN and compatibility

- The same initial 11 lifecycle cases pass after the G2 source repair.
- Final lifecycle coverage is **18 passing cases**: the original cases plus keyed table-viewport replacement, no extra frame for unrelated child mutation/container scoping, three disabled-mode combinations, enabled/disabled/re-enabled cleanup, and live-scroll fallback without MutationObserver. Replacement cases additionally verify current-header-only resize delivery, detached-target unobserve, current track geometry, and stable observer reuse. Ordinary and StrictMode replay/unmount verify pending-frame cancellation, passive-listener pairing, disconnection, zero active targets, and no subsequent DOM writes. Resource assertions run before helper restoration can mask a missed cleanup.
- **5 header compatibility cases** pass on the original G1 source before memo removal and again with both source repairs: filter order and sort toggling, omitted-order completion with hidden/pinned peers, atomic header-span moves, live i18n/filter/visibility state, and pin/unpin remount-focus handoff.
- The focused four-suite run passes **33 tests**, including unchanged context-publication and export suites. After the final import-order-only correction, the lifecycle suite is rerun and all 18 cases still pass. Header/context/export code has no later changes.

## Exact verification commands and outcomes

All commands below ran from the authorized checkout root. Checks ran sequentially. Unit runs use the existing Bun script, one worker at a time, no file parallelism, and disabled coverage; no test config or test setup was changed. The script reports Bun 1.4.3 and Vitest 5.0.5.

### Lifecycle RED, initial GREEN, and final focused rerun

```powershell
bun --no-env-file run test:unit tests/unit/packages/ui/data-grid-scroll-area-rebinding.test.tsx --coverage.enabled=false --maxWorkers=1 --no-file-parallelism
```

- Initial RED: exit 1; 5 failed / 6 passed.
- Initial repair GREEN: exit 0; 11 passed.
- Final expanded suite, after import ordering: exit 0; 18 passed.

### Header baseline

```powershell
bun --no-env-file run test:unit tests/unit/packages/ui/data-grid-column-header-compatibility.test.tsx --coverage.enabled=false --maxWorkers=1 --no-file-parallelism
```

An initial fixture-only failure (exit 1, five cases) supplied an incomplete initial column-pinning object, producing `TypeError: end is not iterable`. Adding the required empty `end` bucket to the fixture, without changing production source, yields exit 0 / 5 passed. This infrastructure mistake is not G1's RED evidence.

### Focused candidate regression/compatibility

```powershell
bun --no-env-file run test:unit tests/unit/packages/ui/data-grid-scroll-area-rebinding.test.tsx tests/unit/packages/ui/data-grid-column-header-compatibility.test.tsx tests/unit/packages/ui/data-grid-context-publication.test.tsx tests/unit/packages/ui/data-grid-exports.test.ts --coverage.enabled=false --maxWorkers=1 --no-file-parallelism
```

First expanded run: exit 1, 31 passed / 2 failed. Both failures were new instrumentation assertions looking for the mutation subscription on the Base UI Root instead of the actual owning outer container. Correcting only those test assertions yields **exit 0, 4 suites / 33 tests passed**. No additional production repair was needed for these test-harness mistakes.

### Scoped native lint

```powershell
bun --no-env-file run lint:ui packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx packages/ui/components/reui/data-grid/data-grid-column-header.tsx tests/unit/packages/ui/data-grid-scroll-area-rebinding.test.tsx tests/unit/packages/ui/data-grid-scroll-area-infrastructure.ts tests/unit/packages/ui/data-grid-column-header-compatibility.test.tsx
```

First run: exit 0 with three `import-x/order` warnings in the adapted lifecycle test. Fixed only that import ordering. Final run: **exit 0, no warnings or errors**. No suppression changes or fix/prune flags were used.

### UI package typecheck

```powershell
bun --no-env-file run --cwd packages/ui typecheck
```

**Exit 0** (`tsc --noEmit`). This covers `packages/ui`, not a standalone typecheck of the new root test files.

### Scoped formatting

```powershell
bun --no-env-file node_modules/prettier/bin/prettier.cjs packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx packages/ui/components/reui/data-grid/data-grid-column-header.tsx tests/unit/packages/ui/data-grid-scroll-area-rebinding.test.tsx tests/unit/packages/ui/data-grid-scroll-area-infrastructure.ts tests/unit/packages/ui/data-grid-column-header-compatibility.test.tsx --check
```

Initial check: exit 1, only the three new test/helper files need formatting; both production owners already pass. Installed Prettier formats those new files through context-preserving `apply_patch` edits. The final check includes the new report:

```powershell
bun --no-env-file node_modules/prettier/bin/prettier.cjs packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx packages/ui/components/reui/data-grid/data-grid-column-header.tsx tests/unit/packages/ui/data-grid-scroll-area-rebinding.test.tsx tests/unit/packages/ui/data-grid-scroll-area-infrastructure.ts tests/unit/packages/ui/data-grid-column-header-compatibility.test.tsx docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r3-grid-repair/report.md --check
```

The first report-inclusive check exits 1 for Markdown formatting in the new report only. After formatting that report through `apply_patch`, the final result is **exit 0; all six files pass**.

### Read-only source checks

```powershell
rg -n 'useMemo|columnVisibilityKey' packages/ui/components/reui/data-grid/data-grid-column-header.tsx
Get-FileHash -Algorithm SHA256 -LiteralPath 'packages/ui/components/reui/data-grid/data-grid.tsx','packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx','packages/ui/components/reui/data-grid/data-grid-column-header.tsx'
```

The `rg` command has no matches (raw exit 1, expected absence; the surrounding PowerShell check maps this to success). Hash reads succeed. Final candidate hashes:

| File                          | SHA-256                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `data-grid-scroll-area.tsx`   | `574256385C606E48EA49F8D1EB8910F605AE9FDA496EF523BF32B75B20858779` |
| `data-grid-column-header.tsx` | `8999C719BB94F60875F999EFB57B443B7BFB68F95CCF719ED7E2F68C03D05439` |

## Limitations and handoff

- Geometry uses controlled jsdom dimensions (200px viewport, 600px content, initially 24px/replacement 60px headers); it is not browser layout, visual, pointer-drag, scrollbar-thickness, RTL, zoom, or device evidence. Native mutation delivery and the real component/engine path establish the scoped mounted lifecycle regression, not complete UI qualification.
- Only the named focused tests, scoped native lint/format checks, and UI package typecheck ran. New tests execute/transpile in Vitest; no broader build, coverage gate, app tests, browser/server/provider verification, or full repository typecheck was attempted.
- No fresh React Doctor audit/raw/check was authorized or run. G1's memo/dependency source is removed and behavior remains compatible; G2's reproduced runtime defect is repaired. Neither statement claims fresh scanner GREEN, a reclassified G2 scanner finding, a waiver, ledger closure, overall acceptance, or a new frozen candidate.
- Old evidence and decision/ledger/control files were not edited. This report is the only new QA artifact. The Windows `apply_patch.bat` shim rejected initial long/multiline patch invocations without changing files; successful edits used that same patch tool's direct `--codex-run-as-apply-patch` entrypoint, with contextual/concurrency checks. No Git command was used for inspection or writing.
