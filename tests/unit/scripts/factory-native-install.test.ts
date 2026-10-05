import {
  chmodSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, expect, it } from "vitest";

import { installNative } from "../../../scripts/factory/install-native.mjs";

const itPosix = process.platform === "win32" ? it.skip : it;

const roots: string[] = [];
function fixture() {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "factory-native-")),
  );
  roots.push(root);
  const sourceRoot = path.join(root, "source");
  const home = path.join(root, "home");
  const codexHome = path.join(root, "alternate");
  function put(relative: string, bytes: string | Buffer) {
    const file = path.join(sourceRoot, relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, bytes);
  }
  put(
    ".codex/config.toml",
    '# unrelated source setting\n# BEGIN Samson native role configuration\n[agents]\nmax_threads = 3\n[agents.builder]\nconfig_file = "agents/builder.toml"\n# END Samson native role configuration\n',
  );
  put(
    ".codex/agents/builder.toml",
    Buffer.from([35, 32, 114, 111, 108, 101, 13, 10]),
  );
  put(
    ".codex/factory-AGENTS.md",
    "<!-- BEGIN Samson coordination policy -->\nGeneric policy\n<!-- END Samson coordination policy -->\n",
  );
  put("docs/ai/skills/samson-factory/SKILL.md", "Generic skill\r\n");
  put(
    "docs/ai/skills/samson-factory/references/protocol.md",
    "Generic protocol\n",
  );
  put("package.json", JSON.stringify({ packageManager: "bun@1.2.3" }));
  return { sourceRoot, home, codexHome, put };
}
function snapshot(
  root: string,
): Record<string, { bytes: string; mtime: number }> {
  const result: Record<string, { bytes: string; mtime: number }> = {};
  function visit(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(file);
      else
        result[path.relative(root, file)] = {
          bytes: readFileSync(file).toString("base64"),
          mtime: statSync(file).mtimeMs,
        };
    }
  }
  visit(root);
  return result;
}
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

it("installs generic native roles in both homes and copies exact skill bytes without changing source", () => {
  const f = fixture();
  const before = snapshot(f.sourceRoot);
  installNative(f);
  for (const destination of [path.join(f.home, ".codex"), f.codexHome]) {
    expect(
      readFileSync(path.join(destination, "config.toml"), "utf8"),
    ).toContain(
      `config_file = ${JSON.stringify(path.join(destination, "agents/builder.toml"))}`,
    );
    expect(readFileSync(path.join(destination, "agents/builder.toml"))).toEqual(
      readFileSync(path.join(f.sourceRoot, ".codex/agents/builder.toml")),
    );
    expect(readFileSync(path.join(destination, "AGENTS.md"), "utf8")).toContain(
      "Generic policy",
    );
  }
  expect(
    readFileSync(
      path.join(f.home, ".agents/skills/samson-factory/SKILL.md"),
      "utf8",
    ),
  ).toBe("Generic skill\r\n");
  expect(
    readFileSync(
      path.join(f.home, ".agents/skills/samson-factory/references/protocol.md"),
      "utf8",
    ),
  ).toBe("Generic protocol\n");
  expect(snapshot(f.sourceRoot)).toEqual(before);
});

it("preserves unrelated config and policy while replacing only owned blocks", () => {
  const f = fixture();
  mkdirSync(f.codexHome, { recursive: true });
  writeFileSync(
    path.join(f.codexHome, "config.toml"),
    'model = "personal"\n# BEGIN Samson native role configuration\n[agents.old]\nconfig_file = "old.toml"\n# END Samson native role configuration\n[other]\nvalue = 7\n',
  );
  writeFileSync(
    path.join(f.codexHome, "AGENTS.md"),
    "Personal policy\n<!-- BEGIN Samson coordination policy -->\nOld policy\n<!-- END Samson coordination policy -->\nTrailing policy\n",
  );
  installNative(f);
  const config = readFileSync(path.join(f.codexHome, "config.toml"), "utf8");
  expect(config).toMatch(/^model = "personal"\n/);
  expect(config).toMatch(/\n\[other\]\nvalue = 7\n$/);
  expect(config).not.toContain("old.toml");
  expect(readFileSync(path.join(f.codexHome, "AGENTS.md"), "utf8")).toBe(
    "Personal policy\n<!-- BEGIN Samson coordination policy -->\nGeneric policy\n<!-- END Samson coordination policy -->\nTrailing policy\n",
  );
});

