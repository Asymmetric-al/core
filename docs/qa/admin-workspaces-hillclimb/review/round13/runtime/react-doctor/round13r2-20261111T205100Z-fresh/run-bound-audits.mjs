import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(process.cwd());
const evidenceRoot = path.dirname(fileURLToPath(import.meta.url));
if (
  root !== "C:\\Users\\Conrad\\.t3\\worktrees\\core\\t3-5a24111d-r12" ||
  path.dirname(evidenceRoot) !==
    path.join(
      root,
      "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor",
    )
)
  throw new Error("Unauthorized evidence path.");
const declared = {
  checkpoint: "round13r2",
  base: "8368004b339384eb98129a086ca71b7db88534ed",
  manifestSha256:
    "27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0",
  diffSha256:
    "8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b",
  sourceInventorySha256:
    "a4b92ea2ba382845a752f0b64094632b40c6f8a4f35c370dabd7a8bb522e6cc3",
  nodeVersion: "v24.22.1",
  reactDoctorVersion: "0.9.18",
};
const helper =
  "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/refreeze/read-binding.mjs";
const operatorPaths = [
  helper,
  "AGENTS.md",
  ".agents/skills/react-doctor/SKILL.md",
  "docs/guides/development/react-doctor.md",
  "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/fresh-audit-plan.md",
];
const digest = (value) => createHash("sha256").update(value).digest("hex");
const json = (name, value) =>
  writeFileSync(
    path.join(evidenceRoot, name),
    JSON.stringify(value, null, 2) + "\n",
    { flag: "wx" },
  );
const controls = () =>
  Object.fromEntries(
    operatorPaths.map((relative) => [
      relative,
      digest(readFileSync(path.join(root, relative))),
    ]),
  );
const initialControls = controls();
const timeoutMs = 900_000;
const receipt = {
  declared,
  root,
  evidenceRoot,
  startedAt: new Date().toISOString(),
  timeoutMs,
  modes: [],
};
json("scope-and-declaration.json", {
  ...receipt,
  operatorControls: initialControls,
  scope:
    "Evidence only; no product/test/ledger/config/manifests/Git/environment/server/provider/browser mutations or delegated children.",
  historicalNotFresh: {
    oldUnapprovedRecords: 178,
    oldUnresolvedDiagnostics: 635,
  },
});

function binding(label, baseline) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(process.execPath, [helper], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    timeout: 120_000,
    windowsHide: true,
  });
  for (const stream of ["stdout", "stderr"])
    writeFileSync(
      path.join(evidenceRoot, `${label}.${stream}.log`),
      result[stream] ?? "",
      { flag: "wx" },
    );
  const command = {
    argv: [process.execPath, helper],
    cwd: root,
    startedAt,
    endedAt: new Date().toISOString(),
    exitCode: result.status,
    signal: result.signal,
    error: result.error?.message ?? null,
  };
  let live;
  try {
    if (result.status !== 0 || result.error)
      throw new Error(
        `Live helper failed: ${result.error?.message ?? result.status}`,
      );
    live = JSON.parse(result.stdout);
    json(`${label}.json`, live);
    for (const [key, value] of Object.entries(declared))
      if (live[key] !== value)
        throw new Error(`Declared ${key} mismatch: ${live[key]}`);
    if (live.root !== root) throw new Error("Wrong binding root.");
    const manifest = JSON.parse(
      readFileSync(path.join(root, live.manifestPath), "utf8"),
    );
    if (manifest.files.length !== 1038)
      throw new Error("Wrong freeze entry count.");
    if (baseline && JSON.stringify(live) !== JSON.stringify(baseline))
      throw new Error("Candidate/control/evidence bracket drift.");
    if (JSON.stringify(controls()) !== JSON.stringify(initialControls))
      throw new Error("Guard/guide drift.");
    command.ok = true;
    command.frozenEntries = manifest.files.length;
    command.controlCount = Object.keys(live.controlHashes).length;
  } catch (error) {
    command.ok = false;
    command.failure = error.message;
  }
  json(`${label}.command.json`, command);
  if (!command.ok) throw new Error(command.failure);
  console.log(
    `${label}: declared live freeze matches; ${command.frozenEntries} entries, ${command.controlCount} controls`,
  );
  return live;
}

