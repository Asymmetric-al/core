import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = realpathSync(process.cwd());
const evidence = path.dirname(fileURLToPath(import.meta.url));
if (
  root !== "C:\\Users\\Conrad\\.t3\\worktrees\\core\\t3-5a24111d-r12" ||
  path.dirname(evidence) !==
    path.join(
      root,
      "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor",
    )
)
  throw new Error("Wrong audit checkout.");
const { auditSourceHashes } = await import(
  pathToFileURL(path.join(root, "scripts/react-doctor-audit.mjs")).href
);
const {
  findingIdentity,
  evidenceFileHash,
  sourceFileHash,
  sourceContextHash,
  reviewReactDoctorFindings,
  parseReactDoctorReport,
} = await import(
  pathToFileURL(path.join(root, "scripts/react-doctor-ledger.mjs")).href
);
const { REACT_DOCTOR_TARGETS } = await import(
  pathToFileURL(path.join(root, "scripts/react-doctor-first-party.mjs")).href
);
const readJson = (filename) => JSON.parse(readFileSync(filename, "utf8"));
const digest = (value) => createHash("sha256").update(value).digest("hex");
const json = (name, value) =>
  writeFileSync(
    path.join(evidence, name),
    JSON.stringify(value, null, 2) + "\n",
    { flag: "wx" },
  );
const baseline = readJson(path.join(evidence, "binding-before.json"));
const scope = readJson(path.join(evidence, "scope-and-declaration.json"));
const failures = [];
const requireCondition = (condition, message) => {
  if (!condition) failures.push(message);
};
const difference = (expected, actual) => ({
  missing: Object.keys(expected).filter((key) => !(key in actual)),
  added: Object.keys(actual).filter((key) => !(key in expected)),
  changed: Object.keys(expected).filter(
    (key) => key in actual && expected[key] !== actual[key],
  ),
});
const hasDifferences = (value) =>
  value.missing.length || value.added.length || value.changed.length;
const helper =
  "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/refreeze/read-binding.mjs";
function checkBinding(label) {
  const result = spawnSync(process.execPath, [helper], {
    cwd: root,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  });
  for (const stream of ["stdout", "stderr"])
    writeFileSync(
      path.join(evidence, `${label}.${stream}.log`),
      result[stream] ?? "",
      { flag: "wx" },
    );
  const live = result.status === 0 ? JSON.parse(result.stdout) : null;
  json(`${label}.json`, {
    exitCode: result.status,
    signal: result.signal,
    error: result.error?.message ?? null,
    checkedAt: new Date().toISOString(),
    matchesBaseline:
      live !== null && JSON.stringify(live) === JSON.stringify(baseline),
    binding: live,
  });
  requireCondition(
    live !== null && JSON.stringify(live) === JSON.stringify(baseline),
    `${label}: binding drift or helper failure`,
  );
}
checkBinding("validation-binding-before");
for (const [relative, expected] of Object.entries(scope.operatorControls))
  requireCondition(
    digest(readFileSync(path.join(root, relative))) === expected,
    `Operator control changed: ${relative}`,
  );