it("rejects unmanaged, malformed or missing assets before writing either home", () => {
  for (const invalid of [
    '[agents.personal]\nconfig_file = "mine.toml"\n',
    "agents.max_threads = 4\n",
    "# BEGIN Samson native role configuration\n",
    "# END Samson native role configuration\n# BEGIN Samson native role configuration\n",
    "# BEGIN Samson native role configuration\n# BEGIN Samson native role configuration\n# END Samson native role configuration\n",
  ]) {
    const f = fixture();
    mkdirSync(f.codexHome, { recursive: true });
    writeFileSync(path.join(f.codexHome, "config.toml"), invalid);
    const before = snapshot(path.dirname(f.sourceRoot));
    expect(() => installNative(f)).toThrow(/Unmanaged|Malformed/);
    expect(snapshot(path.dirname(f.sourceRoot))).toEqual(before);
  }
  const f = fixture();
  rmSync(
    path.join(
      f.sourceRoot,
      "docs/ai/skills/samson-factory/references/protocol.md",
    ),
  );
  const before = snapshot(path.dirname(f.sourceRoot));
  expect(() => installNative(f)).toThrow(/Missing skill asset/);
  expect(snapshot(path.dirname(f.sourceRoot))).toEqual(before);
});

it("deduplicates the same home and leaves bytes and mtimes identical on second install", () => {
  const f = fixture();
  f.codexHome = path.join(f.home, ".codex");
  expect(installNative(f).destinations).toEqual([f.codexHome]);
  const before = snapshot(f.home);
  expect(installNative(f).changedFiles).toEqual([]);
  expect(snapshot(f.home)).toEqual(before);
});

it("verifies read-only and rejects drift in owned config, role, policy and skill files", () => {
  const f = fixture();
  const absent = snapshot(path.dirname(f.sourceRoot));
  expect(() => installNative({ ...f, verify: true })).toThrow(/drift/);
  expect(snapshot(path.dirname(f.sourceRoot))).toEqual(absent);
  installNative(f);
  const clean = snapshot(f.home);
  installNative({ ...f, verify: true });
  expect(snapshot(f.home)).toEqual(clean);
  for (const file of [
    path.join(f.home, ".codex/config.toml"),
    path.join(f.home, ".codex/AGENTS.md"),
    path.join(f.home, ".codex/agents/builder.toml"),
    path.join(f.home, ".agents/skills/samson-factory/SKILL.md"),
  ]) {
    const original = readFileSync(file);
    writeFileSync(
      file,
      original
        .toString()
        .replace(
          /max_threads = 3|Generic policy|Generic skill|# role/,
          (match) =>
            match === "max_threads = 3"
              ? "max_threads = 4"
              : match === "# role"
                ? "# changed"
                : "changed",
        ),
    );
    const before = snapshot(f.home);
    expect(() => installNative({ ...f, verify: true })).toThrow(/drift/);
    expect(snapshot(f.home)).toEqual(before);
    writeFileSync(file, original);
  }
});

