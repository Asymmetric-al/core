# round13r2 offline validation and root-only assembly

This directory owns only new offline helper/report files. It does not own the four collectors, their outputs, product code, harnesses, fixtures, tests, Git state, ledgers, sheets, briefs, freezes, or readiness decisions. No live collector output was inspected to build or verify this helper. Do not run the finished-input mode until every selected invocation has finished and its evidence owner has explicitly handed it off.

`aggregate.mjs` uses Node built-ins and the catalogue constructors only. It does not launch a process, browser, fixture preflight, server, provider call, listener, or Git command. `--catalogue` reads static catalogue/plan/frozen-source inputs; it never opens collector directories. `--inputs` opens only explicitly supplied finished directories and provenance references, not a discovered or watched collector list. It writes nothing unless root explicitly supplies `--assemble-from-root`.

**`VALIDATED` means offline evidence completeness/integrity, not product success, semantic correctness, accessibility conformance, or readiness.** Nonempty `errors` fails closed with exit 1. Warnings and manual semantic obligations survive successful validation and assembly; root must review them before authorizing a copy.

## 1. Exact static contract

The actual `createStates({})` and `createModuleStates()` catalogue, without executing state setups, agrees with the unchanged bounded plan:

| Area          | Owner directory under `runtime/` |  States | State-width pairs | Full PNGs | All PNGs |
| ------------- | -------------------------------- | ------: | ----------------: | --------: | -------: |
| CRM           | `round13r2-core/`                |      20 |                41 |        12 |       53 |
| Contributions | `round13r2-core/`                |      13 |                24 |         6 |       30 |
| Studio        | `round13r2-studio/`              |      47 |                82 |        14 |       96 |
| Shell         | `round13r2-shell-people/`        |      13 |                19 |        11 |       30 |
| People        | `round13r2-shell-people/`        |      21 |                34 |        21 |       55 |
| Support       | `round13r2-support-tools/`       |      10 |                16 |        13 |       29 |
| Tools         | `round13r2-support-tools/`       |       7 |                18 |         8 |       26 |
| **Total**     | Four non-overlapping owners      | **131** |           **234** |    **85** |  **319** |

There are 36 bounded batches of at most four states, ordinarily one capture and one check invocation per batch: 72 invocations. Every state must supply **all** its catalogue widths in its single capture owner and single check owner. No count-only acceptance, width splitting, duplicate state ownership, missing/extra metrics, duplicate check rows, or extra PNGs is allowed.

Viewports at DPR 1: desktop 1440×1000, intermediate 1024×900, small-tablet 640×900, mobile 390×844. Required names are `{state}--{viewport}.png`, plus `{state}--{viewport}-full.png` only where the catalogue declares `full`. Eligibility comes from the catalogue, not an inference from existing PNGs or the plan's width inventory.

Pinned identities observed during static verification:

- Manifest: `snapshots/round13r2-manifest.json`, SHA-256 `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0`; 1,038 entries.
- Frozen diff: `snapshots/round13r2.diff`, SHA-256 `8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b`.
- Plan (QA-relative): `review/round13/runtime/refreeze/bounded-batch-plan.json`, SHA-256 `feca3e2985c7aff03b7267a6d503cab437538fbe87903752c9c608992378166b`.

The helper verifies manifest and diff bytes, all listed current frozen-source hashes/absences, the plan/catalogue exact sets, and 17 current harness/catalogue/fixture-input hashes. It rechecks these inputs and supplied evidence for drift. It **does not discover unmanifested source additions**, inspect Git state, verify a running build/cache, or substitute its byte check for original contemporaneous freeze-verification records. `--catalogue` emits the full current `identity` and normalized catalogue for root's adapter; it is not collection evidence.

## 2. Finish and hand off before validating

