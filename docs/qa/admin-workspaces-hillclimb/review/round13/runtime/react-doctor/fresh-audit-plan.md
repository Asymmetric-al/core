# Round 13r2 React Doctor fresh-audit plan

Prepared November 12, 2026 (Asia/Bangkok), in `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`.

**Preparation only. No new scan, adjudication approval, or candidate acceptance.** This task owns only this new document. Product, tests, manifests, scanner/configuration, the canonical exception ledger, prior evidence, Git, servers, environment, and providers are not changed. No children are started. Commands below are for a subsequently authorized operator **after** the parent freezes the repaired candidate.

## 1. Starting evidence and its limits

- The preserved Round 13 strict invocation exited **1** with `Exception evidence changed: tests/unit/apps/admin/app/eve-operations-workspace.test.tsx`. All eight target inventories were retained, but ledger validation threw **before official `actionable.json` was written**. Missing actionable output is failure, not an empty result.
- The independent `actionable-review.json` retained **635 unresolved diagnostics** out of **675 applicable diagnostics**, after 40 then-exact/hash-valid records. It is not the official actionable report and does not approve the ledger.
- Of 283 prior ledger records, 243 were stale: **24 proposed rebindings + 41 proposed retirements + 178 unapproved records**. The 178 comprise 169 unqualified contracts, eight ambiguous/unqualified identities, and one rejected mocked-consumer claim. None of the 65 proposed actions was applied or approved by that review. Even their hypothetical approval left 611 diagnostics unresolved and the ledger invalid.
- The raw invocation exited 0 with 11,455 findings, including 10,780 obsolete classic-JSX-import warnings. That inventory-only exit is not strict acceptance. The applicable identities matched the preserved strict inventory.
- Final prior verification found three frozen-entry mismatches and exited 1. The API source and dashboard test drift invalidated a current-candidate claim even though retained scan snapshots and proposal bindings survived.
- At preparation inspection, only `snapshots/round13-manifest.json` and `snapshots/round13.diff` exist for this round. **A Round 13r2 freeze has not been supplied.** Do not reuse the old manifest, assume repair completion, or scan the moving tree.

Sources: [prior report][prior-report], [final prior verification][prior-verification], [individual adjudications][prior-adjudication], and [proposal-only conditions][prior-proposal]. Counts in this document are historical planning inputs, not fresh measurements.

## 2. Exact supported command and configuration

From the r12 repository root, after the prerequisites and binding guard below:

```powershell
bun run react-doctor:check -- "--output=$strictOutput"
bun run react-doctor:raw -- "--output=$rawOutput"
```

`$strictOutput` and `$rawOutput` must be different new, nonexistent or empty directories. Keep top-level stdout/stderr logs alongside, **not inside**, those directories before launch: a nonempty output directory is rejected. Never overwrite the prior Round 13 evidence.

The first command expands to `node scripts/react-doctor-audit.mjs --check`. An equivalent strict invocation is `bun run react-doctor:audit -- --check "--output=$strictOutput"`. Plain `react-doctor:audit` does **not** fail solely because actionable findings exist. `react-doctor:first-party` is advisory and is not a substitute. The wrapper accepts only `--check`, `--raw`, and `--output=<directory>`; there is **no** `--strict`, `--manifest`, `--ledger`, target-selector, or ledger-repair flag. Never combine `--raw --check`: the raw branch returns before ledger/strict acceptance.

The runner scans these eight fixed targets sequentially, once each:

```text
apps/admin
apps/donor
apps/missionary
packages/auth
packages/database
packages/lib
packages/missionary
packages/ui
```

For each target, the supported child command is exactly this shape, with the target inside the newly created disposable physical copy:

```text
bunx react-doctor@0.9.18 <snapshot-target> --verbose --scope full --json --blocking none --no-respect-inline-disables --no-cache --no-score --no-supply-chain --no-telemetry
```

