import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditSourceHashes } from "../../../../../../../scripts/react-doctor-audit.mjs";
import {
  REACT_DOCTOR_TARGETS,
  REACT_DOCTOR_VERSION,
} from "../../../../../../../scripts/react-doctor-first-party.mjs";
import {
  evidenceFileHash,
  findingIdentity,
  parseReactDoctorReport,
  reviewReactDoctorFindings,
  sourceContextHash,
  sourceFileHash,
} from "../../../../../../../scripts/react-doctor-ledger.mjs";

const startedAt = new Date().toISOString();
const root = process.cwd();
assert.equal(
  path.resolve(root),
  path.resolve("C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12"),
);
const outputRoot = path.dirname(fileURLToPath(import.meta.url));
const relativeOutputRoot = path
  .relative(root, outputRoot)
  .replaceAll("\\", "/");
assert.equal(
  relativeOutputRoot,
  "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor",
);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const hashFile = (file) => hash(readFileSync(path.resolve(root, file)));
const readJson = (file) =>
  JSON.parse(readFileSync(path.resolve(root, file), "utf8"));
const readOwned = (file) => readJson(`${relativeOutputRoot}/${file}`);
const writeOwned = (file, value) =>
  writeFileSync(
    path.join(outputRoot, file),
    JSON.stringify(value, null, 2) + "\n",
  );
const proposal = readOwned("proposal.json");
const adjudication = readOwned("adjudication.json");
const ledgerPath = "docs/qa/react-doctor/exceptions.json";
const ledger = readJson(ledgerPath);
const config = readJson("doctor.config.json");
const manifestPath =
  "docs/qa/admin-workspaces-hillclimb/snapshots/round13-manifest.json";
const diffPath = "docs/qa/admin-workspaces-hillclimb/snapshots/round13.diff";
const manifest = readJson(manifestPath);
assert.equal(hashFile(manifestPath), proposal.expectedFrozenManifestHash);
assert.equal(hashFile(diffPath), proposal.expectedFrozenDiffHash);
assert.equal(
  manifest.diffSha256,
  "8e4c354259160e26be0fed1a3308ae87452b5fe6c58ea1c5448c1ffcbd143547",
);
assert.equal(manifest.files.length, 1032);
const frozenMismatches = [];
for (const entry of manifest.files) {
  const exists = existsSync(path.resolve(root, entry.path));
  const actual = exists ? hashFile(entry.path) : null;
  if (entry.status === "D" ? exists : actual !== entry.sha256)
    frozenMismatches.push({
      path: entry.path,
      status: entry.status,
      expected: entry.sha256,
      actual,
    });
}
assert.equal(hashFile(ledgerPath), proposal.expectedLedgerHash);
assert.equal(hashFile("doctor.config.json"), proposal.expectedConfigHash);
assert.deepEqual(config.ignore.rules, []);
assert.equal(REACT_DOCTOR_VERSION, "0.9.18");

const preserved = readOwned("preserved-audit-hashes.json");
for (const [file, expected] of Object.entries(preserved.hashes))
  assert.equal(hashFile(file), expected, file);
