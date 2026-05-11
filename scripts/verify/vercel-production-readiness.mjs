#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_SCOPE = "asymmetric-al";

const isNonEmpty = (value) => typeof value === "string" && value.length > 0;
const hasPrefix = (prefix) => (value) => value.startsWith(prefix);
const hasMinLength = (length) => (value) => value.length >= length;
const isBooleanString = (value) => value === "true" || value === "false";
const isUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};
const isPostgresUrl = (value) =>
  value.startsWith("postgres://") || value.startsWith("postgresql://");

const required = (key, reason = "must be set", validate = isNonEmpty) => ({
  key,
  reason,
  validate,
});

const COMMON_REQUIRED_ENV = [
  required("NEXT_PUBLIC_SUPABASE_URL", "must be a URL", isUrl),
  required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  required("SUPABASE_SERVICE_ROLE_KEY"),
  required("NEXT_PUBLIC_APP_URL", "must be a URL", isUrl),
  required("NEXT_PUBLIC_SITE_URL", "must be a URL", isUrl),
  required("NEXT_PUBLIC_MAIN_DOMAIN"),
  required(
    "NEXT_PUBLIC_CLOUDINARY_ENABLED",
    "must be true or false",
    isBooleanString,
  ),
  required("STRIPE_SECRET_KEY", "must start with sk_", hasPrefix("sk_")),
  required(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "must start with pk_",
    hasPrefix("pk_"),
  ),
  required(
    "STRIPE_WEBHOOK_SECRET",
    "must start with whsec_",
    hasPrefix("whsec_"),
  ),
  required("SENTRY_DSN", "must be a URL", isUrl),
  required("NEXT_PUBLIC_SENTRY_DSN", "must be a URL", isUrl),
  required("RESEND_API_KEY", "must start with re_", hasPrefix("re_")),
  required(
    "RESEND_WEBHOOK_SECRET",
    "must start with whsec_",
    hasPrefix("whsec_"),
  ),
  required(
    "RESEND_ENCRYPTION_KEY",
    "must be at least 32 characters",
    hasMinLength(32),
  ),
];

export const PROJECTS = [
  {
    key: "admin",
    project: "admin",
    vercelConfigPath: "apps/admin/vercel.json",
    healthUrl: "https://admin.asymmetric.al/api/health",
    requiredEnv: [
      ...COMMON_REQUIRED_ENV,
      required("SUPABASE_DB_URL", "must be a Postgres URL", isPostgresUrl),
      required("PAYLOAD_DATABASE_URI", "must be a Postgres URL", isPostgresUrl),
      required("PAYLOAD_SECRET"),
      required("NEXT_PUBLIC_DONOR_URL", "must be a URL", isUrl),
      required("DONOR_APP_URL", "must be a URL", isUrl),
      required("CMS_BASE_URL", "must be a URL", isUrl),
    ],
  },
  {
    key: "donor",
    project: "donor",
    vercelConfigPath: "apps/donor/vercel.json",
    healthUrl: "https://donor.asymmetric.al/api/health",
    requiredEnv: COMMON_REQUIRED_ENV,
  },
  {
    key: "missionary",
    project: "missionary",
    vercelConfigPath: "apps/missionary/vercel.json",
    healthUrl: "https://missionary.asymmetric.al/api/health",
    requiredEnv: COMMON_REQUIRED_ENV,
  },
];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function parseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function parseVercelEnvKeys(jsonText) {
  return parseVercelEnvEntries(jsonText).map((env) => env.key);
}

export function parseVercelEnvEntries(jsonText) {
  const parsed = parseJson(jsonText, {});
  const envs = Array.isArray(parsed.envs) ? parsed.envs : [];
  return envs
    .map((env) => ({
      key: env?.key,
      type: env?.type,
    }))
    .filter((env) => typeof env.key === "string" && env.key.length > 0)
    .sort((a, b) => a.key.localeCompare(b.key));
}