const actualOriginal = auditSourceHashes(root);
requireCondition(
  digest(JSON.stringify(actualOriginal)) === baseline.sourceInventorySha256,
  "Live whole-source inventory differs from declared digest",
);
const manifest = readJson(path.join(root, baseline.manifestPath));
requireCondition(
  manifest.files.length === 1038 &&
    new Set(manifest.files.map((entry) => entry.path)).size === 1038,
  "Freeze entry inventory invalid",
);
requireCondition(
  digest(readFileSync(path.join(root, baseline.manifestPath))) ===
    baseline.manifestSha256,
  "Manifest digest mismatch",
);
requireCondition(
  digest(readFileSync(path.join(root, baseline.diffPath))) ===
    baseline.diffSha256,
  "Diff digest mismatch",
);
const ledgerPath = "docs/qa/react-doctor/exceptions.json";
const ledger = readJson(path.join(root, ledgerPath));
const config = readJson(path.join(root, "doctor.config.json"));
const configHash = digest(readFileSync(path.join(root, "doctor.config.json")));
const modes = {};
for (const mode of ["strict", "raw"]) {
  const output = path.join(evidence, mode);
  const command = readJson(path.join(evidence, `${mode}.command.json`));
  const snapshot = readJson(path.join(output, "snapshot.json"));
  const integrity = readJson(path.join(output, "integrity.json"));
  const savedScans = readJson(path.join(output, "scans.json"));
  requireCondition(
    command.timedOut === false &&
      command.spawnError === null &&
      command.signal === null,
    `${mode}: timeout, spawn error, or signal`,
  );
  requireCondition(
    command.exitCode === (mode === "strict" ? 1 : 0),
    `${mode}: unexpected exit code ${command.exitCode}`,
  );
  requireCondition(
    realpathSync(snapshot.original) === root,
    `${mode}: wrong original root`,
  );
  requireCondition(
    !realpathSync(snapshot.snapshot).startsWith(root + path.sep),
    `${mode}: snapshot is inside original checkout`,
  );
  requireCondition(
    digest(JSON.stringify(integrity.originalHashes)) ===
      baseline.sourceInventorySha256,
    `${mode}: scanner inventoried different source`,
  );
  const originalDrift = difference(integrity.originalHashes, actualOriginal);
  const actualSnapshot = auditSourceHashes(snapshot.snapshot, {
    inventory: "physical",
  });
  const snapshotDrift = difference(integrity.snapshotHashes, actualSnapshot);
  const copiedSourceDrift = difference(actualOriginal, actualSnapshot);
  requireCondition(
    !hasDifferences(originalDrift),
    `${mode}: live source changed`,
  );
  requireCondition(
    !hasDifferences(snapshotDrift),
    `${mode}: physical snapshot changed`,
  );
  requireCondition(
    copiedSourceDrift.missing.length === 0 &&
      copiedSourceDrift.added.length === 0 &&
      copiedSourceDrift.changed.every(
        (relative) => relative === "doctor.config.json",
      ),
    `${mode}: unexpected copy normalization`,
  );
  const expectedConfig = {
    ...config,
    respectInlineDisables: false,
    adoptExistingLintConfig: false,
    noScore: true,
    share: false,
    supplyChain: { enabled: false },
    rules: { ...config.rules },
  };
  if (mode === "raw")
    expectedConfig.rules["react-doctor/react-in-jsx-scope"] = "warn";
  const expectedConfigBytes = JSON.stringify(expectedConfig, null, 2) + "\n";
  requireCondition(
    readFileSync(path.join(snapshot.snapshot, "doctor.config.json"), "utf8") ===
      expectedConfigBytes,
    `${mode}: snapshot config not exactly declared normalization`,
  );
  const scans = [];
  const targetReports = [];
  for (const target of REACT_DOCTOR_TARGETS) {
    const prefix = target.replaceAll("/", "-");
    const report = readJson(path.join(output, `${prefix}.json`));
    const stderr = readFileSync(path.join(output, `${prefix}.stderr.log`));
    const parsed = parseReactDoctorReport(
      report,
      target,
      path.join(snapshot.snapshot, target),
    );
    scans.push(parsed);
    const analyzed = new Set(parsed.analyzedFiles);
    const inventoryCandidates = Object.keys(actualOriginal)
      .filter(
        (relative) =>
          relative.startsWith(target + "/") &&
          /\.(?:[cm]?js|jsx|tsx?)$/.test(relative),
      )
      .map((relative) => relative.slice(target.length + 1));
    const omitted = inventoryCandidates
      .filter((relative) => !analyzed.has(relative))
      .map((relative) => ({
        path: `${target}/${relative}`,
        reason: relative.startsWith("scripts/")
          ? "Existing scripts/** exclusion; operational source outside runtime scan"
          : relative.startsWith("supabase/")
            ? "Existing supabase/** exclusion also omits package-local runtime adapters; not scanner-certified"
            : "UNEXPLAINED",
      }));
    const absentAnalyzed = [...analyzed].filter(
      (relative) => !Object.hasOwn(actualOriginal, `${target}/${relative}`),
    );
    const errorCount = parsed.diagnostics.filter(
      (item) => item.severity === "error",
    ).length;
    requireCondition(
      omitted.every((item) => item.reason !== "UNEXPLAINED") &&
        absentAnalyzed.length === 0,
      `${mode}/${target}: unexplained coverage discrepancy`,
    );
    requireCondition(
      stderr.length === 0,
      `${mode}/${target}: nonempty scanner stderr needs review`,
    );
    requireCondition(
      parsed.scannedFileCount === analyzed.size &&
        report.projects[0].project.sourceFileCount === analyzed.size,
      `${mode}/${target}: file count mismatch`,
    );
    for (const diagnostic of parsed.diagnostics)
      requireCondition(
        diagnostic.filePath === "package.json" ||
          analyzed.has(diagnostic.filePath),
        `${mode}/${target}: diagnostic outside analyzed source inventory`,
      );
    targetReports.push({
      target,
      diagnosticCount: parsed.diagnostics.length,
      errors: errorCount,
      warnings: parsed.diagnostics.length - errorCount,
      scannedFileCount: parsed.scannedFileCount,
      analyzedFileCount: analyzed.size,
      candidateSourceCount: inventoryCandidates.length,
      omitted,
      absentAnalyzed,
      stderrBytes: stderr.length,
      complete: true,
      skippedChecks: parsed.skippedChecks,
      sourceFilterConfigHash: parsed.sourceFilterConfigHash,
      protocolValidated: true,
    });
  }
  requireCondition(
    JSON.stringify(savedScans) === JSON.stringify(scans),
    `${mode}: scans.json disagrees with target reports`,
  );
  const seen = new Set();
  const findings = scans.flatMap((scan) =>
    scan.diagnostics.map((diagnostic) => ({
      target: scan.target,
      identity: findingIdentity(scan.target, diagnostic),
      diagnostic,
    })),
  );
  for (const finding of findings) {
    requireCondition(
      !seen.has(finding.identity),
      `${mode}: duplicate diagnostic identity`,
    );
    seen.add(finding.identity);
  }
  modes[mode] = {
    command,
    snapshot,
    integrity: {
      originalFileCount: Object.keys(actualOriginal).length,
      originalDigest: digest(JSON.stringify(integrity.originalHashes)),
      snapshotFileCount: Object.keys(actualSnapshot).length,
      snapshotDigest: digest(JSON.stringify(actualSnapshot)),
      originalDrift,
      snapshotDrift,
      copyNormalization: copiedSourceDrift,
    },
    targetReports,
    scans,
    findings,
    officialActionableExists: existsSync(path.join(output, "actionable.json")),
  };
}
const classicRule = "react-doctor/react-in-jsx-scope";
const rawApplicable = modes.raw.findings.filter(
  (finding) =>
    `${finding.diagnostic.plugin}/${finding.diagnostic.rule}` !== classicRule,
);
const rawClassic = modes.raw.findings.filter(
  (finding) =>
    `${finding.diagnostic.plugin}/${finding.diagnostic.rule}` === classicRule,
);
const identities = (findings) =>
  findings.map((finding) => finding.identity).sort();
