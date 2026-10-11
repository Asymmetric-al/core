# D6 scoped checks and counterexamples

Run 2026-10-10 against `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
No application source was changed. No production database, account, provider,
donor, or live notification was used.

## Results

- **48 existing tests passed**: 9 Mission Control task tests, 4 task-migration
  structural tests, and 35 contribution-approval notification tests.
- **2 new counterexample checks passed**, calling the current task service with
  synthetic dependencies: a failed link write follows an accepted task write,
  and an unqualified retry can accept a second task write. This proves the
  service interface itself supplies neither transaction rollback nor semantic
  deduplication. It is not a live-database failure experiment or a claim that all
  callers lack protection.
- **5 calendar checks passed** using Python's IANA zone database: spring/fall
  days can be 23/25 hours; UTC-midnight storage can display the previous day;
  a saved Bangkok date/zone yields one instant even when a travelling viewer
  sees another local date. These are counterexamples to unsafe date assumptions,
  not verification of Core's still-unimplemented D6 conversion.

The JSON reports are adjacent. Vitest's aggregate suite count includes nested
describe blocks; the executed JavaScript/TypeScript test-file count is **4**, with
**50 passing tests**. The calendar probe is separate.

## Reproduction

From the repository root:

```sh
node node_modules/vitest/vitest.mjs run --config docs/features/donor-development/grill/d6-evidence/source-probe/vitest.config.mjs --reporter=json --outputFile=docs/features/donor-development/grill/d6-evidence/source-probe/source-test-results.json
python docs/features/donor-development/grill/d6-evidence/source-probe/calendar_probe.py
```

Runtime observed: Node **24.19.0**, installed Vitest **4.1.4**. Root manifest
declares Vitest **5.0.3**; Bun is unavailable in this workspace. The repository's
normal Vitest configuration could not start because the installed
`@sentry/nextjs` lacks its requested `./config` export. An initial isolated run
without the repository's test environment passed 13 tests but could not load
the approval suite because environment validation failed. The checked-in
scoped config then used the repository's test-only environment/setup and ran
all 50 checks. No dependency was installed, production configuration weakened,
or unrelated package failure repaired.

## Limits

This is a deliberately scoped evidence harness, not the repository CI gate.
Migration tests inspect SQL text; service tests use in-memory stubs. There is no
claim of Core/Supabase RLS, concurrent transaction, browser, provider delivery,
performance, accessibility, or full end-to-end D6 qualification. Earlier D3/D4
PostgreSQL probes remain prior mechanics evidence, not fresh D6 tests. The future
D6 implementation must pass its actual source/database/surface acceptance gates.
