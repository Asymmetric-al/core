import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
  utimesSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  runCheck,
  serve,
} from "../../../scripts/archon-factory/pack/.shared/check-mcp.mjs";

const RUN_ID = "run-0123456789abcdef";
const IMAGE = `sha256:${"c".repeat(64)}`;
const CONTAINER = "d".repeat(64);
// A pid that cannot belong to a live process on Linux (pid_max <= 2^22) or
// Windows (pids are multiples of four).
const DEAD_PID = "2147483646";
const NO_IDENTITY =
  "Check executor unavailable: this session has no factory run identity. Report the check as missing evidence.";
const NO_CONTEXT =
  "Check executor unavailable: no trusted run context. Report the check as missing evidence.";
const BAD_COMMAND = "command must be a non-empty array of strings";
const BUSY =
  "No check slot became free within 10 minutes: every slot was held by other checks (this run's other reviewer or another issue). Report this check as not run (missing evidence), not as a failure.";
const ATTEMPT = "0f1e2d3c-4b5a-4987-8765-43210fedcba9";
// Waiting for a slot advances a fake clock instead of real time.
function fastClock(onSleep?: (count: number) => void) {
  let now = 0;
  let count = 0;
  return {
    now: () => now,
    sleep: async (ms: number) => {
      now += ms;
      onSleep?.(++count);
    },
  };
}
const reconciled = (ok: boolean) =>
  vi.fn(async (_owner: Json) => ({
    ok,
    found: [],
    remaining: ok ? [] : ["x"],
  }));

const BUILD_CHECK = {
  workspaceRoot: "/srv/core-factory/issues/12",
  workspaceDirectory: "/srv/core-factory/issues/12/repo",
  workspaceTarget: "/srv/core-factory/issues/12/repo",
  mounts: [
    {
      source: "/srv/core-factory/mirror.git/objects",
      target: "/srv/core-factory/mirror.git/objects",
      readOnly: true,
    },
  ],
};
const MICAIAH_CHECK = {
  workspaceRoot: "/srv/core-factory/views",
  workspaceDirectory: `/srv/core-factory/views/${RUN_ID}/micaiah`,
  workspaceTarget: "/candidate",
  mounts: [],
};

type Json = Record<string, unknown>;