export function parseVercelDeployments(jsonText) {
  const parsed = parseJson(jsonText, {});
  const deployments = Array.isArray(parsed.deployments)
    ? parsed.deployments
    : Array.isArray(parsed)
      ? parsed
      : [];

  return deployments.map((deployment) => ({
    url: deployment.url ?? deployment.name ?? "",
    state: deployment.state ?? "",
    target: deployment.target ?? "",
    createdAt: deployment.createdAt ?? null,
    commitSha: deployment.meta?.githubCommitSha ?? "",
    commitRef: deployment.meta?.githubCommitRef ?? "",
  }));
}

export function parseVercelProjectDetails(jsonText) {
  const parsed = parseJson(jsonText, {});

  return {
    productionBranch:
      typeof parsed?.link?.productionBranch === "string"
        ? parsed.link.productionBranch
        : "",
  };
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

export function branchPatternMatches(pattern, branch) {
  if (pattern === branch) return true;

  const regex = new RegExp(
    `^${pattern.split("*").map(escapeRegExp).join(".*")}$`,
  );
  return regex.test(branch);
}

export function isBranchDeploymentEnabled(vercelConfig, branch) {
  const setting = vercelConfig?.git?.deploymentEnabled;

  if (typeof setting === "boolean") return setting;
  if (!setting || typeof setting !== "object") return true;

  const matchingValues = Object.entries(setting)
    .filter(([pattern]) => branchPatternMatches(pattern, branch))
    .map(([, enabled]) => enabled);

  if (matchingValues.some((enabled) => enabled === true)) return true;
  if (matchingValues.some((enabled) => enabled === false)) return false;

  return true;
}

function parseDotEnvValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseDotEnv(text) {
  const values = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const normalizedLine = line.startsWith("export ") ? line.slice(7) : line;
    const equalsIndex = normalizedLine.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = normalizedLine.slice(0, equalsIndex).trim();
    const value = normalizedLine.slice(equalsIndex + 1);
    if (!key) continue;

    values[key] = parseDotEnvValue(value);
  }

  return values;
}

function requirementKey(requirement) {
  return typeof requirement === "string" ? requirement : requirement.key;
}

export function missingEnvKeys(envKeys, requiredEnv) {
  const present = new Set(envKeys);
  return requiredEnv
    .map((requirement) => requirementKey(requirement))
    .filter((key) => !present.has(key));
}

export function missingEnvValues(envValues, requiredEnv) {
  return requiredEnv
    .map((requirement) => requirementKey(requirement))
    .filter((key) => !isNonEmpty(envValues[key]));
}

export function invalidEnvValues(envValues, requiredEnv) {
  return requiredEnv.flatMap((requirement) => {
    if (typeof requirement === "string") return [];

    const value = envValues[requirement.key];
    if (!isNonEmpty(value) || requirement.validate(value)) return [];

    return [
      {
        key: requirement.key,
        reason: requirement.reason,
      },
    ];
  });
}

function isSensitivePlaceholder(key, envValues, envTypes) {
  return envTypes[key] === "sensitive" && !isNonEmpty(envValues[key]);
}

function hiddenEnvValues(envKeys, envValues, envTypes, requiredEnv) {
  const present = new Set(envKeys);
  return requiredEnv
    .map((requirement) => requirementKey(requirement))
    .filter(
      (key) =>
        present.has(key) &&
        (!Object.prototype.hasOwnProperty.call(envValues, key) ||
          isSensitivePlaceholder(key, envValues, envTypes)),
    );
}

function visiblyEmptyEnvValues(envKeys, envValues, envTypes, requiredEnv) {
  const present = new Set(envKeys);
  return requiredEnv
    .map((requirement) => requirementKey(requirement))
    .filter(
      (key) =>
        present.has(key) &&
        Object.prototype.hasOwnProperty.call(envValues, key) &&
        !isNonEmpty(envValues[key]) &&
        !isSensitivePlaceholder(key, envValues, envTypes),
    );
}

function unique(values) {
  return [...new Set(values)];
}

