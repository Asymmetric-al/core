#!/usr/bin/env node
// Claude Code PreToolUse hook for factory roles. Installed by reference in the
// trusted control folder's .claude/settings.json, never in a candidate.
import { appendFileSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { decide } from "./policy.mjs";
import { contextPath, runsRoot } from "./runctx.mjs";

export function evaluateHook({ stdin, env, readFile, realpath, lstat, log }) {
  let event;
  try {
    event = JSON.parse(stdin);
    // A non-object event would throw below, and a crashed hook does not block.
    if (event === null || typeof event !== "object")
      throw new Error("not an event");
  } catch {
    return { decision: "deny", reason: "Unreadable hook input" };
  }
  let identity = null;
  try {
    identity = JSON.parse(env.ARCHON_NODE_EXECUTION || "null");
  } catch {}
  const runId = env.WORKFLOW_ID;
  let context = null;
  if (runId && identity?.runId === runId) {
    try {
      context = JSON.parse(readFile(contextPath(runId)));
    } catch {}
  }
  const result = decide({
    context: context?.runId === runId ? context : null,
    nodePath: identity?.path,
    tool: event.tool_name,
    input: event.tool_input,
    cwd: event.cwd,
    realpath,
    lstat,
  });
  log?.({
    at: new Date().toISOString(),
    run: runId ?? null,
    node: identity?.path ?? null,
    tool: event.tool_name,
    decision: result.decision,
    reason: result.reason,
  });
  return result;
}

const decision = (result) =>
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: result.decision,
      permissionDecisionReason: result.reason,
    },
  });

// Claude Code lets a tool call through when a hook crashes with any exit
// code other than 2, so every failure here is turned into a deny and exit 2.
export function runGuard({
  readStdin,
  env,
  write,
  writeError,
  evaluate = evaluateHook,
  ...io
}) {
  try {
    write(decision(evaluate({ stdin: readStdin(), env, ...io })));
    return 0;
  } catch (error) {
    const reason = `Guard failed; denied: ${String(error?.message ?? error).slice(0, 300)}`;
    try {
      write(decision({ decision: "deny", reason }));
      writeError(reason + "\n");
    } catch {}
    return 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runGuard({
    readStdin: () => readFileSync(0, "utf8"),
    env: process.env,
    write: (text) => process.stdout.write(text),
    writeError: (text) => process.stderr.write(text),
    readFile: (file) => readFileSync(file, "utf8"),
    realpath: (file) => realpathSync(file),
    lstat: (file) => lstatSync(file),
    log: (entry) => {
      try {
        if (entry.run && /^[A-Za-z0-9-]+$/.test(entry.run))
          appendFileSync(
            path.posix.join(runsRoot(), entry.run, "guard.jsonl"),
            JSON.stringify(entry) + "\n",
          );
      } catch {}
    },
  });
}
