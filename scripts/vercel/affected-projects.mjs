#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_SCOPE = "asymmetric-al";
export const TEAM_ID = "team_YrLB8jJARcRH0jnF1HPpPGTB";

export const VERCEL_PROJECTS = Object.freeze([
  {
    key: "admin",
    project: "admin",
    id: "prj_SB9DucsrJOT0wF1v43SWMFsSNdn8",
    rootDirectory: "apps/admin",
  },
  {
    key: "donor",
    project: "donor",
    id: "prj_dZG3XkklLVZyqm85FW5Vvv7ph3kL",
    rootDirectory: "apps/donor",
  },
  {
    key: "missionary",
    project: "missionary",
    id: "prj_6tXSJKsdv2JpK70GKkg9HIg5hiYN",
    rootDirectory: "apps/missionary",
  },
]);

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: options.input
      ? ["pipe", "pipe", "pipe"]
      : ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function parseJson(text, fallback = {}) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function createAffectedProjectsPatch(enabled) {
  return {
    enableAffectedProjectsDeployments: enabled,
  };
}

export function buildProjectEndpoint(project, version) {
  return `/${version}/projects/${project.id}?teamId=${TEAM_ID}`;
}

export function runVercelApi({
  endpoint,
  method = "GET",
  body,
  scope = DEFAULT_SCOPE,
  runCommand = run,
}) {
  const args = ["api", endpoint, "--scope", scope, "--raw"];

  if (method !== "GET") {
    args.push("-X", method);
  }

  const options = {};
  if (body !== undefined) {
    args.push("--input", "-");
    options.input =
      typeof body === "string" ? body : `${JSON.stringify(body)}\n`;
  }

  return runCommand("vercel", args, options);
}

export function normalizeProjectStatus(project, projectJson) {
  const settings =
    typeof projectJson === "string" ? parseJson(projectJson) : projectJson;

  return {
    key: project.key,
    project: settings?.name ?? project.project,
    id: settings?.id ?? project.id,
    expectedRootDirectory: project.rootDirectory,
    rootDirectory: settings?.rootDirectory ?? "",
    enableAffectedProjectsDeployments:
      settings?.enableAffectedProjectsDeployments === true,
    sourceFilesOutsideRootDirectory:
      settings?.sourceFilesOutsideRootDirectory === true,
    previewDeploymentsDisabled: settings?.previewDeploymentsDisabled === true,
  };
}

export function validateProjectStatus(status, { expectEnabled = true } = {}) {
  const problems = [];

  if (
    status.id !== VERCEL_PROJECTS.find((item) => item.key === status.key)?.id
  ) {
    problems.push("project id mismatch");
  }

  if (status.rootDirectory !== status.expectedRootDirectory) {
    problems.push("root directory mismatch");
  }

  if (status.enableAffectedProjectsDeployments !== expectEnabled) {
    problems.push(
      `affected-project deployments expected ${String(expectEnabled)}`,
    );
  }

  if (!status.sourceFilesOutsideRootDirectory) {
    problems.push("source files outside root directory not enabled");
  }

  if (!status.previewDeploymentsDisabled) {
    problems.push("preview deployments not disabled");
  }

  return problems;
}

export function publicProjectStatus(status, { expectEnabled = true } = {}) {
  const problems = validateProjectStatus(status, { expectEnabled });

  return {
    ok: problems.length === 0,
    project: status.project,
    id: status.id,
    rootDirectory: status.rootDirectory,
    enableAffectedProjectsDeployments: status.enableAffectedProjectsDeployments,
    problems,
  };
}

export function readProjectStatus(project, options = {}) {
  const output = runVercelApi({
    endpoint: buildProjectEndpoint(project, "v10"),
    scope: options.scope,
    runCommand: options.runCommand,
  });

  return normalizeProjectStatus(project, output);
}

export function readAllProjectStatuses(options = {}) {
  return VERCEL_PROJECTS.map((project) => readProjectStatus(project, options));
}

export function patchAffectedProjectDeployments(
  project,
  enabled,
  options = {},
) {
  return runVercelApi({
    endpoint: buildProjectEndpoint(project, "v9"),
    method: "PATCH",
    body: createAffectedProjectsPatch(enabled),
    scope: options.scope,
    runCommand: options.runCommand,
  });
}

export function createSnapshotPayload(
  statuses,
  { action, scope, now = new Date() },
) {
  return {
    capturedAt: now.toISOString(),
    action,
    scope,
    teamId: TEAM_ID,
    projects: statuses.map((status) => publicProjectStatus(status)),
  };
}

