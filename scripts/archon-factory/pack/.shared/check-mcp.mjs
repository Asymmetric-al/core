#!/usr/bin/env node
// `core-check` MCP server: the only way factory roles execute commands.
// Each call runs once in the disposable, credential-free Docker executor
// against the calling role's own workspace from the trusted run context.
import { randomUUID } from "node:crypto";
import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  rmdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

import { DEFAULT_CONFIG_PATH } from "./config.mjs";
import { executeCandidateCheck, removeLabeledContainers } from "./executor.mjs";
import { readRunContext } from "./runctx.mjs";

const posix = path.posix;
const SLOT_QUEUE_MS = 10 * 60_000;
const SLOT_POLL_MS = 2_000;
const attemptPattern =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const CANCELLED = "Check cancelled before it started; report it as not run.";

const TOOL = {
  name: "run_check",
  description:
    "Run one command (argv array, no shell) in the factory's disposable, credential-free check container against your own candidate files. Network is denied. Returns exit status and bounded output. Inspect scripts before running them.",
  inputSchema: {
    type: "object",
    properties: {
      command: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        maxItems: 64,
        description:
          'Executable and arguments, for example ["bun","run","test:unit","--","path/to/test.ts"]',
      },
      reason: { type: "string", description: "What this check verifies" },
      timeout_seconds: { type: "integer", minimum: 10, maximum: 1800 },
    },
    required: ["command", "reason"],
    additionalProperties: false,
  },
};

const busy = (queueMs) =>
  `No check slot became free within ${Math.round(queueMs / 60_000)} minutes: every slot was held by other checks (this run's other reviewer or another issue). Report this check as not run (missing evidence), not as a failure.`;

const wait = (ms, signal) =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

// A slot's owner record names the server process, the check attempt and its
// container. A missing or unreadable record is treated as busy: a slot is
// only ever reclaimed once its attempt's labelled containers are confirmed
// gone.
function readOwner(dir) {
  try {
    const owner = JSON.parse(readFileSync(posix.join(dir, "owner"), "utf8"));
    return owner && typeof owner === "object" ? owner : null;
  } catch {
    return null;
  }
}

// A server that dies between creating a slot (or a reclaim lock) and
// recording its owner leaves an empty directory nobody owns. No check can
// have started without the owner record, and a live server writes it at once,
// so an empty directory this old is a dead claim and is removed. rmdir only
// removes an empty directory, so a record written meanwhile keeps it.
const CLAIM_GRACE_MS = 60_000;
function abandonedClaim(dir, ignore = []) {
  try {
    if (readdirSync(dir).some((name) => !ignore.includes(name))) return false;
    if (Date.now() - statSync(dir).mtimeMs < CLAIM_GRACE_MS) return false;
    for (const name of ignore) rmSync(posix.join(dir, name), { force: true });
    rmdirSync(dir);
    return true;
  } catch {
    return false;
  }
}

function claimSlot(dir, owner) {
  try {
    mkdirSync(dir);
  } catch {
    return false;
  }
  writeFileSync(posix.join(dir, "owner"), JSON.stringify(owner));
  return true;
}