async function scan(mode, baseline) {
  binding(`${mode.name}.binding-before`, baseline);
  const output = path.join(evidenceRoot, mode.name);
  if (existsSync(output)) throw new Error("Scanner output must be fresh.");
  const args = ["run", mode.script, "--", `--output=${output}`];
  const stdoutPath = path.join(evidenceRoot, `${mode.name}.stdout.log`);
  const stderrPath = path.join(evidenceRoot, `${mode.name}.stderr.log`);
  const stdoutDescriptor = openSync(stdoutPath, "wx");
  const stderrDescriptor = openSync(stderrPath, "wx");
  const started = performance.now();
  const command = {
    argv: ["bun", ...args],
    cwd: root,
    outputDirectory: output,
    stdoutPath,
    stderrPath,
    startedAt: new Date().toISOString(),
    timeoutMs,
    watchdogPolicy:
      "Terminate only owned bun process and descendants using taskkill.exe /PID <pid> /T /F at 900 seconds; retain partial outputs.",
    timedOut: false,
    exitCode: null,
    signal: null,
    spawnError: null,
    watchdog: null,
    binding: declared,
  };
  console.log(`Starting ${mode.name}: bun ${args.join(" ")}`);
  try {
    await new Promise((resolve) => {
      const child = spawn("bun", args, {
        cwd: root,
        stdio: ["ignore", stdoutDescriptor, stderrDescriptor],
        windowsHide: true,
      });
      command.pid = child.pid ?? null;
      const timer = setTimeout(() => {
        command.timedOut = true;
        const killed = spawnSync(
          "taskkill.exe",
          ["/PID", String(child.pid), "/T", "/F"],
          { encoding: "utf8", timeout: 30_000, windowsHide: true },
        );
        command.watchdog = {
          argv: ["taskkill.exe", "/PID", String(child.pid), "/T", "/F"],
          at: new Date().toISOString(),
          exitCode: killed.status,
          signal: killed.signal,
          stdout: killed.stdout,
          stderr: killed.stderr,
          error: killed.error?.message ?? null,
        };
        json(`${mode.name}.watchdog.json`, command.watchdog);
        if (killed.status !== 0 || killed.error) {
          child.unref();
          resolve();
        }
      }, timeoutMs);
      child.on("error", (error) => {
        command.spawnError = error.message;
      });
      child.on("close", (exitCode, signal) => {
        clearTimeout(timer);
        command.exitCode = exitCode;
        command.signal = signal;
        resolve();
      });
    });
  } finally {
    closeSync(stdoutDescriptor);
    closeSync(stderrDescriptor);
    command.endedAt = new Date().toISOString();
    command.durationMs = Math.round(performance.now() - started);
    json(`${mode.name}.command.json`, command);
    receipt.modes.push(command);
  }
  binding(`${mode.name}.binding-after`, baseline);
  console.log(
    `Completed ${mode.name}: exit=${command.exitCode}, timeout=${command.timedOut}, duration=${command.durationMs}ms`,
  );
  if (command.timedOut && command.watchdog?.exitCode !== 0)
    throw new Error("Watchdog failed; stop further launches.");
}

try {
  const bun = spawnSync("bun", ["--version"], {
    cwd: root,
    encoding: "utf8",
    timeout: 30_000,
    windowsHide: true,
  });
  json("versions.json", {
    node: process.version,
    nodeExecutable: process.execPath,
    bun: bun.stdout?.trim(),
    bunExitCode: bun.status,
    scanner: "0.9.18",
    qualification:
      "Parent-declared installed scanner; frozen adapter pin and each fresh target report verify actual version.",
  });
  if (
    process.version !== declared.nodeVersion ||
    bun.status !== 0 ||
    bun.stdout.trim() !== "1.4.3"
  )
    throw new Error("Runtime version mismatch.");
  const baseline = binding("binding-before");
  for (const mode of [
    { name: "strict", script: "react-doctor:check" },
    { name: "raw", script: "react-doctor:raw" },
  ])
    await scan(mode, baseline);
  binding("binding-after", baseline);
  receipt.finishedAt = new Date().toISOString();
  receipt.invocationsCompleted = receipt.modes.length === 2;
  receipt.strictAccepted =
    receipt.modes[0].exitCode === 0 && !receipt.modes[0].timedOut;
  json("run-receipt.json", receipt);
  process.exitCode = receipt.modes.some(
    (command) =>
      command.exitCode !== 0 || command.timedOut || command.spawnError,
  )
    ? 1
    : 0;
} catch (error) {
  receipt.finishedAt = new Date().toISOString();
  receipt.failure = error.stack;
  json("run-failure.json", receipt);
  console.error(error.stack);
  process.exitCode = 2;
}
