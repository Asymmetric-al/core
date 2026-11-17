import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

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

const HOSTED_RUNTIME_URL =
  "postgresql://cms_runtime.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";
const HOSTED_MIGRATION_URL =
  "postgresql://cms_owner.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";

type SpawnRecord = {
  command: string;
  args: string[];
  payloadDatabaseUri: string | null;
  hasMigrationUri: boolean;
};

function runCommand(args: string[], env: Record<string, string> = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "core-payload-command-"));
  temporaryRoots.push(root);
  const marker = path.join(root, "spawned.txt");
  const hook = path.join(root, "child-process-hook.mjs");
  writeFileSync(
    hook,
    `import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {appendFileSync} from 'node:fs';
childProcess.spawnSync=(command,args=[],options={})=>{
  const env=options.env??{};
  appendFileSync(process.env.CORE_CLI_SPAWN_MARKER,JSON.stringify({
    command,
    args,
    payloadDatabaseUri:env.PAYLOAD_DATABASE_URI??null,
    hasMigrationUri:'PAYLOAD_MIGRATION_DATABASE_URI' in env,
  })+String.fromCharCode(10));
  return {status:0,stdout:'{}',stderr:''};
};
syncBuiltinESMExports();
`,
  );

  const result = spawnSync(
    process.execPath,
    [
      "--import",
      pathToFileURL(hook).href,
      "scripts/cms/run-payload-command.mjs",
      ...args,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 15_000,
      env: {
        ...process.env,
        NODE_ENV: "test",
        PAYLOAD_DATABASE_URI: HOSTED_RUNTIME_URL,
        PAYLOAD_MIGRATION_DATABASE_URI: HOSTED_MIGRATION_URL,
        NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co",
        CMS_HOSTED_MIGRATION_REF: "",
        CMS_HOSTED_MIGRATION_ROLE: "",
        SUPABASE_DB_URL: "",
        PGHOSTADDR: "",
        PGSERVICE: "",
        CORE_CLI_SPAWN_MARKER: marker,
        ...env,
      },
    },
  );
  const spawns: SpawnRecord[] = existsSync(marker)
    ? readFileSync(marker, "utf8")
        .trim()
        .split(/\r?\n/)
        .map((line) => JSON.parse(line) as SpawnRecord)
    : [];
  const payloadSpawn = spawns.find((spawn) => spawn.args.includes("payload"));
  return { ...result, childSpawned: Boolean(payloadSpawn), payloadSpawn };
}

describe("Payload CLI migration preflight", () => {
  it.each([
    ["migrate"],
    ["--json", "migrate"],
    ["--no-json", "migrate:reset"],
    ["--cron", "0 * * * *", "migrate:fresh"],
    ["--cron=0 * * * *", "--json", "migrate:refresh"],
    ["--", "migrate:down"],
  ])("blocks unapproved hosted writes for argv %j", (...args) => {
    const result = runCommand(args);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("CMS_HOSTED_MIGRATION_REF");
    expect(result.childSpawned).toBe(false);
  });

  it.each([
    ["migrate:status"],
    ["--json", "migrate:status"],
    ["--no-json", "migrate:status"],
    ["--cron", "0 * * * *", "migrate:status"],
  ])(
    "allows a status check without hosted write approval for argv %j",
    (...args) => {
      const result = runCommand(args);
      expect(result.status, result.stderr).toBe(0);
      expect(result.childSpawned).toBe(true);
    },
  );

  it.each([
    ["MIGRATE"],
    ["--force-accept-warning=true", "migrate:fresh"],
    ["--config", "fixture.config.ts", "migrate"],
    ["--config=fixture.config.ts", "migrate:status"],
    ["--cron"],
    ["deleteDocuments", "--collection", "pages"],
    ["--json", "createDocuments", "--collection", "pages"],
    ["updateDocument", "--collection", "pages", "--id", "1"],
    ["run", "fixture.mjs"],
    ["jobs:run"],
  ])("rejects unsupported or unsafe wrapper arguments %j", (...args) => {
    const result = runCommand(args);
    expect(result.status, result.stderr).toBe(1);
    expect(result.childSpawned).toBe(false);
  });

  it("refuses a hosted migration without the cms_owner migration connection", () => {
    const result = runCommand(["migrate"], {
      PAYLOAD_MIGRATION_DATABASE_URI: "",
      CMS_HOSTED_MIGRATION_REF: "fixture",
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("PAYLOAD_MIGRATION_DATABASE_URI");
    expect(result.childSpawned).toBe(false);
  });

  it("migrates as cms_owner and hands Payload only that connection", () => {
    const result = runCommand(["migrate"], {
      CMS_HOSTED_MIGRATION_REF: "fixture",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.payloadSpawn?.payloadDatabaseUri).toBe(HOSTED_MIGRATION_URL);
    expect(result.payloadSpawn?.hasMigrationUri).toBe(false);
  });

  it("reads hosted status through the run-time connection when no migration connection is set", () => {
    const result = runCommand(["migrate:status"], {
      PAYLOAD_MIGRATION_DATABASE_URI: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.payloadSpawn?.payloadDatabaseUri).toBe(HOSTED_RUNTIME_URL);
  });

  it("migrates a loopback database as cms_owner without a password", () => {
    const result = runCommand(["migrate"], {
      PAYLOAD_DATABASE_URI:
        "postgresql://postgres:postgres@127.0.0.1:57432/wp12_fixture",
      PAYLOAD_MIGRATION_DATABASE_URI: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.payloadSpawn?.payloadDatabaseUri).toContain(
      "options=-c+role%3Dcms_owner",
    );
  });

  it("never migrates through the Core migration string", () => {
    const result = runCommand(["migrate"], {
      PAYLOAD_DATABASE_URI: "",
      PAYLOAD_MIGRATION_DATABASE_URI: "",
      SUPABASE_DB_URL: HOSTED_MIGRATION_URL.replace("cms_owner.", "postgres."),
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.payloadSpawn?.payloadDatabaseUri).toMatch(
      /^postgresql:\/\/postgres:postgres@127\.0\.0\.1:54322\/postgres\?/,
    );
  });
});
