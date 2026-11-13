import { EventEmitter } from "node:events";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";

import { afterEach, expect, it, vi } from "vitest";

import * as executorModule from "../../../scripts/archon-factory/pack/.shared/executor.mjs";

const { executeCandidateCheck, removeLabeledContainers } =
  executorModule as Record<string, any>;

import type { spawn as nodeSpawn } from "node:child_process";

const roots: string[] = [];
const containerId = "a".repeat(64);
const image = `sha256:${"b".repeat(64)}`;
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});
function fixture() {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-check-")),
  );
  roots.push(root);
  const workspaceDirectory = path.join(root, "candidate space,$(touch nope)");
  mkdirSync(workspaceDirectory);
  writeFileSync(path.join(workspaceDirectory, "unfinished.txt"), "preserve");
  return {
    dockerExecutable: path.resolve(root, "docker"),
    image,
    workspaceRoot: root,
    workspaceDirectory,
    command: ["bun", "run", "test:unit", "literal;$(nope)"],
    limits: { timeoutMs: 1000, controlTimeoutMs: 100, outputBytes: 1024 },
  };
}
type Settings = {
  hang?: boolean;
  uncertain?: boolean;
  wrongLabels?: boolean;
  killFails?: boolean;
  wrapperOnly?: boolean;
  exitCode?: number;
  killedExitCode?: number;
  overflow?: boolean;
  createFails?: boolean;
  removeFails?: boolean;
  inspectError?: boolean;
  inspectHangs?: boolean;
  clientHangs?: boolean;
  extraVolume?: boolean;
  wrongImage?: boolean;
  stateMissing?: boolean;
  inspectFailsAfterStart?: boolean;
  onCreate?: () => void;
  onInspect?: (count: number) => void;
  onStart?: () => void;
};
function dockerFake(settings: Settings = {}) {
  let running = false;
  let killed = false;
  let labels: Record<string, string> = {};
  let workspace = "";
  let inspectCount = 0;
  const calls: {
    executable: string;
    args: string[];
    options: Record<string, unknown>;
  }[] = [];
  const spawn = vi.fn(
    (executable: string, args: string[], options: Record<string, unknown>) => {
      calls.push({ executable, args, options });
      const child = Object.assign(new EventEmitter(), {
        stdout: new PassThrough(),
        stderr: new PassThrough(),
        kill: vi.fn(() => {
          if (!settings.clientHangs)
            queueMicrotask(() => child.emit("close", null, "SIGKILL"));
          return true;
        }),
      });
      queueMicrotask(() => {
        const operation = args[4];
        let stdout = "";
        let code = 0;
        if (operation === "create") {
          settings.onCreate?.();
          workspace = args[args.indexOf("--mount") + 1].slice(
            'type=bind,"source='.length,
            -'","target=/candidate"'.length,
          );
          labels = Object.fromEntries(
            args.flatMap((arg, index) =>
              arg === "--label" ? [args[index + 1].split("=")] : [],
            ),
          );
          stdout = containerId;
          if (settings.createFails) code = 1;
        } else if (operation === "inspect") {
          settings.onInspect?.(++inspectCount);
          if (settings.inspectHangs) return;
          if (settings.inspectError) {
            child.emit("error", new Error("daemon unavailable"));
            return;
          }
          if (
            settings.uncertain ||
            (settings.inspectFailsAfterStart && running)
          ) {
            stdout = "not inspect JSON";
            code = 1;
          } else
            stdout = JSON.stringify([
              {
                Id: containerId,
                Image: settings.wrongImage ? "sha256:" + "c".repeat(64) : image,
                Mounts: [
                  {
                    Type: "bind",
                    Source: workspace,
                    Destination: "/candidate",
                    RW: true,
                  },
                  ...(settings.extraVolume
                    ? [
                        {
                          Type: "volume",
                          Destination: "/credentials",
                          RW: true,
                        },
                      ]
                    : []),
                ],
                Config: { Labels: settings.wrongLabels ? {} : labels },
                State: settings.stateMissing
                  ? {}
                  : {
                      Running: running,
                      Paused: false,
                      Restarting: false,
                      Status: running ? "running" : "exited",
                      ExitCode: killed
                        ? (settings.killedExitCode ?? 137)
                        : (settings.exitCode ?? 0),
                    },
              },
            ]);
        } else if (operation === "start") {
          running = true;
          settings.onStart?.();
          if (settings.overflow) child.stdout.write("x".repeat(3000));
          if (settings.hang || settings.overflow) return;
          if (!settings.wrapperOnly) running = false;
          stdout = "check output";
          code = settings.exitCode ?? 0;
        } else if (operation === "kill") {
          if (settings.killFails) code = 1;
          else {
            running = false;
            killed = true;
          }
        } else if (operation === "rm") {
          stdout = containerId;
          expect(running).toBe(false);
          if (settings.removeFails) code = 1;
        } else throw new Error(`Unexpected Docker operation: ${operation}`);
        child.stdout.end(stdout);
        child.emit("close", code, null);
      });
      return child;
    },
  );
  return { spawn: spawn as unknown as typeof nodeSpawn, calls };
}

