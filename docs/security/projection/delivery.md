# AL-1954 implementation and repair delivery evidence

Assignments `AL1954-v2-20261006-B1` and `AL1954-v2-20261006-B2`, acceptance
revision **E1-r1**, 2026-10-06. Base
`1e7db7cfe9eb3737d531eca3138cf2676a0cc104`, branch
`feature/AL-1954-projection-core`.

The first reviewed candidate **238415d579580b7e478a95f507f087bc81f5b933 was
rejected** for a serialization escape confirmed independently by Micaiah and
Luke. B2 originally returned an uncommitted repair handoff; the coordinator
subsequently committed and pushed the repaired implementation as
**937fbf15137b255bd3770ec9562f4173eb61202b**. Historical B1 passes do not establish
passing gates for the repaired source; its later checks are recorded below.

The current-head delivery packet on [PR #1960](https://github.com/Asymmetric-al/core/pull/1960)
is authoritative for the final candidate SHA, required CI and final C8 acceptance.
The fixed implementation SHA above binds the completed source checks and reviews;
it does not predict the SHA of a later documentation-only commit.

The exported seam and complete input/result/context/scope contracts are in
[the integration contract](./README.md). The B2 repair changes only projection
validation/output, its new public-seam serialization tests, a portable supplemental
typecheck config and these documents. It changes no policy/taxonomy/reader,
schema/seed, grants, live context/source producer, portal reader, CSV, unrelated
fixture test, review runner or sandbox/security permission.

## B2 repair and red-green evidence

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

## B2 checks actually run

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

## Committed implementation checks and reviews

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

Required CI and final **C8 remain pending on the final current PR head**. A later
change to this delivery document preserves the implementation source bytes, but
its final candidate identity and current-head CI/acceptance evidence must come
from [PR #1960's current-head delivery packet](https://github.com/Asymmetric-al/core/pull/1960).
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
closes #493. The repaired implementation's normal gates, both scoped re-reviews
and C1–C7 acceptance are recorded above at `937fbf151…`. Final C8 remains pending
required CI and the authoritative final current-head delivery/acceptance packet
on [PR #1960](https://github.com/Asymmetric-al/core/pull/1960).
