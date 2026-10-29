import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

function readRepoFile(path: string) {
  return readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8");
}

// npm 11 (bundled with the pinned Node 24.22.1) refuses to run `npx` anywhere
// in Core: the root `overrides.sharp` pin conflicts with the direct dependency
// (EOVERRIDE). bunx does not apply npm overrides, so shadcn MCP launchers use it.
const pinnedShadcn = JSON.parse(readRepoFile("package.json")).devDependencies
  .shadcn;
const expectedLauncher = {
  command: "bunx",
  args: [`shadcn@${pinnedShadcn}`, "mcp"],
};

function codexServer(name: string) {
  const section = readRepoFile(".codex/config.toml")
    .split(/^\[/m)
    .find((block) => block.startsWith(`mcp_servers.${name}]`));
  if (!section) throw new Error(`missing [mcp_servers.${name}]`);
  const argsBlock = section.match(/^args = \[([^\]]*)\]/m)?.[1] ?? "";
  return {
    command: section.match(/^command = "([^"]+)"/m)?.[1],
    args: [...argsBlock.matchAll(/"([^"]*)"/g)].map((match) => match[1]),
  };
}

describe("shadcn MCP launchers", () => {
  it.each([".mcp.json", ".cursor/mcp.json"])(
    "%s launches the pinned shadcn through bunx",
    (file) => {
      const { command, args } = JSON.parse(readRepoFile(file)).mcpServers
        .shadcn;
      expect({ command, args }).toEqual(expectedLauncher);
    },
  );

  it(".codex/config.toml launches the pinned shadcn through bunx", () => {
    expect(codexServer("shadcn")).toEqual(expectedLauncher);
  });
});
