import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const startedAt = new Date().toISOString();
const owned = dirname(fileURLToPath(import.meta.url));
const root = resolve(owned, "../../../../../../..");
const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const hash = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const baseline = read(join(owned, "input-baseline.json"));
const manifestSha256 =
  "27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0";
const diffSha256 =
  "8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b";
const bundleSha256 =
  "afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b";
const failures = [];
const invocations = [];
const focusedCases = [];
let artifactCount = 0;
let incrementalCount = 0;
let focusedInternalFreezeCount = 0;
const check = (passed, message) => {
  if (!passed) failures.push(message);
};
const sameKeys = (left, right) =>
  JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
const ownedPath = (directory, path) => {
  const result = resolve(directory, path);
  const within = relative(directory, result);
  if (within.startsWith("..") || /^[A-Za-z]:/.test(within))
    throw new Error("Evidence path escapes invocation");
  return result;
};

for (const [path, expected] of Object.entries(baseline))
  check(hash(join(root, path)) === expected, `Current input drift: ${path}`);
for (const entry of readdirSync(join(owned, "invocations"), {
  withFileTypes: true,
}).filter((entry) => entry.isDirectory())) {
  const directory = join(owned, "invocations", entry.name);
  const executionPath = join(directory, "execution.json");
  if (!existsSync(executionPath)) {
    failures.push(`Unfinished invocation: ${entry.name}`);
    continue;
  }
  const execution = read(executionPath);
  const before = read(join(directory, "before-freeze.json"));
  const after = read(join(directory, "after-freeze.json"));
  const fixturePath = join(directory, "fixture-proof.json");
  const fixture = read(fixturePath);
  for (const [label, proof] of [
    ["before", before],
    ["after", after],
  ]) {
    check(
      proof.exitCode === 0 &&
        proof.verification?.name === "round13r2" &&
        proof.verification.files === 1038 &&
        proof.verification.mismatches.length === 0 &&
        proof.verification.extra.length === 0 &&
        proof.manifestSha256 === manifestSha256 &&
        proof.diffSha256 === diffSha256,
      `${entry.name}: ${label} freeze identity`,
    );
    check(
      sameKeys(Object.keys(proof.inputs), Object.keys(baseline)) &&
        Object.entries(baseline).every(
          ([path, expected]) => proof.inputs[path] === expected,
        ),
      `${entry.name}: ${label} input baseline`,
    );
    check(
      proof.argv.at(-2) === "--verify" && proof.argv.at(-1) === "round13r2",
      `${entry.name}: ${label} verify command`,
    );
  }
  check(
    Date.parse(before.endedAt) <= Date.parse(execution.startedAt) &&
      Date.parse(after.startedAt) >= Date.parse(execution.endedAt),
    `${entry.name}: enclosing freeze interval`,
  );
  check(
    execution.cwd === root && fixture.repoRoot === root,
    `${entry.name}: r12 root`,
  );
  check(
    Date.parse(fixture.verifiedAt) >= Date.parse(execution.startedAt) &&
      Date.parse(fixture.verifiedAt) <= Date.parse(execution.endedAt),
    `${entry.name}: fixture freshness`,
  );
  check(
    fixture.typecheck === "passed" &&
      fixture.verification.includes("all 1645 checks passed") &&
      fixture.bundleSha256 === bundleSha256,
    `${entry.name}: fixture gates/hash`,
  );
  check(
    hash(fixturePath) === execution.fixtureProofSha256 &&
      hash(fixturePath) ===
        hash(join(directory, "artifacts/fixture-proof.json")),
    `${entry.name}: preserved proof bytes`,
  );
  check(
    hash(execution.command[1]) === execution.runnerSha256,
    `${entry.name}: runner source hash`,
  );
  if (execution.wrapperSha256)
    check(
      hash(join(directory, "wrapper-source.mjs")) === execution.wrapperSha256,
      `${entry.name}: saved wrapper source`,
    );
  check(
    execution.environmentOverride.CAPTURE_BASE_URL === "http://localhost:3031",
    `${entry.name}: base URL`,
  );
  const states = execution.command[1].endsWith("focused-acceptance.mjs")
    ? execution.expectedKeys
    : execution.command[4].split(",");
  check(states.length <= 4, `${entry.name}: bounded state batch`);
  check(
    sameKeys(
      execution.missingKeys,
      execution.expectedKeys.filter(
        (key) => !execution.observedKeys.includes(key),
      ),
    ) && execution.unexpectedKeys.length === 0,
    `${entry.name}: expected/observed key partition`,
  );
  for (const artifact of read(join(directory, "artifact-hashes.json"))) {
    const path = ownedPath(directory, artifact.path);
    check(
      statSync(path).size === artifact.bytes && hash(path) === artifact.sha256,
      `${entry.name}: artifact ${artifact.path}`,
    );
    if (artifact.width) {
      const bytes = readFileSync(path);
      check(
        bytes.readUInt32BE(16) === artifact.width &&
          bytes.readUInt32BE(20) === artifact.height,
        `${entry.name}: PNG dimensions ${artifact.path}`,
      );
    }
    artifactCount++;
  }
  const timeline = read(join(directory, "incremental-timeline.json"));
  check(
    timeline.length === execution.incrementalSnapshots && timeline.length > 0,
    `${entry.name}: incremental count`,
  );
  for (const snapshot of timeline) {
    const path = ownedPath(directory, snapshot.file);
    read(path);
    check(
      hash(path) === snapshot.sha256,
      `${entry.name}: incremental snapshot ${snapshot.file}`,
    );
    incrementalCount++;
  }
  const focusedPath = join(directory, "artifacts/results.json");
  if (existsSync(focusedPath)) {
    const results = read(focusedPath);
    for (const label of ["before", "after"]) {
      const proof = read(
        join(directory, `artifacts/${label}-internal-freeze.json`),
      );
      const parsed = JSON.parse(proof.stdout);
      check(
        proof.exitCode === 0 &&
          proof.manifestSha256 === manifestSha256 &&
          proof.diffSha256 === diffSha256 &&
          parsed.files === 1038 &&
          !parsed.mismatches.length &&
          !parsed.extra.length,
        `${entry.name}: focused internal ${label} freeze`,
      );
      focusedInternalFreezeCount++;
    }
    for (const [name, result] of Object.entries(results.cases)) {
      check(
        result.contextClosed === true && result.status === "observed",
        `${entry.name}: ${name} context/status`,
      );
      focusedCases.push({
        name,
        viewport: results.viewport,
        browserVersion: results.browserVersion,
        contextClosed: result.contextClosed,
        initial: {
          popupFocus: result.initial.active.isPopup,
          scrollTop: result.initial.scrollTop,
          maxScrollTop: result.initial.maxScrollTop,
          dialogWidth: result.initial.dialog.width,
          dialogHeight: result.initial.dialog.height,
          headerGapPx: result.initial.headerGapPx,
          summaryClearancePx: result.initial.summaryClearancePx,
          summaryOverlapPx: result.initial.summaryOverlapPx,
        },
        createdFixtureNotes: result.createdFixtureNotes ?? 0,
        moneyWriteCount: result.moneyWrites.length,
        unmockedBlockedCount: result.unmockedBlocked.length,
        fixtureMissing: result.fixtureMissing,
      });
    }
  }
  invocations.push({
    tag: entry.name,
    proofPath: relative(owned, fixturePath).replaceAll("\\", "/"),
    fixtureVerifiedAt: fixture.verifiedAt,
    fixtureProofSha256: hash(fixturePath),
    bundleSha256: fixture.bundleSha256,
    beforeFreezeExitCode: before.exitCode,
    afterFreezeExitCode: after.exitCode,
    runnerExitCode: execution.exitCode,
    runnerStartedAt: execution.startedAt,
    runnerEndedAt: execution.endedAt,
    timedOut: execution.timedOut,
    explicitProofCopyTimestamp: execution.fixtureProofCopiedAt ?? null,
    proofMtimeAfterRunnerEndMs:
      statSync(fixturePath).mtimeMs - Date.parse(execution.endedAt),
    expectedKeys: execution.expectedKeys,
    observedKeys: execution.observedKeys,
    missingKeys: execution.missingKeys,
    incrementalSnapshots: timeline.length,
  });
}
check(
  new Set(invocations.map((entry) => entry.proofPath)).size ===
    invocations.length,
  "Nonunique archived proof paths",
);
const chronological = [...invocations].sort(
  (left, right) =>
    Date.parse(left.runnerStartedAt) - Date.parse(right.runnerStartedAt),
);
for (let index = 1; index < chronological.length; index++)
  check(
    Date.parse(chronological[index].runnerStartedAt) >=
      Date.parse(chronological[index - 1].runnerEndedAt),
    `Overlapping owned runner invocations: ${chronological[index].tag}`,
  );