const commands = readOwned("commands-20261111T174004238Z.json");
assert.deepEqual(
  commands.map((command) => [command.mode, command.exitCode, command.timedOut]),
  [
    ["audit", 1, false],
    ["raw", 0, false],
  ],
);
assert.notEqual(commands[0].outputDirectory, commands[1].outputDirectory);
const originalHashes = auditSourceHashes(root);
const modes = [];
for (const command of commands) {
  const directory = path
    .relative(root, command.outputDirectory)
    .replaceAll("\\", "/");
  assert.ok(directory.startsWith(`${relativeOutputRoot}/`));
  const integrity = readJson(`${directory}/integrity.json`);
  const snapshot = readJson(`${directory}/snapshot.json`);
  assert.equal(path.resolve(snapshot.original), path.resolve(root));
  const currentSourceDrift = [
    ...new Set([
      ...Object.keys(integrity.originalHashes),
      ...Object.keys(originalHashes),
    ]),
  ]
    .filter((file) => integrity.originalHashes[file] !== originalHashes[file])
    .map((file) => ({
      file,
      expected: integrity.originalHashes[file] ?? null,
      actual: originalHashes[file] ?? null,
    }));
  assert.deepEqual(
    auditSourceHashes(snapshot.snapshot, { inventory: "physical" }),
    integrity.snapshotHashes,
  );
  const snapshotConfig = JSON.parse(
    readFileSync(path.join(snapshot.snapshot, "doctor.config.json"), "utf8"),
  );
  assert.equal(snapshotConfig.respectInlineDisables, false);
  assert.equal(snapshotConfig.adoptExistingLintConfig, false);
  assert.equal(snapshotConfig.noScore, true);
  assert.equal(snapshotConfig.share, false);
  assert.equal(snapshotConfig.supplyChain.enabled, false);
  assert.equal(
    snapshotConfig.rules["react-doctor/react-in-jsx-scope"],
    command.mode === "raw" ? "warn" : "off",
  );
  const scans = readJson(`${directory}/scans.json`);
  assert.deepEqual(
    scans.map((scan) => scan.target),
    REACT_DOCTOR_TARGETS,
  );
  const targets = [];
  for (const target of REACT_DOCTOR_TARGETS) {
    const basename = target.replaceAll("/", "-");
    const report = readJson(`${directory}/${basename}.json`);
    const parsed = parseReactDoctorReport(
      report,
      target,
      path.join(snapshot.snapshot, target),
    );
    assert.deepEqual(
      parsed,
      scans.find((scan) => scan.target === target),
    );
    assert.equal(
      readFileSync(path.resolve(root, `${directory}/${basename}.stderr.log`))
        .length,
      0,
    );
    targets.push({
      target,
      complete: parsed.complete,
      skippedChecks: parsed.skippedChecks,
      scannedFiles: parsed.scannedFileCount,
      diagnostics: parsed.diagnostics.length,
      errors: parsed.diagnostics.filter(
        (diagnostic) => diagnostic.severity === "error",
      ).length,
      stderrBytes: 0,
    });
  }
  const actualFiles = readdirSync(path.resolve(root, directory))
    .map((file) => `${directory}/${file}`)
    .sort();
  assert.deepEqual(
    actualFiles,
    Object.keys(preserved.hashes)
      .filter((file) => file.startsWith(`${directory}/`))
      .sort(),
  );
  modes.push({
    mode: command.mode,
    directory,
    targets,
    scans,
    snapshotFiles: Object.keys(integrity.snapshotHashes).length,
    retainedOriginalManifestHash: hash(
      JSON.stringify(integrity.originalHashes),
    ),
    currentSourceDrift,
    snapshotUnchanged: true,
  });
}
assert.equal(
  modes[0].retainedOriginalManifestHash,
  modes[1].retainedOriginalManifestHash,
);
assert.equal(
  existsSync(path.join(commands[0].outputDirectory, "actionable.json")),
  false,
);
const applicable = modes[0].scans.flatMap((scan) =>
  scan.diagnostics.map((diagnostic) => ({ target: scan.target, diagnostic })),
);
const identities = applicable.map((finding) =>
  findingIdentity(finding.target, finding.diagnostic),
);
assert.equal(new Set(identities).size, identities.length);
const rawApplicableIdentities = modes[1].scans.flatMap((scan) =>
  scan.diagnostics
    .filter((diagnostic) => diagnostic.rule !== "react-in-jsx-scope")
    .map((diagnostic) => findingIdentity(scan.target, diagnostic)),
);
assert.deepEqual(rawApplicableIdentities.sort(), [...identities].sort());
const currentByIdentity = new Map(
  applicable.map((finding) => [
    findingIdentity(finding.target, finding.diagnostic),
    finding,
  ]),
);
const validPriorRecords = ledger.exceptions.filter((record) => {
  const current = currentByIdentity.get(findingIdentity(record.target, record));
  if (!current) return false;
  try {
    return (
      sourceContextHash(root, record.target, current.diagnostic) ===
        record.sourceContextHash &&
      sourceFileHash(root, record.target, current.diagnostic) ===
        record.sourceFileHash &&
      Object.entries(record.evidenceFileHashes).every(
        ([file, expected]) => evidenceFileHash(root, file) === expected,
      )
    );
  } catch {
    return false;
  }
});
assert.equal(ledger.exceptions.length, 283);
assert.equal(validPriorRecords.length, 40);
assert.equal(proposal.rebindings.length, 24);
assert.equal(proposal.retirements.length, 41);
assert.equal(
  new Set(proposal.rebindings.map((entry) => entry.currentIdentity)).size,
  24,
);
const editedIndices = [...proposal.rebindings, ...proposal.retirements].map(
  (entry) => entry.ledgerIndex,
);
assert.equal(new Set(editedIndices).size, 65);
assert.equal(editedIndices.includes(11), false);
for (const entry of [...proposal.rebindings, ...proposal.retirements]) {
  const previous = ledger.exceptions[entry.ledgerIndex];
  assert.equal(
    findingIdentity(previous.target, previous),
    entry.previousIdentity,
  );
  assert.equal(hash(JSON.stringify(previous)), entry.previousRecordHash);
}
for (const entry of proposal.rebindings) {
  const record = entry.replacement;
  assert.equal(findingIdentity(record.target, record), entry.currentIdentity);
  assert.ok(currentByIdentity.has(entry.currentIdentity));
  assert.equal(
    path.posix.join(record.target, record.filePath),
    entry.location.file,
  );
  for (const location of ["line", "column", "offset", "length"])
    assert.equal(record[location], entry.location[location]);
  assert.equal(
    sourceContextHash(root, record.target, record),
    record.sourceContextHash,
  );
  assert.equal(
    sourceFileHash(root, record.target, record),
    record.sourceFileHash,
  );
  for (const [file, expected] of Object.entries(record.evidenceFileHashes))
    assert.equal(evidenceFileHash(root, file), expected, file);
  for (const [file, expected] of Object.entries(
    entry.contract.frameworkEvidenceHashes ?? {},
  ))
    assert.equal(hashFile(file), expected, file);
  assert.ok(
    record.reason.trim() &&
      record.reconsiderWhen.trim() &&
      record.evidence.length,
  );
}
for (const entry of proposal.retirements) {
  const previous = ledger.exceptions[entry.ledgerIndex];
  assert.equal(currentByIdentity.has(entry.previousIdentity), false);
  assert.equal(
    applicable.some(
      ({ target, diagnostic }) =>
        target === previous.target &&
        ["filePath", "plugin", "rule", "message", "severity"].every(
          (key) => diagnostic[key] === previous[key],
        ),
    ),
    false,
  );
  assert.equal(hashFile(entry.file), entry.sourceFileHash);
  for (const evidence of entry.currentEvidence)
    assert.equal(hashFile(evidence.file), evidence.currentHash, evidence.file);
}
assert.equal(adjudication.dispositions.length, 283);
assert.equal(
  new Set(adjudication.dispositions.map((entry) => entry.ledgerIndex)).size,
  283,
);
for (const entry of adjudication.dispositions)
  assert.equal(
    entry.previousIdentity,
    findingIdentity(
      ledger.exceptions[entry.ledgerIndex].target,
      ledger.exceptions[entry.ledgerIndex],
    ),
  );