async function reclaim(dir, reconcile) {
  const lock = `${dir}.reclaim`;
  try {
    mkdirSync(lock);
  } catch {
    // Another server is reclaiming this slot; a lock left by a dead one is stale.
    let text = "";
    try {
      text = readFileSync(posix.join(lock, "owner"), "utf8");
    } catch {}
    const holder = Number(text);
    if (Number.isSafeInteger(holder) && holder > 0 && !alive(holder))
      rmSync(lock, { recursive: true, force: true });
    // A lock with no owner recorded, and old, was never owned.
    else if (text === "") abandonedClaim(lock, ["owner"]);
    return false;
  }
  try {
    writeFileSync(posix.join(lock, "owner"), String(process.pid));
    const owner = readOwner(dir);
    if (
      !owner ||
      !Number.isSafeInteger(owner.pid) ||
      !attemptPattern.test(owner.attempt ?? "")
    )
      return false;
    if (owner.state !== "unconfirmed" && alive(owner.pid)) return false;
    let result;
    try {
      result = await reconcile(owner);
    } catch {
      return false;
    }
    if (
      result?.ok !== true ||
      !Array.isArray(result.remaining) ||
      result.remaining.length !== 0
    )
      return false;
    rmSync(dir, { recursive: true, force: true });
    return true;
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

// Take a heavy-check slot, waiting (bounded) while every slot is busy, so
// parallel reviewers queue instead of failing their checks.
export async function acquireSlot({
  locks,
  slots,
  owner,
  reconcile,
  queueMs = SLOT_QUEUE_MS,
  pollMs = SLOT_POLL_MS,
  now = Date.now,
  sleep = wait,
  signal,
}) {
  mkdirSync(locks, { recursive: true });
  const deadline = now() + queueMs;
  for (;;) {
    for (let index = 0; index < slots; index += 1) {
      const dir = posix.join(locks, `check-slot-${index}`);
      if (claimSlot(dir, owner)) return dir;
      if (abandonedClaim(dir) && claimSlot(dir, owner)) return dir;
      if ((await reclaim(dir, reconcile)) && claimSlot(dir, owner)) return dir;
    }
    if (signal?.aborted || now() >= deadline) return null;
    await sleep(Math.max(1, Math.min(pollMs, deadline - now())), signal);
    if (signal?.aborted) return null;
  }
}

export async function runCheck({
  args,
  env,
  config,
  execute = executeCandidateCheck,
  reconcile,
  signal,
  clock = {},
}) {
  let identity = null;
  try {
    identity = JSON.parse(env.ARCHON_NODE_EXECUTION || "null");
  } catch {}
  const runId = env.WORKFLOW_ID;
  if (!runId || identity?.runId !== runId)
    return {
      isError: true,
      text: "Check executor unavailable: this session has no factory run identity. Report the check as missing evidence.",
    };
  let context;
  try {
    context = readRunContext(runId, posix.join(config.root, "runs"));
  } catch {
    return {
      isError: true,
      text: "Check executor unavailable: no trusted run context. Report the check as missing evidence.",
    };
  }
  const entry = context.nodes?.[identity.path];
  if (!entry?.check)
    return {
      isError: true,
      text: `Role node ${identity.path} has no check workspace.`,
    };
  const command = args?.command;
  if (
    !Array.isArray(command) ||
    !command.length ||
    command.some((part) => typeof part !== "string")
  )
    return {
      isError: true,
      text: "command must be a non-empty array of strings",
    };
  const timeoutMs =
    Math.min(1800, Math.max(10, args.timeout_seconds ?? 600)) * 1000;
  const attempt = randomUUID();
  const owner = {
    pid: process.pid,
    attempt,
    container: `core-check-${attempt}`,
    runId,
    node: identity.path,
    at: new Date().toISOString(),
    state: "running",
  };
  const queueMs = config.limits?.checkQueueMs ?? SLOT_QUEUE_MS;
  const slot = await acquireSlot({
    locks: posix.join(config.root, "locks"),
    slots: config.limits?.heavyCheckSlots ?? 1,
    owner,
    reconcile:
      reconcile ??
      ((record) =>
        removeLabeledContainers({
          dockerExecutable: config.executor.docker,
          labels: { "core.archon.attempt": record.attempt },
        })),
    queueMs,
    pollMs: clock.pollMs,
    now: clock.now,
    sleep: clock.sleep,
    signal,
  });
  if (!slot)
    return { isError: true, text: signal?.aborted ? CANCELLED : busy(queueMs) };
  const started = Date.now();
  const artifacts = context.artifacts ?? env.ARTIFACTS_DIR;
  let cleanupFile;
  const pendingReceipt = {
    status: "failed",
    cleanupConfirmed: false,
    reusable: false,
    labels: {
      "core.archon.executor": "candidate-check",
      "core.archon.attempt": attempt,
      "core.archon.run": runId,
      "core.archon.issue": String(context.issue),
    },
  };
  const persistCleanup = (receipt) => {
    const unresolved =
      receipt.cleanupConfirmed !== true || receipt.reusable !== true;
    const payload = {
      cleanup: unresolved
        ? {
            step: `mcp:${identity.path}`,
            runId,
            assignment: context.assignment,
            issue: context.issue,
            error: {
              name: "CheckCleanupError",
              message: "MCP check cleanup requires independent confirmation",
            },
            receipt,
          }
        : null,
      ...(unresolved
        ? {
            blocked: {
              code: "cleanup-unconfirmed",
              detail: "MCP workload cleanup requires independent confirmation",
            },
          }
        : {}),
    };
    const temporary = `${cleanupFile}.${randomUUID()}.tmp`;
    const fd = openSync(temporary, "wx", 0o600);
    try {
      writeFileSync(fd, JSON.stringify(payload, null, 2));
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    renameSync(temporary, cleanupFile);
  };
  try {
    if (typeof artifacts !== "string" || !path.isAbsolute(artifacts))
      throw new Error("Trusted run artifacts unavailable");
    const directory = path.join(artifacts, "round");
    mkdirSync(directory, { recursive: true, mode: 0o750 });
    cleanupFile = path.join(directory, `mcp-cleanup-${attempt}.json`);
    persistCleanup(pendingReceipt);
  } catch {
    rmSync(slot, { recursive: true, force: true });
    return {
      isError: true,
      text: "Check executor unavailable: cleanup evidence could not be persisted; report the check as not run.",
    };
  }
  let receipt;
  try {
    receipt = await execute({
      dockerExecutable: config.executor.docker,
      image: config.executor.image,
      workspaceRoot: entry.check.workspaceRoot,
      workspaceDirectory: entry.check.workspaceDirectory,
      workspaceTarget: entry.check.workspaceTarget ?? "/candidate",
      mounts: entry.check.mounts ?? [],
      ...(entry.check.scratch?.length ? { scratch: entry.check.scratch } : {}),
      network: "none",
      env: entry.check.env ?? {},
      tmpfsMb: entry.check.tmpfsMb ?? 1024,
      command,
      limits: {
        cpus: entry.check.cpus ?? 4,
        memoryMb: entry.check.memoryMb ?? 8192,
        pids: entry.check.pids ?? 1024,
        timeoutMs,
        outputBytes: 4 * 1024 * 1024,
      },
      attempt,
      runId,
      ...(Number.isSafeInteger(context.issue) && context.issue > 0
        ? { issue: context.issue }
        : {}),
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    // Preserve executor evidence. Missing proof cannot establish that no
    // workload remains, so retain the attempt until independent reconciliation.
    receipt = error.receipt ?? pendingReceipt;
  } finally {
    // The pre-execution hold stays durable if this final write fails.
    persistCleanup(receipt ?? pendingReceipt);
    // An unconfirmed cleanup keeps the slot held; the next acquirer frees it
    // only after the attempt's labelled containers are confirmed gone.
    if (receipt?.cleanupConfirmed === true && receipt?.reusable === true)
      rmSync(slot, { recursive: true, force: true });
    else
      writeFileSync(
        posix.join(slot, "owner"),
        JSON.stringify({ ...owner, state: "unconfirmed" }),
      );
  }
  const record = {
    at: new Date(started).toISOString(),
    durationMs: Date.now() - started,
    node: identity.path,
    role: entry.role,
    reason: String(args.reason ?? "").slice(0, 400),
    command,
    status: receipt.status,
    exitCode: receipt.exitCode ?? null,
    containerId: receipt.containerId ?? null,
    attempt,
    cleanupConfirmed:
      receipt.cleanupConfirmed === true && receipt.reusable === true,
    workspace: entry.check.workspaceDirectory,
  };
  const checks = posix.join(config.root, "runs", runId, "checks");
  mkdirSync(checks, { recursive: true });
  const file = posix.join(checks, `${started}-${process.pid}.json`);
  writeFileSync(
    file,
    JSON.stringify({
      ...record,
      stdout: receipt.stdout?.slice(-65536),
      stderr: receipt.stderr?.slice(-65536),
    }),
  );
  const tail = (text) => (text ?? "").slice(-6000);
  return {
    isError: false,
    text: [
      `status: ${record.status} (exit ${record.exitCode})`,
      `evidence: ${posix.basename(file)}`,
      `duration_ms: ${record.durationMs}`,
      record.cleanupConfirmed
        ? ""
        : "WARNING: container cleanup unconfirmed; do not rely on further checks",
      "--- stdout (tail) ---",
      tail(receipt.stdout),
      "--- stderr (tail) ---",
      tail(receipt.stderr),
    ].join("\n"),
  };
}

// SIGTERM, SIGINT or the client closing stdin cancels running checks (the
// executor then stops and removes their containers); the process exits only
// after every in-flight check has settled.
export function serve({
  input = process.stdin,
  output = process.stdout,
  env = process.env,
  configPath = DEFAULT_CONFIG_PATH,
  signals,
  exit,
  check = runCheck,
} = {}) {
  const config = JSON.parse(
    readFileSync(env.CORE_FACTORY_CONFIG ?? configPath, "utf8"),
  );
  const send = (message) => output.write(JSON.stringify(message) + "\n");
  const lines = readline.createInterface({ input });
  const controller = new AbortController();
  const inflight = new Set();
  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    controller.abort();
    void Promise.allSettled([...inflight]).then(() => exit?.(0));
  };
  for (const name of ["SIGTERM", "SIGINT", "SIGHUP"])
    signals?.once?.(name, shutdown);
  lines.on("close", shutdown);
  lines.on("line", async (line) => {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      return;
    }
    const { id, method, params } = message;
    if (id === undefined) return;
    if (method === "initialize")
      send({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: params?.protocolVersion ?? "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "core-check", version: "1.0.0" },
        },
      });
    else if (method === "ping") send({ jsonrpc: "2.0", id, result: {} });
    else if (method === "tools/list")
      send({ jsonrpc: "2.0", id, result: { tools: [TOOL] } });
    else if (method === "tools/call") {
      if (params?.name !== TOOL.name) {
        send({
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "Unknown tool" },
        });
        return;
      }
      const work = check({
        args: params.arguments ?? {},
        env,
        config,
        signal: controller.signal,
      });
      inflight.add(work);
      let result;
      try {
        result = await work;
      } finally {
        inflight.delete(work);
      }
      send({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: result.text }],
          isError: result.isError,
        },
      });
    } else
      send({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "Method not found" },
      });
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  serve({ signals: process, exit: (code) => process.exit(code) });