On Windows the helper invokes that argument array through `cmd.exe /d /s /c` (or the existing `ComSpec`). **Do not force `bunx --bun`**: this scanner requires Node child-process IPC. `--blocking none` on the child preserves the complete inventory; the repository wrapper, not an upstream score or default severity surface, makes the strict decision.

Keep the existing `doctor.config.json`, rather than creating a reduced override. At preparation it has 906 explicit rule entries, `lint: true`, `deadCode: true`, `warnings: true`, `scope: "full"`, empty `ignore.rules`, empty category/surface overrides, and only `react-doctor/react-in-jsx-scope` set to `off`. Existing generated/non-runtime exclusions stay exact; the public MapLibre exclusion is only the two named worker/shared assets, not `public/**`. The disposable runner overrides `respectInlineDisables: false`, `adoptExistingLintConfig: false`, `noScore: true`, `share: false`, and `supplyChain.enabled: false`; raw additionally changes just the classic JSX rule to `warn`. It sets telemetry/cache opt-outs only on its scanner subprocesses. No manual environment/provider change is needed.

Preparation control hashes (SHA-256; observations, not a future freeze):

```text
doctor.config.json                         9593037aa41b52d104aeea055158d7046dc23cfe6b202ce74fa22e0423b54f98
docs/qa/react-doctor/exceptions.json        16a0c7614cfc967c2c1a30a2133bfd17fc7b1dfe5588853136dd4d66a1914f62
scripts/react-doctor-audit.mjs              15512599d8f07920cf0f719ba6ecf27e17d22338eff5b863f10b2b44b666094c
scripts/react-doctor-first-party.mjs        11c96c2be2675dc84a5675da8dcf858136cc4ec7fb3cd5b96c2589d5d2f73cb6
scripts/react-doctor-ledger.mjs             379dce47b4cb70550bc70b577764d1ec605a00daeb40679bf9aa8bd96938c907
```

The observed ledger hash still matches the proposal's expected old ledger; that is not permission to apply the proposals. Recheck all control bindings at launch. If a scanner/config change is authorized meanwhile, stop and requalify the command/profile and exception identities rather than using this plan as evidence for the changed tool.

Command authority: [package scripts][package-scripts], [public CLI adapter and targets][cli-adapter], [audit output/snapshot creation][audit-runner], and [argument parser/strict exit][audit-arguments].

## 3. Prerequisites before the first fresh invocation

1. The parent finishes/reviews revert, Eve, shared-grid, and other candidate repairs, stops writers to the bound inputs, and declares `round13r2`. Require its exact manifest path, independently supplied manifest SHA-256, diff path/hash, base identifier, included/deleted entries, and deliberate exclusions. Expected names below are `snapshots/round13r2-manifest.json` and `snapshots/round13r2.diff`; use the owner's actual names/checkpoint if different. This task creates neither.
2. The parent accepts the full initial source-inventory digest as part of that declaration, including any runtime files outside a changed-files manifest. A file-list check alone is not proof that no extra runtime files exist. Audit source inventory covers root configuration plus ordinary tracked/untracked, nonignored `apps/`, `packages/`, and `tooling/` inputs, including packages outside the eight scanner targets. Concurrent edits there can invalidate the run. No ignored secret or generated skill-catalog content is to be pulled in.
3. Node/Bun, workspace dependencies, the exact pinned scanner, and any framework contracts used as exception evidence are already available. Locally observed versions are Node `v24.22.1` and Bun `1.4.3`; root engines require `>=24.22.1 <25`. The operator must be able to create physical temporary copies and Windows dependency junctions. Do not install/upgrade or repair environment settings under this preparation authorization. Service opt-outs do not guarantee zero network traffic: an uncached `bunx` package can require registry access.
4. Bind the current ledger/config, runner modules, root scripts/lockfile, and every exception's supporting evidence file. Tests/docs/scripts are outside the runtime source inventory and therefore need separate before/after hashes. An exclusion in the candidate diff, such as the old `bun.lock` exclusion, does not exempt it from audit integrity.
5. Preserve all prior artifacts. Use explicit new output paths; no directory auto-discovery. Do **not** execute the old `run-audits.mjs`, `analyze-evidence.mjs`, `adjudicate-evidence.mjs`, or `verify-review.mjs`: those evidence helpers are Round-13-bound and/or write old named artifacts. Root separately owns browser fixture preflight and any future authenticated/runtime qualification; this scanner plan neither invokes nor bypasses that boundary.
6. A stale ledger is a known **acceptance blocker**, not a reason to suppress the scan. A frozen strict run may legitimately collect all eight inventories and then fail ledger validation. Preserve that failed attempt for diagnosis. If later individually approved ledger edits are needed, the parent must declare the resulting changed input set and rerun; no ledger mutation under an unchanged audit binding.