assert.equal(
  adjudication.dispositions.filter(
    (entry) =>
      entry.disposition.startsWith("hold-") ||
      entry.disposition.startsWith("reject-"),
  ).length,
  178,
);
assert.equal(
  adjudication.dispositions.find((entry) => entry.ledgerIndex === 11)
    .disposition,
  "reject-mocked-consumer-rebinding",
);
for (const entry of adjudication.fullFileInspections) {
  assert.equal(hashFile(entry.file), entry.sha256, entry.file);
  assert.deepEqual(entry.parseErrors, []);
}
const validSubset = {
  ...ledger,
  exceptions: [
    ...validPriorRecords,
    ...proposal.rebindings.map((entry) => entry.replacement),
  ],
};
const hypotheticalSubsetReview = reviewReactDoctorFindings(
  modes[0].scans,
  validSubset,
  { root, configHash: hashFile("doctor.config.json") },
);
assert.equal(hypotheticalSubsetReview.actionable.length, 611);
const retiredIndices = new Set(
  proposal.retirements.map((entry) => entry.ledgerIndex),
);
const replacements = new Map(
  proposal.rebindings.map((entry) => [entry.ledgerIndex, entry.replacement]),
);
const proposedLedger = {
  ...ledger,
  exceptions: ledger.exceptions.flatMap((record, index) =>
    retiredIndices.has(index) ? [] : [replacements.get(index) ?? record],
  ),
};
let remainingCanonicalError = null;
try {
  reviewReactDoctorFindings(modes[0].scans, proposedLedger, {
    root,
    configHash: hashFile("doctor.config.json"),
  });
} catch (error) {
  remainingCanonicalError = error.message;
}
assert.ok(remainingCanonicalError);
const probes = readOwned("source-probes.json");
for (const [file, expected] of Object.entries(probes.sourceFileHashes))
  assert.equal(hashFile(file), expected, file);

