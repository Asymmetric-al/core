import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  archonHomeConfig,
  buildFactoryConfig,
  controlFiles,
  nativeClaudeLauncher,
  policySwitch,
  settingsDigest,
} from "../../../scripts/archon-factory/installation/install-logic.mjs";
import { validateConfig } from "../../../scripts/archon-factory/pack/.shared/config.mjs";
import {
  bindRunIdentity,
  ensureInitialRunIdentity,
  launchNativeClaude,
  planNativeClaude,
  readRunIdentity,
  verifyNativeIdentity,
} from "../../../scripts/archon-factory/pack/.shared/identity.mjs";
import { fireRound } from "../../../scripts/archon-factory/pack/.shared/webhook.mjs";

const secret = `whsec_${Buffer.alloc(32, 7).toString("base64")}`;
const config = {
  root: "/srv/core-factory",
  archon: {
    port: 3190,
    serviceHome: "/home/admin",
    home: "/srv/core-factory/archon",
    executable: "/opt/archon/archon",
  },
  nativeIdentity: {
    owner: "conrad",
    profile: "/home/admin/.claude",
    provider: "claude",
  },
  owners: {
    conrad: { profile: "/home/admin/.claude", githubLogin: "example" },
    other: { profile: "/home/admin/.claude-other", githubLogin: "other" },
  },
};

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const syntheticAuth = () => ({
  loggedIn: true,
  authMethod: "claude.ai",
  apiProvider: "firstParty",
  subscriptionType: "team",
  configDirectory: config.nativeIdentity.profile,
  email: "fixture@example.invalid",
  orgId: "fixture-organization",
  orgName: "Fixture Team",
});

const temporaryRoots: string[] = [];
afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function runFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "archon-native-binding-"));
  temporaryRoots.push(root);
  const localConfig = { ...config, root: root.replaceAll("\\", "/") };
  const runId = "run-identity-001";
  const binding = { ...config.nativeIdentity, profileDigest: "a".repeat(64) };
  const execution = {
    runId,
    path: "facts",
    invocation: { id: "inv-1", loopPath: [] },
    attempt: { id: "attempt-1" },
  };
  const env = {
    WORKFLOW_ID: runId,
    ARCHON_NODE_EXECUTION: JSON.stringify(execution),
  };
  const metadata = {
    run: {
      id: runId,
      workflow_name: "core-select",
      parent_run_id: null,
      adopted_from_run_id: null,
      status: "running",
    },
    events: [
      { workflow_run_id: runId, event_type: "workflow_started", data: {} },
      {
        workflow_run_id: runId,
        step_name: "facts",
        event_type: "node_started",
        data: execution,
      },
    ],
  };
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify(metadata)));
  const verifyIdentity = vi.fn(async () => binding);
  return {
    config: localConfig,
    runId,
    binding,
    execution,
    env,
    metadata,
    fetchImpl,
    verifyIdentity,
  };
}

describe("immutable native run bindings", () => {
  it("creates only a digest binding and accepts exact idempotent inheritance", () => {
    const fixture = runFixture();
    const bound = bindRunIdentity(fixture);
    expect(bound).toEqual({ v: 1, runId: fixture.runId, ...fixture.binding });
    expect(bindRunIdentity(fixture)).toEqual(bound);
    expect(readRunIdentity(fixture)).toEqual(bound);
    expect(
      readFileSync(
        path.join(
          fixture.config.root,
          "runs",
          fixture.runId,
          "native-identity.json",
        ),
        "utf8",
      ),
    ).not.toMatch(/email|orgId|token|accountDigest/);
  });

  it("refuses to overwrite an inherited or resumed digest", () => {
    const fixture = runFixture();
    bindRunIdentity(fixture);
    expect(() =>
      bindRunIdentity({
        ...fixture,
        binding: { ...fixture.binding, profileDigest: "b".repeat(64) },
      }),
    ).toThrow(/^identity-run-binding-drift$/);
    expect(readRunIdentity(fixture).profileDigest).toBe(
      fixture.binding.profileDigest,
    );
  });

  it.each(["../escape", "short", "run/identity-001", "run-identity-001\n"])(
    "refuses unsafe run id %j",
    (runId) => {
      expect(() => bindRunIdentity({ ...runFixture(), runId })).toThrow(
        /^identity-run-invalid$/,
      );
    },
  );

  it("refuses missing or corrupt bindings rather than inventing identity", () => {
    const fixture = runFixture();
    expect(() => readRunIdentity(fixture)).toThrow(
      /^identity-run-binding-missing$/,
    );
    bindRunIdentity(fixture);
    writeFileSync(
      path.join(
        fixture.config.root,
        "runs",
        fixture.runId,
        "native-identity.json",
      ),
      '{"private":"credential-fixture"}',
    );
    expect(() => readRunIdentity(fixture)).toThrow(
      /^identity-run-binding-invalid$/,
    );
  });
});

