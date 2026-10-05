import * as fs from "node:fs";
import path from "node:path";

import { afterEach, expect, it, vi } from "vitest";

// Audit attempts, including unsuccessful or caught writes. This is test
// instrumentation, not the execution sandbox required for independent review.
const audit = vi.hoisted(() => ({
  active: false,
  activeHome: "",
  writes: [] as string[],
  activeHomeReads: [] as string[],
  processes: [] as string[],
  installerCalls: 0,
}));

vi.mock("node:fs", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  const wrapped: Record<string, unknown> = { ...actual };
  const mutations =
    /^(?:appendFile|writeFile|write|writev|mkdir|mkdtemp|rename|rm|rmdir|unlink|copyFile|cp|link|symlink|chmod|chown|lchmod|lchown|fchmod|fchown|truncate|ftruncate|utimes|lutimes|futimes)(?:Sync)?$/;
  for (const [name, value] of Object.entries(actual)) {
    if (typeof value !== "function") continue;
    wrapped[name] = (...args: unknown[]) => {
      if (audit.active) {
        const flags = args[1];
        const writingOpen =
          /^open(?:Sync)?$/.test(name) &&
          (typeof flags === "string"
            ? /[wa+]/.test(flags)
            : typeof flags === "number" &&
              Boolean(
                flags &
                (actual.constants.O_WRONLY |
                  actual.constants.O_RDWR |
                  actual.constants.O_CREAT |
                  actual.constants.O_TRUNC |
                  actual.constants.O_APPEND),
              ));
        if (
          mutations.test(name) ||
          writingOpen ||
          name === "createWriteStream"
        ) {
          audit.writes.push(name);
          throw new Error(`Unexpected filesystem mutation: ${name}`);
        }
        if (String(args[0]).startsWith(audit.activeHome))
          audit.activeHomeReads.push(`${name}: ${String(args[0])}`);
      }
      return Reflect.apply(value, actual, args);
    };
  }
  wrapped.promises = (await import("node:fs/promises")).default;
  return { ...wrapped, default: wrapped };
});

vi.mock("node:fs/promises", async () => {
  const actual =
    await vi.importActual<typeof import("node:fs/promises")>(
      "node:fs/promises",
    );
  const wrapped: Record<string, unknown> = { ...actual };
  for (const name of [
    "appendFile",
    "writeFile",
    "mkdir",
    "mkdtemp",
    "rename",
    "rm",
    "rmdir",
    "unlink",
    "copyFile",
    "cp",
    "link",
    "symlink",
    "chmod",
    "chown",
    "truncate",
    "utimes",
    "lutimes",
  ]) {
    wrapped[name] = (...args: unknown[]) => {
      if (audit.active) {
        audit.writes.push(`promises.${name}`);
        throw new Error(`Unexpected filesystem mutation: ${name}`);
      }
      return Reflect.apply(
        actual[name as keyof typeof actual] as (...args: unknown[]) => unknown,
        actual,
        args,
      );
    };
  }
  // A hosted validator has no reason to obtain write-capable FileHandles.
  wrapped.open = (...args: unknown[]) => {
    if (
      audit.active &&
      args[1] !== undefined &&
      args[1] !== "r" &&
      args[1] !== 0
    ) {
      audit.writes.push("promises.open");
      throw new Error("Unexpected write-capable open");
    }
    if (audit.active && String(args[0]).startsWith(audit.activeHome))
      audit.activeHomeReads.push(`promises.open: ${String(args[0])}`);
    return Reflect.apply(actual.open, actual, args);
  };
  for (const name of [
    "readFile",
    "stat",
    "lstat",
    "realpath",
    "access",
    "readdir",
    "readlink",
  ] as const) {
    wrapped[name] = (...args: unknown[]) => {
      if (audit.active && String(args[0]).startsWith(audit.activeHome))
        audit.activeHomeReads.push(`promises.${name}: ${String(args[0])}`);
      return Reflect.apply(actual[name], actual, args);
    };
  }
  return { ...wrapped, default: wrapped };
});