## 4. Binding the CLI to the new manifest

The CLI does not read a candidate manifest. An external guard must bind it; merely naming an output directory `round13r2` does not. The following future-only PowerShell recipe checks the owner's supplied manifest hash, every declared file/deletion, and diff hash; brackets both scans with identical whole-source/control/evidence hashes; and retains separate receipts. It imports the repository's public **local helper functions**, not scanner internals, and does not invoke a scanner until the explicit Bun command.

Use PowerShell 7 for the recipe (`utf8NoBOM` output). Replace **both** approval placeholders with the parent's independently confirmed post-repair freeze digests. Do not fill either by silently accepting whatever a moving tree returns. The guard can be evaluated separately to collect a proposed source-inventory digest for the parent; that operation is only hashing, not a scan or approval. Missing/malformed hashes deliberately prevent launch.

```powershell
$root = 'C:\Users\Conrad\.t3\worktrees\core\t3-5a24111d-r12'
$approvedManifestSha256 = '<parent-approved-round13r2-manifest-sha256>'
$approvedSourceInventorySha256 = '<parent-approved-full-source-inventory-sha256>'
if ($approvedManifestSha256 -cnotmatch '^[a-f0-9]{64}$' -or
    $approvedSourceInventorySha256 -cnotmatch '^[a-f0-9]{64}$') {
  throw 'A declared freeze and independently approved digests are required.'
}
Set-Location -LiteralPath $root -ErrorAction Stop
$readBinding = @'
import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { auditSourceHashes } from "./scripts/react-doctor-audit.mjs";
import { evidenceFileHash } from "./scripts/react-doctor-ledger.mjs";
import { REACT_DOCTOR_VERSION } from "./scripts/react-doctor-first-party.mjs";

const root = realpathSync(process.cwd());
const manifestPath = "docs/qa/admin-workspaces-hillclimb/snapshots/round13r2-manifest.json";
const diffPath = "docs/qa/admin-workspaces-hillclimb/snapshots/round13r2.diff";
const digest = value => createHash("sha256").update(value).digest("hex");
const scopedPath = relative => {
  if (typeof relative !== "string" || path.isAbsolute(relative) ||
      relative.includes("\\") || relative.split("/").some(part =>
        part === ".." || part === ".git" || part === "node_modules" || part.startsWith(".env"))) {
    throw new Error("Unsafe freeze input path");
  }
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root + path.sep) ||
      (existsSync(absolute) && !realpathSync(absolute).startsWith(root + path.sep))) {
    throw new Error("Freeze input escaped the checkout");
  }
  return absolute;
};
const hashFile = relative => digest(readFileSync(scopedPath(relative)));
const manifest = JSON.parse(readFileSync(scopedPath(manifestPath), "utf8"));
if (manifest.checkpoint !== "round13r2" || !manifest.base ||
    !Array.isArray(manifest.files) || manifest.files.length === 0 ||
    new Set(manifest.files.map(entry => entry.path)).size !== manifest.files.length) {
  throw new Error("Missing, wrong, or duplicate freeze inventory");
}
if (hashFile(diffPath) !== manifest.diffSha256) throw new Error("Frozen diff changed");
for (const entry of manifest.files) {
  if (entry.status === "D") {
    if (entry.sha256 !== "absent" || existsSync(scopedPath(entry.path))) {
      throw new Error(`Frozen deletion mismatch: ${entry.path}`);
    }
  } else if (!/^[a-f0-9]{64}$/.test(entry.sha256) || hashFile(entry.path) !== entry.sha256) {
    throw new Error(`Frozen file mismatch: ${entry.path}`);
  }
}
const ledgerPath = "docs/qa/react-doctor/exceptions.json";
const ledger = JSON.parse(readFileSync(scopedPath(ledgerPath), "utf8"));
if (!Array.isArray(ledger.exceptions)) throw new Error("Invalid ledger envelope");
const controls = new Set([
  "package.json", "bun.lock", "doctor.config.json", ledgerPath,
  "scripts/react-doctor-audit.mjs", "scripts/react-doctor-first-party.mjs",
  "scripts/react-doctor-ledger.mjs", "scripts/git/environment.mjs",
]);
for (const record of ledger.exceptions) {
  for (const relative of Object.keys(record.evidenceFileHashes ?? {})) {
    evidenceFileHash(root, relative);
    controls.add(relative);
  }
}
console.log(JSON.stringify({
  root, checkpoint: manifest.checkpoint, base: manifest.base,
  manifestPath, manifestSha256: hashFile(manifestPath),
  diffPath, diffSha256: hashFile(diffPath),
  sourceInventorySha256: digest(JSON.stringify(auditSourceHashes(root))),
  controlHashes: Object.fromEntries([...controls].sort().map(relative => [relative, hashFile(relative)])),
  nodeVersion: process.version, reactDoctorVersion: REACT_DOCTOR_VERSION,
}));
'@
$before = & node --input-type=module -e $readBinding
if ($LASTEXITCODE -ne 0) { throw 'Freeze preflight failed; do not scan.' }
$binding = $before | ConvertFrom-Json
if ($binding.manifestSha256 -cne $approvedManifestSha256 -or
    $binding.sourceInventorySha256 -cne $approvedSourceInventorySha256) {
  throw 'The inspected inputs do not match the approved freeze.'
}
$bunVersion = & bun --version
if ($LASTEXITCODE -ne 0 -or $bunVersion.Trim() -ne '1.4.3') {
  throw 'Requalify the Bun runtime before continuing.'
}
$stamp = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ')
$evidenceRoot = Join-Path $root "docs\qa\admin-workspaces-hillclimb\review\round13\runtime\react-doctor\round13r2-$stamp"
if (Test-Path -LiteralPath $evidenceRoot) { throw 'Choose a fresh evidence path.' }
New-Item -ItemType Directory -Path $evidenceRoot -ErrorAction Stop | Out-Null
$before | Set-Content -LiteralPath (Join-Path $evidenceRoot 'binding-before.json') -Encoding utf8NoBOM
$modes = @(
  @{ name = 'strict'; script = 'react-doctor:check' },
  @{ name = 'raw'; script = 'react-doctor:raw' }
)
$failedInvocations = @()
foreach ($mode in $modes) {
  $pre = & node --input-type=module -e $readBinding
  if ($LASTEXITCODE -ne 0 -or $pre -cne $before) { throw 'Inputs changed before scan.' }
  $output = Join-Path $evidenceRoot $mode.name
  $startedAt = [DateTime]::UtcNow.ToString('o')
  & bun run $mode.script -- "--output=$output" 1> "$output.stdout.log" 2> "$output.stderr.log"
  $scanExitCode = $LASTEXITCODE
  $endedAt = [DateTime]::UtcNow.ToString('o')
  $after = & node --input-type=module -e $readBinding
  $guardExitCode = $LASTEXITCODE
  $after | Set-Content -LiteralPath "$output.binding-after.json" -Encoding utf8NoBOM
  [ordered]@{
    argv = @('bun', 'run', $mode.script, '--', "--output=$output")
    cwd = $root; startedAt = $startedAt; endedAt = $endedAt
    exitCode = $scanExitCode; guardExitCode = $guardExitCode
    manifestSha256 = $approvedManifestSha256
    sourceInventorySha256 = $approvedSourceInventorySha256
    bunVersion = $bunVersion.Trim(); outputDirectory = $output
    stdoutPath = "$output.stdout.log"; stderrPath = "$output.stderr.log"
  } | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath "$output.command.json" -Encoding utf8NoBOM
  if ($guardExitCode -ne 0 -or $after -cne $before) { throw 'Freeze changed; outputs are not candidate acceptance.' }
  if ($scanExitCode -ne 0) { $failedInvocations += $mode.name }
}
if ($failedInvocations.Count) {
  throw "Failed invocations retained at ${evidenceRoot}: $($failedInvocations -join ', '). No acceptance."
}
```

