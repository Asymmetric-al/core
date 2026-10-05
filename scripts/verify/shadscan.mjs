import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  reviewFindings,
  validatePolicy,
  validateReport,
} from "./shadscan-policy.mjs";
import { renderSummary } from "./shadscan-summary.mjs";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const require = createRequire(import.meta.url);

export function validateInstalledVersion(
  declaredVersion,
  installedVersion,
  policy,
) {
  if (
    declaredVersion !== policy.engineVersion ||
    installedVersion !== policy.engineVersion
  ) {
    throw new Error(
      "Declared, installed, and reviewed Shadscan versions must match exactly; run bun ci before auditing",
    );
  }
}

export function scannerEnvironment(environment = process.env) {
  const result = { ...environment };
  delete result.GH_TOKEN;
  delete result.GITHUB_TOKEN;
  delete result.NODE_OPTIONS;
  return result;
}

export function createStagedSnapshot(repoRoot) {
  const snapshot = mkdtempSync(path.join(os.tmpdir(), "core-shadscan-index-"));
  try {
    execFileSync(
      "git",
      ["checkout-index", "--all", `--prefix=${snapshot}${path.sep}`],
      { cwd: repoRoot, stdio: "pipe" },
    );
    return snapshot;
  } catch (error) {
    rmSync(snapshot, { recursive: true, force: true });
    throw error;
  }
}

export function assessShadscanReport(report, policy, ledger, root) {
  const errors = [];
  try {
    validateReport(report, policy);
  } catch (error) {
    errors.push(error.message);
  }
  let review = { findings: [], errors: [] };
  try {
    review = reviewFindings(report, ledger, root);
  } catch (error) {
    errors.push(error.message);
  }
  errors.push(...review.errors);
  return {
    engineVersion: report.engineVersion,
    rulesetVersion: report.rulesetVersion,
    schemaVersion: report.schemaVersion,
    score: report.score,
    source: report.source,
    coverage: report.coverage,
    applications: (report.workspace?.projects ?? [])
      .filter((project) => project.kind === "application")
      .map((project) => ({
        ...project,
        floor: policy.applicationFloors[project.packageDir],
      })),
    libraries: (report.workspace?.projects ?? []).filter(
      (project) => project.kind === "library",
    ),
    findings: review.findings,
    errors,
    passed: errors.length === 0,
  };
}

function parseArguments(args) {
  const options = { staged: false, reportOnly: false, output: null };
  while (args.length) {
    const argument = args.shift();
    if (argument === "--staged") options.staged = true;
    else if (argument === "--report-only") options.reportOnly = true;
    else if (argument === "--output" && args[0] && !args[0].startsWith("--"))
      options.output = path.resolve(args.shift());
    else
      throw new Error(
        "Usage: verify:shadscan [--staged] [--report-only] [--output directory]",
      );
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const root = options.staged ? createStagedSnapshot(REPO_ROOT) : REPO_ROOT;
  try {
    const policy = validatePolicy(
      JSON.parse(
        readFileSync(path.join(root, "tooling/shadscan/policy.json"), "utf8"),
      ),
    );
    const ledger = JSON.parse(
      readFileSync(path.join(root, "tooling/shadscan/findings.json"), "utf8"),
    );
    const manifest = JSON.parse(
      readFileSync(path.join(root, "package.json"), "utf8"),
    );
    const cliManifestPath = require.resolve("@shadscan/cli/package.json");
    const cliManifest = JSON.parse(readFileSync(cliManifestPath, "utf8"));
    validateInstalledVersion(
      manifest.devDependencies?.["@shadscan/cli"],
      cliManifest.version,
      policy,
    );
    const binary = path.resolve(
      path.dirname(cliManifestPath),
      cliManifest.bin.shadscan,
    );
    const result = spawnSync(
      process.execPath,
      [binary, root, "--json", "--no-interactive", "--no-roast"],
      {
        cwd: REPO_ROOT,
        encoding: "utf8",
        shell: false,
        env: scannerEnvironment(),
        maxBuffer: 32 * 1024 * 1024,
        timeout: 120_000,
      },
    );
    if (result.error || result.status !== 0)
      throw new Error(
        `Shadscan could not complete (exit ${result.status ?? "unknown"}): ${result.error?.message ?? result.stderr.slice(0, 2000)}`,
      );
    const report = JSON.parse(result.stdout);
    const { AuditReportSchema } = await import("@shadscan/cli");
    AuditReportSchema.parse(report);
    const summary = assessShadscanReport(report, policy, ledger, root);
    summary.input = options.staged ? "git-index" : "working-tree";
    const output =
      options.output ??
      mkdtempSync(path.join(os.tmpdir(), "core-shadscan-report-"));
    mkdirSync(output, { recursive: true });
    writeFileSync(
      path.join(output, "shadscan.raw.json"),
      `${JSON.stringify(report, null, 2)}\n`,
    );
    writeFileSync(
      path.join(output, "shadscan.summary.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
    );
    writeFileSync(
      path.join(output, "shadscan.summary.md"),
      renderSummary(summary),
    );
    console.log(
      `Shadscan ${report.engineVersion} (${report.rulesetVersion}), raw pooled score ${report.score}/100`,
    );
    for (const project of summary.applications)
      console.log(
        `${project.packageDir}: ${project.score}/100; floor ${project.floor}`,
      );
    console.log(
      `${summary.libraries.length} libraries reported separately. Raw report: ${path.join(output, "shadscan.raw.json")}`,
    );
    if (!summary.passed) {
      for (const error of summary.errors) console.error(error);
      return options.reportOnly ? 0 : 1;
    }
    return 0;
  } finally {
    if (options.staged) rmSync(root, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
