import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  PIN,
  PLUGINS,
  archonHomeConfig,
  buildFactoryConfig,
  controlFiles,
  diagnosticsSummary,
  enginePieceAction,
  guardHookCommand,
  legacyCheckSlots,
  liveWorkRefusal,
  retainedAssignments,
  managedPolicyFiles,
  pinnedIdentity,
  pinnedSource,
  pluginPaths,
  pluginProblem,
  pluginReceiptProblem,
  policySwitch,
  readPlugin,
  settingsDigest,
  stageIdentity,
  systemdUnits,
} from "../../../scripts/archon-factory/installation/install-logic.mjs";
import { createAssignment } from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

import { joinWrappedStatements } from "./support/source-statements";

// The installer runs as root on VM 100 only, so its decisions live in
// install-logic.mjs and install.mjs is checked for using them.

const INSTALLATION = path.resolve("scripts/archon-factory/installation");
const installer = joinWrappedStatements(
  readFileSync(path.join(INSTALLATION, "install.mjs"), "utf8"),
);
const ok = (value: unknown) => ({ status: 0, stdout: JSON.stringify(value) });
const item = (
  issue: number,
  status: string,
  extra = {},
  lease: unknown = null,
) => ({
  name: `core/issues/${issue}`,
  revision: 3,
  lease,
  value: {
    ...createAssignment({
      issue,
      assignmentId: `assign-${issue}`,
      owner: "primary",
      profileDigest: "a".repeat(64),
      scopeRevision: "b".repeat(64),
      policyRevision: "c".repeat(64),
      endState: "PR_READY",
      by: "fixture",
      now: "2026-11-12T00:00:00.000Z",
    }),
    status,
    route: null,
    ...extra,
  },
});
const paused = ok({
  name: "core/factory",
  revision: 4,
  value: { v: 1, intake: "paused", mode: "drain" },
});

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});
const tempDir = () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "archon-ops-install-"));
  dirs.push(dir);
  return dir.split(path.sep).join("/");
};