it("reports the final daemon exit code after cancellation cleanup", async () => {
  const input = fixture();
  const controller = new AbortController();
  const fake = dockerFake({
    hang: true,
    killedExitCode: 137,
    onStart: () => controller.abort(),
  });
  const result = await executeCandidateCheck(
    { ...input, signal: controller.signal },
    { spawn: fake.spawn },
  );
  expect(result).toMatchObject({
    status: "cancelled",
    exitCode: 137,
    cleanupConfirmed: true,
  });
});

it("runs only a bounded pinned candidate with argument arrays and no inherited credentials", async () => {
  const input = fixture();
  const fake = dockerFake();
  const result = await executeCandidateCheck(input, { spawn: fake.spawn });
  expect(result).toMatchObject({
    status: "passed",
    exitCode: 0,
    containerId,
    cleanupConfirmed: true,
    reusable: true,
    stdout: "check output",
  });
  const create = fake.calls.find((call) => call.args[4] === "create")!;
  expect(create.executable).toBe(input.dockerExecutable);
  expect(create.options).toMatchObject({
    shell: false,
    env: {},
    stdio: ["ignore", "pipe", "pipe"],
  });
  for (const call of fake.calls) expect(call.options.env).toEqual({});
  expect(create.args[create.args.indexOf("--pull") + 1]).toBe("never");
  expect(create.args.slice(0, 4)).toEqual([
    "--config",
    expect.any(String),
    "--host",
    "unix:///var/run/docker.sock",
  ]);
  for (const pair of [
    ["--network", "none"],
    ["--cpus", "2"],
    ["--memory", "2048m"],
    ["--memory-swap", "2048m"],
    ["--pids-limit", "128"],
    ["--user", "1000:1000"],
    ["--cap-drop", "ALL"],
    ["--security-opt", "no-new-privileges"],
    ["--restart", "no"],
    ["--log-driver", "none"],
  ]) {
    const index = create.args.indexOf(pair[0]);
    expect(index).toBeGreaterThan(-1);
    expect(create.args[index + 1]).toBe(pair[1]);
  }
  expect(create.args).toContain("--read-only");
  expect(create.args.filter((arg) => arg === "--mount")).toHaveLength(1);
  expect(create.args).toContain(
    'type=bind,"source=' + input.workspaceDirectory + '","target=/candidate"',
  );
  expect(create.args).toContain(
    "/tmp:rw,exec,nosuid,nodev,size=256m,mode=1777",
  );
  // A real init reaps orphans, matching hosted runners.
  expect(create.args).toContain("--init");
  expect(create.args.slice(-5)).toEqual([
    "bun",
    image,
    "run",
    "test:unit",
    "literal;$(nope)",
  ]);
  expect(create.args).not.toContain("--privileged");
  expect(create.args).not.toContain("--env-file");
  expect(result.labels).toMatchObject({
    "core.archon.executor": "candidate-check",
    "core.archon.attempt": expect.any(String),
  });
  expect(
    fake.calls
      .filter((call) => ["start", "kill", "rm"].includes(call.args[4]))
      .every((call) => call.args.at(-1) === containerId),
  ).toBe(true);
  expect(
    readFileSync(path.join(input.workspaceDirectory, "unfinished.txt"), "utf8"),
  ).toBe("preserve");
});

