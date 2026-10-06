# AL-1954 implementation delivery evidence

Assignment `AL1954-v2-20261006-B1`, acceptance revision **E1-r1**, 2026-10-06.
Source/base `1e7db7cfe9eb3737d531eca3138cf2676a0cc104`, branch
`feature/AL-1954-projection-core`. This is an uncommitted implementation handoff;
no candidate commit, independent acceptance/review approval, hook or CI result is
claimed. The coordinator must bind those records to one identical committed
candidate. No commit, push, merge or deployment was performed here.

The exported server-only seam and complete input/result/context/scope contracts
are documented in [the integration contract](./README.md). Only projection source,
projection tests, its necessary API package export and these delivery documents
changed. Policy/taxonomy/reader, schema/seeds, grants, source/context producers,
portal readers, CSV and security settings remain outside the diff.

## Red-green evidence

The positive own-value test initially failed with an explicit refused result:
expected `{kind:"allowed",projection:{display_name:"Ada",amount:1250}}`.
Adding the minimal static intersection made it pass. The next restriction slice
failed 13 cases for missing/foreign/stale scope/context before binding enforcement.
The policy/floor slice failed 57 cases before exact policy validation, capability
intersection and immutable floors. The subtraction slice failed 15 cases before
anonymity, flags/state and extension enforcement. Each slice then passed.

Later adversarial regressions were separately demonstrated RED before fixes:
inherited policy-set bindings were admitted, and a whole container's custom
prototype serializer emitted inherited private content. Both now refuse. Pure
independent expected literals were retained; no independent acceptance oracle
was weakened. Temporary `-t` iteration filters skipped unrelated tests only in
those intentionally focused RED runs; the final focused suites have no skips.

## Checks actually run

All commands used `PATH=/workspace/.onboarding-tools/node_modules/.bin:$PATH`
from `/workspace/core` and the repository's installed Vitest **4.1.4**.

| Command                                                                                                                                             | Observed result                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bunx vitest run tests/unit/packages/api/projection tests/unit/packages/api/field-policies`                                                         | Final focused run: 7 files, 224 tests passed; no skips/failures. Synthetic reader duplicate-denial composition included.                                                                                                                                   |
| `bunx tsc --noEmit -p packages/api/tsconfig.json`                                                                                                   | Passed, exit 0.                                                                                                                                                                                                                                            |
| `bunx eslint packages/api/src/projection tests/unit/packages/api/projection --max-warnings 0`                                                       | Passed, exit 0, zero warnings/errors after import-order fixes.                                                                                                                                                                                             |
| `bunx prettier --check packages/api/src/projection packages/api/package.json tests/unit/packages/api/projection docs/security/projection/README.md` | Passed, exit 0. Delivery document format checked separately after completion.                                                                                                                                                                              |
| `bunx tsc -p /tmp/AL1954-projection-typecheck.json`                                                                                                 | Passed, exit 0, for projection test/public-type consumption using the API's existing config and rootDir `/workspace/core`.                                                                                                                                 |
| Public package smoke with `bun --conditions=react-server -e ...`                                                                                    | Imported `resolveProjection` through `@asym/api/projection`, compared the synthetic positive literal and printed `Public server package export smoke passed`; exit 0.                                                                                      |
| `bun run verify:data-boundary`                                                                                                                      | Passed, exit 0.                                                                                                                                                                                                                                            |
| `bun run verify:workspace-contract`                                                                                                                 | Passed, exit 0.                                                                                                                                                                                                                                            |
| `git diff --check`                                                                                                                                  | Passed for tracked diff; all new source/tests separately passed formatter checks.                                                                                                                                                                          |
| `bun run test:unit` (earlier exploratory working-tree run)                                                                                          | Passed: 802 files, 6439 tests; 2 files/4 tests skipped by the existing suite; duration 272.39s. This began before the last prototype hardening, so it does not replace the final-source gate below. Log `/tmp/AL1954-B1-full-unit.log`.                    |
| `bun run test:unit` (final source)                                                                                                                  | Passed, exit 0: 803 files, 6442 tests; 2 existing files/4 existing tests skipped; duration 261.76s. Log `/tmp/AL1954-B1-final-full-unit.log`. Source/test/export SHA-256 manifest `/tmp/AL1954-B1-final-source.sha256` verified unchanged after execution. |

The first temporary supplemental typecheck mistakenly extended a nonexistent
root tsconfig, exited 2 and also reported dependency declaration errors under
that invalid configuration. It was corrected to extend the **existing API
config**, with no production/type configuration change or weakened repository
check; the corrected public/test consumption check passed. Initial lint emitted
15 import-order warnings; ordinary autofix and a strict zero-warning rerun passed.

The normal full suite prints synthetic lint-warning examples from existing
harness tests; its summary and process exit establish the gate result. The custom
coverage provider's output is not a line/branch threshold claim. The skipped
existing tests remain skips, not fabricated passes.

## Static and remaining evidence

Runtime import inspection shows the public `server-only` marker, local pure
helpers and `../field-policies/taxonomy` only. Both `FieldPolicyRow` and
`FieldPolicySet` reader imports are type-only. No runtime policy reader, Supabase,
auth/session, provider, filesystem, network or browser acquisition dependency is
introduced. The separate synthetic reader test fakes only its database boundary;
it is not live policy-source or RLS evidence.

Public/NHI/operator variants have mandatory distinct current source/capability
contracts and explicitly refuse at runtime pending separate qualification.
Qualified producer trust/currentness, financial/source attribution and RLS cannot
be proved by a pure deterministic comparison. Exact candidate SHA, independent
E1-r1 acceptance, separate reviews, normal hooks/preflight and required current-head
CI remain coordinator delivery gates. No whole-repository lint/typecheck,
browser/E2E, deployment or live authority PASS is claimed by focused package checks.
All retained #493 gates listed in the integration contract remain open; this
handoff never closes #493 or grants new integration authority.

## Exact supplemental reproduction commands

The supplemental config extends the unchanged normal API configuration:

```json
{
  "extends": "/workspace/core/packages/api/tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "incremental": false,
    "rootDir": "/workspace/core"
  },
  "include": ["/workspace/core/tests/unit/packages/api/projection/**/*.ts"],
  "exclude": []
}
```

The public package consumption smoke actually run was:

```bash
bun --conditions=react-server -e 'import { resolveProjection } from "@asym/api/projection"; import { fixture } from "./tests/unit/packages/api/projection/fixtures.ts"; const actual = resolveProjection(fixture()); if (JSON.stringify(actual) !== JSON.stringify({ kind: "allowed", projection: { display_name: "Ada", amount: 1250 } })) throw new Error("Unexpected public package projection"); console.log("Public server package export smoke passed");'
```

Final documentation checks: `bunx prettier --check docs/security/projection`
and `git diff --check` passed. No source/test changes occurred during the final
full gate. The source manifest covers all six production modules, all six test/
fixture files and the necessary API package export. Documentation was finalized
with the actual full-gate result afterward.