requireCondition(
  JSON.stringify(identities(modes.strict.findings)) ===
    JSON.stringify(identities(rawApplicable)),
  "Strict/raw exact applicable identity parity failed",
);
for (const target of REACT_DOCTOR_TARGETS) {
  const strict = modes.strict.scans.find((scan) => scan.target === target);
  const raw = modes.raw.scans.find((scan) => scan.target === target);
  requireCondition(
    JSON.stringify(strict.analyzedFiles) ===
      JSON.stringify(raw.analyzedFiles) &&
      strict.sourceFilterConfigHash === raw.sourceFilterConfigHash,
    `${target}: raw/strict source-filter coverage differs`,
  );
}
let wholeLedgerFailure = null;
try {
  reviewReactDoctorFindings(modes.strict.scans, ledger, { root, configHash });
} catch (error) {
  wholeLedgerFailure = error.message;
}
const allReviewed = reviewReactDoctorFindings(
  modes.strict.scans,
  { ...ledger, exceptions: [] },
  { root, configHash },
);
requireCondition(
  allReviewed.actionable.length === modes.strict.findings.length,
  "Unadjudicated finding census failed",
);
const weakIdentity = (target, diagnostic) =>
  JSON.stringify([
    target,
    diagnostic.filePath,
    diagnostic.plugin,
    diagnostic.rule,
    diagnostic.message,
    diagnostic.severity,
  ]);