const roots: string[] = [];
const inputs: PassThrough[] = [];
afterEach(() => {
  vi.useRealTimers();
  for (const input of inputs.splice(0)) input.end();
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function defaultNodes(): Json {
  return {
    scope: {
      role: "samson",
      read: ["/srv/core-factory/issues/12/repo"],
    },
    build: {
      role: "bezalel",
      read: ["/srv/core-factory/issues/12/repo"],
      check: BUILD_CHECK,
    },
    review_micaiah: {
      role: "micaiah",
      read: [MICAIAH_CHECK.workspaceDirectory],
      check: MICAIAH_CHECK,
    },
  };
}

function factory({
  nodes = defaultNodes(),
  context,
  limits,
}: { nodes?: Json; context?: unknown; limits?: Json } = {}) {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-check-mcp-")),
  );
  roots.push(root);
  const runDir = path.join(root, "runs", RUN_ID);
  mkdirSync(runDir, { recursive: true });
  writeFileSync(
    path.join(runDir, "context.json"),
    typeof context === "string"
      ? context
      : JSON.stringify(
          context ?? {
            v: 1,
            runId: RUN_ID,
            issue: 12,
            assignment: "a12-0123456789ab",
            artifacts: path.join(root, "artifacts"),
            round: 1,
            nodes,
          },
        ),
  );
  const config: Json = {
    root,
    executor: { docker: "/usr/bin/docker", image: IMAGE },
  };
  if (limits) config.limits = limits;
  return {
    root,
    config,
    checksDir: path.join(runDir, "checks"),
    slot: (index: number) => path.join(root, "locks", `check-slot-${index}`),
  };
}

function session(node = "build", runId = RUN_ID): Record<string, string> {
  return {
    WORKFLOW_ID: RUN_ID,
    ARCHON_NODE_EXECUTION: JSON.stringify({ runId, path: node }),
  };
}

function holdSlot(dir: string, owner?: string | Json) {
  mkdirSync(dir, { recursive: true });
  if (owner !== undefined)
    writeFileSync(
      path.join(dir, "owner"),
      typeof owner === "string" ? owner : JSON.stringify(owner),
    );
}

function passing(overrides: Json = {}) {
  return vi.fn(async (_input: Json) => ({
    status: "passed",
    exitCode: 0,
    containerId: CONTAINER,
    cleanupConfirmed: true,
    reusable: true,
    stdout: "ok\n",
    stderr: "",
    ...overrides,
  }));
}

const ARGS = {
  command: ["bun", "run", "test:unit", "--", "packages/api/x.test.ts"],
  reason: "unit tests for the touched package",
};

function receipts(dir: string): Json[] {
  return readdirSync(dir).map(
    (name) => JSON.parse(readFileSync(path.join(dir, name), "utf8")) as Json,
  );
}

describe("runCheck refuses without a factory run identity", () => {
  it.each([
    [
      "no WORKFLOW_ID",
      {
        ARCHON_NODE_EXECUTION: JSON.stringify({ runId: RUN_ID, path: "build" }),
      },
    ],
    ["no ARCHON_NODE_EXECUTION", { WORKFLOW_ID: RUN_ID }],
    [
      "a node identity from another run",
      session("build", "run-ffffffffffffffff"),
    ],
    [
      "an unparsable node identity",
      { WORKFLOW_ID: RUN_ID, ARCHON_NODE_EXECUTION: "{not json" },
    ],
    ["no environment identity at all", {}],
  ])("returns an explanatory error for %s", async (_label, env) => {
    const { config } = factory();

    const result = await runCheck({
      args: ARGS,
      env,
      config,
      execute: passing(),
    });

    expect(result).toEqual({ isError: true, text: NO_IDENTITY });
  });

  it("never reaches the executor or takes a slot", async () => {
    const { config, root } = factory();
    const execute = passing();

    await runCheck({
      args: ARGS,
      env: { WORKFLOW_ID: RUN_ID },
      config,
      execute,
    });

    expect({
      executed: execute.mock.calls.length,
      locks: existsSync(path.join(root, "locks")),
    }).toEqual({ executed: 0, locks: false });
  });
});

describe("runCheck refuses without a trusted run context", () => {
  it("returns an explanatory error when context.json is missing", async () => {
    const { config, root } = factory();
    rmSync(path.join(root, "runs", RUN_ID, "context.json"));

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: passing(),
    });

    expect(result).toEqual({ isError: true, text: NO_CONTEXT });
  });

  it.each([
    ["is unparsable", '{"v":1,'],
    [
      "belongs to another run",
      { v: 1, runId: "run-ffffffffffffffff", nodes: defaultNodes() },
    ],
    ["has an unknown version", { v: 2, runId: RUN_ID, nodes: defaultNodes() }],
  ])(
    "returns an explanatory error when the context %s",
    async (_label, context) => {
      const { config } = factory({ context });

      const result = await runCheck({
        args: ARGS,
        env: session(),
        config,
        execute: passing(),
      });

      expect(result).toEqual({ isError: true, text: NO_CONTEXT });
    },
  );

  it("rejects a run id that would escape the runs root", async () => {
    const { config, root } = factory();
    const escaping = "../escaped-run";
    mkdirSync(path.join(root, "escaped-run"));
    writeFileSync(
      path.join(root, "escaped-run", "context.json"),
      JSON.stringify({ v: 1, runId: escaping, nodes: defaultNodes() }),
    );
    const env = {
      WORKFLOW_ID: escaping,
      ARCHON_NODE_EXECUTION: JSON.stringify({ runId: escaping, path: "build" }),
    };
    const execute = passing();

    const result = await runCheck({ args: ARGS, env, config, execute });

    expect({ result, executed: execute.mock.calls.length }).toEqual({
      result: { isError: true, text: NO_CONTEXT },
      executed: 0,
    });
  });
});

describe("runCheck refuses nodes without a check workspace", () => {
  it("names the node when its context entry has no check workspace", async () => {
    const { config } = factory();

    const result = await runCheck({
      args: ARGS,
      env: session("scope"),
      config,
      execute: passing(),
    });

    expect(result).toEqual({
      isError: true,
      text: "Role node scope has no check workspace.",
    });
  });

  it("names the node when the context has no entry for it", async () => {
    const { config } = factory();

    const result = await runCheck({
      args: ARGS,
      env: session("ghost"),
      config,
      execute: passing(),
    });

    expect(result).toEqual({
      isError: true,
      text: "Role node ghost has no check workspace.",
    });
  });

  it("does not execute for a node without a check workspace", async () => {
    const { config } = factory();
    const execute = passing();

    await runCheck({ args: ARGS, env: session("scope"), config, execute });

    expect(execute).not.toHaveBeenCalled();
  });
});

describe("runCheck validates the command argv", () => {
  it.each([
    ["is missing", { reason: "x" }],
    ["is empty", { command: [], reason: "x" }],
    ["is a shell string", { command: "bun run test", reason: "x" }],
    ["has a non-string part", { command: ["bun", 1], reason: "x" }],
  ])("refuses when the command %s", async (_label, args) => {
    const { config } = factory();

    const result = await runCheck({
      args,
      env: session(),
      config,
      execute: passing(),
    });

    expect(result).toEqual({ isError: true, text: BAD_COMMAND });
  });

  it("refuses when no arguments are supplied at all", async () => {
    const { config } = factory();

    const result = await runCheck({
      args: undefined,
      env: session(),
      config,
      execute: passing(),
    });

    expect(result).toEqual({ isError: true, text: BAD_COMMAND });
  });

  it("does not execute an invalid command", async () => {
    const { config } = factory();
    const execute = passing();

    await runCheck({
      args: { command: [], reason: "x" },
      env: session(),
      config,
      execute,
    });

    expect(execute).not.toHaveBeenCalled();
  });
});

