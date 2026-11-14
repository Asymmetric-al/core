import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const owned = dirname(fileURLToPath(import.meta.url));
const root = resolve(owned, "../../../../../../..");
const qa = join(root, "docs/qa/admin-workspaces-hillclimb");
const planPath = join(
  qa,
  "review/round13/runtime/refreeze/bounded-batch-plan.json",
);
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const { createStates } = await import(
  pathToFileURL(join(qa, "workspace-states.mjs"))
);
const catalogue = createStates({});
const [area, batchText, phase] = process.argv.slice(2);
const [batchNumber, selectedState] = batchText?.split(".") ?? [];
const batchIndex = Number(batchNumber) - 1;
if (!["crm", "contributions", "focused"].includes(area))
  throw new Error("Invalid owned area");
if (!["capture", "check", "focused"].includes(phase))
  throw new Error("Invalid phase");
const plannedStates = plan.areas[area]?.batches[batchIndex];
const states =
  area === "focused"
    ? [batchText]
    : selectedState
      ? plannedStates?.filter((state) => state === selectedState)
      : plannedStates;
if (!states?.length || states.length > 4)
  throw new Error("Invalid bounded batch");
const tag = `${area}-${String(batchText).padStart(2, "0")}-${phase}`;
const budgetPath = join(owned, "run-budget.json");
if (!existsSync(budgetPath)) {
  const priorStarts = readdirSync(join(owned, "invocations"), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const path = join(
        owned,
        "invocations",
        entry.name,
        "execution-start.json",
      );
      return existsSync(path)
        ? [Date.parse(JSON.parse(readFileSync(path, "utf8")).startedAt)]
        : [];
    });
  const anchor = Math.min(Date.now(), ...priorStarts);
  writeFileSync(
    budgetPath,
    JSON.stringify(
      {
        anchor: new Date(anchor).toISOString(),
        deadline: new Date(anchor + 8 * 60 * 60 * 1000).toISOString(),
        basis:
          "Eight-hour envelope anchored to the earliest owned runner start, never restarted",
      },
      null,
      2,
    ) + "\n",
    { flag: "wx" },
  );
}
const budget = JSON.parse(readFileSync(budgetPath, "utf8"));
if (Date.now() >= Date.parse(budget.deadline))
  throw new Error("Owned run deadline reached; no further runner launched");
const invocation = join(owned, "invocations", tag);
if (existsSync(invocation))
  throw new Error(`Refusing to replace ${invocation}`);
mkdirSync(invocation, { recursive: true });
const output = join(invocation, "artifacts");
mkdirSync(output);
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const hashFile = (path) => sha(readFileSync(path));
const write = (name, value) =>
  writeFileSync(join(invocation, name), JSON.stringify(value, null, 2) + "\n");
const filesUnder = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
const inputFiles = [
  ...readdirSync(qa)
    .filter((name) => name.endsWith(".mjs"))
    .map((name) => join(qa, name)),
  ...filesUnder(join(qa, "fixtures")).filter((path) =>
    /\.(?:ts|mjs|json)$/.test(path),
  ),
  planPath,
].sort();
const inputHashes = () =>
  Object.fromEntries(
    inputFiles.map((path) => [
      relative(root, path).replaceAll("\\", "/"),
      hashFile(path),
    ]),
  );