const diagnosticMap = new Map(
  modes.strict.findings.map((finding) => [finding.identity, finding]),
);
const weakGroups = new Map();
for (const finding of modes.strict.findings) {
  const key = weakIdentity(finding.target, finding.diagnostic);
  if (!weakGroups.has(key)) weakGroups.set(key, []);
  weakGroups.get(key).push(finding);
}
const recordCounts = new Map();
for (const record of ledger.exceptions) {
  const key = findingIdentity(record.target, record);
  recordCounts.set(key, (recordCounts.get(key) ?? 0) + 1);
}
const recordReviews = ledger.exceptions.map((record, ledgerIndex) => {
  const identity = findingIdentity(record.target, record);
  const exact = diagnosticMap.get(identity);
  const candidates = weakGroups.get(weakIdentity(record.target, record)) ?? [];
  const evidenceMismatches = [];
  for (const [relative, expected] of Object.entries(
    record.evidenceFileHashes ?? {},
  )) {
    let actual = null;
    let error = null;
    try {
      actual = evidenceFileHash(root, relative);
    } catch (caught) {
      error = caught.message;
    }
    if (actual !== expected)
      evidenceMismatches.push({ path: relative, expected, actual, error });
  }
  let actualSourceHash = null;
  let actualContextHash = null;
  let hashError = null;
  try {
    actualSourceHash = sourceFileHash(root, record.target, record);
    actualContextHash = sourceContextHash(root, record.target, record);
  } catch (error) {
    hashError = error.message;
  }
  let mechanicalFailure = null;
  try {
    reviewReactDoctorFindings(
      modes.strict.scans,
      { ...ledger, exceptions: [record] },
      { root, configHash },
    );
  } catch (error) {
    mechanicalFailure = error.message;
  }
  const mechanicallyValid =
    mechanicalFailure === null && recordCounts.get(identity) === 1;
  return {
    ledgerIndex,
    previousIdentity: identity,
    previousRecordHash: digest(JSON.stringify(record)),
    file: `${record.target}/${record.filePath}`,
    oldLine: record.line,
    rule: `${record.plugin}/${record.rule}`,
    severity: record.severity,
    mechanicallyValid,
    mechanicalFailure,
    duplicateRecordIdentity: recordCounts.get(identity) !== 1,
    exactFreshIdentity: Boolean(exact),
    evidenceMismatches,
    sourceHashChanged: actualSourceHash !== record.sourceFileHash,
    contextHashChanged: actualContextHash !== record.sourceContextHash,
    hashError,
    actualSourceHash,
    actualContextHash,
    candidates: candidates.map((finding) => ({
      identity: finding.identity,
      diagnostic: finding.diagnostic,
    })),
    disposition: mechanicallyValid
      ? "mechanically-exact-prior-record-not-new-semantic-approval"
      : candidates.length === 0
        ? "absent-historical-identity-review-retirement-only"
        : candidates.length === 1
          ? "requires-individual-contract-and-binding-review"
          : "ambiguous-hold",
  };
});
const validIdentities = new Set(
  recordReviews
    .filter((review) => review.mechanicallyValid)
    .map((review) => review.previousIdentity),
);
const unresolved = modes.strict.findings.filter(
  (finding) => !validIdentities.has(finding.identity),
);
const group = (findings, key) =>
  Object.entries(
    findings.reduce((counts, finding) => {
      const value = key(finding);
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort(
      (first, second) =>
        second.count - first.count || first.name.localeCompare(second.name),
    );
const reviewSummary = {
  ledgerRecords: recordReviews.length,
  wholeLedgerValid: wholeLedgerFailure === null,
  wholeLedgerFailure,
  mechanicallyExactPriorRecords: validIdentities.size,
  staleOrUnusedRecords: recordReviews.filter(
    (review) => !review.mechanicallyValid,
  ).length,
  absentCandidateRecords: recordReviews.filter(
    (review) => review.candidates.length === 0,
  ).length,
  ambiguousCandidateRecords: recordReviews.filter(
    (review) => review.candidates.length > 1,
  ).length,
  applicableDiagnostics: modes.strict.findings.length,
  freshUnresolvedAfterMechanicallyExactPriorSubset: unresolved.length,
  unresolvedErrors: unresolved.filter(
    (finding) => finding.diagnostic.severity === "error",
  ).length,
  disclaimer:
    "Mechanical subset accounting only. Not official actionable.json, no ledger changes or new approvals, no combined-ledger acceptance.",
};
json("ledger-review.json", { ...reviewSummary, records: recordReviews });
json("fresh-diagnostics.json", {
  status: "unadjudicated-complete-inventory-not-official-actionable",
  findings: modes.strict.findings,
});
json("unresolved-review.json", {
  status: "independent-analysis-not-official-actionable",
  ...reviewSummary,
  findings: unresolved,
});
json("triage.json", {
  summary: reviewSummary,
  allByRule: group(
    modes.strict.findings,
    (finding) => `${finding.diagnostic.plugin}/${finding.diagnostic.rule}`,
  ),
  unresolvedByRule: group(
    unresolved,
    (finding) => `${finding.diagnostic.plugin}/${finding.diagnostic.rule}`,
  ),
  unresolvedByTarget: group(unresolved, (finding) => finding.target),
  unresolvedByFile: group(
    unresolved,
    (finding) => `${finding.target}/${finding.diagnostic.filePath}`,
  ),
  unresolvedByCategory: group(
    unresolved,
    (finding) => finding.diagnostic.category,
  ),
  errors: modes.strict.findings
    .filter((finding) => finding.diagnostic.severity === "error")
    .map((finding) => ({
      ...finding,
      coveredByMechanicallyExactPriorRecord: validIdentities.has(
        finding.identity,
      ),
    })),
});
checkBinding("validation-binding-after");
const validation = {
  checkedAt: new Date().toISOString(),
  declared: baseline,
  failures,
  artifactsValid: failures.length === 0,
  strictPassed: false,
  wholeLedgerFailure,
  rawClassicDiagnosticCount: rawClassic.length,
  applicableExactIdentityParity:
    JSON.stringify(identities(modes.strict.findings)) ===
    JSON.stringify(identities(rawApplicable)),
  ledger: reviewSummary,
  modes: Object.fromEntries(
    Object.entries(modes).map(([mode, value]) => [
      mode,
      {
        command: value.command,
        snapshot: value.snapshot,
        integrity: value.integrity,
        targetReports: value.targetReports,
        diagnosticCount: value.findings.length,
        officialActionableExists: value.officialActionableExists,
      },
    ]),
  ),
};
json("validation.json", validation);
const evidenceFiles = [];
function indexDirectory(directory, prefix = "") {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) indexDirectory(absolute, relative + "/");
    else if (entry.isFile())
      evidenceFiles.push({
        path: relative,
        bytes: statSync(absolute).size,
        sha256: digest(readFileSync(absolute)),
      });
    else throw new Error("Unexpected evidence symlink.");
  }
}
indexDirectory(evidence);
json("evidence-index-initial.json", {
  generatedAt: new Date().toISOString(),
  excludesSelf: true,
  files: evidenceFiles.sort((first, second) =>
    first.path.localeCompare(second.path),
  ),
});
console.log(
  JSON.stringify(
    {
      artifactsValid: validation.artifactsValid,
      failures,
      strictExit: modes.strict.command.exitCode,
      rawExit: modes.raw.command.exitCode,
      rawCount: modes.raw.findings.length,
      rawClassic: rawClassic.length,
      ...reviewSummary,
      targets: validation.modes.strict.targetReports.map(
        ({ target, diagnosticCount, errors, analyzedFileCount }) => ({
          target,
          diagnosticCount,
          errors,
          analyzedFileCount,
        }),
      ),
    },
    null,
    2,
  ),
);
process.exitCode = failures.length ? 2 : 0;
