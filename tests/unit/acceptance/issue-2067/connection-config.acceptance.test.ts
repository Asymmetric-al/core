/**
 * Acceptance tests for PR #2169 (#2067) MAJOR-1: the gate must validate the
 * PARSED `pg` connection config, not the URL text.
 * Rulings (Samson, factory lead): {@link https://github.com/Asymmetric-al/core/pull/2169#issuecomment-6311002194}
 * items 2 (MAJOR-1) and 5 (MINOR-4). Addendum 4:
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * The fake `pg` (./fake-postgres.ts) resolves every connection with the real
 * driver's `ConnectionParameters`, so `?user=` / `?host=` / `?options=` and
 * `PG*` fallbacks take effect as in production; `fakePg.connectAttempts`
 * records each `connect()` with the effective parameters and the fields a
 * `PG*` variable influenced.
 *
 * - (a) Any query parameter other than `sslmode` (the whole allowlist —
 *   follow-up ruling 1, {@link https://github.com/Asymmetric-al/core/pull/2169#issuecomment-6311237350})
 *   is a blocker before any connect attempt, no proof; that includes
 *   `application_name`, `connect_timeout` and `sslrootcert`. The control uses
 *   `?sslmode=require`.
 * - (b) A non-empty host is required, and PG* variables are never used: with
 *   every variable the driver reads set to a distinctive value, the effective
 *   connection is identical to the one without them, and no distinctive value
 *   reaches the connection or the output. A URL that leaves host, port or
 *   database to the driver's defaults is rejected before connecting
 *   (follow-up ruling 3: host, port, database and user must all come from the
 *   URL), as is a Unix socket-path host (follow-up ruling 4). Real
 *   subprocesses check the same with a TCP listener standing in for the
 *   PGHOST/PGPORT target.
 * - (c) Both `session_user` and `current_user` must be the reader (incl. a
 *   SET ROLE session: current_user = reader, session_user = postgres); a
 *   session_user failure names `session_user` (follow-up ruling 5).
 * - (d) Messages that say PG* variables are never used/read stay true.
 * - Round 3 ({@link https://github.com/Asymmetric-al/core/pull/2169#issuecomment-6312557456}):
 *   (1) a non-loopback reader URL with no sslmode, or sslmode disable, allow,
 *   prefer or no-verify, is a STOP before connecting; the gate never passes
 *   `ssl: false` to pg for it; require, verify-ca and verify-full connect;
 *   loopback may omit sslmode. (3) `[::1]` is loopback or rejected clearly,
 *   never ENOTFOUND; an empty host and a multi-host URL get their own
 *   accurate blockers (keywords pinned, see below); anon and
 *   pg_execute_server_program are privileged roles.
 * - (f) PRIVILEGED_ROLES covers authenticated, pg_read_all_data,
 *   pg_write_all_data, dashboard_user and every supabase_*_admin role
 *   (follow-up ruling 2), statically and by behaviour.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_TARGET_URL,
  REPO_ROOT,
  cleanTarget,
  cleanupProofFiles,
  decisionArgs,
  hostedTargetEnv,
  listProofFiles,
  markedStatement,
  newProofFiles,
  proofRunMarker,
  runCommand,
} from "./command-harness";
import { READER_ROLE } from "./document-cutover-contract";
import { fakePg } from "./fake-postgres";
import { scriptedAllowlist } from "./scripted-allowlist";
import { InMemoryDocumentCutoverProofStore } from "../../../../packages/api/src/document-cutover";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);
vi.mock("pg", async () => (await import("./fake-postgres")).mockPgModule());
vi.mock("node:fs", async (importOriginal) =>
  (await import("./scripted-allowlist")).mockFs(await importOriginal()),
);
vi.mock("node:fs/promises", async (importOriginal) =>
  (await import("./scripted-allowlist")).mockFsPromises(await importOriginal()),
);

const GATE_SOURCE = "scripts/document-cutover/assess-document-cutover.ts";
const REF = "acceptance2067major1ref";
const OWNER = { id: "acceptance-2067-major1-owner", role: "platform_owner" };
const POOLER_HOST = "aws-0-us-east-1.pooler.supabase.com";
/** Runtime-built fake password; never a real credential. */
const PASSWORD = ["acceptance", "2067", "major1", "not", "a", "pw"].join("-");
const LOGIN = `${READER_ROLE}.${REF}`;

