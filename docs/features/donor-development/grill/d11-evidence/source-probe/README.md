# D11 existing SearchableSelect source check

Research only, 2026-10-10. **3 existing tests passed; zero failures.** This runs
the checkout's real `SearchableSelect` and Base UI controls in jsdom. It adds no
test or product implementation. See [results.json](results.json),
[run.log](run.log), [metadata.json](metadata.json), and the exact
[isolated configuration](vitest.config.mjs).

From the repository root:

```sh
node node_modules/vitest/vitest.mjs run --config docs/features/donor-development/grill/d11-evidence/source-probe/vitest.config.mjs --reporter=json --outputFile=docs/features/donor-development/grill/d11-evidence/source-probe/results.json
```

The three tests in
[`tests/unit/packages/ui/searchable-select.test.tsx`](../../../../../../tests/unit/packages/ui/searchable-select.test.tsx)
exercise:

1. Label/trigger focus, label filtering, stable IDs despite duplicate labels,
   ArrowDown/Enter selection, and focus restoration.
2. The mounted empty-results status region, preservation of the selected value
   when search finds nothing, and Escape dismissal.
3. Disabled-option click rejection and updated display labels after rerender.

This evidence configuration retains the root React transform, workspace-package
pinning, per-importer alias plugin, shared safe unit environment/setup, and
existing test-file jsdom directive. It deliberately excludes the root Sentry
aliases: the earlier D6 normal-config attempt stopped before tests because the
installed Sentry package does not export `./config`. That failure was not rerun
here. Bun remains unavailable. This is not the repository's full unit/coverage
gate. Installed Node is 24.19.0, Vitest 4.1.4 (manifest 5.0.3), React 19.2.3,
Base UI 1.8.0, jsdom 26.1.0 and React Vite plugin 6.0.1.

No browser, deployed app, network, database, authorization, concurrency, save
receipt, remote cache, touch/zoom, assistive-technology or WCAG qualification is
claimed. These tests do not render a cultivation journey or stage command, test
retirement, or prove the final D11 experience. No new SQL experiment was needed:
the new evidence concerns an actual reusable UI control, not D10's already
examined catalog constraints.