describe("live-work interlock fails closed", () => {
  it("refuses when the state listing fails, is not JSON or has no documents array", () => {
    expect(
      liveWorkRefusal({ listing: { status: 2, stdout: "" }, factory: paused }),
    ).toMatch(/cannot list work items/);
    expect(
      liveWorkRefusal({
        listing: { status: 0, stdout: "not json" },
        factory: paused,
      }),
    ).toMatch(/no documents array/);
    expect(
      liveWorkRefusal({ listing: ok({ ok: false }), factory: paused }),
    ).toMatch(/no documents array/);
    expect(
      liveWorkRefusal({
        listing: { status: null, stdout: "" } as never,
        factory: paused,
      }),
    ).toMatch(/cannot list/);
  });

  it("refuses unless core/factory is read and intake is paused", () => {
    const listing = ok({ documents: [item(12, "PR_READY")] });
    expect(
      liveWorkRefusal({ listing, factory: { status: 1, stdout: "" } }),
    ).toMatch(/cannot read core\/factory/);
    expect(
      liveWorkRefusal({
        listing,
        factory: ok({ value: { v: 1, intake: "open", mode: "run" } }),
      }),
    ).toMatch(/intake is open/);
    expect(liveWorkRefusal({ listing, factory: ok({ value: null }) })).toMatch(
      /missing while work items exist/,
    );
  });

  it("refuses while any work item is pending, active, waiting or unrecognised", () => {
    for (const status of ["pending", "active", "waiting", "mystery"]) {
      const listing = ok({ documents: [item(12, "MERGED"), item(14, status)] });
      expect(liveWorkRefusal({ listing, factory: paused })).toContain(
        `14 (${status})`,
      );
    }
  });

  // A settled assignment cannot start a round by itself, so it may stay across
  // a release change; its rounds then refuse `policy-changed` until the
  // operator runs `issue <n> adopt-policy`.
  it.each(["BLOCKED", "PR_READY", "stopped"])(
    "lets a settled %s assignment stay across a release change and names it for adoption",
    (status) => {
      const listing = ok({
        documents: [
          item(12, status, { control: "stop" }),
          item(13, "MERGED"),
          { name: "core/issues/12/feedback", value: {} },
        ],
      });
      expect(liveWorkRefusal({ listing, factory: paused })).toBeNull();
      expect(retainedAssignments(listing)).toEqual([{ issue: 12, status }]);
    },
  );

  it("names no assignment when the listing cannot be read", () => {
    expect(retainedAssignments({ status: 2, stdout: "" })).toEqual([]);
    expect(retainedAssignments({ status: 0, stdout: "not json" })).toEqual([]);
  });

  it.each([
    "pending",
    "active",
    "waiting",
    "BLOCKED",
    "PR_READY",
    "stopped",
    "MERGED",
  ])("preserves cleanup and native holds on %s", (status) => {
    const cleanup = item(12, status, {
      cleanup: { runId: "old-run" },
      nativeFaults: null,
    });
    expect(
      liveWorkRefusal({
        listing: ok({ documents: [cleanup] }),
        factory: paused,
      }),
    ).toMatch(/cleanup-unconfirmed/);
    const native = item(12, status, { nativeFaults: null });
    expect(
      liveWorkRefusal({
        listing: ok({ documents: [native] }),
        factory: paused,
      }),
    ).toMatch(/native-fault-held/);
  });

  it.each(["BLOCKED", "PR_READY", "stopped", "MERGED"])(
    "refuses a live lease on terminal-looking %s",
    (status) => {
      const listing = ok({
        documents: [item(12, status, {}, { runId: "old-run", live: true })],
      });
      expect(liveWorkRefusal({ listing, factory: paused })).toMatch(
        /live.*lease/,
      );
    },
  );

  it.each(
    [
      undefined,
      false,
      [],
      {},
      { runId: "old-run" },
      { runId: "old-run", live: "false" },
      { live: false },
      { runId: "", live: false },
      { runId: ["old-run"], live: false },
    ].map((lease) => [lease]),
  )("refuses ambiguous lease proof %j even for MERGED", (lease) => {
    const document = item(12, "MERGED");
    Object.assign(document, { lease });
    expect(
      liveWorkRefusal({
        listing: ok({ documents: [document] }),
        factory: paused,
      }),
    ).toMatch(/lease.*unavailable|lease.*ambiguous/);
  });

  it("does not treat an expired lease as settlement of a retained run", () => {
    const listing = ok({
      documents: [
        item(
          12,
          "MERGED",
          { run: { id: "old-run", route: "deliver" } },
          { runId: "old-run", live: false },
        ),
      ],
    });
    expect(liveWorkRefusal({ listing, factory: paused })).toMatch(
      /unreconciled.*run/,
    );
  });

  it("refuses terminal-looking history with a retained dispatch route", () => {
    const listing = ok({
      documents: [item(12, "MERGED", { route: "deliver" })],
    });
    expect(liveWorkRefusal({ listing, factory: paused })).toMatch(
      /unreconciled.*route/,
    );
  });

  it("refuses a malformed terminal-looking record", () => {
    const document = item(12, "MERGED", { assignment: null });
    expect(
      liveWorkRefusal({
        listing: ok({ documents: [document] }),
        factory: paused,
      }),
    ).toMatch(/malformed.*work item/);
  });

  it("allows completed non-executable history with explicit lease proof, and a fresh store", () => {
    const listing = ok({
      documents: [
        item(12, "MERGED"),
        item(13, "MERGED", {}, { runId: "old-run", live: false }),
        { name: "core/issues/12/feedback", value: {} },
      ],
    });
    expect(liveWorkRefusal({ listing, factory: paused })).toBeNull();
    expect(
      liveWorkRefusal({
        listing: ok({ documents: [] }),
        factory: ok({ value: null }),
      }),
    ).toBeNull();
  });

  it("is applied to role-setting changes as well as pack changes", () => {
    const previous = {
      policyRevision: "a".repeat(64),
      settingsDigest: "b".repeat(64),
    };
    expect(policySwitch(null, previous)).toBe(false);
    expect(policySwitch(previous, { ...previous })).toBe(false);
    expect(
      policySwitch(previous, { ...previous, policyRevision: "c".repeat(64) }),
    ).toBe(true);
    expect(
      policySwitch(previous, { ...previous, settingsDigest: "c".repeat(64) }),
    ).toBe(true);
  });

  it("is wired into install.mjs with no bypass", () => {
    expect(installer).toContain("liveWorkRefusal(");
    expect(installer).toContain("policySwitch(");
    expect(installer).not.toContain("allow-policy-change");
  });
});

