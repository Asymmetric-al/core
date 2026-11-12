# Deferred root commands for round13r3

**Not executed by the readiness task.** Run sections 1-5 in order in one PowerShell 7 session, exclusively from `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`, only after the completion/freeze dependencies in [README.md](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r3-readiness/README.md:19) are satisfied and root owns execution. The false acknowledgement switches and unfilled approval digest intentionally stop accidental execution. They are decisions to supply from real handoffs, not values to infer or auto-approve.

These commands do not edit product/harness/ledger/configuration, install dependencies or start a browser/server. **They do perform the future root freeze and audits**, including their built-in read-only Git inventory/diff operations and subprocess-local scanner opt-outs. Those operations are prohibited for this preparation task and were not run. There is no way to execute the current freeze/default audit inventory while promising no Git command at all. Retain the no-Git restriction until the authorized root execution phase.

## 1. Root, absent-name guard and exclusive receipt helpers

The name is exactly `round13r3`, not a reuse of r13r2. If any candidate path exists, stop; do not delete it, resume into it, or change a historical artifact. A new name requires a deliberate new root declaration and consistent changes to this procedure's paths. Guards are not a filesystem lock: root must be the only freeze writer.

```powershell
$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'Use PowerShell 7.' }
$Root = 'C:\Users\Conrad\.t3\worktrees\core\t3-5a24111d-r12'
Set-Location -LiteralPath $Root
$qaRoot = Join-Path $Root 'docs/qa/admin-workspaces-hillclimb'
$runtime = Join-Path $qaRoot 'review/round13/runtime'
$candidatePaths = @(
  (Join-Path $qaRoot 'snapshots/round13r3-manifest.json'),
  (Join-Path $qaRoot 'snapshots/round13r3.diff'),
  (Join-Path $qaRoot 'snapshots/round13r3-checkpoint')
)
function Assert-CandidateAbsent {
  foreach ($candidatePath in $candidatePaths) {
    if (Test-Path -LiteralPath $candidatePath) {
      throw "Candidate path already exists; preserve it: $candidatePath"
    }
    Write-Host "ABSENT $candidatePath"
  }
}
Assert-CandidateAbsent
$priorCollectionClosed = $false
$allOwnerHandoffsReceived = $false
$boundWritersAndDependenciesStopped = $false
if (-not ($priorCollectionClosed -and $allOwnerHandoffsReceived -and
          $boundWritersAndDependenciesStopped)) {
  throw 'Root must confirm actual closure, all handoffs and exclusive binding ownership.'
}
$stamp = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ')
$runRoot = Join-Path $runtime "react-doctor/round13r3-$stamp-$([guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $runRoot -ErrorAction Stop | Out-Null
$nodeExecutable = (Get-Command node -CommandType Application).Source
$bunExecutable = (Get-Command bun -CommandType Application).Source
function Write-NewText([string]$Path, [string]$Value) {
  $bytes = [Text.UTF8Encoding]::new($false).GetBytes($Value + "`n")
  $stream = [IO.File]::Open($Path, [IO.FileMode]::CreateNew,
                          [IO.FileAccess]::Write, [IO.FileShare]::None)
  try { $stream.Write($bytes, 0, $bytes.Length) } finally { $stream.Dispose() }
}
function Invoke-OwnedCommand([string]$Name, [string]$Executable,
                             [string[]]$Arguments, [int]$TimeoutSeconds = 900) {
  $stdoutPath = Join-Path $runRoot "$Name.stdout.log"
  $stderrPath = Join-Path $runRoot "$Name.stderr.log"
  $receiptPath = Join-Path $runRoot "$Name.command.json"
  foreach ($newPath in @($stdoutPath, $stderrPath, $receiptPath)) {
    if (Test-Path -LiteralPath $newPath) { throw "Refuse overwrite: $newPath" }
  }
  $stdoutFile = [IO.File]::Open($stdoutPath, [IO.FileMode]::CreateNew,
                              [IO.FileAccess]::Write, [IO.FileShare]::Read)
  $stderrFile = $null
  $process = $null
  $stdoutCopy = $null
  $stderrCopy = $null
  $started = $false
  $ownedProcessId = $null
  $timedOut = $false
  $exitCode = $null
  $failure = $null
  $startedAt = [DateTime]::UtcNow.ToString('o')
  try {
    $stderrFile = [IO.File]::Open($stderrPath, [IO.FileMode]::CreateNew,
                                [IO.FileAccess]::Write, [IO.FileShare]::Read)
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $Executable
    $startInfo.WorkingDirectory = $Root
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    foreach ($argument in $Arguments) { $startInfo.ArgumentList.Add($argument) }
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    $started = $process.Start()
    if (-not $started) { throw 'Process did not start.' }
    $ownedProcessId = $process.Id
    $stdoutCopy = $process.StandardOutput.BaseStream.CopyToAsync($stdoutFile)
    $stderrCopy = $process.StandardError.BaseStream.CopyToAsync($stderrFile)
    if (-not $process.WaitForExit($TimeoutSeconds * 1000)) {
      $timedOut = $true
      $process.Kill($true)
      $process.WaitForExit()
    }
    $exitCode = $process.ExitCode
    $stdoutCopy.GetAwaiter().GetResult()
    $stderrCopy.GetAwaiter().GetResult()
  } catch {
    $failure = $_.Exception.Message
    if ($started -and -not $process.HasExited) {
      try { $process.Kill($true); $process.WaitForExit() }
      catch { $failure += "; owned process-tree termination failed: $($_.Exception.Message)" }
    }
  } finally {
    $stdoutFile.Dispose()
    if ($null -ne $stderrFile) { $stderrFile.Dispose() }
    if ($null -ne $process) { $process.Dispose() }
  }
  $receipt = [ordered]@{
    argv = @($Executable) + $Arguments
    cwd = $Root
    startedAtUtc = $startedAt
    endedAtUtc = [DateTime]::UtcNow.ToString('o')
    exitCode = $exitCode
    ownedProcessId = $ownedProcessId
    timedOut = $timedOut
    timeoutSeconds = $TimeoutSeconds
    watchdog = 'System.Diagnostics.Process.Kill(entireProcessTree: true), owned process only'
    signalStatus = 'Not exposed separately by Windows Process API; retain native exit and timeout'
    spawnOrCaptureError = $failure
    stdoutPath = $stdoutPath
    stderrPath = $stderrPath
  }
  Write-NewText $receiptPath ($receipt | ConvertTo-Json -Depth 8)
  return [pscustomobject]$receipt
}
function Assert-Completed($Receipt, [bool]$RequireZero = $true) {
  if ($Receipt.timedOut -or $null -ne $Receipt.spawnOrCaptureError -or
      $null -eq $Receipt.exitCode -or ($RequireZero -and $Receipt.exitCode -ne 0)) {
    throw "Invocation failed; preserve partial evidence at $runRoot"
  }
}
Write-Host "NEW EVIDENCE ROOT $runRoot"
```

`CreateNew` prevents receipt overwrite, and output streams are copied to fresh files while the process runs. The 900-second watchdog terminates only the owned process tree on timeout. A host crash or forced interruption can still leave incomplete streams/receipts; such an attempt is incomplete evidence, never acceptance. Do not retry within its directory.

## 2. Future root freeze, never a preparation action

These resolve to `node docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs round13r3` and `node docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs --verify round13r3` from the declared root. Write mode is destructive if its name is reused; the immediate guard and exclusive ownership above are required. Preserve a failed or partial freeze; do not rerun over it.

```powershell
$freezeControls = @{
  'docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs' = 'da9a9dd18a1191ddd7eb25ba5091f933ff6a724cb90efa4e0f8966ddc5a128f7'
  'docs/qa/admin-workspaces-hillclimb/checkpoint-diff.mjs' = 'd5169da1a6c6b38a14f9380489fc5030271af13f2e180837437cf8aa413eea5c'
}
foreach ($control in $freezeControls.GetEnumerator()) {
  $observedHash = (Get-FileHash -LiteralPath (Join-Path $Root $control.Key) -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($observedHash -cne $control.Value) { throw 'Requalify changed freeze controls before invocation.' }
}
$nodeVersionReceipt = Invoke-OwnedCommand -Name 'node-version' -Executable $nodeExecutable -Arguments @('--version')
Assert-Completed $nodeVersionReceipt
$nodeVersionText = (Get-Content -LiteralPath $nodeVersionReceipt.stdoutPath -Raw).Trim().TrimStart('v')
$nodeVersion = [version]$nodeVersionText
if ($nodeVersion.Major -ne 24 -or $nodeVersion -lt [version]'24.22.1') {
  throw 'Requalify Node before freeze; no runtime upgrade is authorized here.'
}
Assert-CandidateAbsent
$freeze = Invoke-OwnedCommand -Name 'freeze' -Executable $nodeExecutable -Arguments @(
  'docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs', 'round13r3'
)
Assert-Completed $freeze
$freezeVerify = Invoke-OwnedCommand -Name 'freeze-verify' -Executable $nodeExecutable -Arguments @(
  'docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs', '--verify', 'round13r3'
)
Assert-Completed $freezeVerify
$freezeResult = Get-Content -LiteralPath $freezeVerify.stdoutPath -Raw | ConvertFrom-Json
if ($freezeResult.name -cne 'round13r3' -or $freezeResult.files -le 0 -or
    @($freezeResult.mismatches).Count -ne 0 -or @($freezeResult.extra).Count -ne 0) {
  throw 'Freeze verifier did not establish the required changed-file state.'
}
$bunVersionReceipt = Invoke-OwnedCommand -Name 'bun-version' -Executable $bunExecutable -Arguments @('--version')
Assert-Completed $bunVersionReceipt
$bunVersion = (Get-Content -LiteralPath $bunVersionReceipt.stdoutPath -Raw).Trim()
if ($bunVersion -cne '1.4.3') { throw 'Requalify runtime; do not install or upgrade here.' }
```

## 3. Full binding inventory and proposal, not automatic approval

The reader below performs **hashing/inventory only**, not a scanner run. It deliberately calls the existing Git-backed full-source helper and inventories ordinary tracked/untracked script/test controls. All paths and maps are retained, not just an entry count. Root must inspect the actual manifest/deletions/exclusions, expected diff base, source and control maps, stale ledger evidence and separately named harness/fixture/report identities. A historical saved binding or hash freshly read from a moving tree is not independent approval.

The candidate checkpoint is checked physically against its declared present/deleted entries, including extra-copy detection. Inventory digests use SHA-256 of `JSON.stringify` of lexically key-sorted path/hash maps; the source digest uses the canonical helper's sorted object unchanged. The final `bindingSha256` hashes the complete binding object before that property is added. No timestamp is inside that stable object; invocation receipts supply observation times.

```powershell
$readBinding = @'
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { auditSourceHashes } from "./scripts/react-doctor-audit.mjs";
import { evidenceFileHash } from "./scripts/react-doctor-ledger.mjs";
import { REACT_DOCTOR_TARGETS, REACT_DOCTOR_VERSION } from "./scripts/react-doctor-first-party.mjs";
import { repositoryGitEnvironment } from "./scripts/git/environment.mjs";

const root = realpathSync(process.cwd());
const expectedRoot = realpathSync("C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12");
if (root !== expectedRoot) throw new Error("Wrong checkout");
const [major, minor, patch] = process.versions.node.split(".").map(Number);
if (major !== 24 || minor < 22 || (minor === 22 && patch < 1)) throw new Error("Requalify Node");
const expectedTargets = ["apps/admin", "apps/donor", "apps/missionary", "packages/auth",
  "packages/database", "packages/lib", "packages/missionary", "packages/ui"];
if (REACT_DOCTOR_VERSION !== "0.9.18" ||
    JSON.stringify(REACT_DOCTOR_TARGETS) !== JSON.stringify(expectedTargets)) {
  throw new Error("Audit control profile changed; requalify before scanning");
}
const digest = value => createHash("sha256").update(value).digest("hex");
const ordered = value => Object.fromEntries(Object.entries(value).sort(([left], [right]) =>
  left < right ? -1 : left > right ? 1 : 0));
const safePath = relative => {
  if (typeof relative !== "string" || !relative || path.isAbsolute(relative) ||
      relative.includes("\\") || relative.includes(":") ||
      relative.split("/").some(part => !part || part === "." || part === ".." ||
        part === ".git" || part === "node_modules" || part.startsWith(".env"))) {
    throw new Error("Unsafe binding path");
  }
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root + path.sep) ||
      (existsSync(absolute) && !realpathSync(absolute).startsWith(root + path.sep))) {
    throw new Error("Binding path escaped checkout");
  }
  return absolute;
};
const hashFile = relative => {
  const absolute = safePath(relative);
  if (!lstatSync(absolute).isFile()) throw new Error("Non-regular binding file: " + relative);
  return digest(readFileSync(absolute));
};
const hashPaths = relatives => ordered(Object.fromEntries([...new Set(relatives)].sort()
  .map(relative => [relative, hashFile(relative)])));
