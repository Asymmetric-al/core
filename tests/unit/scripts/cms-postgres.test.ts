import { afterEach, describe, expect, it, vi } from "vitest";

const spawnSync = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ spawnSync }));

import { runPsql, runPsqlFile } from "../../../scripts/cms/lib/postgres.mjs";

const databaseUrl =
  "postgresql://postgres.example:fake%3Apassword@pooler.example.com:5432/postgres?sslmode=no-verify&connect_timeout=15";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("CMS PostgreSQL command connection", () => {
  it("uses encrypted libpq-compatible settings without putting credentials in argv", () => {
    spawnSync.mockReturnValue({ status: 0, stdout: "1\n", stderr: "" });

    expect(runPsql("SELECT 1;", { databaseUrl })).toBe("1");
    const [, args, options] = spawnSync.mock.calls.at(-1)!;

    expect(args).not.toContain(databaseUrl);
    expect(JSON.stringify(args)).not.toContain("password");
    expect(options.env).toMatchObject({
      PGHOST: "pooler.example.com",
      PGPORT: "5432",
      PGDATABASE: "postgres",
      PGUSER: "postgres.example",
      PGPASSWORD: "fake:password",
      PGSSLMODE: "require",
      PGCONNECT_TIMEOUT: "15",
    });
    expect(options.shell).toBe(false);
  });

  it("uses the same connection handling for transactional SQL files", () => {
    vi.stubEnv("PAYLOAD_DATABASE_URI", databaseUrl);
    spawnSync.mockReturnValue({ status: 0 });

    runPsqlFile("reviewed-migration.sql", { singleTransaction: true });
    const [, args, options] = spawnSync.mock.calls.at(-1)!;

    expect(args).toContain("--single-transaction");
    expect(args).not.toContain(databaseUrl);
    expect(options.env.PGSSLMODE).toBe("require");
    expect(options.env.PGPASSWORD).toBe("fake:password");
  });

  it("preserves certificate verification when the URL requests it", () => {
    spawnSync.mockReturnValue({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl: databaseUrl.replace("no-verify", "verify-full"),
    });

    expect(spawnSync.mock.calls.at(-1)![2].env.PGSSLMODE).toBe("verify-full");
  });

  it("preserves libpq defaults when the URL omits connection fields", () => {
    vi.stubEnv("PGPORT", "6543");
    vi.stubEnv("PGSSLMODE", "verify-full");
    spawnSync.mockReturnValue({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", { databaseUrl: "postgresql://db.example/postgres" });

    expect(spawnSync.mock.calls.at(-1)![2].env).toMatchObject({
      PGHOST: "db.example",
      PGPORT: "6543",
      PGSSLMODE: "verify-full",
    });
  });

  it("preserves libpq URI options without exposing URL credentials", () => {
    spawnSync.mockReturnValue({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl: `${databaseUrl}&keepalives_idle=30&ssl=true`,
    });
    const [, args, options] = spawnSync.mock.calls.at(-1)!;
    const connection = new URL(args[args.indexOf("--dbname") + 1]);

    expect(connection.searchParams.get("keepalives_idle")).toBe("30");
    expect(connection.searchParams.get("ssl")).toBe("true");
    expect(connection.username).toBe("");
    expect(connection.password).toBe("");
    expect(JSON.stringify(args)).not.toContain("password");
    expect(options.env.PGPASSWORD).toBe("fake:password");
  });

  it("reports malformed credential encoding without leaking the URL", () => {
    expect(() =>
      runPsql("SELECT 1;", {
        databaseUrl: "postgresql://fake-user:%zz@db.example/postgres",
      }),
    ).toThrow("CMS database connection must be a valid Postgres URL.");
  });
});