1. Obtain explicit completion handoffs from all four evidence owners. Do not poll their directories, infer completion from file existence/counts, or run this helper against their live outputs. Preserve failed, timed-out, partial, retry and superseded records; root must explain the canonical complete attempts selected for this run.
2. Root chooses one finished collection window of at most eight hours and an actual freshness cutoff after the repaired freeze/runtime qualification. Every process must finish successfully within its own at-most-20-minute interval, with its proof and before/after source observations in the same collection window. Missing contemporaneous provenance is a rejection, not permission to invent it retrospectively.
3. Use unique, dedicated, finished output directories per invocation and phase. A capture directory must contain only its selected states' complete `page-metrics.json`, exact PNG set, original `fixture-proof.json`, and any explicitly inventoried auxiliary files. A check directory must contain its exact `workspace-checks.json`, original `fixture-proof.json`, no PNGs, and any inventoried auxiliary files. Opposite-phase JSON, cumulative/shared output directories, reused directories, and row/file cherry-picking are rejected. If collectors did not retain such snapshots, root must decide on separately authorized fresh collection; do not rewrite collector evidence to fit.
4. Root prepares new `finished-inputs.json`, runtime attestation, and, if necessary, source-seal adapters under this aggregation directory, without overwriting anything. Raw results, proofs, logs, inventories and original source observations stay unchanged in their owning collector roots. No passwords, tokens, or environment-secret values belong in these adapters.
5. Run validation only, inspect **every** error/warning and `manualSemanticPairs`, and review raw source records/PNGs where the helper cannot prove semantics. Do not suppress stderr, trim unexplained stdout, change a saved result, reuse the plan's historical fixture proof, or replace an identity with today's hash to disguise an earlier mismatch.
6. Only after root's explicit decision, assemble into the **absent** `candidate-13r2`. No automatic merge, overwrite, clearing, resume, copying from old candidates, or automatic collection retries exist. Sheet/brief/ledger/readiness work remains a separate authorization and verification boundary in `fresh-evidence-plan.md`.

## 3. Finished-input descriptor

All JSON is strict UTF-8 (a BOM is accepted); duplicate property names reject. References are `{ "path": "<absolute existing file>", "sha256": "<lowercase 64-hex hash of exact bytes>" }`. Hash every retained original file, including empty stderr. All paths must be real, confined, regular files/directories; symlinks, junctions and path traversal reject. Each evidence file is capped at 128 MiB. The descriptor itself must be an absolute file under `runtime/`.

Top-level fields:

| Field                | Required value                                                                                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion`      | `1`                                                                                                                                                                                                                                                                             |
| `round`              | `"round13r2"`                                                                                                                                                                                                                                                                   |
| `runId`              | Unique safe root-chosen identifier; letters/digits followed by letters/digits/`.`/`_`/`-`                                                                                                                                                                                       |
| `repoRoot`           | Absolute physical r12 checkout root                                                                                                                                                                                                                                             |
| `identity`           | The **complete object** emitted by `--catalogue`: `manifestSha256`, `diffSha256`, `batchPlanSha256`, the complete repo-relative `inputHashes` map, and `frozenFileCount`. It must also match the original source observations; never copy a newer identity over older evidence. |
| `window`             | `{ "startedAtUtc": "<original ISO UTC>", "finishedAtUtc": "<original ISO UTC>" }`; finished, positive, at most eight hours                                                                                                                                                      |
| `runtimeAttestation` | Path/hash reference to the root decision described below                                                                                                                                                                                                                        |
| `invocations`        | Explicit selected finished invocations; exact catalogue ownership across both phases                                                                                                                                                                                            |

Each invocation has these fields:

| Field                                 | Contract                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                  | Unique safe identifier, exactly the original supervisor result's `tag`; do not rename results to fit                                                                                  |
| `collector`                           | `core`, `studio`, `shell-people`, or `support-tools`                                                                                                                                  |
| `phase`                               | `capture` or `check`                                                                                                                                                                  |
| `states`                              | Exact selected catalogue state names for that process; owner-area restrictions apply                                                                                                  |
| `directory`                           | Absolute, unique, finished single-invocation output directory inside the appropriate `runtime/round13r2-{collector}/` root                                                            |
| `files`                               | Complete recursive map `{ "relative/filename": "<sha256>" }` of **every regular file** in that directory, not just PNGs. Relative names use `/`. No discovery or implicit exclusions. |
| `result`, `proof`, `stdout`, `stderr` | Individual path/hash references to immutable original supervisor result, invocation proof, and both raw streams, all inside that collector root                                       |
| `before`, `after`                     | Individual path/hash references to source seals, either inside that collector root or to new root-normalized adapters inside `round13r2-aggregation/`                                 |

The actual supervisor result schema is `{tag, argv, pid, startedAtUtc, finishedAtUtc, timedOut, exitCode}`. `argv` is the original array **without** the Node executable: `[absoluteRunner, outputDirectory, commaSeparatedAreas, optionalCommaSeparatedStates]`. It must match the selected phase, output directory, areas and states exactly. A whole-area invocation may omit the fourth argument only when its exact selected states are the entire catalogue area selection. PID must be positive, `timedOut` false and `exitCode` zero; null exit or an incomplete interval rejects.

The actual fixture proof schema is `{repoRoot, verifiedAt, bundleSha256, typecheck, verification}`. Require this checkout, `typecheck: "passed"`, positive `verify-fixtures: all ... checks passed` text, and `verifiedAt` inside **this** process's start/end interval. The saved proof must match that output directory's `fixture-proof.json` bytes. Every accepted process must identify one common regenerated bundle. A final proof from a cumulative run cannot stand in for preceding invocations.

`page-metrics.json` is an object keyed by state, then viewport. `workspace-checks.json` is an array keyed by each row's `state`/`viewport`; it is not a map or a single merged success object. The helper checks the current runners' exact measurement/dialog/axe/keyboard field shapes, routes, complete capture-state log lines, per-width checker log measurements/probes, and exactly one final `wrote <output JSON>` line. Missing completion or log/JSON disagreement rejects. All non-whitespace stderr and unexplained stdout reject, even with exit 0.

## 4. Root runtime decision and source seals

The attestation is a **new root declaration**, not native harness output or proof of runtime truth. It must be supported by the original collection/runtime records; the helper cannot authenticate that assertion offline. Required JSON fields:

```json
{
  "schemaVersion": 1,
  "round": "round13r2",
  "repoRoot": "<absolute r12 root>",
  "manifestSha256": "27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0",
  "baseUrl": "http://localhost:3031",
  "buildStartCacheIdentity": "<root's original startup/build/cache evidence identity>",
  "evidenceNotBeforeUtc": "<actual freeze/runtime freshness cutoff, ISO UTC>",
  "sourceUnchanged": true,
  "scratchCmsExclusive": true,
  "mainUnavailableData": true,
  "noPrivilegedOrProviderEffects": true,
  "collectionPolicy": "bounded-batches",
  "allowCollectorOverlap": false,
  "decision": "<root's evidence-backed decision and any exception rationale>"
}
```

Replace all placeholders from original records. Only a local, credential-free HTTP origin is accepted. `bounded-batches` requires exactly the unchanged 36 capture and 36 check batches, with no overlapping process intervals by default. Because collectors were already running when this helper was authored, their actual partitioning/schedule is **unverified**. Root may explicitly choose `collectionPolicy: "explicit-finished-partitions"` and/or `allowCollectorOverlap: true` **only after reviewing the actual completed process, source, runtime and scratch-CMS lifetime evidence**. This emits `ROOT_SCHEDULE_EXCEPTION`; it does not relax exact state/width/PNG ownership, phase isolation, time bounds, proof, log or semantic-setup checks. A common fixture bundle mismatch is a hard failure, not a schedule exception.

Each `before`/`after` seal uses this adapter schema (not an invented claim that the runner already writes it):

```json
{
  "schemaVersion": 1,
  "invocationId": "<the unchanged original result tag>",
  "stage": "before",
  "observedAtUtc": "<original observation time, ISO UTC>",
  "repoRoot": "<absolute r12 root>",
  "identity": "<replace with the complete original identity OBJECT>",
  "runtimeAttestationSha256": "<hash of the exact root attestation bytes>",
  "freezeExitCode": 0,
  "freezeVerification": {
    "name": "round13r2",
    "files": 1038,
    "mismatches": [],
    "extra": []
  },
  "originalEvidence": [
    {
      "path": "<absolute original contemporaneous source/freeze record in the owning collector root>",
      "sha256": "<hash of original bytes>"
    }
  ]
}
```

`identity` in a real seal is an object, not the explanatory placeholder string above. `freezeVerification` uses the actual freeze verifier's `{name, files, mismatches, extra}` result schema; the helper **reads saved results, never runs that Git-using verifier**. An `after` seal has `stage: "after"`. Required ordering within the finished collection window is `before.observedAtUtc <= result.startedAtUtc < result.finishedAtUtc <= after.observedAtUtc`; the proof time is inside the process interval.

`originalEvidence` must be nonempty; its original bytes/hash are checked and retained in assembly. Root adapters under this directory emit `ROOT_NORMALIZED_SOURCE_SEAL`. Those referenced records have no universally known collector-side source-seal schema here: **their contents are retained/hash-checked, not automatically interpreted to prove the adapter's assertions**. Root must verify their meaning and chronology. An old record plus a new assertion does not establish freshness. Absent original source/hash/freeze/runtime observations cannot be repaired by writing this JSON, using mtimes, or re-running a freeze check after collection.

## 5. Exact later root commands

These are deferred instructions, **not commands executed on live outputs by this task**. Node 24.22.1 was used for offline self-verification; no dependencies need installing. First get the static identity if needed:

```powershell
$Root = 'C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12'
Set-Location -LiteralPath $Root
$H = "$Root/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-aggregation"
$CatalogueText = & node "$H/aggregate.mjs" --catalogue
if ($LASTEXITCODE -ne 0) { throw ($CatalogueText -join "`n") }
$Catalogue = ($CatalogueText -join "`n") | ConvertFrom-Json
$Catalogue.identity | ConvertTo-Json -Depth 20
```

After owners hand off the explicit finished evidence and root prepares the new descriptor, run **validation only**:

```powershell
$Inputs = "$H/finished-inputs.json"
$ValidationText = & node "$H/aggregate.mjs" --inputs $Inputs
$ValidationExit = $LASTEXITCODE
$ValidationText -join "`n"
if ($ValidationExit -ne 0) { throw 'Offline validation rejected; preserve originals and inspect the reported failures.' }
$Validation = ($ValidationText -join "`n") | ConvertFrom-Json
if ($Validation.status -ne 'VALIDATED') { throw 'No successful validation report.' }
```

Stop here for root's review of the entire JSON report, warnings, manual semantic states, original records, and destination ownership/absence. Do not auto-chain assembly or use a reported digest as permission without that review. **Only after root explicitly authorizes this exact validation digest**, from the exact r12 repository-root working directory:

```powershell
Set-Location -LiteralPath $Root
& node "$H/aggregate.mjs" --inputs $Inputs --assemble-from-root $Validation.validationSha256
if ($LASTEXITCODE -ne 0) { throw 'Assembly rejected or partial. Preserve any destination; never resume, clear, or merge it.' }
```

There is no force flag or alternate destination. A changed descriptor, helper, evidence, source identity, warning set or validation result requires a new successful validation and a new root decision. The digest gates this decision; it is not a signature or independent authentication.

## 6. Assembly receipt and stop conditions

Production assembly is hardcoded to `docs/qa/admin-workspaces-hillclimb/candidate-13r2/`, **outside this task's file ownership and never created by this task**. The helper requires the destination absent even if it is a file, dangling symlink, or previous partial attempt. It revalidates before creation, writes `INCOMPLETE.json`, uses exclusive new-file writes, rechecks source/destination hashes, then writes `aggregation-receipt.json` and removes the incomplete marker only on success.

Required output for a completed assembly:

- Exactly the 319 original PNGs at candidate root, copied byte-for-byte, plus newly serialized `page-metrics.json` and `workspace-checks.json` with exact catalogue ownership.
- Original invocation data, proofs, results, both streams, source seals and referenced original source/freeze records under `.aggregation/provenance/`, with source paths and hashes in the receipt. Raw evidence is not rewritten; only aggregate JSON and the descriptor/report are newly serialized.
- `.aggregation/runtime-attestation.json`, `.aggregation/inputs.json`, `.aggregation/validation.json` and `aggregation-receipt.json` carrying identities, original source hashes, output hashes, helper/report digest and all warnings. The receipt's file hash map covers preceding final outputs, not its own self-referential hash.
- **A successful receipt AND absence of `INCOMPLETE.json`.** A directory alone, copied PNGs alone, or a receipt alongside the incomplete marker is not completion. A copy failure leaves the partial directory in place and blocks any reuse. Preserve it and return the naming/recollection decision to root.

No single root `fixture-proof.json` is fabricated: the last proof is not proof of all invocations. `candidate-13r2` contains no synthesized historical baseline, sheets, briefs, changed ledger/freeze or readiness verdict. Any post-assembly mutation invalidates the stored output-hash claim; preserve immutable outputs for later review.

## 7. Semantic limits and root decisions

- Hashes bind supplied bytes, not origin, truthful timestamps, process execution, or which runtime/build/cache served them. Current listed-source byte equality does not prove those bytes served every capture, and added-file discovery is deliberately unavailable without Git. Root must retain original before/after freeze results and qualified runtime/cache/CMS/effect evidence.
- Fatal semantic/setup conditions include unexpected route-boundary headings, wrong/auth routes, absent catalogue-required dialogs, missing setup/completion logs, unexplained stdout, all nonempty stderr, stale/wrong-checkout proofs and data/log disagreement. Do not waive these via a schedule exception or by editing raw evidence. Return genuine setup/product defects to root for a separately authorized decision and, where required, a new freeze/run.
- Axe violations/incomplete IDs, overflow, observed dialog geometry/naming, limited row keyboard probes and dialog Tab/Escape findings remain explicit warnings and raw measurements. Row counts and raw `h1` counts are retained, not used to invent an accessibility or visible-title pass. A structurally valid record with product findings is still not readiness.
- `manualSemanticPairs` identifies every setup-driven state-width pair needing visual qualification. Offline structure cannot establish the correct drawer/menu/tab, enabled/settled control, fixture identity, retained CMS lifetime, screen-reader/zoom behavior, tenant/data truth or real provider journey. PNG checks validate signature/chunks/CRC/dimensions, not decoded pixels or visual meaning.
- Root must decide canonical finished invocations/retries, actual partition/overlap policy, and whether original provenance supports any normalized source adapters. If provenance is missing, cumulative outputs were overwritten, a bundle differs, source changed, or a required semantic setup failed, stop: this helper supplies no repair/recollection authorization.

See [verification.md](verification.md) for the synthetic checks actually run. No `finished-inputs.json` or attestation for real collectors has been created here.
