import { createHash, createHmac } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  archonHomeConfig,
  controlFiles,
} from "../../../scripts/archon-factory/installation/install-logic.mjs";
import { StateConflict } from "../../../scripts/archon-factory/pack/.shared/archon.mjs";
import { validateConfig } from "../../../scripts/archon-factory/pack/.shared/config.mjs";
import {
  parseArgs,
  nativeEffects,
  runControl,
} from "../../../scripts/archon-factory/pack/.shared/control.mjs";
import {
  NativeIdentityRefusal,
  nativeAccountDigest,
  settingsDigest,
  verifyNativeIdentity,
} from "../../../scripts/archon-factory/pack/.shared/identity.mjs";

// Operator control CLI, driven end to end through runControl with an
// in-memory Archon state store (revisions + StateConflict like the real CLI
// transport), a fake server fetch and a real temporary factory root.

const NOW = "2026-11-11T12:00:00.000Z";
const EARLIER = "2026-11-10T08:00:00.000Z";
const RUN_ID = "0f8fad5b-d9cb-469f-a165-70867728950e";
const REQUEST = "req-0001";
const PORT = 3190;
// Test-only Standard Webhooks key (32 bytes of 0x07), written to a temp file.
const SIGNING_KEY = Buffer.alloc(32, 7);
const SIGNING_SECRET = `whsec_${SIGNING_KEY.toString("base64")}`;

type Doc = { revision: number; value: unknown; lease: unknown };
type Dict = Record<string, unknown>;

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

// The factory root is a POSIX path (control.mjs joins with path.posix). On
// Linux CI the temp dir already is one; on Windows the drive letter is dropped
// and Node resolves the rooted path against the current drive.
function factoryRoot() {
  const native = mkdtempSync(path.join(os.tmpdir(), "archon-control-"));
  roots.push(native);
  return native
    .replace(/^[A-Za-z]:/, "")
    .split(path.sep)
    .join("/");
}

function factoryConfig(root: string) {
  return validateConfig({
    version: 1,
    root,
    repository: {
      slug: "Example-org/core",
      remote: "https://example.invalid/core.git",
      targetBranch: "develop",
      mergeMethod: "merge",
    },
    archon: {
      home: `${root}/archon`,
      executable: "/opt/archon/0.14.0/archon",
      hostId: "vm100",
      port: PORT,
      serviceHome: "/home/admin",
    },
    git: {
      executable: "/usr/bin/git",
      authorName: "Factory",
      authorEmail: "factory@example.invalid",
    },
    github: { executable: "/usr/bin/gh", configDir: `${root}/credentials/gh` },
    executor: { docker: "/usr/bin/docker", image: `sha256:${"d".repeat(64)}` },
    owners: {
      primary: { profile: "/home/admin/.claude", githubLogin: "owner-login" },
    },
    nativeIdentity: {
      owner: "primary",
      profile: "/home/admin/.claude",
      provider: "claude",
    },
    webhooks: {
      secretFile: `${root}/credentials/webhook.env`,
      sourcesFile: `${root}/control/sources.json`,
    },
    defaultEndState: "PR_READY",
  });
}

function fakeArchon(
  seed: Record<string, unknown> = {},
  { leases = {} as Record<string, unknown> } = {},
) {
  const store = new Map<string, Doc>();
  for (const [name, value] of Object.entries(seed))
    store.set(name, {
      revision: 1,
      value: structuredClone(value),
      lease: leases[name] ?? null,
    });
  // Each pending interference is another writer landing between our read and
  // our conditional write.
  const interference: ((value: unknown) => unknown)[] = [];
  let putFailure: Error | null = null;
  const archon = {
    get: vi.fn(async (name: string) => {
      const doc = store.get(name);
      return doc
        ? {
            name,
            revision: doc.revision,
            value: structuredClone(doc.value),
            lease: doc.lease,
          }
        : { name, revision: 0, value: null, lease: null };
    }),
    list: vi.fn(async (prefix: string, { values = false } = {}) => ({
      documents: [...store.entries()]
        .filter(([name]) => name.startsWith(prefix))
        .map(([name, doc]) => ({
          name,
          revision: doc.revision,
          lease: doc.lease,
          ...(values ? { value: structuredClone(doc.value) } : {}),
        })),
    })),
    put: vi.fn(
      async (
        name: string,
        value: unknown,
        { ifRevision }: { ifRevision?: number } = {},
      ) => {
        if (putFailure) throw putFailure;
        if (
          typeof ifRevision !== "number" ||
          !Number.isSafeInteger(ifRevision) ||
          ifRevision < 0
        )
          throw new Error("put requires an explicit ifRevision");
        const other = interference.shift();
        if (other) {
          const doc = store.get(name);
          store.set(name, {
            revision: (doc?.revision ?? 0) + 1,
            value: other(structuredClone(doc?.value ?? null)),
            lease: doc?.lease ?? null,
          });
        }
        const doc = store.get(name);
        const revision = doc?.revision ?? 0;
        if (ifRevision !== revision)
          throw new StateConflict(
            `state put ${name}: revision or lease conflict`,
            null,
          );
        store.set(name, {
          revision: revision + 1,
          value: structuredClone(value),
          lease: doc?.lease ?? null,
        });
        return { name, revision: revision + 1, value };
      },
    ),
  };
  return {
    archon,
    revision: (name: string) => store.get(name)?.revision ?? 0,
    value: (name: string) => store.get(name)?.value as Dict | undefined,
    interfere: (...writers: ((value: unknown) => unknown)[]) =>
      interference.push(...writers),
    failPuts: (error: Error) => {
      putFailure = error;
    },
  };
}

function harness(seed: Record<string, unknown> = {}, options = {}) {
  const root = factoryRoot();
  const config = factoryConfig(root);
  mkdirSync(`${root}/credentials`, { recursive: true });
  mkdirSync(`${root}/control/.archon`, { recursive: true });
  const releaseFile = `${root}/control/.archon/core-factory-release.json`;
  writeFileSync(
    releaseFile,
    JSON.stringify({ policyRevision: "c".repeat(64) }),
  );
  writeFileSync(
    `${root}/credentials/webhook.env`,
    `CORE_FACTORY_SIGNING_SECRET=${SIGNING_SECRET}
`,
  );
  const state = fakeArchon(seed, options);
  const fetchImpl = vi.fn(
    async (_url: string, _init?: RequestInit) =>
      new Response("unexpected", { status: 500 }),
  );
  // executor.mjs removeLabeledContainers for cancel-run's container
  // reconcile (I5): by default no labelled containers exist.
  const removeContainers = vi.fn(
    async (_input: {
      dockerExecutable: string;
      labels: Record<string, string>;
    }): Promise<Dict> => ({ ok: true, found: [], remaining: [] }),
  );
  const verifyIdentity = vi.fn(
    async ({
      owner,
      expectedDigest,
    }: {
      owner: string;
      expectedDigest: string;
    }) => ({
      owner,
      profile: config.owners[owner]?.profile,
      provider: "claude",
      profileDigest: expectedDigest,
    }),
  );
  // recover-native's readback of the issue's remote branch: by default the
  // branch is not on the remote.
  const readEffects = vi.fn(async (_input: { value: Dict }): Promise<Dict> => ({
    ok: true,
    remoteHead: null,
  }));
  const run = (argv: string[]) =>
    runControl(argv, {
      archon: state.archon,
      config,
      fetchImpl,
      removeContainers,
      verifyIdentity,
      readEffects,
      now: () => NOW,
    });
  return {
    root,
    config,
    state,
    fetchImpl,
    removeContainers,
    verifyIdentity,
    readEffects,
    releaseFile,
    run,
  };
}

async function verifiedRecoveryHarness(overrides: Dict = {}) {
  const fixture = harness({
    "core/issues/12": workItem({
      status: "BLOCKED",
      route: null,
      ...overrides,
    }),
  });
  const { config, root, releaseFile, state, verifyIdentity } = fixture;
  const sha = (value: string) =>
    createHash("sha256").update(value).digest("hex");
  const auth = {
    loggedIn: true,
    authMethod: "claude.ai",
    apiProvider: "firstParty",
    subscriptionType: "team",
    configDirectory: config.nativeIdentity.profile,
    email: "fixture@example.invalid",
    orgId: "fixture-org",
  };
  const roleFiles = controlFiles({
    node: "/opt/node/bin/node",
    claude: "/opt/factory/native-claude",
    runtime: "/control/.shared",
  });
  const archonHome = archonHomeConfig({ claude: "/opt/factory/native-claude" });
  const release = {
    policyRevision: hex("c"),
    nativeIdentity: {
      ...config.nativeIdentity,
      home: config.archon.serviceHome,
      accountDigest: nativeAccountDigest(auth, config.nativeIdentity.profile),
    },
    claudeBinary: "/opt/claude/2.1.317",
    claudeBinarySha256: sha("claude"),
    claudeLauncher: {
      path: "/opt/factory/native-claude",
      sha256: sha("launcher"),
    },
    archon: { path: config.archon.executable, sha256: sha("archon") },
    node: { path: "/opt/node/bin/node", sha256: sha("node") },
    plugins: {
      provider: {
        path: `${config.archon.home}/plugins/archon-provider-claude`,
        sha256: sha("provider"),
      },
    },
    settingsDigest: settingsDigest(roleFiles, { managed: {}, archonHome }),
    settingsInputs: {
      managedPolicy: { dir: "/etc/claude-code", files: [] },
      archonHomeConfig: `${config.archon.home}/config.yaml`,
    },
  };
  const files = new Map<string, string>([
    [release.claudeBinary, "claude"],
    [release.claudeLauncher.path, "launcher"],
    [release.archon.path, "archon"],
    [release.node.path, "node"],
    [release.plugins.provider.path, "provider"],
    [release.settingsInputs.archonHomeConfig, archonHome],
    ...Object.entries(roleFiles).map(([name, text]): [string, string] => [
      `${root}/control/${name}`,
      text,
    ]),
  ]);
  const saveRelease = () => writeFileSync(releaseFile, JSON.stringify(release));
  saveRelease();
  const authStatus = vi.fn(async () => ({
    code: 0,
    stdout: JSON.stringify(auth),
    stderr: "",
  }));
  const verify = (options = {}) =>
    verifyNativeIdentity({
      config,
      env: {
        HOME: config.archon.serviceHome,
        CLAUDE_CONFIG_DIR: config.nativeIdentity.profile,
        ARCHON_HOME: config.archon.home,
      },
      run: authStatus,
      readManaged: () => ({}),
      readFile: (file: string) => {
        if (file === releaseFile) return readFileSync(file, "utf8");
        if (!files.has(file)) throw new Error("fixture-file-missing");
        return files.get(file)!;
      },
      ...options,
    });
  const binding = await verify();
  (state.value("core/issues/12")!.assignment as Dict).profileDigest =
    binding.profileDigest;
  authStatus.mockClear();
  verifyIdentity.mockImplementation(verify);
  return { ...fixture, release, saveRelease, files, auth, authStatus };
}

