# D16 actual selector mechanics probe

2026-10-10. **1/1 test passed.** This executes the current real
`packages/ui/components/shadcn/searchable-select.tsx` and its Base UI composition
under jsdom; the component is not mocked. It is research evidence, not a new P27
implementation or product regression suite.

## Observed result

The caller supplies a controlled value identifying a stage in list A. Replacing
its options with list B's same-labelled stage, while keeping that old value:

- replaces the visible selected label with the supplied placeholder;
- emits no change callback and does not select B's same-labelled option;
- emits B's distinct identity once only after the user clicks that option.

Thus an options refresh is not dependent-field validation/reset, and a placeholder
is not proof the caller's value or authoritative assessment is absent. D16 needs
explicit handling of an unsaved list change and coherent source validation of the
final list/stage pair. The probe does not prescribe that product interaction.

## Reproduce

From `/workspace/core` with the recorded dependencies available:

```sh
node node_modules/vitest/vitest.mjs run --config docs/features/donor-development/grill/d16-evidence/source-probe/vitest.config.mjs --reporter=json --outputFile=docs/features/donor-development/grill/d16-evidence/source-probe/results.json
```

The exact test/config are adjacent. `results.json` is Vitest's report; `run-output.txt`
captures this execution; `metadata.json` retains source HEAD, test-start time,
versions, command and SHA-256 hashes of the test/config and named source dependencies.
Hashes cover those named files, not the whole dependency tree.

## Qualification limits

Installed: Node **24.19.0**, Vitest **4.1.4**, React **19.2.3**, Base UI **1.8.0**,
jsdom **26.1.0**, Testing Library React **16.3.2**, Vite React plugin **6.0.1**.
The repository manifest asks for Vitest **5.0.3** and React **19.3.0**; those are
not the executed versions. Bun is unavailable.

The evidence config uses repository workspace/alias plugins, React transform and
`tests/setup/unit-env.ts`, with placeholder public environment values and one worker.
It deliberately targets this one research test outside the production test suite.
It follows the scoped D11 harness: the earlier repository-config attempt failed
at the installed Sentry `./config` export. That root failure was not repeated here.
This is not the root Bun/CI/coverage gate or installed-version parity proof.

No database, API, network, auth, real P27 draft, admission, group execution,
retirement race, cache authorization, browser layout, screen-reader or mobile
behavior is qualified. Prior D11 tests were not rerun. No app component, dependency,
production test, migration or real data was changed; only these research artifacts
were written.
