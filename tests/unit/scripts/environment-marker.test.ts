/**
 * AL-2674 (plan 7.5): reset and reseed scripts refuse any database that is not
 * marked disposable. The decision, the target parsing and the wiring into
 * every reset and reseed script are pinned here; the real-stack suite
 * (tests/unit/acceptance/issue-2674) runs the guard against real databases.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  parseStatusDatabaseUrl,
  resolveTarget,
} from "../../../scripts/db/require-disposable-database.mjs";
import {
  assessEnvironmentMarker,
  describeDatabase,
  requireDisposableDatabase,
} from "../../../scripts/lib/environment-marker.mjs";

const read = (file: string) => readFileSync(file, "utf8");

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
        databaseUrl: "postgresql://u:s3cret@db.example:6543/postgres",
        psqlBin: "definitely-not-a-psql-binary",
      });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/^refusing to reset or reseed db\.example:6543/);
    expect(message).not.toContain("s3cret");
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
  it("seed-demo.sh checks before the local reset and before the hosted push", () => {
    const sh = read("scripts/seed-demo.sh");
    const local = sh.slice(
      sh.indexOf("run_local()"),
      sh.indexOf("run_hosted()"),
    );
    expect(local.indexOf(`${guard}" --local`)).toBeGreaterThan(-1);
    expect(local.indexOf(`${guard}" --local`)).toBeLessThan(
      local.indexOf("db reset --local"),
    );
    const hosted = sh.slice(
      sh.indexOf("run_hosted()"),
      sh.indexOf("run_verify()"),
    );
    expect(
      hosted.indexOf(`${guard}" --url-env SUPABASE_DB_URL`),
    ).toBeGreaterThan(-1);
    expect(hosted.indexOf(`${guard}" --url-env SUPABASE_DB_URL`)).toBeLessThan(
      hosted.indexOf("db push"),
    );
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

  it("Payload down, reset, fresh and refresh check before they run", () => {
    const src = read("scripts/cms/run-payload-command.mjs");
    expect(src).toMatch(
      /if \(command !== "migrate"\)\s*requireDisposableDatabase\(\{\s*databaseUrl: env\.PAYLOAD_DATABASE_URI/,
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