export function summarizeProjectReadiness({
  project,
  envKeys,
  envTypes,
  envValues,
  deployments,
  commit,
  health,
  productionBranch,
  productionBranchEnabled = true,
}) {
  const resolvedEnvValues =
    envValues ??
    Object.fromEntries((envKeys ?? []).map((key) => [key, "present"]));
  const resolvedEnvKeys = envKeys ?? Object.keys(resolvedEnvValues);
  const resolvedEnvTypes = envTypes ?? {};
  const missingEnv = unique([
    ...missingEnvKeys(resolvedEnvKeys, project.requiredEnv),
    ...visiblyEmptyEnvValues(
      resolvedEnvKeys,
      resolvedEnvValues,
      resolvedEnvTypes,
      project.requiredEnv,
    ),
  ]);
  const invalidEnv = invalidEnvValues(resolvedEnvValues, project.requiredEnv);
  const unreadableEnv = hiddenEnvValues(
    resolvedEnvKeys,
    resolvedEnvValues,
    resolvedEnvTypes,
    project.requiredEnv,
  );
  const deploymentForCommit = deployments.find(
    (deployment) =>
      deployment.commitSha === commit &&
      deployment.target === "production" &&
      deployment.state === "READY",
  );
  const latestDeployment = deployments[0] ?? null;
  const healthOk = health ? health.status >= 200 && health.status < 300 : false;
  const productionBranchReady =
    isNonEmpty(productionBranch) && productionBranchEnabled;

  return {
    key: project.key,
    project: project.project,
    ready:
      productionBranchReady &&
      missingEnv.length === 0 &&
      invalidEnv.length === 0 &&
      Boolean(deploymentForCommit) &&
      healthOk,
    missingEnv,
    invalidEnv,
    unreadableEnv,
    deploymentForCommit: deploymentForCommit ?? null,
    latestDeployment,
    health: health ?? null,
    productionBranch: productionBranch ?? "",
    productionBranchEnabled,
    vercelConfigPath: project.vercelConfigPath,
  };
}

export function formatReadinessReport({ commit, reports }) {
  const lines = [
    "# Vercel Production Readiness",
    "",
    `Target commit: \`${commit}\``,
    "",
  ];

  for (const report of reports) {
    lines.push(`## ${report.project}`);
    lines.push("");
    lines.push(`Status: ${report.ready ? "READY" : "BLOCKED"}`);
    lines.push("");

    if (report.missingEnv.length > 0) {
      lines.push("Missing Production env values:");
      for (const key of report.missingEnv) {
        lines.push(`- \`${key}\``);
      }
      lines.push("");
    } else {
      lines.push("Missing Production env values: none");
      lines.push("");
    }

    if (report.invalidEnv.length > 0) {
      lines.push("Invalid Production env values:");
      for (const env of report.invalidEnv) {
        lines.push(`- \`${env.key}\`: ${env.reason}`);
      }
      lines.push("");
    } else {
      lines.push("Invalid Production env values: none");
      lines.push("");
    }

    if (report.unreadableEnv.length > 0) {
      lines.push("Present but unreadable by Vercel CLI:");
      for (const key of report.unreadableEnv) {
        lines.push(`- \`${key}\``);
      }
      lines.push("");
    }

    if (report.productionBranch) {
      lines.push(
        `Production branch: \`${report.productionBranch}\` (${report.productionBranchEnabled ? "enabled" : "disabled"} by \`${report.vercelConfigPath}\`)`,
      );
    } else {
      lines.push("Production branch: unknown");
    }
    lines.push("");

    if (report.deploymentForCommit) {
      lines.push(
        `Deployment for target commit: ${report.deploymentForCommit.url} (${report.deploymentForCommit.state})`,
      );
    } else {
      lines.push("Deployment for target commit: none READY in Production");
    }

    if (report.latestDeployment) {
      lines.push(
        `Latest deployment: ${report.latestDeployment.url} (${report.latestDeployment.state}, target=${report.latestDeployment.target || "preview"}, commit=${report.latestDeployment.commitSha || "unknown"}, ref=${report.latestDeployment.commitRef || "unknown"})`,
      );
    } else {
      lines.push("Latest deployment: none");
    }

    if (report.health) {
      lines.push(
        `Health check: HTTP ${report.health.status} at ${report.health.url}`,
      );
    } else {
      lines.push("Health check: not run");
    }

    lines.push("");
  }

  const blocked = reports.filter((report) => !report.ready);
  lines.push(
    blocked.length === 0
      ? "Overall: READY"
      : `Overall: BLOCKED (${blocked.map((report) => report.project).join(", ")})`,
  );
  lines.push("");

  return lines.join("\n");
}