This is a foreground recipe, not a new installed helper or an executed result. The underlying runner has no timeout flag; the previous 900-second watchdog was external. For unattended use the parent must supply a process-tree-aware watchdog and retain timeout/signal/partial-output evidence. Never convert a timeout, missing file, or final raw exit 0 into strict success.

The binding JSON contains actual hashes, not a refreshed exception ledger. Hashing a stale record's supporting file does not validate its old hash or rationale. Before/after equality also cannot detect a file edited and restored between checkpoints: keep writers stopped. Separately bind installed framework/package artifacts used to justify any exceptions; linked external dependencies are not fully hashed by the runtime source inventory.

After each invocation, independently check `snapshot.json`, the eight target JSON/stderr pairs, `scans.json`, and `integrity.json`. Use the exact output path, not the first `audit-*` directory found. The SHA-256 of `JSON.stringify(integrity.originalHashes)` must equal `binding-before.json.sourceInventorySha256` for **both** runs. Rehash the full original inventory and full physical snapshot inventory, including additions/deletions; allow only the runner's declared `doctor.config.json` snapshot normalization. Retain a hash index of the evidence itself and the actual snapshot directories. The runner's in-scan checks do not bind ledger/test/script evidence or catch edits after its final source check; the external bracket and final handback check are required.