/** A pooler URL for the hosted target; `rest` is everything after the host. */
const poolerUrl = (rest = ":6543/postgres") =>
  `postgresql://${LOGIN}:${PASSWORD}@${POOLER_HOST}${rest}`;

/** The control URL: host, port and database explicit, only allowlisted params. */
const CONTROL_URL = poolerUrl(":6543/postgres?sslmode=require");

const marker = (label: string) =>
  ["acc2067", "pgenv", label, Math.random().toString(36).slice(2, 8)].join("-");

/** Every PG* variable pg 8.x reads, set to distinctive values. */
function distinctivePgEnv(): Record<string, string> {
  return {
    PGHOST: `${marker("host")}.invalid`,
    PGPORT: "6999",
    PGDATABASE: marker("database"),
    PGUSER: "postgres",
    PGPASSWORD: marker("password"),
    PGOPTIONS: `-c role=postgres -c application_name=${marker("options")}`,
    PGSSLMODE: "disable",
    PGAPPNAME: marker("appname"),
    PGCONNECT_TIMEOUT: "77",
    PGCLIENT_ENCODING: "SQL_ASCII",
    PGBINARY: "true",
    PGREPLICATION: "database",
  };
}

const URL_BLOCKER = /DOCUMENT_CUTOVER_DATABASE_URL/;

afterEach(() => {
  scriptedAllowlist.text = null;
  vi.restoreAllMocks();
  cleanupProofFiles();
});

/** Runs `--decision go` on the hosted target; `setup` runs after the fakes reset. */
async function go(env: Record<string, string>, setup?: () => void) {
  scriptedAllowlist.text = JSON.stringify({
    owners: [OWNER],
    nonProductionProjects: [REF],
  });
  cleanTarget();
  setup?.();
  const runMarker = proofRunMarker();
  const before = listProofFiles();
  const store = new InMemoryDocumentCutoverProofStore();
  const result = await runCommand({
    argv: decisionArgs("go", OWNER, markedStatement(runMarker)),
    env: { ...hostedTargetEnv(REF), ...env },
    store,
  });
  return {
    exitCode: result.exitCode,
    output: `${result.stdout}\n${result.stderr}`,
    stored: await store.list(),
    files: newProofFiles(before, runMarker),
  };
}

function expectRejectedBeforeConnecting(run: Awaited<ReturnType<typeof go>>) {
  expect(run.exitCode, run.output).not.toBe(0);
  expect(run.output).toMatch(URL_BLOCKER);
  expect(fakePg.connectAttempts).toEqual([]);
  expect(run.stored).toEqual([]);
  expect(run.files).toEqual([]);
}

function expectNoPgEnvInfluence(
  run: Awaited<ReturnType<typeof go>>,
  pgEnv: Record<string, string>,
) {
  const leaks = fakePg.connectAttempts.flatMap((attempt) =>
    attempt.pgEnvInfluence.map(
      (field) => `${field}=${String(attempt.effective?.[field])}`,
    ),
  );
  expect(leaks, "connection fields taken from PG* variables").toEqual([]);
  const carried = JSON.stringify(
    fakePg.connectAttempts.map((attempt) => attempt.effective),
  );
  const distinctive = Object.entries(pgEnv)
    .filter(([key]) =>
      ["PGHOST", "PGDATABASE", "PGPASSWORD", "PGOPTIONS", "PGAPPNAME"].includes(
        key,
      ),
    )
    .map(([, value]) => value);
  expect(
    distinctive.filter(
      (value) => carried.includes(value) || run.output.includes(value),
    ),
  ).toEqual([]);
}