const audit = {
  startedAt,
  endedAt: new Date().toISOString(),
  root,
  command: [process.execPath, fileURLToPath(import.meta.url)],
  mode: "Offline artifact/provenance audit; no browser, API, preflight, source, or shared writer mutation",
  passed: failures.length === 0,
  failures,
  invocationCount: invocations.length,
  enclosingFreezeCount: invocations.length * 2,
  focusedInternalFreezeCount,
  artifactCount,
  incrementalCount,
  manifestSha256,
  diffSha256,
  bundleSha256,
  invocations,
  focusedCases,
};
writeFileSync(
  join(owned, "provenance-audit.json"),
  JSON.stringify(audit, null, 2) + "\n",
);
const pairs = read(join(owned, "pair-inventory.json"));
const lines = [
  "# Exact catalogue pair inventory",
  "",
  "This offline view does not promote provisional or wrong-state captures. All paths and hashes are retained in `pair-inventory.json`, `invocation-inventory.json`, and `evidence-hashes.json`.",
  "",
  "| Exact key | Raw capture artifacts | Capture completed | Check completed | Both | Intended setup | Gap / semantic limitation |",
  "| --- | --- | --- | --- | --- | --- | --- |",
];
for (const entry of pairs) {
  const gaps = [
    !entry.captureQualified
      ? entry.captureArtifactsRetained
        ? "Provisional capture: missing completion line"
        : "No capture artifacts"
      : "",
    !entry.checkQualified ? "Missing check" : "",
    ...entry.setupFailures,
  ].filter(Boolean);
  lines.push(
    `| \`${entry.key}\` | ${entry.captureArtifactsRetained ? "yes" : "no"} | ${entry.captureQualified ? "yes" : "no"} | ${entry.checkQualified ? "yes" : "no"} | ${entry.completePair ? "yes" : "no"} | ${entry.intendedSetupQualified ? "yes" : "no"} | ${gaps.join("; ").replaceAll("|", "\\|")} |`,
  );
}
writeFileSync(join(owned, "pair-inventory.md"), lines.join("\n") + "\n");
console.log(
  JSON.stringify(
    {
      passed: audit.passed,
      failures,
      invocationCount: invocations.length,
      enclosingFreezeCount: audit.enclosingFreezeCount,
      artifactCount,
      incrementalCount,
      focusedCases: focusedCases.length,
    },
    null,
    2,
  ),
);
process.exitCode = failures.length ? 1 : 0;
