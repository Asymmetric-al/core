import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { isRetryable } from "../src/lib/factory";
import {
  interpret,
  processControlRunner,
  requestIds,
} from "../src/server/control";
import {
  FACTORY_DEFAULTS,
  factoryConfiguration,
  factoryEnvironment,
  readFactoryPolicy,
} from "../src/server/factory-config";
import {
  argvText,
  runProcess,
  type ProcessRunner,
} from "../src/server/process";
import { StateUnavailable, cliStateReader } from "../src/server/state";

function recorder(stdout: string, code: number | null = 0) {
  const calls: {
    argv: readonly string[];
    env: Record<string, string>;
    cwd: string;
  }[] = [];
  const run: ProcessRunner = async (argv, options) => {
    calls.push({ argv, env: options.env, cwd: options.cwd });
    return {
      code,
      stdout,
      stderr: "/srv/core-factory secret stderr",
      timedOut: false,
      overflow: false,
    };
  };
  return { calls, run };
}

describe("factory configuration", () => {
  it("defaults to the VM 100 installation and passes only the documented environment", () => {
    const config = factoryConfiguration({ FACTORY_NODE: "/opt/node/bin/node" });
    expect(config.archonCommand).toEqual([FACTORY_DEFAULTS.FACTORY_ARCHON_CLI]);
    expect(config.controlScript).toBe(FACTORY_DEFAULTS.FACTORY_CONTROL_SCRIPT);
    expect(config.project).toBe("_folder/control");
    expect(factoryEnvironment(config, "linux")).toEqual({
      ARCHON_HOME: "/srv/core-factory/archon",
      ARCHON_USER_ID: "core-factory",
      // control.mjs refuses retry, reopen, release and adopt-policy
      // (identity-profile-environment-mismatch) unless it runs with the
      // owner's Claude profile, as the engine does.
      CLAUDE_CONFIG_DIR: "/home/admin/.claude",
      HOME: "/home/admin",
      PATH: "/usr/bin:/bin",
      // The same file the Console reads owners and the admission limit from.
      CORE_FACTORY_CONFIG: "/srv/core-factory/control/core-factory.json",
    });
    expect(config.configFile).toBe(FACTORY_DEFAULTS.FACTORY_CONFIG_FILE);
  });

  it("takes the owner's Claude profile from the service environment", () => {
    const config = factoryConfiguration({
      FACTORY_NODE: "/opt/node/bin/node",
      FACTORY_CLAUDE_PROFILE: "/srv/profiles/owner",
    });
    expect(factoryEnvironment(config, "linux").CLAUDE_CONFIG_DIR).toBe(
      "/srv/profiles/owner",
    );
    expect(() =>
      factoryConfiguration({ FACTORY_CLAUDE_PROFILE: "relative/profile" }),
    ).toThrow("FACTORY_CLAUDE_PROFILE");
  });

  it("accepts a JSON argv command and rejects relative or malformed values", () => {
    expect(
      factoryConfiguration({
        FACTORY_ARCHON_CLI: '["/usr/bin/node","/tmp/cli.mjs"]',
      }).archonCommand,
    ).toEqual(["/usr/bin/node", "/tmp/cli.mjs"]);
    expect(() =>
      factoryConfiguration({ FACTORY_ARCHON_CLI: "archon" }),
    ).toThrow("FACTORY_ARCHON_CLI");
    expect(() => factoryConfiguration({ FACTORY_ARCHON_CLI: "[1]" })).toThrow(
      "FACTORY_ARCHON_CLI",
    );
    expect(() =>
      factoryConfiguration({ FACTORY_CONFIG_FILE: "core-factory.json" }),
    ).toThrow("FACTORY_CONFIG_FILE");
  });

  it("has no environment source for scope owners or the admission limit", () => {
    // core-factory.json is the only source: control.mjs refuses an owner it
    // does not list and the selector admits up to its limits.admittedIssues.
    const config = factoryConfiguration({
      FACTORY_SCOPE_OWNERS: "mallory",
      FACTORY_ADMISSION_CAPACITY: "9",
    });
    expect(config).not.toHaveProperty("owners");
    expect(config).not.toHaveProperty("capacity");
    expect(FACTORY_DEFAULTS).not.toHaveProperty("FACTORY_SCOPE_OWNERS");
    expect(FACTORY_DEFAULTS).not.toHaveProperty("FACTORY_ADMISSION_CAPACITY");
  });
});