it("enforces setup mode boundaries and the manifest-pinned frozen Bun installation", async () => {
  const { runSetupCloud } =
    await import("../../../scripts/factory/setup-cloud.mjs");
  const f = fixture();
  const commands: string[][] = [];
  const execute = (command: string, args: string[]) => {
    commands.push([command, ...args]);
    return { status: 0, stdout: "1.2.3\n" };
  };
  runSetupCloud({ ...f, args: ["--install-only"], execute });
  expect(commands).toEqual([]);
  const before = snapshot(f.home);
  runSetupCloud({ ...f, args: ["--verify-only"], execute });
  expect(commands).toEqual([
    ["bun", "--version"],
    ["bun", "run", "verify:bun-version"],
    ["bun", "run", "verify:bun-lock-drift"],
    ["bun", "run", "skills:verify"],
    ["bun", "run", "verify:workspace-contract"],
  ]);
  expect(snapshot(f.home)).toEqual(before);
  commands.length = 0;
  runSetupCloud({ ...f, args: [], execute });
  expect(commands).toEqual([
    ["bun", "--version"],
    ["bun", "ci", "--backend=copyfile"],
    ["bun", "run", "verify:bun-version"],
    ["bun", "run", "verify:bun-lock-drift"],
    ["bun", "run", "skills:verify"],
    ["bun", "run", "verify:workspace-contract"],
  ]);
  for (const args of [
    ["--unknown"],
    ["--verify-only", "--install-only"],
    ["--install-only", "--install-only"],
  ]) {
    expect(() => runSetupCloud({ ...f, args, execute })).toThrow(/Unsupported/);
  }
  const fresh = fixture();
  const untouched = snapshot(path.dirname(fresh.sourceRoot));
  expect(() =>
    runSetupCloud({
      ...fresh,
      execute: () => ({ status: 0, stdout: "9.9.9\n" }),
    }),
  ).toThrow(/Bun 1.2.3/);
  expect(snapshot(path.dirname(fresh.sourceRoot))).toEqual(untouched);
  writeFileSync(
    path.join(f.home, ".agents/skills/samson-factory/SKILL.md"),
    "drift",
  );
  const drift = snapshot(f.home);
  expect(() =>
    runSetupCloud({ ...f, args: ["--verify-only"], execute }),
  ).toThrow(/drift/);
  expect(snapshot(f.home)).toEqual(drift);
});

it("refuses read-only readiness when repository manifests have lock drift", async () => {
  const { runSetupCloud } =
    await import("../../../scripts/factory/setup-cloud.mjs");
  const { findBunLockDrift } =
    await import("../../../scripts/verify/bun-lock-drift.mjs");
  const f = fixture();
  f.put(
    "package.json",
    JSON.stringify({
      packageManager: "bun@1.2.3",
      dependencies: { example: "^2.0.0" },
    }),
  );
  f.put(
    "bun.lock",
    JSON.stringify({
      lockfileVersion: 1,
      workspaces: { "": { dependencies: { example: "^1.0.0" } } },
    }),
  );
  installNative(f);
  const before = snapshot(path.dirname(f.sourceRoot));
  const violations = await findBunLockDrift(f.sourceRoot);
  expect(violations).toEqual([
    'package.json: dependencies "example" specifier drift: manifest has "^2.0.0", bun.lock workspaces[""] has "^1.0.0"',
  ]);
  expect(() =>
    runSetupCloud({
      ...f,
      args: ["--verify-only"],
      execute: (_command: string, args: string[]) => ({
        status: args.join(" ") === "run verify:bun-lock-drift" ? 1 : 0,
        stdout: "1.2.3\n",
      }),
    }),
  ).toThrow(/verify:bun-lock-drift/);
  expect(snapshot(path.dirname(f.sourceRoot))).toEqual(before);
});

it("provides a direct installer entry point with read-only verification and strict flags", async () => {
  const { runNativeCli } =
    await import("../../../scripts/factory/install-native.mjs");
  const f = fixture();
  const absent = snapshot(path.dirname(f.sourceRoot));
  expect(() => runNativeCli({ ...f, args: ["--verify-only"] })).toThrow(
    /drift/,
  );
  expect(snapshot(path.dirname(f.sourceRoot))).toEqual(absent);
  runNativeCli({ ...f, args: [] });
  const before = snapshot(f.home);
  runNativeCli({ ...f, args: ["--verify-only"] });
  expect(snapshot(f.home)).toEqual(before);
  expect(() => runNativeCli({ ...f, args: ["--unsupported"] })).toThrow(
    /Unsupported/,
  );
  expect(snapshot(f.home)).toEqual(before);
});

it("rejects syntactically malformed source, role and destination TOML before any writes", () => {
  for (const location of ["source", "role", "home", "alternate"]) {
    const f = fixture();
    const file =
      location === "source"
        ? path.join(f.sourceRoot, ".codex/config.toml")
        : location === "role"
          ? path.join(f.sourceRoot, ".codex/agents/builder.toml")
          : path.join(
              location === "home" ? path.join(f.home, ".codex") : f.codexHome,
              "config.toml",
            );
    mkdirSync(path.dirname(file), { recursive: true });
    if (location === "source")
      writeFileSync(file, readFileSync(file, "utf8") + 'model = "unterminated');
    else writeFileSync(file, 'model = "unterminated');
    const before = snapshot(path.dirname(f.sourceRoot));
    expect(() => installNative(f)).toThrow(/Invalid TOML/);
    expect(snapshot(path.dirname(f.sourceRoot))).toEqual(before);
  }
});

