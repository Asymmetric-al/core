#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_SCOPE = "asymmetric-al";

export const PROJECTS = [
  { key: "admin", project: "admin" },
  { key: "donor", project: "donor" },
  { key: "missionary", project: "missionary" },
];

const isNonEmpty = (value) => typeof value === "string" && value.length > 0;
const hasPrefix = (prefix) => (value) => value.startsWith(prefix);
const hasMinLength = (length) => (value) => value.length >= length;
const isUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const commonProviderEnv = [
  {
    vercelKey: "STRIPE_SECRET_KEY",
    inputKey: "STRIPE_SECRET_KEY",
    reason: "must start with sk_live_",
    sensitive: true,
    validate: hasPrefix("sk_live_"),
  },
  {
    vercelKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    inputKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    reason: "must start with pk_live_",
    sensitive: false,
    validate: hasPrefix("pk_live_"),
  },
  {
    vercelKey: "SENTRY_DSN",
    inputKey: "SENTRY_DSN",
    reason: "must be a URL",
    sensitive: true,
    validate: isUrl,
  },
  {
    vercelKey: "NEXT_PUBLIC_SENTRY_DSN",
    inputKey: "NEXT_PUBLIC_SENTRY_DSN",
    reason: "must be a URL",
    sensitive: false,
    validate: isUrl,
  },
  {
    vercelKey: "RESEND_API_KEY",
    inputKey: "RESEND_API_KEY",
    reason: "must start with re_",
    sensitive: true,
    validate: hasPrefix("re_"),
  },
  {
    vercelKey: "RESEND_WEBHOOK_SECRET",
    inputKey: "RESEND_WEBHOOK_SECRET",
    reason: "must start with whsec_",
    sensitive: true,
    validate: hasPrefix("whsec_"),
  },
  {
    vercelKey: "RESEND_ENCRYPTION_KEY",
    inputKey: "RESEND_ENCRYPTION_KEY",
    reason: "must be at least 32 characters",
    sensitive: true,
    validate: hasMinLength(32),
  },
];

const projectSpecificProviderEnv = {
  admin: [
    {
      vercelKey: "STRIPE_WEBHOOK_SECRET",
      inputKey: "ADMIN_STRIPE_WEBHOOK_SECRET",
      reason: "must start with whsec_",
      sensitive: true,
      validate: hasPrefix("whsec_"),
    },
  ],
  donor: [
    {
      vercelKey: "STRIPE_WEBHOOK_SECRET",
      inputKey: "DONOR_STRIPE_WEBHOOK_SECRET",
      reason: "must start with whsec_",
      sensitive: true,
      validate: hasPrefix("whsec_"),
    },
  ],
  missionary: [
    {
      vercelKey: "STRIPE_WEBHOOK_SECRET",
      inputKey: "MISSIONARY_STRIPE_WEBHOOK_SECRET",
      reason: "must start with whsec_",
      sensitive: true,
      validate: hasPrefix("whsec_"),
    },
  ],
};

export function providerRequirementsForProject(projectKey) {
  return [
    ...commonProviderEnv,
    ...(projectSpecificProviderEnv[projectKey] ?? []),
  ];
}

export function allInputRequirements() {
  const byInputKey = new Map();
  for (const project of PROJECTS) {
    for (const requirement of providerRequirementsForProject(project.key)) {
      if (!byInputKey.has(requirement.inputKey)) {
        byInputKey.set(requirement.inputKey, requirement);
      }
    }
  }
  return [...byInputKey.values()].sort((a, b) =>
    a.inputKey.localeCompare(b.inputKey),
  );
}

export function validateInputEnv(env) {
  const missing = [];
  const invalid = [];

  for (const requirement of allInputRequirements()) {
    const value = env[requirement.inputKey];
    if (!isNonEmpty(value)) {
      missing.push(requirement.inputKey);
      continue;
    }

    if (!requirement.validate(value)) {
      invalid.push({
        inputKey: requirement.inputKey,
        reason: requirement.reason,
      });
    }
  }

  if (!isNonEmpty(env.VERCEL_TOKEN)) {
    missing.push("VERCEL_TOKEN");
  }

  return { missing, invalid };
}

export function envEntriesForProject(projectKey, env) {
  return providerRequirementsForProject(projectKey).map((requirement) => ({
    vercelKey: requirement.vercelKey,
    inputKey: requirement.inputKey,
    value: env[requirement.inputKey],
    sensitive: requirement.sensitive,
  }));
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    ...options,
  });

  if (result.status !== 0) {
    const stderr = result.stderr ? result.stderr.trim() : "";
    const stdout = result.stdout ? result.stdout.trim() : "";
    throw new Error(
      [
        `${command} failed with exit code ${result.status ?? "unknown"}.`,
        stderr ? `stderr: ${stderr}` : null,
        stdout ? `stdout: ${stdout}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return result.stdout ?? "";
}

function withLinkedProject(project, scope, token, fn) {
  const cwd = mkdtempSync(
    path.join(os.tmpdir(), `asym-vercel-sync-${project.key}-`),
  );
  writeFileSync(path.join(cwd, ".gitignore"), ".vercel\n", "utf8");

  try {
    run("vercel", [
      "link",
      "--yes",
      "--project",
      project.project,
      "--scope",
      scope,
      "--token",
      token,
      "--cwd",
      cwd,
    ]);
    return fn(cwd);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

function addVercelEnv({ cwd, scope, token, entry }) {
  const args = [
    "env",
    "add",
    entry.vercelKey,
    "production",
    "--yes",
    "--force",
    "--scope",
    scope,
    "--token",
    token,
    "--cwd",
    cwd,
  ];

  if (entry.sensitive) {
    args.push("--sensitive");
  }

  run("vercel", args, { input: entry.value });
}

function printValidationFailure({ missing, invalid }) {
  if (missing.length > 0) {
    console.error("Missing required input env names:");
    for (const key of missing) {
      console.error(`- ${key}`);
    }
  }

  if (invalid.length > 0) {
    console.error("Invalid required input env values:");
    for (const entry of invalid) {
      console.error(`- ${entry.inputKey}: ${entry.reason}`);
    }
  }
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    scope: process.env.VERCEL_SCOPE || DEFAULT_SCOPE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--scope") {
      args.scope = argv.at(index + 1) ?? args.scope;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/sync-vercel-production-env.mjs [options]

Synchronizes provider-backed Production environment variables to the admin,
donor, and missionary Vercel projects without printing secret values.

Options:
  --dry-run        Validate inputs and print planned Vercel env names only
  --scope <team>   Vercel team scope. Default: ${DEFAULT_SCOPE}
  -h, --help       Show this help
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const validation = validateInputEnv(process.env);
  if (validation.missing.length > 0 || validation.invalid.length > 0) {
    printValidationFailure(validation);
    process.exitCode = 1;
    return;
  }

  for (const project of PROJECTS) {
    const entries = envEntriesForProject(project.key, process.env);
    console.log(
      `${args.dryRun ? "Would sync" : "Syncing"} ${entries.length} Production env values for ${project.project}: ${entries
        .map((entry) => entry.vercelKey)
        .join(", ")}`,
    );

    if (args.dryRun) {
      continue;
    }

    withLinkedProject(project, args.scope, process.env.VERCEL_TOKEN, (cwd) => {
      for (const entry of entries) {
        addVercelEnv({
          cwd,
          scope: args.scope,
          token: process.env.VERCEL_TOKEN,
          entry,
        });
      }
    });
  }

  console.log("Vercel Production provider env sync complete.");
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  await main();
}
