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

function fixture(consumption: "retained" | "mirror" = "retained") {
  // Even disposable fixture writes stay within the candidate checkout.
  const root = fs.mkdtempSync(
    path.join(process.cwd(), ".factory-hosted-test-"),
  );
  roots.push(root);
  const sourceRoot = path.join(root, "retained");
  const home = path.join(root, "personal");
  const workspaceRoot = path.join(root, "workspace");
  const activeHome = path.join(root, "runtime");
  const consumedRoleRoot =
    consumption === "retained"
      ? path.join(sourceRoot, ".codex/agents")
      : path.join(root, "observed-handoff-mirror");
  function put(file: string, bytes: string | Uint8Array) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
  function pair(relative: string, bytes: string) {
    put(path.join(sourceRoot, relative), bytes);
    if (relative.startsWith(".codex/agents/")) {
      put(path.join(consumedRoleRoot, path.basename(relative)), bytes);
      return;
    }
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
  return {
    root,
    sourceRoot,
    home,
    workspaceRoot,
    activeHome,
    consumedRoleRoot,
    pair,
    put,
  };
}

type Fixture = ReturnType<typeof fixture>;

async function invoke(
  f: Fixture,
  overrides: Record<string, unknown> & {
    parserFailure?: { command: "python3" | "bun"; stderr: string };
  } = {},
) {
  const { validateHostedStartup } =
    await import("../../../scripts/factory/validate-hosted-startup.mjs");
  const actualProcess =
    await vi.importActual<typeof import("node:child_process")>(
      "node:child_process",
    );
  const { unavailable, parserFailure, ...optionsOverride } = overrides;
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
      (command === "python3" &&
        args.includes("-B") &&
        args.includes("-c") &&
        args.some((arg) => arg.includes("tomllib"))) ||
      (command === "bun" &&
        args.length === 2 &&
        args[0] === "-e" &&
        args[1].includes("Bun.YAML.parse"))
    ) {
      if (parserFailure?.command === command)
        return { status: 1, stdout: "", stderr: parserFailure.stderr };
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

it.each(["retained", "mirror"] as const)(
  "validates the observed %s consumed role directory without personal role copies",
  async (consumption) => {
    const f = fixture(consumption);
    expect(fs.existsSync(path.join(f.home, ".codex/agents"))).toBe(false);
    const result = await invoke(f);
    const roleAssets = result.assets.filter((asset: { path: string }) =>
      asset.path.endsWith(".toml"),
    );
    expect(roleAssets).toHaveLength(6);
    for (const role of roles) {
      expect(roleAssets).toContainEqual({
        path: path.join(f.sourceRoot, ".codex/agents", `${role}.toml`),
        consumedPath: path.join(f.consumedRoleRoot, `${role}.toml`),
        sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      });
      expect(result.requestedRoleSettings[role]).toEqual({
        model: "gpt-6.1-sol",
        model_reasoning_effort: "high",
      });
    }
    expect(result.roleInstructions).toEqual({
      samson: "You are Samson. Your only role is the assigned task.",
      ezra: "You are Ezra. Your only role is the assigned task.",
      bezalel: "You are Bezalel. Your only role is the assigned task.",
      micaiah: "You are Micaiah. Your only role is the assigned task.",
      luke: "You are Luke. Your only role is the assigned task.",
      agabus: "You are Agabus. Your only role is the assigned task.",
    });
    expect(fs.existsSync(path.join(f.home, ".codex/agents"))).toBe(false);
  },
);

it.each([undefined, "", "   ", 17])(
  "blocks a missing or invalid explicit consumedRoleRoot: %s",
  async (consumedRoleRoot) => {
    await expect(invoke(fixture(), { consumedRoleRoot })).rejects.toThrow(
      /BLOCKED.*consumedRoleRoot/i,
    );
  },
);

it("returns the exact parsed handoff instructions and hash of the consumed bytes", async () => {
  const f = fixture("mirror");
  // Independently fixed SHA-256 of this literal TOML, including its final newline.
  // The handoff preserves the parsed instruction's trailing spaces and newline.
  const bytes =
    'model = "gpt-6.1-sol"\nmodel_reasoning_effort = "high"\ndeveloper_instructions = """\nYou are Ezra.\nKeep exact handoff whitespace.  \n"""\n';
  f.pair(".codex/agents/ezra.toml", bytes);
  const result = await invoke(f);
  expect(result.roleInstructions.ezra).toBe(
    "You are Ezra.\nKeep exact handoff whitespace.  \n",
  );
  expect(result.assets).toContainEqual({
    path: path.join(f.sourceRoot, ".codex/agents/ezra.toml"),
    consumedPath: path.join(f.consumedRoleRoot, "ezra.toml"),
    sha256: "1424ce66741876a2717c6caae9dbb8c2383f5cdd116d75c8f570cf15700846e4",
  });
});

it("ignores stale personal roles that explicit handoffs do not consume", async () => {
  const f = fixture("mirror");
  for (const role of roles)
    f.put(
      path.join(f.home, ".codex/agents", `${role}.toml`),
      "stale malformed TOML",
    );
  const result = await invoke(f);
  expect(result.roleInstructions.ezra).toBe(
    "You are Ezra. Your only role is the assigned task.",
  );
  for (const role of roles)
    expect(
      fs.readFileSync(
        path.join(f.home, ".codex/agents", `${role}.toml`),
        "utf8",
      ),
    ).toBe("stale malformed TOML");
});

it("compares personal roles when the supported loader actually consumes that directory", async () => {
  const f = fixture("mirror");
  const personalRoleRoot = path.join(f.home, ".codex/agents");
  for (const role of roles)
    f.put(
      path.join(personalRoleRoot, `${role}.toml`),
      fs.readFileSync(path.join(f.consumedRoleRoot, `${role}.toml`)),
    );
  const result = await invoke(f, { consumedRoleRoot: personalRoleRoot });
  expect(result.assets).toContainEqual({
    path: path.join(f.sourceRoot, ".codex/agents/ezra.toml"),
    consumedPath: path.join(personalRoleRoot, "ezra.toml"),
    sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
  });
  f.put(path.join(personalRoleRoot, "ezra.toml"), 'model = "unreviewed"\n');
  await expect(
    invoke(f, { consumedRoleRoot: personalRoleRoot }),
  ).rejects.toThrow(/BLOCKED.*ezra/i);
  fs.rmSync(path.join(personalRoleRoot, "ezra.toml"));
  await expect(
    invoke(f, { consumedRoleRoot: personalRoleRoot }),
  ).rejects.toThrow(/BLOCKED.*ezra/i);
});

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
    defect: "syntactically malformed skill YAML",
    relative: skillRelative,
    bytes:
      "---\nname: samson-factory\ndescription: [unterminated\n---\n# Samson\nValidate retained assets read-only.\n",
  },
  {
    defect: "missing required skill description",
    relative: skillRelative,
    bytes:
      "---\nname: samson-factory\n---\n# Samson\nValidate retained assets read-only.\n",
  },
  {
    defect: "empty required skill description",
    relative: skillRelative,
    bytes:
      '---\nname: samson-factory\ndescription: ""\n---\n# Samson\nValidate retained assets read-only.\n',
  },
  {
    defect: "whitespace-only required skill description",
    relative: skillRelative,
    bytes:
      '---\nname: samson-factory\ndescription: "   "\n---\n# Samson\nValidate retained assets read-only.\n',
  },
  {
    defect: "non-string required skill description",
    relative: skillRelative,
    bytes:
      "---\nname: samson-factory\ndescription: [Coordinator guidance]\n---\n# Samson\nValidate retained assets read-only.\n",
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
  "blocks missing or drifted source/consumed %s role",
  async (role) => {
    for (const target of ["source", "consumed"])
      for (const defect of ["missing", "drift", "empty", "invalid-utf8"]) {
        const f = fixture("mirror");
        const file = path.join(
          target === "source"
            ? path.join(f.sourceRoot, ".codex/agents")
            : f.consumedRoleRoot,
          `${role}.toml`,
        );
        if (defect === "missing") fs.rmSync(file);
        else if (defect === "empty") f.put(file, " \n");
        else if (defect === "invalid-utf8") f.put(file, Uint8Array.of(0xff));
        else
          // Still valid TOML with the same identity/settings: content drift blocks.
          f.put(file, fs.readFileSync(file, "utf8") + "# unreviewed drift\n");
        await expect(invoke(f)).rejects.toThrow(
          new RegExp(`BLOCKED.*${role}`, "i"),
        );
      }
  },
);

it.each(roles)(
  "blocks matching source/consumed %s roles with invalid TOML, identity or own settings",
  async (role) => {
    const valid = {
      model: '"gpt-6.1-sol"',
      model_reasoning_effort: '"high"',
      developer_instructions: `"You are ${role}. Your only role is the assigned task."`,
    };
    const invalid: (string | Uint8Array)[] = [
      'model = "unterminated',
      "",
      " \n",
      Uint8Array.of(0xff),
      'model = "gpt-6.1-sol"\nmodel_reasoning_effort = "high"\ndeveloper_instructions = "You are SomeoneElse."\n',
    ];
    for (const key of Object.keys(valid)) {
      for (const value of [undefined, '""', '"   "', "17", "true", "[]"]) {
        const fields: Record<string, string | undefined> = {
          ...valid,
          [key]: value,
        };
        invalid.push(
          Object.entries(fields)
            .filter(([, entry]) => entry !== undefined)
            .map(([name, entry]) => `${name} = ${entry}`)
            .join("\n") + "\n",
        );
      }
    }
    for (const bytes of invalid) {
      const f = fixture("mirror");
      f.put(path.join(f.sourceRoot, ".codex/agents", `${role}.toml`), bytes);
      f.put(path.join(f.consumedRoleRoot, `${role}.toml`), bytes);
      await expect(invoke(f)).rejects.toThrow(
        new RegExp(`BLOCKED.*${role}`, "i"),
      );
    }
  },
);

it.each(
  roles.flatMap((role) =>
    ["-Samson", "/Samson"].map((suffix) => ({ role, suffix })),
  ),
)(
  "blocks a suffixed own-role identity for $role with $suffix",
  async ({ role, suffix }) => {
    const f = fixture("mirror");
    const identity = role[0].toUpperCase() + role.slice(1);
    // Reviewed/consumed bytes match and settings are valid. Only the claimed
    // identity is wrong: a regex word boundary also matches '-' and '/'.
    f.pair(
      `.codex/agents/${role}.toml`,
      `model = "gpt-6.1-sol"\nmodel_reasoning_effort = "high"\ndeveloper_instructions = "You are ${identity}${suffix}. Your only role is the assigned task."\n`,
    );
    await expect(invoke(f)).rejects.toThrow(
      new RegExp(`BLOCKED.*${role}.*identity`, "i"),
    );
  },
);

it.each(
  roles.flatMap((role) =>
    [
      { delimiter: "period", ending: ". Your only role is the assigned task." },
      { delimiter: "comma", ending: ", your only role is the assigned task." },
      {
        delimiter: "whitespace",
        ending: " Your only role is the assigned task.",
      },
      { delimiter: "end", ending: "" },
    ].map((punctuation) => ({ role, ...punctuation })),
  ),
)(
  "preserves exact own-role instructions for $role with a $delimiter delimiter",
  async ({ role, ending }) => {
    const f = fixture("mirror");
    const identity = role[0].toUpperCase() + role.slice(1);
    const instructions = `You are ${identity}${ending}`;
    f.pair(
      `.codex/agents/${role}.toml`,
      `model = "gpt-6.1-sol"\nmodel_reasoning_effort = "high"\ndeveloper_instructions = ${JSON.stringify(instructions)}\n`,
    );
    const result = await invoke(f);
    expect(result.roleInstructions[role]).toBe(instructions);
    expect(result.requestedRoleSettings[role]).toEqual({
      model: "gpt-6.1-sol",
      model_reasoning_effort: "high",
    });
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

it.each([
  "ModuleNotFoundError: No module named 'tomllib'\n",
  "Python 3.11 or later is required\n",
])("explains a stderr-only Python parser failure: %s", async (stderr) => {
  await expect(
    invoke(fixture(), { parserFailure: { command: "python3", stderr } }),
  ).rejects.toThrow(/BLOCKED.*python3.*(?:3\.11.*tomllib|tomllib.*3\.11)/i);
});

it.each(["python3", "bun"] as const)(
  "%s parser failure diagnostics do not disclose supplied stderr metadata",
  async (command) => {
    const f = fixture();
    const marker = "PRIVATE_RETAINED_INPUT_FIXTURE_1955";
    if (command === "bun")
      f.pair(
        skillRelative,
        `---\nname: samson-factory\ndescription: ${marker}\n---\n# Samson\nValidate retained assets read-only.\n`,
      );
    else
      f.pair(
        ".codex/agents/samson.toml",
        `model = "gpt-6.1-sol"\nmodel_reasoning_effort = "high"\ndeveloper_instructions = "You are Samson. ${marker}"\n`,
      );
    async function message(stderr: string) {
      try {
        await invoke(f, { parserFailure: { command, stderr } });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const text = (error as Error).message;
        expect(text).toMatch(/BLOCKED/);
        expect(text).toContain(command);
        return text;
      }
      throw new Error("Expected hosted startup to block on parser failure");
    }
    const generic = await message("Parser failed\n");
    const privateInput = await message(
      `Parser failed while reading description: ${marker}\n`,
    );
    expect(privateInput).not.toContain(marker);
    expect(privateInput).toBe(generic);
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
