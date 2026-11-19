/**
 * AL-2674 (plan 7.5): reset and reseed scripts refuse any database that is not
 * marked disposable. The decision, the target parsing and the wiring into
 * every reset and reseed script are pinned here; the real-stack suite
 * (tests/unit/acceptance/issue-2674) runs the guard against real databases.
 */
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  parseStatusDatabaseUrl,
  resolveTarget,
} from "../../../scripts/db/require-disposable-database.mjs";
import {
  assessEnvironmentMarker,
  describeDatabase,
  readEnvironmentMarker,
  requireDisposableDatabase,
  requireDisposableTarget,
} from "../../../scripts/lib/environment-marker.mjs";

const read = (file: string) => readFileSync(file, "utf8");
const itPosix = process.platform === "win32" ? it.skip : it;
const roots: string[] = [];
afterEach(() => {
  for (const dir of roots.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

describe("assessEnvironmentMarker", () => {
  it("admits only disposable", () => {
    expect(assessEnvironmentMarker("disposable")).toEqual({
      ok: true,
      kind: "disposable",
    });
  });

  it.each([null, undefined, ""])(
    "refuses a database with no marker (%j): it counts as not disposable",
    (kind) => {
      const verdict = assessEnvironmentMarker(kind);
      expect(verdict.ok).toBe(false);
      expect(verdict.kind).toBeNull();
      expect(verdict.reason).toMatch(/no environment marker/);
    },
  );

  it.each(["shared", "production", "unknown"])("refuses %s", (kind) => {
    const verdict = assessEnvironmentMarker(kind);
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toContain(`is marked ${kind}`);
  });
});

describe("requireDisposableDatabase", () => {
  it("refuses with no URL, and never prints the password", () => {
    expect(() => requireDisposableDatabase({ databaseUrl: "" })).toThrow(
      /no database URL/,
    );
    expect(
      describeDatabase("postgresql://u:s3cret@db.example:6543/postgres"),
    ).toBe("db.example:6543/postgres");
  });

  it("refuses when the marker cannot be read (fails closed)", () => {
    let message = "";
    try {
      requireDisposableDatabase({
        databaseUrl:
          "postgresql://u:s3cret@db.example:6543/postgres?sslmode=verify-full",
        psqlBin: "definitely-not-a-psql-binary",
      });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/^refusing to reset or reseed db\.example:6543/);
    expect(message).not.toContain("s3cret");
  });
});

/**
 * A fake psql answering the marker reads (AL-2674 council round 1, E2): the
 * function probe and the marker value, or a connection failure. It logs each
 * call's arguments and PGPASSWORD.
 */
function fakeMarkerPsql(state: "missing" | "unset" | "unreadable" | string) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "core-marker-psql-"));
  roots.push(dir);
  const bin = path.join(dir, "psql");
  const log = path.join(dir, "calls.jsonl");
  writeFileSync(
    bin,
    `#!${process.execPath}
// Review N6: answer the version check like a psql 16 or later, unlogged.
if (process.argv[2] === "--version") { console.log("psql (PostgreSQL) 17.11"); process.exit(0); }
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify({ args, password: process.env.PGPASSWORD ?? null }) + "\\n");
const state = ${JSON.stringify(state)};
const sql = args[args.indexOf("-c") + 1] ?? "";
if (state === "unreadable") { process.stderr.write("psql: error: connection refused\\n"); process.exit(2); }
if (sql.includes("to_regprocedure")) { console.log(state === "missing" ? "f" : "t"); process.exit(0); }
console.log(state === "unset" ? "" : state);
`,
  );
  chmodSync(bin, 0o755);
  const calls = () =>
    readFileSync(log, "utf8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as { args: string[]; password: string | null });
  return { bin, calls };
}

describe("requireDisposableDatabase reads the marker from the target (fake psql)", () => {
  const URL_ =
    "postgresql://postgres:s3cret@db.example:6543/postgres?sslmode=verify-full";
  const refusal = (state: string) => {
    const psql = fakeMarkerPsql(state);
    let message = "";
    try {
      requireDisposableDatabase({ databaseUrl: URL_, psqlBin: psql.bin });
    } catch (error) {
      message = (error as Error).message;
    }
    return { message, calls: psql.calls() };
  };

  itPosix.each<[string, RegExp]>([
    ["missing", /no environment marker, so it counts as not disposable/],
    ["unset", /no environment marker, so it counts as not disposable/],
    ["shared", /is marked shared; only a database marked disposable/],
    ["production", /is marked production; only a database marked disposable/],
    [
      "unreadable",
      /could not read the environment marker: .*connection refused/,
    ],
  ])("refuses a database whose marker is %s", (state, reason) => {
    const { message, calls } = refusal(state);
    expect(message).toMatch(
      /^refusing to reset or reseed db\.example:6543\/postgres: /,
    );
    expect(message).toMatch(reason);
    expect(message).not.toContain("s3cret");
    for (const call of calls) {
      expect(call.password).toBe("s3cret");
      expect(JSON.stringify(call.args)).not.toContain("s3cret");
    }
  });

  itPosix(
    "reads the marker only after the function exists, and admits disposable",
    () => {
      const psql = fakeMarkerPsql("disposable");
      expect(
        requireDisposableDatabase({ databaseUrl: URL_, psqlBin: psql.bin }),
      ).toEqual({ ok: true, kind: "disposable" });
      const sql = psql.calls().map((c) => c.args[c.args.indexOf("-c") + 1]);
      expect(sql).toEqual([
        "select to_regprocedure('platform.environment_kind()') is not null",
        "select coalesce(platform.environment_kind(), '')",
      ]);
      expect(
        readEnvironmentMarker({
          databaseUrl: URL_,
          psqlBin: fakeMarkerPsql("missing").bin,
        }),
      ).toBeNull();
    },
  );

  it("requireDisposableTarget refuses an unreadable target and any kind but disposable", () => {
    const read = (kind: unknown) => () => {
      if (kind instanceof Error) throw kind;
      return kind as string | null;
    };
    const verdict = (kind: unknown) => {
      try {
        return requireDisposableTarget({
          where: "the linked project abc",
          action: "reset",
          readKind: read(kind),
        });
      } catch (error) {
        return (error as Error).message;
      }
    };
    expect(verdict("disposable")).toEqual({ ok: true, kind: "disposable" });
    expect(verdict(null)).toMatch(
      /^refusing to reset the linked project abc: it has no environment marker/,
    );
    expect(verdict("shared")).toMatch(/is marked shared/);
    expect(verdict(new Error("boom"))).toBe(
      "refusing to reset the linked project abc: boom",
    );
  });
});

describe("require-disposable-database.mjs targets", () => {
  it("reads DB_URL from `supabase status -o env` output", () => {
    expect(
      parseStatusDatabaseUrl(
        'API_URL="http://127.0.0.1:54321"\nDB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"\n',
      ),
    ).toBe("postgresql://postgres:postgres@127.0.0.1:54322/postgres");
    expect(parseStatusDatabaseUrl("nothing here")).toBeNull();
  });

  it("takes the URL from --local or a named environment variable, never argv", () => {
    expect(resolveTarget(["--local"], {}, () => "local-url")).toBe("local-url");
    expect(resolveTarget(["--url-env", "X"], { X: " url " })).toBe("url");
    expect(() => resolveTarget(["--url-env", "X"], {})).toThrow(/not set/);
    expect(() => resolveTarget(["postgresql://h/db"], {})).toThrow(/usage/);
    expect(() => resolveTarget([], {})).toThrow(/usage/);
  });
});

describe("every reset and reseed script checks the marker first", () => {
  const guard = "scripts/db/require-disposable-database.mjs";
  it("seed-demo.sh resets only through the repository runner, and its hosted mode runs nothing", () => {
    // AL-2672 (WP0) retired the hosted seed. The repository runner refuses to
    // reset any database that is not marked disposable (supabase-cli.test.ts),
    // so the script needs no marker call of its own: its one reset goes through
    // the runner, and its hosted mode reaches no database at all. This replaces
    // the earlier assertion that the script called the guard before a local
    // reset and before a hosted push; the hosted push no longer exists.
    const sh = read("scripts/seed-demo.sh");
    const local = sh.slice(
      sh.indexOf("run_local()"),
      sh.indexOf("run_hosted()"),
    );
    expect(local).toContain("bun run supabase -- db reset --local");
    expect(local).not.toMatch(/\bpsql\b/);
    const hosted = sh.slice(
      sh.indexOf("run_hosted()"),
      sh.indexOf("is_loopback_database_url()"),
    );
    expect(hosted).toContain("exit 1");
    expect(hosted).not.toContain("db push");
    expect(hosted).not.toContain("db reset");
    expect(hosted).not.toMatch(/\bpsql\b/);
  });

  it("db:migrate:local checks before the CLI reset", () => {
    const scripts = JSON.parse(read("package.json")).scripts as Record<
      string,
      string
    >;
    expect(scripts["db:migrate:local"]).toBe(
      `node ${guard} --local && bun run supabase -- db reset --local --no-seed`,
    );
  });

  it("the CMS local reset and seed check before they write", () => {
    const lib = read("scripts/cms/lib/supabase.mjs");
    const reset = lib.slice(lib.indexOf("export function resetLocalSupabase"));
    expect(reset.indexOf("requireDisposableDatabase(")).toBeGreaterThan(-1);
    expect(reset.indexOf('"db", "reset", "--local"')).toBeGreaterThan(
      reset.indexOf("requireDisposableDatabase("),
    );
    const seed = read("scripts/cms/seed-local.mjs");
    const main = seed.slice(seed.indexOf("async function main()"));
    expect(main.indexOf("requireDisposableDatabase(")).toBeLessThan(
      main.indexOf("ensurePublicSeedRows()"),
    );
  });

  // Amended by council round 2 (A7c; plan 7.1): the check read the marker
  // through PAYLOAD_DATABASE_URI, which on a loopback database carries the
  // cms_owner session role, and cms_owner cannot read `platform`, so every
  // rollback was refused, even on a disposable database. It now reads it
  // through the migration target's marker URL. The behaviour is proved in
  // tests/unit/scripts/cms-payload-command.test.ts (runs on a disposable
  // database, refuses one that is not) and on the real stack in
  // tests/unit/cms/cms-database-roles.realstack.test.ts.
  it("Payload down, reset, fresh and refresh check before they run", () => {
    const src = read("scripts/cms/run-payload-command.mjs");
    expect(src).toMatch(
      // Review M2: the hosted check now runs for every command on a hosted
      // address, so the disposable-marker check names the writes it is for.
      /if \(isMigrationWrite && command !== "migrate"\)\s*requireDisposableDatabase\(\{\s*databaseUrl: markerUrl,/,
    );
  });

  it("the demo-user seeder reads the marker through the health function first", () => {
    const src = read("packages/database/scripts/seed-demo-users.ts");
    const run = src.slice(src.indexOf("async function run()"));
    expect(
      run.indexOf("requireDisposableEnvironment(adminClient)"),
    ).toBeLessThan(run.indexOf("resolveTenantId(adminClient)"));
    expect(src).toContain('adminClient.rpc("platform_health")');
  });
});
