# D19 actual explicit-empty selector mechanics

2026-10-10. **1/1 test passed on the first test run.** This executes Core's real
shared `Select` composition and installed Base UI under jsdom, with no component
mocks. It is not a P27 form, domain model or application implementation.

## New observation

Starting from a selected stage-like string value, the test selects an actual
rendered option whose value is `null` and whose label is “Not yet assessed.” The
real shared selector emits `null` exactly once and displays that option's label,
rather than the separately supplied generic placeholder.

This establishes a primitive capability for an explicitly rendered empty choice.
It does not establish that every null callback means deliberate user clearing, or
that the caller's business state changes. In particular, Core's higher-level
`AsymSelectField` accepts string-valued options and ignores null callbacks at
`packages/ui/components/primitives/tanstack-form.tsx:77–80,531–535`. This probe does
not exercise or override that wrapper. D19 must deliberately compose/map its valid
no-current-stage intent; a display label alone is insufficient.

The fixture does not require staff to click this option when the eventual P27 form
already clearly shows the intended no-current-stage result. It proves that a
reachable explicit empty choice can work after choosing a stage, not a required
confirmation gesture or a prescribed production widget.

## Reproduce and provenance

From `/workspace/core`, with the recorded dependencies installed:

```sh
node node_modules/vitest/vitest.mjs run --config docs/features/donor-development/grill/d19-evidence/source-probe/vitest.config.mjs --reporter=json --outputFile=docs/features/donor-development/grill/d19-evidence/source-probe/results.json
```

The exact test and configuration are adjacent. `results.json` contains Vitest's
result, `run-output.txt` the run output, and `metadata.json` the command, time,
HEAD, version differences, count and hashes of named test/harness/source files.
Hashes cover those files only, not the full dependency tree. No failed test run
occurred for this probe. An initial metadata collection used a nonexistent
`button.tsx` path; correcting the file list did not change or rerun the passed test.

Installed/executed: Node **24.19.0**, Vitest **4.1.4**, React **19.2.3**, Base UI
**1.8.0**, jsdom **26.1.0**, Testing Library React **16.3.2**, Vite React plugin
**6.0.1**. Installed TanStack React Form is **1.28.6**, but that wrapper/hook is
not the tested unit here. Manifests request Vitest **5.0.3**, React **19.3.0**,
TanStack React Form **1.33.5** and Base UI **1.8.0**. Current upstream Base UI
web documentation advertises **1.9.0**; the test qualifies only the installed version.

The scoped evidence harness uses Core workspace/alias plugins, React transform,
`tests/setup/unit-env.ts`, placeholder public environment values and one worker.
Bun was unavailable. It follows prior evidence configuration; the earlier root
configuration's installed Sentry `./config` export failure was not rerun. This is
not the normal Bun suite, CI, typecheck, coverage or manifest-version gate.

No database, network, admission/list-switch command, API serialization, auth,
concurrency, history, pending receipt, real-browser layout, screen-reader or
complete P27 flow was tested. Prior D16/D17 probes were not repeated. No product
component, production test, dependency, migration or real data was changed.
