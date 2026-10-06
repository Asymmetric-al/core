# AL-1954 implementation and repair delivery evidence

Assignments `AL1954-v2-20261006-B1` through `AL1954-v2-20261006-B4`, acceptance
revision **E1-r1**, unchanged with Ezra's E5 binding clarification, 2026-10-06. Base
`1e7db7cfe9eb3737d531eca3138cf2676a0cc104`, branch
`feature/AL-1954-projection-core`.

The first reviewed candidate **238415d579580b7e478a95f507f087bc81f5b933 was
rejected** for a serialization escape confirmed independently by Micaiah and
Luke. B2 originally returned an uncommitted repair handoff; the coordinator
subsequently committed and pushed the repaired implementation as
**937fbf15137b255bd3770ec9562f4173eb61202b**. The subsequent documentation-only
local candidate **e72ce04f72e04e66aaafdbc338020279cf2c24f3** retained those source
bytes, but both M4/L4 reviews then identified a separate general-ceiling purpose/
operation binding gap under unchanged E1-r1. B4 repairs that gap below as an
uncommitted handoff from `e72ce04…`; no new repaired candidate SHA is asserted.
Historical B1/B2 passes, scoped reviews and 937 CI do not approve changed B4
source or close the newly isolated binding dimension.

The current-head delivery packet on [PR #1960](https://github.com/Asymmetric-al/core/pull/1960)
is authoritative for the final candidate SHA, required CI and final C8 acceptance.
The fixed historical SHAs bind only their recorded checks and reviews; they do
not predict a future repair commit. New-head normal gates, independent reviews,
E1-r1 acceptance and required CI remain pending for B4.

The exported seam and complete input/result/context/scope contracts are in
[the integration contract](./README.md). The B2 repair changes only projection
validation/output, its new public-seam serialization tests, a portable supplemental
typecheck config and these documents. It changes no policy/taxonomy/reader,
schema/seed, grants, live context/source producer, portal reader, CSV, unrelated
fixture test, review runner or sandbox/security permission.

## B4 general-ceiling binding repair and evidence

The general `ProjectionCeiling` previously carried context reference/revision and
field lists, but no independently comparable request purpose/operation. Matching
outer auth and scope could therefore admit an independently substituted broader
ceiling resolved for another purpose/operation. Optional finance-purpose checks
and readable/exportable list selection did not bind the general ceiling.

Micaiah M4's static review and Luke L4's independently authored package-export
probe agreed on this bounded Medium finding. Ezra E5 clarified the **existing**
E1-r1 C4/C5 oracle; it introduces no new producer or grant requirement. The local
candidate `e72ce04…` is not accepted on that dimension. Luke's successful runner
exit means its diagnostic captured the unsafe supplied-case outputs, **not a
security PASS**. These remain synthetic interface facts, not live authority or
production disclosure evidence.

B4 adds mandatory explicit `ProjectionCeiling.purpose` and `operation` facts.
Qualification validates nonempty purpose, supported `read`/`bulk_export`
operation, and exact equality with `auth.binding`, alongside context reference/
revision, before any field admission. Missing, empty, malformed, unsupported or
mismatched association refuses the **whole row**. Nothing is inferred from outer
auth/scope, defaults, roles or optional finance facts. Correct matching empty
permission lists remain successful allowed-empty.

Public-seam RED: `bunx vitest run tests/unit/packages/api/projection/ceiling-binding.test.ts`
ran **29 tests: 24 failed, 5 passed** (exit 1) before production edits. Cases
isolate foreign purpose only, foreign operation only, both, missing/malformed
associations, unsupported operation and a mismatched empty ceiling. Matching
name-only read, operation-specific selection, exact bulk-export values and
matching read/export empty authority are separate positive literals.

GREEN: all **29 new cases plus the existing 235 tests passed**. The synthetic
baseline fixture now explicitly supplies its own `support_history/read` ceiling
association. Two legitimate bulk-operation fixtures explicitly supply their
corresponding associations. Every existing expected output, including negative
processor/category/receipt and allowed-empty expectations, remains unchanged;
no acceptance oracle was weakened or new malformed binding allowed to mask a
processor-floor check. Serializer/private-fact and unavailable-variant semantics
are retained.

### B4 checks actually run

From the repository root with the assigned tool PATH and Vitest **4.1.4**:

| Command                                                                                                                                   | B4 observed result                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bunx vitest run tests/unit/packages/api/projection tests/unit/packages/api/field-policies`                                               | 9 files / 264 tests passed, no skips/failures.                                                                                                                                              |
| `bunx tsc --noEmit -p packages/api/tsconfig.json`                                                                                         | Passed, exit 0.                                                                                                                                                                             |
| `bunx tsc -p tests/unit/packages/api/projection/tsconfig.json`                                                                            | Passed, exit 0, using the unchanged portable config.                                                                                                                                        |
| `bunx eslint packages/api/src/projection tests/unit/packages/api/projection --max-warnings 0`                                             | Passed, exit 0, zero errors/warnings.                                                                                                                                                       |
| `bunx prettier --check packages/api/src/projection packages/api/package.json tests/unit/packages/api/projection docs/security/projection` | Passed, exit 0.                                                                                                                                                                             |
| Actual `@asym/api/projection` package probes via `bun --conditions=react-server -e ...`                                                   | Eight literal assertions passed: matching read/name, matching export/exact values, matching empty, purpose-only/operation-only/combined swaps, missing purpose and missing operation.       |
| `git diff --check` and local documentation-link checks                                                                                    | Passed.                                                                                                                                                                                     |
| Broad normal preflight/unit/build/CI and independent acceptance for the future B4 head                                                    | **Pending**, not inferred from historical 937 results. No redundant broad host suite run in B4; normal new-head gates will run through required pre-push after committed review/acceptance. |

B4 changes only projection types/qualification, dedicated synthetic tests/fixtures
and these documents. No policy/taxonomy/reader, DB/schema/seed, grant, live context/
source producer, portal/CSV, configuration or sandbox/security-boundary change
is introduced. The implementation worker did not commit or push this repair.

## Historical B2 repair and red-green evidence

The rejected candidate checked only enumerable own properties and emitted
original whole containers. Hidden own object/array `toJSON` functions/getters and
non-enumerable array-index accessors could therefore execute during later
serialization and restore private content absent from the inspected snapshot.

The public-seam regression file initially ran **9 tests: 7 failed, 2 passed**
(Vitest exit 1), reproducing hidden object/array serializers/getters, hidden array
indices, recursive hidden hooks and changes to original references after
resolution. Log: implementation-host `/tmp/AL1954-B2-red.log`.

Validation now inspects **every own descriptor**, including non-enumerable and
symbol properties, without calling getters. Executable/accessor facts refuse
recursively. Output whole containers come from the validated frozen snapshot;
they no longer retain unchecked mutable original references. Data values,
enumerability, array length and sparse holes are copied without inventing values.
The same 9 regressions then passed. Two further cases cover hidden executable/
accessor descriptors outside named serializer hooks. Plain nested object/array,
null/false/zero/empty-string positives and all existing E1-r1 floors and semantics
are retained; no acceptance oracle was weakened.

## Historical B2 checks actually run

Commands ran from the repository root with the assignment's
`PATH=/workspace/.onboarding-tools/node_modules/.bin:$PATH`, using installed Vitest
**4.1.4**. Command paths below are checkout-relative.

| Command                                                                                                                                   | B2 observed result                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bunx vitest run tests/unit/packages/api/projection tests/unit/packages/api/field-policies`                                               | 8 files, 235 tests passed; no skips/failures. Includes 11 serialization tests and the existing 224 tests.                                                                                     |
| `bunx tsc --noEmit -p packages/api/tsconfig.json`                                                                                         | Passed, exit 0.                                                                                                                                                                               |
| `bunx tsc -p tests/unit/packages/api/projection/tsconfig.json`                                                                            | Passed, exit 0, with the candidate-local portable supplemental config.                                                                                                                        |
| `bunx eslint packages/api/src/projection tests/unit/packages/api/projection --max-warnings 0`                                             | Passed, exit 0; zero errors/warnings.                                                                                                                                                         |
| `bunx prettier --check packages/api/src/projection packages/api/package.json tests/unit/packages/api/projection docs/security/projection` | Passed, exit 0.                                                                                                                                                                               |
| Public package server-condition smoke and serialization probes                                                                            | Passed, exit 0. Original positive literal preserved; object serializer, array serializer and hidden array-index accessor each refused with zero executions through the actual package export. |
| `git diff --check`                                                                                                                        | Passed for the repair's tracked diff; new files also passed formatter checks.                                                                                                                 |
| `bun run test:unit`, whole-repository lint/typecheck, hooks/preflight and required CI for repaired SHA                                    | Not established during the historical B2 handoff. Subsequent normal gates passed at `937fbf151…`, as recorded below; final current-head CI/C8 remain pending.                                 |

No source edits followed the final focused/type/lint checks; delivery documentation
was finalized with their actual outputs afterward. Focused test counts establish
their assertions, not a line/branch coverage threshold. The existing custom
coverage provider does not calculate line/statement/branch totals.

## Historical committed 937 implementation checks and reviews

At repaired implementation `937fbf15137b255bd3770ec9562f4173eb61202b`, the normal
push passed all **17 preflight stages**, including repository format/lint/typecheck,
boundary/integrity checks, builds and the full unit gate. All three app builds
(admin, donor and missionary) passed. The full unit result was **804 files / 6453
tests passed**, with **2 existing skipped files / 4 skipped tests** (290.13s).
The exact normal-push evidence is coordinator-held
`/workspace/scratch/AL1954-prepush-937.log`; these are completed gates on that
implementation SHA, not fabricated results for a future PR head.

Micaiah M2 and Luke L2 independently returned **CLEAR within their repaired
source/systems scopes** at the same implementation SHA. Ezra E3 independently
returned **C1–C7 PASS** under E1-r1 at that SHA. Their records are
`/workspace/scratch/AL1954-micaiah-m2-review.md`,
`/workspace/scratch/AL1954-luke-l2-review.md` and
`/workspace/scratch/AL1954-ezra-e3-acceptance.md`. These scoped results do not
constitute merge approval or final delivery acceptance.

All four required CI checks also passed on **937**: `ci-gate`,
`e2e-smoke-gate`, `migrate` and `smoke`. Coordinator-held
`/workspace/scratch/AL1954-required-checks-937.txt` records those results.
They and the earlier scoped C1–C7/review results are **historical only**: the
ceiling-swap dimension was not tested, and those records cannot approve changed
B4 source. The final candidate identity and new current-head CI/acceptance must
come from [PR #1960's current-head delivery packet](https://github.com/Asymmetric-al/core/pull/1960).
The historical failed/interrupted records below remain evidence of their original
runs and are not rewritten as passes.

## Portable supplemental reproduction

The candidate includes
[`tests/unit/packages/api/projection/tsconfig.json`](../../../tests/unit/packages/api/projection/tsconfig.json).
It extends the unchanged normal API configuration using relative paths:

```json
{
  "extends": "../../../../../packages/api/tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "incremental": false,
    "rootDir": "../../../../.."
  },
  "include": ["./**/*.ts"],
  "exclude": []
}
```

From any candidate checkout's repository root, the literal reproduction is:

```bash
bunx tsc -p tests/unit/packages/api/projection/tsconfig.json
```

No pre-existing `/tmp` config, absolute checkout root, custom security permissions
or dependency on implementation-host logs is required. This supplemental check
uses the existing API options and does not replace its normal typecheck.

The portable public package consumption smoke is:

```bash
bun --conditions=react-server -e 'import { resolveProjection } from "@asym/api/projection"; import { fixture } from "./tests/unit/packages/api/projection/fixtures.ts"; const actual = resolveProjection(fixture()); if (JSON.stringify(actual) !== JSON.stringify({ kind: "allowed", projection: { display_name: "Ada", amount: 1250 } })) throw new Error("Unexpected public package projection"); console.log("Public server package export smoke passed");'
```

## Historical B1 and rejected-candidate evidence

These records describe **earlier source only**, not a repair PASS:

- B1 meaningful red-green slices: positive own-value test; 13 required binding
  negatives; 57 policy/floor negatives; 15 subtraction negatives; subsequent
  inherited policy-set and custom-prototype serializer regressions. Those slices
  passed after their respective changes, but did not cover the hidden own
  descriptors exposed by the first reviews.
- B1 focused: 7 files/224 tests passed. API typecheck, targeted strict lint,
  formatting, data-boundary and workspace-contract checks, and public package
  smoke passed on that earlier source.
- B1 ordinary local full-suite runs: exploratory 802 files/6439 tests passed
  (272.39s), then 803 files/6442 tests passed (261.76s); both had 2 existing skipped
  files/4 skipped tests. Logs were `/tmp/AL1954-B1-full-unit.log` and
  `/tmp/AL1954-B1-final-full-unit.log` on the implementation host. The associated
  source hash manifest was `/tmp/AL1954-B1-final-source.sha256`. None qualifies
  changed repair source or overrules the rejected candidate's material finding.
- B1's first temporary supplemental config incorrectly extended a nonexistent
  root tsconfig, exited 2 and also reported declaration errors under that invalid
  configuration. The corrected host-only API-based check passed, but was not
  portable. Initial 15 import-order warnings were ordinarily fixed and its
  strict zero-warning rerun passed.
- Independent first-review focused suites on rejected SHA `238415d…`: each
  passed 7 files/224 tests, API typecheck, strict targeted lint/format, boundary
  and workspace checks. Both public-seam probes nonetheless confirmed the escape;
  the Micaiah adversarial probe exited 42 when invalid input was admitted.
- Luke's **literal** old supplemental command
  `bunx tsc -p /tmp/AL1954-projection-typecheck.json` failed exit 1/TS5058 because
  that host-only file was absent. Equivalent configs translated into permitted
  candidate scratch passed in both reviews; this was adapted evidence, not a
  PASS for the literal documented command. B2 replaces it with the portable
  candidate-local configuration above.
- **Both isolated first-review full-suite runs were stopped at the coordinator's
  instruction after the confirmed finding. Neither is PASS.** Their logs record
  SIGTERM and runner exit 139, without a complete suite/coverage summary. Before
  stopping, each reported two failures in unchanged
  `phase24-authority-manifest.test.ts`, two in
  `phase24-authority-provenance.test.ts`, and six in
  `playwright-development-smoke-output.test.ts`. Phase 24 fixtures supply child
  environments without `TMPDIR`, while scratch creation uses `tmpdir()` and the
  qualified review sandbox denies writes to default `/tmp`. This is a concrete
  compatibility observation, not complete attribution for every error or proof
  of a projection regression. No unrelated tests, skips or sandbox permissions
  were changed to turn those runs into a pass.
- First-review required GitHub check lookup was unavailable (HTTP 422: GitHub did
  not know the SHA). Required exact-head CI was **absent**, not PASS.

The coordinator-held first-review reports/probe/full logs are
`/workspace/scratch/AL1954-{micaiah,luke}-review.md`,
`AL1954-{micaiah,luke}-probe.log`, `AL1954-micaiah-full.log` and
`AL1954-luke-full-unit.log`. These historical evidence locations may not exist in
another checkout and are not prerequisites for the portable reproduction commands.
Each review execution first passed its 22 active isolation canaries; no sandbox
permission was relaxed. No final acceptance or broad exact-head PASS is inferred
from those partial runs.

## Historical e72 interruptions and binding-review reproduction

The normal pre-push for local candidate `e72ce04…` was interrupted after the
binding concern arose; the coordinator reported **exit 143**. Its partial
`/workspace/scratch/AL1954-prepush-e72.log` ends during `verify-shadcn-diff` and
has no complete preflight/full-suite/build PASS. Earlier stage passes are only
partial execution evidence, not completion of the hook or successful push.

Micaiah's earlier superseded reproduction attempt and Luke's first L4 attempt
failed while copying generated `apps/admin/.next/node_modules`, **before
container creation/canaries/candidate execution**. Logs
`/workspace/scratch/AL1954-micaiah-m4-probe.log` and
`/workspace/scratch/AL1954-luke-l4.log` are infrastructure-failure evidence only,
never reproduction PASS. Micaiah then completed the assigned static-only review;
no execution is attributed to that static result.

The coordinator corrected dependency enumeration to actual root/workspace
`node_modules`, excluding generated build outputs. No network, credential,
read-only root, UID/capability/privilege, write boundary or canary setting changed.
Luke's retry on `e72ce04…` then passed all **22 actual isolation canaries** before
its public probe. `/workspace/scratch/AL1954-luke-l4-retry.log` records the exact
command, SHA, canaries and observed unsafe swaps; runner exit 0 establishes the
diagnostic's execution, not acceptance. Both reviews and Ezra's unchanged-oracle
clarification are retained as `AL1954-micaiah-m4-static-review.md`,
`AL1954-luke-l4-review.md` and `AL1954-ezra-e5-purpose-clarification.md` in the
coordinator's scratch evidence. Their original logs were neither erased nor
reclassified as successful security/gate results.

## Remaining scope and evidence

The public entry retains `server-only`; runtime imports remain local pure helpers
and the pure taxonomy, with policy-reader types erased. No runtime authority,
Supabase/auth/session/provider/filesystem/network/browser acquisition is added.
Trusted pure predicates/policy callbacks remain server code, not an arbitrary
executable-code sandbox. The source envelope is never emitted as a fallback.

Public/NHI/operator variants remain distinct and explicitly unavailable.
Qualified producer trust/currentness, live financial/source attribution and RLS
cannot be proved by pure tests. All retained #493 gates in the integration
contract remain open: live context/Tenant/RLS agreement, exact immutable
entity/root/line attribution, actual private-fact reader ordering, raw SELECT/DTO
parity with reviewed narrowing, adjacent/encoded processor paths, full sensitive-
reader lint, pre-data-access client CSV refusal and applicable #496/#632/#635/
source-family closure. This repair grants no new integration authority and never
closes #493. Historical normal gates, scoped reviews and C1–C7 results at
`937fbf151…` do not close the newly isolated general-ceiling association gap.
B4's new committed candidate still needs independent review/acceptance, required
normal new-head gates and current-head CI. Final C8 remains pending the
authoritative final delivery/acceptance packet on
[PR #1960](https://github.com/Asymmetric-al/core/pull/1960).