describe("runCheck executes in the calling node's own workspace", () => {
  it("passes the node's check workspace, the configured executor and fixed defaults", async () => {
    const { config } = factory();
    const execute = passing();

    await runCheck({ args: ARGS, env: session(), config, execute });

    expect(execute.mock.calls).toEqual([
      [
        {
          dockerExecutable: "/usr/bin/docker",
          image: IMAGE,
          workspaceRoot: "/srv/core-factory/issues/12",
          workspaceDirectory: "/srv/core-factory/issues/12/repo",
          workspaceTarget: "/srv/core-factory/issues/12/repo",
          mounts: [
            {
              source: "/srv/core-factory/mirror.git/objects",
              target: "/srv/core-factory/mirror.git/objects",
              readOnly: true,
            },
          ],
          network: "none",
          env: {},
          tmpfsMb: 1024,
          command: ["bun", "run", "test:unit", "--", "packages/api/x.test.ts"],
          limits: {
            cpus: 4,
            memoryMb: 8192,
            pids: 1024,
            timeoutMs: 600_000,
            outputBytes: 4_194_304,
          },
          attempt: expect.stringMatching(/^[a-f0-9-]{36}$/),
          runId: RUN_ID,
          issue: 12,
        },
      ],
    ]);
  });

  it("selects the workspace by node identity and ignores workspace hints in the arguments", async () => {
    const { config } = factory();
    const execute = passing();

    await runCheck({
      args: {
        ...ARGS,
        workspaceDirectory: "/srv/core-factory/control",
        workspaceRoot: "/",
      },
      env: session("review_micaiah"),
      config,
      execute,
    });

    expect(execute.mock.calls[0][0]).toMatchObject({
      workspaceRoot: "/srv/core-factory/views",
      workspaceDirectory: `/srv/core-factory/views/${RUN_ID}/micaiah`,
      workspaceTarget: "/candidate",
      mounts: [],
    });
  });

  it("defaults the container target to /candidate when the context omits it", async () => {
    const { workspaceTarget: _omitted, ...check } = MICAIAH_CHECK;
    const { config } = factory({
      nodes: { review_micaiah: { role: "micaiah", check } },
    });
    const execute = passing();

    await runCheck({
      args: ARGS,
      env: session("review_micaiah"),
      config,
      execute,
    });

    expect(execute.mock.calls[0][0].workspaceTarget).toBe("/candidate");
  });

  it("denies network even when the context entry asks for it", async () => {
    const { config } = factory({
      nodes: {
        build: {
          role: "bezalel",
          check: { ...BUILD_CHECK, network: "bridge" },
        },
      },
    });
    const execute = passing();

    await runCheck({ args: ARGS, env: session(), config, execute });

    expect(execute.mock.calls[0][0].network).toBe("none");
  });

  it("honours per-node resource settings recorded in the context", async () => {
    const { config } = factory({
      nodes: {
        build: {
          role: "bezalel",
          check: {
            ...BUILD_CHECK,
            env: { CI: "1" },
            tmpfsMb: 256,
            cpus: 2,
            memoryMb: 4096,
            pids: 512,
          },
        },
      },
    });
    const execute = passing();

    await runCheck({ args: ARGS, env: session(), config, execute });

    expect(execute.mock.calls[0][0]).toMatchObject({
      env: { CI: "1" },
      tmpfsMb: 256,
      limits: { cpus: 2, memoryMb: 4096, pids: 512 },
    });
  });

  it.each([
    [undefined, 600_000],
    [5, 10_000],
    [120, 120_000],
    [99_999, 1_800_000],
  ])("bounds timeout_seconds %s to %i ms", async (timeout, expected) => {
    const { config } = factory();
    const execute = passing();

    await runCheck({
      args: { ...ARGS, timeout_seconds: timeout },
      env: session(),
      config,
      execute,
    });

    expect(execute.mock.calls[0][0].limits.timeoutMs).toBe(expected);
  });
});