describe("first-entry binding", () => {
  it("binds an authoritative genuinely initial root before its first AI node", async () => {
    const fixture = runFixture();
    expect(await ensureInitialRunIdentity(fixture)).toEqual({
      v: 1,
      runId: fixture.runId,
      ...fixture.binding,
    });
    expect(fixture.fetchImpl).toHaveBeenCalledWith(
      `http://127.0.0.1:3190/api/workflows/runs/${fixture.runId}`,
      expect.objectContaining({ redirect: "error" }),
    );
    expect(fixture.verifyIdentity).toHaveBeenCalledOnce();
  });

  it("checks an existing binding without consulting ambient initial-run metadata", async () => {
    const fixture = runFixture();
    bindRunIdentity(fixture);
    await ensureInitialRunIdentity(fixture);
    expect(fixture.fetchImpl).not.toHaveBeenCalled();
    expect(fixture.verifyIdentity).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: fixture.binding.owner,
        expectedDigest: fixture.binding.profileDigest,
      }),
    );
  });

  it.each([
    { parent_run_id: "parent-identity-001" },
    { parent_run_id: undefined },
    { adopted_from_run_id: "prior-identity-001" },
    { status: "paused" },
    { workflow_name: "core-deliver" },
  ])("does not ambient-bind a non-initial root: %j", async (changed) => {
    const fixture = runFixture();
    Object.assign(fixture.metadata.run, changed);
    await expect(ensureInitialRunIdentity(fixture)).rejects.toThrow(
      /^identity-initial-run-required$/,
    );
    expect(fixture.verifyIdentity).not.toHaveBeenCalled();
    expect(() => readRunIdentity(fixture)).toThrow(
      /^identity-run-binding-missing$/,
    );
  });

  it.each([
    "workflow_resumed",
    "workflow_unpaused",
    "quota_resume_triggered",
    "node_completed",
    "node_skipped_prior_success",
  ])("does not bind after %s", async (event_type) => {
    const fixture = runFixture();
    fixture.metadata.events.push({
      workflow_run_id: fixture.runId,
      event_type,
      data: {},
    });
    await expect(ensureInitialRunIdentity(fixture)).rejects.toThrow(
      /^identity-initial-run-required$/,
    );
  });

  // Observed on the pinned engine (run 9a89bece, 12 November 2026): its native
  // credential preflight launches Claude before any node, the launcher refuses
  // that unbound launch, and the engine records the undecided check first.
  it("binds a genuinely initial root whose engine credential preflight was inconclusive", async () => {
    const fixture = runFixture();
    fixture.metadata.events.unshift({
      workflow_run_id: fixture.runId,
      event_type: "credential_check_inconclusive",
      data: { provider: "claude", source: "native" },
    });
    expect(await ensureInitialRunIdentity(fixture)).toMatchObject({
      runId: fixture.runId,
      profileDigest: fixture.binding.profileDigest,
    });
    expect(fixture.verifyIdentity).toHaveBeenCalledOnce();
  });

  it.each([
    ["an unknown engine event", { event_type: "state_written" }],
    [
      "a second start of the same node",
      { event_type: "node_started", step_name: "facts" },
    ],
    ["a second workflow start", { event_type: "workflow_started" }],
    [
      "a preflight event from another run",
      {
        event_type: "credential_check_inconclusive",
        workflow_run_id: "other-identity-001",
      },
    ],
  ])("does not bind after %s", async (_label, extra) => {
    const fixture = runFixture();
    fixture.metadata.events.push({
      workflow_run_id: fixture.runId,
      data: fixture.execution,
      ...extra,
    });
    await expect(ensureInitialRunIdentity(fixture)).rejects.toThrow(
      /^identity-initial-run-required$/,
    );
    expect(fixture.verifyIdentity).not.toHaveBeenCalled();
  });

  it("refuses a different node attempt, unavailable metadata and mismatched execution IDs", async () => {
    const fixture = runFixture();
    fixture.execution.attempt.id = "attempt-2";
    await expect(ensureInitialRunIdentity(fixture)).rejects.toThrow(
      /^identity-initial-run-required$/,
    );
    fixture.fetchImpl.mockRejectedValue(new Error("private-response-fixture"));
    await expect(ensureInitialRunIdentity(fixture)).rejects.toThrow(
      /^identity-run-metadata-unavailable$/,
    );
    await expect(
      ensureInitialRunIdentity({
        ...fixture,
        env: { ...fixture.env, WORKFLOW_ID: "other-identity-001" },
      }),
    ).rejects.toThrow(/^identity-run-execution-mismatch$/);
  });
});

