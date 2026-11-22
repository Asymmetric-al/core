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
} from "./react-doctor-report.mjs";

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

// One target scans in a few minutes even on a loaded machine. The limit only
// stops a hung scanner from hanging the audit; it is not a performance budget.
export const REACT_DOCTOR_SCAN_TIMEOUT_MS = 15 * 60 * 1000;

export function reactDoctorScanSpawnOptions(
  snapshot,
  environment = process.env,
) {
  return {
    cwd: snapshot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: REACT_DOCTOR_SCAN_TIMEOUT_MS,
    env: {
      ...environment,
      REACT_DOCTOR_NO_TELEMETRY: "1",
      REACT_DOCTOR_NO_CACHE: "1",
    },
  };
}

function scanTargetWithCli({ directory, snapshot }) {
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
  return spawnSync(
    command.command,
    command.args,
    reactDoctorScanSpawnOptions(snapshot),
  );
}

function gitOutput(root, args, failure) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    env: repositoryGitEnvironment(),
  });
  if (result.error || result.status !== 0) throw new Error(failure);
  return result.stdout;
}

// Lists the files the working tree adds, modifies or renames relative to the
// merge base of HEAD and the revision, plus untracked files that Git does not
// ignore. Using the merge base keeps commits the base gained after the branch
// was cut out of the list.
export function resolveChangedSince(root, revision) {
  const unresolved = `Cannot resolve the base revision "${revision}". Pass a branch, tag or commit, as in --changed-since=origin/develop.`;
  if (
    typeof revision !== "string" ||
    revision === "" ||
    revision.startsWith("-")
  )
    throw new Error(unresolved);
  const commit = gitOutput(
    root,
    ["rev-parse", "--verify", "--quiet", `${revision}^{commit}`],
    unresolved,
  ).trim();
  const mergeBase = gitOutput(
    root,
    ["merge-base", commit, "HEAD"],
    `The base revision "${revision}" shares no history with HEAD.`,
  ).trim();
  const changed = gitOutput(
    root,
    ["diff", "--name-only", "--diff-filter=AMR", "-M", "-z", mergeBase, "--"],
    `Git could not list the files changed since the merge base of "${revision}".`,
  );
  const untracked = gitOutput(
    root,
    ["ls-files", "--others", "--exclude-standard", "-z"],
    "Git could not list the untracked files.",
  );
  const files = [
    ...new Set(`${changed}\0${untracked}`.split("\0").filter(Boolean)),
  ].sort();
  return { revision, mergeBase, files };
}

export function assertCompleteReactDoctorScans(
  scans,
  expectedTargets = REACT_DOCTOR_TARGETS,
) {
  const targets = scans.map((scan) => scan.target);
  if (
    new Set(targets).size !== targets.length ||
    targets.length !== expectedTargets.length ||
    expectedTargets.some((target) => !targets.includes(target))
  )
    throw new Error(
      "The audit did not complete every required target exactly once.",
    );
  for (const scan of scans)
    if (
      !Array.isArray(scan.diagnostics) ||
      !Array.isArray(scan.skippedChecks) ||
      scan.skippedChecks.length ||
      scan.complete !== true ||
      !Number.isSafeInteger(scan.scannedFileCount) ||
      scan.scannedFileCount < 1
    )
      throw new Error(
        `Target ${scan.target} has skipped, incomplete, or missing checks.`,
      );
}

function repositoryFile(target, filePath) {
  const relative =
    typeof filePath === "string" ? filePath.replaceAll("\\", "/") : "";
  const file = path.posix.join(target, relative);
  if (
    !relative ||
    path.posix.isAbsolute(relative) ||
    /^[A-Za-z]:/.test(relative) ||
    !file.startsWith(`${target}/`)
  )
    throw new Error(
      `A ${target} diagnostic names a file outside its target: ${String(filePath)}`,
    );
  return file;
}

const ruleId = (finding) => `${finding.plugin}/${finding.rule}`;

// Code-unit order keeps findings.json identical across Node and ICU builds.
const byCodeUnit = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

function compareFindings(left, right) {
  return (
    byCodeUnit(left.file, right.file) ||
    (left.line ?? 0) - (right.line ?? 0) ||
    (left.column ?? 0) - (right.column ?? 0) ||
    byCodeUnit(ruleId(left), ruleId(right)) ||
    byCodeUnit(String(left.message), String(right.message))
  );
}