const hex = (character: string) => character.repeat(64);

function workItem(overrides: Dict = {}) {
  return {
    v: 1,
    issue: 12,
    assignment: {
      id: "assign-12",
      owner: "primary",
      profileDigest: hex("a"),
      scopeRevision: hex("b"),
      policyRevision: hex("c"),
      endState: "PR_READY",
      assignedAt: EARLIER,
      assignedBy: "selector",
      reason: null,
    },
    control: "run",
    controlReason: null,
    status: "waiting",
    route: "repair",
    round: 2,
    run: null,
    branch: "factory/12",
    base: null,
    head: null,
    acceptance: null,
    reviews: null,
    final: null,
    pr: null,
    brief: null,
    blocker: null,
    feedbackRounds: 0,
    repeats: {},
    areas: [],
    history: [],
    requests: [],
    updatedAt: EARLIER,
    ...overrides,
  };
}

function factoryDoc(overrides: Dict = {}) {
  return {
    v: 1,
    intake: "open",
    mode: "run",
    mergeHold: false,
    reason: "Admitted",
    updatedAt: EARLIER,
    updatedBy: "installer",
    requests: [],
    ...overrides,
  };
}

function scopeDoc(overrides: Dict = {}) {
  return {
    v: 1,
    issues: [12, 13],
    endState: "PR_READY",
    owner: "primary",
    approvedBy: "ops",
    approvedAt: EARLIER,
    note: null,
    priorities: {},
    requests: [],
    ...overrides,
  };
}

// A store where every mutation would succeed if the request guard were absent.
const fullSeed = () => ({
  "core/factory": factoryDoc(),
  "core/scope": scopeDoc(),
  "core/issues/12": workItem(),
});

describe("parseArgs", () => {
  it("separates positional words from --flag value pairs", () => {
    expect(
      parseArgs(["issue", "12", "hold", "--request", REQUEST, "--by", "ops"]),
    ).toEqual({
      positional: ["issue", "12", "hold"],
      flags: { request: REQUEST, by: "ops" },
    });
  });

  it("leaves a trailing flag without a value undefined", () => {
    expect(parseArgs(["status", "--request"]).flags).toEqual({
      request: undefined,
    });
  });
});

describe("request ids", () => {
  const mutations: [string, string[]][] = [
    ["factory", ["factory", "pause-intake", "--by", "ops"]],
    ["issue", ["issue", "12", "hold", "--by", "ops"]],
    [
      "scope",
      [
        "scope",
        "--issues",
        "12",
        "--end-state",
        "PR_READY",
        "--owner",
        "primary",
      ],
    ],
    ["prioritize", ["prioritize", "12", "50"]],
    ["allow-protected", ["allow-protected", "12", "all"]],
    ["cancel-run", ["cancel-run", RUN_ID]],
    ["ask", ["ask", "--conversation", "conv-0001", "--question", "Why?"]],
    ["analyze", ["analyze", "--scope", "factory"]],
  ];

  it.each(mutations)(
    "%s refuses to run without --request",
    async (_command, argv) => {
      const { run } = harness(fullSeed());
      await expect(run(argv)).rejects.toMatchObject({
        code: "request-id-required",
      });
    },
  );

  it.each(mutations)(
    "%s writes, fetches and delivers nothing without --request",
    async (_command, argv) => {
      const { run, state, fetchImpl, root } = harness(fullSeed());
      await run(argv).catch(() => null);
      expect({
        puts: state.archon.put.mock.calls.length,
        fetches: fetchImpl.mock.calls.length,
        inputs: existsSync(`${root}/runs/operator-requests`),
      }).toEqual({ puts: 0, fetches: 0, inputs: false });
    },
  );

  it("refuses a request id shorter than eight characters", async () => {
    const { run } = harness(fullSeed());
    await expect(
      run(["factory", "pause-intake", "--request", "req-001"]),
    ).rejects.toMatchObject({ code: "request-id-required" });
  });

  it("accepts an eight-character request id", async () => {
    const { run } = harness(fullSeed());
    await expect(
      run(["factory", "pause-intake", "--request", "req-0001"]),
    ).resolves.toMatchObject({ ok: true, revision: 2 });
  });

  it("refuses a request id that would escape the operator-requests folder", async () => {
    const { run, fetchImpl, root } = harness();
    await run([
      "ask",
      "--conversation",
      "conv-0001",
      "--question",
      "Why?",
      "--request",
      "req-0001/../../escape",
    ]).catch(() => null);
    expect({
      deliveries: fetchImpl.mock.calls.length,
      inputs: existsSync(`${root}/runs/operator-requests`),
    }).toEqual({ deliveries: 0, inputs: false });
  });
});

describe("factory controls", () => {
  it("initialises an absent factory document from the installer defaults", async () => {
    const { run, state } = harness();
    await run(["factory", "pause-intake", "--request", REQUEST, "--by", "ops"]);
    expect(state.value("core/factory")).toEqual({
      v: 1,
      intake: "paused",
      mode: "run",
      mergeHold: false,
      reason: null,
      updatedAt: NOW,
      updatedBy: "ops",
      requests: [{ id: REQUEST, action: "pause-intake", by: "ops", at: NOW }],
    });
  });

  it("reports the revision and value the conditional write produced", async () => {
    const { run } = harness({ "core/factory": factoryDoc() });
    const result = await run([
      "factory",
      "hold-merge",
      "--request",
      REQUEST,
      "--by",
      "ops",
      "--reason",
      "release freeze",
    ]);
    expect(result).toEqual({
      ok: true,
      revision: 2,
      value: factoryDoc({
        mergeHold: true,
        reason: "release freeze",
        updatedAt: NOW,
        updatedBy: "ops",
        requests: [{ id: REQUEST, action: "hold-merge", by: "ops", at: NOW }],
      }),
    });
  });

  it("drain pauses intake and switches the factory to drain mode", async () => {
    const { run, state } = harness({ "core/factory": factoryDoc() });
    await run(["factory", "drain", "--request", REQUEST]);
    expect(state.value("core/factory")).toMatchObject({
      intake: "paused",
      mode: "drain",
    });
  });

  it("records the default operator identity when --by is absent", async () => {
    const { run, state } = harness({ "core/factory": factoryDoc() });
    await run(["factory", "resume", "--request", REQUEST]);
    expect(state.value("core/factory")?.updatedBy).toBe("operator");
  });

  it("bounds the recorded operator identity to 80 characters", async () => {
    const { run, state } = harness({ "core/factory": factoryDoc() });
    await run([
      "factory",
      "resume",
      "--request",
      REQUEST,
      "--by",
      "x".repeat(200),
    ]);
    expect(state.value("core/factory")?.updatedBy).toBe("x".repeat(80));
  });

  it("replays the same request as a no-op", async () => {
    const { run } = harness({ "core/factory": factoryDoc() });
    await run(["factory", "pause-intake", "--request", REQUEST]);
    await expect(
      run(["factory", "pause-intake", "--request", REQUEST]),
    ).resolves.toMatchObject({ ok: true, noop: true });
  });

  it("does not write again when the same request is replayed", async () => {
    const { run, state } = harness({ "core/factory": factoryDoc() });
    await run(["factory", "pause-intake", "--request", REQUEST]);
    await run(["factory", "resume-intake", "--request", REQUEST]);
    expect({
      revision: state.revision("core/factory"),
      intake: state.value("core/factory")?.intake,
    }).toEqual({ revision: 2, intake: "paused" });
  });

  it("surfaces a workitem refusal as a clean error result", async () => {
    const { run } = harness({ "core/factory": factoryDoc({ mode: "stop" }) });
    await expect(
      run(["factory", "resume-intake", "--request", REQUEST]),
    ).resolves.toEqual({
      ok: false,
      code: "factory-stopped",
      message: "factory-stopped",
    });
  });

  it("writes nothing when the plan refuses", async () => {
    const { run, state } = harness({
      "core/factory": factoryDoc({ mode: "stop" }),
    });
    await run(["factory", "resume-intake", "--request", REQUEST]);
    expect(state.archon.put).not.toHaveBeenCalled();
  });

  it("refuses an unknown factory action cleanly", async () => {
    const { run } = harness({ "core/factory": factoryDoc() });
    await expect(
      run(["factory", "explode", "--request", REQUEST]),
    ).resolves.toEqual({
      ok: false,
      code: "unknown-action",
      message: "unknown-action: explode",
    });
  });
});

