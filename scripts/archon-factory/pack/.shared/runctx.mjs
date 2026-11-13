// Trusted per-run context shared by the guard hook and the check MCP server.
// Written only by the round's own script nodes before any role runs.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import { DEFAULT_CONFIG_PATH } from "./config.mjs";

const runIdPattern = /^[A-Za-z0-9][A-Za-z0-9-]{7,127}$/;

export function runsRoot() {
  try {
    const config = JSON.parse(
      readFileSync(
        process.env.CORE_FACTORY_CONFIG ?? DEFAULT_CONFIG_PATH,
        "utf8",
      ),
    );
    return path.posix.join(config.root, "runs");
  } catch {
    return "/srv/core-factory/runs";
  }
}

export function contextPath(runId, root = runsRoot()) {
  if (!runIdPattern.test(runId ?? "")) throw new Error("Invalid run id");
  return path.posix.join(root, runId, "context.json");
}

export function writeRunContext(context, root = runsRoot()) {
  const file = contextPath(context.runId, root);
  mkdirSync(path.posix.dirname(file), { recursive: true, mode: 0o750 });
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(context, null, 2), { mode: 0o640 });
  renameSync(temporary, file);
  return file;
}

export function readRunContext(runId, root = runsRoot()) {
  const context = JSON.parse(readFileSync(contextPath(runId, root), "utf8"));
  if (context.v !== 1 || context.runId !== runId)
    throw new Error("Run context does not belong to this run");
  return context;
}

// Update one node's entry (for example, after reviewer views exist).
export function updateRunContext(runId, update, root = runsRoot()) {
  const context = readRunContext(runId, root);
  const next = update(structuredClone(context));
  if (next.runId !== runId) throw new Error("Run context identity changed");
  writeRunContext(next, root);
  return next;
}