it.each(["timeout", "cancel"])(
  "confirms actual stop before removal after %s",
  async (reason) => {
    const input = fixture();
    const controller = new AbortController();
    const fake = dockerFake({
      hang: true,
      onStart: reason === "cancel" ? () => controller.abort() : undefined,
    });
    const result = await executeCandidateCheck(
      {
        ...input,
        signal: controller.signal,
        limits: { ...input.limits, timeoutMs: 25 },
      },
      { spawn: fake.spawn },
    );
    expect(result).toMatchObject({
      status: reason === "timeout" ? "timed_out" : "cancelled",
      cleanupConfirmed: true,
      reusable: true,
    });
    expect(fake.calls.map((call) => call.args[4])).toEqual([
      "create",
      "inspect",
      "start",
      "inspect",
      "inspect",
      "kill",
      "inspect",
      "rm",
    ]);
  },
);

it("does not trust an attach client's exit as workload completion", async () => {
  const fake = dockerFake({ wrapperOnly: true });
  const result = await executeCandidateCheck(fixture(), { spawn: fake.spawn });
  expect(result.status).toBe("failed");
  expect(result.cleanupConfirmed).toBe(true);
  expect(fake.calls.map((call) => call.args[4])).toContain("kill");
});

it.each([
  { uncertain: true },
  { wrongLabels: true },
  { inspectError: true },
  { killFails: true, wrapperOnly: true },
  { removeFails: true },
])(
  "fails closed when cleanup or identity is uncertain: %j",
  async (settings) => {
    const fake = dockerFake(settings);
    await expect(
      executeCandidateCheck(fixture(), { spawn: fake.spawn }),
    ).rejects.toMatchObject({
      name: "CheckCleanupError",
      receipt: { cleanupConfirmed: false, reusable: false },
    });
    if (!settings.removeFails)
      expect(fake.calls.some((call) => call.args[4] === "rm")).toBe(false);
  },
);

it("reconciles ambiguous create by generated name and labels without starting", async () => {
  const fake = dockerFake({ createFails: true });
  const result = await executeCandidateCheck(fixture(), { spawn: fake.spawn });
  expect(result).toMatchObject({
    status: "failed",
    containerId,
    cleanupConfirmed: true,
  });
  expect(fake.calls.some((call) => call.args[4] === "start")).toBe(false);
  const create = fake.calls[0].args;
  expect(fake.calls[1].args.at(-1)).toBe(create[create.indexOf("--name") + 1]);
});

it("does not treat missing inspect after ambiguous create as cleanup proof", async () => {
  const fake = dockerFake({ createFails: true, uncertain: true });
  await expect(
    executeCandidateCheck(fixture(), { spawn: fake.spawn }),
  ).rejects.toMatchObject({ receipt: { reusable: false } });
});

it("bounds captured output and stops the workload on overflow", async () => {
  const fake = dockerFake({ overflow: true });
  const result = await executeCandidateCheck(fixture(), { spawn: fake.spawn });
  expect(result).toMatchObject({
    status: "output_limit",
    cleanupConfirmed: true,
  });
  expect(
    Buffer.byteLength(result.stdout) + Buffer.byteLength(result.stderr),
  ).toBeLessThanOrEqual(1024);
  expect(fake.calls.some((call) => call.args[4] === "kill")).toBe(true);
});

it("reports failed candidate exit separately from cleanup", async () => {
  const result = await executeCandidateCheck(fixture(), {
    spawn: dockerFake({ exitCode: 17 }).spawn,
  });
  expect(result).toMatchObject({
    status: "failed",
    exitCode: 17,
    reusable: true,
  });
});