describe("runCheck records a receipt", () => {
  const START = new Date("2026-11-11T10:00:00.000Z");
  const END = new Date("2026-11-11T10:00:02.500Z");
  const EVIDENCE = `1794391200000-${process.pid}.json`;

  function timed(overrides: Json = {}) {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(START);
    const inner = passing(overrides);
    return vi.fn(async (input: Json) => {
      vi.setSystemTime(END);
      return inner(input);
    });
  }

  it("names the receipt after the start time and server pid", async () => {
    const { config, checksDir } = factory();

    await runCheck({ args: ARGS, env: session(), config, execute: timed() });

    expect(readdirSync(checksDir)).toEqual([EVIDENCE]);
  });

  it("stores the node, role, command, outcome and workspace", async () => {
    const { config, checksDir } = factory();

    await runCheck({ args: ARGS, env: session(), config, execute: timed() });

    expect(receipts(checksDir)).toEqual([
      {
        at: "2026-11-11T10:00:00.000Z",
        durationMs: 2500,
        node: "build",
        role: "bezalel",
        reason: "unit tests for the touched package",
        command: ["bun", "run", "test:unit", "--", "packages/api/x.test.ts"],
        status: "passed",
        exitCode: 0,
        containerId: CONTAINER,
        attempt: expect.stringMatching(/^[a-f0-9-]{36}$/),
        cleanupConfirmed: true,
        workspace: "/srv/core-factory/issues/12/repo",
        stdout: "ok\n",
        stderr: "",
      },
    ]);
  });

  it("reports status, evidence, duration and output tails to the role", async () => {
    const { config } = factory();

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: timed({ stderr: "warn\n" }),
    });

    expect(result).toEqual({
      isError: false,
      text: [
        "status: passed (exit 0)",
        `evidence: ${EVIDENCE}`,
        "duration_ms: 2500",
        "",
        "--- stdout (tail) ---",
        "ok\n",
        "--- stderr (tail) ---",
        "warn\n",
      ].join("\n"),
    });
  });

  it("keeps only the last 64 KiB of output in the receipt", async () => {
    const { config, checksDir } = factory();
    const stdout = "a".repeat(10_000) + "b".repeat(60_000);

    await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: passing({ stdout }),
    });

    expect(receipts(checksDir)[0].stdout).toBe(
      "a".repeat(5_536) + "b".repeat(60_000),
    );
  });

  it("returns only the last 6000 characters of output to the role", async () => {
    const { config } = factory();
    const stdout = "a".repeat(10_000) + "b".repeat(60_000);

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: passing({ stdout }),
    });

    expect(result.text.split("\n")[5]).toBe("b".repeat(6_000));
  });

  it("truncates the recorded reason to 400 characters", async () => {
    const { config, checksDir } = factory();

    await runCheck({
      args: { ...ARGS, reason: "r".repeat(500) },
      env: session(),
      config,
      execute: passing(),
    });

    expect(receipts(checksDir)[0].reason).toBe("r".repeat(400));
  });

  it("records absent exit code and container id as null", async () => {
    const { config, checksDir } = factory();

    await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: vi.fn(async () => ({
        status: "timed_out",
        cleanupConfirmed: true,
        reusable: true,
      })),
    });

    expect(receipts(checksDir)[0]).toMatchObject({
      status: "timed_out",
      exitCode: null,
      containerId: null,
    });
  });
});