vi.mock("../../../scripts/factory/install-native.mjs", () => ({
  installNative: () => {
    audit.installerCalls++;
    throw new Error("Hosted startup invoked the local installer");
  },
  runNativeCli: () => {
    audit.installerCalls++;
    throw new Error("Hosted startup invoked the installer CLI");
  },
}));

vi.mock("node:child_process", async () => {
  const actual =
    await vi.importActual<typeof import("node:child_process")>(
      "node:child_process",
    );
  const wrapped = { ...actual };
  for (const name of [
    "spawn",
    "spawnSync",
    "exec",
    "execSync",
    "execFile",
    "execFileSync",
    "fork",
  ] as const) {
    Object.assign(wrapped, {
      [name]: (...args: unknown[]) => {
        audit.processes.push(`${name}: ${String(args[0])}`);
        throw new Error(
          "Process execution must use the inspected execute seam",
        );
      },
    });
  }
  return { ...wrapped, default: wrapped };
});

const roles = ["samson", "ezra", "bezalel", "micaiah", "luke", "agabus"];
const nativeTools = [
  "collaboration.spawn_agent",
  "collaboration.followup_task",
  "collaboration.wait_agent",
  "update_plan",
];
const skillRelative = "docs/ai/skills/samson-factory/SKILL.md";
const protocolRelative = "docs/ai/skills/samson-factory/references/protocol.md";
const policy =
  "<!-- BEGIN Samson coordination policy -->\nSamson alone coordinates; specialists report their own role.\n<!-- END Samson coordination policy -->\n";
const roots: string[] = [];

function fixture() {
  // Even disposable fixture writes stay within the candidate checkout.
  const root = fs.mkdtempSync(
    path.join(process.cwd(), ".factory-hosted-test-"),
  );
  roots.push(root);
  const sourceRoot = path.join(root, "retained");
  const home = path.join(root, "personal");
  const workspaceRoot = path.join(root, "workspace");
  const activeHome = path.join(root, "runtime");
  function put(file: string, bytes: string) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
  function pair(relative: string, bytes: string) {
    put(path.join(sourceRoot, relative), bytes);
    const installed = relative.startsWith("docs/")
      ? relative.replace("docs/ai/skills/", ".agents/skills/")
      : relative;
    put(path.join(home, installed), bytes);
  }
  pair(
    skillRelative,
    "---\nname: samson-factory\ndescription: Coordinator-only hosted startup guidance.\n---\n# Samson\nValidate retained assets read-only.\n",
  );
  pair(
    protocolRelative,
    "# Native handoffs\nUse fresh own-role prompts and normal returns.\n",
  );
  for (const role of roles) {
    const identity = role[0].toUpperCase() + role.slice(1);
    pair(
      `.codex/agents/${role}.toml`,
      `model = "gpt-6.1-sol"\nmodel_reasoning_effort = "high"\ndeveloper_instructions = "You are ${identity}. Your only role is the assigned task."\n`,
    );
  }
  put(path.join(sourceRoot, ".codex/factory-AGENTS.md"), policy);
  put(
    path.join(workspaceRoot, "AGENTS.md"),
    `Personal workspace instructions\n${policy}`,
  );
  // No package.json/config.toml/.node-version exists in the retained package.
  return { root, sourceRoot, home, workspaceRoot, activeHome, pair, put };
}

type Fixture = ReturnType<typeof fixture>;