describe("factory configuration file (owners and admission limit)", () => {
  const folders: string[] = [];
  afterEach(() => {
    for (const folder of folders.splice(0))
      rmSync(folder, { recursive: true, force: true });
  });
  function configFile(content: unknown) {
    const folder = mkdtempSync(path.join(os.tmpdir(), "factory-policy-"));
    folders.push(folder);
    const file = path.join(folder, "core-factory.json");
    writeFileSync(
      file,
      typeof content === "string" ? content : JSON.stringify(content),
    );
    return file;
  }
  const owner = (login: string) => ({
    profile: `/srv/profiles/${login}`,
    githubLogin: login,
  });

  it("reads the owner aliases and limits.admittedIssues from the file", async () => {
    const file = configFile({
      version: 1,
      owners: { ops: owner("ops-login"), conrad: owner("conrad-login") },
      limits: { admittedIssues: 3, maxRounds: 8 },
    });
    await expect(readFactoryPolicy(file)).resolves.toEqual({
      owners: ["ops", "conrad"],
      capacity: 3,
      reason: null,
    });
  });

  it("reports a missing or unreadable file as unavailable, never a built-in owner or limit", async () => {
    const policy = await readFactoryPolicy(
      path.join(os.tmpdir(), "factory-policy-missing", "core-factory.json"),
    );
    expect(policy.owners).toBeNull();
    expect(policy.capacity).toBeNull();
    expect(policy.reason).toMatch(/could not be read/);
    // The reason never carries the private path or the system error.
    expect(policy.reason).not.toContain("factory-policy-missing");
    expect(policy.reason).not.toContain("ENOENT");
    const malformed = await readFactoryPolicy(configFile("{ not json"));
    expect(malformed).toMatchObject({ owners: null, capacity: null });
    expect(malformed.reason).toMatch(/not valid JSON/);
  });

  it("reports each missing or invalid field as unavailable on its own", async () => {
    const noLimit = await readFactoryPolicy(
      configFile({ owners: { conrad: owner("c") } }),
    );
    expect(noLimit.owners).toEqual(["conrad"]);
    expect(noLimit.capacity).toBeNull();
    expect(noLimit.reason).toMatch(/limits\.admittedIssues/);
    for (const admittedIssues of [0, -1, 1.5, "2", null])
      expect(
        (
          await readFactoryPolicy(
            configFile({
              owners: { conrad: owner("c") },
              limits: { admittedIssues },
            }),
          )
        ).capacity,
      ).toBeNull();
    for (const owners of [
      undefined,
      {},
      [],
      { "Conrad Smith": owner("c") },
      { conrad: "c" },
    ]) {
      const policy = await readFactoryPolicy(
        configFile({ owners, limits: { admittedIssues: 2 } }),
      );
      expect(policy.owners).toBeNull();
      expect(policy.capacity).toBe(2);
      expect(policy.reason).toMatch(/owners/);
    }
  });
});