## 5. Efficient individual ledger adjudication, without blanket waivers

**Yes for mechanical triage and shared contract research; no for automatic semantic approval.** One frozen, complete eight-target inventory can serve every record. Do not pay for a new scanner run for each stale entry. The current canonical validator is intentionally fail-fast: it checks all evidence hashes before matching diagnostics, throws on the first stale evidence record, and later rejects leftover unused records. There is no existing aggregate ledger-repair CLI. A single failure says nothing about the safety of the other records.

Use [canonical identity/hash/review helpers][ledger-review] against the fresh retained scans. Build a map of the complete `findingIdentity(target, diagnostic)` and separately group candidates by target/file/plugin/rule/message/severity. The weaker group is only a lookup aid: it does not authorize changing line, column, end span, byte offset/length, fingerprint, ID, message, or severity. Identity absence may mean movement/replacement, not retirement.

Suggested bounded workflow for a separately authorized reviewer:

1. Validate all eight fresh report envelopes with `parseReactDoctorReport`, using each exact snapshot-target directory. Check versions/config and duplicate diagnostic/ledger identities globally. An empty in-memory exception set can help validate the scan envelope and enumerate **all** diagnostics, but is not a replacement acceptance ledger.
2. Process every old record independently, retaining all hash mismatches, exact matches, absent/ambiguous candidate groups, and previous identity/record digest. Reuse cached full source/evidence reads keyed by path **and current digest**. Where useful, call `reviewReactDoctorFindings(scans, { ...ledger, exceptions: [record] }, { root, configHash })` for each record and catch each failure. Keep the default eight expected targets. A successful single-record call proves only that record's mechanical binding; it does not check duplicates across the complete ledger, semantically approve its reason, or establish a pass.
3. Batch full-contract research by actual owner, not just by rule name. Read each owning source and its real imports/consumers/framework contract completely once; attach separate conclusions to each exact identity. Shared research is reusable only while its recorded hashes remain unchanged. Assertions about cleanup, reduced motion, forwarding, concurrent rendering, navigation, financial state, or permission ordering need actual contract and relevant behavior evidence, not a token match.
4. Assign one explicit disposition per record: retain exact prior record; propose an individually justified exact rebinding; propose retirement of an absent historical identity; reject an invalid rationale; or hold for further proof/fix. Real defects and unknown/deferred debt remain actionable. Removal of a rejected stale waiver is not a code fix and may simply expose its still-actionable finding. Keep ambiguous matches on hold; never invent a consumer or suppress a rule to close the list.
5. Record approvals against the old whole-ledger digest plus `previousIdentity` and `previousRecordHash`, and the new candidate/config/scanner, exact diagnostic, source/context/evidence hashes, concrete reason, reconsideration condition, and any separately bound installed-framework evidence. Indices are navigation aids only. The 24/41 old proposals must be requalified against the **new** freeze, not replayed by index.
6. Only an authorized ledger owner applies independently approved decisions. Then run the canonical validator on the **combined** ledger: no duplicates, stale evidence/source, unused records, unaccounted diagnostics, or missing targets. Ledger changes break the old run binding; the parent must ratify the changed freeze and perform a new strict eight-target invocation with official actionable output. Do not overwrite a failed run, hand-author official `actionable.json`, or present a subset/in-memory report as that official output.

