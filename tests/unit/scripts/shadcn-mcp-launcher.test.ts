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
  it("runs the pinned server through Bun from the components.json directory", () => {
    const env = { SHADCN_STUDIO_EMAIL: "owner@example.test" };
    const spec = shadcnMcpSpawnSpec({
      env,
      execPath: "/opt/bun/bin/bun",
      versions: { bun: "1.4.3" },
    });

    expect(spec).toEqual({
      command: "/opt/bun/bin/bun",
      args: ["x", SHADCN_MCP_PACKAGE, "mcp"],
      options: {
        cwd: path.join(repoRoot, "packages/ui"),
        env,
        shell: false,
        stdio: "inherit",
      },
    });
    expect(SHADCN_MCP_PACKAGE).toBe("shadcn@4.22.1");
  });

  it("falls back to bun on PATH when started by another runtime", () => {
    const spec = shadcnMcpSpawnSpec({
      env: {},
      execPath: "/usr/bin/node",
      versions: { node: "24.0.0" },
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
