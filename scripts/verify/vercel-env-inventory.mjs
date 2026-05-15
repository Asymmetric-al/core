#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  PROJECTS,
  parseVercelEnvEntries,
} from "./vercel-production-readiness.mjs";

const DEFAULT_SCOPE = "asymmetric-al";
const DEFAULT_ENVIRONMENTS = Object.freeze([
  "production",
  "preview",
  "development",
  "staging",
]);

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function withLinkedProject(project, scope, fn) {
  const cwd = mkdtempSync(
    path.join(os.tmpdir(), `asym-vercel-env-${project}-`),
  );
  writeFileSync(path.join(cwd, ".gitignore"), ".vercel\n", "utf8");

  try {
    run("vercel", ["link", "--yes", "--project", project, "--scope", scope], {
      cwd,
    });
    return fn(cwd);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

export function formatVercelEnvInventory(inventory) {
  const lines = [
    "# Vercel Environment Name Inventory",
    "",
    "Secret values printed: no",
    "",
  ];

  for (const project of inventory.projects) {
    lines.push(`## ${project.project}`);
    lines.push("");

    for (const env of project.environments) {
      lines.push(`### ${env.environment}`);
      lines.push("");
      lines.push(`Status: ${env.status}`);
      lines.push(`Variable names: ${env.names.length}`);
      if (env.names.length > 0) {
        for (const entry of env.names) {
          lines.push(`- \`${entry.key}\` (${entry.type})`);
        }
      } else {
        lines.push("- none");
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function parseArgs(argv) {
  const args = {
    scope: DEFAULT_SCOPE,
    environments: [...DEFAULT_ENVIRONMENTS],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--scope") {
      args.scope = argv.at(index + 1) ?? args.scope;
      index += 1;
    } else if (arg === "--environments") {
      args.environments = (argv.at(index + 1) ?? "")
        .split(",")
        .map((env) => env.trim())
        .filter(Boolean);
      index += 1;
    }
  }

  return args;
}

export function collectVercelEnvInventory({ scope, environments }) {
  return {
    scope,
    projects: PROJECTS.map((project) =>
      withLinkedProject(project.project, scope, (cwd) => ({
        project: project.project,
        environments: environments.map((environment) => {
          try {
            const output = run(
              "vercel",
              [
                "env",
                "ls",
                environment,
                "--cwd",
                cwd,
                "--scope",
                scope,
                "--format=json",
              ],
              { cwd },
            );
            return {
              environment,
              status: "ok",
              names: parseVercelEnvEntries(output).map((entry) => ({
                key: entry.key,
                type: entry.type ?? "plain",
              })),
            };
          } catch (error) {
            return {
              environment,
              status:
                error instanceof Error ? `error: ${error.message}` : "error",
              names: [],
            };
          }
        }),
      })),
    ),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv.slice(2));
  const inventory = collectVercelEnvInventory(args);
  console.log(formatVercelEnvInventory(inventory));
}