describe("issue controls", () => {
  it("holds a running issue with the operator's reason and request", async () => {
    const { run, state } = harness({ "core/issues/12": workItem() });
    await run([
      "issue",
      "12",
      "hold",
      "--request",
      REQUEST,
      "--by",
      "ops",
      "--reason",
      "waiting on design",
    ]);
    expect(state.value("core/issues/12")).toMatchObject({
      control: "hold",
      controlReason: "waiting on design",
      updatedAt: NOW,
      requests: [{ id: REQUEST, action: "hold", by: "ops", at: NOW }],
    });
  });

  it("reports the observed revision of the issue write", async () => {
    const { run } = harness({ "core/issues/12": workItem() });
    await expect(
      run(["issue", "12", "hold", "--request", REQUEST]),
    ).resolves.toMatchObject({
      ok: true,
      revision: 2,
      value: { control: "hold" },
    });
  });

  it("stops an idle issue outright", async () => {
    const { run, state } = harness({ "core/issues/12": workItem() });
    await run(["issue", "12", "stop", "--request", REQUEST]);
    expect(state.value("core/issues/12")).toMatchObject({
      control: "stop",
      status: "stopped",
    });
  });

  it("retries a blocked issue from its last route", async () => {
    const { run, state } = harness({
      "core/issues/12": workItem({
        status: "BLOCKED",
        route: null,
        blocker: {
          code: "no-progress",
          detail: "x",
          recovery: null,
          at: EARLIER,
        },
        repeats: { abc: 3 },
        history: [
          {
            round: 2,
            run: "run-2",
            route: "repair",
            outcome: "BLOCKED",
            next: null,
            at: EARLIER,
            summary: null,
          },
        ],
      }),
    });
    await run(["issue", "12", "retry", "--request", REQUEST]);
    expect(state.value("core/issues/12")).toMatchObject({
      status: "pending",
      route: "repair",
      blocker: null,
      repeats: {},
    });
  });

  it("replays the same request without a second write", async () => {
    const { run, state } = harness({ "core/issues/12": workItem() });
    await run(["issue", "12", "hold", "--request", REQUEST]);
    const replay = await run(["issue", "12", "hold", "--request", REQUEST]);
    expect({
      noop: replay.noop,
      revision: state.revision("core/issues/12"),
    }).toEqual({
      noop: true,
      revision: 2,
    });
  });

  it("surfaces a refused release as a clean error result without writing", async () => {
    const { run, state } = harness({ "core/issues/12": workItem() });
    const result = await run(["issue", "12", "release", "--request", REQUEST]);
    expect({ result, puts: state.archon.put.mock.calls.length }).toEqual({
      result: { ok: false, code: "not-held", message: "not-held" },
      puts: 0,
    });
  });

  describe("reconcile (lease-control#3)", () => {
    const abandoned = () =>
      workItem({
        status: "active",
        route: "repair",
        round: 3,
        run: { id: RUN_ID, startedAt: EARLIER, route: "repair", head: null },
      });

    it("settles an item whose run the engine reports cancelled, asking the engine about that run", async () => {
      const { run, state, fetchImpl } = harness(
        { "core/issues/12": abandoned() },
        { leases: { "core/issues/12": { runId: RUN_ID, live: false } } },
      );
      fetchImpl.mockImplementation(async () =>
        Response.json({ run: { id: RUN_ID, status: "cancelled" } }),
      );
      const result = await run([
        "issue",
        "12",
        "reconcile",
        "--request",
        REQUEST,
        "--by",
        "ops",
      ]);
      expect({
        ok: result.ok,
        asked: fetchImpl.mock.calls.map(([url]) => url),
        item: state.value("core/issues/12"),
      }).toMatchObject({
        ok: true,
        asked: [`http://127.0.0.1:${PORT}/api/workflows/runs/${RUN_ID}`],
        item: {
          status: "waiting",
          route: "repair",
          run: null,
          repeats: { "unfinished-run": 1 },
          requests: [{ id: REQUEST, action: "reconcile", by: "ops", at: NOW }],
        },
      });
    });

    it("refuses while the engine reports the run still running", async () => {
      const { run, state, fetchImpl } = harness(
        { "core/issues/12": abandoned() },
        { leases: { "core/issues/12": { runId: RUN_ID, live: false } } },
      );
      fetchImpl.mockImplementation(async () =>
        Response.json({ run: { id: RUN_ID, status: "running" } }),
      );
      const result = await run([
        "issue",
        "12",
        "reconcile",
        "--request",
        REQUEST,
      ]);
      expect({ result, puts: state.archon.put.mock.calls.length }).toEqual({
        result: {
          ok: false,
          code: "run-not-terminal",
          message: "run-not-terminal: running",
        },
        puts: 0,
      });
    });

    it("refuses while the run's lease is live", async () => {
      const { run, fetchImpl } = harness(
        { "core/issues/12": abandoned() },
        { leases: { "core/issues/12": { runId: RUN_ID, live: true } } },
      );
      fetchImpl.mockImplementation(async () =>
        Response.json({ run: { id: RUN_ID, status: "paused" } }),
      );
      await expect(
        run(["issue", "12", "reconcile", "--request", REQUEST]),
      ).resolves.toMatchObject({
        ok: false,
        code: "lease-live",
      });
    });
  });

  it("refuses a retry after the installed policy changes without rebinding", async () => {
    const { run, state, root } = harness({
      "core/issues/12": workItem({
        status: "BLOCKED",
        route: null,
        blocker: {
          code: "ci",
          detail: null,
          recovery: null,
          route: "repair",
          at: EARLIER,
        },
      }),
    });
    mkdirSync(`${root}/control/.archon`, { recursive: true });
    writeFileSync(
      `${root}/control/.archon/core-factory-release.json`,
      JSON.stringify({ policyRevision: hex("d") }),
    );
    const before = structuredClone(state.value("core/issues/12"));
    await expect(
      run(["issue", "12", "retry", "--request", REQUEST, "--by", "ops"]),
    ).resolves.toMatchObject({ ok: false, code: "policy-transition-required" });
    expect(state.value("core/issues/12")).toEqual(before);
    expect(state.archon.put).not.toHaveBeenCalled();
  });

  describe("issue adopt-policy (the explicit policy transition)", () => {
    const blockedItem = () =>
      workItem({
        status: "BLOCKED",
        route: null,
        head: "f".repeat(40),
        reviews: { micaiah: { decision: "CLEAR" } },
        final: { decision: "INCONCLUSIVE" },
        blocker: {
          code: "final-inconclusive",
          detail: null,
          recovery: null,
          route: "oracle",
          at: EARLIER,
        },
      });
    // The installed release moved to policy d...; the release the assignment
    // was bound under keeps its own record beside it.
    function moved(seedPredecessor: unknown = undefined) {
      const fixture = harness({ "core/issues/12": blockedItem() });
      const { root, state } = fixture;
      const former = state.value("core/issues/12").assignment.policyRevision;
      writeFileSync(
        `${root}/control/.archon/core-factory-release.json`,
        JSON.stringify({
          policyRevision: hex("d"),
          release: `${root}/releases/${hex("d").slice(0, 16)}`,
        }),
      );
      const predecessor =
        seedPredecessor === undefined
          ? { policyRevision: former, settingsDigest: hex("5") }
          : seedPredecessor;
      if (predecessor !== null) {
        mkdirSync(`${root}/releases/${former.slice(0, 16)}`, {
          recursive: true,
        });
        writeFileSync(
          `${root}/releases/${former.slice(0, 16)}/release.json`,
          typeof predecessor === "string"
            ? predecessor
            : JSON.stringify(predecessor),
        );
      }
      return { ...fixture, former, predecessor };
    }
    const adopt = (run: (argv: string[]) => Promise<unknown>) =>
      run(["issue", "12", "adopt-policy", "--request", REQUEST, "--by", "ops"]);

    it("proves the retained identity against the previous release's record, then re-binds", async () => {
      const { run, state, verifyIdentity, predecessor, config } = moved();
      verifyIdentity.mockImplementation(async ({ owner }) => ({
        owner,
        profile: config.owners[owner]?.profile,
        provider: "claude",
        profileDigest: hex("7"),
      }));
      const before = structuredClone(state.value("core/issues/12"));
      await expect(adopt(run)).resolves.toMatchObject({ ok: true });
      expect(verifyIdentity).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          owner: before.assignment.owner,
          expectedDigest: before.assignment.profileDigest,
          predecessor,
        }),
      );
      expect(state.value("core/issues/12")).toMatchObject({
        status: "BLOCKED",
        assignment: {
          ...before.assignment,
          policyRevision: hex("d"),
          profileDigest: hex("7"),
          transitions: [
            {
              from: before.assignment.policyRevision,
              to: hex("d"),
              profile: { from: before.assignment.profileDigest, to: hex("7") },
              by: "ops",
            },
          ],
        },
        reviews: null,
        final: null,
        blocker: { code: "final-inconclusive", route: "review" },
      });
      // The block is then retried under the adopted release and identity.
      verifyIdentity.mockImplementation(async ({ owner, expectedDigest }) => ({
        owner,
        profile: config.owners[owner]?.profile,
        provider: "claude",
        profileDigest: expectedDigest,
      }));
      await expect(
        run([
          "issue",
          "12",
          "retry",
          "--request",
          `${REQUEST}-b`,
          "--by",
          "ops",
        ]),
      ).resolves.toMatchObject({ ok: true });
      expect(state.value("core/issues/12")).toMatchObject({
        status: "pending",
        route: "review",
      });
    });

    it.each([
      ["is missing", null],
      ["is unreadable", "not json"],
      ["names another release", { policyRevision: hex("e") }],
    ])(
      "refuses when the previous release's record %s, before any identity check",
      async (_label, record) => {
        const { run, state, verifyIdentity } = moved(record);
        const before = structuredClone(state.value("core/issues/12"));
        await expect(adopt(run)).resolves.toMatchObject({
          ok: false,
          code: "predecessor-release-unavailable",
        });
        expect(verifyIdentity).not.toHaveBeenCalled();
        expect(state.value("core/issues/12")).toEqual(before);
      },
    );

    it.each([
      ["no proof", null, "identity-proof-unavailable"],
      [
        "another owner",
        { owner: "other", profileDigest: "7".repeat(64) },
        "identity-drift",
      ],
      [
        "a malformed digest",
        { owner: "primary", profileDigest: "x" },
        "identity-proof-unavailable",
      ],
    ])("refuses %s from identity verification", async (_label, proof, code) => {
      const { run, state, verifyIdentity } = moved();
      verifyIdentity.mockResolvedValue(proof as never);
      const before = structuredClone(state.value("core/issues/12"));
      await expect(adopt(run)).resolves.toMatchObject({ ok: false, code });
      expect(state.value("core/issues/12")).toEqual(before);
    });

    it("reports a refused identity proof by its own code", async () => {
      const { run, state, verifyIdentity } = moved();
      verifyIdentity.mockRejectedValue(
        new NativeIdentityRefusal("identity-account-drift"),
      );
      const before = structuredClone(state.value("core/issues/12"));
      await expect(adopt(run)).resolves.toMatchObject({
        ok: false,
        code: "identity-account-drift",
      });
      expect(state.value("core/issues/12")).toEqual(before);
    });

    it("checks the cheap refusals before reading any release record", async () => {
      const fixture = harness({
        "core/issues/12": workItem({ status: "waiting", route: "feedback" }),
      });
      writeFileSync(
        `${fixture.root}/control/.archon/core-factory-release.json`,
        JSON.stringify({ policyRevision: hex("d") }),
      );
      await expect(adopt(fixture.run)).resolves.toMatchObject({
        ok: false,
        code: "not-adoptable",
      });
      expect(fixture.verifyIdentity).not.toHaveBeenCalled();
    });
  });

  it("refuses to control an issue that has no work item", async () => {
    const { run } = harness();
    await expect(
      run(["issue", "77", "hold", "--request", REQUEST]),
    ).resolves.toMatchObject({ ok: false, code: "no-assignment" });
  });

  it.each(["0", "-4", "12abc", "1.5"])(
    "refuses the issue number %s before reading anything",
    async (issue) => {
      const { run, state } = harness({ "core/issues/12": workItem() });
      await expect(
        run(["issue", issue, "hold", "--request", REQUEST]),
      ).rejects.toMatchObject({ code: "invalid-issue" });
      expect(state.archon.get).not.toHaveBeenCalled();
    },
  );
});