describe("runCheck check slots", () => {
  it("records this server, the attempt and its container in the slot while the check runs", async () => {
    const { config, slot } = factory();
    let owner: Json | null = null;
    const execute = vi.fn(async (_input: Json) => {
      owner = JSON.parse(readFileSync(path.join(slot(0), "owner"), "utf8"));
      return {
        status: "passed",
        exitCode: 0,
        cleanupConfirmed: true,
        reusable: true,
      };
    });

    await runCheck({ args: ARGS, env: session(), config, execute });

    const attempt = execute.mock.calls[0][0].attempt as string;
    expect({ owner, attempt }).toEqual({
      owner: {
        pid: process.pid,
        attempt,
        container: `core-check-${attempt}`,
        runId: RUN_ID,
        node: "build",
        at: expect.any(String),
        state: "running",
      },
      attempt: expect.stringMatching(/^[a-f0-9-]{36}$/),
    });
  });

  it("labels the check container with this run and issue", async () => {
    const { config } = factory();
    const execute = passing();

    await runCheck({ args: ARGS, env: session(), config, execute });

    expect(execute.mock.calls[0][0]).toMatchObject({
      runId: RUN_ID,
      issue: 12,
    });
  });

  it("releases the slot after a confirmed-clean check", async () => {
    const { config, slot } = factory();

    await runCheck({ args: ARGS, env: session(), config, execute: passing() });

    expect(existsSync(slot(0))).toBe(false);
  });

  it("waits for a busy slot instead of refusing at once", async () => {
    const { config, slot } = factory();
    holdSlot(slot(0), { pid: process.pid, attempt: ATTEMPT, state: "running" });
    const execute = passing();
    const clock = fastClock((count) => {
      if (count === 3) rmSync(slot(0), { recursive: true, force: true });
    });

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      clock,
    });

    expect({
      isError: result.isError,
      executed: execute.mock.calls.length,
      waited: clock.now(),
    }).toEqual({
      isError: false,
      executed: 1,
      waited: 6_000,
    });
  });

  it("refuses with an accurate message when no slot frees within the queue bound", async () => {
    const { config, slot } = factory();
    holdSlot(slot(0), String(process.pid));
    const execute = passing();
    const clock = fastClock();

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      clock,
    });

    expect({
      result,
      executed: execute.mock.calls.length,
      waited: clock.now(),
    }).toEqual({
      result: { isError: true, text: BUSY },
      executed: 0,
      waited: 600_000,
    });
  });

  it("leaves a live holder's slot untouched when refusing", async () => {
    const { config, slot } = factory();
    holdSlot(slot(0), String(process.pid));

    await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: passing(),
      clock: fastClock(),
    });

    expect(readFileSync(path.join(slot(0), "owner"), "utf8")).toBe(
      String(process.pid),
    );
  });

  it("uses the next configured slot when the first is held", async () => {
    const { config, slot } = factory({ limits: { heavyCheckSlots: 2 } });
    holdSlot(slot(0), String(process.pid));
    let held: Json | null = null;
    const execute = vi.fn(async () => {
      held = JSON.parse(readFileSync(path.join(slot(1), "owner"), "utf8"));
      return {
        status: "passed",
        exitCode: 0,
        cleanupConfirmed: true,
        reusable: true,
      };
    });

    await runCheck({ args: ARGS, env: session(), config, execute });

    expect({
      pid: (held as Json | null)?.pid,
      slot0: existsSync(slot(0)),
      slot1: existsSync(slot(1)),
    }).toEqual({ pid: process.pid, slot0: true, slot1: false });
  });

  it("refuses when every configured slot stays held", async () => {
    const { config, slot } = factory({ limits: { heavyCheckSlots: 2 } });
    holdSlot(slot(0), String(process.pid));
    holdSlot(slot(1), String(process.pid));

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: passing(),
      clock: fastClock(),
    });

    expect(result).toEqual({ isError: true, text: BUSY });
  });

  it("reclaims a dead owner's slot only after its labelled container is confirmed gone", async () => {
    const { config, slot } = factory();
    holdSlot(slot(0), {
      pid: Number(DEAD_PID),
      attempt: ATTEMPT,
      state: "running",
    });
    const reconcile = reconciled(true);
    const execute = passing();

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      reconcile,
      clock: fastClock(),
    });

    expect({
      isError: result.isError,
      reconciled: reconcile.mock.calls.map(([owner]) => owner.attempt),
      executed: execute.mock.calls.length,
    }).toEqual({ isError: false, reconciled: [ATTEMPT], executed: 1 });
  });

  it("keeps a dead owner's slot held while its container cannot be confirmed gone", async () => {
    const { config, slot } = factory();
    holdSlot(slot(0), {
      pid: Number(DEAD_PID),
      attempt: ATTEMPT,
      state: "running",
    });
    const execute = passing();

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      reconcile: reconciled(false),
      clock: fastClock(),
    });

    expect({
      result,
      executed: execute.mock.calls.length,
      kept: JSON.parse(readFileSync(path.join(slot(0), "owner"), "utf8"))
        .attempt,
    }).toEqual({
      result: { isError: true, text: BUSY },
      executed: 0,
      kept: ATTEMPT,
    });
  });

  it.each([
    ["no owner record", undefined],
    ["an unreadable owner record", "not-a-pid"],
    ["a dead owner without an attempt", DEAD_PID],
  ])("treats a slot with %s as busy", async (_label, owner) => {
    const { config, slot } = factory();
    holdSlot(slot(0), owner);
    const reconcile = reconciled(true);
    const execute = passing();

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      reconcile,
      clock: fastClock(),
    });

    expect({
      result,
      executed: execute.mock.calls.length,
      reconciled: reconcile.mock.calls.length,
    }).toEqual({
      result: { isError: true, text: BUSY },
      executed: 0,
      reconciled: 0,
    });
  });

  it("takes over an empty slot left by a server that died before recording its owner", async () => {
    const { config, slot } = factory();
    holdSlot(slot(0));
    // Created two minutes ago and still empty: no live server leaves a slot
    // ownerless for longer than the instant between creating it and writing
    // the record, and no check can have started without that record.
    const old = new Date(Date.now() - 120_000);
    utimesSync(slot(0), old, old);
    const execute = passing();

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      reconcile: reconciled(true),
      clock: fastClock(),
    });

    expect(execute.mock.calls.length).toBe(1);
    expect(result.isError).toBeFalsy();
  });

  it("clears a reclaim lock left without an owner by a dead server", async () => {
    const { config, slot } = factory();
    holdSlot(slot(0), { pid: Number(DEAD_PID), attempt: ATTEMPT });
    mkdirSync(`${slot(0)}.reclaim`);
    const old = new Date(Date.now() - 120_000);
    utimesSync(`${slot(0)}.reclaim`, old, old);
    const execute = passing();

    await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      reconcile: reconciled(true),
      clock: fastClock(),
    });

    expect(execute.mock.calls.length).toBe(1);
  });

  it.each([
    { reusable: false },
    { reusable: undefined },
    { cleanupConfirmed: undefined },
  ])("retains incomplete executor capacity proof %j", async (flags) => {
    const { config, slot } = factory();
    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: passing(flags),
    });
    expect(
      JSON.parse(readFileSync(path.join(slot(0), "owner"), "utf8")).state,
    ).toBe("unconfirmed");
    expect(result.text).toContain("cleanup unconfirmed");
  });
  it("durably retains every uncertain attempt with its full original receipt", async () => {
    const { root, config } = factory({ limits: { heavyCheckSlots: 2 } });
    const artifacts = path.join(root, "artifacts");
    const receipt = {
      status: "failed",
      cleanupConfirmed: false,
      reusable: false,
      stdout: "full output".repeat(9000),
      stderr: "exact diagnostic",
      labels: {
        "core.archon.executor": "candidate-check",
        "core.archon.run": RUN_ID,
        "core.archon.issue": "12",
        "core.archon.attempt": ATTEMPT,
      },
    };
    for (let index = 0; index < 2; index++) {
      await runCheck({
        args: ARGS,
        env: { ...session(), ARTIFACTS_DIR: artifacts },
        config,
        execute: async () => receipt,
        clock: fastClock(),
      });
    }
    const entries = readdirSync(path.join(artifacts, "round")).filter((name) =>
      name.startsWith("mcp-cleanup-"),
    );
    expect(entries).toHaveLength(2);
    for (const name of entries) {
      const entry = JSON.parse(
        readFileSync(path.join(artifacts, "round", name), "utf8"),
      );
      expect(entry.cleanup.receipt).toEqual(receipt);
      expect(entry.blocked.code).toBe("cleanup-unconfirmed");
    }
  });

  it("does not reclaim a stale check on contradictory positive cleanup with remaining workloads", async () => {
    const { config, slot } = factory();
    holdSlot(slot(0), {
      pid: Number(DEAD_PID),
      attempt: ATTEMPT,
      state: "running",
    });
    const execute = passing();
    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      reconcile: async () => ({ ok: true, remaining: ["container"] }),
      clock: fastClock(),
    });
    expect(result.isError).toBe(true);
    expect(execute).not.toHaveBeenCalled();
    expect(existsSync(slot(0))).toBe(true);
  });

  it("keeps the slot, marked unconfirmed, when the executor could not confirm cleanup", async () => {
    const { config, slot } = factory();

    await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: passing({
        status: "failed",
        exitCode: null,
        cleanupConfirmed: false,
      }),
    });

    expect(
      JSON.parse(readFileSync(path.join(slot(0), "owner"), "utf8")).state,
    ).toBe("unconfirmed");
  });

  it("warns the role when container cleanup is unconfirmed", async () => {
    const { config } = factory();

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: passing({
        status: "failed",
        exitCode: null,
        cleanupConfirmed: false,
      }),
    });

    expect(result.text.split("\n")[3]).toBe(
      "WARNING: container cleanup unconfirmed; do not rely on further checks",
    );
  });

  it("refuses later checks after unconfirmed cleanup until the container is confirmed gone", async () => {
    const { config } = factory();
    await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: passing({ cleanupConfirmed: false }),
    });

    const refused = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute: passing(),
      reconcile: reconciled(false),
      clock: fastClock(),
    });
    const reconcile = reconciled(true);
    const execute = passing();
    const accepted = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      reconcile,
      clock: fastClock(),
    });

    expect({
      refused,
      accepted: accepted.isError,
      reconciled: reconcile.mock.calls.length,
      executed: execute.mock.calls.length,
    }).toEqual({
      refused: { isError: true, text: BUSY },
      accepted: false,
      reconciled: 1,
      executed: 1,
    });
  });

  it("passes the cancellation signal to the executor", async () => {
    const { config } = factory();
    const controller = new AbortController();
    const execute = passing();

    await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      signal: controller.signal,
    });

    expect(execute.mock.calls[0][0].signal).toBe(controller.signal);
  });

  it("stops waiting for a slot when the check is cancelled", async () => {
    const { config, slot } = factory();
    holdSlot(slot(0), String(process.pid));
    const controller = new AbortController();
    const execute = passing();

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
      signal: controller.signal,
      clock: fastClock(() => controller.abort()),
    });

    expect({ result, executed: execute.mock.calls.length }).toEqual({
      result: {
        isError: true,
        text: "Check cancelled before it started; report it as not run.",
      },
      executed: 0,
    });
  });
});