const diff = readFileSync(path.resolve(root, diffPath), "utf8");
const diffSection = (file) =>
  diff
    .split(/^diff --git /m)
    .find(
      (section) =>
        section.startsWith(`a/${file} b/${file}\n`) ||
        section.startsWith(`a/${file} b/${file}\r\n`),
    );
const rootChanges = diffSection("package.json")
  .split(/\r?\n/)
  .filter((line) => /^[+-](?![+-])/.test(line));
assert.equal(rootChanges.length, 2);
assert.equal(
  rootChanges[0].slice(1).replace(" tests/e2e/teams-surface.spec.ts", ""),
  rootChanges[1].slice(1),
);
assert.equal(
  existsSync(path.resolve(root, "tests/e2e/teams-surface.spec.ts")),
  false,
);
assert.ok(
  manifest.files.some(
    (entry) =>
      entry.path === "tests/e2e/teams-surface.spec.ts" && entry.status === "D",
  ),
);
const uiChanges = diffSection("packages/ui/package.json")
  .split(/\r?\n/)
  .filter((line) => /^[+-](?![+-])/.test(line));
assert.equal(uiChanges.length, 2);
assert.ok(uiChanges.every((line) => line.startsWith("+")));
assert.deepEqual(
  uiChanges
    .map((line) => JSON.parse(`{${line.slice(1).trim().replace(/,$/, "")}}`))
    .flatMap((entry) => Object.keys(entry)),
  ["./components/reui/data-grid/*", "./components/data-grid-panel"],
);
const workerFiles = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];
assert.deepEqual(
  config.ignore.files.filter((file) => file.startsWith("public/")),
  workerFiles.map((file) => `public/maplibre/${file}`),
);
const uiRequire = createRequire(path.resolve(root, "packages/ui/package.json"));
const maplibrePackage = uiRequire.resolve("maplibre-gl/package.json");
const installedVersion = JSON.parse(
  readFileSync(maplibrePackage, "utf8"),
).version;
assert.equal(
  installedVersion,
  readJson("packages/ui/package.json").dependencies["maplibre-gl"],
);
const assets = [];
for (const app of ["admin", "donor"])
  for (const file of workerFiles) {
    const source = path.join(path.dirname(maplibrePackage), "dist", file);
    const copy = `apps/${app}/public/maplibre/${file}`;
    assert.equal(hashFile(copy), hashFile(source), copy);
    assets.push({
      app,
      source: path.relative(root, source).replaceAll("\\", "/"),
      copy,
      sourceHash: hashFile(source),
      copyHash: hashFile(copy),
      byteIdentical: true,
    });
  }