it("does not create anything for a pre-aborted request", async () => {
  const controller = new AbortController();
  controller.abort();
  const fake = dockerFake();
  const result = await executeCandidateCheck(
    { ...fixture(), signal: controller.signal },
    { spawn: fake.spawn },
  );
  expect(result).toMatchObject({
    status: "cancelled",
    containerId: null,
    reusable: true,
  });
  expect(fake.spawn).not.toHaveBeenCalled();
});

it.each([
  { dockerExecutable: "docker" },
  { image: "core-archon-checks:latest" },
  { command: "bun run test" },
  { command: ["--privileged"] },
  { command: [] },
  { user: "0:0" },
  { limits: { timeoutMs: Infinity } },
  { limits: { pids: 0 } },
  { limits: { cpus: 1000 } },
  { limits: { memoryMb: -1 } },
])("rejects unsafe input before Docker: %j", async (invalid) => {
  const fake = dockerFake();
  await expect(
    executeCandidateCheck({ ...fixture(), ...invalid }, { spawn: fake.spawn }),
  ).rejects.toThrow();
  expect(fake.spawn).not.toHaveBeenCalled();
});

it("rejects roots, traversal, quotes, and paths outside the dedicated root", async () => {
  const input = fixture();
  const fake = dockerFake();
  for (const workspaceDirectory of [
    input.workspaceRoot,
    path.dirname(input.workspaceRoot),
    path.join(input.workspaceRoot, "..", "escape"),
    path.join(input.workspaceRoot, 'quote"'),
  ]) {
    await expect(
      executeCandidateCheck(
        { ...input, workspaceDirectory },
        { spawn: fake.spawn },
      ),
    ).rejects.toThrow();
  }
  expect(fake.spawn).not.toHaveBeenCalled();
});

it("rejects symlink or junction workspace escapes", async () => {
  const input = fixture();
  const link = path.join(input.workspaceRoot, "link");
  symlinkSync(
    input.workspaceDirectory,
    link,
    process.platform === "win32" ? "junction" : "dir",
  );
  const fake = dockerFake();
  await expect(
    executeCandidateCheck(
      { ...input, workspaceDirectory: link },
      { spawn: fake.spawn },
    ),
  ).rejects.toThrow();
  expect(fake.spawn).not.toHaveBeenCalled();
});

it("disables inherited image healthchecks", async () => {
  const fake = dockerFake();
  await executeCandidateCheck(fixture(), { spawn: fake.spawn });
  expect(fake.calls[0].args).toContain("--no-healthcheck");
});

it("reconciles cancellation during create without starting candidate code", async () => {
  const controller = new AbortController();
  const fake = dockerFake({ onCreate: () => controller.abort() });
  const result = await executeCandidateCheck(
    { ...fixture(), signal: controller.signal },
    { spawn: fake.spawn },
  );
  expect(result).toMatchObject({
    status: "cancelled",
    containerId,
    cleanupConfirmed: true,
  });
  expect(fake.calls.some((call) => call.args[4] === "start")).toBe(false);
});

it("keeps capacity blocked when cancellation cannot inspect the running workload", async () => {
  const controller = new AbortController();
  const fake = dockerFake({
    hang: true,
    inspectFailsAfterStart: true,
    onStart: () => controller.abort(),
  });
  await expect(
    executeCandidateCheck(
      { ...fixture(), signal: controller.signal },
      { spawn: fake.spawn },
    ),
  ).rejects.toMatchObject({
    receipt: { containerId, status: "cancelled", reusable: false },
  });
  expect(fake.calls.some((call) => call.args[4] === "rm")).toBe(false);
});

it("retains cancellation arriving during final daemon readback", async () => {
  const controller = new AbortController();
  const fake = dockerFake({
    onInspect: (count) => {
      if (count === 2) controller.abort();
    },
  });
  const result = await executeCandidateCheck(
    { ...fixture(), signal: controller.signal },
    { spawn: fake.spawn },
  );
  expect(result).toMatchObject({ status: "cancelled", cleanupConfirmed: true });
});

it("refuses image-declared additional writable volumes before starting", async () => {
  const fake = dockerFake({ extraVolume: true });
  const result = await executeCandidateCheck(fixture(), { spawn: fake.spawn });
  expect(result).toMatchObject({ status: "failed", cleanupConfirmed: true });
  expect(fake.calls.some((call) => call.args[4] === "start")).toBe(false);
});