describe("runCheck when the executor throws", () => {
  function cleanupError(receipt: Json) {
    return Object.assign(new Error("docker rm failed"), { receipt });
  }

  it("releases the slot when the thrown receipt confirms cleanup", async () => {
    const { config, slot } = factory();
    const execute = vi.fn(async () => {
      throw cleanupError({
        status: "failed",
        exitCode: 1,
        cleanupConfirmed: true,
        reusable: true,
      });
    });

    await runCheck({ args: ARGS, env: session(), config, execute });

    expect(existsSync(slot(0))).toBe(false);
  });

  it("records the thrown receipt's outcome", async () => {
    const { config, checksDir } = factory();
    const execute = vi.fn(async () => {
      throw cleanupError({
        status: "failed",
        exitCode: 137,
        containerId: CONTAINER,
        cleanupConfirmed: false,
      });
    });

    await runCheck({ args: ARGS, env: session(), config, execute });

    expect(receipts(checksDir)[0]).toMatchObject({
      status: "failed",
      exitCode: 137,
      containerId: CONTAINER,
      cleanupConfirmed: false,
    });
  });

  it("retains the slot when an executor error supplies no cleanup receipt", async () => {
    const { config, slot } = factory();
    const execute = vi.fn(async () => {
      throw new Error("executor transport unavailable");
    });

    await runCheck({ args: ARGS, env: session(), config, execute });

    expect(existsSync(slot(0))).toBe(true);
    expect(
      JSON.parse(readFileSync(path.join(slot(0), "owner"), "utf8")).state,
    ).toBe("unconfirmed");
  });

  it.each([false, true])(
    "requires independent cleanup confirmation (%s) before the next check",
    async (confirmed) => {
      const { config, slot } = factory({ limits: { checkQueueMs: 10 } });
      await runCheck({
        args: ARGS,
        env: session(),
        config,
        execute: vi.fn(async () => {
          throw new Error("executor transport unavailable");
        }),
      });

      const execute = passing();
      const reconcile = reconciled(confirmed);
      const result = await runCheck({
        args: ARGS,
        env: session(),
        config,
        execute,
        reconcile,
        clock: fastClock(),
      });

      expect(reconcile).toHaveBeenCalled();
      expect(execute).toHaveBeenCalledTimes(confirmed ? 1 : 0);
      expect(existsSync(slot(0))).toBe(!confirmed);
      expect(result.isError).toBe(!confirmed);
    },
  );

  it("reports an error without a receipt as a failed check with evidence", async () => {
    const { config, checksDir } = factory();
    const execute = vi.fn(async () => {
      throw new Error("Invalid check input");
    });

    const result = await runCheck({
      args: ARGS,
      env: session(),
      config,
      execute,
    });

    expect({
      isError: result.isError,
      status: result.text.split("\n")[0],
      receipt: receipts(checksDir)[0],
    }).toMatchObject({
      isError: false,
      status: "status: failed (exit null)",
      receipt: { status: "failed", exitCode: null, containerId: null },
    });
  });
});

