# D17 actual default-initialization mechanics

2026-10-10. **Final run: 4/4 tests passed in two files.** The tests execute Core's
real `SearchableSelect` and `useAsymForm` under jsdom. They do not implement a
simulated P27 form or mock either tested unit.

## Observations

1. An uncontrolled selector initially given `defaultValue={null}` remains empty
   when options and a non-null `defaultValue` arrive later. It emits no selection
   callback. A late prop is not initial-value synchronization.
2. An initial prefill is visible without a change callback. A user can choose a
   different item; changing `defaultValue`, reordering options and changing the
   selected item's label afterward preserves that chosen identity. Only the user
   selection emitted a callback.
3. The real `useAsymForm` hook replaces an untouched choice when supplied
   `defaultValues` change.
4. After touching an unrelated field through the real form API, changed
   `defaultValues` do not initialize a still-empty choice. The unrelated draft
   survives. This is the installed form library's form-wide touched guard, not a
   P27 initializer policy.

The selector tests use real DOM events and rerender the shared component. The hook
tests use `renderHook` and inspect its actual state. They establish reusable
mechanics only: neither automatically provides D17's source proposal, eligibility,
pristine-list semantics or immutable submitted intent.

## Reproduce and artifacts

From `/workspace/core` with the recorded installed dependencies:

```sh
node node_modules/vitest/vitest.mjs run --config docs/features/donor-development/grill/d17-evidence/source-probe/vitest.config.mjs --reporter=json --outputFile=docs/features/donor-development/grill/d17-evidence/source-probe/results.json
```

`initial-defaults.test.tsx`, `form-defaults.test.tsx` and `vitest.config.mjs` are
the executed final inputs. `results.json` is Vitest output; `run-output.txt` contains the
run output. `metadata.json` records time, HEAD, versions, command, counts and SHA-256
hashes of named tests, harness and source files, including the inspected installed
form implementation. Hashes do not cover the whole dependency tree.

The first attempt contained only the two selector checks: **1 passed, 1 failed**.
The second check incorrectly expected another identical development warning.
Base UI's installed `error.js` delegates to `createLogOnce`, so it did not log the
same warning twice; the selected identity already remained correct. The corrected
test allows deduplication and rejects unrelated captured errors. The warning is
explicitly asserted in the first check; no component behavior was patched.
`attempt1-results.json`, `attempt1-run-output.txt` and
`attempt1-initial-defaults.test.tsx.txt` preserve that attempt's evidence. The final
run adds the two newly requested real form-hook checks. This was a harness
expectation correction, not discovery and remediation of an application defect.

## Versions and limits

Executed: Node **24.19.0**, Vitest **4.1.4**, React **19.2.3**, Base UI **1.8.0**,
TanStack React Form/core **1.28.6**, jsdom **26.1.0**, Testing Library React
**16.3.2**, Vite React plugin **6.0.1**. Manifests request Vitest **5.0.3**, React
**19.3.0**, TanStack React Form **1.33.5** and Base UI **1.8.0**. Bun is unavailable.

The scoped harness uses Core's workspace/alias plugins, React transform,
`tests/setup/unit-env.ts`, placeholder environment values and one worker. It follows
the prior D11/D16 evidence harness; the earlier root-config attempt failed on the
installed Sentry `./config` export. That root failure was not rerun. This is not
the standard Bun suite, CI, coverage gate or manifest-version qualification.
The deliberately separate research location is authorized for this review.

No API, database, authorization, live network, asynchronous request scheduler,
pending receipt, explicit clear control, group admission, real browser layout,
screen reader or P27 flow was tested. Rerenders stand for changed inputs only,
not measured network races. Previously passed D11/D16 tests were not rerun.
No application component, dependency, migration, production test or real data
was changed.
