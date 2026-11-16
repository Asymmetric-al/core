import { EventEmitter, getEventListeners } from "node:events";
import { PassThrough, Writable } from "node:stream";
import { finished } from "node:stream/promises";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ProcessError,
  cleanEnvironment,
  runProcess,
} from "../../../scripts/archon-factory/pack/.shared/proc.mjs";

import type { spawn as nodeSpawn } from "node:child_process";

type Signal = "SIGTERM" | "SIGKILL";
type ChildSettings = {
  /** False models a child that never started (no pid, as on spawn failure). */
  started?: boolean;
  /** Signals the fake child obeys by exiting; others are ignored. */
  exitsOn?: Signal[];
};

// A spawned-process boundary fake: an EventEmitter child with real streams
// whose `close` arrives only after both output streams have drained, as Node
// guarantees for a real child process.
function harness({
  started = true,
  exitsOn = ["SIGTERM"],
}: ChildSettings = {}) {
  const pid = started ? 4242 : undefined;
  const stdinChunks: string[] = [];
  let stdinEnded = false;
  const stdin = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      stdinChunks.push(chunk.toString("utf8"));
      callback();
    },
    final(callback) {
      stdinEnded = true;
      callback();
    },
  });
  const signals: string[] = [];
  const child = Object.assign(new EventEmitter(), {
    pid,
    stdin,
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    unref: vi.fn(),
    kill: vi.fn((signal: Signal) => {
      signals.push(signal);
      if (exitsOn.includes(signal)) void exit(null, signal);
      return true;
    }),
  });
  async function exit(code: number | null, signal: string | null = null) {
    for (const stream of [child.stdout, child.stderr])
      if (!stream.writableEnded) stream.end();
    await Promise.all([finished(child.stdout), finished(child.stderr)]).catch(
      () => {},
    );
    child.emit("close", code, signal);
  }
  const calls: {
    command: string;
    args: string[];
    options: Record<string, unknown>;
  }[] = [];
  const spawnImpl = vi.fn(
    (command: string, args: string[], options: Record<string, unknown>) => {
      calls.push({ command, args, options });
      return child;
    },
  ) as unknown as typeof nodeSpawn;
  return {
    child,
    exit,
    signals,
    calls,
    spawnImpl,
    stdin: () => ({ chunks: stdinChunks, ended: stdinEnded }),
  };
}

function track(promise: Promise<unknown>) {
  const state: { outcome: "pending" | "resolved" | "rejected" } = {
    outcome: "pending",
  };
  promise.then(
    () => (state.outcome = "resolved"),
    () => (state.outcome = "rejected"),
  );
  return state;
}

const argv = ["/opt/archon/archon", "state", "get", "core/factory"];

