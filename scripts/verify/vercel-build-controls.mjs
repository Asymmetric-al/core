#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveBuildDecision } from "../vercel/should-ignore-build.mjs";

const DEFAULT_SCOPE = "asymmetric-al";
const DEFAULT_TEAM_ID = "team_YrLB8jJARcRH0jnF1HPpPGTB";
const REQUIRED_BUILD_QUEUE_CONFIGURATION = "WAIT_FOR_NAMESPACE_QUEUE";
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const EXPECTED_PROJECTS = Object.freeze([
  Object.freeze({
    key: "admin",
    projectId: "prj_SB9DucsrJOT0wF1v43SWMFsSNdn8",
    rootDirectory: "apps/admin",
    vercelConfigPath: "apps/admin/vercel.json",
    installCommand: "bun install --cwd ../.. --frozen-lockfile",
    buildCommand: "cd ../.. && bun run build:admin",
    ignoreCommand: "node ../../scripts/vercel/should-ignore-build.mjs admin",
  }),
  Object.freeze({
    key: "donor",
    projectId: "prj_dZG3XkklLVZyqm85FW5Vvv7ph3kL",
    rootDirectory: "apps/donor",
    vercelConfigPath: "apps/donor/vercel.json",
    installCommand: "bun install --cwd ../.. --frozen-lockfile",
    buildCommand: "cd ../.. && bun run build:donor",
    ignoreCommand: "node ../../scripts/vercel/should-ignore-build.mjs donor",
  }),
  Object.freeze({
    key: "missionary",
    projectId: "prj_6tXSJKsdv2JpK70GKkg9HIg5hiYN",
    rootDirectory: "apps/missionary",
    vercelConfigPath: "apps/missionary/vercel.json",
    installCommand: "bun install --cwd ../.. --frozen-lockfile",
    buildCommand: "cd ../.. && bun run build:missionary",
    ignoreCommand:
      "node ../../scripts/vercel/should-ignore-build.mjs missionary",
  }),
]);

export const IGNORED_BUILD_SCENARIOS = Object.freeze([
  Object.freeze({
    name: "docs-only change",
    changedFiles: Object.freeze([
      "docs/ops/environments.md",
      "docs/ops/phase-evidence/2026-05-15_phase-11.md",
      "openspec/changes/reduce-deploy-spend/proposal.md",
    ]),
    expected: Object.freeze({
      admin: false,
      donor: false,
      missionary: false,
    }),
  }),
  Object.freeze({
    name: "admin-only app change",
    changedFiles: Object.freeze(["apps/admin/app/(app)/page.tsx"]),
    expected: Object.freeze({
      admin: true,
      donor: false,
      missionary: false,
    }),
  }),
  Object.freeze({
    name: "donor-only app change",
    changedFiles: Object.freeze(["apps/donor/app/page.tsx"]),
    expected: Object.freeze({
      admin: false,
      donor: true,
      missionary: false,
    }),
  }),
  Object.freeze({
    name: "missionary-only app change",
    changedFiles: Object.freeze(["apps/missionary/app/page.tsx"]),
    expected: Object.freeze({
      admin: false,
      donor: false,
      missionary: true,
    }),
  }),
  Object.freeze({
    name: "shared package change",
    changedFiles: Object.freeze(["packages/ui/components/button.tsx"]),
    expected: Object.freeze({
      admin: true,
      donor: true,
      missionary: true,
    }),
  }),
  Object.freeze({
    name: "root manifest change",
    changedFiles: Object.freeze(["package.json"]),
    expected: Object.freeze({
      admin: true,
      donor: true,
      missionary: true,
    }),
  }),
  Object.freeze({
    name: "turbo config change",
    changedFiles: Object.freeze(["turbo.json"]),
    expected: Object.freeze({
      admin: true,
      donor: true,
      missionary: true,
    }),
  }),
]);

function check(ok, label, detail) {
  return {
    ok: Boolean(ok),
    label,
    detail: detail ?? "",
  };
}

function requireCheck(checks, ok, label, detail) {
  checks.push(check(ok, label, detail));
}

function readText(filePath) {
  return readFileSync(path.join(REPO_ROOT, filePath), "utf8");
}

function parseJson(text, fallback = {}) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function readJsonFile(filePath) {
  return parseJson(readText(filePath));
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function commandErrorMessage(error) {
  const stderr =
    typeof error?.stderr?.toString === "function"
      ? error.stderr.toString("utf8").trim()
      : "";
  const stdout =
    typeof error?.stdout?.toString === "function"
      ? error.stdout.toString("utf8").trim()
      : "";

  return stderr || stdout || error?.message || String(error);
}

function hasExactLine(text, expectedLine) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .includes(expectedLine);
}

