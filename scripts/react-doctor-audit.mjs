import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { repositoryGitEnvironment } from "./git/environment.mjs";

import {
  createReactDoctorCommand,
  createSpawnCommand,
  REACT_DOCTOR_TARGETS,
  REACT_DOCTOR_VERSION,
} from "./react-doctor-first-party.mjs";
import {
  parseReactDoctorReport,
  reactDoctorConfigHash,
  reviewReactDoctorFindings,
} from "./react-doctor-ledger.mjs";

const rootFiles = new Set([
  "package.json",
  "bun.lock",
  "turbo.json",
  "tsconfig.json",
  "tsconfig.base.json",
  "doctor.config.json",
  "eslint.config.mjs",
  "eslint.config.js",
  ".gitignore",
]);

function allowedSource(relative) {
  if (
    typeof relative !== "string" ||
    path.isAbsolute(relative) ||
    relative.includes("\\") ||
    relative.split("/").some((part) => part === "..")
  )
    throw new Error("Invalid repository source path.");
  if (
    relative
      .split("/")
      .some((part) => part === "node_modules" || part.startsWith(".env"))
  )
    return false;
  if (relative.startsWith("packages/eve-runtime/skill-catalog/")) return false;
  return (
    rootFiles.has(relative) || /^(?:apps|packages|tooling)\//.test(relative)
  );
}

function trackedAndUntrackedFiles(root) {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      env: repositoryGitEnvironment(),
    },
  );
  if (result.error || result.status !== 0)
    throw new Error("Git could not inventory the current source tree.");
  return [...new Set(result.stdout.split("\0").filter(Boolean))];
}

function physicalSourcePaths(root) {
  const result = [];
  const visit = (relative) => {
    if (!allowedSource(relative)) return;
    const absolute = path.join(root, relative);
    if (!existsSync(absolute)) return;
    const info = lstatSync(absolute);
    if (info.isSymbolicLink())
      throw new Error("Audit source symlinks are forbidden.");
    if (info.isFile()) result.push(relative);
    else if (info.isDirectory())
      for (const entry of readdirSync(absolute)) visit(`${relative}/${entry}`);
  };
  for (const file of rootFiles) visit(file);
  for (const group of ["apps", "packages", "tooling"])
    if (existsSync(path.join(root, group)))
      for (const entry of readdirSync(path.join(root, group)))
        visit(`${group}/${entry}`);
  return result;
}

export function auditSourceHashes(root, { inventory = "git" } = {}) {
  const absoluteRoot = realpathSync(root);
  if (!["git", "physical"].includes(inventory))
    throw new Error("Unknown audit source inventory.");
  const paths =
    inventory === "physical"
      ? physicalSourcePaths(absoluteRoot)
      : trackedAndUntrackedFiles(absoluteRoot);
  const hashes = {};
  for (const relative of paths.sort()) {
    if (!allowedSource(relative)) continue;
    const source = path.join(absoluteRoot, relative);
    if (!existsSync(source)) continue;
    const info = lstatSync(source);
    if (info.isSymbolicLink())
      throw new Error("Audit source symlinks are forbidden.");
    if (!info.isFile()) continue;
    if (!realpathSync(source).startsWith(absoluteRoot + path.sep))
      throw new Error("Audit source escaped the repository.");
    hashes[relative] = createHash("sha256")
      .update(readFileSync(source))
      .digest("hex");
  }
  return hashes;
}

export function assertAuditSourcesUnchanged({
  root,
  expected,
  inventory = "git",
}) {
  const actual = auditSourceHashes(root, { inventory });
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(
      `Audit source changed during the scan: ${root}. Run a fresh audit.`,
    );
}