async function invoke(f: Fixture, overrides: Record<string, unknown> = {}) {
  const { validateHostedStartup } =
    await import("../../../scripts/factory/validate-hosted-startup.mjs");
  const actualProcess =
    await vi.importActual<typeof import("node:child_process")>(
      "node:child_process",
    );
  const { unavailable, ...optionsOverride } = overrides;
  const execute = (
    command: string,
    args: string[],
    options: Record<string, unknown>,
  ) => {
    audit.processes.push([command, ...args].join(" "));
    if (command === unavailable)
      return {
        status: null,
        stdout: "",
        stderr: "",
        error: new Error("ENOENT"),
      };
    if (
      command === "python3" &&
      args.includes("-B") &&
      args.includes("-c") &&
      args.some((arg) => arg.includes("tomllib"))
    ) {
      return actualProcess.spawnSync(command, args, {
        ...options,
        shell: false,
      });
    }
    const versions: Record<string, string> = {
      bash: "GNU bash, version 5.2.0\n",
      git: "git version 2.43.0\n",
      gh: "gh version 2.60.0\n",
      node: "v24.15.0\n",
      bun: "1.4.0\n",
      python3: "Python 3.11.0\n",
    };
    if (args.length !== 1 || args[0] !== "--version" || !(command in versions))
      throw new Error(`Uninspected process invocation: ${command}`);
    return { status: 0, stdout: versions[command], stderr: "" };
  };
  audit.activeHome = f.activeHome;
  vi.stubEnv("CODEX_HOME", f.activeHome);
  audit.active = true;
  try {
    return await validateHostedStartup({
      ...f,
      nativeTools,
      expectedNodeVersion: "24.15.0",
      expectedBunVersion: "1.4.0",
      execute,
      ...optionsOverride,
    });
  } finally {
    audit.active = false;
  }
}