describe("Archon CLI state reader", () => {
  const config = factoryConfiguration({ FACTORY_NODE: "/opt/node/bin/node" });

  it("spawns `state get` with an argv array, the control project and minimal env", async () => {
    const { calls, run } = recorder(
      JSON.stringify({ name: "core/factory", revision: 4, value: { v: 1 } }),
    );
    const document = await cliStateReader(config, run).get("core/factory");
    expect(document).toEqual({
      name: "core/factory",
      revision: 4,
      value: { v: 1 },
      lease: null,
    });
    expect(calls[0].argv).toEqual([
      "/opt/archon/0.14.0/archon",
      "state",
      "get",
      "core/factory",
      "--project",
      "_folder/control",
    ]);
    expect(calls[0].cwd).toBe("/srv/core-factory/control");
    expect(Object.keys(calls[0].env)).not.toContain("CONSOLE_PASSWORD");
  });

  it("lists with --values and keeps only documents under the prefix", async () => {
    const { calls, run } = recorder(
      JSON.stringify({
        documents: [
          {
            name: "core/issues/7",
            revision: 2,
            value: { v: 1 },
            lease: { runId: "r", live: true },
          },
        ],
      }),
    );
    const documents = await cliStateReader(config, run).list("core/issues/");
    expect(documents[0].lease).toEqual({ runId: "r", live: true });
    expect(calls[0].argv.slice(1)).toEqual([
      "state",
      "list",
      "--prefix",
      "core/issues/",
      "--values",
      "--project",
      "_folder/control",
    ]);
    const stray = recorder(
      JSON.stringify({
        documents: [{ name: "core/factory", revision: 1, value: {} }],
      }),
    );
    await expect(
      cliStateReader(config, stray.run).list("core/issues/"),
    ).rejects.toThrow("outside the prefix");
  });

  it("never runs more than three Archon CLI processes at once", async () => {
    let running = 0;
    let peak = 0;
    const run: ProcessRunner = async (argv) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running -= 1;
      return {
        code: 0,
        stdout: JSON.stringify({ name: argv[3], revision: 1, value: null }),
        stderr: "",
        timedOut: false,
        overflow: false,
      };
    };
    const reader = cliStateReader(config, run);
    const names = [
      "core/a",
      "core/b",
      "core/c",
      "core/d",
      "core/e",
      "core/f",
      "core/g",
    ];
    const documents = await Promise.all(names.map((name) => reader.get(name)));
    expect(documents.map((document) => document.name)).toEqual(names);
    expect(peak).toBe(3);
  });

  it("fails closed without leaking stderr, and refuses unexpected names", async () => {
    const failing = recorder("", 2);
    const error = await cliStateReader(config, failing.run)
      .get("core/factory")
      .catch((caught) => caught);
    expect(error).toBeInstanceOf(StateUnavailable);
    expect(error.message).toBe("Factory state read failed (Archon CLI exit 2)");
    const other = recorder(
      JSON.stringify({ name: "core/scope", revision: 1, value: {} }),
    );
    await expect(
      cliStateReader(config, other.run).get("core/factory"),
    ).rejects.toThrow("another state document");
    await expect(
      cliStateReader(config, other.run).get("core/../etc"),
    ).rejects.toThrow("Invalid");
    const missing = recorder("", null);
    await expect(
      cliStateReader(config, missing.run).get("core/factory"),
    ).rejects.toThrow("could not be started");
  });
});