describe("intake timer never starts a stopped engine", () => {
  const units = systemdUnits({
    archon: "/opt/archon/0.14.0/archon",
    node: "/opt/node/bin/node",
    port: 39190,
    hostId: "core-dev",
    root: "/srv/core-factory",
    control: "/srv/core-factory/control",
    runtime: "/srv/core-factory/control/.archon/workflows/core-factory/.shared",
    backupScript: "/opt/core-archon-factory/releases/x/pack/.shared/backup.mjs",
    environment: ["HOME=/home/admin"],
  });

  it("skips the pass unless the engine is active and never pulls the engine in", () => {
    const intake = units["core-factory-intake.service"];
    expect(intake).toMatch(
      /^ExecCondition=\/usr\/bin\/systemctl is-active --quiet core-archon\.service$/m,
    );
    expect(intake).toMatch(/^After=core-archon\.service$/m);
    expect(intake).not.toMatch(
      /^(Requires|Wants|BindsTo|Requisite|PartOf)=.*core-archon/m,
    );
  });

  it("is what install.mjs writes", () => {
    expect(installer).toContain("systemdUnits(");
    expect(installer).not.toMatch(/Requires=core-archon/);
  });

  it("orders the Console after the production engine, not the retired smoke unit", () => {
    const consoleUnit = readFileSync(
      path.join(INSTALLATION, "core-factory-console.service"),
      "utf8",
    );
    expect(consoleUnit).toMatch(/^After=.*\bcore-archon\.service\b/m);
    expect(consoleUnit).not.toContain("smoke");
    // systemd unit files are installed as committed; they must stay LF.
    expect(consoleUnit).not.toContain("\r");
  });
});

describe("PreToolUse guard fails closed", () => {
  const command = guardHookCommand({
    node: "/opt/node/bin/node",
    guard: "/control/.shared/guard.mjs",
  });

  it("installs the wrapped guard with a deadline inside the hook timeout", () => {
    const settings = JSON.parse(
      controlFiles({
        node: "/opt/node/bin/node",
        claude: "/claude",
        runtime: "/control/.shared",
      })[".claude/settings.json"],
    );
    const hook = settings.hooks.PreToolUse[0].hooks[0];
    expect(hook.command).toBe(command);
    expect(hook.command).toMatch(/\|\| \{ .* exit 2; \}$/);
    const deadline =
      Number(/timeout -k (\d+) (\d+) /.exec(hook.command)![2]) +
      Number(/timeout -k (\d+)/.exec(hook.command)![1]);
    expect(deadline).toBeLessThan(hook.timeout);
    expect(settings.permissions.deny).toEqual([
      "Bash",
      "WebFetch",
      "WebSearch",
      "Task",
    ]);
    expect(installer).toContain("controlFiles(");
    expect(installer).not.toMatch(
      /command: `\$\{NODE\} \$\{runtime\}\/guard\.mjs`/,
    );
  });

  const sh = spawnSync("sh", ["-c", "test -x /usr/bin/timeout"], {
    encoding: "utf8",
  });
  const shell = sh.error || sh.status !== 0 ? it.skip : it;
  const hook = (guardBody: string, seconds = 25) => {
    const dir = tempDir();
    writeFileSync(`${dir}/guard.sh`, guardBody);
    return spawnSync(
      "sh",
      [
        "-c",
        guardHookCommand({
          node: "/bin/sh",
          guard: `${dir}/guard.sh`,
          seconds,
        }),
      ],
      { encoding: "utf8", input: "{}" },
    );
  };

  shell(
    "blocks (exit 2) when the guard crashes, cannot start or overruns its deadline",
    () => {
      expect(hook("exit 1\n").status).toBe(2);
      expect(
        spawnSync(
          "sh",
          ["-c", guardHookCommand({ node: "/no/such/node", guard: "/x" })],
          { encoding: "utf8" },
        ).status,
      ).toBe(2);
      expect(hook("sleep 5\n", 1).status).toBe(2);
      // The guard's own deny (exit 2) stays a block with its reason.
      const deny = hook("echo 'denied by policy' >&2; exit 2\n");
      expect(deny.status).toBe(2);
      expect(deny.stderr).toContain("denied by policy");
    },
  );

  shell("passes the guard's own decision through", () => {
    const result = hook('cat >/dev/null; echo \'{"decision":"allow"}\'\n');
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('{"decision":"allow"}');
  });
});

