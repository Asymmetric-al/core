import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  findingIdentity,
  sourceContextHash,
  sourceFileHash,
  evidenceFileHash,
  parseReactDoctorReport,
  reviewReactDoctorFindings,
} from "../../../../../../../scripts/react-doctor-ledger.mjs";
import { REACT_DOCTOR_TARGETS } from "../../../../../../../scripts/react-doctor-first-party.mjs";

const root = process.cwd();
const evidenceRoot = path.dirname(fileURLToPath(import.meta.url));
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const hashFile = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
const save = (name, value) =>
  writeFileSync(
    path.join(evidenceRoot, name),
    JSON.stringify(value, null, 2) + "\n",
  );
const manifestPath =
  "docs/qa/admin-workspaces-hillclimb/snapshots/round13-manifest.json";
const diffPath = "docs/qa/admin-workspaces-hillclimb/snapshots/round13.diff";
const ledgerPath = "docs/qa/react-doctor/exceptions.json";
const manifest = readJson(manifestPath);
const mismatches = manifest.files.flatMap((entry) => {
  const exists = existsSync(entry.path);
  if (entry.status === "D")
    return exists ? [{ ...entry, actual: "exists" }] : [];
  const actual = exists ? hashFile(entry.path) : "missing";
  return actual === entry.sha256 ? [] : [{ ...entry, actual }];
});
save("freeze-integrity.json", {
  verifiedAt: new Date().toISOString(),
  root,
  manifestPath,
  manifestHash: hashFile(manifestPath),
  diffPath,
  diffHash: hashFile(diffPath),
  expectedDiffHash: manifest.diffSha256,
  entries: manifest.files.length,
  mismatches,
  note: "Hashes verify all frozen entries. Concurrent review artifacts are outside this entry list; no claim of whole-tree extra-file absence is made.",
});
const auditDirectory = readdirSync(evidenceRoot).find(
  (name) =>
    name.startsWith("audit-") &&
    statSync(path.join(evidenceRoot, name)).isDirectory(),
);
const rawDirectory = readdirSync(evidenceRoot).find(
  (name) =>
    name.startsWith("raw-") &&
    statSync(path.join(evidenceRoot, name)).isDirectory(),
);
const modes = [];
for (const [mode, directory] of [
  ["audit", auditDirectory],
  ["raw", rawDirectory],
]) {
  const base = path.join(evidenceRoot, directory);
  const snapshot = readJson(path.join(base, "snapshot.json"));
  const summaries = [];
  const scans = [];
  for (const target of REACT_DOCTOR_TARGETS) {
    const prefix = target.replaceAll("/", "-");
    const file = path.join(base, `${prefix}.json`);
    const report = readJson(file);
    const scan = parseReactDoctorReport(
      report,
      target,
      path.join(snapshot.snapshot, target),
    );
    const stderr = readFileSync(
      path.join(base, `${prefix}.stderr.log`),
      "utf8",
    );
    const rules = {};
    for (const diagnostic of scan.diagnostics)
      rules[`${diagnostic.plugin}/${diagnostic.rule}`] =
        (rules[`${diagnostic.plugin}/${diagnostic.rule}`] ?? 0) + 1;
    scans.push(scan);
    summaries.push({
      target,
      version: report.version,
      complete: report.projects[0].complete,
      skippedChecks: scan.skippedChecks,
      scannedFileCount: scan.scannedFileCount,
      analyzedFileCount: scan.analyzedFiles.length,
      diagnostics: scan.diagnostics.length,
      errors: report.summary.errorCount,
      warnings: report.summary.warningCount,
      stderrBytes: Buffer.byteLength(stderr),
      stderr,
      rules,
    });
  }
  const integrity = readJson(path.join(base, "integrity.json"));
  const currentDrift = Object.entries(integrity.originalHashes).flatMap(
    ([file, hash]) =>
      !existsSync(file) || hashFile(file) !== hash ? [file] : [],
  );
  const snapshotDrift = Object.entries(integrity.snapshotHashes).flatMap(
    ([file, hash]) =>
      !existsSync(path.join(snapshot.snapshot, file)) ||
      hashFile(path.join(snapshot.snapshot, file)) !== hash
        ? [file]
        : [],
  );
  modes.push({
    mode,
    directory,
    snapshot,
    summaries,
    originalFiles: Object.keys(integrity.originalHashes).length,
    originalManifestHash: createHash("sha256")
      .update(JSON.stringify(integrity.originalHashes))
      .digest("hex"),
    verifiedAt: integrity.verifiedAt,
    currentDrift,
    snapshotDrift,
    officialActionablePresent: existsSync(path.join(base, "actionable.json")),
    scans,
  });
}
const ledger = readJson(ledgerPath);
const applicable = modes[0].scans.flatMap((scan) =>
  scan.diagnostics.map((diagnostic) => ({ target: scan.target, diagnostic })),
);
const hashIssues = (record, diagnostic) => {
  const issues = [];
  try {
    if (
      sourceFileHash(root, record.target, diagnostic) !== record.sourceFileHash
    )
      issues.push("sourceFileHash");
  } catch (error) {
    issues.push(error.message);
  }
  try {
    if (
      sourceContextHash(root, record.target, diagnostic) !==
      record.sourceContextHash
    )
      issues.push("sourceContextHash");
  } catch (error) {
    issues.push(error.message);
  }
  for (const [file, hash] of Object.entries(record.evidenceFileHashes)) {
    try {
      if (evidenceFileHash(root, file) !== hash)
        issues.push(`evidence:${file}`);
    } catch (error) {
      issues.push(error.message);
    }
  }
  return issues;
};
const ledgerReview = ledger.exceptions.map((record, index) => {
  const identity = findingIdentity(record.target, record);
  const exact = applicable.find(
    (entry) => findingIdentity(entry.target, entry.diagnostic) === identity,
  );
  const candidates = exact
    ? [exact]
    : applicable.filter(
        (entry) =>
          entry.target === record.target &&
          entry.diagnostic.filePath === record.filePath &&
          entry.diagnostic.rule === record.rule &&
          entry.diagnostic.plugin === record.plugin &&
          entry.diagnostic.message === record.message &&
          entry.diagnostic.severity === record.severity,
      );
  const issues = hashIssues(record, exact?.diagnostic ?? record);
  if (!exact) issues.unshift("identityAbsent");
  return {
    index,
    identity,
    record,
    issues,
    candidates: candidates.map((entry) => ({
      diagnostic: entry.diagnostic,
      identity: findingIdentity(entry.target, entry.diagnostic),
      sourceContextHash: sourceContextHash(
        root,
        entry.target,
        entry.diagnostic,
      ),
      sourceFileHash: sourceFileHash(root, entry.target, entry.diagnostic),
    })),
  };
});
const validIdentities = new Set(
  ledgerReview
    .filter((entry) => entry.issues.length === 0)
    .map((entry) => entry.identity),
);
const unresolved = applicable.filter(
  (entry) =>
    !validIdentities.has(findingIdentity(entry.target, entry.diagnostic)),
);
let canonicalError = null;
try {
  reviewReactDoctorFindings(modes[0].scans, ledger, {
    root,
    configHash: hashFile("doctor.config.json"),
  });
} catch (error) {
  canonicalError = error.message;
}
save("ledger-review.json", {
  ledgerPath,
  ledgerHash: hashFile(ledgerPath),
  configHash: hashFile("doctor.config.json"),
  ledgerEntries: ledgerReview.length,
  validEntries: validIdentities.size,
  staleEntries: ledgerReview.filter((entry) => entry.issues.length > 0).length,
  canonicalError,
  entries: ledgerReview,
});
save("actionable-review.json", {
  acceptance: false,
  officialActionableJsonMissing: !modes[0].officialActionablePresent,
  canonicalError,
  note: "Independent conservative inventory; not the runner's actionable.json and not an approved ledger. All findings lacking a currently exact, hash-valid record remain unresolved.",
  rawCount: applicable.length,
  currentlyValidExactExceptions: validIdentities.size,
  unresolvedCount: unresolved.length,
  unresolved,
});
const rawApplicable = modes[1].scans
  .flatMap((scan) =>
    scan.diagnostics
      .filter((diagnostic) => diagnostic.rule !== "react-in-jsx-scope")
      .map((diagnostic) => findingIdentity(scan.target, diagnostic)),
  )
  .sort();
const auditApplicable = applicable
  .map((entry) => findingIdentity(entry.target, entry.diagnostic))
  .sort();
save("scan-review.json", {
  reviewedAt: new Date().toISOString(),
  modes: modes.map(({ scans, ...mode }) => mode),
  auditRawApplicableIdentityParity:
    JSON.stringify(rawApplicable) === JSON.stringify(auditApplicable),
  sameOriginalManifest:
    modes[0].originalManifestHash === modes[1].originalManifestHash,
});
console.log(
  JSON.stringify(
    {
      frozenEntries: manifest.files.length,
      freezeMismatches: mismatches.length,
      totalApplicable: applicable.length,
      validExactExceptions: validIdentities.size,
      staleLedgerEntries: ledgerReview.length - validIdentities.size,
      unresolved: unresolved.length,
      canonicalError,
      modes: modes.map((mode) => ({
        mode: mode.mode,
        completeTargets: mode.summaries.length,
        diagnostics: mode.scans.reduce(
          (total, scan) => total + scan.diagnostics.length,
          0,
        ),
        currentDrift: mode.currentDrift.length,
        snapshotDrift: mode.snapshotDrift.length,
      })),
    },
    null,
    2,
  ),
);
