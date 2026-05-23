#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  PROJECTS,
  isBranchDeploymentEnabled,
  parseVercelProjectDetails,
} from "./vercel-production-readiness.mjs";

const DEFAULT_REPO = "Asymmetric-al/core";
const DEFAULT_SCOPE = "asymmetric-al";
const PRODUCTION_BRANCH = "epic";
const STAGING_BRANCH = "develop";
const REQUIRED_BUILD_QUEUE_CONFIGURATION = "WAIT_FOR_NAMESPACE_QUEUE";

export const EXPECTED_IGNORE_COMMANDS = Object.freeze({
  admin: "node ../../scripts/vercel/should-ignore-build.mjs admin",
  donor: "node ../../scripts/vercel/should-ignore-build.mjs donor",
  missionary: "node ../../scripts/vercel/should-ignore-build.mjs missionary",
});

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
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

function check(ok, label, detail) {
  return { ok, label, detail };
}

function requireCheck(checks, ok, label, detail) {
  checks.push(check(ok, label, detail));
}

function readLocalVercelConfig(project) {
  return parseJson(readFileSync(project.vercelConfigPath, "utf8"));
}

function listEnabledBranches(config) {
  const setting = config?.git?.deploymentEnabled;
  if (!setting || typeof setting !== "object") return [];

  return Object.entries(setting)
    .filter(([, enabled]) => enabled === true)
    .map(([branch]) => branch)
    .sort();
}

export function validateLocalVercelConfig({ project, config }) {
  const checks = [];
  const expectedIgnoreCommand = EXPECTED_IGNORE_COMMANDS[project.key];
  const enabledBranches = listEnabledBranches(config);
  const onlyExpectedBranches =
    enabledBranches.length === 2 &&
    enabledBranches.includes(PRODUCTION_BRANCH) &&
    enabledBranches.includes(STAGING_BRANCH);

  requireCheck(
    checks,
    config?.ignoreCommand === expectedIgnoreCommand,
    `${project.project} ignored-build command`,
    config?.ignoreCommand ?? "<missing>",
  );
  requireCheck(
    checks,
    isBranchDeploymentEnabled(config, PRODUCTION_BRANCH),
    `${project.project} allows ${PRODUCTION_BRANCH} deployments`,
    JSON.stringify(config?.git?.deploymentEnabled ?? null),
  );
  requireCheck(
    checks,
    isBranchDeploymentEnabled(config, STAGING_BRANCH),
    `${project.project} allows ${STAGING_BRANCH} deployments`,
    JSON.stringify(config?.git?.deploymentEnabled ?? null),
  );
  requireCheck(
    checks,
    !isBranchDeploymentEnabled(config, "main") &&
      !isBranchDeploymentEnabled(config, "feature/example"),
    `${project.project} blocks non-release Git deployments`,
    JSON.stringify(config?.git?.deploymentEnabled ?? null),
  );
  requireCheck(
    checks,
    onlyExpectedBranches,
    `${project.project} enabled deployment branch list`,
    enabledBranches.join(", ") || "<none>",
  );

  return checks;
}

function contextNames(protection) {
  const checks = protection?.required_status_checks?.checks;
  if (Array.isArray(checks) && checks.length > 0) {
    return checks
      .map((item) => item.context)
      .filter((context) => typeof context === "string");
  }

  const contexts = protection?.required_status_checks?.contexts;
  return Array.isArray(contexts) ? contexts : [];
}

function deploymentEnvironmentNames({ protection, branchRule }) {
  if (Array.isArray(branchRule?.requiredDeploymentEnvironments)) {
    return branchRule.requiredDeploymentEnvironments;
  }

  const environments = protection?.required_deployments?.environments;
  if (Array.isArray(environments)) {
    return environments
      .map((environment) => environment?.name)
      .filter((name) => typeof name === "string");
  }

  return [];
}