function sameObject(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function buildMatrix(changedFiles) {
  return Object.fromEntries(
    EXPECTED_PROJECTS.map((project) => [
      project.key,
      resolveBuildDecision({
        app: project.key,
        changedFiles,
      }).build,
    ]),
  );
}

export function validateLocalVercelConfig({ project, config }) {
  const checks = [];
  const branchGate = config?.git?.deploymentEnabled;

  requireCheck(
    checks,
    config?.installCommand === project.installCommand,
    `${project.key} vercel.json installCommand`,
    config?.installCommand ?? "<missing>",
  );
  requireCheck(
    checks,
    config?.buildCommand === project.buildCommand,
    `${project.key} vercel.json buildCommand`,
    config?.buildCommand ?? "<missing>",
  );
  requireCheck(
    checks,
    config?.ignoreCommand === project.ignoreCommand,
    `${project.key} vercel.json ignoreCommand`,
    config?.ignoreCommand ?? "<missing>",
  );
  requireCheck(
    checks,
    branchGate?.["*"] === false &&
      branchGate?.develop === true &&
      branchGate?.production === true &&
      branchGate?.main === false,
    `${project.key} vercel.json branch deployment gate preserved`,
    JSON.stringify(branchGate ?? null),
  );

  return checks;
}

export function validateLocalVercelConfigs() {
  return EXPECTED_PROJECTS.flatMap((project) =>
    validateLocalVercelConfig({
      project,
      config: readJsonFile(project.vercelConfigPath),
    }),
  );
}

export function validateTurboIgnoreFiles() {
  const checks = [];
  const gitignore = readText(".gitignore");
  const vercelignore = readText(".vercelignore");

  requireCheck(
    checks,
    hasExactLine(gitignore, ".turbo"),
    ".gitignore keeps .turbo ignored",
    ".turbo",
  );
  requireCheck(
    checks,
    hasExactLine(vercelignore, ".turbo"),
    ".vercelignore keeps .turbo ignored",
    ".turbo",
  );

  return checks;
}

export function validateIgnoredBuildDecisionMatrix() {
  const checks = [];

  for (const scenario of IGNORED_BUILD_SCENARIOS) {
    const actual = buildMatrix(scenario.changedFiles);
    requireCheck(
      checks,
      sameObject(actual, scenario.expected),
      `ignored-build matrix: ${scenario.name}`,
      `expected ${JSON.stringify(scenario.expected)}, got ${JSON.stringify(actual)}`,
    );
  }

  const unknownAppDecision = resolveBuildDecision({
    app: "unknown",
    changedFiles: ["docs/ops/environments.md"],
  });
  requireCheck(
    checks,
    unknownAppDecision.build === true,
    "ignored-build matrix: unknown app fails closed",
    unknownAppDecision.reason,
  );

  const missingDiffDecision = resolveBuildDecision({
    app: "admin",
    changedFiles: [],
  });
  requireCheck(
    checks,
    missingDiffDecision.build === true,
    "ignored-build matrix: missing diff fails closed",
    missingDiffDecision.reason,
  );

  const emptyDiffDecision = resolveBuildDecision({
    app: "admin",
    changedFiles: ["", "   "],
  });
  requireCheck(
    checks,
    emptyDiffDecision.build === true,
    "ignored-build matrix: empty diff fails closed",
    emptyDiffDecision.reason,
  );

  return checks;
}

function readVercelProject(project, scope) {
  const output = run("vercel", [
    "api",
    `/v10/projects/${project.projectId}`,
    "--scope",
    scope,
    "--raw",
  ]);
  return parseJson(output);
}

function readRemoteCacheStatus(teamId) {
  const output = run("vercel", [
    "api",
    `/v8/artifacts/status?teamId=${teamId}`,
    "--raw",
  ]);
  return parseJson(output);
}

export function validateVercelProjectSettings({ project, settings }) {
  const checks = [];
  const buildQueueConfiguration =
    settings?.resourceConfig?.buildQueue?.configuration ??
    settings?.defaultResourceConfig?.buildQueue?.configuration ??
    null;

  requireCheck(
    checks,
    settings?.id === project.projectId,
    `${project.key} Vercel project id`,
    settings?.id ?? "<missing>",
  );
  requireCheck(
    checks,
    settings?.name === project.key,
    `${project.key} Vercel project name`,
    settings?.name ?? "<missing>",
  );
  requireCheck(
    checks,
    settings?.rootDirectory === project.rootDirectory,
    `${project.key} Vercel rootDirectory`,
    settings?.rootDirectory ?? "<missing>",
  );
  requireCheck(
    checks,
    settings?.enableAffectedProjectsDeployments === true,
    `${project.key} Vercel affected-project deployments enabled`,
    `enableAffectedProjectsDeployments=${settings?.enableAffectedProjectsDeployments ?? "unknown"}`,
  );
  requireCheck(
    checks,
    settings?.previewDeploymentsDisabled === true,
    `${project.key} Vercel preview deployments disabled`,
    `previewDeploymentsDisabled=${settings?.previewDeploymentsDisabled ?? "unknown"}`,
  );
  requireCheck(
    checks,
    buildQueueConfiguration === REQUIRED_BUILD_QUEUE_CONFIGURATION,
    `${project.key} Vercel build queue serialized`,
    `buildQueue.configuration=${buildQueueConfiguration ?? "unknown"}`,
  );

  return checks;
}

export function validateRemoteCacheStatus(status) {
  return [
    check(
      status?.status === "enabled",
      "Vercel Remote Cache status",
      `status=${status?.status ?? "unknown"}`,
    ),
  ];
}

function validateRemoteVercelSettings({ scope, teamId }) {
  const checks = [];

  for (const project of EXPECTED_PROJECTS) {
    try {
      checks.push(
        ...validateVercelProjectSettings({
          project,
          settings: readVercelProject(project, scope),
        }),
      );
    } catch (error) {
      requireCheck(
        checks,
        false,
        `${project.key} Vercel project settings readable`,
        commandErrorMessage(error),
      );
    }
  }

  try {
    checks.push(...validateRemoteCacheStatus(readRemoteCacheStatus(teamId)));
  } catch (error) {
    requireCheck(
      checks,
      false,
      "Vercel Remote Cache status readable",
      commandErrorMessage(error),
    );
  }

  return checks;
}

export function formatBuildControlsReport(checks, { scope, teamId, remote }) {
  const lines = [
    "# Vercel Build Controls",
    "",
    `Scope: ${scope}`,
    `Team: ${teamId}`,
    `Remote API checks: ${remote ? "enabled" : "skipped"}`,
    "Secret values printed: no",
    "",
  ];

  for (const item of checks) {
    lines.push(`- ${item.ok ? "PASS" : "FAIL"} ${item.label}: ${item.detail}`);
  }

  const failures = checks.filter((item) => !item.ok);
  lines.push("");
  lines.push(
    failures.length === 0
      ? "Overall: READY"
      : `Overall: BLOCKED (${failures.length} failed checks)`,
  );
  lines.push("");

  return lines.join("\n");
}

function parseArgs(argv) {
  const args = {
    scope: DEFAULT_SCOPE,
    teamId: DEFAULT_TEAM_ID,
    skipVercelApi: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--scope") {
      args.scope = argv.at(index + 1) ?? args.scope;
      index += 1;
    } else if (arg === "--team-id") {
      args.teamId = argv.at(index + 1) ?? args.teamId;
      index += 1;
    } else if (arg === "--skip-vercel-api" || arg === "--skip-remote") {
      args.skipVercelApi = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/verify/vercel-build-controls.mjs [options]

Verifies the monorepo build-control model for the admin, donor, and missionary
Vercel projects.

Options:
  --scope <team>        Vercel team scope. Default: ${DEFAULT_SCOPE}
  --team-id <team_id>   Vercel team id for Remote Cache status. Default: ${DEFAULT_TEAM_ID}
  --skip-vercel-api     Check only source-controlled local configuration
  --skip-remote         Alias for --skip-vercel-api
  -h, --help            Show this help
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const checks = [
    ...validateLocalVercelConfigs(),
    ...validateTurboIgnoreFiles(),
    ...validateIgnoredBuildDecisionMatrix(),
  ];

  if (!args.skipVercelApi) {
    checks.push(
      ...validateRemoteVercelSettings({
        scope: args.scope,
        teamId: args.teamId,
      }),
    );
  }

  console.log(
    formatBuildControlsReport(checks, {
      scope: args.scope,
      teamId: args.teamId,
      remote: !args.skipVercelApi,
    }),
  );

  if (checks.some((item) => !item.ok)) {
    process.exitCode = 1;
  }
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (executedPath === fileURLToPath(import.meta.url)) {
  await main();
}