describe("recovery compatibility proof", () => {
  it.each([
    ["retry", { status: "BLOCKED", route: null }],
    ["reopen", { status: "PR_READY", route: null }],
    ["reopen", { status: "stopped", control: "stop" }],
    ["release", { control: "hold" }],
  ])(
    "refuses %s on a historically policy-only rebound assignment without replacing its digest",
    async (action, overrides) => {
      const { run, state, release, saveRelease, fetchImpl } =
        await verifiedRecoveryHarness(overrides);
      release.policyRevision = hex("d");
      saveRelease();
      (state.value("core/issues/12")!.assignment as Dict).policyRevision =
        release.policyRevision;
      const before = structuredClone(state.value("core/issues/12"));
      await expect(
        run(["issue", "12", action, "--request", REQUEST]),
      ).resolves.toMatchObject({ ok: false, code: "identity-drift" });
      expect(state.value("core/issues/12")).toEqual(before);
      expect(state.revision("core/issues/12")).toBe(1);
      expect(state.archon.put).not.toHaveBeenCalled();
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["retry", { status: "BLOCKED", route: null }],
    ["reopen", { status: "PR_READY", route: null }],
    ["reopen", { status: "stopped", control: "stop" }],
    ["release", { control: "hold" }],
  ])(
    "verifies the retained identity before %s without changing its binding",
    async (action, overrides) => {
      const { run, state, verifyIdentity, fetchImpl } =
        await verifiedRecoveryHarness(overrides);
      const before = structuredClone(state.value("core/issues/12"));
      expect(
        await run(["issue", "12", action, "--request", REQUEST]),
      ).toMatchObject({ ok: true });
      expect(verifyIdentity).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          owner: "primary",
          expectedDigest: (before!.assignment as Dict).profileDigest,
        }),
      );
      expect(state.value("core/issues/12")!.assignment).toEqual(
        before!.assignment,
      );
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );

  it.each(["settings", "binary", "launcher", "account"])(
    "refuses actual %s fingerprint drift from an installer-shaped release before writing",
    async (change) => {
      const fixture = await verifiedRecoveryHarness();
      const { release, saveRelease, files, auth, state, run, fetchImpl } =
        fixture;
      const before = structuredClone(state.value("core/issues/12"));
      if (change === "settings") {
        const name = `${fixture.root}/control/CLAUDE.md`;
        files.set(name, `${files.get(name)}\nChanged trusted policy`);
      } else if (change === "binary")
        files.set(release.claudeBinary, "different-cli");
      else if (change === "launcher") {
        release.claudeLauncher.path = "/opt/factory/new-release/native-claude";
        files.set(release.claudeLauncher.path, "launcher");
        saveRelease();
      } else auth.email = "other-fixture@example.invalid";
      const expected = {
        settings: "identity-settings-drift",
        binary: "identity-binary-drift",
        launcher: "identity-drift",
        account: "identity-account-drift",
      }[change];
      await expect(
        run(["issue", "12", "retry", "--request", REQUEST]),
      ).resolves.toMatchObject({ ok: false, code: expected });
      expect(state.value("core/issues/12")).toEqual(before);
      expect(state.revision("core/issues/12")).toBe(1);
      expect(state.archon.put).not.toHaveBeenCalled();
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );

  it.each([
    undefined,
    {},
    { owner: "primary", profileDigest: "bad" },
    { owner: "primary", profileDigest: hex("e") },
    { owner: "other", profileDigest: hex("a") },
  ])(
    "refuses absent, malformed or mismatched identity proof %j",
    async (proof) => {
      const { run, state, verifyIdentity } = harness({
        "core/issues/12": workItem({ status: "BLOCKED" }),
      });
      const before = structuredClone(state.value("core/issues/12"));
      verifyIdentity.mockResolvedValue(proof as never);
      await expect(
        run(["issue", "12", "retry", "--request", REQUEST]),
      ).resolves.toMatchObject({
        ok: false,
        code: expect.stringMatching(/^identity-(proof-unavailable|drift)$/),
      });
      expect(state.value("core/issues/12")).toEqual(before);
      expect(state.archon.put).not.toHaveBeenCalled();
    },
  );

  it("reports unavailable native auth as a definite no-write refusal", async () => {
    const { run, state, verifyIdentity } = harness({
      "core/issues/12": workItem({ status: "BLOCKED" }),
    });
    verifyIdentity.mockRejectedValue(
      new NativeIdentityRefusal("identity-auth-unavailable"),
    );
    await expect(
      run(["issue", "12", "retry", "--request", REQUEST]),
    ).resolves.toMatchObject({ ok: false, code: "identity-auth-unavailable" });
    expect(state.archon.put).not.toHaveBeenCalled();
  });

  it("awaits comparison proof before the first conditional write", async () => {
    const { run, state, verifyIdentity } = harness({
      "core/issues/12": workItem({ status: "BLOCKED" }),
    });
    let resolveProof!: (
      proof: Awaited<ReturnType<typeof verifyIdentity>>,
    ) => void;
    verifyIdentity.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveProof = resolve;
        }),
    );
    const pending = run(["issue", "12", "retry", "--request", REQUEST]);
    await vi.waitFor(() => expect(verifyIdentity).toHaveBeenCalledOnce());
    expect(state.archon.put).not.toHaveBeenCalled();
    resolveProof({
      owner: "primary",
      profile: "/home/admin/.claude",
      provider: "claude",
      profileDigest: hex("a"),
    });
    expect(await pending).toMatchObject({ ok: true });
  });

  it("rereads the installed policy after a CAS conflict", async () => {
    const { run, state, releaseFile, verifyIdentity } = harness({
      "core/issues/12": workItem({ status: "BLOCKED" }),
    });
    state.interfere((value) => {
      writeFileSync(releaseFile, JSON.stringify({ policyRevision: hex("d") }));
      return { ...(value as Dict), controlReason: "other operator" };
    });
    await expect(
      run(["issue", "12", "retry", "--request", REQUEST]),
    ).resolves.toMatchObject({ ok: false, code: "policy-transition-required" });
    expect(state.archon.put).toHaveBeenCalledOnce();
    expect(verifyIdentity).toHaveBeenCalledOnce();
    expect(state.value("core/issues/12")).toMatchObject({
      status: "BLOCKED",
      controlReason: "other operator",
      assignment: { policyRevision: hex("c"), profileDigest: hex("a") },
      requests: [],
    });
  });

  it("reverifies the current assignment after a CAS conflict instead of reusing proof", async () => {
    const { run, state, verifyIdentity } = harness({
      "core/issues/12": workItem({ status: "BLOCKED" }),
    });
    verifyIdentity.mockResolvedValue({
      owner: "primary",
      profile: "/home/admin/.claude",
      provider: "claude",
      profileDigest: hex("a"),
    });
    state.interfere((value) => ({
      ...(value as Dict),
      assignment: {
        ...((value as Dict).assignment as Dict),
        id: "other-assignment",
        profileDigest: hex("e"),
      },
    }));
    await expect(
      run(["issue", "12", "retry", "--request", REQUEST]),
    ).resolves.toMatchObject({ ok: false, code: "identity-drift" });
    expect(verifyIdentity).toHaveBeenCalledTimes(2);
    expect(verifyIdentity).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ expectedDigest: hex("e") }),
    );
    expect(state.archon.put).toHaveBeenCalledOnce();
    expect(state.value("core/issues/12")).toMatchObject({
      status: "BLOCKED",
      assignment: { id: "other-assignment", profileDigest: hex("e") },
      requests: [],
    });
  });

  it("refuses a release change during identity verification even when policyRevision is unchanged", async () => {
    const { run, state, releaseFile, verifyIdentity } = harness({
      "core/issues/12": workItem({ status: "BLOCKED" }),
    });
    verifyIdentity.mockImplementationOnce(async ({ owner, expectedDigest }) => {
      writeFileSync(
        releaseFile,
        JSON.stringify({ policyRevision: hex("c"), settingsDigest: hex("e") }),
      );
      return {
        owner,
        profile: "/home/admin/.claude",
        provider: "claude",
        profileDigest: expectedDigest,
      };
    });
    await expect(
      run(["issue", "12", "retry", "--request", REQUEST]),
    ).resolves.toMatchObject({ ok: false, code: "policy-transition-required" });
    expect(state.archon.put).not.toHaveBeenCalled();
    expect(state.revision("core/issues/12")).toBe(1);
  });

  it("keeps a recovery replay read-only without a fresh execution proof", async () => {
    const { run, state, releaseFile, verifyIdentity } = harness({
      "core/issues/12": workItem({ status: "BLOCKED" }),
    });
    expect(
      await run(["issue", "12", "retry", "--request", REQUEST]),
    ).toMatchObject({ ok: true });
    writeFileSync(releaseFile, JSON.stringify({ policyRevision: hex("d") }));
    verifyIdentity.mockRejectedValue(
      new NativeIdentityRefusal("identity-drift"),
    );
    await expect(
      run(["issue", "12", "retry", "--request", REQUEST]),
    ).resolves.toMatchObject({ ok: true, noop: true });
    expect(state.archon.put).toHaveBeenCalledOnce();
    expect(verifyIdentity).toHaveBeenCalledOnce();
  });

  it.each(["hold", "stop"])(
    "keeps %s available without native identity or installed policy",
    async (action) => {
      const { run, state, releaseFile, verifyIdentity } = harness({
        "core/issues/12": workItem(),
      });
      rmSync(releaseFile);
      verifyIdentity.mockRejectedValue(
        new NativeIdentityRefusal("identity-drift"),
      );
      expect(
        await run(["issue", "12", action, "--request", REQUEST]),
      ).toMatchObject({ ok: true });
      expect(verifyIdentity).not.toHaveBeenCalled();
      expect(state.value("core/issues/12")!.assignment).toEqual(
        workItem().assignment,
      );
    },
  );
});

describe("conditional writes", () => {
  it("re-reads after a concurrent write and keeps the other writer's change", async () => {
    const { run, state } = harness({ "core/factory": factoryDoc() });
    state.interfere((value) => ({ ...(value as Dict), mergeHold: true }));
    await run(["factory", "pause-intake", "--request", REQUEST]);
    expect(state.value("core/factory")).toMatchObject({
      intake: "paused",
      mergeHold: true,
    });
  });

  it("succeeds on the fourth attempt after three concurrent writes", async () => {
    const { run, state } = harness({ "core/factory": factoryDoc() });
    const bump = (value: unknown) => value;
    state.interfere(bump, bump, bump);
    await expect(
      run(["factory", "pause-intake", "--request", REQUEST]),
    ).resolves.toMatchObject({ ok: true, revision: 5 });
  });

  it("gives up with a conflict result after four contended attempts", async () => {
    const { run, state } = harness({ "core/factory": factoryDoc() });
    const bump = (value: unknown) => value;
    state.interfere(bump, bump, bump, bump);
    await expect(
      run(["factory", "pause-intake", "--request", REQUEST]),
    ).resolves.toEqual({
      ok: false,
      code: "conflict",
      message: "The document kept changing; read it again and retry",
    });
  });

  it("reads the document exactly four times before giving up", async () => {
    const { run, state } = harness({ "core/factory": factoryDoc() });
    const bump = (value: unknown) => value;
    state.interfere(bump, bump, bump, bump, bump);
    await run(["factory", "pause-intake", "--request", REQUEST]);
    expect(state.archon.get).toHaveBeenCalledTimes(4);
  });

  it("does not retry a write failure that is not a revision conflict", async () => {
    const { run, state } = harness({ "core/factory": factoryDoc() });
    state.failPuts(new Error("state put failed (1); reconcile before retry"));
    await expect(
      run(["factory", "pause-intake", "--request", REQUEST]),
    ).rejects.toThrow("reconcile before retry");
    expect(state.archon.put).toHaveBeenCalledTimes(1);
  });
});