const ownerFiles = [
  "package.json",
  "packages/ui/package.json",
  "vitest.config.mts",
  "scripts/copy-maplibre-worker-assets.mjs",
  "apps/admin/next.config.ts",
  "apps/donor/next.config.ts",
  "doctor.config.json",
];
const owners = ownerFiles.map((file) => ({
  file,
  sha256: hashFile(file),
  frozenChange: manifest.files.find((entry) => entry.path === file) ?? null,
}));
assert.equal(
  owners.find((entry) => entry.file === "vitest.config.mts").frozenChange,
  null,
);
assert.equal(
  owners.find(
    (entry) => entry.file === "scripts/copy-maplibre-worker-assets.mjs",
  ).frozenChange,
  null,
);
const rootWorkerReview = {
  reviewedAt: new Date().toISOString(),
  owners,
  rootPackageChanges: rootChanges,
  uiPackageChanges: uiChanges,
  removedGateReference: "tests/e2e/teams-surface.spec.ts",
  removedTestAbsentInFrozenManifest: true,
  vitestWorkerSetting: {
    location: "vitest.config.mts:81",
    condition: "process.platform === 'win32'",
    maxWorkers: 4,
    changedInFrozenManifest: false,
  },
  maplibre: {
    installedVersion,
    guideVersionIsHistorical: "6.10.0",
    exactAuditExclusions: workerFiles.map((file) => `public/maplibre/${file}`),
    assets,
  },
  limits:
    "Static owner/diff and byte-identity inspection only. No worker execution, config import, copying, browser, build or production gate was run. Separately owned scripts/tests/tooling are not certified by the eight runtime target scans.",
};
const validationPassed =
  frozenMismatches.length === 0 &&
  modes.every((mode) => mode.currentSourceDrift.length === 0);
const verification = {
  command: `node ${relativeOutputRoot}/verify-review.mjs`,
  startedAt,
  endedAt: new Date().toISOString(),
  validationPassed,
  retainedAuditAndProposalChecksPassed: true,
  auditAcceptance: false,
  frozenManifestHash: hashFile(manifestPath),
  frozenDiffHash: hashFile(diffPath),
  frozenEntries: manifest.files.length,
  frozenMismatches,
  originalSourceFiles: Object.keys(originalHashes).length,
  originalAndSnapshotInventoriesUnchanged: validationPassed,
  retainedSnapshotsUnchanged: true,
  preservedAuditArtifacts: Object.keys(preserved.hashes).length,
  targetReviews: modes.map(({ scans, ...mode }) => mode),
  applicableIdentityParity: true,
  officialActionableJsonAbsent: true,
  exactPriorRecords: validPriorRecords.length,
  staleLedgerRecords: ledger.exceptions.length - validPriorRecords.length,
  proposedRebindings: proposal.rebindings.length,
  proposedRetirements: proposal.retirements.length,
  unresolvedStaleRecords: 178,
  unresolvedFrozenSnapshotDiagnostics:
    applicable.length - validPriorRecords.length,
  hypotheticalValidatedSubsetUnresolvedDiagnostics:
    hypotheticalSubsetReview.actionable.length,
  proposedLedgerStillFailsWith: remainingCanonicalError,
  inspectedSourceAndEvidenceFiles: adjudication.fullFileInspections.length,
  ledgerUnchanged: hashFile(ledgerPath) === proposal.expectedLedgerHash,
  configUnchanged:
    hashFile("doctor.config.json") === proposal.expectedConfigHash,
  limits:
    "Validates retained review evidence and exact proposal bindings. Current source drift invalidates a current-candidate audit claim. No ledger application, source reversion, new audit, product/test/config change, broad test, build, lint, browser or provider integration.",
};
writeOwned("root-worker-review.json", rootWorkerReview);
writeOwned("verification.json", verification);
console.log(
  JSON.stringify(
    {
      validationPassed,
      retainedAuditAndProposalChecksPassed: true,
      auditAcceptance: false,
      targetsPerMode: modes.map((mode) => mode.targets.length),
      frozenEntries: manifest.files.length,
      frozenMismatches,
      staleRecords: 243,
      proposedRebindings: 24,
      proposedRetirements: 41,
      unresolvedStaleRecords: 178,
      unresolvedFrozenSnapshotDiagnostics: 635,
      hypotheticalSubsetUnresolved: 611,
      proposedLedgerStillFailsWith: remainingCanonicalError,
    },
    null,
    2,
  ),
);
process.exitCode = validationPassed ? 0 : 1;
