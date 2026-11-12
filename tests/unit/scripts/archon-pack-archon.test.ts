import { afterEach, describe, expect, it, vi } from "vitest";

import {
  StateConflict,
  archonEnvironment,
  conditionalWrite,
  createArchon,
  runCommand,
} from "../../../scripts/archon-factory/pack/.shared/archon.mjs";
import { ProcessError } from "../../../scripts/archon-factory/pack/.shared/proc.mjs";

type Reply = { code: number; stdout?: string; stderr?: string } | Error;
type Call = { argv: string[]; options: Record<string, unknown> };

// The Archon CLI boundary: records each invocation and answers with the
// runProcess result shape ({code, signal, stdout, stderr}).
function cli(...replies: Reply[]) {
  const calls: Call[] = [];
  const run = vi.fn(
    async (argv: string[], options: Record<string, unknown>) => {
      calls.push({ argv, options });
      const reply = replies.shift();
      if (!reply) throw new Error("unexpected Archon CLI call");
      if (reply instanceof Error) throw reply;
      return {
        code: reply.code,
        signal: null,
        stdout: reply.stdout ?? "",
        stderr: reply.stderr ?? "",
      };
    },
  );
  return { run, calls };
}

const ok = (body: unknown) => ({ code: 0, stdout: JSON.stringify(body) });
const project = "_folder/control";
const command = ["/opt/archon/0.14.0/archon"];