it("plans a missing installation without writes and validates merged TOML before installation", async () => {
  const { runNativeCli } =
    await import("../../../scripts/factory/install-native.mjs");
  const f = fixture();
  const before = snapshot(path.dirname(f.sourceRoot));
  const planned = installNative({ ...f, planOnly: true });
  expect(planned.destinations).toEqual([
    path.join(f.home, ".codex"),
    f.codexHome,
  ]);
  expect(planned.changedFiles).toContain(path.join(f.codexHome, "config.toml"));
  expect(snapshot(path.dirname(f.sourceRoot))).toEqual(before);
  expect(runNativeCli({ ...f, args: ["--plan-only"] })).toEqual(planned);
  expect(snapshot(path.dirname(f.sourceRoot))).toEqual(before);
  mkdirSync(f.codexHome, { recursive: true });
  writeFileSync(
    path.join(f.codexHome, "config.toml"),
    '# BEGIN Samson native role configuration\n[features]\nenabled = true\n# END Samson native role configuration\nconfig_file = "personal.toml"\n',
  );
  const invalid = snapshot(path.dirname(f.sourceRoot));
  expect(() => installNative({ ...f, planOnly: true })).toThrow(/Invalid TOML/);
  expect(snapshot(path.dirname(f.sourceRoot))).toEqual(invalid);
});

it("keeps original bytes and cleans staging files when atomic writes or renames fail", () => {
  for (const failure of ["write", "rename"]) {
    const f = fixture();
    installNative(f);
    const destination = path.join(f.home, ".codex/config.toml");
    chmodSync(destination, 0o640);
    f.put(
      ".codex/config.toml",
      readFileSync(
        path.join(f.sourceRoot, ".codex/config.toml"),
        "utf8",
      ).replace("max_threads = 3", "max_threads = 4"),
    );
    const before = snapshot(f.home);
    const atomicIO = {
      writeFileSync(file: string, bytes: Buffer) {
        if (failure === "write") {
          writeFileSync(file, bytes.subarray(0, 3));
          throw new Error("Injected write failure");
        }
        writeFileSync(file, bytes);
      },
      renameSync(from: string, to: string) {
        if (failure === "rename") throw new Error("Injected rename failure");
        renameSync(from, to);
      },
    };
    expect(() => installNative({ ...f, atomicIO })).toThrow(/Injected/);
    expect(snapshot(f.home)).toEqual(before);
    if (process.platform !== "win32")
      expect(statSync(destination).mode & 0o777).toBe(0o640);
    expect(readdirSync(path.dirname(destination)).sort()).toEqual([
      "AGENTS.md",
      "agents",
      "config.toml",
    ]);
  }
});

itPosix("preserves existing permissions when replacing changed files", () => {
  const f = fixture();
  installNative(f);
  const config = path.join(f.home, ".codex/config.toml");
  const skill = path.join(f.home, ".agents/skills/samson-factory/SKILL.md");
  chmodSync(config, 0o640);
  chmodSync(skill, 0o600);
  f.put(
    ".codex/config.toml",
    readFileSync(path.join(f.sourceRoot, ".codex/config.toml"), "utf8").replace(
      "max_threads = 3",
      "max_threads = 4",
    ),
  );
  f.put("docs/ai/skills/samson-factory/SKILL.md", "Changed skill\n");
  installNative(f);
  expect(readFileSync(config, "utf8")).toContain("max_threads = 4");
  expect(readFileSync(skill, "utf8")).toBe("Changed skill\n");
  expect(statSync(config).mode & 0o777).toBe(0o640);
  expect(statSync(skill).mode & 0o777).toBe(0o600);
});

itPosix(
  "rejects destination symlinks before writing either home and keeps the binding",
  () => {
    const f = fixture();
    mkdirSync(f.codexHome, { recursive: true });
    const target = path.join(
      path.dirname(f.sourceRoot),
      "personal-config.toml",
    );
    writeFileSync(target, 'model = "personal"\n');
    const destination = path.join(f.codexHome, "config.toml");
    symlinkSync(target, destination);
    const before = snapshot(path.dirname(f.sourceRoot));
    expect(() => installNative(f)).toThrow(/symlink/i);
    expect(snapshot(path.dirname(f.sourceRoot))).toEqual(before);
    expect(lstatSync(destination).isSymbolicLink()).toBe(true);
  },
);