const requiredProfileHashes = {
  "doctor.config.json": "9593037aa41b52d104aeea055158d7046dc23cfe6b202ce74fa22e0423b54f98",
  "scripts/react-doctor-audit.mjs": "15512599d8f07920cf0f719ba6ecf27e17d22338eff5b863f10b2b44b666094c",
  "scripts/react-doctor-first-party.mjs": "11c96c2be2675dc84a5675da8dcf858136cc4ec7fb3cd5b96c2589d5d2f73cb6",
  "scripts/react-doctor-ledger.mjs": "379dce47b4cb70550bc70b577764d1ec605a00daeb40679bf9aa8bd96938c907",
  "scripts/git/environment.mjs": "de4b723866f43c53a038fd63207cbf035b662221ebb1e8eda5bdc071e57836a4",
  "docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs": "da9a9dd18a1191ddd7eb25ba5091f933ff6a724cb90efa4e0f8966ddc5a128f7",
  "docs/qa/admin-workspaces-hillclimb/checkpoint-diff.mjs": "d5169da1a6c6b38a14f9380489fc5030271af13f2e180837437cf8aa413eea5c",
};
for (const [relative, expectedHash] of Object.entries(requiredProfileHashes)) {
  if (hashFile(relative) !== expectedHash) throw new Error("Requalify changed audit/freeze control: " + relative);
}
const rootPackage = JSON.parse(readFileSync(safePath("package.json"), "utf8"));
for (const [name, command] of Object.entries({
  "react-doctor:audit": "node scripts/react-doctor-audit.mjs",
  "react-doctor:check": "node scripts/react-doctor-audit.mjs --check",
  "react-doctor:raw": "node scripts/react-doctor-audit.mjs --raw",
})) {
  if (rootPackage.scripts?.[name] !== command) throw new Error("Root audit command changed");
}
const qaRoot = "docs/qa/admin-workspaces-hillclimb";
const runtime = qaRoot + "/review/round13/runtime";
const manifestPath = qaRoot + "/snapshots/round13r3-manifest.json";
const diffPath = qaRoot + "/snapshots/round13r3.diff";
const checkpointPath = qaRoot + "/snapshots/round13r3-checkpoint";
const manifest = JSON.parse(readFileSync(safePath(manifestPath), "utf8"));
if (manifest.checkpoint !== "round13r3" ||
    manifest.base !== "8368004b339384eb98129a086ca71b7db88534ed" ||
    !Array.isArray(manifest.files) || !manifest.files.length ||
    !Array.isArray(manifest.excluded) ||
    new Set(manifest.files.map(entry => entry.path)).size !== manifest.files.length) {
  throw new Error("Wrong or incomplete candidate declaration");
}
if (!/^[a-f0-9]{64}$/.test(manifest.diffSha256) ||
    hashFile(diffPath) !== manifest.diffSha256) throw new Error("Frozen diff mismatch");
