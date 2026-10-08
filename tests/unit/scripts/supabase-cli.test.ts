import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const roots = new Set<string>();
const wrapper = path.resolve("scripts/supabase-cli.mjs");

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots.clear();
});

function dispatch(env: Record<string, string> = {}, args = ["db", "--help"]) {
  const root = mkdtempSync(path.join(tmpdir(), "core-supabase-dispatch-"));
  roots.add(root);
  const log = path.join(root, "commands.jsonl");
  for (const command of ["supabase", "npx"]) {
    writeFileSync(
      path.join(root, command),
      `#!${process.execPath}
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.TEST_COMMAND_LOG, JSON.stringify({ command: ${JSON.stringify(command)}, args }) + "\\n");
if (${JSON.stringify(command)} === "supabase" && args[0] === "--version") {
  console.log(process.env.TEST_GLOBAL_VERSION || "2.120.0");
  process.exit(Number(process.env.TEST_PROBE_STATUS || 0));
}
process.exit(Number(process.env.TEST_DISPATCH_STATUS || 0));
`,
      { mode: 0o755 },
    );
  }
  const result = spawnSync(process.execPath, [wrapper, ...args], {
    cwd: root,
    env: { PATH: root, TEST_COMMAND_LOG: log, ...env },
    encoding: "utf8",
  });
  const commands = readFileSync(log, "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as { command: string; args: string[] });
  return { result, commands };
}

describe.skipIf(process.platform === "win32")("Supabase CLI dispatch", () => {
  it("uses an exact matching global CLI and preserves arguments", () => {
    const { result, commands } = dispatch();
    expect(result.status).toBe(0);
    expect(commands).toEqual([
      { command: "supabase", args: ["--version"] },
      { command: "supabase", args: ["db", "--help"] },
    ]);
  });

  it.each(["2.76.12", "2.121.0", "2.120.0-beta.1"])(
    "selects the reviewed version when global CLI reports %s",
    (version) => {
      const { result, commands } = dispatch({ TEST_GLOBAL_VERSION: version });
      expect(result.status).toBe(0);
      expect(commands[1]).toEqual({
        command: "npx",
        args: ["-y", "supabase@2.120.0", "db", "--help"],
      });
    },
  );

  it("falls back when the global version probe fails", () => {
    const { commands } = dispatch({ TEST_PROBE_STATUS: "1" });
    expect(commands[1].command).toBe("npx");
  });

  it("forced pinned dispatch skips the global probe and preserves exit status", () => {
    const { result, commands } = dispatch({
      SUPABASE_CLI_FORCE_PINNED: "1",
      TEST_DISPATCH_STATUS: "19",
    });
    expect(result.status).toBe(19);
    expect(commands).toEqual([
      {
        command: "npx",
        args: ["-y", "supabase@2.120.0", "db", "--help"],
      },
    ]);
  });

  it("honors an explicit version override without accepting another global version", () => {
    const { commands } = dispatch({ SUPABASE_CLI_VERSION: " 2.119.1 " });
    expect(commands[1].args[1]).toBe("supabase@2.119.1");
  });
});
