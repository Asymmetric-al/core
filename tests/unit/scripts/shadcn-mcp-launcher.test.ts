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
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  SHADCN_MCP_PACKAGE,
  installedShadcnCli,
  registryEnvironment,
  shadcnMcpSpawnSpec,
} from "../../../scripts/shadcn/mcp.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const launcher = "scripts/shadcn/mcp.mjs";

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function components() {
  return JSON.parse(read("packages/ui/components.json"));
}

const studioParams = {
  email: "${SHADCN_STUDIO_EMAIL}",
  license_key: "${SHADCN_STUDIO_LICENSE_KEY}",
};

describe("shadcn MCP launcher", () => {
  const pinned = JSON.parse(read("package.json")).devDependencies.shadcn;
  const env = { SHADCN_STUDIO_EMAIL: "owner@example.test" };
  const options = {
    cwd: path.join(repoRoot, "packages/ui"),
    env,
    shell: false,
    stdio: "inherit",
  };

  it("takes its pin from the root devDependency", () => {
    expect(SHADCN_MCP_PACKAGE).toBe(`shadcn@${pinned}`);
  });

  it("runs the workspace-installed CLI from the components.json directory", () => {
    const entry = path.join(repoRoot, "node_modules/shadcn/dist/index.js");
    expect(
      shadcnMcpSpawnSpec({
        env,
        execPath: "/opt/bun/bin/bun",
        versions: { bun: "1.4.3" },
        installedCli: entry,
      }),
    ).toEqual({ command: "node", args: [entry, "mcp"], options });
  });

  it("falls back to bun x with the same pin before dependencies are installed", () => {
    expect(
      shadcnMcpSpawnSpec({
        env,
        execPath: "/opt/bun/bin/bun",
        versions: { bun: "1.4.3" },
        installedCli: null,
      }),
    ).toEqual({
      command: "/opt/bun/bin/bun",
      args: ["x", SHADCN_MCP_PACKAGE, "mcp"],
      options,
    });
  });

  it("falls back to bun on PATH when started by another runtime", () => {
    const spec = shadcnMcpSpawnSpec({
      env: {},
      execPath: "/usr/bin/node",
      versions: { node: "24.0.0" },
      installedCli: null,
    });

    expect(spec.command).toBe("bun");
    expect(spec.args).toEqual(["x", SHADCN_MCP_PACKAGE, "mcp"]);
  });
});