function parseArgs(argv) {
  const args = {
    scope: DEFAULT_SCOPE,
    commit: null,
    skipHealth: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--scope") {
      args.scope = argv.at(index + 1) ?? args.scope;
      index += 1;
    } else if (arg === "--commit") {
      args.commit = argv.at(index + 1) ?? args.commit;
      index += 1;
    } else if (arg === "--skip-health") {
      args.skipHealth = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/verify/vercel-production-readiness.mjs [options]

Checks Vercel Production readiness for admin, donor, and missionary without
printing secret values.

Options:
  --scope <team>    Vercel team scope. Default: ${DEFAULT_SCOPE}
  --commit <sha>    Expected production commit. Default: current HEAD
  --skip-health     Skip live /api/health checks
  -h, --help        Show this help
`);
}

function readCurrentCommit() {
  return run("git", ["rev-parse", "HEAD"]).trim();
}

function readLocalVercelConfig(project) {
  const configPath = path.resolve(project.vercelConfigPath);
  return parseJson(readFileSync(configPath, "utf8"), {});
}

function readProjectDetails(project, scope) {
  const output = run("vercel", [
    "api",
    `/v10/projects/${project.project}`,
    "--scope",
    scope,
    "--raw",
  ]);

  return parseVercelProjectDetails(output);
}

function withLinkedProject(project, scope, fn) {
  const cwd = mkdtempSync(
    path.join(os.tmpdir(), `asym-vercel-${project.key}-`),
  );
  writeFileSync(path.join(cwd, ".gitignore"), ".vercel\n", "utf8");

  try {
    run(
      "vercel",
      ["link", "--yes", "--project", project.project, "--scope", scope],
      {
        cwd,
      },
    );
    return fn(cwd);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

function readProductionEnv(project, scope) {
  return withLinkedProject(project, scope, (cwd) => {
    const listOutput = run(
      "vercel",
      [
        "env",
        "ls",
        "production",
        "--cwd",
        cwd,
        "--scope",
        scope,
        "--format=json",
      ],
      { cwd },
    );
    const envEntries = parseVercelEnvEntries(listOutput);
    const envPath = path.join(cwd, ".env.production.local");
    run(
      "vercel",
      [
        "env",
        "pull",
        envPath,
        "--environment=production",
        "--yes",
        "--cwd",
        cwd,
        "--scope",
        scope,
      ],
      { cwd },
    );
    return {
      envKeys: envEntries.map((env) => env.key),
      envTypes: Object.fromEntries(
        envEntries.map((env) => [env.key, env.type]),
      ),
      envValues: parseDotEnv(readFileSync(envPath, "utf8")),
    };
  });
}

function readDeployments(project, scope) {
  const output = run("vercel", [
    "list",
    project.project,
    "--scope",
    scope,
    "--format=json",
  ]);
  return parseVercelDeployments(output);
}

async function readHealth(project, skipHealth) {
  if (skipHealth) return null;

  try {
    const response = await fetch(project.healthUrl, { cache: "no-store" });
    return {
      url: project.healthUrl,
      status: response.status,
    };
  } catch (error) {
    return {
      url: project.healthUrl,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const commit = args.commit ?? readCurrentCommit();
  const reports = [];

  for (const project of PROJECTS) {
    const projectDetails = readProjectDetails(project, args.scope);
    const vercelConfig = readLocalVercelConfig(project);
    const { envKeys, envTypes, envValues } = readProductionEnv(
      project,
      args.scope,
    );
    const deployments = readDeployments(project, args.scope);
    const health = await readHealth(project, args.skipHealth);
    reports.push(
      summarizeProjectReadiness({
        project,
        envKeys,
        envTypes,
        envValues,
        deployments,
        commit,
        health,
        productionBranch: projectDetails.productionBranch,
        productionBranchEnabled: isBranchDeploymentEnabled(
          vercelConfig,
          projectDetails.productionBranch,
        ),
      }),
    );
  }

  console.log(formatReadinessReport({ commit, reports }));

  if (reports.some((report) => !report.ready)) {
    process.exitCode = 1;
  }
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  await main();
}
