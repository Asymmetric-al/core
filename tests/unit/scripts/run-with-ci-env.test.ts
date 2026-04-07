import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  loadLocalEnvFiles,
  parseEnvFile,
} from "../../../scripts/run-with-ci-env.mjs";

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
});