itPosix(
  "preserves parent directory symlinks while atomically installing their files",
  () => {
    const f = fixture();
    const target = path.join(path.dirname(f.sourceRoot), "personal-codex");
    mkdirSync(target, { recursive: true });
    writeFileSync(path.join(target, "config.toml"), 'model = "personal"\n');
    chmodSync(path.join(target, "config.toml"), 0o640);
    symlinkSync(target, f.codexHome, "dir");
    installNative(f);
    expect(lstatSync(f.codexHome).isSymbolicLink()).toBe(true);
    expect(readFileSync(path.join(target, "config.toml"), "utf8")).toMatch(
      /^model = "personal"\n/,
    );
    expect(readFileSync(path.join(target, "config.toml"), "utf8")).toContain(
      "max_threads = 3",
    );
    expect(statSync(path.join(target, "config.toml")).mode & 0o777).toBe(0o640);
    expect(readdirSync(target).sort()).toEqual([
      "AGENTS.md",
      "agents",
      "config.toml",
    ]);
    expect(installNative(f).changedFiles).toEqual([]);
  },
);

itPosix(
  "deduplicates directory aliases so install, verify and repeat install agree without rewriting",
  () => {
    const f = fixture();
    const target = path.join(f.home, ".codex");
    mkdirSync(target, { recursive: true });
    symlinkSync(target, f.codexHome, "dir");
    const installed = installNative(f);
    expect(installed.destinations).toEqual([target]);
    expect(readFileSync(path.join(f.codexHome, "config.toml"))).toEqual(
      readFileSync(path.join(target, "config.toml")),
    );
    expect(readFileSync(path.join(target, "config.toml"), "utf8")).toContain(
      `config_file = ${JSON.stringify(path.join(target, "agents/builder.toml"))}`,
    );
    const before = snapshot(f.home);
    expect(installNative({ ...f, verify: true }).changedFiles).toEqual([]);
    expect(installNative(f).changedFiles).toEqual([]);
    expect(snapshot(f.home)).toEqual(before);
    expect(lstatSync(f.codexHome).isSymbolicLink()).toBe(true);
  },
);

itPosix(
  "rejects dangling directory aliases before writes in install, plan and verify modes",
  () => {
    const f = fixture();
    const missingTarget = path.join(
      path.dirname(f.sourceRoot),
      "missing-target",
    );
    symlinkSync(missingTarget, f.codexHome, "dir");
    const before = snapshot(f.sourceRoot);
    for (const mode of [{}, { planOnly: true }, { verify: true }]) {
      expect(() => installNative({ ...f, ...mode })).toThrow(
        /dangling|directory alias/i,
      );
      expect(snapshot(f.sourceRoot)).toEqual(before);
      expect(() => statSync(f.home)).toThrow();
      expect(() => statSync(missingTarget)).toThrow();
      expect(lstatSync(f.codexHome).isSymbolicLink()).toBe(true);
    }
  },
);

itPosix(
  "resolves aliases through existing parents without creating a missing destination during plan or verify",
  () => {
    const f = fixture();
    mkdirSync(f.home, { recursive: true });
    const alias = path.join(path.dirname(f.sourceRoot), "alias-home");
    symlinkSync(f.home, alias, "dir");
    f.codexHome = path.join(alias, ".codex");
    const planned = installNative({ ...f, planOnly: true });
    expect(planned.destinations).toEqual([path.join(f.home, ".codex")]);
    expect(snapshot(f.home)).toEqual({});
    expect(readdirSync(f.home)).toEqual([]);
    expect(() => installNative({ ...f, verify: true })).toThrow(/drift/);
    expect(readdirSync(f.home)).toEqual([]);
    expect(installNative(f).destinations).toEqual(planned.destinations);
    expect(installNative({ ...f, verify: true }).changedFiles).toEqual([]);
    expect(lstatSync(alias).isSymbolicLink()).toBe(true);
  },
);