Historical workload evidence suggests useful batches, not a shortcut to approval:

| Prior disposition                    | Records | Efficient review seam                                                                               | Boundary                                                                               |
| ------------------------------------ | ------: | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Exact-rebinding proposals            |      24 | Seventeen typed Payload forwarding boundaries; seven actual out-of-target test consumers            | Recheck each exact binding and installed contract after repairs                        |
| Absent-identity retirement proposals |      41 | Twenty source files; no matching file/rule/message/severity candidate in either preserved inventory | Prove absence again in complete fresh inventories; retirement transfers no waiver      |
| Unqualified contracts                |     169 | 132 owning files; largest groups are 73 prop-spread and 55 motion findings                          | Full owner/consumer/motion-policy review per record, not a rule-wide waiver            |
| Ambiguous/unqualified identities     |       8 | Three source files                                                                                  | Resolve exact identity or keep on hold                                                 |
| Rejected mocked-consumer claim       |       1 | Prior ledger index 11, `loadMockAdminContributions`                                                 | The cited test mocked the entire owning module; its mock is not a real export consumer |
| Then-exact/hash-valid prior records  |      40 | Existing complete identity/evidence checks                                                          | Revalidate against the new freeze; hash validity is not a fresh semantic endorsement   |

The prior 316-file structural/hash inspection is reusable research inventory only. It did not semantically requalify the 178 holds. Neither this plan nor unchanged hashes grant that missing approval.

## 6. Material diagnostics to carry into the fresh review

These are **preserved Round 13 locations**, not assertions that the moving repair tree still has the defects. Resolve their fresh identities/locations after freeze. Do not subtract repair-note test counts from diagnostic totals.