describe("scope", () => {
  const scopeArgs = (issues: string, extra: string[] = []) => [
    "scope",
    "--issues",
    issues,
    "--end-state",
    "MERGED",
    "--owner",
    "primary",
    "--request",
    REQUEST,
    "--by",
    "ops",
    ...extra,
  ];

  it("writes the authorized scope with sorted, de-duplicated issues", async () => {
    const { run, state } = harness();
    await run(scopeArgs("40, 12,13,12", ["--note", "phase 18"]));
    expect(state.value("core/scope")).toEqual({
      v: 1,
      issues: [12, 13, 40],
      endState: "MERGED",
      endStates: {},
      owner: "primary",
      approvedBy: "ops",
      approvedAt: NOW,
      note: "phase 18",
      priorities: {},
      requests: [{ id: REQUEST, by: "ops", at: NOW }],
    });
  });

  it("records per-issue end states that override the scope default", async () => {
    const { run, state } = harness();
    await run(scopeArgs("12,13", ["--end-states", "12=PR_READY"]));
    expect(state.value("core/scope")?.endStates).toEqual({ 12: "PR_READY" });
  });

  it("refuses a per-issue end state for an issue outside the scope", async () => {
    const { run, state } = harness();
    await expect(
      run(scopeArgs("12", ["--end-states", "99=MERGED"])),
    ).rejects.toMatchObject({ code: "invalid-end-states" });
    expect(state.value("core/scope")).toBeUndefined();
  });

  it("bounds the approving operator identity to 80 characters", async () => {
    const { run, state } = harness();
    await run([
      "scope",
      "--issues",
      "12",
      "--end-state",
      "PR_READY",
      "--owner",
      "primary",
      "--request",
      REQUEST,
      "--by",
      "b".repeat(200),
    ]);
    expect(state.value("core/scope")?.approvedBy).toBe("b".repeat(80));
  });

  it("ignores empty entries such as a trailing comma", async () => {
    const { run, state } = harness();
    await run(scopeArgs("12,13,"));
    expect(state.value("core/scope")?.issues).toEqual([12, 13]);
  });

  // I11: a re-approval keeps protected-path authorizations only for issues
  // that stay in scope; an issue leaving the scope loses its authorization.
  it("keeps protected-path authorizations for issues that stay in scope", async () => {
    const { run, state } = harness({
      "core/scope": scopeDoc({
        allowProtected: { 12: true, 13: ["package.json"] },
      }),
    });
    await run(scopeArgs("13,14"));
    expect(state.value("core/scope")?.allowProtected).toEqual({
      13: ["package.json"],
    });
  });

  it("writes no protected-path authorization when none survives", async () => {
    const { run, state } = harness({
      "core/scope": scopeDoc({ allowProtected: { 12: true } }),
    });
    await run(scopeArgs("14"));
    expect(state.value("core/scope")).not.toHaveProperty("allowProtected");
  });

  it("keeps existing priorities when the scope is replaced", async () => {
    const { run, state } = harness({
      "core/scope": scopeDoc({ priorities: { 13: 80 } }),
    });
    await run(scopeArgs("13,14"));
    expect(state.value("core/scope")?.priorities).toEqual({ 13: 80 });
  });

  it("records no note when --note is absent", async () => {
    const { run, state } = harness();
    await run(scopeArgs("12"));
    expect(state.value("core/scope")?.note).toBeNull();
  });

  it("bounds the note to 600 characters", async () => {
    const { run, state } = harness();
    await run(scopeArgs("12", ["--note", "n".repeat(900)]));
    expect(state.value("core/scope")?.note).toBe("n".repeat(600));
  });

  it("keeps only the 20 most recent request receipts", async () => {
    const earlier = Array.from({ length: 20 }, (_, index) => ({
      id: `old-req-${String(index).padStart(2, "0")}`,
      by: "ops",
      at: EARLIER,
    }));
    const { run, state } = harness({
      "core/scope": scopeDoc({ requests: earlier }),
    });
    await run(scopeArgs("12"));
    expect(
      (state.value("core/scope")?.requests as { id: string }[]).map(
        (item) => item.id,
      ),
    ).toEqual([
      ...Array.from(
        { length: 19 },
        (_, index) => `old-req-${String(index + 1).padStart(2, "0")}`,
      ),
      REQUEST,
    ]);
  });

  it("replays the same request as a no-op", async () => {
    const { run } = harness();
    await run(scopeArgs("12"));
    await expect(run(scopeArgs("12"))).resolves.toMatchObject({
      ok: true,
      noop: true,
    });
  });

  it("does not overwrite the scope when a request id is replayed with other arguments", async () => {
    const { run, state } = harness();
    await run(scopeArgs("12"));
    await run(scopeArgs("99"));
    expect({
      revision: state.revision("core/scope"),
      issues: state.value("core/scope")?.issues,
    }).toEqual({ revision: 1, issues: [12] });
  });

  it.each([
    ["missing", []],
    ["unknown", ["--end-state", "DONE"]],
  ])("refuses a %s end state", async (_label, endState) => {
    const { run } = harness();
    await expect(
      run([
        "scope",
        "--issues",
        "12",
        ...endState,
        "--owner",
        "primary",
        "--request",
        REQUEST,
      ]),
    ).rejects.toMatchObject({ code: "end-state-required" });
  });

  it("refuses an owner that the configuration does not know", async () => {
    const { run } = harness();
    await expect(
      run([
        "scope",
        "--issues",
        "12",
        "--end-state",
        "PR_READY",
        "--owner",
        "stranger",
        "--request",
        REQUEST,
      ]),
    ).rejects.toMatchObject({ code: "unknown-owner" });
  });

  it.each([
    ["missing", undefined],
    ["empty", " , "],
  ])("refuses %s issues", async (_label, issues) => {
    const { run } = harness();
    const argv = [
      "scope",
      ...(issues === undefined ? [] : ["--issues", issues]),
      "--end-state",
      "PR_READY",
      "--owner",
      "primary",
      "--request",
      REQUEST,
    ];
    await expect(run(argv)).rejects.toMatchObject({
      code: "scope-issues-required",
    });
  });

  it.each(["12,abc", "12,13.5", "12,-13", "12,0", "0,-3"])(
    "refuses the issue list %s when any entry is not a positive integer",
    async (issues) => {
      const { run } = harness();
      await expect(
        run([
          "scope",
          "--issues",
          issues,
          "--end-state",
          "PR_READY",
          "--owner",
          "primary",
          "--request",
          REQUEST,
        ]),
      ).rejects.toMatchObject({ code: "invalid-issue" });
    },
  );

  it.each([
    [
      "an invalid issue list",
      ["--issues", "12,abc", "--end-state", "PR_READY", "--owner", "primary"],
    ],
    [
      "an unknown end state",
      ["--issues", "12", "--end-state", "DONE", "--owner", "primary"],
    ],
    [
      "an unknown owner",
      ["--issues", "12", "--end-state", "PR_READY", "--owner", "stranger"],
    ],
  ])("writes nothing for %s", async (_label, args) => {
    const { run, state } = harness({ "core/scope": scopeDoc() });
    await run(["scope", ...args, "--request", REQUEST]).catch(() => null);
    expect(state.archon.put).not.toHaveBeenCalled();
  });
});

describe("prioritize", () => {
  it("records the issue priority and keeps the others", async () => {
    const { run, state } = harness({
      "core/scope": scopeDoc({ priorities: { 13: 10 } }),
    });
    await run(["prioritize", "12", "50", "--request", REQUEST, "--by", "ops"]);
    expect(state.value("core/scope")).toEqual(
      scopeDoc({
        priorities: { 12: 50, 13: 10 },
        requests: [{ id: REQUEST, by: "ops", at: NOW }],
      }),
    );
  });

  it.each(["0", "100"])(
    "accepts the boundary priority %s",
    async (priority) => {
      const { run, state } = harness({ "core/scope": scopeDoc() });
      await run(["prioritize", "12", priority, "--request", REQUEST]);
      expect(state.value("core/scope")?.priorities).toEqual({
        12: Number(priority),
      });
    },
  );

  it.each(["-1", "101", "50.5", "high"])(
    "refuses the out-of-range priority %s",
    async (priority) => {
      const { run } = harness({ "core/scope": scopeDoc() });
      await expect(
        run(["prioritize", "12", priority, "--request", REQUEST]),
      ).rejects.toMatchObject({ code: "invalid-priority" });
    },
  );

  it("refuses to prioritize when no scope exists", async () => {
    const { run } = harness();
    await expect(
      run(["prioritize", "12", "50", "--request", REQUEST]),
    ).resolves.toMatchObject({ ok: false, code: "no-scope" });
  });

  it("refuses to prioritize an issue outside the scope", async () => {
    const { run, state } = harness({ "core/scope": scopeDoc() });
    const result = await run(["prioritize", "99", "50", "--request", REQUEST]);
    expect({ result, puts: state.archon.put.mock.calls.length }).toEqual({
      result: { ok: false, code: "not-in-scope", message: "not-in-scope" },
      puts: 0,
    });
  });

  it("replays the same request without a second write", async () => {
    const { run, state } = harness({ "core/scope": scopeDoc() });
    await run(["prioritize", "12", "50", "--request", REQUEST]);
    const replay = await run(["prioritize", "12", "50", "--request", REQUEST]);
    expect({
      noop: replay.noop,
      revision: state.revision("core/scope"),
    }).toEqual({
      noop: true,
      revision: 2,
    });
  });

  it("does not let a replayed request undo a later priority", async () => {
    const { run, state } = harness({ "core/scope": scopeDoc() });
    await run(["prioritize", "12", "50", "--request", "req-first"]);
    await run(["prioritize", "12", "70", "--request", "req-second"]);
    await run(["prioritize", "12", "50", "--request", "req-first"]);
    expect(state.value("core/scope")?.priorities).toEqual({ 12: 70 });
  });
});