function launchFixture() {
  const fixture = runFixture();
  bindRunIdentity(fixture);
  return {
    ...fixture,
    args: [
      "--print",
      "--input-format",
      "stream-json",
      "--output-format",
      "stream-json",
      "--setting-sources",
      "project",
    ],
    env: {
      ...fixture.env,
      HOME: config.archon.serviceHome,
      CLAUDE_CONFIG_DIR: config.nativeIdentity.profile,
      ARCHON_HOME: config.archon.home,
    },
    readFile: () => JSON.stringify({ claudeBinary: "/opt/claude/2.1.317" }),
  };
}

describe("installed native Claude launcher", () => {
  it("checks the same bound digest for first calls and SDK session resumes", async () => {
    const fixture = launchFixture();
    fixture.args.push("--resume", "session-fixture");
    const launch = await planNativeClaude(fixture);
    expect(launch.executable).toBe("/opt/claude/2.1.317");
    expect(launch.args).toEqual(fixture.args);
    expect(launch.env.CLAUDE_CONFIG_DIR).toBe(fixture.binding.profile);
    expect(fixture.verifyIdentity).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: fixture.binding.owner,
        expectedDigest: fixture.binding.profileDigest,
      }),
    );
  });

  it("allows provider plugin scoping JSON but not identity-changing settings", async () => {
    const fixture = launchFixture();
    const settings = JSON.stringify({
      enabledPlugins: { "fixture@local": false },
      syncClaudeAiPlugins: false,
    });
    await expect(
      planNativeClaude({
        ...fixture,
        args: [...fixture.args, "--settings", settings],
      }),
    ).resolves.toMatchObject({ executable: "/opt/claude/2.1.317" });
    for (const changed of [
      { apiKeyHelper: "credential-fixture" },
      { env: { ANTHROPIC_API_KEY: "credential-fixture" } },
      { enabledPlugins: {}, syncClaudeAiPlugins: true },
    ]) {
      await expect(
        planNativeClaude({
          ...fixture,
          args: [...fixture.args, `--settings=${JSON.stringify(changed)}`],
        }),
      ).rejects.toThrow(/^identity-launch-settings-refused$/);
    }
  });

  it.each(["user", "local", "project,user", "managed"])(
    "refuses loaded settings source %s",
    async (source) => {
      const fixture = launchFixture();
      fixture.args[fixture.args.length - 1] = source;
      await expect(planNativeClaude(fixture)).rejects.toThrow(
        /^identity-launch-settings-refused$/,
      );
    },
  );

  it("accepts explicit no-settings analyst calls and bound read-only plugin discovery", async () => {
    const fixture = launchFixture();
    fixture.args[fixture.args.length - 1] = "";
    await expect(planNativeClaude(fixture)).resolves.toBeDefined();
    await expect(
      planNativeClaude({ ...fixture, args: ["plugin", "list", "--json"] }),
    ).resolves.toBeDefined();
    await expect(
      planNativeClaude({ ...fixture, args: ["plugin", "install", "unknown"] }),
    ).rejects.toThrow(/^identity-launch-arguments-refused$/);
  });

  it("allows only exact --version without a run, never auth or unbound model access", async () => {
    const fixture = launchFixture();
    const env = {
      ...fixture.env,
      WORKFLOW_ID: undefined,
      ARCHON_NODE_EXECUTION: undefined,
    };
    await expect(
      planNativeClaude({ ...fixture, env, args: ["--version"] }),
    ).resolves.toBeDefined();
    await expect(planNativeClaude({ ...fixture, env })).rejects.toThrow(
      /^identity-run-invalid$/,
    );
    await expect(
      planNativeClaude({ ...fixture, args: ["auth", "login"] }),
    ).rejects.toThrow(/^identity-launch-arguments-refused$/);
  });

  it("does not start the actual CLI on account drift or missing inherited binding", async () => {
    const fixture = launchFixture();
    const spawnImpl = vi.fn();
    fixture.verifyIdentity.mockRejectedValue(
      new Error("identity-account-drift"),
    );
    await expect(launchNativeClaude({ ...fixture, spawnImpl })).rejects.toThrow(
      /^identity-account-drift$/,
    );
    expect(spawnImpl).not.toHaveBeenCalled();
    await expect(
      launchNativeClaude({
        ...fixture,
        runId: "child-identity-001",
        env: {
          ...fixture.env,
          WORKFLOW_ID: "child-identity-001",
          ARCHON_NODE_EXECUTION: JSON.stringify({
            ...fixture.execution,
            runId: "child-identity-001",
          }),
        },
        spawnImpl,
      }),
    ).rejects.toThrow(/^identity-run-binding-missing$/);
  });

  it("inherits streaming stdio and forwards termination without swallowing child exit", async () => {
    const fixture = launchFixture();
    const signals = new EventEmitter();
    const child = Object.assign(new EventEmitter(), { kill: vi.fn() });
    const spawnImpl = vi.fn(() => {
      queueMicrotask(() => {
        signals.emit("SIGTERM");
        child.emit("close", 23, null);
      });
      return child;
    });
    expect(
      await launchNativeClaude({ ...fixture, spawnImpl, signals }),
    ).toEqual({ code: 23, signal: null });
    expect(spawnImpl).toHaveBeenCalledWith(
      "/opt/claude/2.1.317",
      fixture.args,
      expect.objectContaining({
        stdio: "inherit",
        shell: false,
        env: fixture.env,
      }),
    );
    expect(child.kill).toHaveBeenCalledWith("SIGTERM");
    expect(signals.listenerCount("SIGTERM")).toBe(0);
  });
});