const expectedCopies = {};
for (const entry of manifest.files) {
  const original = safePath(entry.path);
  const copyRelative = checkpointPath + "/" + entry.path;
  const copy = safePath(copyRelative);
  if (entry.sha256 === "absent") {
    if (existsSync(original) || existsSync(copy)) throw new Error("Frozen deletion changed: " + entry.path);
  } else {
    if (!/^[a-f0-9]{64}$/.test(entry.sha256) ||
        hashFile(entry.path) !== entry.sha256 || hashFile(copyRelative) !== entry.sha256) {
      throw new Error("Frozen original/copy mismatch: " + entry.path);
    }
    expectedCopies[entry.path] = entry.sha256;
  }
}
const actualCopies = {};
const visitCopies = (directory, prefix = "") => {
  const absolute = safePath(directory);
  if (!lstatSync(absolute).isDirectory()) throw new Error("Checkpoint is not a real directory");
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    const child = directory + "/" + entry.name;
    if (entry.isSymbolicLink()) throw new Error("Checkpoint symlink");
    if (entry.isDirectory()) visitCopies(child, relative + "/");
    else if (entry.isFile()) actualCopies[relative] = hashFile(child);
    else throw new Error("Unsupported checkpoint entry");
  }
};
visitCopies(checkpointPath);
if (JSON.stringify(ordered(actualCopies)) !== JSON.stringify(ordered(expectedCopies))) {
  throw new Error("Checkpoint has extra, missing or changed files");
}
const listed = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, env: repositoryGitEnvironment(),
});
if (listed.error || listed.status !== 0) throw new Error("Control inventory failed");
const ordinaryFiles = [...new Set(listed.stdout.split("\0").filter(Boolean))];
const scriptAndTestPaths = ordinaryFiles.filter(relative =>
  /^(scripts|tests)\//.test(relative) &&
  !relative.split("/").some(part => part === "node_modules" || part.startsWith(".env")) &&
  existsSync(safePath(relative)));
