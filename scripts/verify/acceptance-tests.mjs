import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ACCEPTANCE_DIR = "tests/unit/acceptance";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const vitestCli = path.join(repoRoot, "node_modules/vitest/vitest.mjs");

export function buildVitestInvocation(reportFile, cli = vitestCli) {
  return {
    command: process.execPath,
    args: [
      cli,
      "run",
      `${ACCEPTANCE_DIR}/`,
      "--reporter=default",
      "--reporter=json",
      `--outputFile.json=${reportFile}`,
      // The module cache lives in node_modules and is wiped when the lockfile
      // hash differs. A run from a fixture root that shares node_modules would
      // otherwise delete it while a concurrent Vitest run is writing to it.
      "--no-fsModuleCache",
    ],
  };
}

function rootPrefixes(root) {
  const prefixes = new Set([path.resolve(root)]);
  try {
    prefixes.add(realpathSync(root));
  } catch {
    // An unresolvable root only means fewer prefixes to compare against.
  }
  return [...prefixes];
}

function isAcceptanceFile(name, roots) {
  if (typeof name !== "string") return false;
  return roots.some((root) => {
    const relative = path.relative(root, name).split(path.sep).join("/");
    return relative.startsWith(`${ACCEPTANCE_DIR}/`);
  });
}

/**
 * Counts acceptance files and test outcomes from a Vitest JSON report.
 * Returns null when the report does not have the expected shape.
 */
export function summarizeReport(report, root = repoRoot) {
  if (
    !report ||
    typeof report !== "object" ||
    !Array.isArray(report.testResults)
  )
    return null;
  const roots = rootPrefixes(root);
  const summary = {
    files: 0,
    failedFiles: 0,
    passed: 0,
    skipped: 0,
    failed: 0,
  };
  for (const file of report.testResults) {
    if (!file || !Array.isArray(file.assertionResults)) return null;
    if (!isAcceptanceFile(file.name, roots)) continue;
    summary.files += 1;
    if (file.status === "failed") summary.failedFiles += 1;
    for (const test of file.assertionResults) {
      if (test?.status === "passed") summary.passed += 1;
      else if (test?.status === "failed") summary.failed += 1;
      else summary.skipped += 1;
    }
  }
  return summary;
}

/** Every reason the run must fail; an empty list means the suite passed. */
export function acceptanceProblems({ status, signal, error, report, summary }) {
  const problems = [];
  if (error) problems.push(`Vitest could not be spawned: ${error.message}`);
  if (status !== 0)
    problems.push(`Vitest exited with status ${status ?? `signal ${signal}`}`);
  if (!summary) {
    problems.push("Vitest JSON summary is missing or unreadable");
    return problems;
  }
  if (summary.files === 0)
    problems.push(`no test files were collected under ${ACCEPTANCE_DIR}/`);
  if (summary.passed + summary.failed === 0)
    problems.push("no acceptance tests executed (all skipped or todo)");
  if (summary.failed > 0 || summary.failedFiles > 0)
    problems.push("acceptance tests failed");
  if (
    report.success !== true ||
    report.numFailedTests > 0 ||
    report.numFailedTestSuites > 0
  )
    problems.push("Vitest reported an unsuccessful run");
  return problems;
}

function readReport(reportFile) {
  try {
    return JSON.parse(readFileSync(reportFile, "utf8"));
  } catch {
    return null;
  }
}

export function runAcceptanceTests({
  spawn = spawnSync,
  cli = vitestCli,
  root = repoRoot,
  log = console.log,
  logError = console.error,
} = {}) {
  if (!existsSync(cli)) {
    logError(`acceptance-tests: Vitest CLI not found at ${cli}`);
    return 1;
  }
  const scratch = mkdtempSync(path.join(tmpdir(), "acceptance-tests-"));
  try {
    const reportFile = path.join(scratch, "report.json");
    const invocation = buildVitestInvocation(reportFile, cli);
    const result = spawn(invocation.command, invocation.args, {
      cwd: root,
      shell: false,
      stdio: "inherit",
    });
    const report = readReport(reportFile);
    const summary = report ? summarizeReport(report, root) : null;
    if (summary)
      log(
        `acceptance-tests: ${summary.files} files, ${summary.passed} passed, ${summary.skipped} skipped, ${summary.failed} failed`,
      );
    const problems = acceptanceProblems({
      status: result.status,
      signal: result.signal,
      error: result.error,
      report,
      summary,
    });
    for (const problem of problems) logError(`acceptance-tests: ${problem}`);
    return problems.length === 0 ? 0 : 1;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const isMain =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) process.exit(runAcceptanceTests());