const baselinePath = join(owned, "input-baseline.json");
if (!existsSync(baselinePath))
  writeFileSync(baselinePath, JSON.stringify(inputHashes(), null, 2) + "\n", {
    flag: "wx",
  });
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const manifestPath = join(qa, "snapshots/round13r2-manifest.json");
const diffPath = join(qa, "snapshots/round13r2.diff");
function freeze(label) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(
    process.execPath,
    [join(qa, "freeze-checkpoint.mjs"), "--verify", "round13r2"],
    {
      cwd: root,
      encoding: "utf8",
      timeout: 60000,
      windowsHide: true,
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  writeFileSync(
    join(invocation, `${label}-freeze.log`),
    (result.stdout ?? "") + (result.stderr ?? ""),
  );
  let verification = null;
  try {
    verification = JSON.parse(result.stdout);
  } catch {}
  const inputs = inputHashes();
  const inputMismatches = Object.keys({ ...baseline, ...inputs }).filter(
    (key) => baseline[key] !== inputs[key],
  );
  const manifestSha256 = hashFile(manifestPath);
  const diffSha256 = hashFile(diffPath);
  const ok =
    result.status === 0 &&
    verification?.files === 1038 &&
    !verification.mismatches.length &&
    !verification.extra.length &&
    manifestSha256 ===
      "27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0" &&
    diffSha256 ===
      "8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b" &&
    !inputMismatches.length;
  const proof = {
    startedAt,
    endedAt: new Date().toISOString(),
    argv: [
      process.execPath,
      join(qa, "freeze-checkpoint.mjs"),
      "--verify",
      "round13r2",
    ],
    exitCode: result.status,
    signal: result.signal,
    error: result.error?.message ?? null,
    verification,
    manifestSha256,
    diffSha256,
    inputs,
    inputMismatches,
    ok,
  };
  write(`${label}-freeze.json`, proof);
  return proof;
}
const [focusedKind, focusedWidth] =
  area === "focused" ? batchText.split("-") : [];
const expectedKeys =
  area === "focused"
    ? focusedKind === "note"
      ? [`note-${focusedWidth}`]
      : [
          `${focusedKind}-delayed-${focusedWidth}`,
          `${focusedKind}-cached-${focusedWidth}`,
        ]
    : states.flatMap((state) =>
        plan.areas[area].states
          .find((entry) => entry.name === state)
          .widths.map((width) => `${state}--${width}`),
      );
const expectedPngs =
  phase === "focused"
    ? expectedKeys.flatMap((key) => [
        `${key}-initial.png`,
        `${key}-middle.png`,
        `${key}-bottom.png`,
        ...(key.includes("-delayed-") ? [`${key}-loading.png`] : []),
        ...(focusedKind === "correction"
          ? [
              `${key}-menu-1.png`,
              `${key}-keyboard-resize.png`,
              ...(key.includes("-cached-") ? [`${key}-menu-2.png`] : []),
            ]
          : []),
      ])
    : phase !== "capture"
      ? []
      : expectedKeys.flatMap((key) => {
          const [state] = key.split("--");
          return catalogue.find((entry) => entry.name === state)?.full
            ? [`${key}.png`, `${key}-full.png`]
            : [`${key}.png`];
        });
const before = freeze("before");
if (!before.ok) {
  write("execution.json", {
    tag,
    skipped: true,
    reason: "Frozen candidate/input mismatch before invocation",
    expectedKeys,
    before,
  });
  process.exit(3);
}
const runner =
  phase === "focused"
    ? join(owned, "focused-acceptance.mjs")
    : join(qa, `${phase}-workspaces.mjs`);
const argv =
  phase === "focused"
    ? [runner, output, batchText]
    : [runner, output, area, states.join(",")];
const startedAt = new Date().toISOString();
const started = Date.now();
const limitMs = Math.min(
  phase === "focused" ? 240000 : 300000,
  Date.parse(budget.deadline) - Date.now(),
);
if (limitMs <= 0)
  throw new Error(
    "Owned run deadline reached after before-freeze; no runner launched",
  );
const environmentOverride = {
  CAPTURE_BASE_URL: "http://localhost:3031",
  PROGRAMFILES: "C:/Program Files",
  "PROGRAMFILES(X86)": "C:/Program Files (x86)",
  LOCALAPPDATA: process.env.LOCALAPPDATA ?? "C:/Users/Conrad/AppData/Local",
};
const execution = {
  tag,
  cwd: root,
  command: [process.execPath, ...argv],
  runnerSha256: hashFile(runner),
  wrapperSha256: hashFile(fileURLToPath(import.meta.url)),
  startedAt,
  limitMs,
  globalBudget: budget,
  environmentOverride,
  expectedKeys,
  expectedPngs,
};
writeFileSync(
  join(invocation, "wrapper-source.mjs"),
  readFileSync(fileURLToPath(import.meta.url)),
);
write("execution-start.json", execution);
console.log(
  `START ${tag} ${startedAt}; limit ${limitMs / 1000}s; ${expectedKeys.length} expected pairs`,
);
let timedOut = false;
let lastIncrementalHash = null;
const timeline = [];
const metricsName =
  phase === "capture"
    ? "page-metrics.json"
    : phase === "check"
      ? "workspace-checks.json"
      : "results.json";
function incremental() {
  const path = join(output, metricsName);
  if (!existsSync(path)) return;
  const bytes = readFileSync(path);
  const hash = sha(bytes);
  if (hash === lastIncrementalHash) return;
  lastIncrementalHash = hash;
  const name = `incremental-${String(timeline.length + 1).padStart(3, "0")}.json`;
  writeFileSync(join(invocation, name), bytes);
  timeline.push({ at: new Date().toISOString(), file: name, sha256: hash });
  write("incremental-timeline.json", timeline);
}
const child = spawn(process.execPath, argv, {
  cwd: root,
  env: { ...process.env, ...environmentOverride },
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
});
const logChunks = [];
for (const [streamName, stream] of [
  ["stdout", child.stdout],
  ["stderr", child.stderr],
])
  stream.on("data", (chunk) => {
    logChunks.push(chunk.toString());
    writeFileSync(join(invocation, "runner.log"), logChunks.join(""));
    process[streamName].write(chunk);
    incremental();
  });
const timer = setTimeout(() => {
  timedOut = true;
  console.error(
    `TIME LIMIT ${tag}; stopping only owned runner PID ${child.pid}`,
  );
  const kill = spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
    encoding: "utf8",
    windowsHide: true,
  });
  write("timeout-cleanup.json", {
    pid: child.pid,
    status: kill.status,
    stdout: kill.stdout,
    stderr: kill.stderr,
  });
}, limitMs);
const polling = setInterval(incremental, 1000);
const outcome = await new Promise((resolveOutcome) => {
  child.on("error", (error) =>
    resolveOutcome({ exitCode: null, signal: null, error: error.message }),
  );
  child.on("close", (exitCode, signal) =>
    resolveOutcome({ exitCode, signal, error: null }),
  );
});
const endedAt = new Date().toISOString();
clearTimeout(timer);
clearInterval(polling);
const proofPath = join(output, "fixture-proof.json");
let fixtureProof = null;
let fixtureProofCopiedAt = null;
if (existsSync(proofPath)) {
  const proofBytes = readFileSync(proofPath);
  writeFileSync(join(invocation, "fixture-proof.json"), proofBytes, {
    flag: "wx",
  });
  fixtureProofCopiedAt = new Date().toISOString();
  fixtureProof = JSON.parse(proofBytes);
}
const bundleBaselinePath = join(owned, "bundle-baseline.json");
if (fixtureProof && !existsSync(bundleBaselinePath))
  writeFileSync(
    bundleBaselinePath,
    JSON.stringify({ bundleSha256: fixtureProof.bundleSha256 }, null, 2) + "\n",
    { flag: "wx" },
  );