describe("PR #2169 MAJOR-1 (a) — query parameters on the reader URL", () => {
  it("control: a pooler URL with explicit host, port, database and only ?sslmode=require records one clean proof; the driver connects to that host as the reader", async () => {
    const run = await go({ DOCUMENT_CUTOVER_DATABASE_URL: CONTROL_URL });
    expect(run.exitCode, run.output).toBe(0);
    expect(run.stored).toHaveLength(1);
    expect(run.stored[0]?.outcome).toBe("clean_preproduction_proof");
    expect(fakePg.connectAttempts.length).toBeGreaterThan(0);
    for (const attempt of fakePg.connectAttempts) {
      expect(attempt.effective?.host).toBe(POOLER_HOST);
      expect(attempt.effective?.port).toBe(6543);
      expect(attempt.effective?.database).toBe("postgres");
      expect(attempt.effective?.user).toBe(LOGIN);
    }
  });

  it.each([
    ["user", "user=postgres"],
    ["user (percent-encoded key)", "%75ser=postgres"],
    ["host", "host=127.0.0.1"],
    ["host (empty value)", "host="],
    ["hostaddr", "hostaddr=127.0.0.1"],
    ["port", "port=5432"],
    ["dbname", "dbname=postgres"],
    ["database", "database=postgres"],
    ["password", "password=other"],
    ["options", "options=-c%20role%3Dpostgres"],
    ["options (upper-case key)", "OPTIONS=-c%20role%3Dpostgres"],
    ["service", "service=acceptance"],
    ["passfile", "passfile=/tmp/acceptance-pgpass"],
    ["replication", "replication=database"],
    ["client_encoding", "client_encoding=SQL_ASCII"],
    ["fallback_application_name", "fallback_application_name=x"],
    ["unknown key", "acceptance_unknown_param=1"],
    // Follow-up ruling 1: sslmode is the whole allowlist.
    ["application_name", "application_name=acceptance"],
    ["connect_timeout", "connect_timeout=5"],
    ["sslrootcert", "sslrootcert=/tmp/acceptance-root.crt"],
    ["sslcert", "sslcert=/tmp/acceptance.crt"],
    ["sslkey", "sslkey=/tmp/acceptance.key"],
    ["ssl", "ssl=true"],
    ["uselibpqcompat", "uselibpqcompat=true"],
  ])(
    "rejects ?%s before connecting (blocker, no connect attempt, no proof)",
    async (_label, param) => {
      const run = await go({
        DOCUMENT_CUTOVER_DATABASE_URL: poolerUrl(
          `:6543/postgres?sslmode=require&${param}`,
        ),
      });
      expectRejectedBeforeConnecting(run);
    },
  );
});

