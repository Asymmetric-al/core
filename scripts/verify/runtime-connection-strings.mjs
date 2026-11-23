#!/usr/bin/env node
// WP1 exit: "no application environment holds a postgres connection string"
// (plan 7.2). Lists, by name only, every Postgres connection-string variable
// in any environment of the three Vercel projects (Production, Preview,
// Development, branch-scoped and custom environments) and exits 1 if one
// exists. Values are never printed or kept.
//
//   bun run verify:runtime-connection-strings
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { EXPECTED_PROJECTS } from "./vercel-build-controls.mjs";
import {
  FORBIDDEN_RUNTIME_ENV_NAMES,
  PROJECTS,
} from "./vercel-production-readiness.mjs";

const DEFAULT_SCOPE = "asymmetric-al";
const MAX_SHARED_ENV_PAGES = 100;

class VercelCliError extends Error {
  constructor({ status, signal, code }) {
    super("Vercel CLI command failed.");
    this.status = status;
    this.signal = signal;
    this.code = code;
  }
}

function defaultRunVercel(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, MSYS_NO_PATHCONV: "1" },
    // The Vercel CLI is a .cmd shim on Windows; arguments here are fixed.
    shell: process.platform === "win32",
  });
  if (result.error) {
    throw new VercelCliError({
      status: null,
      signal: null,
      code: result.error.code,
    });
  }
  if (result.status !== 0) {
    throw new VercelCliError({
      status: result.status,
      signal: result.signal,
      code: null,
    });
  }
  return result.stdout ?? "";
}

function invokeVercelApi({ run, args, targetLabel }) {
  try {
    return run("vercel", args);
  } catch (error) {
    const status =
      typeof error?.status === "number"
        ? `exit code ${error.status}`
        : error?.signal
          ? `signal ${error.signal}`
          : error?.code
            ? `error ${error.code}`
            : "unknown exit status";
    throw new Error(
      `Vercel CLI failed while reading ${targetLabel} (${status}); command output withheld.`,
    );
  }
}

export function projectEnvMetadata(env) {
  return {
    id: typeof env?.id === "string" ? env.id : undefined,
    key: typeof env?.key === "string" ? env.key : undefined,
    type: typeof env?.type === "string" ? env.type : undefined,
    target: Array.isArray(env?.target)
      ? env.target.filter((target) => typeof target === "string" && target)
      : [],
    customEnvironmentIds: Array.isArray(env?.customEnvironmentIds)
      ? env.customEnvironmentIds.filter((id) => typeof id === "string" && id)
      : [],
    applyToAllCustomEnvironments: env?.applyToAllCustomEnvironments === true,
    projectId: Array.isArray(env?.projectId)
      ? env.projectId.filter((id) => typeof id === "string" && id)
      : typeof env?.projectId === "string" && env.projectId
        ? [env.projectId]
        : [],
  };
}

function projectValidatedEnvMetadata(entry, targetLabel) {
  if (
    !entry ||
    typeof entry !== "object" ||
    Array.isArray(entry) ||
    typeof entry.key !== "string" ||
    entry.key.trim().length === 0
  ) {
    throw new Error(
      `Vercel returned an unreadable variable entry for ${targetLabel}.`,
    );
  }
  return projectEnvMetadata(entry);
}

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

function sharedEnvironmentsOf(env) {
  const names = [
    ...(Array.isArray(env?.target)
      ? env.target.filter((target) => typeof target === "string" && target)
      : []),
  ];
  if (
    env?.applyToAllCustomEnvironments === true ||
    (Array.isArray(env?.customEnvironmentIds) &&
      env.customEnvironmentIds.length > 0)
  ) {
    names.push("custom environment");
  }
  return names;
}