describe("serve", () => {
  function server(
    options: { env?: Record<string, string>; config?: Json } = {},
  ) {
    const { config, root } = factory();
    const configPath = path.join(root, "core-factory.json");
    writeFileSync(configPath, JSON.stringify(options.config ?? config));
    const input = new PassThrough();
    const output = new PassThrough();
    inputs.push(input);
    serve({ input, output, env: options.env ?? {}, configPath });
    const responses: Json[] = [];
    let buffer = "";
    let waiting: { count: number; resolve: () => void } | null = null;
    output.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      let index: number;
      while ((index = buffer.indexOf("\n")) >= 0) {
        responses.push(JSON.parse(buffer.slice(0, index)) as Json);
        buffer = buffer.slice(index + 1);
      }
      if (waiting && responses.length >= waiting.count) waiting.resolve();
    });
    return {
      root,
      send(message: unknown) {
        input.write(
          (typeof message === "string" ? message : JSON.stringify(message)) +
            "\n",
        );
      },
      received(count: number) {
        return new Promise<Json[]>((resolve) => {
          const done = () => resolve(responses.slice());
          if (responses.length >= count) done();
          else waiting = { count, resolve: done };
        });
      },
    };
  }

  it("answers initialize with the requested protocol, tool capability and server info", async () => {
    const { send, received } = server();

    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-03-26" },
    });

    expect(await received(1)).toEqual([
      {
        jsonrpc: "2.0",
        id: 1,
        result: {
          protocolVersion: "2025-03-26",
          capabilities: { tools: {} },
          serverInfo: { name: "core-check", version: "1.0.0" },
        },
      },
    ]);
  });

  it("defaults the protocol version when the client names none", async () => {
    const { send, received } = server();

    send({ jsonrpc: "2.0", id: 1, method: "initialize" });

    const [response] = await received(1);
    expect((response.result as Json).protocolVersion).toBe("2025-06-18");
  });

  it("answers ping with an empty result", async () => {
    const { send, received } = server();

    send({ jsonrpc: "2.0", id: "p-1", method: "ping" });

    expect(await received(1)).toEqual([
      { jsonrpc: "2.0", id: "p-1", result: {} },
    ]);
  });

  it("lists exactly the run_check tool", async () => {
    const { send, received } = server();

    send({ jsonrpc: "2.0", id: 2, method: "tools/list" });

    const [response] = await received(1);
    const tools = (response.result as { tools: Json[] }).tools;
    expect(tools.map((tool) => tool.name)).toEqual(["run_check"]);
  });

  it("describes run_check with a closed argv input schema", async () => {
    const { send, received } = server();

    send({ jsonrpc: "2.0", id: 2, method: "tools/list" });

    const [response] = await received(1);
    const [tool] = (response.result as { tools: Json[] }).tools;
    expect(tool.inputSchema).toMatchObject({
      type: "object",
      properties: {
        command: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 64,
        },
        reason: { type: "string" },
        timeout_seconds: { type: "integer", minimum: 10, maximum: 1800 },
      },
      required: ["command", "reason"],
      additionalProperties: false,
    });
  });

  it("answers an unknown method with a JSON-RPC method-not-found error", async () => {
    const { send, received } = server();

    send({ jsonrpc: "2.0", id: 3, method: "resources/list" });

    expect(await received(1)).toEqual([
      {
        jsonrpc: "2.0",
        id: 3,
        error: { code: -32601, message: "Method not found" },
      },
    ]);
  });

  it("answers a call to an unknown tool with an invalid-params error", async () => {
    const { send, received } = server();

    send({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "shell", arguments: {} },
    });

    expect(await received(1)).toEqual([
      {
        jsonrpc: "2.0",
        id: 4,
        error: { code: -32602, message: "Unknown tool" },
      },
    ]);
  });

  it("routes run_check calls to the check and returns its refusal as tool content", async () => {
    const { send, received } = server();

    send({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: { name: "run_check", arguments: ARGS },
    });

    expect(await received(1)).toEqual([
      {
        jsonrpc: "2.0",
        id: 5,
        result: {
          content: [{ type: "text", text: NO_IDENTITY }],
          isError: true,
        },
      },
    ]);
  });

  it("runs the check with the session identity, configured root and call arguments", async () => {
    const { send, received } = server({ env: session() });

    send({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: { name: "run_check", arguments: { command: [], reason: "x" } },
    });

    const [response] = await received(1);
    expect(response.result).toEqual({
      content: [{ type: "text", text: BAD_COMMAND }],
      isError: true,
    });
  });

  it("treats a call without arguments as an empty argument object", async () => {
    const { send, received } = server({ env: session() });

    send({
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: { name: "run_check" },
    });

    const [response] = await received(1);
    expect(response.result).toEqual({
      content: [{ type: "text", text: BAD_COMMAND }],
      isError: true,
    });
  });

  it("does not answer notifications", async () => {
    const { send, received } = server();

    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    send({ jsonrpc: "2.0", id: 8, method: "ping" });

    expect(await received(1)).toEqual([{ jsonrpc: "2.0", id: 8, result: {} }]);
  });

  it("ignores lines that are not JSON", async () => {
    const { send, received } = server();

    send("this is not json");
    send({ jsonrpc: "2.0", id: 9, method: "ping" });

    expect(await received(1)).toEqual([{ jsonrpc: "2.0", id: 9, result: {} }]);
  });

  it("prefers CORE_FACTORY_CONFIG over the default configuration path", async () => {
    const { root, config } = factory();
    const configFile = path.join(root, "from-env.json");
    writeFileSync(configFile, JSON.stringify(config));
    const input = new PassThrough();
    const output = new PassThrough();
    inputs.push(input);
    const lines: string[] = [];
    const answered = new Promise<void>((resolve) =>
      output.on("data", (chunk: Buffer) => {
        lines.push(chunk.toString("utf8"));
        resolve();
      }),
    );

    serve({
      input,
      output,
      env: { ...session(), CORE_FACTORY_CONFIG: configFile },
      configPath: path.join(root, "missing.json"),
    });
    input.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 10,
        method: "tools/call",
        params: { name: "run_check", arguments: { command: [] } },
      }) + "\n",
    );
    await answered;

    expect(JSON.parse(lines.join("")).result.content[0].text).toBe(BAD_COMMAND);
  });

  function stoppable(event: "close" | "SIGTERM") {
    const { config, root } = factory();
    const configPath = path.join(root, "core-factory.json");
    writeFileSync(configPath, JSON.stringify(config));
    const input = new PassThrough();
    const output = new PassThrough();
    inputs.push(input);
    const signals = new EventEmitter();
    const exit = vi.fn();
    let seen: AbortSignal | undefined;
    let finish: () => void = () => {};
    const check = vi.fn(
      ({ signal }: { signal: AbortSignal }) =>
        new Promise<{ isError: boolean; text: string }>((resolve) => {
          seen = signal;
          finish = () => resolve({ isError: false, text: "stopped" });
        }),
    );
    serve({ input, output, env: session(), configPath, signals, exit, check });
    input.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "run_check", arguments: ARGS },
      }) + "\n",
    );
    const stop = () =>
      event === "close" ? input.end() : signals.emit("SIGTERM");
    return { check, exit, stop, finish: () => finish(), signal: () => seen };
  }

  it.each(["SIGTERM", "close"] as const)(
    "cancels the running check on %s and exits only after it settles",
    async (event) => {
      const server = stoppable(event);
      await vi.waitFor(() => expect(server.check).toHaveBeenCalled());

      server.stop();
      await vi.waitFor(() => expect(server.signal()?.aborted).toBe(true));
      const exitedEarly = server.exit.mock.calls.length;
      server.finish();
      await vi.waitFor(() => expect(server.exit).toHaveBeenCalledWith(0));

      expect(exitedEarly).toBe(0);
    },
  );

  it("refuses to start without a readable configuration", () => {
    const { root } = factory();

    expect(() =>
      serve({
        input: new PassThrough(),
        output: new PassThrough(),
        env: {},
        configPath: path.join(root, "missing.json"),
      }),
    ).toThrow();
  });
});