export function writeSnapshotFile(statuses, options) {
  const timestamp = options.now
    ? options.now.toISOString()
    : new Date().toISOString();
  const safeTimestamp = timestamp.replaceAll(/[:.]/g, "-");
  const snapshotPath = path.join(
    "/tmp",
    `asym-vercel-affected-projects-${options.action}-${safeTimestamp}.json`,
  );

  writeFileSync(
    snapshotPath,
    `${JSON.stringify(createSnapshotPayload(statuses, options), null, 2)}\n`,
    "utf8",
  );

  return snapshotPath;
}

export function setAffectedProjectDeployments({
  enabled,
  scope = DEFAULT_SCOPE,
  runCommand,
  writeSnapshot = writeSnapshotFile,
}) {
  const action = enabled ? "enable" : "disable";
  const before = readAllProjectStatuses({ scope, runCommand });
  const snapshotPath = writeSnapshot(before, {
    action: `before-${action}`,
    scope,
  });

  for (const project of VERCEL_PROJECTS) {
    patchAffectedProjectDeployments(project, enabled, { scope, runCommand });
  }

  const after = readAllProjectStatuses({ scope, runCommand });

  return {
    action,
    scope,
    snapshotPath,
    before,
    after,
  };
}

export function buildReport({
  action,
  scope = DEFAULT_SCOPE,
  statuses,
  snapshotPath = null,
  expectEnabled = true,
}) {
  const projects = statuses.map((status) =>
    publicProjectStatus(status, { expectEnabled }),
  );
  const ok = projects.every((project) => project.ok);

  return {
    ok,
    action,
    scope,
    snapshotPath,
    projects,
  };
}

export function formatReport(report) {
  const lines = [
    "# Vercel Affected-Project Deployments",
    "",
    `Action: ${report.action}`,
    `Scope: ${report.scope}`,
  ];

  if (report.snapshotPath) {
    lines.push(`Snapshot: ${report.snapshotPath}`);
  }

  lines.push("");

  for (const project of report.projects) {
    const status = project.ok ? "PASS" : "FAIL";
    const details = [
      `id=${project.id}`,
      `root=${project.rootDirectory}`,
      `affected=${String(project.enableAffectedProjectsDeployments)}`,
    ].join("; ");
    const suffix =
      project.problems.length > 0 ? ` (${project.problems.join("; ")})` : "";

    lines.push(`- ${status} ${project.project}: ${details}${suffix}`);
  }

  lines.push("");
  lines.push(report.ok ? "Overall: READY" : "Overall: BLOCKED");
  lines.push("");

  return lines.join("\n");
}

function parseArgs(argv) {
  const args = {
    action: "check",
    scope: DEFAULT_SCOPE,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--check") {
      args.action = "check";
    } else if (arg === "--enable") {
      args.action = "enable";
    } else if (arg === "--disable") {
      args.action = "disable";
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--scope") {
      args.scope = argv.at(index + 1) ?? args.scope;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/vercel/affected-projects.mjs [options]

Verifies or updates Vercel affected-project deployments for Core app projects.
Secret values are never printed.

Options:
  --check             Verify affected-project deployments are enabled (default)
  --enable            Enable affected-project deployments on all three projects
  --disable           Disable affected-project deployments on all three projects
  --json              Print machine-readable JSON
  --scope <team>      Vercel team scope. Default: ${DEFAULT_SCOPE}
  -h, --help          Show this help
`);
}

function printOutput(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReport(report));
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (args.action === "enable" || args.action === "disable") {
    const enabled = args.action === "enable";
    const result = setAffectedProjectDeployments({
      enabled,
      scope: args.scope,
    });
    const report = buildReport({
      action: result.action,
      scope: result.scope,
      statuses: result.after,
      snapshotPath: result.snapshotPath,
      expectEnabled: enabled,
    });

    printOutput(report, args.json);
    process.exitCode = report.ok ? 0 : 1;
    return;
  }

  const statuses = readAllProjectStatuses({ scope: args.scope });
  const report = buildReport({
    action: "check",
    scope: args.scope,
    statuses,
    expectEnabled: true,
  });

  printOutput(report, args.json);
  process.exitCode = report.ok ? 0 : 1;
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  try {
    main();
  } catch (error) {
    console.error(
      `vercel:affected-projects failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    process.exitCode = 1;
  }
}