it.each([
  { wrongImage: true },
  { stateMissing: true },
  { inspectHangs: true },
  { hang: true, clientHangs: true },
])(
  "does not release capacity after uncertain daemon/client state: %j",
  async (settings) => {
    const fake = dockerFake(settings);
    const input = fixture();
    await expect(
      executeCandidateCheck(
        {
          ...input,
          limits: { ...input.limits, timeoutMs: 25, controlTimeoutMs: 25 },
        },
        { spawn: fake.spawn },
      ),
    ).rejects.toMatchObject({
      name: "CheckCleanupError",
      receipt: { reusable: false, cleanupConfirmed: false },
    });
    expect(fake.calls.some((call) => call.args[4] === "rm")).toBe(false);
  },
);

const ATTEMPT = "0f1e2d3c-4b5a-4987-8765-43210fedcba9";

it("labels every container with the caller's run, issue and attempt", async () => {
  const fake = dockerFake();
  const result = await executeCandidateCheck(
    {
      ...fixture(),
      runId: "run-0123456789abcdef",
      issue: 12,
      attempt: ATTEMPT,
    },
    { spawn: fake.spawn },
  );
  const create = fake.calls.find((call) => call.args[4] === "create")!;
  const labels = create.args.flatMap((arg, index) =>
    arg === "--label" ? [create.args[index + 1]] : [],
  );
  expect({ labels, name: result.containerName, status: result.status }).toEqual(
    {
      labels: [
        "core.archon.executor=candidate-check",
        `core.archon.attempt=${ATTEMPT}`,
        "core.archon.run=run-0123456789abcdef",
        "core.archon.issue=12",
      ],
      name: `core-check-${ATTEMPT}`,
      status: "passed",
    },
  );
});

it.each([
  [{ runId: "../escape" }],
  [{ issue: 0 }],
  [{ issue: "12" }],
  [{ attempt: "not-a-uuid" }],
])(
  "rejects an unusable run label %j before Docker is reached",
  async (extra) => {
    const fake = dockerFake();
    await expect(
      executeCandidateCheck({ ...fixture(), ...extra }, { spawn: fake.spawn }),
    ).rejects.toThrow();
    expect(fake.calls).toHaveLength(0);
  },
);

it("quotes mount targets so a comma in a writer-created path cannot add mount options", async () => {
  const input = fixture();
  const source = path.join(input.workspaceRoot, "deps,readonly=false");
  mkdirSync(source);
  const fake = dockerFake();
  await executeCandidateCheck(
    {
      ...input,
      mounts: [
        {
          source,
          target: "/candidate/a,readonly=false/node_modules",
          readOnly: true,
        },
      ],
    },
    { spawn: fake.spawn },
  );
  const create = fake.calls.find((call) => call.args[4] === "create")!;
  expect(create.args).toContain(
    'type=bind,"source=' +
      source +
      '","target=/candidate/a,readonly=false/node_modules",readonly',
  );
});

function scratchInput(target: string) {
  const input = fixture();
  const modules = path.join(input.workspaceRoot, "clone", "node_modules");
  mkdirSync(path.join(modules, ".vite-temp"), { recursive: true });
  mkdirSync(path.join(modules, "react"));
  return {
    ...input,
    mounts: [
      { source: modules, target: "/candidate/node_modules", readOnly: true },
    ],
    scratch: [target],
  };
}

it("mounts a private scratch over a cache directory inside a read-only dependency mount", async () => {
  const fake = dockerFake();
  await executeCandidateCheck(
    scratchInput("/candidate/node_modules/.vite-temp"),
    { spawn: fake.spawn },
  );
  const create = fake.calls.find((call) => call.args[4] === "create")!;
  const at = create.args.indexOf(
    "/candidate/node_modules/.vite-temp:rw,exec,nosuid,nodev,size=256m,mode=1777",
  );
  expect(at).toBeGreaterThan(-1);
  expect(create.args[at - 1]).toBe("--tmpfs");
});