describe("installed pieces are hash-verified", () => {
  it("pins the qualified check image and binds plugin receipts to their pinned executables", () => {
    expect(PIN.checkImage).toMatch(/^sha256:[a-f0-9]{64}$/);
    const forge = PLUGINS.find((plugin) => plugin.name === "forge")!;
    expect(forge).toMatchObject({
      executable: "archon-forge-github",
      sha256: PIN.forge,
    });
    const receipt = {
      id: forge.id,
      manifest: { executable: forge.executable },
      files: [{ path: forge.executable, sha256: PIN.forge }],
    };
    expect(pluginReceiptProblem(receipt, forge)).toBe("");
    expect(
      pluginReceiptProblem(
        {
          ...receipt,
          files: [{ path: forge.executable, sha256: "0".repeat(64) }],
        },
        forge,
      ),
    ).toMatch(/pinned checksum/);
    expect(
      pluginReceiptProblem(
        {
          ...receipt,
          files: [...receipt.files, { path: "extra", sha256: PIN.forge }],
        },
        forge,
      ),
    ).toMatch(/pinned/);
    expect(
      pluginReceiptProblem({ ...receipt, id: "someone/else" }, forge),
    ).toMatch(/expected/);
    expect(pluginReceiptProblem(null, forge)).toMatch(/missing/);
  });

  it("installs a missing engine piece from the launcher-verified download and refuses a different one", () => {
    expect(enginePieceAction({ verified: "v", installed: null })).toEqual({
      action: "install",
    });
    expect(enginePieceAction({ verified: "v", installed: "v" })).toEqual({
      action: "keep",
    });
    expect(enginePieceAction({ verified: "v", installed: "w" })).toMatchObject({
      action: "refuse",
    });
    expect(enginePieceAction({ verified: "", installed: null })).toMatchObject({
      action: "refuse",
    });
  });

  it("checks Node by pin when known, else by the previously recorded hash", () => {
    expect(
      pinnedIdentity({ actual: "a", pin: "a", previous: "b" }),
    ).toMatchObject({ ok: true, source: "pin" });
    expect(
      pinnedIdentity({ actual: "a", pin: "b", previous: "a" }),
    ).toMatchObject({ ok: false });
    expect(
      pinnedIdentity({ actual: "a", pin: null, previous: "a" }),
    ).toMatchObject({ ok: true, source: "previous-release" });
    expect(
      pinnedIdentity({ actual: "a", pin: null, previous: "b" }),
    ).toMatchObject({ ok: false });
    expect(
      pinnedIdentity({ actual: "a", pin: null, previous: undefined }),
    ).toMatchObject({ ok: true, source: "recorded" });
  });

  // The build directories of the first install are not kept. An update takes
  // the engine binary and the webhook plugin from the installed copies, which
  // are checked against the same pins.
  it("finds a pinned file in the installed copy when the build copy is gone", () => {
    const hashes: Record<string, string> = {
      "/build/archon": "other",
      "/opt/archon": "pinned",
    };
    const sha = (file: string) => {
      if (!(file in hashes)) throw new Error(`ENOENT ${file}`);
      return hashes[file];
    };
    const find = (candidates: string[], given?: string) =>
      pinnedSource({ given, candidates, pin: "pinned", sha });
    expect(find(["/build/archon", "/opt/archon"], "/elsewhere")).toBe(
      "/elsewhere",
    );
    expect(find(["/build/archon", "/opt/archon"])).toBe("/opt/archon");
    expect(find(["/gone", "/opt/archon"])).toBe("/opt/archon");
    // Nothing matches: the first is returned and the installer's own pin
    // check refuses it.
    expect(find(["/build/archon", "/gone"])).toBe("/build/archon");
    expect(installer).toMatch(/pinnedSource\(\{\s*given: args\.archon,/);
    expect(installer).toMatch(/pinnedSource\(\{\s*given: args\.plugin,/);
    expect(installer).toContain("if (pluginSource !== PLUGIN)");
  });

  it("is wired into install.mjs: every pin is used and ARCHON is re-hashed after copying", () => {
    for (const pin of [
      "PIN.archon",
      "PIN.claude",
      "PIN.webhooks",
      "PIN.checkImage",
      "PIN.nodeVersion",
      "PIN.node",
    ])
      expect(installer).toContain(pin);
    expect(installer).toContain("PLUGINS");
    // pluginProblem checks the executable hash and then pluginReceiptProblem.
    expect(installer).toContain("pluginProblem(");
    expect(installer).toContain('"serve", "--download-only"');
    expect(installer).toMatch(
      /renameSync\(staged, ARCHON\);\s*\n\s*if \(fileSha\(ARCHON\) !== PIN\.archon\)/,
    );
    expect(installer).not.toContain("reuse-home");
  });
});

describe("recorded identity of the installed release", () => {
  it("digests the role settings the roles load, not the user profile settings", () => {
    const files = controlFiles({ node: "/n", claude: "/c", runtime: "/r" });
    const inputs = {
      managed: {},
      archonHome: archonHomeConfig({ claude: "/c" }),
    };
    const base = settingsDigest(files, inputs);
    expect(base).toMatch(/^[a-f0-9]{64}$/);
    expect(
      settingsDigest(
        {
          ...files,
          ".claude/settings.json": files[".claude/settings.json"].replace(
            "exit 2",
            "exit 0",
          ),
        },
        inputs,
      ),
    ).not.toBe(base);
    expect(
      settingsDigest({ ...files, "mcp/core-check.json": "{}" }, inputs),
    ).not.toBe(base);
    expect(() =>
      settingsDigest({ ...files, "CLAUDE.md": undefined } as never, inputs),
    ).toThrow(/missing/);
    expect(installer).not.toContain("/home/admin/.claude/settings.json");
  });

  it("digests Claude Code's managed policy and the installed ARCHON_HOME config as well", () => {
    const files = controlFiles({ node: "/n", claude: "/c", runtime: "/r" });
    const archonHome = archonHomeConfig({ claude: "/c" });
    const base = settingsDigest(files, { managed: {}, archonHome });
    const managed = {
      "managed-settings.json": '{"permissions":{"allow":["Bash"]}}',
    };
    const withManaged = settingsDigest(files, { managed, archonHome });
    expect(withManaged).not.toBe(base);
    expect(
      settingsDigest(files, {
        managed: { "managed-settings.json": "{}" },
        archonHome,
      }),
    ).not.toBe(withManaged);
    expect(
      settingsDigest(files, {
        managed: { ...managed, "managed-settings.d/10-hooks.json": "{}" },
        archonHome,
      }),
    ).not.toBe(withManaged);
    expect(
      settingsDigest(files, {
        managed: {},
        archonHome: archonHome.replace(
          "maxConversations: 2",
          "maxConversations: 9",
        ),
      }),
    ).not.toBe(base);
    // Unread inputs never digest as "nothing there".
    expect(() => settingsDigest(files, { archonHome } as never)).toThrow(
      /managed/,
    );
    expect(() => settingsDigest(files, { managed: {} } as never)).toThrow(
      /ARCHON_HOME/,
    );
  });

  it("reads every managed policy file, and nothing when the directory is absent", () => {
    const dir = tempDir();
    expect(managedPolicyFiles(`${dir}/absent`)).toEqual({});
    mkdirSync(`${dir}/managed-settings.d`, { recursive: true });
    writeFileSync(`${dir}/managed-settings.json`, "{}");
    writeFileSync(`${dir}/managed-settings.d/10-hooks.json`, '{"hooks":{}}');
    writeFileSync(`${dir}/CLAUDE.md`, "policy");
    expect(managedPolicyFiles(dir)).toEqual({
      "CLAUDE.md": "policy",
      "managed-settings.d/10-hooks.json": '{"hooks":{}}',
      "managed-settings.json": "{}",
    });
  });

  it("is wired into install.mjs, which writes ARCHON_HOME/config.yaml from the digested text", () => {
    expect(installer).toContain("managedPolicyFiles(");
    expect(installer).toMatch(
      /settingsDigest\(roleFiles, \{ managed, archonHome: archonHomeText \}\)/,
    );
    expect(installer).toMatch(
      /writeFileSync\(posix\.join\(HOME, "config\.yaml"\), archonHomeText\)/,
    );
    expect(installer).not.toContain('"defaultAssistant: claude"');
  });

  it("records the staged source commit and a stage digest over pack and installer", () => {
    const stage = tempDir();
    mkdirSync(`${stage}/pack`, { recursive: true });
    mkdirSync(`${stage}/installation`, { recursive: true });
    writeFileSync(`${stage}/pack/archon-plugin.json`, "{}");
    writeFileSync(`${stage}/installation/install.mjs`, "x");
    writeFileSync(`${stage}/unrelated.txt`, "ignored");
    const first = stageIdentity(stage);
    expect(first.sourceCommit).toBeNull();
    writeFileSync(`${stage}/unrelated.txt`, "changed");
    expect(stageIdentity(stage).stageDigest).toBe(first.stageDigest);
    writeFileSync(`${stage}/installation/install.mjs`, "y");
    const second = stageIdentity(stage);
    expect(second.stageDigest).not.toBe(first.stageDigest);
    expect(second.packDigest).toBe(first.packDigest);
    writeFileSync(`${stage}/SOURCE_COMMIT`, `${"a".repeat(40)}\n`);
    expect(stageIdentity(stage).sourceCommit).toBe("a".repeat(40));
    writeFileSync(`${stage}/SOURCE_COMMIT`, "main\n");
    expect(() => stageIdentity(stage)).toThrow(/full commit id/);
    expect(installer).toContain("stageIdentity(");
    expect(installer).toContain("SOURCE.json");
  });

  it("captures post-install diagnostics", () => {
    const version = {
      name: "version",
      ok: true,
      status: 0,
      output: "Archon 0.14.0",
    };
    const health = {
      name: "health",
      ok: false,
      required: false,
      status: null,
      output: "engine not running",
    };
    expect(diagnosticsSummary([version, health])).toMatchObject({
      ok: true,
      checks: [
        { name: "version", ok: true, required: true },
        { name: "health", ok: false, required: false },
      ],
    });
    expect(
      diagnosticsSummary([{ ...version, ok: false, status: 1 }, health]).ok,
    ).toBe(false);
    expect(installer).toContain("diagnosticsSummary(");
    expect(installer).toContain('"version"');
    expect(installer).toContain("/api/health");
  });

  it("enables the engine and both timers for boot without starting them", () => {
    expect(installer).toMatch(
      /"enable", "core-archon\.service", "core-factory-intake\.timer", "core-factory-backup\.timer"\]/,
    );
    expect(installer).not.toMatch(/"enable", "--now"/);
  });

  it("records the host OS and toolchain versions with the release", () => {
    expect(installer).toContain("hostVersions(");
    for (const tool of ["uname", "os-release", "docker", "gh", "git", "bun"])
      expect(installer).toContain(tool);
    expect(installer).toMatch(/host: hostVersions\(\)/);
  });

  it("writes no dead CLI trigger binding files", () => {
    expect(installer).not.toMatch(/writeControl\("bindings\//);
  });
});

describe("installed factory configuration", () => {
  const where = {
    root: "/srv/core-factory",
    control: "/srv/core-factory/control",
    home: "/srv/core-factory/archon",
    archon: "/opt/archon/0.14.0/archon",
    hostId: "core-dev",
    port: 39190,
    image: PIN.checkImage,
  };

  it("writes no trigger bindings, the check queue bound and no review providers by default", () => {
    const config = buildFactoryConfig({ ...where, existing: {} });
    expect(config).not.toHaveProperty("bindings");
    expect(config.reviewProviders).toEqual([]);
    expect(config.limits.checkQueueMs).toBe(600000);
    expect(config.limits.heavyCheckSlots).toBe(1);
    expect(config.executor.image).toBe(PIN.checkImage);
  });

  it("authors factory commits with the repository owner's commit identity", () => {
    const { git } = buildFactoryConfig({ ...where, existing: {} });
    // develop's commits are authored as "Conrad O" from the GitHub noreply address.
    expect(git.authorName).toBe("Conrad O");
    expect(git.authorEmail).toBe("79217644+cobmojo@users.noreply.github.com");
  });

  it("keeps the operator's review providers, limits, owners and end state", () => {
    const reviewProviders = [
      {
        login: "coderabbitai[bot]",
        required: true,
        skipMarkers: ["Review skipped"],
      },
    ];
    const existing = {
      reviewProviders,
      limits: { checkQueueMs: 120000, admittedIssues: 1 },
      owners: {
        ada: { profile: "/home/admin/.claude-ada", githubLogin: "ada" },
      },
      defaultEndState: "MERGED",
      bindings: { select: "/srv/core-factory/control/bindings/select.json" },
    };
    const config = buildFactoryConfig({ ...where, existing });
    expect(config.reviewProviders).toEqual(reviewProviders);
    expect(config.limits).toMatchObject({
      checkQueueMs: 120000,
      admittedIssues: 1,
      heavyCheckSlots: 1,
    });
    expect(config.owners).toEqual(existing.owners);
    expect(config.defaultEndState).toBe("MERGED");
    expect(config).not.toHaveProperty("bindings");
  });

  it("is what install.mjs writes, after the staged pack's own validator accepted it", () => {
    expect(installer).toContain("buildFactoryConfig(");
    expect(installer).toContain("validateConfig(factoryConfig)");
    expect(installer).not.toMatch(/bindings: \{ select:/);
  });
});

describe("legacy check slots", () => {
  it("removes bare-PID slots whose process is gone and reports live ones, leaving current slots alone", () => {
    const locks = tempDir();
    for (const [name, owner] of [
      ["check-slot-0", "4001"],
      [
        "check-slot-1",
        JSON.stringify({ pid: 4002, attempt: "a", state: "running" }),
      ],
      ["check-slot-2", "4003\n"],
      ["check-slot-0.reclaim", "4004"],
    ]) {
      mkdirSync(`${locks}/${name}`);
      writeFileSync(`${locks}/${name}/owner`, owner);
    }
    mkdirSync(`${locks}/check-slot-3`);
    const plan = legacyCheckSlots(locks, {
      alive: (pid: number) => pid === 4003,
    });
    expect(plan).toEqual({
      remove: [`${locks}/check-slot-0`],
      live: [{ dir: `${locks}/check-slot-2`, pid: 4003 }],
    });
    expect(legacyCheckSlots(`${locks}/absent`, { alive: () => false })).toEqual(
      { remove: [], live: [] },
    );
  });

  it("is wired into install.mjs: refused while live, removed only after every check passed", () => {
    const [before, after] = installer.split("// --- Layout");
    expect(before).toContain("legacyCheckSlots(");
    expect(before).toMatch(/legacySlots\.live\.length\)\s*fail\(/);
    expect(after).toMatch(
      /for \(const dir of legacySlots\.remove\)\s*rmSync\(dir/,
    );
  });
});

describe("provider and forge plugins", () => {
  const plugin = PLUGINS.find((entry) => entry.name === "forge")!;
  const home = () => {
    const dir = tempDir();
    const paths = pluginPaths(dir, plugin);
    mkdirSync(paths.receiptDir, { recursive: true });
    return { dir, paths };
  };

  it("accepts only the pinned executable bound by its receipt", () => {
    expect(
      pluginProblem(
        {
          sha256: PIN.forge,
          receipt: {
            id: plugin.id,
            manifest: { executable: plugin.executable },
            files: [{ path: plugin.executable, sha256: PIN.forge }],
          },
        },
        plugin,
      ),
    ).toBe("");
    expect(pluginProblem({ sha256: null, receipt: null }, plugin)).toMatch(
      /missing/,
    );
    expect(
      pluginProblem({ sha256: "0".repeat(64), receipt: null }, plugin),
    ).toMatch(/pinned checksum/);
    expect(pluginProblem({ sha256: PIN.forge, receipt: null }, plugin)).toMatch(
      /receipt/,
    );
  });

  it("reads a plugin's executable hash and receipt from an ARCHON_HOME", () => {
    const { dir, paths } = home();
    expect(readPlugin(dir, plugin)).toEqual({ sha256: null, receipt: null });
    writeFileSync(paths.binary, "binary");
    writeFileSync(paths.receipt, JSON.stringify({ id: plugin.id }));
    const read = readPlugin(dir, plugin);
    expect(read.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(read.receipt).toEqual({ id: plugin.id });
    expect(paths.binary).toBe(`${dir}/plugins/${plugin.executable}`);
    expect(paths.receipt).toBe(
      `${dir}/plugins/installed/${plugin.id}/receipt.json`,
    );
  });
});

describe("every piece is verified before anything changes", () => {
  const section = (from: string, to: string) =>
    installer.slice(installer.indexOf(from), installer.indexOf(to));
  const verification = section("// --- Preflight", "// --- Layout");

  it("checks plugins, engine pieces, settings inputs, configuration and check slots before the layout", () => {
    expect(installer.indexOf("// --- Preflight")).toBeGreaterThan(0);
    for (const check of [
      "pluginProblem(",
      "enginePieceAction(",
      "managedPolicyFiles(",
      "validateConfig(",
      "legacyCheckSlots(",
      "liveWorkRefusal(",
    ])
      expect(verification).toContain(check);
  });

  it("adds missing plugins with the verified launcher into the temporary home, never into ARCHON_HOME", () => {
    expect(verification).toMatch(
      /asAdmin\(\[sourceArchon, \.\.\.plugin\.add\], \{ home: verifyHome, cwd: verifyHome \}\)/,
    );
    expect(installer).not.toMatch(/asAdmin\(\[ARCHON, \.\.\.plugin\.add\]/);
  });

  it("changes nothing but the temporary home until the layout", () => {
    const lines = verification.split("\n");
    const mutations = lines.filter(
      (line) =>
        /\b(mkdirSync|cpSync|copyFileSync|renameSync|writeFileSync|rmSync|chmodSync|chownSync|own|writeControl)\(/.test(
          line,
        ) || /run\("\/usr\/bin\/(chown|systemctl)"/.test(line),
    );
    expect(mutations.length).toBeGreaterThan(0);
    for (const line of mutations) expect(line).toContain("verifyHome");
    for (const line of lines.filter((entry) => entry.includes("asAdmin([")))
      expect(line).toMatch(
        /verifyHome|"state", "(list|get)"|\[CLAUDE, "auth", "status", "--json"\]/,
      );
  });

  it("copies an added plugin in only after the layout and checks it again in place", () => {
    const home = section("// --- ARCHON_HOME", "// --- Register");
    expect(home).toMatch(/pluginProblem\(readPlugin\(HOME, plugin\), plugin\)/);
  });
});