afterEach(() => {
  audit.active = false;
  try {
    expect(audit.writes).toEqual([]);
    expect(audit.activeHomeReads).toEqual([]);
    expect(audit.installerCalls).toBe(0);
    expect(
      audit.processes.some((command) =>
        /install-native|setup-cloud|\bcodex\b|app-server/.test(command),
      ),
    ).toBe(false);
  } finally {
    audit.writes.length =
      audit.activeHomeReads.length =
      audit.processes.length =
        0;
    audit.installerCalls = 0;
    vi.unstubAllEnvs();
    for (const root of roots.splice(0)) {
      const runtime = path.join(root, "runtime");
      if (fs.existsSync(runtime)) fs.chmodSync(runtime, 0o755);
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
});

it.each(["absent", "read-only"])(
  "validates hosted startup with %s active CODEX_HOME without touching it",
  async (mode) => {
    const f = fixture();
    if (mode === "read-only") {
      fs.mkdirSync(f.activeHome);
      fs.chmodSync(f.activeHome, 0o555);
    }
    // The audit, rather than permissions/root privileges, proves zero attempts.
    await invoke(f);
  },
);

it.each([skillRelative, protocolRelative])(
  "blocks missing, empty or mismatched coordinator asset %s",
  async (relative) => {
    for (const invalid of [
      "missing-source",
      "missing-personal",
      "empty",
      "mismatch",
    ]) {
      const f = fixture();
      const installed = path.join(
        f.home,
        relative.replace("docs/ai/skills/", ".agents/skills/"),
      );
      if (invalid === "missing-source")
        fs.rmSync(path.join(f.sourceRoot, relative));
      else if (invalid === "missing-personal") fs.rmSync(installed);
      else if (invalid === "empty") f.pair(relative, "");
      else f.put(installed, "Unreviewed coordinator guidance\n");
      await expect(invoke(f)).rejects.toThrow(
        /BLOCKED.*(?:skill|protocol|coordinator|SKILL)/i,
      );
    }
  },
);

it.each([
  {
    defect: "wrong skill name",
    relative: skillRelative,
    bytes:
      "---\nname: unrelated-skill\ndescription: Coordinator guidance.\n---\n# Samson\nValidate retained assets read-only.\n",
  },
  {
    defect: "missing skill frontmatter",
    relative: skillRelative,
    bytes: "# Samson\nValidate retained assets read-only.\n",
  },
  {
    defect: "missing skill body heading",
    relative: skillRelative,
    bytes:
      "---\nname: samson-factory\ndescription: Coordinator guidance.\n---\nValidate retained assets read-only.\n",
  },
  {
    defect: "missing protocol heading",
    relative: protocolRelative,
    bytes: "Use fresh own-role prompts and normal returns.\n",
  },
])(
  "blocks matching nonempty coordinator assets with $defect",
  async ({ relative, bytes }) => {
    const f = fixture();
    // Both copies deliberately match: equality alone cannot establish validity.
    f.pair(relative, bytes);
    await expect(invoke(f)).rejects.toThrow(
      /BLOCKED.*(?:skill|protocol|coordinator|SKILL)/i,
    );
  },
);

it.each(roles)(
  "blocks missing, malformed, mismatched or misidentified %s role",
  async (role) => {
    for (const invalid of [
      "missing-source",
      "missing-personal",
      "malformed",
      "mismatch",
      "identity",
      "settings",
    ]) {
      const f = fixture();
      const relative = `.codex/agents/${role}.toml`;
      if (invalid === "missing-source")
        fs.rmSync(path.join(f.sourceRoot, relative));
      else if (invalid === "missing-personal")
        fs.rmSync(path.join(f.home, relative));
      else if (invalid === "malformed")
        f.pair(relative, 'model = "unterminated');
      else if (invalid === "mismatch")
        f.put(path.join(f.home, relative), 'model = "unreviewed"\n');
      else if (invalid === "identity")
        f.pair(
          relative,
          'model = "gpt-6.1-sol"\nmodel_reasoning_effort = "high"\ndeveloper_instructions = "You are SomeoneElse."\n',
        );
      else
        f.pair(
          relative,
          `model = ""\nmodel_reasoning_effort = ""\ndeveloper_instructions = "You are ${role}."\n`,
        );
      await expect(invoke(f)).rejects.toThrow(
        new RegExp(`BLOCKED.*${role}`, "i"),
      );
    }
  },
);

it.each(nativeTools)(
  "blocks unavailable registered tool %s",
  async (missing) => {
    await expect(
      invoke(fixture(), {
        nativeTools: nativeTools.filter((tool) => tool !== missing),
      }),
    ).rejects.toThrow(
      new RegExp(`BLOCKED.*${missing.replaceAll(".", "\\.")}`, "i"),
    );
  },
);

it.each(["bash", "git", "gh", "node", "bun", "python3"])(
  "blocks missing executable %s",
  async (missing) => {
    await expect(invoke(fixture(), { unavailable: missing })).rejects.toThrow(
      new RegExp(`BLOCKED.*${missing}`, "i"),
    );
  },
);

it.each(["node", "bun"])("blocks a version mismatch for %s", async (tool) => {
  await expect(
    invoke(fixture(), {
      [tool === "node" ? "expectedNodeVersion" : "expectedBunVersion"]:
        "99.0.0",
    }),
  ).rejects.toThrow(new RegExp(`BLOCKED.*${tool}`, "i"));
});

it.each(["expectedNodeVersion", "expectedBunVersion"])(
  "requires explicit reviewed pin %s",
  async (pin) => {
    await expect(invoke(fixture(), { [pin]: undefined })).rejects.toThrow(
      /BLOCKED.*(?:version|pin|Node|Bun)/i,
    );
  },
);

it.each(["missing", "malformed", "mismatch"])(
  "blocks %s workspace coordination policy",
  async (invalid) => {
    const f = fixture();
    const file = path.join(f.workspaceRoot, "AGENTS.md");
    if (invalid === "missing") fs.rmSync(file);
    else
      f.put(
        file,
        invalid === "malformed"
          ? "<!-- BEGIN Samson coordination policy -->\n"
          : policy.replace("Samson alone", "Anyone"),
      );
    await expect(invoke(f)).rejects.toThrow(
      /BLOCKED.*(?:policy|AGENTS|coordination)/i,
    );
  },
);