function archonWith(fake: ReturnType<typeof cli>, extra = {}) {
  return createArchon({
    command,
    project,
    env: { ARCHON_HOME: "/srv/core-factory/archon" },
    cwd: "/srv/core-factory/control",
    run: fake.run,
    ...extra,
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("invocation", () => {
  it("passes the environment, working folder, timeout and output bound to the runner", async () => {
    const fake = cli(ok({ name: "core/factory", revision: 1, value: {} }));
    await archonWith(fake).get("core/factory");
    expect(fake.calls[0].options).toEqual({
      env: { ARCHON_HOME: "/srv/core-factory/archon" },
      cwd: "/srv/core-factory/control",
      input: undefined,
      timeoutMs: 30_000,
      maxOutput: 524_288,
    });
  });

  // Observed on VM 100 (run 5cee51bf, 12 November 2026): a round's event
  // record was 807 KB after three role turns, past the default bound.
  it("lets a raw read raise the output bound, and keeps the default otherwise", async () => {
    const fake = cli(
      ok({ id: "run-1", events: [] }),
      ok({ id: "run-1", events: [] }),
    );
    const archon = archonWith(fake);
    await archon.raw(["workflow", "get", "run-1", "--json"], undefined, {
      maxOutput: 64 * 1024 * 1024,
    });
    await archon.raw(["workflow", "get", "run-1", "--json"]);
    expect(fake.calls.map((call) => call.options.maxOutput)).toEqual([
      67_108_864, 524_288,
    ]);
  });

  it("passes a configured timeout to the runner", async () => {
    const fake = cli(ok({ name: "core/factory", revision: 1, value: {} }));
    await archonWith(fake, { timeoutMs: 5000 }).get("core/factory");
    expect(fake.calls[0].options.timeoutMs).toBe(5000);
  });

  it("prefixes every invocation with the whole configured command", async () => {
    const fake = cli(ok({ name: "core/factory", revision: 1, value: {} }));
    await archonWith(fake, {
      command: ["/usr/bin/node", "/opt/archon/cli.mjs"],
    }).get("core/factory");
    expect(fake.calls[0].argv.slice(0, 3)).toEqual([
      "/usr/bin/node",
      "/opt/archon/cli.mjs",
      "state",
    ]);
  });

  it("omits the project scope when no project is configured", async () => {
    const fake = cli(ok({ name: "core/factory", revision: 1, value: {} }));
    await archonWith(fake, { project: undefined }).get("core/factory");
    expect(fake.calls[0].argv).toEqual([
      "/opt/archon/0.14.0/archon",
      "state",
      "get",
      "core/factory",
    ]);
  });

  it("uses the engine-supplied ARCHON_CLI_COMMAND when no command is given", async () => {
    vi.stubEnv(
      "ARCHON_CLI_COMMAND",
      '["/opt/archon/0.14.0/archon","--engine-run"]',
    );
    const fake = cli(ok({ name: "core/factory", revision: 1, value: {} }));
    await createArchon({ run: fake.run, env: {} }).get("core/factory");
    expect(fake.calls[0].argv).toEqual([
      "/opt/archon/0.14.0/archon",
      "--engine-run",
      "state",
      "get",
      "core/factory",
    ]);
  });

  it("refuses to build a transport when ARCHON_CLI_COMMAND is missing", () => {
    vi.stubEnv("ARCHON_CLI_COMMAND", undefined);
    expect(() => createArchon({ run: vi.fn(), env: {} })).toThrow(
      "ARCHON_CLI_COMMAND is not available",
    );
  });

  it.each([
    ["an empty array", "[]"],
    ["a bare string", '"archon"'],
    ["an empty part", '["/opt/archon/archon",""]'],
    ["a non-string part", '["/opt/archon/archon",3]'],
  ])("refuses ARCHON_CLI_COMMAND holding %s", (_label, raw) => {
    vi.stubEnv("ARCHON_CLI_COMMAND", raw);
    expect(() => runCommand()).toThrow("ARCHON_CLI_COMMAND is malformed");
  });

  it("defaults the child environment to the Archon allow-list", async () => {
    vi.stubEnv("ARCHON_HOME", "/srv/core-factory/archon");
    vi.stubEnv("GITHUB_TOKEN", "ghp_secret");
    const fake = cli(ok({ name: "core/factory", revision: 1, value: {} }));
    await createArchon({ command, run: fake.run }).get("core/factory");
    const env = fake.calls[0].options.env as Record<string, string>;
    expect({ archonHome: env.ARCHON_HOME, token: env.GITHUB_TOKEN }).toEqual({
      archonHome: "/srv/core-factory/archon",
      token: undefined,
    });
  });
});

describe("get", () => {
  it("reads one document in the configured project", async () => {
    const fake = cli(ok({ name: "core/factory", revision: 1, value: {} }));
    await archonWith(fake).get("core/factory");
    expect(fake.calls[0].argv).toEqual([
      "/opt/archon/0.14.0/archon",
      "state",
      "get",
      "core/factory",
      "--project",
      "_folder/control",
    ]);
  });

  it("returns the parsed document", async () => {
    const document = {
      name: "core/issues/12",
      revision: 4,
      value: { v: 1, status: "active" },
      lease: { runId: "run-1", live: true },
    };
    const fake = cli(ok(document));
    await expect(archonWith(fake).get("core/issues/12")).resolves.toEqual(
      document,
    );
  });

  it("rejects a read that names another document", async () => {
    const fake = cli(ok({ name: "core/issues/13", revision: 4, value: {} }));
    await expect(archonWith(fake).get("core/issues/12")).rejects.toThrow(
      "State read named another document",
    );
  });

  it("reports a failed read as a ProcessError that asks for reconciliation", async () => {
    const fake = cli({ code: 1, stdout: "", stderr: "store locked" });
    await expect(archonWith(fake).get("core/factory")).rejects.toMatchObject({
      name: "ProcessError",
      message: "state get core/factory failed (1); reconcile before retry",
      code: 1,
      stderr: "store locked",
    });
  });

  it("reports unparseable output from a successful exit as a failure", async () => {
    const fake = cli({ code: 0, stdout: "Archon 0.14.0 ready\n" });
    await expect(archonWith(fake).get("core/factory")).rejects.toThrow(
      "state get core/factory failed (0); reconcile before retry",
    );
  });

  it("keeps only the last 2000 characters of stderr in the failure", async () => {
    const fake = cli({
      code: 1,
      stderr: "h".repeat(500) + "t".repeat(2000),
    });
    const error = await archonWith(fake)
      .get("core/factory")
      .catch((caught: unknown) => caught);
    expect((error as ProcessError & { stderr: string }).stderr).toBe(
      "t".repeat(2000),
    );
  });
});

describe("list", () => {
  it("lists a prefix in the configured project", async () => {
    const fake = cli(ok([]));
    await archonWith(fake).list("core/issues/");
    expect(fake.calls[0].argv).toEqual([
      "/opt/archon/0.14.0/archon",
      "state",
      "list",
      "--prefix",
      "core/issues/",
      "--project",
      "_folder/control",
    ]);
  });

  it("asks for values when requested", async () => {
    const fake = cli(ok([]));
    await archonWith(fake).list("core/issues/", { values: true });
    expect(fake.calls[0].argv).toEqual([
      "/opt/archon/0.14.0/archon",
      "state",
      "list",
      "--prefix",
      "core/issues/",
      "--values",
      "--project",
      "_folder/control",
    ]);
  });

  it("returns the parsed listing", async () => {
    const listing = [{ name: "core/issues/12", revision: 4 }];
    const fake = cli(ok(listing));
    await expect(archonWith(fake).list("core/issues/")).resolves.toEqual(
      listing,
    );
  });

  it("reports a failed listing as a ProcessError", async () => {
    const fake = cli({ code: 2, stdout: "" });
    await expect(archonWith(fake).list("core/issues/")).rejects.toThrow(
      "state list core/issues/ failed (2); reconcile before retry",
    );
  });
});

describe("put", () => {
  const value = { v: 1, status: "active", round: 2 };
  const receipt = { name: "core/issues/12", revision: 5, value };

  it("writes conditionally on the expected revision in the configured project", async () => {
    const fake = cli(ok(receipt));
    await archonWith(fake).put("core/issues/12", value, { ifRevision: 4 });
    expect(fake.calls[0].argv).toEqual([
      "/opt/archon/0.14.0/archon",
      "state",
      "put",
      "core/issues/12",
      "--if-revision",
      "4",
      "--project",
      "_folder/control",
    ]);
  });

  it("sends the whole document value as JSON on stdin", async () => {
    const fake = cli(ok(receipt));
    await archonWith(fake).put("core/issues/12", value, { ifRevision: 4 });
    expect(fake.calls[0].options.input).toBe(
      '{"v":1,"status":"active","round":2}',
    );
  });

  it("takes the lease when asked", async () => {
    const fake = cli(ok(receipt));
    await archonWith(fake).put("core/issues/12", value, {
      ifRevision: 4,
      lease: "take",
    });
    expect(fake.calls[0].argv).toEqual([
      "/opt/archon/0.14.0/archon",
      "state",
      "put",
      "core/issues/12",
      "--if-revision",
      "4",
      "--project",
      "_folder/control",
      "--lease",
    ]);
  });

  it("releases the lease when asked", async () => {
    const fake = cli(ok(receipt));
    await archonWith(fake).put("core/issues/12", value, {
      ifRevision: 4,
      lease: "release",
    });
    expect(fake.calls[0].argv).toEqual([
      "/opt/archon/0.14.0/archon",
      "state",
      "put",
      "core/issues/12",
      "--if-revision",
      "4",
      "--project",
      "_folder/control",
      "--release-lease",
    ]);
  });

  it("creates a new document conditionally on revision zero", async () => {
    const fake = cli(ok({ ...receipt, revision: 1 }));
    await archonWith(fake).put("core/issues/12", value, { ifRevision: 0 });
    expect(fake.calls[0].argv.slice(4, 6)).toEqual(["--if-revision", "0"]);
  });

  it.each([
    ["missing", undefined],
    ["negative", -1],
    ["fractional", 1.5],
    ["a numeric string", "4"],
    ["not a number", Number.NaN],
    ["beyond the safe integers", Number.MAX_SAFE_INTEGER + 1],
  ])("refuses a %s ifRevision", async (_label, ifRevision) => {
    const fake = cli(ok(receipt));
    await expect(
      archonWith(fake).put("core/issues/12", value, {
        ifRevision: ifRevision as number,
      }),
    ).rejects.toThrow("put requires an explicit ifRevision");
  });

  it("never runs the CLI for an unconditional put", async () => {
    const fake = cli(ok(receipt));
    await archonWith(fake)
      .put("core/issues/12", value)
      .catch(() => {});
    expect(fake.run).not.toHaveBeenCalled();
  });

  it("returns an acknowledgement that names the next revision and echoes the value", async () => {
    const fake = cli(ok(receipt));
    await expect(
      archonWith(fake).put("core/issues/12", value, { ifRevision: 4 }),
    ).resolves.toEqual(receipt);
  });

  it("accepts an echoed value whose keys arrive in another order", async () => {
    const fake = cli({
      code: 0,
      stdout:
        '{"name":"core/issues/12","revision":5,"value":{"round":2,"status":"active","v":1}}',
    });
    await expect(
      archonWith(fake).put("core/issues/12", value, { ifRevision: 4 }),
    ).resolves.toMatchObject({ revision: 5 });
  });

  it.each([
    ["the same revision", { ...receipt, revision: 4 }],
    ["a revision beyond the next one", { ...receipt, revision: 6 }],
    ["the revision as a string", { ...receipt, revision: "5" }],
    ["no revision", { name: "core/issues/12", value }],
    ["another document", { ...receipt, name: "core/issues/13" }],
    ["a different value", { ...receipt, value: { ...value, status: "held" } }],
    ["a value missing a field", { ...receipt, value: { v: 1, round: 2 } }],
  ])(
    "refuses an acknowledgement naming %s as ambiguous",
    async (_label, ack) => {
      const fake = cli(ok(ack));
      await expect(
        archonWith(fake).put("core/issues/12", value, { ifRevision: 4 }),
      ).rejects.toThrow(
        "state put core/issues/12: acknowledgement is ambiguous; reconcile before retry",
      );
    },
  );

  it("raises a StateConflict for exit 3", async () => {
    const fake = cli({ code: 3, stdout: "{}" });
    await expect(
      archonWith(fake).put("core/issues/12", value, { ifRevision: 4 }),
    ).rejects.toBeInstanceOf(StateConflict);
  });

  it("names the conflicting write and keeps what the CLI observed", async () => {
    const observed = { name: "core/issues/12", revision: 6, lease: null };
    const fake = cli({ code: 3, stdout: JSON.stringify(observed) });
    await expect(
      archonWith(fake).put("core/issues/12", value, { ifRevision: 4 }),
    ).rejects.toMatchObject({
      name: "StateConflict",
      message: "state put core/issues/12: revision or lease conflict",
      observed,
    });
  });

  it("raises a StateConflict for exit 3 even without parseable output", async () => {
    const fake = cli({ code: 3, stdout: "lease held by run-2" });
    await expect(
      archonWith(fake).put("core/issues/12", value, { ifRevision: 4 }),
    ).rejects.toMatchObject({ name: "StateConflict", observed: null });
  });

  it("reports any other failed exit as a ProcessError, not a conflict", async () => {
    const fake = cli({ code: 1, stdout: "{}", stderr: "disk full" });
    await expect(
      archonWith(fake).put("core/issues/12", value, { ifRevision: 4 }),
    ).rejects.toMatchObject({
      name: "ProcessError",
      message: "state put core/issues/12 failed (1); reconcile before retry",
      stderr: "disk full",
    });
  });

  it("reports unparseable output from a successful exit as a ProcessError", async () => {
    const fake = cli({ code: 0, stdout: "written" });
    await expect(
      archonWith(fake).put("core/issues/12", value, { ifRevision: 4 }),
    ).rejects.toBeInstanceOf(ProcessError);
  });

  it("propagates a runner failure unchanged", async () => {
    const failure = new ProcessError(
      "Command timed out; termination unconfirmed; reconcile before retry",
      { terminationConfirmed: false },
    );
    const fake = cli(failure);
    await expect(
      archonWith(fake).put("core/issues/12", value, { ifRevision: 4 }),
    ).rejects.toBe(failure);
  });
});

describe("patch", () => {
  const ops = [{ op: "replace", path: "/status", value: "held" }];

  it("patches in the configured project with the operations on stdin", async () => {
    const fake = cli(ok({ name: "core/issues/12", revision: 5 }));
    await archonWith(fake).patch("core/issues/12", ops);
    expect(fake.calls[0]).toMatchObject({
      argv: [
        "/opt/archon/0.14.0/archon",
        "state",
        "patch",
        "core/issues/12",
        "--project",
        "_folder/control",
      ],
      options: {
        input: '{"ops":[{"op":"replace","path":"/status","value":"held"}]}',
      },
    });
  });

  it("adds the expected revision when given, including revision zero", async () => {
    const fake = cli(ok({ name: "core/issues/12", revision: 1 }));
    await archonWith(fake).patch("core/issues/12", ops, { ifRevision: 0 });
    expect(fake.calls[0].argv.slice(-2)).toEqual(["--if-revision", "0"]);
  });

  it("returns the parsed acknowledgement", async () => {
    const ack = { name: "core/issues/12", revision: 5 };
    const fake = cli(ok(ack));
    await expect(
      archonWith(fake).patch("core/issues/12", ops),
    ).resolves.toEqual(ack);
  });

  it("raises a StateConflict for exit 3", async () => {
    const fake = cli({ code: 3, stdout: "{}" });
    await expect(
      archonWith(fake).patch("core/issues/12", ops, { ifRevision: 4 }),
    ).rejects.toBeInstanceOf(StateConflict);
  });
});

// I10: the CLI trigger transport is retired; every round, selection, answer
// and analysis start is a signed webhook delivery (webhook.mjs).
describe("trigger transport", () => {
  it("exposes no CLI trigger fire", () => {
    expect(archonWith(cli(ok({}))) as object).not.toHaveProperty("fire");
  });
});

describe("raw", () => {
  it("passes arguments and input through and returns the result with parsed JSON", async () => {
    const fake = cli({ code: 0, stdout: '{"version":"0.14.0"}' });
    const result = await archonWith(fake).raw(["version", "--json"], "in");
    expect({
      argv: fake.calls[0].argv,
      input: fake.calls[0].options.input,
      result,
    }).toEqual({
      argv: ["/opt/archon/0.14.0/archon", "version", "--json"],
      input: "in",
      result: {
        code: 0,
        signal: null,
        stdout: '{"version":"0.14.0"}',
        stderr: "",
        json: { version: "0.14.0" },
      },
    });
  });

  it("returns null JSON for unparseable output without throwing", async () => {
    const fake = cli({ code: 4, stdout: "usage: archon" });
    await expect(archonWith(fake).raw(["help"])).resolves.toMatchObject({
      code: 4,
      json: null,
    });
  });
});

describe("runStatus", () => {
  const RUN = "0f8fad5b-d9cb-469f-a165-70867728950e";

  it("reads one run's execution status from the engine, whatever its status", async () => {
    const fake = cli(
      ok({ id: RUN, status: "cancelled", workflow_name: "core-deliver" }),
    );
    const status = await archonWith(fake).runStatus(RUN);
    expect({ status, argv: fake.calls[0].argv }).toEqual({
      status: { id: RUN, status: "cancelled" },
      argv: [...command, "workflow", "get", RUN, "--json"],
    });
  });

  it.each([
    [
      "an unknown run",
      {
        code: 1,
        stdout: JSON.stringify({ ok: false, runId: RUN, error: "not_found" }),
      },
    ],
    [
      "a report about another run",
      ok({ id: "another-run", status: "completed" }),
    ],
    ["unreadable output", { code: 0, stdout: "not json" }],
  ])("reports no status for %s", async (_label, reply) => {
    await expect(archonWith(cli(reply)).runStatus(RUN)).resolves.toBeNull();
  });

  it("reports no status when the CLI cannot run", async () => {
    const fake = cli(new ProcessError("Command could not start"));
    await expect(archonWith(fake).runStatus(RUN)).resolves.toBeNull();
  });
});

describe("conditionalWrite", () => {
  function store(revisions: number[]) {
    const gets = revisions.map((revision) => ({
      name: "core/x",
      revision,
      value: { n: revision },
    }));
    let conflicts = revisions.length - 1;
    return {
      get: vi.fn(async () => gets.shift()),
      put: vi.fn(
        async (
          name: string,
          value: unknown,
          options: { ifRevision: number },
        ) => {
          if (conflicts > 0) {
            conflicts -= 1;
            throw new StateConflict("conflict", null);
          }
          return { name, revision: options.ifRevision + 1, value };
        },
      ),
    };
  }
  const plan = (document: { revision: number; value: { n: number } }) => ({
    name: "core/x",
    ifRevision: document.revision,
    value: { n: document.value.n + 1 },
    lease: "release",
  });

  it("re-reads after a concurrent writer and writes on the observed revision", async () => {
    const archon = store([1, 2]);
    const result = await conditionalWrite(archon, "core/x", plan);
    expect({
      written: result.written,
      revision: result.receipt?.revision,
      puts: archon.put.mock.calls.map((call) => call[2]),
    }).toEqual({
      written: true,
      revision: 3,
      puts: [
        { ifRevision: 1, lease: "release" },
        { ifRevision: 2, lease: "release" },
      ],
    });
  });

  it("writes nothing for a no-op plan", async () => {
    const archon = store([1]);
    const result = await conditionalWrite(archon, "core/x", () => ({
      noop: true,
    }));
    expect({ noop: result.noop, puts: archon.put.mock.calls.length }).toEqual({
      noop: true,
      puts: 0,
    });
  });

  it("gives up after four contended attempts", async () => {
    const archon = store([1, 2, 3, 4, 5]);
    expect(await conditionalWrite(archon, "core/x", plan)).toEqual({
      conflict: true,
    });
  });

  it("lets a refusing plan's error reach the caller", async () => {
    const archon = store([1]);
    await expect(
      conditionalWrite(archon, "core/x", () => {
        throw new Error("refused");
      }),
    ).rejects.toThrow("refused");
  });
});

describe("archonEnvironment", () => {
  it("passes Archon, workflow, XDG and locale variables through", () => {
    vi.stubEnv("ARCHON_HOME", "/srv/core-factory/archon");
    vi.stubEnv("ARCHON_USER_ID", "core-factory");
    vi.stubEnv("WORKFLOW_ID", "wf-1");
    vi.stubEnv("XDG_CONFIG_HOME", "/home/admin/.config");
    vi.stubEnv("LANG", "C.UTF-8");
    vi.stubEnv("TZ", "UTC");
    vi.stubEnv("USER", "admin");
    const env = archonEnvironment();
    expect({
      ARCHON_HOME: env.ARCHON_HOME,
      ARCHON_USER_ID: env.ARCHON_USER_ID,
      WORKFLOW_ID: env.WORKFLOW_ID,
      XDG_CONFIG_HOME: env.XDG_CONFIG_HOME,
      LANG: env.LANG,
      TZ: env.TZ,
      USER: env.USER,
    }).toEqual({
      ARCHON_HOME: "/srv/core-factory/archon",
      ARCHON_USER_ID: "core-factory",
      WORKFLOW_ID: "wf-1",
      XDG_CONFIG_HOME: "/home/admin/.config",
      LANG: "C.UTF-8",
      TZ: "UTC",
      USER: "admin",
    });
  });

  it("drops credentials and other unlisted variables", () => {
    vi.stubEnv("GITHUB_TOKEN", "ghp_secret");
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-secret");
    vi.stubEnv("CLAUDE_CODE_OAUTH_TOKEN", "oauth-secret");
    vi.stubEnv("AWS_SECRET_ACCESS_KEY", "aws-secret");
    const keys = Object.keys(archonEnvironment());
    expect(
      keys.filter((key) =>
        [
          "GITHUB_TOKEN",
          "ANTHROPIC_API_KEY",
          "CLAUDE_CODE_OAUTH_TOKEN",
          "AWS_SECRET_ACCESS_KEY",
        ].includes(key),
      ),
    ).toEqual([]);
  });

  it("matches exact names, not names that merely start with one", () => {
    vi.stubEnv("WORKFLOW_ID_TOKEN", "secret");
    vi.stubEnv("LANGUAGE", "en");
    vi.stubEnv("USER_SECRET", "secret");
    vi.stubEnv("TZ_OVERRIDE", "secret");
    const keys = Object.keys(archonEnvironment());
    expect(
      keys.filter((key) =>
        [
          "WORKFLOW_ID_TOKEN",
          "LANGUAGE",
          "USER_SECRET",
          "TZ_OVERRIDE",
        ].includes(key),
      ),
    ).toEqual([]);
  });

  it("returns only allow-listed names", () => {
    vi.stubEnv("SOME_UNLISTED_VARIABLE", "value");
    const allowed = (key: string) =>
      key.startsWith("ARCHON_") ||
      key.startsWith("XDG_") ||
      ["WORKFLOW_ID", "HOME", "PATH", "LANG", "TZ", "USER"].includes(key);
    expect(
      Object.keys(archonEnvironment()).filter((key) => !allowed(key)),
    ).toEqual([]);
  });

  it("adds explicit extras over inherited values", () => {
    vi.stubEnv("ARCHON_HOME", "/srv/inherited");
    expect(
      archonEnvironment({ ARCHON_HOME: "/srv/explicit", EXTRA_FLAG: "1" }),
    ).toMatchObject({ ARCHON_HOME: "/srv/explicit", EXTRA_FLAG: "1" });
  });
});