const requiredControls = ["package.json", "bun.lock", "doctor.config.json",
  "docs/qa/react-doctor/exceptions.json", "scripts/react-doctor-audit.mjs",
  "scripts/react-doctor-first-party.mjs", "scripts/react-doctor-ledger.mjs",
  "scripts/git/environment.mjs", qaRoot + "/freeze-checkpoint.mjs", qaRoot + "/checkpoint-diff.mjs"];
const optionalRootControls = [".gitignore", ".gitattributes", ".node-version", ".bun-version",
  ".prettierignore", "turbo.json", "tsconfig.json", "tsconfig.base.json",
  "eslint.config.mjs", "eslint.config.js", "vitest.config.mts",
  "vitest.per-importer-alias.mts", "vitest.per-importer-alias.ts",
  "vitest.pin-workspace-packages.mts", "vitest.pin-workspace-packages.ts",
  "playwright.config.ts", "playwright.admin.config.ts", "playwright.donor.config.ts",
  "playwright.missionary.config.ts", "playwright.development-smoke.config.ts"];
const harnessPaths = readdirSync(safePath(qaRoot), { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith(".mjs")).map(entry => qaRoot + "/" + entry.name);
const fixturePaths = readdirSync(safePath(qaRoot + "/fixtures"), { withFileTypes: true })
  .filter(entry => entry.isFile() && /\.(?:mjs|ts|json|md)$/.test(entry.name))
  .map(entry => qaRoot + "/fixtures/" + entry.name);
const reportPaths = [
  runtime + "/round13r3-repairs/email.md", runtime + "/round13r3-repairs/pdf.md",
  runtime + "/round13r3-repairs/support.md", runtime + "/round13r3-repairs/catalogue.md",
  runtime + "/react-doctor/round13r3-grid-repair/report.md",
  runtime + "/refreeze/next-candidate-repair-decision.md",
  runtime + "/react-doctor/fresh-audit-plan.md",
  runtime + "/round13r3-readiness/README.md", runtime + "/round13r3-readiness/root-commands.md",
  "docs/guides/development/react-doctor.md",
];
const ledger = JSON.parse(readFileSync(safePath("docs/qa/react-doctor/exceptions.json"), "utf8"));
if (!Array.isArray(ledger.exceptions)) throw new Error("Invalid whole-ledger envelope");
const evidenceHashes = {};
const staleEvidenceReferences = [];
for (const [recordIndex, record] of ledger.exceptions.entries()) {
  for (const [relative, declaredSha256] of Object.entries(record.evidenceFileHashes ?? {})) {
    const actualSha256 = evidenceFileHash(root, relative);
    evidenceHashes[relative] = actualSha256;
    if (declaredSha256 !== actualSha256) staleEvidenceReferences.push({
      recordIndex, path: relative, declaredSha256, actualSha256,
    });
  }
}
const sourceHashes = auditSourceHashes(root);
const scriptAndTestHashes = hashPaths(scriptAndTestPaths);
const harnessHashes = hashPaths(harnessPaths);
const fixtureSourceHashes = hashPaths(fixturePaths);
const repairAndInstructionHashes = hashPaths(reportPaths);
const controlHashes = ordered({
  ...hashPaths([...requiredControls, ...optionalRootControls.filter(relative => existsSync(safePath(relative)))]),
  ...scriptAndTestHashes, ...harnessHashes, ...fixtureSourceHashes,
  ...repairAndInstructionHashes, ...ordered(evidenceHashes),
});
const binding = {
  root, checkpoint: manifest.checkpoint, base: manifest.base,
  manifestPath, manifestSha256: hashFile(manifestPath),
  diffPath, diffSha256: hashFile(diffPath), manifest,
  checkpointPath, checkpointCopyHashes: ordered(actualCopies),
  sourceHashes, sourceInventorySha256: digest(JSON.stringify(sourceHashes)),
  controlHashes, controlInventorySha256: digest(JSON.stringify(controlHashes)),
  scriptAndTestHashes, harnessHashes, fixtureSourceHashes, repairAndInstructionHashes,
  exceptionEvidenceHashes: ordered(evidenceHashes), staleEvidenceReferences,
  fixtureIdentityKind: "source-only; no emitted bundle, preflight or rendered runtime attested",
  installedDependencyTreesFullySealed: false,
  nodeVersion: process.version, reactDoctorVersion: REACT_DOCTOR_VERSION,
  targets: REACT_DOCTOR_TARGETS,
};
console.log(JSON.stringify({ ...binding, bindingSha256: digest(JSON.stringify(binding)) }));
'@
function Read-Binding([string]$Name) {
  $receipt = Invoke-OwnedCommand -Name $Name -Executable $nodeExecutable -Arguments @(
    '--input-type=module', '-e', $readBinding
  ) -TimeoutSeconds 120
  Assert-Completed $receipt
  return (Get-Content -LiteralPath $receipt.stdoutPath -Raw).Trim()
}
$proposedBindingText = Read-Binding 'binding-proposed'
$proposedBinding = $proposedBindingText | ConvertFrom-Json -Depth 100
$proposedBinding | Select-Object checkpoint, base, manifestSha256, diffSha256,
  sourceInventorySha256, controlInventorySha256, bindingSha256 | Format-List
Write-Host "FULL MAPS: $(Join-Path $runRoot 'binding-proposed.stdout.log')"
```

Stop here for root review. Approve the entire stable binding, not just the displayed summary. A current observed digest is a proposal until root independently declares it. The stale-evidence list is not a full ledger adjudication: current source contexts, finding identities, semantic evidence, duplicate/unused records and every other canonical requirement still need the strict whole-ledger validator.

## 4. Root declaration and two fresh complete target invocations

Supply the independent root-approved digest only after the preceding review. This binds manifest, diff/base, full source/control maps, checkpoint copies and evidence together. Do not set approval automatically from the proposed value. Versions, dependency availability and every owner handoff must remain valid throughout.

```powershell
$approvedBindingSha256 = '<independently-root-approved-64-lowercase-hex-binding-digest>'
if ($approvedBindingSha256 -cnotmatch '^[a-f0-9]{64}$' -or
    $proposedBinding.bindingSha256 -cne $approvedBindingSha256) {
  throw 'No independent declaration of this complete candidate binding.'
}
Write-NewText (Join-Path $runRoot 'root-declaration.json') ([ordered]@{
  checkpoint = 'round13r3'
  root = $Root
  declaredAtUtc = [DateTime]::UtcNow.ToString('o')
  bindingSha256 = $approvedBindingSha256
  manifestSha256 = $proposedBinding.manifestSha256
  diffSha256 = $proposedBinding.diffSha256
  sourceInventorySha256 = $proposedBinding.sourceInventorySha256
  controlInventorySha256 = $proposedBinding.controlInventorySha256
  priorCollectionClosed = $priorCollectionClosed
  ownerHandoffsReceived = $allOwnerHandoffsReceived
  boundWritersAndDependenciesStopped = $boundWritersAndDependenciesStopped
  bunVersion = $bunVersion
} | ConvertTo-Json -Depth 8)
function Assert-MatchingBinding([string]$Name) {
  $observed = Read-Binding $Name
  if ($observed -cne $proposedBindingText) {
    throw "Binding drift; preserve all evidence and invalidate this attempt: $runRoot"
  }
}
$modes = @(
  @{ name = 'strict'; script = 'react-doctor:check' },
  @{ name = 'raw'; script = 'react-doctor:raw' }
)
$modeReceipts = @()
foreach ($mode in $modes) {
  Assert-MatchingBinding "$($mode.name)-binding-before"
  $output = Join-Path $runRoot $mode.name
  if (Test-Path -LiteralPath $output) { throw "Output already exists: $output" }
  $receipt = Invoke-OwnedCommand -Name $mode.name -Executable $bunExecutable -Arguments @(
    'run', $mode.script, '--', "--output=$output"
  ) -TimeoutSeconds 900
  Assert-MatchingBinding "$($mode.name)-binding-after"
  $modeReceipts += $receipt
  Assert-Completed $receipt $false
}
$finalFreezeVerify = Invoke-OwnedCommand -Name 'freeze-verify-after' -Executable $nodeExecutable -Arguments @(
  'docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs', '--verify', 'round13r3'
)
Assert-Completed $finalFreezeVerify
Assert-MatchingBinding 'binding-after-audits'
Write-NewText (Join-Path $runRoot 'audit-exits.json') ([ordered]@{
  checkpoint = 'round13r3'
  bindingSha256 = $approvedBindingSha256
  strictExit = $modeReceipts[0].exitCode
  rawExit = $modeReceipts[1].exitCode
  acceptance = 'NOT_DETERMINED; independently validate artifacts, whole ledger and coverage'
} | ConvertTo-Json -Depth 8)
Write-Host "STRICT EXIT $($modeReceipts[0].exitCode); RAW EXIT $($modeReceipts[1].exitCode)"
Write-Host "PRESERVED OUTPUT $runRoot"
```

The two audit invocations are exactly:

```powershell
bun run react-doctor:check -- "--output=$runRoot/strict"
bun run react-doctor:raw -- "--output=$runRoot/raw"
```

The preceding pair is an explanatory expansion, **not an additional invocation to rerun after the guarded block**. Each command scans all eight fixed targets sequentially; there is no target selector. Strict nonzero is retained independently from raw, never replaced by the last exit. If strict exits for ledger/actionable failure and binding is unchanged, raw still runs. Timeout, failed spawn/capture or binding drift stops further collection; preserve partials and declare a different attempt only after root resolves the cause.

The child scanner profile remains the repository-supported public CLI:

```text
bunx react-doctor@0.9.18 <new-physical-snapshot-target> --verbose --scope full --json --blocking none --no-respect-inline-disables --no-cache --no-score --no-supply-chain --no-telemetry
```

That child profile is documentation, not a direct command against the live checkout. It runs under Node IPC, through the existing Windows adapter, inside each disposable copy. The wrapper's strict whole-ledger decision, not child blocking severity or a score, governs acceptance.

## 5. Independent artifact checks, final binding and immutable index

This later **read-only validation**, not another scan, reparses all reports using the existing public local helpers. It rehashes both entire physical snapshots and checks that only the exact supported disposable config normalization differs from the declared original. Missing/partial output fails; the strict whole-ledger exception remains an explicit failed decision rather than being replaced with a subset ledger or an empty actionable list. The validator's own exit 0 means its checks completed, **not a strict pass**.

```powershell
$validateArtifacts = @'
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { auditSourceHashes } from "./scripts/react-doctor-audit.mjs";
import { REACT_DOCTOR_TARGETS, REACT_DOCTOR_VERSION } from "./scripts/react-doctor-first-party.mjs";
import { findingIdentity, parseReactDoctorReport, reactDoctorConfigHash,
  reviewReactDoctorFindings } from "./scripts/react-doctor-ledger.mjs";
const root = realpathSync(process.cwd());
const run = realpathSync(process.argv[1]);
assert.ok(run.startsWith(root + path.sep));
const readJson = relative => JSON.parse(readFileSync(path.join(run, relative), "utf8"));
const binding = readJson("binding-proposed.stdout.log");
assert.equal(binding.root, root);
assert.equal(binding.checkpoint, "round13r3");
const digest = value => createHash("sha256").update(value).digest("hex");
const { bindingSha256, ...bindingCore } = binding;
assert.equal(digest(JSON.stringify(bindingCore)), bindingSha256);
assert.equal(readJson("root-declaration.json").bindingSha256, bindingSha256);
const modes = {};
const identitySets = {};
const targetStderr = [];
for (const mode of ["strict", "raw"]) {
  const receipt = readJson(mode + ".command.json");
  assert.equal(receipt.timedOut, false);
  assert.equal(receipt.spawnOrCaptureError, null);
  const snapshotInfo = readJson(mode + "/snapshot.json");
  assert.equal(realpathSync(snapshotInfo.original), root);
  const snapshot = realpathSync(snapshotInfo.snapshot);
  assert.ok(snapshot !== root && !snapshot.startsWith(root + path.sep));
  const integrity = readJson(mode + "/integrity.json");
  assert.deepEqual(integrity.originalHashes, binding.sourceHashes);
  assert.equal(digest(JSON.stringify(integrity.originalHashes)), binding.sourceInventorySha256);
  const config = JSON.parse(readFileSync(path.join(root, "doctor.config.json"), "utf8"));
  config.respectInlineDisables = false;
  config.adoptExistingLintConfig = false;
  config.noScore = true;
  config.share = false;
  config.supplyChain = { enabled: false };
  if (mode === "raw") config.rules["react-doctor/react-in-jsx-scope"] = "warn";
  const expectedSnapshot = { ...binding.sourceHashes,
    "doctor.config.json": digest(JSON.stringify(config, null, 2) + "\n") };
  assert.deepEqual(integrity.snapshotHashes, expectedSnapshot);
  assert.deepEqual(auditSourceHashes(snapshot, { inventory: "physical" }), expectedSnapshot);
  const scans = [];
  const coverage = [];
  const identities = [];
  for (const target of REACT_DOCTOR_TARGETS) {
    const stem = target.replaceAll("/", "-");
    const report = readJson(mode + "/" + stem + ".json");
    const scan = parseReactDoctorReport(report, target, path.join(snapshot, target));
    scans.push(scan);
    const stderr = readFileSync(path.join(run, mode, stem + ".stderr.log"));
    if (stderr.length) targetStderr.push({ mode, target, bytes: stderr.length,
      sha256: digest(stderr), disposition: "ROOT_EXPLANATION_REQUIRED" });
    coverage.push({ target, sourceFileCount: report.projects[0].sourceFileCount,
      scannedFileCount: scan.scannedFileCount, analyzedFileCount: scan.analyzedFiles.length,
      analyzedFiles: scan.analyzedFiles });
    for (const diagnostic of scan.diagnostics) {
      if (mode === "raw" &&
          diagnostic.plugin + "/" + diagnostic.rule === "react-doctor/react-in-jsx-scope") continue;
      identities.push(findingIdentity(target, diagnostic));
    }
  }
  assert.deepEqual(readJson(mode + "/scans.json"), scans);
  assert.equal(new Set(identities).size, identities.length);
  identitySets[mode] = identities.sort();
  modes[mode] = { receipt, scans, coverage, snapshot };
}
assert.deepEqual(identitySets.strict, identitySets.raw);
const configBytes = readFileSync(path.join(root, "doctor.config.json"));
const configHash = reactDoctorConfigHash(configBytes);
const ledger = JSON.parse(readFileSync(path.join(root, "docs/qa/react-doctor/exceptions.json"), "utf8"));
let wholeLedgerValid = false;
let wholeLedgerError = null;
let reviewed = null;
try {
  reviewed = reviewReactDoctorFindings(modes.strict.scans, ledger, { root, configHash });
  wholeLedgerValid = true;
} catch (error) {
  wholeLedgerError = error.message;
}
const actionablePath = path.join(run, "strict", "actionable.json");
const officialActionablePresent = existsSync(actionablePath);
if (wholeLedgerValid) {
  assert.ok(officialActionablePresent, "Missing official strict actionable output");
  assert.deepEqual(JSON.parse(readFileSync(actionablePath, "utf8")), {
    version: REACT_DOCTOR_VERSION, configHash, ...reviewed,
  });
  assert.equal(modes.strict.receipt.exitCode, reviewed.actionable.length ? 1 : 0);
} else {
  assert.notEqual(modes.strict.receipt.exitCode, 0, "Invalid whole ledger cannot be a strict pass");
}
assert.equal(modes.raw.receipt.exitCode, 0);
console.log(JSON.stringify({
  checkpoint: "round13r3", bindingSha256: binding.bindingSha256,
  completeTargetProtocolPairs: 16, exactApplicableRawIdentityParity: true,
  strictExit: modes.strict.receipt.exitCode, rawExit: modes.raw.receipt.exitCode,
  wholeLedgerValid, wholeLedgerError, officialActionablePresent,
  actionableCount: reviewed ? reviewed.actionable.length : null,
  targetStderr, coverage: { strict: modes.strict.coverage, raw: modes.raw.coverage },
  coverageOmissionsIndependentlyReconciled: false,
  installedDependencyTreesFullySealed: false,
  acceptance: "NOT_DETERMINED; root must reconcile coverage, stderr and all remaining gates",
}, null, 2));
'@
Assert-MatchingBinding 'binding-before-artifact-validation'
$artifactValidation = Invoke-OwnedCommand -Name 'artifact-validation' -Executable $nodeExecutable -Arguments @(
  '--input-type=module', '-e', $validateArtifacts, $runRoot
) -TimeoutSeconds 300
Assert-MatchingBinding 'binding-after-artifact-validation'
Assert-Completed $artifactValidation
```

Root must inspect the saved coverage lists against the declared source/configuration and explain every omitted/changed path and every nonempty target stderr. Do not equate positive counts, source discovery counts, or whole-target completion to full runtime coverage. The known r13r2 profile omitted two script files and seven database runtime adapters; check the actual r13r3 lists rather than assuming identical omissions. The above check does not resolve those semantics or hash complete installed dependency trees. No strict pass is allowed if strict exit is nonzero, whole-ledger validation fails, official actionable is missing/nonzero, or any other gate remains unresolved.

After writing any separate root interpretation into **new files in this run directory**, finish all writers, perform the final live binding check, then seal. Do not append to logs or add files afterward. The plain final Node call has no open receipt streams inside the indexed tree.

```powershell
Assert-MatchingBinding 'binding-final-handback'
$sealEvidence = @'
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
const root = realpathSync(process.cwd());
const directory = realpathSync(process.argv[1]);
assert.ok(directory.startsWith(path.join(root,
  "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor") + path.sep));
assert.ok(path.basename(directory).startsWith("round13r3-"));
const digest = value => createHash("sha256").update(value).digest("hex");
for (const name of ["evidence-index.json", "evidence-seal.json"]) {
  assert.equal(existsSync(path.join(directory, name)), false, "Refuse seal overwrite");
}
const files = {};
const visit = (absolute, prefix = "") => {
  for (const entry of readdirSync(absolute, { withFileTypes: true }).sort((left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0)) {
    const relative = prefix + entry.name;
    const child = path.join(absolute, entry.name);
    assert.equal(entry.isSymbolicLink(), false);
    if (entry.isDirectory()) visit(child, relative + "/");
    else {
      assert.equal(entry.isFile(), true);
      const bytes = readFileSync(child);
      files[relative] = { bytes: bytes.length, sha256: digest(bytes) };
    }
  }
};
visit(directory);
const index = JSON.stringify({ directory, files }, null, 2) + "\n";
writeFileSync(path.join(directory, "evidence-index.json"), index, { flag: "wx" });
const seal = { checkpoint: "round13r3", directory, sealedAtUtc: new Date().toISOString(),
  indexSha256: digest(index), fileCount: Object.keys(files).length,
  exclusions: ["evidence-index.json", "evidence-seal.json"],
  interpretation: "Evidence integrity only, not strict or product acceptance" };
writeFileSync(path.join(directory, "evidence-seal.json"),
  JSON.stringify(seal, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify(seal));
'@
& $nodeExecutable --input-type=module -e $sealEvidence $runRoot
if ($LASTEXITCODE -ne 0) { throw 'Seal incomplete; preserve this attempt without overwriting it.' }
```

Retain the actual external snapshot directories referenced by both snapshot manifests; they are not copied into the evidence index. Rehash the index entries and physical snapshots at later handback/use, checking additions/deletions as well as byte changes. Before/after hashing cannot detect an edit-and-restore between observations; owner quiescence and stable dependencies remain required.

No browser collector, fixture emitter, old candidate assembler, sheet/brief writer, ledger proposal applier, build/test gate, environment or provider command is part of this procedure. A completed source-audit evidence set is not product acceptance.