describe("control.mjs runner", () => {
  const config = factoryConfiguration({ FACTORY_NODE: "/opt/node/bin/node" });

  it("runs node control.mjs with the exact argv and parses the last JSON line", async () => {
    const { calls, run } = recorder('warming up\n{"ok":true,"revision":7}\n');
    const result = await processControlRunner(config, run).run([
      "factory",
      "drain",
      "--request",
      "id",
    ]);
    expect(calls[0].argv).toEqual([
      "/opt/node/bin/node",
      FACTORY_DEFAULTS.FACTORY_CONTROL_SCRIPT,
      "factory",
      "drain",
      "--request",
      "id",
    ]);
    expect(result.json).toEqual({ ok: true, revision: 7 });
  });

  it("interprets every documented result shape", () => {
    const run = (
      json: Record<string, unknown> | null,
      exit: number | null = 0,
    ) => ({ exit, json, timedOut: false, overflow: false });
    expect(interpret("factory", run({ ok: true, revision: 3 })).outcome).toBe(
      "applied",
    );
    expect(interpret("factory", run({ ok: true, noop: true })).outcome).toBe(
      "already-applied",
    );
    expect(
      interpret(
        "issue",
        run({ ok: false, code: "stopped", message: "stopped" }, 2),
      ),
    ).toMatchObject({ outcome: "refused", code: "stopped" });
    expect(
      interpret(
        "issue",
        run(
          {
            ok: false,
            code: "error",
            message: "state put core/issues/1: acknowledgement is ambiguous",
          },
          1,
        ),
      ).outcome,
    ).toBe("unknown");
    expect(
      interpret(
        "cancel-run",
        run({ ok: true, status: 200, observed: "running" }),
      ).outcome,
    ).toBe("requested");
    expect(
      interpret(
        "ask",
        run({ ok: true, outcome: "accepted", status: 200, receipt: "r1" }),
      ).outcome,
    ).toBe("started");
    expect(
      interpret("ask", run({ ok: false, outcome: "unknown", status: null }))
        .outcome,
    ).toBe("unknown");
    expect(
      interpret(
        "analyze",
        run({ ok: false, outcome: "refused", status: 403, detail: "no" }),
      ).outcome,
    ).toBe("refused");
    expect(
      interpret("factory", {
        exit: null,
        json: null,
        timedOut: true,
        overflow: false,
      }).outcome,
    ).toBe("unknown");
    expect(interpret("factory", run(null, 1)).outcome).toBe("unknown");
  });

  it("interprets cancel-run: terminal run, executor containers and the held issue", () => {
    const run = (json: Record<string, unknown>) => ({
      exit: json.ok ? 0 : 2,
      json,
      timedOut: false,
      overflow: false,
    });
    const done = interpret(
      "cancel-run",
      run({
        ok: true,
        status: 200,
        observed: "cancelled",
        containers: { removed: ["0123456789ab"], remaining: [] },
        held: { issue: 101, ok: true, code: null },
      }),
    );
    expect(done.outcome).toBe("applied");
    expect(done.message).toContain("The engine reports the run as cancelled.");
    expect(done.message).toContain("Removed 1 executor container");
    expect(done.message).toContain("Issue #101 is held");
    // The engine accepted, but the run has not ended yet.
    const ending = interpret(
      "cancel-run",
      run({
        ok: false,
        status: 200,
        observed: "running",
        containers: { removed: [], remaining: [] },
      }),
    );
    expect(ending.outcome).toBe("requested");
    expect(ending.message).toContain("the run is now running");
    // The run ended but executor containers are left: cleanup is incomplete.
    const leftover = interpret(
      "cancel-run",
      run({
        ok: false,
        status: 200,
        observed: "cancelled",
        containers: {
          removed: [],
          remaining: ["0123456789ab", "ba9876543210"],
        },
        held: { issue: 101, ok: true, code: null },
      }),
    );
    expect(leftover.outcome).toBe("incomplete");
    expect(leftover.message).toContain(
      "2 executor containers remain: 0123456789ab, ba9876543210",
    );
    // Listing failed: whether containers remain is unknown.
    const unlisted = interpret(
      "cancel-run",
      run({
        ok: false,
        status: 200,
        observed: "cancelled",
        containers: {
          removed: [],
          remaining: null,
          error: "permission denied at /srv/core-factory/docker.sock",
        },
      }),
    );
    expect(unlisted.outcome).toBe("unknown");
    expect(unlisted.message).toContain("could not be listed");
    expect(unlisted.message).not.toContain("/srv/core-factory");
    // A refused cancel still reports what it observed.
    const refused = interpret(
      "cancel-run",
      run({
        ok: false,
        status: 409,
        detail: "Run is not running",
        observed: "cancelled",
        containers: { removed: [], remaining: [] },
        held: { issue: 104, ok: false, code: "stopped" },
      }),
    );
    expect(refused.outcome).toBe("refused");
    expect(refused.message).toContain("HTTP 409");
    expect(refused.message).toContain("No executor containers remain");
    expect(refused.message).toContain("Issue #104 was not held (stopped)");
    expect(isRetryable(leftover.outcome)).toBe(true);
    expect(isRetryable(unlisted.outcome)).toBe(true);
    expect(isRetryable(done.outcome)).toBe(false);
    expect(isRetryable(ending.outcome)).toBe(false);
  });
});

describe("request ids", () => {
  it("mints signed ids that match the pack's request pattern and rejects forgeries", () => {
    const ids = requestIds("fixture-password-not-a-real-secret");
    const id = ids.mint();
    expect(id).toMatch(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/);
    expect(ids.verify(id)).toBe(true);
    expect(
      ids.verify(`${id.slice(0, -1)}${id.endsWith("0") ? "1" : "0"}`),
    ).toBe(false);
    expect(requestIds("another-secret-of-24-characters").verify(id)).toBe(
      false,
    );
    expect(ids.proposal("op-a", "m1")).toBe(ids.proposal("op-a", "m1"));
    expect(ids.conversation(id)).toMatch(/^op-[a-f0-9]{20}$/);
  });

  it("strips control characters from argv text", () => {
    expect(argvText("hold\u0000 this\u0007 now\n", 100)).toBe("hold this now");
  });
});

describe("process runner", () => {
  it("tells a process that never started from one that ran", async () => {
    const missing = await runProcess(["/nonexistent/definitely-not-here"], {
      env: {},
      cwd: process.cwd(),
      timeoutMs: 5000,
      maxOutput: 1000,
    });
    expect(missing).toMatchObject({ code: null, spawnFailed: true });
    const ran = await runProcess(
      [process.execPath, "-e", "process.stdout.write('ok')"],
      {
        env: { PATH: "", SystemRoot: process.env.SystemRoot ?? "" },
        cwd: process.cwd(),
        timeoutMs: 20_000,
        maxOutput: 1000,
      },
    );
    expect(ran).toMatchObject({ code: 0, stdout: "ok", spawnFailed: false });
  });
});
