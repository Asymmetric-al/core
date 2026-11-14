# Round 13 shared grid context repair

Date: November 12, 2026 (Asia/Bangkok).

## Scope and authority

This repair addresses finding 2, **P2: Keep published grid context isolated from an uncommitted render**, in the preserved [React Doctor report](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/report.md). Work is confined to `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12` and these owned files:

- [Shared grid source](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid.tsx:1073).
- [Grid context publication regression tests](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/ui/data-grid-context-publication.test.tsx:314).
- This evidence report.

The user explicitly authorizes superseding the source freeze for this repair. The aggregate source freeze and scanner reverification must occur **after all concurrent repairs**. This report does not rewrite the archived inventories, scanner evidence, exception ledger, suppressions, configuration, or other owners' work. No git, server, environment, provider, browser, or child-agent operations are part of this repair.

## Root cause and repair

The original provider updated shared table/props/i18n refs and publication metadata during render. Context getters already held by committed consumers read those refs. A subsequent render that suspended could therefore leak pending values into committed event handlers while the committed DOM, record count, and loading flag still described the old render.

The repair keeps the existing shared grid publication policy and changes ownership of its mutable state:

- Each new context publication owns a separate snapshot cell, initialized from that render. New consumers can render its table, props, and merged labels without changing any previously published context.
- Reused context snapshots refresh only during commit. Callback-only bookkeeping copies the publication record instead of mutating the committed record during render.
- The committed publication ref, options ref, and auto-size table ref update only during commit.
- A private [first-child commit publisher](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid.tsx:1213) runs its layout effect before the grid children's layout effects. This preserves auto-sizing against a newly committed table; moving publication to the provider's own layout effect is too late for those descendants.
- Resize retains stable context identity while atom subscribers receive drag updates; the final sizing state publishes after the drag. Memoized versus fresh table-option callback handling, stable grid IDs, and per-store auto-size controller identity remain intact.

No new component system, primitive, preset, token scheme, public context API, or grid dependency is introduced. The existing `base-maia`, Base UI, Zinc semantic-token conventions are preserved.

## Real React regression coverage

[data-grid-context-publication.test.tsx](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/ui/data-grid-context-publication.test.tsx:1) uses React, React Testing Library, and real TanStack v9 table instances under jsdom. It does not replace React hooks or grid modules with source-extracted/mock implementations.

Its eight tests cover:

1. A subsequent transition suspends after the provider renders. The committed button still reads the old table, props, merged labels, callback, record count, and loading flag; resolving the transition publishes the pending values. Run in ordinary mode and StrictMode.
2. Discarding the suspended render preserves the committed context identity and values.
3. Callback publication follows the existing memoized/fresh table-option policy.
4. A suspended callback-only update retains the old callback until commit while context identity stays stable.
5. Resize keeps memoized context consumers quiet while atom subscribers update, then publishes the final sizing state.
6. Replacing a table auto-sizes the newly committed store before descendant layout effects read it, without modifying the previous store.

These are React rendering/commit regressions, not browser screenshots or live application/provider evidence.

## Red-green evidence

### 1. Suspended-render leak

Original source SHA256 before repair:

```text
ac6279c7b63d9e4deff777210d341cab07ab69c3e404c0b8806670bc5d94b6a7
```

Command:

```text
bunx vitest run tests/unit/packages/ui/data-grid-context-publication.test.tsx
```

**RED against the original source: one failed test.** The already committed DOM remained old, but clicking its existing button while the next render was suspended returned pending values:

| Context read       | Expected committed value | Received before repair |
| ------------------ | ------------------------ | ---------------------- |
| First row          | Committed person         | Pending person         |
| Empty-message prop | Committed prop           | Pending prop           |
| Merged empty label | Committed label          | Pending label          |
| Record count       | 10                       | 10                     |
| Loading            | false                    | false                  |

This is the concrete mixed-publication failure from finding 2, reproduced with real React rather than the original source-extracted probe.

### 2. Preserve descendant auto-size ordering

After isolating snapshots, an additional regression checked that commit-time publication occurs early enough for descendant auto-size effects:

```text
bunx vitest run tests/unit/packages/ui/data-grid-context-publication.test.tsx -t 'sizes the newly committed table'
```

**RED against the intermediate repair: one failed test, seven filtered tests.** The new table's expected column sizing was `{ pending: 200 }`; its actual sizing was `{}` because the provider's layout effect had not yet updated the auto-size table ref. The first-child commit publisher fixes this ordering without restoring render-time mutation.

**GREEN after the final repair:** the full focused file passes **8 tests**, duration **3.78 seconds**, using the focused-file command above.

## Scoped validation

All commands run from the r12 worktree root. These outcomes are from this repair's terminal runs, not a fresh React Doctor audit.

### Regression suite

```text
bunx vitest run tests/unit/packages/ui/data-grid-context-publication.test.tsx tests/unit/packages/ui/data-grid-panel.test.tsx tests/unit/packages/ui/data-grid-search-filtering.test.tsx tests/unit/packages/ui/data-grid-row-processing.test.tsx tests/unit/packages/ui/data-grid-exports.test.ts tests/unit/packages/ui/data-grid-keyboard-contract.test.ts tests/unit/packages/ui/data-grid-editing-keyboard.test.ts tests/unit/packages/ui/data-grid-cell-a11y.test.tsx tests/unit/packages/ui/ui-improvement-grid-headers.test.tsx tests/unit/packages/ui/components/data-grid-panel-auto-view.test.tsx tests/unit/packages/ui/data-table-column-resizing.test.tsx tests/unit/packages/ui/column-resize-handle-a11y.test.tsx --maxWorkers=2
```

Result: **12 files / 82 tests passed**, duration **22.14 seconds**.

### Lint and UI typecheck

```text
bun run lint:ui packages/ui/components/reui/data-grid/data-grid.tsx
bun run lint:ui packages/ui/components/reui/data-grid/data-grid.tsx --raw
bunx eslint tests/unit/packages/ui/data-grid-context-publication.test.tsx
bun run --cwd packages/ui typecheck --incremental false
```

Result: **all four commands pass**. The raw lint pass is scoped to this source file; it is not a global scanner-clean claim.

### Formatting

```text
bunx prettier --check packages/ui/components/reui/data-grid/data-grid.tsx tests/unit/packages/ui/data-grid-context-publication.test.tsx docs/qa/admin-workspaces-hillclimb/review/round13/runtime/grid-context-repair.md
```

Result: **pass**. All three files use Prettier formatting.

## Source identity and limits

Final source and regression hashes, recorded after formatting and the passing code checks:

```text
packages/ui/components/reui/data-grid/data-grid.tsx
4c56b19e412c915b8be154520a0d820f1fbd71b9a34426983a56b2275d12d528

tests/unit/packages/ui/data-grid-context-publication.test.tsx
8b90365cd9209a3f8168a031bd3aefdc07ea51b02b066791e31fd71e3400ede6
```

- No full repository suite, coverage run, build, application typecheck, live browser/axe check, server request, provider check, or runtime integration check is established here.
- No React Doctor audit or strict multi-target scanner reverification is rerun. Finding 2's behavioral regression is repaired and covered; scanner acceptance and the remaining findings stay with the aggregate repair/review workflow.
- No ledger entry, blanket waiver, scanner suppression, frozen inventory, or preserved original report is changed by this repair.
- No git operation or whole-worktree cleanliness claim is made. These hashes identify only the two owned code/test files at the recorded checkpoint; they do not certify concurrent work elsewhere.