// I11: the operator control behind after-scope's protected-path check. It
// writes core/scope.allowProtected[<issue>] = true or a list of protected
// globs, with request identity like the other scope mutations.
describe("allow-protected (I11)", () => {
  const allow = (issue: string, what: string, extra: string[] = []) => [
    "allow-protected",
    issue,
    what,
    "--request",
    REQUEST,
    "--by",
    "ops",
    ...extra,
  ];

  it("authorizes every protected path for an in-scope issue with all", async () => {
    const { run, state } = harness({ "core/scope": scopeDoc() });
    const result = await run(allow("12", "all"));
    expect({ ok: result.ok, scope: state.value("core/scope") }).toEqual({
      ok: true,
      scope: scopeDoc({
        allowProtected: { 12: true },
        requests: [{ id: REQUEST, by: "ops", at: NOW }],
      }),
    });
  });

  it("authorizes a list of protected globs in the protected-path order", async () => {
    const { run, state } = harness({
      "core/scope": scopeDoc({ allowProtected: { 13: true } }),
    });
    await run(allow("12", "package.json, .github/**,package.json"));
    expect(state.value("core/scope")?.allowProtected).toEqual({
      12: [".github/**", "package.json"],
      13: true,
    });
  });

  it("revokes an authorization with none", async () => {
    const { run, state } = harness({
      "core/scope": scopeDoc({
        allowProtected: { 12: true, 13: ["package.json"] },
      }),
    });
    await run(allow("12", "none"));
    expect(state.value("core/scope")?.allowProtected).toEqual({
      13: ["package.json"],
    });
  });

  it.each(["src/**", "package.json/../x", "**", ""])(
    "refuses %j, which is not a protected area, without writing",
    async (what) => {
      const { run, state } = harness({ "core/scope": scopeDoc() });
      await expect(run(allow("12", what))).rejects.toMatchObject({
        code: "invalid-protected",
      });
      expect(state.archon.put).not.toHaveBeenCalled();
    },
  );

  it("refuses an invalid issue number", async () => {
    const { run } = harness({ "core/scope": scopeDoc() });
    await expect(run(allow("twelve", "all"))).rejects.toMatchObject({
      code: "invalid-issue",
    });
  });

  it("refuses an issue outside the authorized scope", async () => {
    const { run, state } = harness({ "core/scope": scopeDoc() });
    const result = await run(allow("99", "all"));
    expect({ result, puts: state.archon.put.mock.calls.length }).toEqual({
      result: { ok: false, code: "not-in-scope", message: "not-in-scope" },
      puts: 0,
    });
  });

  it("refuses when no scope exists", async () => {
    const { run } = harness();
    await expect(run(allow("12", "all"))).resolves.toMatchObject({
      ok: false,
      code: "no-scope",
    });
  });

  it("replays the same request without a second write", async () => {
    const { run, state } = harness({ "core/scope": scopeDoc() });
    await run(allow("12", "all"));
    const replay = await run(allow("12", "none"));
    expect({
      noop: replay.noop,
      revision: state.revision("core/scope"),
      allowProtected: state.value("core/scope")?.allowProtected,
    }).toEqual({ noop: true, revision: 2, allowProtected: { 12: true } });
  });
});

describe("recover-native", () => {
  const held = (overrides: Dict = {}) =>
    workItem({
      status: "active",
      route: "repair",
      run: { id: RUN_ID, startedAt: EARLIER, route: "repair", head: null },
      nativeFaults: {
        schema: "core-native-faults/v1",
        runId: RUN_ID,
        runStatus: "failed",
        action: "native-recovery",
        reason: "native-transient",
        faults: [],
        wait: null,
        automaticRetry: false,
        preserveOwnership: true,
      },
      blocker: {
        code: "native-recovery",
        detail: "native-transient",
        recovery: null,
        route: "repair",
        at: EARLIER,
      },
      ...overrides,
    });
  // The engine reports `statuses` in turn (the last one repeats) and answers
  // an abandon with `abandon`.
  function engine(
    fixture: ReturnType<typeof harness>,
    statuses: string[],
    abandon = 200,
  ) {
    const calls: string[] = [];
    fixture.fetchImpl.mockImplementation(async (url, init) => {
      if (String(url).endsWith(`/runs/${RUN_ID}/abandon`)) {
        calls.push(`${init?.method} abandon`);
        return new Response("{}", { status: abandon });
      }
      const status = statuses.length > 1 ? statuses.shift() : statuses[0];
      calls.push(`status ${status}`);
      return Response.json({ run: { id: RUN_ID, status } });
    });
    return calls;
  }
  const recover = (fixture: ReturnType<typeof harness>) =>
    fixture.run([
      "issue",
      "12",
      "recover-native",
      "--request",
      REQUEST,
      "--by",
      "ops",
      "--reason",
      "provider outage is over",
    ]);

  it("ends the failed run through the engine, then clears the hold and leaves the issue waiting", async () => {
    const fixture = harness({ "core/issues/12": held() });
    const calls = engine(fixture, ["failed", "cancelled"]);

    const result = await recover(fixture);

    const value = fixture.state.value("core/issues/12") as Dict;
    expect({
      ok: result.ok,
      calls,
      containers: fixture.removeContainers.mock.calls.map(
        ([input]) => input.labels,
      ),
      held: Object.hasOwn(value, "nativeFaults"),
      status: value.status,
      route: value.route,
      run: value.run,
      request: (value.requests as Dict[]).at(-1),
    }).toEqual({
      ok: true,
      calls: ["status failed", "POST abandon", "status cancelled"],
      containers: [{ "core.archon.run": RUN_ID }],
      held: false,
      status: "waiting",
      route: "repair",
      run: null,
      request: { id: REQUEST, action: "recover-native", by: "ops", at: NOW },
    });
  });

  it("changes nothing, not even the run, when the remote readback does not match the record", async () => {
    const fixture = harness({ "core/issues/12": held() });
    const calls = engine(fixture, ["failed"]);
    fixture.readEffects.mockResolvedValue({
      ok: false,
      detail: "The remote branch factory/12 is at 0123456789ab",
    });

    const result = await recover(fixture);

    expect({
      ok: result.ok,
      code: result.code,
      calls,
      containers: fixture.removeContainers.mock.calls.length,
      held: Object.hasOwn(
        fixture.state.value("core/issues/12") as Dict,
        "nativeFaults",
      ),
    }).toEqual({
      ok: false,
      code: "effects-unreconciled",
      calls: [],
      containers: 0,
      held: true,
    });
  });

  it("keeps the hold when the engine does not end the run", async () => {
    const fixture = harness({ "core/issues/12": held() });
    const calls = engine(fixture, ["failed"], 409);

    const result = await recover(fixture);

    expect({
      code: result.code,
      calls,
      held: Object.hasOwn(
        fixture.state.value("core/issues/12") as Dict,
        "nativeFaults",
      ),
    }).toEqual({
      code: "run-not-ended",
      calls: ["status failed", "POST abandon"],
      held: true,
    });
  });

  it("never ends a run that still executes, or one whose containers are not confirmed gone", async () => {
    const running = harness({ "core/issues/12": held() });
    const runningCalls = engine(running, ["running"]);
    const stuck = harness({ "core/issues/12": held() });
    const stuckCalls = engine(stuck, ["failed"]);
    stuck.removeContainers.mockResolvedValue({
      ok: false,
      found: ["c1"],
      remaining: ["c1"],
    });

    expect([
      (await recover(running)).code,
      runningCalls,
      (await recover(stuck)).code,
      stuckCalls,
    ]).toEqual([
      "run-not-terminal",
      ["status running"],
      "containers-unconfirmed",
      ["status failed"],
    ]);
  });

  // The engine keeps a lease live until its holder is completed or cancelled
  // (upstream isStateLeaseHolderLive), so a held run that is failed or paused
  // still holds the work item's lease. Seen live on 13 November 2026: two
  // rounds hit the weekly usage limit, `record` wrote the hold and the engine
  // then paused each run until the reported reset.
  const ownLease = {
    leases: {
      "core/issues/12": {
        runId: RUN_ID,
        nodePath: "claim",
        takenAt: EARLIER,
        live: true,
      },
    },
  };

  it.each([
    ["failed", "a run that failed"],
    ["paused", "a run the engine paused until the provider's reset"],
  ])("ends %s run that still holds the issue's lease (%s)", async (status) => {
    const fixture = harness({ "core/issues/12": held() }, ownLease);
    const calls = engine(fixture, [status, "cancelled"]);

    const result = await recover(fixture);

    const value = fixture.state.value("core/issues/12") as Dict;
    expect({
      ok: result.ok,
      code: result.code,
      calls,
      containers: fixture.removeContainers.mock.calls.map(
        ([input]) => input.labels,
      ),
      held: Object.hasOwn(value, "nativeFaults"),
      status: value.status,
      run: value.run,
    }).toEqual({
      ok: true,
      code: undefined,
      calls: [`status ${status}`, "POST abandon", "status cancelled"],
      containers: [{ "core.archon.run": RUN_ID }],
      held: false,
      status: "waiting",
      run: null,
    });
  });

  // What the engine does at a reported reset: it wakes the paused run itself
  // and the run finishes its round. `record` keeps the hold, so this command
  // (run by the next pass) is what settles the item, and it ends nothing.
  it("settles a held run the engine resumed and completed by itself, without ending anything", async () => {
    const fixture = harness(
      { "core/issues/12": held() },
      {
        leases: {
          "core/issues/12": {
            runId: RUN_ID,
            nodePath: "claim",
            takenAt: EARLIER,
            live: false,
          },
        },
      },
    );
    const calls = engine(fixture, ["completed"]);

    const result = await recover(fixture);

    const value = fixture.state.value("core/issues/12") as Dict;
    expect({
      ok: result.ok,
      calls,
      containers: fixture.removeContainers.mock.calls.length,
      held: Object.hasOwn(value, "nativeFaults"),
      status: value.status,
      route: value.route,
    }).toEqual({
      ok: true,
      calls: ["status completed"],
      containers: 0,
      held: false,
      status: "waiting",
      route: "repair",
    });
  });

  it("never ends a run that still executes and holds the lease", async () => {
    const fixture = harness({ "core/issues/12": held() }, ownLease);
    const calls = engine(fixture, ["running"]);

    const result = await recover(fixture);

    expect({
      code: result.code,
      calls,
      held: Object.hasOwn(
        fixture.state.value("core/issues/12") as Dict,
        "nativeFaults",
      ),
    }).toEqual({
      code: "run-not-terminal",
      calls: ["status running"],
      held: true,
    });
  });

  it("refuses, and ends nothing, while another run holds the issue's lease", async () => {
    const fixture = harness(
      { "core/issues/12": held() },
      {
        leases: {
          "core/issues/12": {
            runId: "9b2d5b1e-0000-4000-8000-000000000001",
            nodePath: "claim",
            takenAt: EARLIER,
            live: true,
          },
        },
      },
    );
    const calls = engine(fixture, ["failed", "cancelled"]);

    const result = await recover(fixture);

    expect({ code: result.code, calls }).toEqual({
      code: "lease-live",
      calls: [],
    });
  });

  it("refuses an issue that has no native hold", async () => {
    const fixture = harness({ "core/issues/12": workItem() });
    engine(fixture, ["cancelled"]);
    expect((await recover(fixture)).code).toBe("no-native-hold");
  });
});

