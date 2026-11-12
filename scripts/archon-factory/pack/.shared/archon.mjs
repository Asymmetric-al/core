// Archon CLI transport for durable state documents and run status. Runs are
// started by signed webhook deliveries (webhook.mjs), never by CLI triggers.
// Inside a run the engine supplies ARCHON_CLI_COMMAND, WORKFLOW_ID and
// ARCHON_NODE_EXECUTION; outside a run (operator controls) callers pass an
// explicit executable and project key.
import { isDeepStrictEqual } from "node:util";

import { ProcessError, runProcess } from "./proc.mjs";

export class StateConflict extends Error {
  constructor(message, observed) {
    super(message);
    this.name = "StateConflict";
    this.observed = observed;
  }
}

const passKeys = /^(ARCHON_|WORKFLOW_ID$|HOME$|PATH$|XDG_|LANG$|TZ$|USER$)/;

export function archonEnvironment(extra = {}) {
  const env = {};
  for (const [key, value] of Object.entries(process.env))
    if (passKeys.test(key) && value !== undefined) env[key] = value;
  return { ...env, ...extra };
}

export function runCommand() {
  const raw = process.env.ARCHON_CLI_COMMAND;
  if (!raw) throw new Error("ARCHON_CLI_COMMAND is not available");
  const command = JSON.parse(raw);
  if (
    !Array.isArray(command) ||
    command.length === 0 ||
    command.some((part) => typeof part !== "string" || part.length === 0)
  )
    throw new Error("ARCHON_CLI_COMMAND is malformed");
  return command;
}

export function createArchon({
  command = runCommand(),
  project,
  env = archonEnvironment(),
  cwd,
  run = runProcess,
  timeoutMs = 30_000,
} = {}) {
  const scopeArgs = project ? ["--project", project] : [];
  const invoke = async (args, input, { maxOutput = 512 * 1024 } = {}) => {
    const result = await run([...command, ...args], {
      env,
      cwd,
      input,
      timeoutMs,
      maxOutput,
    });
    let parsed = null;
    try {
      parsed = JSON.parse(result.stdout);
    } catch {}
    return { ...result, json: parsed };
  };
  const expectJson = (result, what) => {
    if (result.code === 3)
      throw new StateConflict(
        `${what}: revision or lease conflict`,
        result.json,
      );
    if (result.code !== 0 || result.json === null)
      throw new ProcessError(
        `${what} failed (${result.code}); reconcile before retry`,
        { code: result.code, stderr: result.stderr.slice(-2000) },
      );
    return result.json;
  };
  return {
    async get(name) {
      const doc = expectJson(
        await invoke(["state", "get", name, ...scopeArgs]),
        `state get ${name}`,
      );
      if (doc.name !== name)
        throw new Error("State read named another document");
      return doc;
    },
    async list(prefix, { values = false } = {}) {
      return expectJson(
        await invoke([
          "state",
          "list",
          "--prefix",
          prefix,
          ...(values ? ["--values"] : []),
          ...scopeArgs,
        ]),
        `state list ${prefix}`,
      );
    },
    // Conditional whole-document replacement. The acknowledgement must name
    // the next revision and echo the exact value, or the write is ambiguous.
    async put(name, value, { ifRevision, lease } = {}) {
      if (!Number.isSafeInteger(ifRevision) || ifRevision < 0)
        throw new Error("put requires an explicit ifRevision");
      const args = [
        "state",
        "put",
        name,
        "--if-revision",
        String(ifRevision),
        ...scopeArgs,
      ];
      if (lease === "take") args.push("--lease");
      if (lease === "release") args.push("--release-lease");
      const receipt = expectJson(
        await invoke(args, JSON.stringify(value)),
        `state put ${name}`,
      );
      if (
        receipt.name !== name ||
        receipt.revision !== ifRevision + 1 ||
        (receipt.value !== undefined &&
          !isDeepStrictEqual(receipt.value, value))
      )
        throw new Error(
          `state put ${name}: acknowledgement is ambiguous; reconcile before retry`,
        );
      return receipt;
    },
    async patch(name, ops, { ifRevision } = {}) {
      const args = ["state", "patch", name, ...scopeArgs];
      if (ifRevision !== undefined)
        args.push("--if-revision", String(ifRevision));
      return expectJson(
        await invoke(args, JSON.stringify({ ops })),
        `state patch ${name}`,
      );
    },
    // One run's execution status (pending, running, paused, completed,
    // failed or cancelled), or null when the engine cannot report it.
    async runStatus(runId) {
      let result;
      try {
        result = await invoke(["workflow", "get", runId, "--json"]);
      } catch {
        return null;
      }
      const run = result.json;
      if (
        result.code !== 0 ||
        !run ||
        run.id !== runId ||
        typeof run.status !== "string"
      )
        return null;
      return { id: run.id, status: run.status };
    },
    // `options.maxOutput` raises the output bound for one read (a run's event
    // record grows with every role turn).
    async raw(args, input, options) {
      return invoke(args, input, options);
    },
  };
}

// Read, plan and write on the observed revision, re-reading after a
// concurrent writer. plan(document) returns a write plan or { noop: true };
// a plan that refuses throws to the caller.
export async function conditionalWrite(
  archon,
  name,
  plan,
  { attempts = 4 } = {},
) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const document = await archon.get(name);
    const planned = plan(document);
    if (!planned || planned.noop)
      return { noop: true, document, plan: planned };
    try {
      const receipt = await archon.put(planned.name, planned.value, {
        ifRevision: planned.ifRevision,
        lease: planned.lease,
      });
      return { written: true, document, plan: planned, receipt };
    } catch (error) {
      if (error instanceof StateConflict) continue;
      throw error;
    }
  }
  return { conflict: true };
}