describe("installed identity policy", () => {
  const where = {
    root: config.root,
    control: `${config.root}/control`,
    home: config.archon.home,
    archon: config.archon.executable,
    hostId: "core-dev",
    port: 3190,
    image: `sha256:${"c".repeat(64)}`,
  };

  it("makes the single service owner explicit without changing preserved owners", () => {
    const installed = buildFactoryConfig(where);
    expect(installed.nativeIdentity).toEqual(config.nativeIdentity);
    expect(validateConfig(installed)).toBe(installed);
    const explicit = {
      owner: "other",
      profile: config.owners.other.profile,
      provider: "claude",
    };
    expect(
      buildFactoryConfig({
        ...where,
        existing: { owners: config.owners, nativeIdentity: explicit },
      }),
    ).toMatchObject({ owners: config.owners, nativeIdentity: explicit });
  });

  it.each([
    {
      owner: "other",
      profile: config.nativeIdentity.profile,
      provider: "claude",
    },
    { ...config.nativeIdentity, profile: "/home/admin/.claude-other" },
    { ...config.nativeIdentity, provider: "api" },
  ])("rejects a configured service/profile mismatch %j", (nativeIdentity) => {
    expect(() =>
      validateConfig({ ...buildFactoryConfig(where), nativeIdentity }),
    ).toThrow(/nativeIdentity/);
  });

  it("treats any installed account identity change as a drained-policy switch", () => {
    const previous = {
      policyRevision: "c".repeat(64),
      settingsDigest: "d".repeat(64),
      nativeIdentity: {
        ...config.nativeIdentity,
        home: "/home/admin",
        accountDigest: "a".repeat(64),
      },
    };
    expect(
      policySwitch(previous, {
        ...previous,
        nativeIdentity: {
          ...previous.nativeIdentity,
          accountDigest: "b".repeat(64),
        },
      }),
    ).toBe(true);
    expect(policySwitch(previous, { ...previous })).toBe(false);
  });

  it("generates a fixed installed executable seam without interpolation of runtime arguments", () => {
    const launcher = nativeClaudeLauncher({
      node: "/opt/node/bin/node",
      identityModule: "/opt/factory/pack/.shared/identity.mjs",
      configFile: "/srv/core-factory/control/core-factory.json",
    });
    expect(launcher).toBe(
      "#!/bin/sh\nexec '/opt/node/bin/node' '/opt/factory/pack/.shared/identity.mjs' launch --config '/srv/core-factory/control/core-factory.json' -- \"$@\"\n",
    );
    expect(() =>
      nativeClaudeLauncher({
        node: "node",
        identityModule: "/safe/identity.mjs",
        configFile: "/safe/config.json",
      }),
    ).toThrow(/launcher-path/);
  });

  it.each([
    "apiKeyHelper",
    "awsAuthRefresh",
    "awsCredentialExport",
    "forceLoginMethod",
    "forceLoginOrgUUID",
  ])("retains managed auth-override refusal for %s", (key) => {
    const files = controlFiles({
      node: "/n",
      claude: "/native-claude",
      runtime: "/r",
    });
    expect(() =>
      settingsDigest(files, {
        managed: {
          "managed-settings.json": JSON.stringify({ [key]: "private-fixture" }),
        },
        archonHome: archonHomeConfig({ claude: "/native-claude" }),
      }),
    ).toThrow(/^identity-settings-auth-override$/);
  });
});