describe("nativeEffects", () => {
  const HEAD = "a".repeat(40);
  const OTHER = "b".repeat(40);
  const read = (value: Dict, remote: string | null | Error) =>
    nativeEffects({
      config: {},
      value,
      readRemoteHead: async () => {
        if (remote instanceof Error) throw remote;
        return remote;
      },
    });

  it("accepts a remote branch that is absent or at a commit the work item recorded", async () => {
    expect([
      await read({ branch: "factory/12", head: HEAD }, null),
      await read({ branch: "factory/12", head: HEAD }, HEAD),
      await read(
        { branch: "factory/12", head: OTHER, pr: { number: 7, head: HEAD } },
        HEAD,
      ),
      await read({ branch: null }, OTHER),
    ]).toEqual([
      { ok: true, remoteHead: null },
      { ok: true, remoteHead: HEAD },
      { ok: true, remoteHead: HEAD },
      { ok: true, remoteHead: null },
    ]);
  });

  it("refuses a remote commit the work item never recorded, an unread remote and a pending merge request", async () => {
    const results = [
      await read({ branch: "factory/12", head: HEAD }, OTHER),
      await read({ branch: "factory/12", head: HEAD }, new Error("offline")),
      await read(
        {
          branch: "factory/12",
          head: HEAD,
          pr: { number: 7, head: HEAD, mergeRequest: { status: "requested" } },
        },
        HEAD,
      ),
    ];
    expect(results.map((result) => [result.ok, result.detail])).toEqual([
      [
        false,
        "The remote branch factory/12 is at bbbbbbbbbbbb, a commit the work item never recorded",
      ],
      [false, "The remote branch could not be read: offline"],
      [
        false,
        "A merge the factory requested is unconfirmed; read the pull request and settle it first",
      ],
    ]);
    // Only a head that was read and is not recorded is named: the control may
    // then send the issue to the feedback route instead of refusing for good.
    expect(results.map((result) => result.unrecorded)).toEqual([
      OTHER,
      undefined,
      undefined,
    ]);
  });
});

describe("cancel-run", () => {
  function server(
    cancel: Response,
    observed: Response = Response.json({ run: { status: "cancelled" } }),
  ) {
    return (url: string) => (url.endsWith("/cancel") ? cancel : observed);
  }

  it("asks the server API to cancel the run", async () => {
    const { run, fetchImpl } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(Response.json({ success: true, message: "ok" }))(url),
    );
    await run(["cancel-run", RUN_ID, "--request", REQUEST]);
    expect(fetchImpl.mock.calls[0]).toEqual([
      `http://127.0.0.1:${PORT}/api/workflows/runs/${RUN_ID}/cancel`,
      { method: "POST" },
    ]);
  });

  it("reads the run back from the server API after cancelling", async () => {
    const { run, fetchImpl } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(Response.json({ success: true, message: "ok" }))(url),
    );
    await run(["cancel-run", RUN_ID, "--request", REQUEST]);
    expect(fetchImpl.mock.calls[1]).toEqual([
      `http://127.0.0.1:${PORT}/api/workflows/runs/${RUN_ID}`,
    ]);
  });

  // I5: an acknowledged cancel is not ok until the run is terminal.
  it("reports the status observed after the cancel, not an assumed cancellation", async () => {
    const { run, fetchImpl } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(
        Response.json({ success: true, message: "Cancellation requested" }),
        Response.json({ run: { status: "running" } }),
      )(url),
    );
    await expect(
      run(["cancel-run", RUN_ID, "--request", REQUEST]),
    ).resolves.toEqual({
      ok: false,
      status: 200,
      detail: '{"success":true,"message":"Cancellation requested"}',
      observed: "running",
      containers: { ok: true, found: [], remaining: [], removed: [] },
    });
  });

  it("reports a refused cancel with the server's status and the observed run", async () => {
    const { run, fetchImpl } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(
        new Response("Run is not running", { status: 409 }),
        Response.json({ run: { status: "completed" } }),
      )(url),
    );
    await expect(
      run(["cancel-run", RUN_ID, "--request", REQUEST]),
    ).resolves.toEqual({
      ok: false,
      status: 409,
      detail: "Run is not running",
      observed: "completed",
      containers: { ok: true, found: [], remaining: [], removed: [] },
    });
  });

  it("reports no observed status when the follow-up read is unreadable", async () => {
    const { run, fetchImpl } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(
        Response.json({ success: true, message: "ok" }),
        new Response("<html>bad gateway</html>", { status: 502 }),
      )(url),
    );
    await expect(
      run(["cancel-run", RUN_ID, "--request", REQUEST]),
    ).resolves.toMatchObject({ observed: null });
  });

  it("bounds the reported server detail to 600 characters", async () => {
    const { run, fetchImpl } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(new Response("e".repeat(2000), { status: 500 }))(url),
    );
    const result = await run(["cancel-run", RUN_ID, "--request", REQUEST]);
    expect(result.detail).toBe("e".repeat(600));
  });

  it.each(["cancel", "cancel-body", "status", "status-body"])(
    "reconciles labelled containers after a %s transport failure",
    async (operation) => {
      const { run, fetchImpl, removeContainers, state } = harness({
        "core/issues/12": workItem({
          status: "active",
          run: { id: RUN_ID, route: "repair" },
        }),
      });
      const failure = new Error(`${operation} connection reset`);
      fetchImpl.mockImplementation(async (url) => {
        if (url.endsWith("/cancel")) {
          if (operation === "cancel") throw failure;
          const response = Response.json({ success: true });
          if (operation === "cancel-body")
            response.text = async () => {
              throw failure;
            };
          return response;
        }
        if (operation === "status") throw failure;
        const response = Response.json({ run: { status: "cancelled" } });
        if (operation === "status-body")
          response.json = async () => {
            throw failure;
          };
        return response;
      });
      removeContainers.mockResolvedValue({
        ok: true,
        found: ["owned-container"],
        remaining: [],
      });

      await expect(
        run(["cancel-run", RUN_ID, "--request", REQUEST]),
      ).resolves.toMatchObject({
        ok: false,
        observed: operation.startsWith("status") ? null : "cancelled",
        errors: [{ operation, detail: failure.message }],
        containers: {
          ok: true,
          found: ["owned-container"],
          remaining: [],
          removed: ["owned-container"],
        },
        held: { issue: 12, ok: true },
      });
      expect(state.value("core/issues/12")?.control).toBe("hold");
      expect(fetchImpl).toHaveBeenCalledTimes(2);
      expect(removeContainers).toHaveBeenCalledExactlyOnceWith({
        dockerExecutable: "/usr/bin/docker",
        labels: { "core.archon.run": RUN_ID },
      });
    },
  );

  const C1 = "c".repeat(64);
  const C2 = "d".repeat(64);

  // I5 / boundary #4: the shared, tested reconcile in executor.mjs lists the
  // run's labelled containers, force-removes them and lists again.
  it("removes the run's labelled containers through the executor reconcile after the engine cancel", async () => {
    const { run, fetchImpl, removeContainers } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(Response.json({ success: true }))(url),
    );
    removeContainers.mockResolvedValue({
      ok: true,
      found: [C1, C2],
      remaining: [],
    });
    const result = await run(["cancel-run", RUN_ID, "--request", REQUEST]);
    expect({
      ok: result.ok,
      containers: result.containers,
      calls: removeContainers.mock.calls,
      afterCancel:
        fetchImpl.mock.invocationCallOrder[0] <
        removeContainers.mock.invocationCallOrder[0],
    }).toEqual({
      ok: true,
      containers: {
        ok: true,
        found: [C1, C2],
        remaining: [],
        removed: [C1, C2],
      },
      calls: [
        [
          {
            dockerExecutable: "/usr/bin/docker",
            labels: { "core.archon.run": RUN_ID },
          },
        ],
      ],
      afterCancel: true,
    });
  });

  // The Console's receipt names how many containers were removed: the ones
  // found that the second listing no longer shows.
  it("reports the containers left behind and the ones removed, and is not ok", async () => {
    const { run, fetchImpl, removeContainers } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(Response.json({ success: true }))(url),
    );
    removeContainers.mockResolvedValue({
      ok: false,
      found: [C1, C2],
      remaining: [C1],
    });
    await expect(
      run(["cancel-run", RUN_ID, "--request", REQUEST]),
    ).resolves.toMatchObject({
      ok: false,
      observed: "cancelled",
      containers: {
        ok: false,
        found: [C1, C2],
        remaining: [C1],
        removed: [C2],
      },
    });
  });

  it("is not ok when the reconcile reports success but the run is still running", async () => {
    const { run, fetchImpl, removeContainers } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(
        Response.json({ success: true }),
        Response.json({ run: { status: "running" } }),
      )(url),
    );
    removeContainers.mockResolvedValue({
      ok: true,
      found: [C1],
      remaining: [],
    });
    await expect(
      run(["cancel-run", RUN_ID, "--request", REQUEST]),
    ).resolves.toMatchObject({
      ok: false,
      observed: "running",
    });
  });

  // S8.31 / S8.38: a cancelled round is not requeued automatically. The
  // issue is held first, so reconciling its ended run leaves it waiting
  // under the hold until an operator releases it.
  it("holds the issue whose round the run is before asking the engine to cancel", async () => {
    const { run, state, fetchImpl } = harness({
      "core/issues/12": workItem({
        status: "active",
        run: { id: RUN_ID, startedAt: EARLIER, route: "repair", head: null },
      }),
      "core/issues/13": workItem({ issue: 13 }),
    });
    fetchImpl.mockImplementation(async (url) =>
      server(Response.json({ success: true }))(url),
    );
    const result = await run([
      "cancel-run",
      RUN_ID,
      "--request",
      REQUEST,
      "--by",
      "ops",
    ]);
    expect({
      held: result.held,
      item: state.value("core/issues/12"),
      other: state.value("core/issues/13")?.control,
      holdBeforeCancel:
        state.archon.put.mock.invocationCallOrder[0] <
        fetchImpl.mock.invocationCallOrder[0],
    }).toMatchObject({
      held: { issue: 12, ok: true },
      item: {
        control: "hold",
        status: "active",
        controlReason: `Run ${RUN_ID} cancelled by ops`,
        requests: [{ id: REQUEST, action: "hold", by: "ops", at: NOW }],
      },
      other: "run",
      holdBeforeCancel: true,
    });
  });

  it("does not cancel or remove containers when the issue hold could not be saved", async () => {
    const { run, state, fetchImpl, removeContainers } = harness({
      "core/issues/12": workItem({
        status: "active",
        run: { id: RUN_ID, startedAt: EARLIER, route: "repair", head: null },
      }),
    });
    state.interfere(
      ...Array.from({ length: 4 }, () => (value: unknown) => value),
    );
    fetchImpl.mockImplementation(async (url) =>
      server(Response.json({ success: true }))(url),
    );

    await expect(
      run(["cancel-run", RUN_ID, "--request", REQUEST]),
    ).resolves.toMatchObject({
      ok: false,
      code: "conflict",
      held: { issue: 12, ok: false, code: "conflict" },
    });
    expect(state.value("core/issues/12")?.control).toBe("run");
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(removeContainers).not.toHaveBeenCalled();
  });

  it("does not reuse an old cancellation hold after the operator released the issue", async () => {
    const { run, fetchImpl, removeContainers } = harness({
      "core/issues/12": workItem({
        status: "active",
        run: { id: RUN_ID, startedAt: EARLIER, route: "repair", head: null },
        requests: [{ id: REQUEST, action: "hold", by: "ops", at: EARLIER }],
      }),
    });
    fetchImpl.mockImplementation(async (url) =>
      server(Response.json({ success: true }))(url),
    );

    await expect(
      run(["cancel-run", RUN_ID, "--request", REQUEST]),
    ).resolves.toMatchObject({
      ok: false,
      code: "not-held",
      held: { issue: 12, ok: false, code: "not-held" },
    });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(removeContainers).not.toHaveBeenCalled();
  });

  it("is not ok when the containers cannot be listed", async () => {
    const { run, fetchImpl, removeContainers } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(Response.json({ success: true }))(url),
    );
    removeContainers.mockResolvedValue({
      ok: false,
      found: [],
      remaining: null,
      error: "Container listing unavailable",
    });
    await expect(
      run(["cancel-run", RUN_ID, "--request", REQUEST]),
    ).resolves.toMatchObject({
      ok: false,
      containers: {
        ok: false,
        remaining: null,
        removed: [],
        error: "Container listing unavailable",
      },
    });
  });

  it("reports a reconcile that throws as not ok instead of failing the command", async () => {
    const { run, fetchImpl, removeContainers } = harness();
    fetchImpl.mockImplementation(async (url) =>
      server(Response.json({ success: true }))(url),
    );
    removeContainers.mockRejectedValue(
      new Error("Container labels must name a factory run, issue or attempt"),
    );
    await expect(
      run(["cancel-run", RUN_ID, "--request", REQUEST]),
    ).resolves.toMatchObject({
      ok: false,
      observed: "cancelled",
      containers: {
        ok: false,
        found: [],
        remaining: null,
        removed: [],
        error: "Container labels must name a factory run, issue or attempt",
      },
    });
  });

  it.each(["not-a-run", RUN_ID.toUpperCase(), `${RUN_ID}/../x`])(
    "refuses the run id %s without calling the server",
    async (runId) => {
      const { run, fetchImpl } = harness();
      await expect(
        run(["cancel-run", runId, "--request", REQUEST]),
      ).rejects.toMatchObject({ code: "invalid-run" });
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );
});

