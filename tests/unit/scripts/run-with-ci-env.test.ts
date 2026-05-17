import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  getSpawnCommand,
  loadLocalEnvFiles,
  normalizeEnvForCommand,
  parseEnvFile,
  shouldUseShellForCommand,
} from "../../../scripts/run-with-ci-env.mjs";
import { applyMissionControlCloudEnvDefaults } from "../../../scripts/dev/setup-mission-control-cloud.mjs";

const tempRoots: string[] = [];

async function createTempDir(prefix: string) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
  tempRoots.push(tempRoot);
  return tempRoot;
}

afterEach(async () => {
  for (const tempRoot of tempRoots.splice(0)) {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

describe("run-with-ci-env", () => {
  it("parses dotenv-style content with comments, quotes, and equals signs", () => {
    expect(
      parseEnvFile(
        [
          "# comment",
          "PLAIN=value",
          'DOUBLE_QUOTED=\"quoted value\"',
          "SINGLE_QUOTED='single value'",
          "WITH_EQUALS=left=right",
          "INVALID_LINE",
          "",
        ].join("\n"),
      ),
    ).toEqual({
      PLAIN: "value",
      DOUBLE_QUOTED: "quoted value",
      SINGLE_QUOTED: "single value",
      WITH_EQUALS: "left=right",
    });
  });

  it("falls back to manual env parsing when process.loadEnvFile is unavailable", async () => {
    const tempRoot = await createTempDir("run-with-ci-env");
    await mkdir(tempRoot, { recursive: true });
    await writeFile(
      path.join(tempRoot, ".env.local"),
      ["API_KEY=local-key", "QUOTED='hello world'"].join("\n"),
    );

    const env: Record<string, string> = {};
    loadLocalEnvFiles({ repoRoot: tempRoot, env, loadEnvFile: undefined });

    expect(env).toEqual({
      API_KEY: "local-key",
      QUOTED: "hello world",
    });
  });

  it("does not override existing env values and keeps .env.local precedence", async () => {
    const tempRoot = await createTempDir("run-with-ci-env-order");
    await writeFile(
      path.join(tempRoot, ".env.local"),
      ["EXISTING=local-should-win", "LOCAL_ONLY=", "SHARED=from-local"].join(
        "\n",
      ),
    );
    await writeFile(
      path.join(tempRoot, ".env"),
      [
        "EXISTING=env-should-not-win",
        "LOCAL_ONLY=env-fallback",
        "SHARED=env",
      ].join("\n"),
    );

    const env: Record<string, string> = { EXISTING: "already-set" };
    loadLocalEnvFiles({ repoRoot: tempRoot, env, loadEnvFile: undefined });

    expect(env.EXISTING).toBe("already-set");
    expect(env.LOCAL_ONLY).toBe("");
    expect(env.SHARED).toBe("from-local");
  });

  it("removes inherited NO_COLOR when launching Playwright", () => {
    const env = normalizeEnvForCommand(
      {
        FORCE_COLOR: "",
        NO_COLOR: "1",
      },
      ["node", "node_modules/@playwright/test/cli.js", "test"],
    );

    expect(env).toEqual({ FORCE_COLOR: "" });
  });

  it("uses a shell for Windows command shims but not native binaries", () => {
    expect(
      shouldUseShellForCommand("node_modules/.bin/turbo.cmd", "win32"),
    ).toBe(true);
    expect(shouldUseShellForCommand("scripts/run-check.bat", "win32")).toBe(
      true,
    );
    expect(shouldUseShellForCommand("node", "win32")).toBe(false);
    expect(shouldUseShellForCommand("node_modules/.bin/turbo", "linux")).toBe(
      false,
    );
  });

  it("wraps Windows command shims through cmd.exe", () => {
    const result = getSpawnCommand(
      "C:\\repo\\node_modules\\.bin\\turbo.cmd",
      ["run", "build", "--filter=!@asym/admin"],
      { platform: "win32", env: { ComSpec: "C:\\Windows\\System32\\cmd.exe" } },
    );

    expect(result).toEqual({
      command: "C:\\Windows\\System32\\cmd.exe",
      args: [
        "/d",
        "/s",
        "/c",
        "C:\\repo\\node_modules\\.bin\\turbo.cmd",
        "run",
        "build",
        "--filter=!@asym/admin",
      ],
    });
  });
});

describe("setup-mission-control-cloud", () => {
  it("adds Mission Control Cloud Agent defaults without overwriting real secrets or explicit auth bypass choices", () => {
    const result = applyMissionControlCloudEnvDefaults(
      [
        "NEXT_PUBLIC_SUPABASE_URL=https://real-project.supabase.co",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key",
        "E2E_AUTH_BYPASS=false",
      ].join("\n"),
    );

    expect(result.content).toContain(
      "NEXT_PUBLIC_SUPABASE_URL=https://real-project.supabase.co",
    );
    expect(result.content).toContain(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=example-anon-key",
    );
    expect(result.content).toContain("E2E_AUTH_BYPASS=false");
    expect(result.content).toContain(
      "PAYLOAD_SECRET=cloud-agent-mission-control-placeholder",
    );
    expect(result.preservedKeys).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(result.preservedKeys).toContain("E2E_AUTH_BYPASS");
    expect(result.changedKeys).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });

  it("can force auth bypass only when explicitly requested", () => {
    const result = applyMissionControlCloudEnvDefaults(
      "E2E_AUTH_BYPASS=false\n",
      undefined,
      { forceBypass: true },
    );

    expect(result.content).toContain("E2E_AUTH_BYPASS=true");
    expect(result.changedKeys).toContain("E2E_AUTH_BYPASS");
  });
});