function identityFixture() {
  const roleFiles = controlFiles({
    node: "/opt/node/bin/node",
    claude: "/opt/factory/native-claude",
    runtime: "/control/.shared",
  });
  const archonHome = archonHomeConfig({ claude: "/opt/factory/native-claude" });
  const auth = syntheticAuth();
  const release = {
    policyRevision: "c".repeat(64),
    nativeIdentity: {
      ...config.nativeIdentity,
      home: config.archon.serviceHome,
      accountDigest: sha(
        JSON.stringify({ email: auth.email, orgId: auth.orgId }),
      ),
    },
    claudeBinary: "/opt/claude/2.1.317",
    claudeBinarySha256: sha("actual-claude"),
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
    [release.claudeBinary, "actual-claude"],
    [release.claudeLauncher.path, "launcher"],
    [release.archon.path, "archon"],
    [release.node.path, "node"],
    [release.plugins.provider.path, "provider"],
    [release.settingsInputs.archonHomeConfig, archonHome],
    ...Object.entries(roleFiles).map(([name, text]): [string, string] => [
      `${config.root}/control/${name}`,
      text,
    ]),
  ]);
  const run = vi.fn(async () => ({
    code: 0,
    stdout: JSON.stringify(auth),
    stderr: "",
  }));
  const readFile = (file: string) => {
    if (file.endsWith("/core-factory-release.json"))
      return JSON.stringify(release);
    if (!files.has(file)) throw new Error("fixture-file-missing");
    return files.get(file)!;
  };
  const readManaged = vi.fn(() => ({}));
  const env: Record<string, string> = {
    HOME: config.archon.serviceHome,
    CLAUDE_CONFIG_DIR: config.nativeIdentity.profile,
    ARCHON_HOME: config.archon.home,
  };
  const verify = (extra = {}) =>
    verifyNativeIdentity({ config, env, run, readFile, readManaged, ...extra });
  return { auth, release, files, run, readManaged, env, verify };
}