describe("PR #2169 MAJOR-1 (b) — non-empty host; PG* variables are never used", () => {
  it.each([
    ["empty host", () => `postgresql://${LOGIN}:${PASSWORD}@/postgres`],
    [
      "empty host, host only in the query",
      () =>
        `postgresql://${LOGIN}:${PASSWORD}@/postgres?host=${POOLER_HOST}&port=6543`,
    ],
    [
      "no authority at all (postgresql:///db)",
      () => `postgresql:///postgres?user=${LOGIN}&password=${PASSWORD}`,
    ],
  ])(
    "%s is rejected before connecting, even with PGHOST/PGPORT/PGDATABASE/PGUSER set",
    async (_label, url) => {
      const run = await go({
        ...distinctivePgEnv(),
        DOCUMENT_CUTOVER_DATABASE_URL: url(),
      });
      expectRejectedBeforeConnecting(run);
    },
  );

  it.each(Object.keys(distinctivePgEnv()))(
    "control URL with %s set to a distinctive value: still one clean proof, and the effective pg connection is identical to the one without it",
    async (key) => {
      const pgEnv = { [key]: distinctivePgEnv()[key] as string };
      const run = await go({
        ...pgEnv,
        DOCUMENT_CUTOVER_DATABASE_URL: CONTROL_URL,
      });
      expect(run.exitCode, run.output).toBe(0);
      expect(run.stored).toHaveLength(1);
      expectNoPgEnvInfluence(run, pgEnv);
    },
  );

  // Follow-up ruling 3: host, port, database and user must come from the URL.
  it.each([
    ["no port", () => poolerUrl("/postgres?sslmode=require")],
    ["no database", () => poolerUrl(":6543?sslmode=require")],
    ["an empty database path", () => poolerUrl(":6543/?sslmode=require")],
    ["no port and no database", () => poolerUrl("?sslmode=require")],
    [
      "no user",
      () =>
        `postgresql://:${PASSWORD}@${POOLER_HOST}:6543/postgres?sslmode=require`,
    ],
    [
      "no host",
      () => `postgresql://${LOGIN}:${PASSWORD}@:6543/postgres?sslmode=require`,
    ],
  ])(
    "URL with %s is rejected before connecting, with every PG* variable set (blocker, no connect attempt, no proof)",
    async (_label, url) => {
      const run = await go({
        ...distinctivePgEnv(),
        DOCUMENT_CUTOVER_DATABASE_URL: url(),
      });
      expectRejectedBeforeConnecting(run);
    },
  );

  // Follow-up ruling 4: the host must be a network hostname or IP.
  it.each([
    [
      "an encoded /var/run/postgresql host",
      () =>
        `postgresql://${LOGIN}:${PASSWORD}@%2Fvar%2Frun%2Fpostgresql:6543/postgres?sslmode=require`,
    ],
    [
      "an encoded /tmp host",
      () =>
        `postgresql://${LOGIN}:${PASSWORD}@%2Ftmp:6543/postgres?sslmode=require`,
    ],
    [
      "?host=/var/run/postgresql",
      () =>
        poolerUrl(":6543/postgres?sslmode=require&host=/var/run/postgresql"),
    ],
    [
      "?host=%2Ftmp",
      () => poolerUrl(":6543/postgres?sslmode=require&host=%2Ftmp"),
    ],
  ])(
    "a Unix socket-path host (%s) is rejected before connecting",
    async (_label, url) => {
      const run = await go({ DOCUMENT_CUTOVER_DATABASE_URL: url() });
      expectRejectedBeforeConnecting(run);
    },
  );

  async function gateSubprocess(
    url: (port: number) => string,
    pgEnv: (port: number) => Record<string, string>,
  ): Promise<{ status: number | null; output: string; accepted: number }> {
    let accepted = 0;
    const server = createServer((socket) => {
      accepted += 1;
      socket.destroy();
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const port = (server.address() as { port: number }).port;
    try {
      const child = spawn("bun", ["run", "cutover:assess:documents"], {
        cwd: REPO_ROOT,
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          SUPABASE_URL: `https://${REF}.supabase.co`,
          DOCUMENT_CUTOVER_DATABASE_URL: url(port),
          ...pgEnv(port),
        },
      });
      let output = "";
      child.stdout.on("data", (chunk) => (output += String(chunk)));
      child.stderr.on("data", (chunk) => (output += String(chunk)));
      const status = await new Promise<number | null>((resolve) =>
        child.on("close", resolve),
      );
      return { status, output, accepted };
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }

  it("real subprocess: ?host=127.0.0.1 with PGPORT pointing at a local listener — the gate never reaches the listener and exits non-zero", async () => {
    const run = await gateSubprocess(
      () =>
        `postgresql://${LOGIN}:${PASSWORD}@db.${REF}.supabase.co/postgres?host=127.0.0.1`,
      (port) => ({ PGPORT: String(port), PGUSER: "postgres" }),
    );
    expect(run.accepted, run.output).toBe(0);
    expect(run.status, run.output).not.toBe(0);
  }, 150_000);

  it("real subprocess: ?host=127.0.0.1&port=<listener> — the gate never reaches the listener and exits non-zero", async () => {
    const run = await gateSubprocess(
      (port) =>
        `postgresql://${LOGIN}:${PASSWORD}@db.${REF}.supabase.co:5432/postgres?host=127.0.0.1&port=${port}`,
      () => ({}),
    );
    expect(run.accepted, run.output).toBe(0);
    expect(run.status, run.output).not.toBe(0);
  }, 150_000);
});

describe("PR #2169 MAJOR-1 (c) — session_user AND current_user must be the reader", () => {
  it("SET ROLE session (session_user = postgres, current_user = document_cutover_reader) is rejected: blocker, no proof", async () => {
    const run = await go({ DOCUMENT_CUTOVER_DATABASE_URL: CONTROL_URL }, () => {
      fakePg.sessionUserOverride = "postgres";
      fakePg.currentRoleOverride = READER_ROLE;
    });
    expect(run.exitCode, run.output).not.toBe(0);
    // Follow-up ruling 5: the message names `session_user` exactly.
    expect(run.output).toContain("session_user");
    expect(run.stored).toEqual([]);
    expect(run.files).toEqual([]);
  });

  it("session_user = an unprivileged login role, current_user = document_cutover_reader is rejected", async () => {
    const run = await go({ DOCUMENT_CUTOVER_DATABASE_URL: CONTROL_URL }, () => {
      fakePg.roles.set("acceptance_2067_login", {
        rolsuper: false,
        rolbypassrls: false,
        rolcanlogin: true,
        rolinherit: true,
        memberOf: [READER_ROLE],
      });
      fakePg.sessionUserOverride = "acceptance_2067_login";
      fakePg.currentRoleOverride = READER_ROLE;
    });
    expect(run.exitCode, run.output).not.toBe(0);
    expect(run.output).toContain("session_user");
    expect(run.stored).toEqual([]);
  });

  it("session_user = document_cutover_reader, current_user = postgres is rejected", async () => {
    const run = await go({ DOCUMENT_CUTOVER_DATABASE_URL: CONTROL_URL }, () => {
      fakePg.currentRoleOverride = "postgres";
    });
    expect(run.exitCode, run.output).not.toBe(0);
    expect(run.stored).toEqual([]);
  });

  it("control: session_user = current_user = document_cutover_reader records one clean proof", async () => {
    const run = await go({ DOCUMENT_CUTOVER_DATABASE_URL: CONTROL_URL });
    expect(run.exitCode, run.output).toBe(0);
    expect(run.stored).toHaveLength(1);
  });
});

describe("PR #2169 MAJOR-1 (d) — 'PG* variables are never used' stays true", () => {
  const gateSource = () =>
    readFileSync(path.join(REPO_ROOT, GATE_SOURCE), "utf8");

  it("every gate message or doc line that mentions PG* variables says they are never used / read (no message suggests setting them)", () => {
    const lines = gateSource()
      .split("\n")
      .filter((line) => /\bPG(\*|[A-Z]{2,})/.test(line));
    expect(lines.length).toBeGreaterThan(0);
    // A statement may wrap over lines; check the sentence around each hit.
    const text = gateSource().replace(/\s*\n\s*(\*\s*)?/g, " ");
    const sentences = text
      .split(/(?<=[.;])\s/)
      .filter((sentence) => /\bPG(\*|[A-Z]{2,})/.test(sentence));
    expect(
      sentences.filter((sentence) => !/\bnever\b/i.test(sentence)),
    ).toEqual([]);
  });

  it.each([
    ["DOCUMENT_CUTOVER_DATABASE_URL is missing", undefined],
    [
      "the URL has no password (PGPASSWORD set)",
      `postgresql://${LOGIN}@${POOLER_HOST}:6543/postgres?sslmode=require`,
    ],
  ])(
    "with every PG* variable set, %s: the blocker says PG* variables are never used, nothing connects, no PG* value is echoed, no proof",
    async (_label, url) => {
      const pgEnv = distinctivePgEnv();
      const run = await go({
        ...pgEnv,
        ...(url ? { DOCUMENT_CUTOVER_DATABASE_URL: url } : {}),
        ...(url ? {} : { DOCUMENT_CUTOVER_DATABASE_URL: "" }),
      });
      expect(run.exitCode, run.output).not.toBe(0);
      expect(run.output).toMatch(/PG\*[^.]*never (used|read)/i);
      expect(fakePg.connectAttempts).toEqual([]);
      expect(run.stored).toEqual([]);
      expectNoPgEnvInfluence(run, pgEnv);
    },
  );
});

/** Ruling 5 (MINOR-4), follow-up ruling 2, plus the roles already required. */
const REQUIRED_PRIVILEGED_ROLES = [
  "postgres",
  "service_role",
  "authenticator",
  "supabase_admin",
  // Named in the ruling.
  "authenticated",
  "pg_write_all_data",
  "supabase_auth_admin",
  // Every supabase_*_admin role (follow-up ruling 2).
  "supabase_storage_admin",
  "supabase_functions_admin",
  "supabase_realtime_admin",
  "supabase_replication_admin",
  // Follow-up ruling 2.
  "pg_read_all_data",
  "dashboard_user",
  // Round-3 ruling 3 (nits).
  "anon",
  "pg_execute_server_program",
];

describe("PR #2169 MINOR-4 (f) — PRIVILEGED_ROLES", () => {
  it.each(REQUIRED_PRIVILEGED_ROLES)(
    "static: PRIVILEGED_ROLES in the gate lists %s",
    (role) => {
      const source = readFileSync(path.join(REPO_ROOT, GATE_SOURCE), "utf8");
      const list = /\bPRIVILEGED_ROLES\b[^=]*=\s*\[([\s\S]*?)\]/.exec(
        source,
      )?.[1];
      expect(list, "no PRIVILEGED_ROLES array in the gate").toBeDefined();
      const roles = [...(list ?? "").matchAll(/["'`]([a-z_]+)["'`]/g)].map(
        (match) => match[1],
      );
      expect(roles).toContain(role);
    },
  );

  it.each(REQUIRED_PRIVILEGED_ROLES.filter((role) => role !== "postgres"))(
    "behaviour: a reader that is a member of %s is rejected (blocker naming the role, no proof)",
    async (role) => {
      const run = await go(
        { DOCUMENT_CUTOVER_DATABASE_URL: CONTROL_URL },
        () => {
          if (!fakePg.roles.has(role)) {
            fakePg.roles.set(role, {
              rolsuper: false,
              rolbypassrls: false,
              rolcanlogin: false,
              rolinherit: true,
              memberOf: [],
            });
          }
          const reader = fakePg.roles.get(READER_ROLE);
          if (reader) reader.memberOf = [...reader.memberOf, role];
        },
      );
      expect(run.exitCode, run.output).not.toBe(0);
      expect(run.output).toContain(role);
      expect(run.stored).toEqual([]);
    },
  );
});

// ---------------------------------------------------------------------------
// #2169 round 3 — rulings at
// https://github.com/Asymmetric-al/core/pull/2169#issuecomment-6312557456
// ---------------------------------------------------------------------------

/** The direct-connection URL for the hosted target (`db.<ref>.supabase.co`). */
const directUrl = (query: string) =>
  `postgresql://${READER_ROLE}:${PASSWORD}@db.${REF}.supabase.co:5432/postgres${query}`;

const NON_LOOPBACK_URLS = [
  ["pooler", (query: string) => poolerUrl(`:6543/postgres${query}`)],
  ["direct", directUrl],
] as const;

/** Loopback target: SUPABASE_URL and the reader URL both on 127.0.0.1. */
function loopbackEnv(databaseUrl: string): Record<string, string> {
  return {
    SUPABASE_URL: LOCAL_TARGET_URL,
    NEXT_PUBLIC_SUPABASE_URL: LOCAL_TARGET_URL,
    DOCUMENT_CUTOVER_DATABASE_URL: databaseUrl,
  };
}

/**
 * `rejectUnauthorized` of an `ssl` value as the gate passed it (an object) or
 * as fake-postgres records pg's resolved value (objects are JSON strings).
 */
function rejectUnauthorizedOf(ssl: unknown): unknown {
  let value = ssl;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return undefined;
    }
  }
  return value && typeof value === "object"
    ? (value as { rejectUnauthorized?: unknown }).rejectUnauthorized
    : undefined;
}

/** Connect attempts that would skip TLS or certificate verification. */
const unverifiedAttempts = () =>
  fakePg.connectAttempts.filter(
    (attempt) =>
      attempt.gateConfig.ssl === false ||
      rejectUnauthorizedOf(attempt.gateConfig.ssl) === false ||
      attempt.effective?.ssl === false ||
      rejectUnauthorizedOf(attempt.effective?.ssl) === false,
  );

describe("PR #2169 round 3 ruling 1 (MINOR-A, refined in 6312607834) — TLS on non-loopback hosts", () => {
  // `prefer` stays a STOP: 6312557456 lists it, and the refinement in
  // 6312607834 (which only names no-verify/disable for removal) does not
  // lift it.
  const STOP_SSLMODES = [
    ["no sslmode", ""],
    ["sslmode=disable", "?sslmode=disable"],
    ["sslmode=allow", "?sslmode=allow"],
    ["sslmode=prefer", "?sslmode=prefer"],
    ["sslmode=no-verify", "?sslmode=no-verify"],
  ] as const;

  describe.each(NON_LOOPBACK_URLS)("%s URL", (_kind, url) => {
    it.each(STOP_SSLMODES)(
      "%s is a STOP before connecting (blocker naming sslmode, no connect attempt, no proof)",
      async (_label, query) => {
        const run = await go({ DOCUMENT_CUTOVER_DATABASE_URL: url(query) });
        expectRejectedBeforeConnecting(run);
        expect(run.output).toMatch(/sslmode/i);
      },
    );

    it.each(["require", "verify-ca", "verify-full"])(
      "sslmode=%s connects with a resolved config of ssl.rejectUnauthorized === true (never ssl:false) and records one clean proof",
      async (mode) => {
        const run = await go({
          DOCUMENT_CUTOVER_DATABASE_URL: url(`?sslmode=${mode}`),
        });
        expect(run.exitCode, run.output).toBe(0);
        expect(run.stored).toHaveLength(1);
        expect(fakePg.connectAttempts.length).toBeGreaterThan(0);
        for (const attempt of fakePg.connectAttempts) {
          expect(attempt.gateConfig.ssl).not.toBe(false);
          expect(rejectUnauthorizedOf(attempt.effective?.ssl)).toBe(true);
        }
      },
    );
  });

  it("a non-loopback URL with no sslmode never reaches pg with ssl:false (captured client config)", async () => {
    await go({ DOCUMENT_CUTOVER_DATABASE_URL: poolerUrl(":6543/postgres") });
    expect(
      fakePg.connectAttempts.filter(
        (attempt) => attempt.gateConfig.ssl === false,
      ),
      "pg client configs with ssl:false",
    ).toEqual([]);
  });

  it.each(["SELF_SIGNED_CERT_IN_CHAIN", "UNABLE_TO_VERIFY_LEAF_SIGNATURE"])(
    "a TLS verification failure (%s) is a STOP naming NODE_EXTRA_CA_CERTS and the Supabase root CA, after exactly one connect attempt and no unverified retry",
    async (code) => {
      const run = await go(
        { DOCUMENT_CUTOVER_DATABASE_URL: CONTROL_URL },
        () => {
          fakePg.tlsFailure = code;
        },
      );
      expect(run.exitCode, run.output).not.toBe(0);
      expect(run.output).toContain("NODE_EXTRA_CA_CERTS");
      expect(run.output).toMatch(/root CA/i);
      expect(fakePg.connectAttempts).toHaveLength(1);
      expect(unverifiedAttempts()).toEqual([]);
      expect(run.stored).toEqual([]);
      expect(run.files).toEqual([]);
    },
  );

  it("loopback may omit sslmode: a 127.0.0.1 reader URL without sslmode records one clean proof", async () => {
    const run = await go(
      loopbackEnv(
        `postgresql://${READER_ROLE}:${PASSWORD}@127.0.0.1:54322/postgres`,
      ),
    );
    expect(run.exitCode, run.output).toBe(0);
    expect(run.stored).toHaveLength(1);
    expect(fakePg.connectAttempts.length).toBeGreaterThan(0);
  });
});

describe("PR #2169 round 3 ruling 3 — [::1], empty host and multi-host URLs", () => {
  const IPV6_LOOPBACK_URL = (port: number) =>
    `postgresql://${READER_ROLE}:${PASSWORD}@[::1]:${port}/postgres`;

  it("[::1] is either loopback (pg is handed the address ::1, never the bracketed text it would DNS-resolve) or rejected with a clear message before connecting", async () => {
    const run = await go(loopbackEnv(IPV6_LOOPBACK_URL(54322)));
    expect(run.output).not.toMatch(/ENOTFOUND/);
    if (fakePg.connectAttempts.length === 0) {
      expect(run.exitCode, run.output).not.toBe(0);
      expect(run.output).toMatch(/::1|IPv6/i);
      expect(run.stored).toEqual([]);
    } else {
      for (const attempt of fakePg.connectAttempts) {
        expect(attempt.effective?.host).toBe("::1");
      }
      expect(run.exitCode, run.output).toBe(0);
    }
  });

  it("real subprocess: [::1] with a listener on ::1 — the gate reaches the listener or names [::1]/IPv6 in its blocker, and never fails with ENOTFOUND", async () => {
    let accepted = 0;
    const server = createServer((socket) => {
      accepted += 1;
      socket.destroy();
    });
    await new Promise<void>((resolve) => server.listen(0, "::1", resolve));
    const port = (server.address() as { port: number }).port;
    try {
      const child = spawn("bun", ["run", "cutover:assess:documents"], {
        cwd: REPO_ROOT,
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          SUPABASE_URL: LOCAL_TARGET_URL,
          DOCUMENT_CUTOVER_DATABASE_URL: IPV6_LOOPBACK_URL(port),
        },
      });
      let output = "";
      child.stdout.on("data", (chunk) => (output += String(chunk)));
      child.stderr.on("data", (chunk) => (output += String(chunk)));
      await new Promise<number | null>((resolve) => child.on("close", resolve));
      expect(output).not.toMatch(/ENOTFOUND/);
      if (accepted === 0) expect(output).toMatch(/::1|IPv6/i);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }, 150_000);

  // Keyword pins (the ruling gives no wording): an empty-host blocker says
  // "host" and is not the generic "not a postgres:// URL" text; a multi-host
  // blocker says "multiple hosts", "multi-host" or "more than one host".
  it.each([
    [
      "@:6543 (empty host, explicit port)",
      () => `postgresql://${LOGIN}:${PASSWORD}@:6543/postgres?sslmode=require`,
    ],
    [
      "@/postgres (empty host, no port)",
      () => `postgresql://${LOGIN}:${PASSWORD}@/postgres?sslmode=require`,
    ],
  ])(
    "empty host %s: its own blocker naming the host, not the generic URL-format message",
    async (_label, url) => {
      const run = await go({ DOCUMENT_CUTOVER_DATABASE_URL: url() });
      expectRejectedBeforeConnecting(run);
      expect(run.output).toMatch(/\bhost\b/i);
      expect(run.output).not.toMatch(/not a postgres:\/\/ URL/i);
    },
  );

  it.each([
    [
      "two pooler hosts with ports",
      () =>
        `postgresql://${LOGIN}:${PASSWORD}@${POOLER_HOST}:6543,${POOLER_HOST}:6543/postgres?sslmode=require`,
    ],
    [
      "two pooler hosts, one port",
      () =>
        `postgresql://${LOGIN}:${PASSWORD}@${POOLER_HOST},${POOLER_HOST}:6543/postgres?sslmode=require`,
    ],
  ])(
    "multi-host URL (%s): its own blocker saying it names more than one host",
    async (_label, url) => {
      const run = await go({ DOCUMENT_CUTOVER_DATABASE_URL: url() });
      expectRejectedBeforeConnecting(run);
      expect(run.output).toMatch(
        /multiple hosts|multi-host|more than one host/i,
      );
    },
  );
});
