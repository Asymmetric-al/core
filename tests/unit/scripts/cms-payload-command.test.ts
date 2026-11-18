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
  "postgresql://cms_owner.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=verify-full";
/** The project's CA, as the release job hands it to the runner (L6, L7). */
const CA_ENV = {
  PAYLOAD_DATABASE_SSL_CA:
    "-----BEGIN CERTIFICATE-----\nfixture\n-----END CERTIFICATE-----",
  PGSSLROOTCERT: "/tmp/fixture-root.crt",
};

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
const realSpawnSync=childProcess.spawnSync;
childProcess.spawnSync=(command,args=[],options={})=>{
  // A test's fake psql runs for real, so the marker it reports is read.
  if(process.env.PSQL_BIN&&command===process.env.PSQL_BIN)return realSpawnSync(command,args,options);
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
    // Review M2: a status read on a hosted address passes the same hosted
    // check as a migration; it used to read through the cms_owner login
    // unchecked.
    "refuses a hosted status check without the hosted approval for argv %j",
    (...args) => {
      const result = runCommand(args);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("CMS_HOSTED_MIGRATION_REF");
      expect(result.childSpawned).toBe(false);
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
      ...CA_ENV,
      CMS_HOSTED_MIGRATION_REF: "fixture",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.payloadSpawn?.payloadDatabaseUri).toBe(HOSTED_MIGRATION_URL);
    expect(result.payloadSpawn?.hasMigrationUri).toBe(false);
  });

  // Review L7: the runner refuses a hosted migration that would not check the
  // server's certificate and host name, before Payload starts.
  it.each([
    [
      "sslmode=require",
      {
        ...CA_ENV,
        PAYLOAD_MIGRATION_DATABASE_URI: HOSTED_MIGRATION_URL.replace(
          "verify-full",
          "require",
        ),
      },
      "sslmode=verify-full",
    ],
    [
      "sslmode=no-verify",
      {
        ...CA_ENV,
        PAYLOAD_MIGRATION_DATABASE_URI: HOSTED_MIGRATION_URL.replace(
          "verify-full",
          "no-verify",
        ),
      },
      "sslmode=verify-full",
    ],
    [
      "no CA",
      { PAYLOAD_DATABASE_SSL_CA: "", PGSSLROOTCERT: "" },
      "PAYLOAD_DATABASE_SSL_CA",
    ],
  ])(
    "refuses a hosted migration with %s, and never starts Payload",
    (_case, env, words) => {
      const result = runCommand(["migrate"], {
        CMS_HOSTED_MIGRATION_REF: "fixture",
        ...env,
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(words);
      expect(result.childSpawned).toBe(false);
    },
  );

  // Review M2: every command handed an address that is not on this machine
  // goes through the hosted check, verify-full and the CA included.
  it.each([
    [
      "a status read through the run-time connection",
      ["migrate:status"],
      {
        PAYLOAD_MIGRATION_DATABASE_URI: "",
        CMS_HOSTED_MIGRATION_REF: "fixture",
      },
    ],
    [
      "a status read at require, approved",
      ["migrate:status"],
      {
        ...CA_ENV,
        CMS_HOSTED_MIGRATION_REF: "fixture",
        PAYLOAD_MIGRATION_DATABASE_URI: HOSTED_MIGRATION_URL.replace(
          "verify-full",
          "require",
        ),
      },
    ],
    [
      "a status read with no CA, approved",
      ["migrate:status"],
      {
        CMS_HOSTED_MIGRATION_REF: "fixture",
        PAYLOAD_DATABASE_SSL_CA: "",
        PGSSLROOTCERT: "",
      },
    ],
    [
      "the import map on the run-time connection",
      ["generate:importmap"],
      { PAYLOAD_MIGRATION_DATABASE_URI: "" },
    ],
  ])(
    "refuses %s on a hosted address, and never starts Payload",
    (_case, args, env) => {
      const result = runCommand(args, env);
      expect(result.status).toBe(1);
      expect(result.childSpawned).toBe(false);
    },
  );

  it("reads hosted status only through the checked cms_owner connection", () => {
    const result = runCommand(["migrate:status"], {
      ...CA_ENV,
      CMS_HOSTED_MIGRATION_REF: "fixture",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.payloadSpawn?.payloadDatabaseUri).toBe(HOSTED_MIGRATION_URL);
  });

  it.each([["migrate:status"], ["generate:importmap"]])(
    "leaves %s on this machine as it was",
    (command) => {
      const result = runCommand([command], {
        PAYLOAD_DATABASE_URI:
          "postgresql://postgres:postgres@127.0.0.1:57432/wp12_fixture",
        PAYLOAD_MIGRATION_DATABASE_URI: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.childSpawned).toBe(true);
    },
  );

  it("migrates a loopback database as cms_owner without a password", () => {
    const result = runCommand(["migrate"], {
      PAYLOAD_DATABASE_URI:
        "postgresql://postgres:postgres@127.0.0.1:57432/wp12_fixture",
      PAYLOAD_MIGRATION_DATABASE_URI: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.payloadSpawn?.payloadDatabaseUri).toContain(
      "options=-c%20role%3Dcms_owner",
    );
  });

  // Council round 2, A7c. The fake psql answers as Postgres would: a session
  // that runs as cms_owner (`options=-c role=cms_owner`) has no USAGE on
  // platform, so it cannot read the marker at all.
  describe.skipIf(process.platform === "win32")(
    "rollbacks and resets read the marker without the cms_owner session role",
    () => {
      function fakePsql(marker: string) {
        const root = mkdtempSync(path.join(os.tmpdir(), "core-payload-psql-"));
        temporaryRoots.push(root);
        const bin = path.join(root, "psql");
        writeFileSync(
          bin,
          `#!${process.execPath}
const [connection] = process.argv.slice(2);
const sql = process.argv.at(-1);
if (/[?&]options=[^&]*role/.test(connection)) {
  process.stderr.write("ERROR:  permission denied for schema platform\\n");
  process.exit(1);
}
process.stdout.write(sql.includes("to_regprocedure") ? "t\\n" : ${JSON.stringify(marker)} + "\\n");
`,
          { mode: 0o755 },
        );
        return bin;
      }
      const LOOPBACK =
        "postgresql://postgres:postgres@127.0.0.1:5432/payload_fixture";

      it.each([
        "migrate:down",
        "migrate:reset",
        "migrate:fresh",
        "migrate:refresh",
      ])(
        "%s runs on a loopback database marked disposable, as cms_owner",
        (command) => {
          const result = runCommand([command], {
            PAYLOAD_DATABASE_URI: LOOPBACK,
            PAYLOAD_MIGRATION_DATABASE_URI: "",
            PSQL_BIN: fakePsql("disposable"),
          });
          expect(result.status, result.stderr).toBe(0);
          expect(result.payloadSpawn?.args).toContain(command);
          expect(result.payloadSpawn?.payloadDatabaseUri).toContain(
            "options=-c%20role%3Dcms_owner",
          );
        },
      );

      it.each(["shared", "production"])(
        "refuses a rollback on a loopback database marked %s",
        (marker) => {
          const result = runCommand(["migrate:down"], {
            PAYLOAD_DATABASE_URI: LOOPBACK,
            PAYLOAD_MIGRATION_DATABASE_URI: "",
            PSQL_BIN: fakePsql(marker),
          });
          expect(result.status).toBe(1);
          expect(result.stderr).toContain(
            `refusing to run payload migrate:down on 127.0.0.1:5432/payload_fixture: it is marked ${marker}`,
          );
          expect(result.childSpawned).toBe(false);
        },
      );
    },
  );

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