function renderSummary(findings, listed) {
  const { totals, baseRevision } = findings;
  const oneLine = (text) =>
    String(text ?? "")
      .replace(/\s+/g, " ")
      .trim();
  const lines = [
    "# React Doctor audit summary",
    "",
    "This audit is advisory. Every target scanned completely, and its findings",
    "fail no check. Triage them as `docs/guides/development/react-doctor.md`",
    "describes.",
    "",
    findings.profile === "raw"
      ? "- Profile: raw, every rule including the disabled `react-in-jsx-scope` (`bun run react-doctor:raw`)"
      : "- Profile: applicable rules from `doctor.config.json` (`bun run react-doctor:audit`)",
    `- React Doctor: ${findings.reactDoctorVersion}`,
    `- \`doctor.config.json\` SHA-256: \`${findings.configHash}\``,
    baseRevision
      ? `- Base revision: \`${baseRevision.revision}\`, merge base \`${baseRevision.mergeBase}\``
      : "- Base revision: none",
    `- Findings: ${totals.findings} across ${Object.keys(totals.byTarget).length} targets`,
    "",
    "## Findings per target",
    "",
    "| Target | Findings |",
    "| --- | ---: |",
    ...Object.entries(totals.byTarget).map(
      ([target, count]) => `| \`${target}\` | ${count} |`,
    ),
    "",
    "## Findings per rule",
    "",
  ];
  const rules = Object.entries(totals.byRule);
  if (rules.length)
    lines.push(
      "| Rule | Findings |",
      "| --- | ---: |",
      ...rules.map(([rule, count]) => `| \`${rule}\` | ${count} |`),
    );
  else lines.push("No findings.");
  lines.push("", "## Listed findings", "");
  lines.push(
    baseRevision
      ? `${listed.length} of ${totals.findings} findings are in files the working tree adds, modifies or renames relative to \`${baseRevision.mergeBase}\`, the merge base of \`${baseRevision.revision}\` and HEAD, or in untracked files.`
      : `All ${totals.findings} findings, grouped by file.`,
  );
  let file;
  for (const finding of listed) {
    if (finding.file !== file) {
      file = finding.file;
      lines.push("", `### \`${file}\``, "");
    }
    lines.push(
      `- ${finding.line ?? "?"}:${finding.column ?? "?"} ${finding.severity} \`${ruleId(finding)}\`: ${oneLine(finding.message) || "(no message)"}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

// Builds findings.json and summary.md from complete scans. Findings never
// change the exit code; only an incomplete scan fails, by throwing.
export function createReactDoctorReport({
  scans,
  configHash,
  raw = false,
  changedSince = null,
  expectedTargets = REACT_DOCTOR_TARGETS,
  version = REACT_DOCTOR_VERSION,
}) {
  assertCompleteReactDoctorScans(scans, expectedTargets);
  const changed = changedSince ? new Set(changedSince.files) : null;
  const all = [];
  for (const scan of scans)
    for (const diagnostic of scan.diagnostics) {
      const finding = {
        target: scan.target,
        file: repositoryFile(scan.target, diagnostic.filePath),
        line: diagnostic.line ?? null,
        column: diagnostic.column ?? null,
        plugin: diagnostic.plugin,
        rule: diagnostic.rule,
        severity: diagnostic.severity,
        message: diagnostic.message ?? null,
      };
      if (changed) finding.changed = changed.has(finding.file);
      all.push(finding);
    }
  all.sort(compareFindings);
  const byTarget = Object.fromEntries(
    expectedTargets.map((target) => [target, 0]),
  );
  const ruleCounts = new Map();
  for (const finding of all) {
    byTarget[finding.target] += 1;
    ruleCounts.set(ruleId(finding), (ruleCounts.get(ruleId(finding)) ?? 0) + 1);
  }
  const byRule = Object.fromEntries(
    [...ruleCounts].sort(
      ([leftRule, left], [rightRule, right]) =>
        right - left || byCodeUnit(leftRule, rightRule),
    ),
  );
  const findings = {
    schemaVersion: 1,
    profile: raw ? "raw" : "applicable",
    reactDoctorVersion: version,
    configHash,
    baseRevision: changedSince
      ? { revision: changedSince.revision, mergeBase: changedSince.mergeBase }
      : null,
    totals: { findings: all.length, byTarget, byRule },
    findings: all,
  };
  const listed = changed ? all.filter((finding) => finding.changed) : all;
  return {
    exitCode: 0,
    findings,
    listed,
    summary: renderSummary(findings, listed),
  };
}

export function runReactDoctorAudit({
  root,
  outputDirectory,
  raw = false,
  changedSince,
  scanTarget = scanTargetWithCli,
  log = console.log,
}) {
  const absoluteRoot = realpathSync(root);
  // Resolve the base revision first, so a bad one fails before any scan.
  const changed =
    changedSince === undefined || changedSince === null
      ? null
      : resolveChangedSince(absoluteRoot, changedSince);
  const output = outputDirectory
    ? path.resolve(outputDirectory)
    : mkdtempSync(path.join(tmpdir(), "core-react-doctor-audit-"));
  if (existsSync(output) && readdirSync(output).length)
    throw new Error(
      "Audit output already contains evidence; choose a fresh, empty output directory.",
    );
  mkdirSync(output, { recursive: true });
  // Said first, so a run that fails later still names where its logs are.
  log(`Evidence directory: ${output}`);
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
    const result = scanTarget({ target, directory, snapshot });
    writeFileSync(
      path.join(output, `${target.replaceAll("/", "-")}.stderr.log`),
      result.stderr ?? "",
    );
    if (result.error?.code === "ETIMEDOUT")
      throw new Error(
        `React Doctor did not finish ${target} within ${REACT_DOCTOR_SCAN_TIMEOUT_MS / 60_000} minutes.`,
      );
    if (result.error || result.status !== 0)
      throw new Error(
        `React Doctor could not complete ${target}: ${result.error?.message ?? result.status}`,
      );
    let report;
    try {
      report = JSON.parse(result.stdout);
    } catch {
      throw new Error(
        `React Doctor returned an unreadable report for ${target}.`,
      );
    }
    writeFileSync(
      path.join(output, `${target.replaceAll("/", "-")}.json`),
      JSON.stringify(report, null, 2) + "\n",
    );
    const scan = parseReactDoctorReport(report, target, directory);
    scans.push(scan);
    log(
      `${target}: ${scan.diagnostics.length} findings, ${scan.scannedFileCount} files scanned, no skipped checks`,
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
  const report = createReactDoctorReport({
    scans,
    configHash,
    raw,
    changedSince: changed,
  });
  const findingsPath = path.join(output, "findings.json");
  const summaryPath = path.join(output, "summary.md");
  writeFileSync(findingsPath, JSON.stringify(report.findings, null, 2) + "\n");
  writeFileSync(summaryPath, report.summary);
  const { totals } = report.findings;
  log(
    `${totals.findings} findings across ${REACT_DOCTOR_TARGETS.length} targets (${raw ? "raw profile" : "applicable rules"}). This audit is advisory: findings do not fail it.`,
  );
  if (changed)
    log(
      `${report.listed.length} of them are in files changed since ${changed.mergeBase}, the merge base of ${changed.revision} and HEAD.`,
    );
  log(`Findings: ${findingsPath}`);
  log(`Summary: ${summaryPath}`);
  return { output, scans, ...report };
}

export function parseReactDoctorAuditArgs(args) {
  const options = {
    raw: false,
    outputDirectory: undefined,
    changedSince: undefined,
  };
  const seen = new Set();
  const unknown = [];
  for (const arg of args) {
    const flag = arg.split("=", 1)[0];
    if (seen.has(flag)) throw new Error(`${flag} may be given only once.`);
    if (arg === "--raw") options.raw = true;
    else if (arg.startsWith("--output=")) {
      options.outputDirectory = arg.slice("--output=".length);
      if (!options.outputDirectory)
        throw new Error("--output needs a fresh, empty directory.");
    } else if (arg.startsWith("--changed-since=")) {
      options.changedSince = arg.slice("--changed-since=".length);
      if (!options.changedSince)
        throw new Error(
          "--changed-since needs a revision, as in --changed-since=origin/develop.",
        );
    } else {
      unknown.push(arg);
      continue;
    }
    seen.add(flag);
  }
  if (unknown.length)
    throw new Error(`Unknown audit arguments: ${unknown.join(", ")}`);
  return options;
}

// Every failure, including bad arguments, is reported as unavailable
// evidence with exit code 1, so it is never read as a clean result.
export function runReactDoctorAuditCommand(
  args,
  {
    root,
    runAudit = runReactDoctorAudit,
    log = console.log,
    logError = console.error,
  } = {},
) {
  try {
    const options = parseReactDoctorAuditArgs(args);
    return runAudit({ root, ...options, log }).exitCode;
  } catch (error) {
    logError(
      `React Doctor audit evidence is unavailable: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  }
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  process.exitCode = runReactDoctorAuditCommand(process.argv.slice(2), {
    root: path.resolve(path.dirname(scriptPath), ".."),
  });
}
