import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const evidenceRoot = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(evidenceRoot, "../../../../../../..");
const qa = join(repoRoot, "docs/qa/admin-workspaces-hillclimb");
const prior = join(
  qa,
  "review/round13/runtime/round13r2-studio/run-20261111T205705694Z-13c60a0d/input-hashes.json",
);
const baseline = JSON.parse(readFileSync(prior, "utf8"));
export const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
export const save = (path, value) =>
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", { flag: "wx" });

function auditInputs() {
  const files = baseline.files.map((file) => ({
    path: file.path,
    expectedSha256: file.sha256,
    actualSha256: sha256(readFileSync(join(repoRoot, file.path))),
  }));
  return {
    baselinePath: prior,
    baselineSha256: sha256(readFileSync(prior)),
    baselineInventorySha256: baseline.inputInventorySha256,
    checkpoint: baseline.identity,
    files,
    mismatches: files.filter(
      (file) => file.expectedSha256 !== file.actualSha256,
    ),
  };
}

export async function gate(probe, phase) {
  if (!/^[a-z0-9-]+$/.test(probe) || !["before", "after"].includes(phase))
    throw new Error("Invalid gate label");
  if (realpathSync(repoRoot) !== realpathSync(baseline.root))
    throw new Error("Wrong checkout");
  const directory = join(evidenceRoot, probe, phase);
  mkdirSync(directory, { recursive: true });
  const startedAtUtc = new Date().toISOString();
  const started = performance.now();
  const commands = [];
  const run = (command, argv, options = {}) => {
    const step = String(commands.length + 1).padStart(2, "0");
    const commandStartedAtUtc = new Date().toISOString();
    const commandStarted = performance.now();
    const result = spawnSync(command, argv, {
      ...options,
      cwd: repoRoot,
      encoding: "utf8",
      windowsHide: true,
      timeout: 120000,
      maxBuffer: 32 * 1024 * 1024,
    });
    const stdout = result.stdout ?? "";
    const stderr = result.stderr ?? "";
    writeFileSync(join(directory, `${step}.stdout.log`), stdout, {
      flag: "wx",
    });
    writeFileSync(join(directory, `${step}.stderr.log`), stderr, {
      flag: "wx",
    });
    const receipt = {
      executable: command,
      argv,
      cwd: repoRoot,
      pid: result.pid,
      startedAtUtc: commandStartedAtUtc,
      endedAtUtc: new Date().toISOString(),
      elapsedMs: performance.now() - commandStarted,
      exitCode: result.status,
      signal: result.signal,
      error: result.error?.message ?? null,
      timeoutMs: 120000,
      stdinSha256: options.input ? sha256(options.input) : null,
      stdout: {
        path: `${step}.stdout.log`,
        bytes: Buffer.byteLength(stdout),
        sha256: sha256(stdout),
      },
      stderr: {
        path: `${step}.stderr.log`,
        bytes: Buffer.byteLength(stderr),
        sha256: sha256(stderr),
      },
    };
    save(join(directory, `${step}.command.json`), receipt);
    commands.push(receipt);
    return result;
  };
  const inputsBefore = auditInputs();
  save(join(directory, "inputs-before.json"), inputsBefore);
  if (inputsBefore.mismatches.length) throw new Error("Pinned input drift");
  const freeze = run(process.execPath, [
    join(qa, "freeze-checkpoint.mjs"),
    "--verify",
    "round13r2",
  ]);
  if (freeze.status !== 0 || freeze.error)
    throw new Error("Frozen round13r2 mismatch");
  let proof = null;
  let preflight = null;
  if (phase === "before") {
    const { prepareFixtureBundle } = await import(
      pathToFileURL(join(qa, "fixture-preflight.mjs")).href
    );
    const preflightStartedAtUtc = new Date().toISOString();
    const preflightStarted = performance.now();
    ({ proof } = prepareFixtureBundle({ run }));
    save(join(directory, "fixture-proof.original.json"), proof);
    copyFileSync(
      join(directory, "fixture-proof.original.json"),
      join(directory, "fixture-proof.preserved.json"),
    );
    preflight = {
      startedAtUtc: preflightStartedAtUtc,
      endedAtUtc: new Date().toISOString(),
      elapsedMs: performance.now() - preflightStarted,
      originalSha256: sha256(
        readFileSync(join(directory, "fixture-proof.original.json")),
      ),
      preservedSha256: sha256(
        readFileSync(join(directory, "fixture-proof.preserved.json")),
      ),
      preservedAtUtc: new Date().toISOString(),
    };
    save(join(directory, "preflight-receipt.json"), preflight);
    if (
      proof.bundleSha256 !==
        "afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b" ||
      proof.typecheck !== "passed" ||
      realpathSync(proof.repoRoot) !== realpathSync(repoRoot)
    )
      throw new Error("Fresh fixture proof conflict");
  }
  const inputsAfter = auditInputs();
  save(join(directory, "inputs-after.json"), inputsAfter);
  const result = {
    probe,
    phase,
    startedAtUtc,
    endedAtUtc: new Date().toISOString(),
    elapsedMs: performance.now() - started,
    checkpoint: "round13r2",
    freeze: JSON.parse(freeze.stdout),
    inputMismatches: inputsAfter.mismatches,
    proof,
    preflight,
    commandCount: commands.length,
    runtime: {
      node: process.version,
      repoRoot,
      origin: "http://localhost:3031",
    },
    gateSourceSha256: sha256(readFileSync(fileURLToPath(import.meta.url))),
    scheduling:
      "Disjoint non-Studio collectors may overlap. Studio CMS mutations exclusively owned by this live journey. No restart or blanket reset.",
  };
  save(join(directory, "gate.json"), result);
  if (inputsAfter.mismatches.length)
    throw new Error("Pinned input drift after gate");
  console.log(
    JSON.stringify({
      probe,
      phase,
      freeze: result.freeze,
      bundleSha256: proof?.bundleSha256,
      elapsedMs: result.elapsedMs,
    }),
  );
  return result;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await gate(process.argv[2], process.argv[3]);