describe("installed shadcn CLI detection", () => {
  const pinned = JSON.parse(read("package.json")).devDependencies.shadcn;
  let fixture: string | undefined;

  afterEach(() => {
    if (fixture) rmSync(fixture, { recursive: true, force: true });
    fixture = undefined;
  });

  function installed(manifest: object, entryFile?: string) {
    fixture = mkdtempSync(path.join(os.tmpdir(), "shadcn-cli-"));
    writeFileSync(path.join(fixture, "package.json"), JSON.stringify(manifest));
    if (entryFile) {
      mkdirSync(path.dirname(path.join(fixture, entryFile)), {
        recursive: true,
      });
      writeFileSync(path.join(fixture, entryFile), "");
    }
    return fixture;
  }

  it("uses the declared bin in string or object form", () => {
    for (const bin of ["dist/cli.js", { shadcn: "dist/cli.js" }]) {
      const dir = installed({ version: pinned, bin }, "dist/cli.js");
      expect(installedShadcnCli(dir)).toBe(path.join(dir, "dist/cli.js"));
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects a stale version, a missing entry file, or no package", () => {
    expect(
      installedShadcnCli(installed({ version: "0.0.1", bin: "a.js" }, "a.js")),
    ).toBeNull();
    rmSync(fixture, { recursive: true, force: true });
    expect(
      installedShadcnCli(installed({ version: pinned, bin: "a.js" })),
    ).toBeNull();
    expect(installedShadcnCli(path.join(fixture!, "absent"))).toBeNull();
  });

  it.skipIf(!existsSync(path.join(repoRoot, "node_modules/shadcn")))(
    "resolves the real workspace install from its manifest",
    () => {
      const dir = path.join(repoRoot, "node_modules/shadcn");
      const { bin } = JSON.parse(
        readFileSync(path.join(dir, "package.json"), "utf8"),
      );
      const entry = path.join(dir, typeof bin === "string" ? bin : bin.shadcn);
      expect(installedShadcnCli()).toBe(entry);
      expect(existsSync(entry)).toBe(true);
    },
  );
});

describe("registry environment", () => {
  const components = JSON.stringify({
    style: "base-maia",
    registries: {
      "@a": { url: "https://a.test/{name}", params: { key: "${A_KEY}" } },
      "@b": { headers: { Authorization: "Bearer ${B_TOKEN}" } },
    },
  });

  it("fills only missing registry names from the root .env.local", () => {
    expect(
      registryEnvironment({
        env: { A_KEY: "from-env", PATH: "/bin" },
        envFile: 'A_KEY=from-file\nB_TOKEN="file token"\nSTRIPE_SECRET_KEY=x\n',
        components,
      }),
    ).toEqual({ A_KEY: "from-env", B_TOKEN: "file token", PATH: "/bin" });
  });

  it("passes the environment through when there is no .env.local", () => {
    const env = { A_KEY: "from-env" };
    expect(registryEnvironment({ env, envFile: null, components })).toEqual(
      env,
    );
  });

  it("is the shadcn entry for every agent client, never npx", () => {
    expect(JSON.parse(read(".mcp.json")).mcpServers.shadcn).toEqual({
      command: "bun",
      args: [launcher],
    });
    // Cursor documents no stdio cwd, so it passes the project root explicitly.
    expect(JSON.parse(read(".cursor/mcp.json")).mcpServers.shadcn).toEqual({
      command: "bun",
      args: [`\${workspaceFolder}/${launcher}`],
    });

    const codex = read(".codex/config.toml");
    const section = codex.match(
      /^\[mcp_servers\.shadcn\]\r?\n([\s\S]*?)(?=^\[)/m,
    );
    expect(section?.[1]).toMatch(/^command = "bun"$/m);
    expect(section?.[1].replace(/\s+/g, "")).toContain(`args=["${launcher}",]`);
    expect(section?.[1]).not.toMatch(/npx/);
  });

  it("gives Claude Code the same startup allowance as Codex for a cold bun x", () => {
    const codexSeconds = Number(
      read(".codex/config.toml")
        .match(/^\[mcp_servers\.shadcn\]\r?\n([\s\S]*?)(?=^\[)/m)?.[1]
        .match(/^startup_timeout_sec = (\d+)$/m)?.[1],
    );
    const claude = JSON.parse(read(".claude/settings.json"));

    expect(codexSeconds).toBeGreaterThanOrEqual(120);
    expect(Number(claude.env?.MCP_TIMEOUT)).toBe(codexSeconds * 1000);
  });
});

describe("shadcn Studio registries", () => {
  it("keeps the Maia style and every existing registry", () => {
    const config = components();

    expect(config.style).toBe("base-maia");
    expect(Object.keys(config.registries)).toEqual(
      expect.arrayContaining([
        "@shadcnblocks",
        "@ss-components",
        "@ss-themes",
        "@ss-blocks",
        "@efferd",
        "@reactbits-starter",
        "@reactbits-pro",
        "@shadcnuikit",
        "@reui",
      ]),
    );
  });

  it("adds the owner-specified Studio namespaces", () => {
    const { registries } = components();

    expect(registries["@shadcn-studio"]).toBe(
      "https://shadcnstudio.com/r/{style}/{name}.json",
    );
    expect(registries["@ss-pages"]).toEqual({
      url: "https://shadcnstudio.com/r/pages/{style}/{name}.json",
      params: studioParams,
    });
    expect(registries["@ss-illustrations"]).toEqual({
      url: "https://shadcnstudio.com/r/illustrations/{name}.json",
      params: studioParams,
    });
  });
});
