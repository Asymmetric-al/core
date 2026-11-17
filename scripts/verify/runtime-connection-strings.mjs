#!/usr/bin/env node
// WP1 exit: "no application environment holds a postgres connection string"
// (plan 7.2). Lists, by name only, every Postgres connection-string variable
// in any environment of the three Vercel projects (Production, Preview,
// Development, branch-scoped and custom environments) and exits 1 if one
// exists. Values are never printed or kept.
//
//   bun run verify:runtime-connection-strings
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  FORBIDDEN_RUNTIME_ENV_NAMES,
  PROJECTS,
} from "./vercel-production-readiness.mjs";

const DEFAULT_SCOPE = "asymmetric-al";

function environmentsOf(env) {
  const names = [...(Array.isArray(env?.target) ? env.target : [])];
  if (
    Array.isArray(env?.customEnvironmentIds) &&
    env.customEnvironmentIds.length > 0
  ) {
    names.push("custom environment");
  }
  return names.length > 0 ? names : ["unknown"];
}

export function findRuntimeConnectionStrings({ project, listing }) {
  const envs = Array.isArray(listing?.envs) ? listing.envs : [];
  return (
    envs
      .filter((env) => FORBIDDEN_RUNTIME_ENV_NAMES.includes(env?.key))
      .map((env) => ({
        project,
        key: env.key,
        environments: environmentsOf(env),
      }))
      // Stable: rows of one name keep the provider's order.
      .sort((a, b) => a.key.localeCompare(b.key))
  );
}

export function readRuntimeConnectionStrings({
  scope = DEFAULT_SCOPE,
  run = (command, args) =>
    execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, MSYS_NO_PATHCONV: "1" },
      // The Vercel CLI is a .cmd shim on Windows; arguments here are fixed.
      shell: process.platform === "win32",
    }),
}) {
  return PROJECTS.flatMap((project) => {
    const raw = run("vercel", [
      "api",
      `/v10/projects/${project.project}/env`,
      "--scope",
      scope,
      "--raw",
    ]);
    let listing;
    try {
      listing = JSON.parse(raw);
    } catch {
      throw new Error(
        `Vercel returned no variable list for ${project.project}.`,
      );
    }
    return findRuntimeConnectionStrings({ project: project.project, listing });
  });
}

export function formatRuntimeConnectionStrings(found) {
  const lines = ["# Application environments: Postgres connection strings", ""];
  if (found.length === 0) {
    lines.push("None found. Overall: READY", "");
    return lines.join("\n");
  }
  for (const row of found) {
    lines.push(
      `- ${row.project}: \`${row.key}\` in ${row.environments.join(", ")} (remove it; only the release job migrates)`,
    );
  }
  lines.push("", `Overall: BLOCKED (${found.length})`, "");
  return lines.join("\n");
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  try {
    const found = readRuntimeConnectionStrings({});
    console.log(formatRuntimeConnectionStrings(found));
    if (found.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error(`runtime-connection-strings: ${error.message}`);
    process.exitCode = 1;
  }
}
