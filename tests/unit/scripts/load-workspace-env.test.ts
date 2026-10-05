import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const requireFromRepo = createRequire(path.join(process.cwd(), "package.json"));
const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function loadAfterAppDirectory(override?: string) {
  const root = mkdtempSync(path.join(os.tmpdir(), "core-workspace-env-"));
  temporaryRoots.push(root);
  const app = path.join(root, "apps", "admin");
  mkdirSync(app, { recursive: true });
  writeFileSync(
    path.join(root, ".env.local"),
    "CORE_ENV_LOADER_FIXTURE=from-workspace\n",
  );
  writeFileSync(
    path.join(root, ".env.development"),
    "CORE_ENV_DEV_FIXTURE=development-value\n",
  );
  const source = `
    import { pathToFileURL } from 'node:url';
    const [app,root,nextEnvPath,loaderPath]=process.argv.slice(1);
    const {default: nextEnv}=await import(pathToFileURL(nextEnvPath));
    nextEnv.loadEnvConfig(app,true);
    const {loadWorkspaceEnvironment}=await import(pathToFileURL(loaderPath));
    loadWorkspaceEnvironment(root);
    console.log(JSON.stringify({value:process.env.CORE_ENV_LOADER_FIXTURE,development:process.env.CORE_ENV_DEV_FIXTURE,ambient:process.env.CORE_ENV_AMBIENT_FIXTURE}));
  `;
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      source,
      app,
      root,
      requireFromRepo.resolve("@next/env"),
      path.join(process.cwd(), "scripts/load-workspace-env.mjs"),
    ],
    {
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        NODE_ENV: "development",
        CORE_ENV_AMBIENT_FIXTURE: "keep-shell-value",
        ...(override ? { CORE_ENV_LOADER_FIXTURE: override } : {}),
      },
    },
  );
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout);
}

describe("workspace environment loading", () => {
  it("loads the workspace env after Next has cached an empty app directory", () => {
    expect(loadAfterAppDirectory()).toEqual({
      value: "from-workspace",
      development: "development-value",
      ambient: "keep-shell-value",
    });
  });

  it("preserves explicitly provided deployment or CI variables", () => {
    expect(loadAfterAppDirectory("provided-by-process")).toEqual({
      value: "provided-by-process",
      development: "development-value",
      ambient: "keep-shell-value",
    });
  });
});