| Material finding                              | Prior concrete evidence                                                                                                                                                                   | Required fresh disposition                                                                                                                                                                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Failed published GET followed by revert PATCH | `apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/native-revert-status.tsx:101`; prior 403/500 probes issued a PATCH and could drive synthetic success state        | Parent repair note reports a GET status guard and failing-before/passing-after 403/500 coverage. Verify those exact frozen source/test bindings; do not claim live acceptance or data loss from the old synthetic probe                                                          |
| Shared-grid render publication leak           | `packages/ui/components/reui/data-grid/data-grid.tsx:1088`, `:1091`, `:1093`, `:1201`; four `no-ref-current-in-render` errors; context getters/metadata exposed uncommitted render values | Parent/shared-grid repair is in progress. Require commit-safe publication and real React abandoned/concurrent-render coverage, preserving table, props, labels, resizing, and public context behavior; stable identity alone is not a waiver                                     |
| Fresh dependency in column-header memo        | `packages/ui/components/reui/data-grid/data-grid-column-header.tsx:398`, `no-effect-with-fresh-deps` error on fresh `columnOrder`                                                         | Prove a stable dependency/behavior contract or fix it; it was unqualified, not an approved exception                                                                                                                                                                             |
| Grid-scroll observer cleanup qualification    | `packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:296`, `effect-needs-cleanup` error                                                                                       | Prior source had cleanup at `:373`, but no exact approved record. Establish ownership of every allocation/early return/unmount and relevant behavior evidence; do not claim a confirmed leak solely from the warning                                                             |
| Eve scroll scheduling inside state updater    | `apps/admin/app/(app)/admin/eve/workspace-shell.tsx:286`, `no-side-effect-in-state-updater-function`                                                                                      | Parent repair note reports event-owned state and committed-effect scroll ownership. Its real React repeated-selection test passed before and after: compatibility evidence, not reproduction of a visible duplicate-scroll bug. Recheck the frozen implementation and diagnostic |
| Accessibility/interaction warnings            | Independent unresolved inventory includes five `anchor-has-content`, three `empty-table-header`, and one `click-events-have-key-events`                                                   | Inspect actual semantics/keyboard ownership per fresh identity; do not ignore warning severity or use an unrelated primitive's exception                                                                                                                                         |
| Fetch/status-check warnings                   | Three `no-fetch-response-used-without-status-check` warnings in the independent unresolved inventory                                                                                      | Review request sequencing individually. The prior revert PATCH already checked its response; do not equate all three warnings with three proven unchecked writes                                                                                                                 |

Prior totals included eight errors in shared UI; **six were unresolved**: four render-ref writes, the column-header dependency, and grid-scroll cleanup. The other two had then-exact prior records for realtime subscription cleanup (`packages/ui/components/shadcn/data-table/hooks/use-supabase-realtime.ts:156`) and Unlayer listener cleanup (`packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:227`). Those records also need current identity/evidence checks, not automatic fresh approval.

The remaining warning backlog is material to strict acceptance, even after those repairs. Its largest historical unresolved groups are `jsx-props-no-spreading` (121), `only-export-components` (105), `jsx-handler-names` (62), `no-ungated-tailwind-animation` (62), and `no-high-complexity-react-function` (43), alongside unused exports/types, dependency, layout/design, and other correctness findings. No zero-debt prediction follows from the bounded repair batch.