it.each([
  ["outside every read-only mount", "/candidate/src"],
  ["the dependency mount itself", "/candidate/node_modules"],
  ["a package directory, not a cache", "/candidate/node_modules/react"],
  ["a path that leaves the mount", "/candidate/node_modules/../src"],
  ["a nested cache path", "/candidate/node_modules/.vite-temp/deep"],
  ["a cache directory that does not exist", "/candidate/node_modules/.cache"],
])("refuses a scratch mount at %s", async (_name, target) => {
  const fake = dockerFake();
  await expect(
    executeCandidateCheck(scratchInput(target), { spawn: fake.spawn }),
  ).rejects.toThrow(/scratch/i);
  expect(fake.calls).toHaveLength(0);
});

function listingFake(listings: string[][], { failList = false } = {}) {
  const calls: string[][] = [];
  const spawn = vi.fn((_executable: string, args: string[]) => {
    calls.push(args);
    const child = Object.assign(new EventEmitter(), {
      stdout: new PassThrough(),
      stderr: new PassThrough(),
      kill: vi.fn(() => true),
    });
    queueMicrotask(() => {
      const operation = args[4];
      let stdout = "";
      let code = 0;
      if (operation === "ps") {
        if (failList) code = 1;
        stdout = (listings.shift() ?? []).join("\n");
      } else if (operation === "rm") stdout = args.at(-1)!;
      child.stdout.end(stdout);
      child.emit("close", code, null);
    });
    return child;
  });
  return { spawn: spawn as unknown as typeof nodeSpawn, calls };
}

it("removes every container carrying the given labels and confirms none remain", async () => {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-check-")),
  );
  roots.push(root);
  const other = "e".repeat(64);
  const fake = listingFake([[containerId, other], []]);
  const result = await removeLabeledContainers(
    {
      dockerExecutable: path.resolve(root, "docker"),
      labels: { "core.archon.run": "run-0123456789abcdef" },
      configRoot: root,
    },
    { spawn: fake.spawn },
  );
  expect({
    result,
    operations: fake.calls.map((args) => args.slice(4)),
  }).toEqual({
    result: { ok: true, found: [containerId, other], remaining: [] },
    operations: [
      [
        "ps",
        "--all",
        "--quiet",
        "--no-trunc",
        "--filter",
        "label=core.archon.run=run-0123456789abcdef",
      ],
      ["rm", "--force", "--volumes", containerId],
      ["rm", "--force", "--volumes", other],
      [
        "ps",
        "--all",
        "--quiet",
        "--no-trunc",
        "--filter",
        "label=core.archon.run=run-0123456789abcdef",
      ],
    ],
  });
});

it("reports containers that survive removal", async () => {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-check-")),
  );
  roots.push(root);
  const fake = listingFake([[containerId], [containerId]]);
  const result = await removeLabeledContainers(
    {
      dockerExecutable: path.resolve(root, "docker"),
      labels: { "core.archon.attempt": ATTEMPT },
      configRoot: root,
    },
    { spawn: fake.spawn },
  );
  expect(result).toEqual({
    ok: false,
    found: [containerId],
    remaining: [containerId],
  });
});

it("never reports success when Docker cannot list containers", async () => {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-check-")),
  );
  roots.push(root);
  const fake = listingFake([], { failList: true });
  const result = await removeLabeledContainers(
    {
      dockerExecutable: path.resolve(root, "docker"),
      labels: { "core.archon.attempt": ATTEMPT },
      configRoot: root,
    },
    { spawn: fake.spawn },
  );
  expect(result).toMatchObject({ ok: false, remaining: null });
});

it.each([[{}], [{ "core.archon.run": "x y" }], [{ "other.label": "x" }]])(
  "refuses a label selector it cannot scope: %j",
  async (labels) => {
    const fake = listingFake([]);
    await expect(
      removeLabeledContainers(
        { dockerExecutable: "/usr/bin/docker", labels },
        { spawn: fake.spawn },
      ),
    ).rejects.toThrow();
    expect(fake.calls).toHaveLength(0);
  },
);
