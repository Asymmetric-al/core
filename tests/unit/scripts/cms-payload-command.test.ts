import { spawnSync } from "node:child_process";
import { mkdtempSync, existsSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    if (
      !path.resolve(root).startsWith(`${path.resolve(os.tmpdir())}${path.sep}`)
    ) {
      throw new Error("Unexpected CLI fixture directory");
    }
    rmSync(root, { recursive: true, force: true });
  }
});

function runCommand(args: string[]) {
  const root = mkdtempSync(path.join(os.tmpdir(), "core-payload-command-"));
  temporaryRoots.push(root);
  const marker = path.join(root, "spawned.txt");
  const hook = path.join(root, "child-process-hook.mjs");
  writeFileSync(
    hook,
    `import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {writeFileSync} from 'node:fs';
childProcess.spawnSync=()=>{
  writeFileSync(process.env.CORE_CLI_SPAWN_MARKER,'spawned');
  return {status:0,stdout:'{}',stderr:''};
};
syncBuiltinESMExports();
`,
  );

  const result = spawnSync(
    process.execPath,
    ["--import", hook, "scripts/cms/run-payload-command.mjs", ...args],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 15_000,
      env: {
        ...process.env,
        NODE_ENV: "test",
        PAYLOAD_DATABASE_URI:
          "postgresql://postgres.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
        NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co",
        CMS_HOSTED_MIGRATION_REF: "",
        PGHOSTADDR: "",
        PGSERVICE: "",
        CORE_CLI_SPAWN_MARKER: marker,
      },
    },
  );
  return { ...result, childSpawned: existsSync(marker) };
}

describe("Payload CLI migration preflight", () => {
  it.each([
    ["migrate"],
    ["MIGRATE"],
    ["--force-accept-warning=true", "migrate:fresh"],
    ["--config", "fixture.config.ts", "migrate"],
    ["--", "migrate:down"],
  ])("blocks unapproved hosted writes for argv %j", (...args) => {
    const result = runCommand(args);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("CMS_HOSTED_MIGRATION_REF");
    expect(result.childSpawned).toBe(false);
  });

  it("allows a status check without hosted write approval", () => {
    const result = runCommand(["--config=fixture.config.ts", "migrate:status"]);
    expect(result.status, result.stderr).toBe(0);
    expect(result.childSpawned).toBe(true);
  });
});
