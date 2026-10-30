import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  SHADCN_MCP_PACKAGE,
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
    expect(
      shadcnMcpSpawnSpec({
        env,
        execPath: "/opt/bun/bin/bun",
        versions: { bun: "1.4.3" },
        installedVersion: pinned,
      }),
    ).toEqual({
      command: "node",
      args: [path.join(repoRoot, "node_modules/shadcn/dist/index.js"), "mcp"],
      options,
    });
  });

  it("falls back to bun x with the same pin before dependencies are installed", () => {
    expect(
      shadcnMcpSpawnSpec({
        env,
        execPath: "/opt/bun/bin/bun",
        versions: { bun: "1.4.3" },
        installedVersion: null,
      }),
    ).toEqual({
      command: "/opt/bun/bin/bun",
      args: ["x", SHADCN_MCP_PACKAGE, "mcp"],
      options,
    });
  });

  it("never runs a stale workspace install", () => {
    const spec = shadcnMcpSpawnSpec({
      env,
      execPath: "/opt/bun/bin/bun",
      versions: { bun: "1.4.3" },
      installedVersion: "0.0.1",
    });

    expect(spec.args).toEqual(["x", SHADCN_MCP_PACKAGE, "mcp"]);
  });

  it("falls back to bun on PATH when started by another runtime", () => {
    const spec = shadcnMcpSpawnSpec({
      env: {},
      execPath: "/usr/bin/node",
      versions: { node: "24.0.0" },
      installedVersion: null,
    });

    expect(spec.command).toBe("bun");
    expect(spec.args).toEqual(["x", SHADCN_MCP_PACKAGE, "mcp"]);
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