const bundleConsistent =
  !!fixtureProof &&
  JSON.parse(readFileSync(bundleBaselinePath, "utf8")).bundleSha256 ===
    fixtureProof.bundleSha256;
const fixtureFresh =
  !!fixtureProof &&
  bundleConsistent &&
  fixtureProof.repoRoot === root &&
  fixtureProof.typecheck === "passed" &&
  /all \d+ checks passed/.test(fixtureProof.verification) &&
  Date.parse(fixtureProof.verifiedAt) >= Date.parse(startedAt) &&
  Date.parse(fixtureProof.verifiedAt) <= Date.parse(endedAt);
incremental();
const after = freeze("after");
const metricsPath = join(output, metricsName);
const metrics = existsSync(metricsPath)
  ? JSON.parse(readFileSync(metricsPath, "utf8"))
  : null;
const observedKeys =
  phase === "capture"
    ? Object.entries(metrics ?? {}).flatMap(([state, widths]) =>
        Object.keys(widths).map((width) => `${state}--${width}`),
      )
    : phase === "check"
      ? (metrics ?? []).map((entry) => `${entry.state}--${entry.viewport}`)
      : Object.keys(metrics?.cases ?? {});
const missingKeys = expectedKeys.filter((key) => !observedKeys.includes(key));
const unexpectedKeys = observedKeys.filter(
  (key) => !expectedKeys.includes(key),
);
const artifacts = filesUnder(output).map((path) => {
  const bytes = readFileSync(path);
  return {
    path: relative(invocation, path).replaceAll("\\", "/"),
    bytes: bytes.length,
    sha256: sha(bytes),
    ...(/\.png$/.test(path)
      ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
      : {}),
  };
});
const missingPngs = expectedPngs.filter(
  (name) => !artifacts.some((entry) => entry.path === `artifacts/${name}`),
);
const runnerLog = logChunks.join("");
const missingCompletionLines =
  phase === "capture"
    ? states.filter((state) => !runnerLog.includes(`captured ${state} in `))
    : phase === "check"
      ? expectedKeys.filter((key) => {
          const [state, viewport] = key.split("--");
          return !runnerLog.includes(`${state} @${viewport}:`);
        })
      : [];
const warnings = runnerLog
  .split(/\r?\n/)
  .filter((line) =>
    /not found|captured as-is|not settled|still unresolved|fixture missing|disabled|TIME LIMIT/i.test(
      line,
    ),
  );
write("artifact-hashes.json", artifacts);
write("execution.json", {
  ...execution,
  ...outcome,
  endedAt,
  durationMs: Date.now() - started,
  runnerDurationMs: Date.parse(endedAt) - started,
  timedOut,
  fixtureProof,
  fixtureProofCopiedAt,
  fixtureFresh,
  bundleConsistent,
  fixtureProofSha256: existsSync(proofPath) ? hashFile(proofPath) : null,
  observedKeys,
  missingKeys,
  unexpectedKeys,
  missingPngs,
  missingCompletionLines,
  warnings,
  pngCount: artifacts.filter((entry) => entry.path.endsWith(".png")).length,
  beforeFreezeOk: before.ok,
  afterFreezeOk: after.ok,
  incrementalSnapshots: timeline.length,
  qualified: fixtureFresh && before.ok && after.ok,
  complete:
    outcome.exitCode === 0 &&
    fixtureFresh &&
    after.ok &&
    !missingKeys.length &&
    !unexpectedKeys.length &&
    !missingPngs.length &&
    !missingCompletionLines.length,
});
console.log(
  `END ${tag}: exit=${outcome.exitCode}, fresh=${fixtureFresh}, freeze=${after.ok}, observed=${observedKeys.length}/${expectedKeys.length}, missing=${missingKeys.length}`,
);
process.exit(
  !after.ok || !fixtureFresh ? 3 : timedOut ? 124 : (outcome.exitCode ?? 1),
);
