// Advisory Shadscan workspace audit. It writes the raw report and a summary,
// and exits 0 whenever a valid report exists, whatever the scores. It exits
// non-zero only when no valid report could be produced.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { renderSummary, summarizeReport } from "./shadscan-summary.mjs";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const require = createRequire(import.meta.url);

// The CI step allows 10 minutes; stop the scanner first so the script can
// still report why no report exists.
export const SCAN_TIMEOUT_MS = 540_000;

export function validateInstalledVersion(declaredVersion, installedVersion) {
  if (
    typeof declaredVersion !== "string" ||
    !/^\d+\.\d+\.\d+$/.test(declaredVersion) ||
    declaredVersion !== installedVersion
  ) {
    throw new Error(
      "Declared and installed Shadscan versions must match exactly; run bun ci before auditing",
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

export function scannerArguments(binary, root, platform = process.platform) {
  return [
    ...(platform === "win32"
      ? ["--import", new URL("./shadscan-glob.mjs", import.meta.url).href]
      : []),
    binary,
    root,
    "--json",
    "--no-interactive",
    "--no-roast",
  ];
}

export function resolveScanner(repoRoot = REPO_ROOT) {
  const manifest = JSON.parse(
    readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  );
  const cliManifestPath = require.resolve("@shadscan/cli/package.json");
  const cliManifest = JSON.parse(readFileSync(cliManifestPath, "utf8"));
  return {
    binary: path.resolve(
      path.dirname(cliManifestPath),
      cliManifest.bin.shadscan,
    ),
    declaredVersion: manifest.devDependencies?.["@shadscan/cli"],
    installedVersion: cliManifest.version,
  };
}

export function runScanner({ binary, root, timeoutMs, environment, platform }) {
  const result = spawnSync(
    process.execPath,
    scannerArguments(binary, root, platform),
    {
      cwd: REPO_ROOT,
      encoding: "utf8",
      shell: false,
      env: scannerEnvironment(environment),
      maxBuffer: 32 * 1024 * 1024,
      timeout: timeoutMs,
    },
  );
  if (result.error?.code === "ETIMEDOUT")
    throw new Error(
      `Shadscan did not finish within ${Math.round(timeoutMs / 1000)} seconds`,
    );
  if (result.error || result.status !== 0)
    throw new Error(
      `Shadscan could not complete (exit ${result.status ?? "unknown"}): ${result.error?.message ?? (result.stderr ?? "").slice(0, 2000)}`,
    );
  return result.stdout;
}

export function parseReport(stdout, schema, installedVersion) {
  let report;
  try {
    report = JSON.parse(stdout);
  } catch {
    throw new Error("Shadscan did not return a JSON report");
  }
  const parsed = schema.safeParse(report);
  if (!parsed.success)
    throw new Error(
      `Shadscan report does not match the installed report schema: ${parsed.error.issues
        .slice(0, 5)
        .map((issue) => `${issue.path.join(".") || "(root)"} ${issue.message}`)
        .join("; ")}`,
    );
  if (report.engineVersion !== installedVersion)
    throw new Error(
      `Shadscan report engine ${report.engineVersion} does not match the installed ${installedVersion}`,
    );
  return report;
}

function parseArguments(args) {
  const options = { output: null };
  const remaining = [...args];
  while (remaining.length) {
    const argument = remaining.shift();
    if (
      argument === "--output" &&
      remaining[0] &&
      !remaining[0].startsWith("--")
    )
      options.output = path.resolve(remaining.shift());
    else throw new Error("Usage: shadscan:audit [--output directory]");
  }
  return options;
}

// `overrides` lets tests audit a fixture workspace or a stand-in scanner.
export async function main(argv = process.argv.slice(2), overrides = {}) {
  const log = overrides.log ?? console.log;
  const error = overrides.error ?? console.error;
  try {
    const options = parseArguments(argv);
    const scanner = overrides.scanner ?? resolveScanner();
    validateInstalledVersion(scanner.declaredVersion, scanner.installedVersion);
    const stdout = runScanner({
      binary: scanner.binary,
      root: overrides.root ?? REPO_ROOT,
      timeoutMs: overrides.timeoutMs ?? SCAN_TIMEOUT_MS,
      environment: overrides.environment ?? process.env,
      platform: overrides.platform ?? process.platform,
    });
    const schema =
      overrides.schema ?? (await import("@shadscan/cli")).AuditReportSchema;
    const report = parseReport(stdout, schema, scanner.installedVersion);
    const summary = summarizeReport(report);
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
    log(
      `Shadscan ${report.engineVersion} (${report.rulesetVersion}), pooled application score ${report.score ?? "unassessed"}/100 (advisory)`,
    );
    for (const app of summary.applications)
      log(
        app.discovered
          ? `${app.packageDir}: ${app.score ?? "unassessed"}/100, ${app.failingRules.length} failing rules`
          : `${app.packageDir}: not discovered`,
      );
    log(`Report: ${output}`);
    return 0;
  } catch (failure) {
    error(failure instanceof Error ? failure.message : String(failure));
    return 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = await main();
}