function linkPackageDependencies(root, snapshot) {
  const directories = [root];
  for (const group of ["apps", "packages", "tooling"]) {
    const directory = path.join(root, group);
    if (!existsSync(directory)) continue;
    for (const entry of readdirSync(directory, { withFileTypes: true }))
      if (entry.isDirectory())
        directories.push(path.join(directory, entry.name));
  }
  for (const directory of directories) {
    const sourceModules = path.join(directory, "node_modules");
    if (!existsSync(sourceModules)) continue;
    const targetModules = path.join(
      snapshot,
      path.relative(root, sourceModules),
    );
    mkdirSync(targetModules, { recursive: true });
    for (const name of readdirSync(sourceModules)) {
      if (name === ".bin") continue;
      const scoped = name.startsWith("@");
      const modules = scoped
        ? readdirSync(path.join(sourceModules, name)).map(
            (child) => `${name}/${child}`,
          )
        : [name];
      for (const module of modules) {
        const source = path.join(sourceModules, module);
        let target = realpathSync(source);
        const relative = path.relative(root, target);
        if (
          !relative.startsWith(`..${path.sep}`) &&
          !path.isAbsolute(relative) &&
          !relative.split(path.sep).includes("node_modules")
        )
          target = path.join(snapshot, relative);
        const link = path.join(targetModules, module);
        mkdirSync(path.dirname(link), { recursive: true });
        symlinkSync(
          target,
          link,
          process.platform === "win32" ? "junction" : undefined,
        );
      }
    }
  }
}