type Delivery = {
  url: string;
  method: string | undefined;
  headers: Record<string, string>;
  rawBody: string;
  body: Dict;
};

function deliveries(fetchImpl: ReturnType<typeof harness>["fetchImpl"]) {
  return fetchImpl.mock.calls.map(([url, init]): Delivery => ({
    url,
    method: init?.method,
    headers: init?.headers as Record<string, string>,
    rawBody: String(init?.body),
    body: JSON.parse(String(init?.body)),
  }));
}

function accepting(receipt: Dict = { receiptId: "rcpt-0001" }) {
  const context = harness();
  context.fetchImpl.mockImplementation(async () => Response.json(receipt));
  return context;
}

describe("ask", () => {
  const askArgs = (question = "Why is issue 12 waiting?") => [
    "ask",
    "--conversation",
    "conv-0001",
    "--question",
    question,
    "--request",
    REQUEST,
  ];

  it("delivers the turn to the answer workflow's webhook source", async () => {
    const { run, fetchImpl } = accepting();
    await run(askArgs());
    expect(
      deliveries(fetchImpl).map(({ url, method }) => [url, method]),
    ).toEqual([
      [`http://127.0.0.1:${PORT}/webhooks/sources/core-factory-answer`, "POST"],
    ]);
  });

  it("keys a replayed turn by the same request-derived delivery id", async () => {
    const { run, fetchImpl } = accepting();
    await run(askArgs());
    await run(askArgs());
    expect(
      deliveries(fetchImpl).map(({ headers }) => headers["webhook-id"]),
    ).toEqual([`ask:${REQUEST}`, `ask:${REQUEST}`]);
  });

  it("sends the question, conversation and request as the delivery body", async () => {
    const { run, fetchImpl } = accepting();
    await run(askArgs());
    expect(deliveries(fetchImpl)[0].body).toEqual({
      question: "Why is issue 12 waiting?",
      conversation: "conv-0001",
      request: REQUEST,
    });
  });

  it("signs the delivery with the factory's configured secret", async () => {
    const { run, fetchImpl } = accepting();
    await run(askArgs());
    const [{ headers, rawBody }] = deliveries(fetchImpl);
    const expected = `v1,${createHmac("sha256", SIGNING_KEY)
      .update(
        `${headers["webhook-id"]}.${headers["webhook-timestamp"]}.${rawBody}`,
      )
      .digest("base64")}`;
    expect(headers["webhook-signature"]).toBe(expected);
  });

  it("reports the receipt the server committed", async () => {
    const { run } = accepting();
    await expect(run(askArgs())).resolves.toEqual({
      ok: true,
      outcome: "accepted",
      status: 200,
      receipt: "rcpt-0001",
      detail: null,
    });
  });

  it("reports a refused delivery with the server's status and detail", async () => {
    const { run, fetchImpl } = harness();
    fetchImpl.mockImplementation(
      async () =>
        new Response("delivery id reused with a different body", {
          status: 409,
        }),
    );
    await expect(run(askArgs())).resolves.toEqual({
      ok: false,
      outcome: "conflict",
      status: 409,
      receipt: null,
      detail: "delivery id reused with a different body",
    });
  });

  it("reports an unknown outcome when the server cannot be reached", async () => {
    const { run, fetchImpl } = harness();
    fetchImpl.mockImplementation(async () => {
      throw new Error("connect ECONNREFUSED 127.0.0.1:3190");
    });
    await expect(run(askArgs())).resolves.toEqual({
      ok: false,
      outcome: "unknown",
      status: null,
      receipt: null,
      detail: "connect ECONNREFUSED 127.0.0.1:3190",
    });
  });

  it("bounds the question to 2000 characters", async () => {
    const { run, fetchImpl } = accepting();
    await run(askArgs("q".repeat(5000)));
    expect(deliveries(fetchImpl)[0].body.question).toBe("q".repeat(2000));
  });

  it.each([
    ["a blank question", ["--conversation", "conv-0001", "--question", "   "]],
    ["a missing question", ["--conversation", "conv-0001"]],
    [
      "a short conversation id",
      ["--conversation", "conv", "--question", "Why?"],
    ],
    [
      "an uppercase conversation id",
      ["--conversation", "CONV-0001", "--question", "Why?"],
    ],
    ["a missing conversation id", ["--question", "Why?"]],
  ])("refuses %s", async (_label, args) => {
    const { run } = accepting();
    await expect(
      run(["ask", ...args, "--request", REQUEST]),
    ).rejects.toMatchObject({ code: "invalid-question" });
  });

  it("neither writes inputs nor delivers for a refused question", async () => {
    const { run, fetchImpl, root } = accepting();
    await run([
      "ask",
      "--conversation",
      "conv",
      "--question",
      "Why?",
      "--request",
      REQUEST,
    ]).catch(() => null);
    expect({
      deliveries: fetchImpl.mock.calls.length,
      inputs: existsSync(`${root}/runs/operator-requests`),
    }).toEqual({ deliveries: 0, inputs: false });
  });
});

describe("analyze", () => {
  it("delivers to the analyze workflow's webhook source keyed by the request", async () => {
    const { run, fetchImpl } = accepting();
    await run(["analyze", "--scope", "issue:12", "--request", REQUEST]);
    expect(
      deliveries(fetchImpl).map(({ url, headers }) => [
        url,
        headers["webhook-id"],
      ]),
    ).toEqual([
      [
        `http://127.0.0.1:${PORT}/webhooks/sources/core-factory-analyze`,
        `analyze:${REQUEST}`,
      ],
    ]);
  });

  it("sends the requested scope and trigger as the delivery body", async () => {
    const { run, fetchImpl } = accepting();
    await run([
      "analyze",
      "--scope",
      "issue:12",
      "--trigger",
      "incident",
      "--request",
      REQUEST,
    ]);
    expect(deliveries(fetchImpl)[0].body).toEqual({
      scope: "issue:12",
      trigger: "incident",
      request: REQUEST,
    });
  });

  it("defaults to an operator analysis of the whole factory", async () => {
    const { run, fetchImpl } = accepting();
    await run(["analyze", "--request", REQUEST]);
    expect(deliveries(fetchImpl)[0].body).toEqual({
      scope: "factory",
      trigger: "operator",
      request: REQUEST,
    });
  });

  it("reports the receipt id when the server names it id", async () => {
    const { run } = accepting({ id: "rcpt-0009" });
    await expect(run(["analyze", "--request", REQUEST])).resolves.toMatchObject(
      { ok: true, receipt: "rcpt-0009" },
    );
  });
});

describe("status", () => {
  it("returns the factory, scope and per-issue summaries", async () => {
    const lease = { runId: RUN_ID, live: true };
    const { run } = harness(
      {
        "core/factory": factoryDoc(),
        "core/scope": scopeDoc(),
        "core/issues/12": workItem({
          status: "active",
          round: 3,
          route: "feedback",
          pr: { number: 501, url: "https://example.invalid/pull/501" },
        }),
        "core/issues/12/feedback": { v: 1, dispositions: {} },
        "core/issues/13": workItem({
          issue: 13,
          status: "BLOCKED",
          route: null,
          blocker: {
            code: "no-progress",
            detail: "stuck",
            recovery: null,
            at: EARLIER,
          },
        }),
      },
      { leases: { "core/issues/12": lease } },
    );
    await expect(run(["status"])).resolves.toEqual({
      ok: true,
      factory: factoryDoc(),
      scope: scopeDoc(),
      issues: [
        {
          issue: 12,
          status: "active",
          control: "run",
          round: 3,
          route: "feedback",
          pr: "https://example.invalid/pull/501",
          blocker: null,
          lease,
        },
        {
          issue: 13,
          status: "BLOCKED",
          control: "run",
          round: 2,
          route: null,
          pr: null,
          blocker: {
            code: "no-progress",
            detail: "stuck",
            recovery: null,
            at: EARLIER,
          },
          lease: null,
        },
      ],
    });
  });

  it("reports absent documents as empty on a fresh install", async () => {
    const { run } = harness();
    await expect(run(["status"])).resolves.toEqual({
      ok: true,
      factory: null,
      scope: null,
      issues: [],
    });
  });

  it("does not need a request id and writes nothing", async () => {
    const { run, state } = harness(fullSeed());
    await run(["status"]);
    expect(state.archon.put).not.toHaveBeenCalled();
  });
});

it("refuses an unknown command", async () => {
  const { run } = harness();
  await expect(run(["explode", "--request", REQUEST])).rejects.toMatchObject({
    code: "unknown-command",
  });
});