Sources: [prior source findings and probe limits][prior-findings], [independent unresolved inventory][prior-actionable], and [parent's revert/Eve repair report][repair-note]. The repair report is read as an owner's reported result; this preparation does not rerun its tests or inspect changing product implementations to certify repairs.

## 7. Honest decisions and required retained output

| Observed condition                                                                                                                                                                                                                | Decision                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| No owner-declared new freeze, wrong digest, file/deletion/diff mismatch, added/deleted audit input, or changed control/evidence dependency                                                                                        | **Do not launch**, or invalidate the candidate result if already running. Preserve partial evidence and obtain a new declared binding            |
| Nonzero scanner process, timeout, malformed/missing target JSON, missing stderr evidence, partial target, skipped applicable check, duplicate/unsupported diagnostic, version/scope/path/accounting mismatch, or unexpected score | **Incomplete/invalid audit; no acceptance**. Never fill missing evidence with zeros                                                              |
| Eight inventories complete but stale/invalid/duplicate/unused exception causes the wrapper to throw and official `actionable.json` is absent                                                                                      | **Strict failure**. Use retained inventories for individual diagnosis; independent analysis is not official acceptance output                    |
| Official actionable output exists and contains any unexcepted warning or error                                                                                                                                                    | **Strict failure**; retain exact findings. Optional/design/unused-code warnings count too                                                        |
| Raw exits 0, a subset ledger validates, prior proposals are approved, or focused tests pass                                                                                                                                       | **Not a strict pass**. These are distinct inventory/review/test observations                                                                     |
| Strict exits 0, all eight complete with no skips, official output has zero actionable findings, full canonical ledger validates, and all candidate/source/snapshot/control/evidence checks remain exact                           | Eligible to report **only the manifest-bound React Doctor strict result** after final handback recheck; not blanket candidate/product acceptance |

For each mode retain the exact argv/cwd, UTC start/end, Node/Bun/scanner versions, process exit/timeout/signal status, top-level stdout/stderr, manifest/diff/base binding, original and physical snapshot integrity, eight target JSON/stderr pairs, scan coverage/count summaries, and evidence-file hash index. Inspect every target's stderr; nonempty stderr requires explanation or failure, not automatic dismissal. Compare per-target analyzed/scanned file counts to the declared inventory and investigate unexplained loss; a nonzero count alone is insufficient. Raw/applicable identity parity must be exact after removing **only** `react-doctor/react-in-jsx-scope`, with identical original source digests. The raw report intentionally does not produce official actionable output; the strict report must.

Before reporting, recheck the same declared manifest and every separate bound input again. Reproduce `actionable.json` accounting with `reviewReactDoctorFindings` over all eight complete scans and the unchanged **whole** canonical ledger. Record source fixes, approved exact exceptions, rejected/retired records, and unresolved diagnostics as separate categories. Do not count retiring a record as fixing code or count a moved diagnostic twice.

The target-report protocol is concretely `schemaVersion: 3`, `version: "0.9.18"`, `mode: "full"`, `ok: true`, `error: null`, exactly one matching project, `complete: true`, no skipped projects/checks, and null project/summary scores. Root/project/package-root directories must resolve to the exact disposable target; root/project diagnostic arrays and summary warning/error/total counts must agree. `analyzedFiles` must be unique and match `analyzedFileCount`; `scannedFileCount` must be a positive integer. The independent coverage review remains necessary beyond those parser checks.

Full product completion remains separately owned under the [canonical guide][guide]: affected builds, native lint/typecheck, formatting, full unit coverage, isolated synthetic component checks, and appropriate Chromium/keyboard/axe/provider qualification. None is established by a scanner result, a repair note, or this preparation. No score, dependency-security certification, authenticated integration claim, WCAG conformance claim, or visual-quality certification is made here.

## 8. Preparation verification and next handoff

Only the new Markdown document is written. Verification for this task is restricted to document formatting, embedded-command syntax, local evidence/link/command consistency, and hashing the already-read scanner/config/ledger controls. No audit, product/test execution, ledger application, manifest generation, browser/provider/server operation, environment change, or Git mutation is part of this task.

The next authorized owner action is to finish repairs and supply the `round13r2` freeze and independent digests. Until then the status is **prepared, not run; prior strict audit failed; fresh candidate diagnostics and acceptance unknown**.

[prior-report]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/report.md:1
[prior-verification]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/verification.json:1
[prior-adjudication]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/adjudication.json:1
[prior-proposal]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/proposal.json:1
[package-scripts]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/package.json:179
[cli-adapter]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/scripts/react-doctor-first-party.mjs:9
[audit-runner]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/scripts/react-doctor-audit.mjs:229
[audit-arguments]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/scripts/react-doctor-audit.mjs:377
[ledger-review]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/scripts/react-doctor-ledger.mjs:12
[prior-findings]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/report.md:27
[prior-actionable]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/actionable-review.json:1
[repair-note]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/revert-eve-repair.md:1
[guide]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/guides/development/react-doctor.md:1