describe("runProcess", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves with the exit code and both captured output streams", async () => {
    const fake = harness();
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    fake.child.stdout.write('{"name":"core/factory"}');
    fake.child.stderr.write("warning: slow store");
    void fake.exit(0);
    await expect(pending).resolves.toEqual({
      code: 0,
      signal: null,
      stdout: '{"name":"core/factory"}',
      stderr: "warning: slow store",
    });
  });

  it("resolves a non-zero exit instead of rejecting it", async () => {
    const fake = harness();
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    void fake.exit(3);
    await expect(pending).resolves.toMatchObject({ code: 3 });
  });

  it("reports a signal-ended exit as code -1 with that signal", async () => {
    const fake = harness();
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    void fake.exit(null, "SIGSEGV");
    await expect(pending).resolves.toMatchObject({
      code: -1,
      signal: "SIGSEGV",
    });
  });

  it("decodes multibyte UTF-8 split across output chunks", async () => {
    const fake = harness();
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    const bytes = Buffer.from("café", "utf8");
    fake.child.stdout.write(bytes.subarray(0, 4));
    fake.child.stdout.write(bytes.subarray(4));
    void fake.exit(0);
    await expect(pending).resolves.toMatchObject({ stdout: "café" });
  });

  it("spawns the executable with argument arrays, no shell and piped stdio", async () => {
    const fake = harness();
    const pending = runProcess(argv, {
      cwd: "/srv/core-factory/control",
      env: { ARCHON_HOME: "/srv/core-factory/archon" },
      spawnImpl: fake.spawnImpl,
    });
    void fake.exit(0);
    await pending;
    expect(fake.calls).toEqual([
      {
        command: "/opt/archon/archon",
        args: ["state", "get", "core/factory"],
        options: {
          cwd: "/srv/core-factory/control",
          env: { ARCHON_HOME: "/srv/core-factory/archon" },
          shell: false,
          windowsHide: true,
          stdio: ["pipe", "pipe", "pipe"],
        },
      },
    ]);
  });

  it("gives the child an empty environment unless one is passed", async () => {
    const fake = harness();
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    void fake.exit(0);
    await pending;
    expect(fake.calls[0].options.env).toEqual({});
  });

  it("writes the input to stdin and then closes it", async () => {
    const fake = harness();
    const pending = runProcess(argv, {
      input: '{"v":1}',
      spawnImpl: fake.spawnImpl,
    });
    await finished(fake.child.stdin);
    void fake.exit(0);
    await pending;
    expect(fake.stdin()).toEqual({ chunks: ['{"v":1}'], ended: true });
  });

  it("closes stdin without data when there is no input", async () => {
    const fake = harness();
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    await finished(fake.child.stdin);
    void fake.exit(0);
    await pending;
    expect(fake.stdin()).toEqual({ chunks: [], ended: true });
  });

  it.each([
    ["an empty argv", []],
    ["a non-array argv", "archon state get"],
    ["a non-string part", ["archon", 7]],
    ["a NUL byte in an argument", ["archon", "state\0get"]],
  ])("rejects %s without spawning", async (_label, invalid) => {
    const fake = harness();
    await expect(
      runProcess(invalid as string[], { spawnImpl: fake.spawnImpl }),
    ).rejects.toMatchObject({
      name: "ProcessError",
      message: "Invalid command",
    });
    expect(fake.calls).toHaveLength(0);
  });

  it("reports a spawn that throws as a start failure with its cause", async () => {
    const cause = new Error("EACCES");
    const spawnImpl = vi.fn(() => {
      throw cause;
    }) as unknown as typeof nodeSpawn;
    await expect(runProcess(argv, { spawnImpl })).rejects.toMatchObject({
      name: "ProcessError",
      message: "Command could not start",
      cause,
    });
  });

  it("reports an error from a child that never started as a start failure", async () => {
    const fake = harness({ started: false });
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    const cause = Object.assign(new Error("spawn ENOENT"), { code: "ENOENT" });
    fake.child.emit("error", cause);
    await expect(pending).rejects.toMatchObject({
      message: "Command could not start",
      cause,
    });
  });

  it("does not signal a child that never started", async () => {
    const fake = harness({ started: false });
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    fake.child.emit("error", new Error("spawn ENOENT"));
    await pending.catch(() => {});
    expect(fake.signals).toEqual([]);
  });

  it("terminates a started child that errors and rejects as incomplete", async () => {
    const fake = harness();
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    fake.child.emit("error", new Error("EPIPE"));
    await expect(pending).rejects.toMatchObject({
      message: "Command did not complete",
      terminationConfirmed: true,
    });
    expect(fake.signals).toEqual(["SIGTERM"]);
  });

  it("does not send SIGTERM before the timeout elapses", async () => {
    const fake = harness();
    const pending = runProcess(argv, {
      timeoutMs: 5000,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(4999);
    expect(fake.signals).toEqual([]);
  });

  it("sends SIGTERM when the timeout elapses", async () => {
    const fake = harness();
    const pending = runProcess(argv, {
      timeoutMs: 5000,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(5000);
    expect(fake.signals).toEqual(["SIGTERM"]);
  });

  it("defaults to a sixty-second timeout", async () => {
    const fake = harness();
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(59_999);
    const before = [...fake.signals];
    await vi.advanceTimersByTimeAsync(1);
    expect({ before, after: fake.signals }).toEqual({
      before: [],
      after: ["SIGTERM"],
    });
  });

  it("rejects a timed-out child that obeys SIGTERM with confirmed termination", async () => {
    const fake = harness({ exitsOn: ["SIGTERM"] });
    const pending = runProcess(argv, {
      timeoutMs: 100,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(100);
    await expect(pending).rejects.toMatchObject({
      name: "ProcessError",
      message: "Command timed out",
      terminationConfirmed: true,
      code: null,
      signal: "SIGTERM",
    });
  });

  it("rejects a timeout with a ProcessError instance", async () => {
    const fake = harness({ exitsOn: ["SIGTERM"] });
    const pending = runProcess(argv, {
      timeoutMs: 100,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(100);
    await expect(pending).rejects.toBeInstanceOf(ProcessError);
  });

  it("does not escalate to SIGKILL once the child has exited on SIGTERM", async () => {
    const fake = harness({ exitsOn: ["SIGTERM"] });
    const pending = runProcess(argv, {
      timeoutMs: 100,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(100);
    await pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(5000);
    expect(fake.signals).toEqual(["SIGTERM"]);
  });

  it("waits one second after an ignored SIGTERM before sending SIGKILL", async () => {
    const fake = harness({ exitsOn: ["SIGKILL"] });
    const pending = runProcess(argv, {
      timeoutMs: 100,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(100 + 999);
    const before = [...fake.signals];
    await vi.advanceTimersByTimeAsync(1);
    expect({ before, after: fake.signals }).toEqual({
      before: ["SIGTERM"],
      after: ["SIGTERM", "SIGKILL"],
    });
  });

  it("rejects with confirmed termination when SIGKILL ends a child that ignored SIGTERM", async () => {
    const fake = harness({ exitsOn: ["SIGKILL"] });
    const pending = runProcess(argv, {
      timeoutMs: 100,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(1100);
    await expect(pending).rejects.toMatchObject({
      message: "Command timed out",
      terminationConfirmed: true,
      signal: "SIGKILL",
    });
  });

  it("stays pending for one second after SIGKILL while closure is unconfirmed", async () => {
    const fake = harness({ exitsOn: [] });
    const pending = runProcess(argv, {
      timeoutMs: 100,
      spawnImpl: fake.spawnImpl,
    });
    const state = track(pending);
    await vi.advanceTimersByTimeAsync(100 + 1000 + 999);
    expect(state.outcome).toBe("pending");
  });

  it("says termination is unconfirmed when even SIGKILL produces no exit", async () => {
    const fake = harness({ exitsOn: [] });
    const pending = runProcess(argv, {
      timeoutMs: 100,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(2100);
    await expect(pending).rejects.toMatchObject({
      name: "ProcessError",
      message:
        "Command timed out; termination unconfirmed; reconcile before retry",
      terminationConfirmed: false,
    });
  });

  it("abandons the stdio streams and handle of a child whose termination is unconfirmed", async () => {
    const fake = harness({ exitsOn: [] });
    const pending = runProcess(argv, {
      timeoutMs: 100,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(2100);
    await pending.catch(() => {});
    expect({
      stdin: fake.child.stdin.destroyed,
      stdout: fake.child.stdout.destroyed,
      stderr: fake.child.stderr.destroyed,
      unref: fake.child.unref.mock.calls.length,
    }).toEqual({ stdin: true, stdout: true, stderr: true, unref: 1 });
  });

  it("keeps output that exactly fills the combined limit", async () => {
    const fake = harness();
    const pending = runProcess(argv, {
      maxOutput: 6,
      spawnImpl: fake.spawnImpl,
    });
    fake.child.stdout.write("abc");
    fake.child.stderr.write("def");
    void fake.exit(0);
    await expect(pending).resolves.toMatchObject({
      stdout: "abc",
      stderr: "def",
    });
  });

  it("terminates and rejects when stdout and stderr together exceed the limit", async () => {
    const fake = harness({ exitsOn: ["SIGTERM"] });
    const pending = runProcess(argv, {
      maxOutput: 5,
      spawnImpl: fake.spawnImpl,
    });
    fake.child.stdout.write("abc");
    fake.child.stderr.write("def");
    await expect(pending).rejects.toMatchObject({
      message: "Command exceeded output limit",
      terminationConfirmed: true,
    });
    expect(fake.signals).toEqual(["SIGTERM"]);
  });

  it("escalates an output overrun to SIGKILL when the child ignores SIGTERM", async () => {
    const fake = harness({ exitsOn: ["SIGKILL"] });
    const pending = runProcess(argv, {
      maxOutput: 2,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    fake.child.stdout.write("overflow");
    await vi.advanceTimersByTimeAsync(1000);
    await expect(pending).rejects.toMatchObject({
      message: "Command exceeded output limit",
      signal: "SIGKILL",
    });
  });

  it("terminates and rejects a running command when its signal aborts", async () => {
    const fake = harness({ exitsOn: ["SIGTERM"] });
    const controller = new AbortController();
    const pending = runProcess(argv, {
      signal: controller.signal,
      spawnImpl: fake.spawnImpl,
    });
    controller.abort();
    await expect(pending).rejects.toMatchObject({
      message: "Command cancelled",
      terminationConfirmed: true,
    });
    expect(fake.signals).toEqual(["SIGTERM"]);
  });

  it("cancels at once for a signal that is already aborted", async () => {
    const fake = harness({ exitsOn: ["SIGTERM"] });
    const pending = runProcess(argv, {
      signal: AbortSignal.abort(),
      spawnImpl: fake.spawnImpl,
    });
    await expect(pending).rejects.toMatchObject({
      message: "Command cancelled",
    });
  });

  it("escalates a cancellation to SIGKILL when the child ignores SIGTERM", async () => {
    const fake = harness({ exitsOn: ["SIGKILL"] });
    const controller = new AbortController();
    const pending = runProcess(argv, {
      signal: controller.signal,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    controller.abort();
    await vi.advanceTimersByTimeAsync(1000);
    await expect(pending).rejects.toMatchObject({
      message: "Command cancelled",
      signal: "SIGKILL",
    });
  });

  it("keeps the first termination reason when a second one arrives", async () => {
    const fake = harness({ exitsOn: ["SIGKILL"] });
    const controller = new AbortController();
    const pending = runProcess(argv, {
      timeoutMs: 100,
      signal: controller.signal,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(100);
    controller.abort();
    await vi.advanceTimersByTimeAsync(1000);
    await expect(pending).rejects.toMatchObject({
      message: "Command timed out",
    });
  });

  it("sends SIGTERM only once when several termination reasons arrive", async () => {
    const fake = harness({ exitsOn: ["SIGKILL"] });
    const controller = new AbortController();
    const pending = runProcess(argv, {
      timeoutMs: 100,
      signal: controller.signal,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(100);
    controller.abort();
    await vi.advanceTimersByTimeAsync(1000);
    await pending.catch(() => {});
    expect(fake.signals).toEqual(["SIGTERM", "SIGKILL"]);
  });

  it("removes its abort listener once the command completes", async () => {
    const fake = harness();
    const controller = new AbortController();
    const pending = runProcess(argv, {
      signal: controller.signal,
      spawnImpl: fake.spawnImpl,
    });
    void fake.exit(0);
    await pending;
    expect(getEventListeners(controller.signal, "abort")).toHaveLength(0);
  });

  it("does not signal a completed command when its signal aborts later", async () => {
    const fake = harness();
    const controller = new AbortController();
    const pending = runProcess(argv, {
      signal: controller.signal,
      spawnImpl: fake.spawnImpl,
    });
    void fake.exit(0);
    await pending;
    controller.abort();
    expect(fake.signals).toEqual([]);
  });

  it("leaves no pending timer after the command completes", async () => {
    const fake = harness();
    const pending = runProcess(argv, { spawnImpl: fake.spawnImpl });
    void fake.exit(0);
    await pending;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("leaves no pending timer after a terminated child exits", async () => {
    const fake = harness({ exitsOn: ["SIGTERM"] });
    const pending = runProcess(argv, {
      timeoutMs: 100,
      spawnImpl: fake.spawnImpl,
    });
    pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(100);
    await pending.catch(() => {});
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("cleanEnvironment", () => {
  const inherited = {
    PATH: "/usr/bin:/bin",
    HOME: "/home/admin",
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    TZ: "UTC",
    TMPDIR: "/tmp/factory",
    USER: "admin",
  };
  beforeEach(() => {
    for (const [key, value] of Object.entries(inherited))
      vi.stubEnv(key, value);
    vi.stubEnv("GITHUB_TOKEN", "ghp_secret");
    vi.stubEnv("GH_TOKEN", "gho_secret");
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-secret");
    vi.stubEnv("AWS_SECRET_ACCESS_KEY", "aws-secret");
    vi.stubEnv("ARCHON_CLI_COMMAND", '["archon"]');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps exactly the listed process variables and drops everything else", () => {
    expect(cleanEnvironment()).toStrictEqual(inherited);
  });

  it("omits a listed variable that is not set", () => {
    vi.stubEnv("TMPDIR", undefined);
    expect(Object.keys(cleanEnvironment())).not.toContain("TMPDIR");
  });

  it("adds explicit extras to the kept variables", () => {
    expect(
      cleanEnvironment({ GH_CONFIG_DIR: "/srv/core-factory/credentials/gh" }),
    ).toStrictEqual({
      ...inherited,
      GH_CONFIG_DIR: "/srv/core-factory/credentials/gh",
    });
  });

  it("lets an explicit extra override an inherited variable", () => {
    expect(cleanEnvironment({ HOME: "/home/service" }).HOME).toBe(
      "/home/service",
    );
  });
});