export function createAuditSnapshot({
  root,
  snapshot,
  sourcePaths = trackedAndUntrackedFiles(root),
  linkDependencies = true,
  raw = false,
}) {
  const absoluteRoot = realpathSync(root);
  mkdirSync(snapshot, { recursive: true });
  for (const relative of sourcePaths) {
    if (!allowedSource(relative)) continue;
    const source = path.join(absoluteRoot, relative);
    if (!existsSync(source)) continue; // Deleted working-tree files are not resurrected.
    if (lstatSync(source).isSymbolicLink())
      throw new Error(
        "Source symlinks must not be copied into an audit snapshot.",
      );
    if (!lstatSync(source).isFile()) continue;
    const resolved = realpathSync(source);
    if (!resolved.startsWith(absoluteRoot + path.sep))
      throw new Error(
        "Source path escaped the repository through an ancestor symlink.",
      );
    const target = path.join(snapshot, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
  // The marker bounds ancestor config discovery without copying Git credentials/config.
  mkdirSync(path.join(snapshot, ".git"), { recursive: true });
  if (linkDependencies) linkPackageDependencies(absoluteRoot, snapshot);
  const configPath = path.join(snapshot, "doctor.config.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  config.respectInlineDisables = false;
  config.adoptExistingLintConfig = false;
  config.noScore = true;
  config.share = false;
  config.supplyChain = { enabled: false };
  if (raw) config.rules["react-doctor/react-in-jsx-scope"] = "warn";
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  return snapshot;
}

export function runReactDoctorAudit({
  root,
  outputDirectory,
  raw = false,
  check = false,
}) {
  const absoluteRoot = realpathSync(root);
  const output = outputDirectory
    ? path.resolve(outputDirectory)
    : mkdtempSync(path.join(tmpdir(), "core-react-doctor-audit-"));
  if (existsSync(output) && readdirSync(output).length)
    throw new Error(
      "Audit output already contains evidence; choose a fresh, empty output directory.",
    );
  mkdirSync(output, { recursive: true });
  // Scan outside the checkout: ancestor ignore patterns can otherwise hide a
  // physically complete snapshot placed under an ignored evidence directory.
  const snapshotBase = mkdtempSync(
    path.join(tmpdir(), "core-react-doctor-source-"),
  );
  const originalHashes = auditSourceHashes(absoluteRoot);
  const snapshot = createAuditSnapshot({
    root: absoluteRoot,
    snapshot: path.join(snapshotBase, "source"),
    raw,
  });
  writeFileSync(
    path.join(output, "snapshot.json"),
    JSON.stringify({ snapshot, original: absoluteRoot }, null, 2) + "\n",
  );
  assertAuditSourcesUnchanged({ root: absoluteRoot, expected: originalHashes });
  const snapshotHashes = auditSourceHashes(snapshot, { inventory: "physical" });
  const sourceKeys = Object.keys(originalHashes);
  if (
    JSON.stringify(sourceKeys) !==
      JSON.stringify(Object.keys(snapshotHashes)) ||
    sourceKeys.some(
      (relative) =>
        relative !== "doctor.config.json" &&
        originalHashes[relative] !== snapshotHashes[relative],
    )
  )
    throw new Error(
      "The disposable copy does not match the inventoried source tree.",
    );
  const configHash = reactDoctorConfigHash(
    readFileSync(path.join(absoluteRoot, "doctor.config.json")),
  );
  const scans = [];
  for (const target of REACT_DOCTOR_TARGETS) {
    const directory = path.join(snapshot, target);
    const command = createSpawnCommand(
      createReactDoctorCommand(directory, [
        "--scope",
        "full",
        "--json",
        "--blocking",
        "none",
        "--no-respect-inline-disables",
        "--no-cache",
      ]),
    );
    const result = spawnSync(command.command, command.args, {
      cwd: snapshot,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      env: {
        ...process.env,
        REACT_DOCTOR_NO_TELEMETRY: "1",
        REACT_DOCTOR_NO_CACHE: "1",
      },
    });
    writeFileSync(
      path.join(output, `${target.replaceAll("/", "-")}.stderr.log`),
      result.stderr ?? "",
    );
    if (result.error || result.status !== 0)
      throw new Error(
        `React Doctor could not complete ${target}: ${result.error?.message ?? result.status}`,
      );
    const report = JSON.parse(result.stdout);
    writeFileSync(
      path.join(output, `${target.replaceAll("/", "-")}.json`),
      JSON.stringify(report, null, 2) + "\n",
    );
    const scan = parseReactDoctorReport(report, target, directory);
    scans.push(scan);
    console.log(
      `${target}: ${scan.diagnostics.length} raw diagnostics, ${scan.scannedFileCount} files, no skipped checks`,
    );
  }
  writeFileSync(
    path.join(output, "scans.json"),
    JSON.stringify(scans, null, 2) + "\n",
  );
  assertAuditSourcesUnchanged({ root: absoluteRoot, expected: originalHashes });
  assertAuditSourcesUnchanged({
    root: snapshot,
    expected: snapshotHashes,
    inventory: "physical",
  });
  writeFileSync(
    path.join(output, "integrity.json"),
    JSON.stringify(
      { originalHashes, snapshotHashes, verifiedAt: new Date().toISOString() },
      null,
      2,
    ) + "\n",
  );
  if (raw) {
    console.log(`Unsuppressed all-rule audit retained at ${output}`);
    return { output, scans, raw: true, exitCode: 0 };
  }
  const ledgerPath = path.join(
    absoluteRoot,
    "docs/qa/react-doctor/exceptions.json",
  );
  const ledger = existsSync(ledgerPath)
    ? JSON.parse(readFileSync(ledgerPath, "utf8"))
    : {
        schemaVersion: 1,
        reactDoctorVersion: REACT_DOCTOR_VERSION,
        configHash,
        exceptions: [],
      };
  const reviewed = reviewReactDoctorFindings(scans, ledger, {
    root: absoluteRoot,
    configHash,
  });
  writeFileSync(
    path.join(output, "actionable.json"),
    JSON.stringify(
      { version: REACT_DOCTOR_VERSION, configHash, ...reviewed },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${reviewed.actionable.length} actionable findings; ${reviewed.excepted.length} exact, evidence-backed exceptions. Reports: ${output}`,
  );
  return {
    output,
    scans,
    ...reviewed,
    exitCode: check && reviewed.actionable.length ? 1 : 0,
  };
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const args = process.argv.slice(2);
  const outputFlag = args.find((arg) => arg.startsWith("--output="));
  const unknown = args.filter(
    (arg) => !["--raw", "--check"].includes(arg) && arg !== outputFlag,
  );
  if (unknown.length)
    throw new Error(`Unknown audit arguments: ${unknown.join(", ")}`);
  const result = runReactDoctorAudit({
    root: path.resolve(path.dirname(scriptPath), ".."),
    outputDirectory: outputFlag?.slice("--output=".length),
    raw: args.includes("--raw"),
    check: args.includes("--check"),
  });
  process.exitCode = result.exitCode;
}