function linkedProjectsOf(env, projects) {
  const ids = new Set(
    Array.isArray(env?.projectId)
      ? env.projectId
      : typeof env?.projectId === "string"
        ? [env.projectId]
        : [],
  );
  return projects
    .filter((project) => ids.has(project.projectId))
    .map((project) => project.key);
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

export function findSharedRuntimeConnectionStrings({
  listing,
  scope = DEFAULT_SCOPE,
  projects = EXPECTED_PROJECTS,
}) {
  const envs = Array.isArray(listing)
    ? listing
    : Array.isArray(listing?.data)
      ? listing.data
      : [];
  return envs
    .filter((env) => FORBIDDEN_RUNTIME_ENV_NAMES.includes(env?.key))
    .flatMap((env) => {
      const linkedProjects = linkedProjectsOf(env, projects);
      const environments = sharedEnvironmentsOf(env);
      if (linkedProjects.length === 0 || environments.length === 0) {
        return [];
      }
      return [
        {
          scope: "team-shared",
          team: scope,
          projects: linkedProjects,
          key: env.key,
          environments,
        },
      ];
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}

function readSharedRuntimeConnectionStrings({ scope, run }) {
  const allEnvs = [];
  const seenCursors = new Set();
  let cursor = null;
  let pages = 0;

  while (true) {
    pages += 1;
    const endpoint =
      cursor === null
        ? "/v1/env"
        : `/v1/env?until=${encodeURIComponent(String(cursor))}`;
    const raw = invokeVercelApi({
      run,
      args: ["api", endpoint, "--scope", scope, "--raw"],
      targetLabel: `shared variables for ${scope}`,
    });
    let listing;
    try {
      listing = JSON.parse(raw);
    } catch {
      throw new Error(`Vercel returned no shared variable list for ${scope}.`);
    }
    if (
      !listing ||
      typeof listing !== "object" ||
      Array.isArray(listing) ||
      !Array.isArray(listing.data)
    ) {
      throw new Error(`Vercel returned no shared variable list for ${scope}.`);
    }
    const pagination = listing.pagination;
    if (
      !pagination ||
      typeof pagination !== "object" ||
      Array.isArray(pagination) ||
      !Object.prototype.hasOwnProperty.call(pagination, "next")
    ) {
      throw new Error(
        `Vercel returned no pagination for the shared variables of ${scope}.`,
      );
    }
    for (const entry of listing.data) {
      allEnvs.push(
        projectValidatedEnvMetadata(entry, `shared variables of ${scope}`),
      );
    }
    const next = pagination.next;
    if (next === null) {
      break;
    }
    const validCursor =
      (typeof next === "number" && Number.isFinite(next)) ||
      (typeof next === "string" && next.length > 0);
    if (!validCursor) {
      throw new Error(
        `Vercel returned invalid pagination cursor for the shared variables of ${scope}.`,
      );
    }
    const nextKey = String(next);
    if (
      (cursor !== null && nextKey === String(cursor)) ||
      seenCursors.has(nextKey)
    ) {
      throw new Error(
        `Vercel shared variable pagination repeated cursor for ${scope}.`,
      );
    }
    if (pages >= MAX_SHARED_ENV_PAGES) {
      throw new Error(
        `Vercel shared variable pagination exceeded ${MAX_SHARED_ENV_PAGES} pages for ${scope}.`,
      );
    }
    seenCursors.add(nextKey);
    cursor = next;
  }

  return findSharedRuntimeConnectionStrings({
    listing: { data: allEnvs },
    scope,
  });
}

export function readRuntimeConnectionStrings({
  scope = DEFAULT_SCOPE,
  run = defaultRunVercel,
}) {
  const projectFindings = PROJECTS.flatMap((project) => {
    const raw = invokeVercelApi({
      run,
      args: [
        "api",
        `/v10/projects/${project.project}/env`,
        "--scope",
        scope,
        "--raw",
      ],
      targetLabel: `variables for ${project.project}`,
    });
    let listing;
    try {
      listing = JSON.parse(raw);
    } catch {
      throw new Error(
        `Vercel returned no variable list for ${project.project}.`,
      );
    }
    const projected = Array.isArray(listing?.envs)
      ? listing.envs.map((entry) =>
          projectValidatedEnvMetadata(entry, project.project),
        )
      : [];
    return findRuntimeConnectionStrings({
      project: project.project,
      listing: { envs: projected },
    });
  });
  const sharedFindings = readSharedRuntimeConnectionStrings({ scope, run });
  return [...projectFindings, ...sharedFindings];
}

export function formatRuntimeConnectionStrings(found) {
  const lines = ["# Application environments: Postgres connection strings", ""];
  if (found.length === 0) {
    lines.push("None found. Overall: READY", "");
    return lines.join("\n");
  }
  for (const row of found) {
    const location =
      row.scope === "team-shared"
        ? `team ${row.team} (shared; projects: ${row.projects.join(", ")})`
        : row.project;
    lines.push(
      `- ${location}: \`${row.key}\` in ${row.environments.join(", ")} (remove it; only the release job migrates)`,
    );
  }
  lines.push("", `Overall: BLOCKED (${found.length})`, "");
  return lines.join("\n");
}

export function main({
  scope = DEFAULT_SCOPE,
  run = defaultRunVercel,
  log = console.log,
  logError = console.error,
} = {}) {
  try {
    const found = readRuntimeConnectionStrings({ scope, run });
    log(formatRuntimeConnectionStrings(found));
    return found.length > 0 ? 1 : 0;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected verification error.";
    logError(`runtime-connection-strings: ${message}`);
    log(`Overall: BLOCKED (could not read: ${message})`);
    return 1;
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  process.exitCode = main();
}