// Observed on VM 100 (12 November 2026): an assignment's identity digest
// includes the release it was bound under, so after a release change the
// retained digest can only be proven against the previous release's record.
describe("account continuity across a release change", () => {
  async function moved() {
    const fixture = identityFixture();
    const original = await fixture.verify();
    const predecessor = structuredClone(fixture.release);
    // A new release: another pack revision and its own launcher.
    fixture.release.policyRevision = "d".repeat(64);
    fixture.release.claudeLauncher = {
      path: "/opt/factory-next/native-claude",
      sha256: sha("launcher-next"),
    };
    fixture.files.set("/opt/factory-next/native-claude", "launcher-next");
    return { fixture, original, predecessor };
  }

  it("proves the retained digest from the previous release's record and returns the new binding", async () => {
    const { fixture, original, predecessor } = await moved();
    await expect(
      fixture.verify({ expectedDigest: original.profileDigest }),
    ).rejects.toThrow(/^identity-drift$/);
    const binding = await fixture.verify({
      expectedDigest: original.profileDigest,
      predecessor,
    });
    expect(binding).toMatchObject(config.nativeIdentity);
    expect(binding.profileDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(binding.profileDigest).not.toBe(original.profileDigest);
    expect(binding.profileDigest).toBe((await fixture.verify()).profileDigest);
  });

  it("refuses when the signed-in account is not the one the assignment was bound to", async () => {
    const { fixture, original, predecessor } = await moved();
    Object.assign(fixture.auth, { email: "someone-else@example.invalid" });
    // Even when the new release was installed under that other account.
    fixture.release.nativeIdentity.accountDigest = sha(
      JSON.stringify({
        email: fixture.auth.email,
        orgId: fixture.auth.orgId,
      }),
    );
    const error = await fixture
      .verify({ expectedDigest: original.profileDigest, predecessor })
      .catch((caught: Error) => caught);
    expect(error).toMatchObject({ code: "identity-account-drift" });
    expect(JSON.stringify(error)).not.toContain("someone-else");
  });

  it.each([
    ["another settings digest", { settingsDigest: "e".repeat(64) }],
    ["another pack revision", { policyRevision: "e".repeat(64) }],
    [
      "another launcher",
      {
        claudeLauncher: {
          path: "/opt/x/native-claude",
          sha256: "e".repeat(64),
        },
      },
    ],
  ])("refuses a previous-release record with %s", async (_label, changed) => {
    const { fixture, original, predecessor } = await moved();
    await expect(
      fixture.verify({
        expectedDigest: original.profileDigest,
        predecessor: { ...predecessor, ...changed },
      }),
    ).rejects.toThrow(/^identity-drift$/);
  });

  it.each([null, {}, { policyRevision: "c".repeat(64) }, "not-a-record"])(
    "refuses a missing or malformed previous-release record %j",
    async (record) => {
      const { fixture, original } = await moved();
      await expect(
        fixture.verify({
          expectedDigest: original.profileDigest,
          predecessor: record,
        }),
      ).rejects.toThrow(/^identity-predecessor-invalid$/);
    },
  );

  it("refuses a previous-release record bound to another profile", async () => {
    const { fixture, original, predecessor } = await moved();
    predecessor.nativeIdentity.profile = "/home/admin/.claude-other";
    await expect(
      fixture.verify({ expectedDigest: original.profileDigest, predecessor }),
    ).rejects.toThrow(/^identity-predecessor-invalid$/);
  });

  it("needs the retained digest to prove anything", async () => {
    const { fixture, predecessor } = await moved();
    await expect(fixture.verify({ predecessor })).rejects.toThrow(
      /^identity-drift$/,
    );
  });
});

describe("native identity verification", () => {
  it("preflights the pinned real CLI with explicit JSON and the service profile, retaining only a digest", async () => {
    const fixture = identityFixture();
    const binding = await fixture.verify();
    expect(binding).toMatchObject(config.nativeIdentity);
    expect(binding.profileDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(fixture.run).toHaveBeenCalledWith(
      [fixture.release.claudeBinary, "auth", "status", "--json"],
      expect.objectContaining({
        env: expect.objectContaining({
          HOME: "/home/admin",
          CLAUDE_CONFIG_DIR: "/home/admin/.claude",
        }),
        timeoutMs: 30_000,
      }),
    );
    expect(JSON.stringify(binding)).not.toContain(fixture.auth.email);
    expect(JSON.stringify(binding)).not.toContain(fixture.auth.orgId);
  });

  it.each([
    { loggedIn: false },
    { authMethod: undefined },
    { authMethod: "api_key" },
    { apiProvider: "bedrock" },
    { subscriptionType: "pro" },
    { configDirectory: "/home/admin/.claude-other" },
    { email: undefined },
    { orgId: undefined },
  ])("refuses incomplete or non-native auth: %j", async (changed) => {
    const fixture = identityFixture();
    Object.assign(fixture.auth, changed);
    await expect(fixture.verify()).rejects.toThrow(/identity-auth/);
  });

  it.each(["email", "orgId"])(
    "refuses an account %s change without publishing account data",
    async (field) => {
      const fixture = identityFixture();
      const original = await fixture.verify();
      Object.assign(fixture.auth, { [field]: "changed-private-fixture" });
      const error = await fixture
        .verify({ expectedDigest: original.profileDigest })
        .catch((caught: Error) => caught);
      expect(error).toMatchObject({
        code: "identity-account-drift",
        message: "identity-account-drift",
      });
      expect(JSON.stringify(error)).not.toContain("changed-private-fixture");
    },
  );

  it.each([
    "ANTHROPIC_API_KEY",
    "CLAUDE_API_KEY",
    "ANTHROPIC_AUTH_TOKEN",
    "CLAUDE_CODE_OAUTH_TOKEN",
    "ANTHROPIC_BASE_URL",
    "ANTHROPIC_CUSTOM_HEADERS",
    "CLAUDE_CODE_API_KEY_HELPER_FD",
    "CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR",
    "CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST",
    "CLAUDE_BIN_PATH",
    "CLAUDE_CODE_USE_BEDROCK",
    "CLAUDE_CODE_USE_VERTEX",
    "IS_SANDBOX",
    "NODE_OPTIONS",
  ])("refuses %s before invoking native auth", async (key) => {
    const fixture = identityFixture();
    fixture.env[key] = "private-override-fixture";
    await expect(fixture.verify()).rejects.toThrow(
      /^identity-environment-override$/,
    );
    expect(fixture.run).not.toHaveBeenCalled();
  });

  it.each([
    "/opt/claude/2.1.317",
    "/opt/factory/native-claude",
    "/opt/node/bin/node",
    "/opt/archon/archon",
    "/srv/core-factory/archon/plugins/archon-provider-claude",
  ])("refuses changed installed bytes at %s", async (file) => {
    const fixture = identityFixture();
    fixture.files.set(file, "changed");
    await expect(fixture.verify()).rejects.toThrow(/identity-binary-drift/);
    expect(fixture.run).not.toHaveBeenCalled();
  });

  it("recomputes loaded settings and refuses managed input drift", async () => {
    const fixture = identityFixture();
    fixture.files.set(`${config.root}/control/.claude/settings.json`, "{}");
    await expect(fixture.verify()).rejects.toThrow(/identity-settings-drift/);
    expect(fixture.run).not.toHaveBeenCalled();
  });

  it("refuses an expected attempt digest rather than rebinding it", async () => {
    const fixture = identityFixture();
    await expect(
      fixture.verify({ expectedDigest: "0".repeat(64) }),
    ).rejects.toThrow(/^identity-drift$/);
  });

  it("never returns raw auth failures, including credential-bearing process exceptions", async () => {
    const fixture = identityFixture();
    fixture.run.mockRejectedValue(
      new Error("private-status-and-credential-fixture"),
    );
    await expect(fixture.verify()).rejects.toThrow(
      /^identity-auth-unavailable$/,
    );
  });
});

describe("service-bound native dispatch", () => {
  it("refuses another owner's profile before sending a signed delivery", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    await expect(
      fireRound({
        config,
        value: {
          issue: 12,
          round: 0,
          assignment: {
            id: "assignment-12",
            owner: "other",
            profileDigest: "a".repeat(64),
          },
        },
        revision: 1,
        fetchImpl,
        secret,
      }),
    ).rejects.toThrow(/identity-owner-mismatch/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