export function validateGitHubBranchProtection({
  branch,
  protection,
  branchRule,
  requiredContexts,
  forbiddenContexts = [],
}) {
  const checks = [];
  const contexts = contextNames(protection);
  const requiredDeploymentEnvironments = deploymentEnvironmentNames({
    protection,
    branchRule,
  });
  const forcePushesAllowed =
    typeof branchRule?.allowsForcePushes === "boolean"
      ? branchRule.allowsForcePushes
      : protection?.allow_force_pushes?.enabled;
  const requiresDeployments =
    typeof branchRule?.requiresDeployments === "boolean"
      ? branchRule.requiresDeployments
      : requiredDeploymentEnvironments.length > 0;

  requireCheck(
    checks,
    forcePushesAllowed === false,
    `${branch} force pushes disabled`,
    `allowsForcePushes=${forcePushesAllowed ?? "unknown"}`,
  );
  requireCheck(
    checks,
    protection?.required_status_checks?.strict === true,
    `${branch} requires up-to-date status checks`,
    `strict=${protection?.required_status_checks?.strict ?? "unknown"}`,
  );

  for (const context of requiredContexts) {
    requireCheck(
      checks,
      contexts.includes(context),
      `${branch} requires ${context}`,
      contexts.join(", ") || "<none>",
    );
  }
  for (const context of forbiddenContexts) {
    requireCheck(
      checks,
      !contexts.includes(context),
      `${branch} does not require ${context}`,
      contexts.join(", ") || "<none>",
    );
  }

  const reviewCount =
    protection?.required_pull_request_reviews?.required_approving_review_count;
  requireCheck(
    checks,
    typeof reviewCount === "number" && reviewCount >= 1,
    `${branch} keeps review discipline`,
    `required_approving_review_count=${reviewCount ?? "unknown"}`,
  );
  requireCheck(
    checks,
    requiresDeployments === false &&
      requiredDeploymentEnvironments.length === 0,
    `${branch} does not require disabled Vercel Preview deployments`,
    requiredDeploymentEnvironments.join(", ") || "requiresDeployments=false",
  );

  return checks;
}

function resolveBuildQueueConfiguration(settings) {
  return (
    settings?.resourceConfig?.buildQueue?.configuration ??
    settings?.defaultResourceConfig?.buildQueue?.configuration ??
    null
  );
}

export function validateVercelProjectSettings({ project, settings }) {
  const checks = [];
  const projectDetails = parseVercelProjectDetails(JSON.stringify(settings));
  const buildQueueConfiguration = resolveBuildQueueConfiguration(settings);

  requireCheck(
    checks,
    projectDetails.productionBranch === PRODUCTION_BRANCH,
    `${project.project} production branch is ${PRODUCTION_BRANCH}`,
    projectDetails.productionBranch || "<unknown>",
  );
  requireCheck(
    checks,
    settings?.previewDeploymentsDisabled === true,
    `${project.project} preview deployments disabled`,
    `previewDeploymentsDisabled=${settings?.previewDeploymentsDisabled ?? "unknown"}`,
  );
  requireCheck(
    checks,
    settings?.enableAffectedProjectsDeployments === true,
    `${project.project} affected-project deployments enabled`,
    `enableAffectedProjectsDeployments=${settings?.enableAffectedProjectsDeployments ?? "unknown"}`,
  );
  requireCheck(
    checks,
    buildQueueConfiguration === REQUIRED_BUILD_QUEUE_CONFIGURATION,
    `${project.project} build queue is serialized per branch`,
    `buildQueue.configuration=${buildQueueConfiguration ?? "unknown"}`,
  );

  return checks;
}

export function formatDeploymentDisciplineReport(checks) {
  const lines = ["# Deployment Discipline", ""];

  for (const item of checks) {
    lines.push(`- ${item.ok ? "PASS" : "FAIL"} ${item.label}: ${item.detail}`);
  }

  const failed = checks.filter((item) => !item.ok);
  lines.push("");
  lines.push(
    failed.length === 0
      ? "Overall: READY"
      : `Overall: BLOCKED (${failed.length} failed checks)`,
  );
  lines.push("");

  return lines.join("\n");
}

function readDefaultBranch(repo) {
  const output = run("gh", [
    "repo",
    "view",
    repo,
    "--json",
    "defaultBranchRef",
  ]);
  const parsed = parseJson(output);
  return parsed?.defaultBranchRef?.name ?? "";
}

function readGitHubProtection(repo, branch) {
  const output = run("gh", [
    "api",
    `repos/${repo}/branches/${branch}/protection`,
  ]);
  return parseJson(output);
}

function readGitHubBranchProtectionRule(repo, branch) {
  const [owner, name] = repo.split("/");
  const output = run("gh", [
    "api",
    "graphql",
    "-f",
    `owner=${owner}`,
    "-f",
    `name=${name}`,
    "-f",
    "query=query($owner:String!, $name:String!) { repository(owner:$owner, name:$name) { branchProtectionRules(first: 50) { nodes { pattern allowsForcePushes requiresDeployments requiredDeploymentEnvironments } } } }",
  ]);
  const parsed = parseJson(output);
  const rules = parsed?.data?.repository?.branchProtectionRules?.nodes ?? [];

  return rules.find((rule) => rule?.pattern === branch) ?? null;
}

function readVercelProject(project, scope) {
  const output = run("vercel", [
    "api",
    `/v10/projects/${project.project}`,
    "--scope",
    scope,
    "--raw",
  ]);
  return parseJson(output);
}

function parseArgs(argv) {
  const args = {
    repo: DEFAULT_REPO,
    scope: DEFAULT_SCOPE,
    skipRemote: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo") {
      args.repo = argv.at(index + 1) ?? args.repo;
      index += 1;
    } else if (arg === "--scope") {
      args.scope = argv.at(index + 1) ?? args.scope;
      index += 1;
    } else if (arg === "--skip-remote") {
      args.skipRemote = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/verify/deployment-discipline.mjs [options]

Verifies that local Vercel config, GitHub branch protection, and Vercel project
settings match the production deployment discipline policy.

Options:
  --repo <owner/name>  GitHub repository. Default: ${DEFAULT_REPO}
  --scope <team>      Vercel team scope. Default: ${DEFAULT_SCOPE}
  --skip-remote       Check only source-controlled local configuration
  -h, --help          Show this help
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const checks = [];

  for (const project of PROJECTS) {
    checks.push(
      ...validateLocalVercelConfig({
        project,
        config: readLocalVercelConfig(project),
      }),
    );
  }

  if (!args.skipRemote) {
    const defaultBranch = readDefaultBranch(args.repo);
    requireCheck(
      checks,
      defaultBranch === PRODUCTION_BRANCH,
      `GitHub default branch is ${PRODUCTION_BRANCH}`,
      defaultBranch || "<unknown>",
    );

    checks.push(
      ...validateGitHubBranchProtection({
        branch: PRODUCTION_BRANCH,
        protection: readGitHubProtection(args.repo, PRODUCTION_BRANCH),
        branchRule: readGitHubBranchProtectionRule(
          args.repo,
          PRODUCTION_BRANCH,
        ),
        requiredContexts: ["ci-gate", "integration-gate", "e2e-gate"],
        forbiddenContexts: ["e2e-smoke-gate"],
      }),
    );
    checks.push(
      ...validateGitHubBranchProtection({
        branch: STAGING_BRANCH,
        protection: readGitHubProtection(args.repo, STAGING_BRANCH),
        branchRule: readGitHubBranchProtectionRule(args.repo, STAGING_BRANCH),
        requiredContexts: ["ci-gate", "integration-gate", "e2e-smoke-gate"],
        forbiddenContexts: ["e2e-gate"],
      }),
    );

    for (const project of PROJECTS) {
      checks.push(
        ...validateVercelProjectSettings({
          project,
          settings: readVercelProject(project, args.scope),
        }),
      );
    }
  }

  console.log(formatDeploymentDisciplineReport(checks));

  if (checks.some((item) => !item.ok)) {
    process.exitCode = 1;
  }
}

const isDirectRun =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  await main();
}
