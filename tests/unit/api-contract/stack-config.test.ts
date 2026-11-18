/**
 * #2708: the harness reads the Data API surface from supabase/config.toml and
 * hands it to PostgREST unchanged, stays on loopback, and removes only the
 * Docker resources it started. Pure: no Docker, no database.
 */
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertLoopbackDatabaseUrl,
  containerAction,
  defaultStateFile,
  planRemoval,
  postgrestBinding,
  postgrestEnvironment,
  readApiSettings,
} from "../../../scripts/api-contract/stack.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

describe("readApiSettings", () => {
  it("reads schemas, extra_search_path and max_rows from the [api] table only", () => {
    const settings = readApiSettings(
      [
        'project_id = "x"',
        "[api]",
        "enabled = true",
        '# a comment with schemas = ["nope"]',
        'schemas = ["public", "graphql_public"]',
        'extra_search_path = ["public", "extensions"]',
        "max_rows = 1000",
        "",
        "[api.tls]",
        "enabled = false",
        "[db]",
        "max_rows = 5",
        'schemas = ["db"]',
      ].join("\n"),
    );
    expect(settings).toEqual({
      schemas: ["public", "graphql_public"],
      extraSearchPath: ["public", "extensions"],
      maxRows: 1000,
    });
  });

  it("refuses a config without a declared schema list or row cap", () => {
    expect(() => readApiSettings("[api]\nenabled = true\n")).toThrow(/schemas/);
    expect(() =>
      readApiSettings('[api]\nschemas = ["public"]\nextra_search_path = []\n'),
    ).toThrow(/max_rows/);
  });

  it("matches the repository's supabase/config.toml", () => {
    const settings = readApiSettings(
      readFileSync(path.join(repoRoot, "supabase/config.toml"), "utf8"),
    );
    expect(settings.schemas).toContain("public");
    expect(settings.schemas).not.toContain("authz");
    expect(settings.maxRows).toBeGreaterThan(0);
  });
});

describe("postgrestEnvironment", () => {
  it("mirrors the Supabase stack's PostgREST settings", () => {
    const env = postgrestEnvironment({
      settings: {
        schemas: ["public", "graphql_public"],
        extraSearchPath: ["public", "extensions"],
        maxRows: 1000,
      },
      dbUri: "postgres://authenticator:pw@db:5432/app",
      jwtSecret: "s".repeat(40),
      serverHost: "127.0.0.1",
      serverPort: 3000,
    });
    expect(env).toEqual({
      PGRST_DB_URI: "postgres://authenticator:pw@db:5432/app",
      PGRST_DB_SCHEMAS: "public,graphql_public",
      PGRST_DB_EXTRA_SEARCH_PATH: "public,extensions",
      PGRST_DB_MAX_ROWS: "1000",
      PGRST_DB_ANON_ROLE: "anon",
      PGRST_JWT_SECRET: "s".repeat(40),
      PGRST_SERVER_HOST: "127.0.0.1",
      PGRST_SERVER_PORT: "3000",
      PGRST_DB_CHANNEL_ENABLED: "true",
      PGRST_LOG_LEVEL: "error",
    });
  });

  it("refuses a JWT secret shorter than PostgREST accepts", () => {
    expect(() =>
      postgrestEnvironment({
        settings: { schemas: ["public"], extraSearchPath: [], maxRows: 1 },
        dbUri: "postgres://a@b/c",
        jwtSecret: "short",
        serverPort: 3000,
      }),
    ).toThrow(/32/);
  });
});

describe("assertLoopbackDatabaseUrl", () => {
  it("accepts loopback hosts and refuses anything else", () => {
    for (const url of [
      "postgresql://postgres:postgres@localhost:5432/db",
      "postgresql://postgres@127.0.0.1:54400/db",
    ])
      expect(() => assertLoopbackDatabaseUrl(url)).not.toThrow();
    for (const url of [
      "postgresql://postgres@db.example.supabase.co:5432/postgres",
      "not a url",
    ])
      expect(() => assertLoopbackDatabaseUrl(url)).toThrow(/loopback|valid/);
  });

  it("refuses query parameters that move the connection off the checked host", () => {
    // node-postgres (pg-connection-string) and libpq both let these override
    // the URL's host, so a loopback hostname alone proves nothing.
    for (const url of [
      "postgresql://postgres@127.0.0.1:5432/db?host=db.example.supabase.co",
      "postgresql://postgres@localhost:5432/db?sslmode=disable&hostaddr=10.0.0.5",
      "postgresql://postgres@localhost/db?service=production",
      "postgresql://postgres@localhost/db?HOST=db.example.supabase.co",
    ])
      expect(() => assertLoopbackDatabaseUrl(url), url).toThrow(
        /host|hostaddr|service/,
      );
    expect(() =>
      assertLoopbackDatabaseUrl(
        "postgresql://postgres@127.0.0.1:5432/db?sslmode=disable",
      ),
    ).not.toThrow();
  });

  it("refuses a URL that is not a Postgres URL", () => {
    expect(() => assertLoopbackDatabaseUrl("http://127.0.0.1:5432/db")).toThrow(
      /Postgres/,
    );
  });
});

const OURS = "a".repeat(64);
const THEIRS = "b".repeat(64);

describe("containerAction", () => {
  it("creates a container that does not exist", () => {
    expect(
      containerAction({ name: "x-pg", existingId: null, recorded: [] }),
    ).toBe("create");
  });

  it("replaces only the container whose id this stack's state file records", () => {
    expect(
      containerAction({
        name: "x-pg",
        existingId: OURS,
        recorded: [{ name: "x-pg", id: OURS }],
      }),
    ).toBe("replace");
  });

  it("refuses a same-named container this stack did not start", () => {
    expect(() =>
      containerAction({
        name: "x-pg",
        existingId: THEIRS,
        recorded: [{ name: "x-rest", id: OURS }],
      }),
    ).toThrow(/x-pg.*not start|state file/);
  });

  it("refuses a container that took a recorded name after this stack's was removed", () => {
    // The name matches the state file, the id does not: another session's.
    expect(() =>
      containerAction({
        name: "x-pg",
        existingId: THEIRS,
        recorded: [{ name: "x-pg", id: OURS }],
      }),
    ).toThrow(/x-pg.*not start|state file/);
  });

  it("refuses a name recorded without an id (an older state file)", () => {
    expect(() =>
      containerAction({ name: "x-pg", existingId: OURS, recorded: ["x-pg"] }),
    ).toThrow(/x-pg.*not start|state file/);
  });
});

describe("planRemoval", () => {
  const current = (entries: Record<string, string | null>) => (name: string) =>
    entries[name] ?? null;

  it("removes, by id, each recorded resource that still has its recorded id", () => {
    expect(
      planRemoval({
        prefix: "x",
        recorded: [{ name: "x-pg", id: OURS }],
        currentId: current({ "x-pg": OURS }),
      }),
    ).toEqual({ remove: [{ name: "x-pg", id: OURS }], skipped: [] });
  });

  it("leaves a same-named resource with another id alone", () => {
    const plan = planRemoval({
      prefix: "x",
      recorded: [{ name: "x-pg", id: OURS }],
      currentId: current({ "x-pg": THEIRS }),
    });
    expect(plan.remove).toEqual([]);
    expect(plan.skipped).toEqual([
      { name: "x-pg", reason: expect.stringMatching(/another|not the one/) },
    ]);
  });

  it("ignores a recorded name outside the configured prefix", () => {
    const plan = planRemoval({
      prefix: "x",
      recorded: [
        { name: "supabase_db_core", id: OURS },
        { name: "xy-pg", id: OURS },
      ],
      currentId: current({ supabase_db_core: OURS, "xy-pg": OURS }),
    });
    expect(plan.remove).toEqual([]);
    expect(plan.skipped.map((s) => s.name)).toEqual([
      "supabase_db_core",
      "xy-pg",
    ]);
    expect(plan.skipped[0]!.reason).toMatch(/prefix/);
  });

  it("removes nothing it has no recorded id for (an older state file)", () => {
    const plan = planRemoval({
      prefix: "x",
      recorded: ["x-pg"],
      currentId: current({ "x-pg": OURS }),
    });
    expect(plan.remove).toEqual([]);
    expect(plan.skipped).toEqual([
      { name: "x-pg", reason: expect.stringMatching(/no recorded id/) },
    ]);
  });

  it("has nothing to do for a resource that is already gone", () => {
    expect(
      planRemoval({
        prefix: "x",
        recorded: [{ name: "x-pg", id: OURS }],
        currentId: current({}),
      }),
    ).toEqual({ remove: [], skipped: [] });
  });
});

describe("defaultStateFile", () => {
  const tempDir = os.tmpdir();

  it("is specific to the checkout, so two worktrees never share one", () => {
    const a = defaultStateFile({
      name: "core-api-contract",
      repoRoot: path.join(tempDir, "worktrees", "a"),
      tempDir,
    });
    const b = defaultStateFile({
      name: "core-api-contract",
      repoRoot: path.join(tempDir, "worktrees", "b"),
      tempDir,
    });
    expect(a).not.toBe(b);
    expect(path.dirname(a)).toBe(tempDir);
    expect(path.basename(a)).toMatch(/^core-api-contract-/);
  });

  it("is stable for one checkout", () => {
    const options = {
      name: "core-api-contract",
      repoRoot: path.join(tempDir, "worktrees", "a"),
      tempDir,
    };
    expect(defaultStateFile(options)).toBe(defaultStateFile(options));
  });
});

describe("postgrestBinding", () => {
  it("binds PostgREST to loopback when it shares the host network", () => {
    expect(postgrestBinding({ hostNetwork: true, restPort: 54401 })).toEqual({
      serverHost: "127.0.0.1",
      serverPort: 54401,
      publish: null,
    });
  });

  it("publishes the container port on loopback only otherwise", () => {
    expect(postgrestBinding({ hostNetwork: false, restPort: 54401 })).toEqual({
      serverHost: "!4",
      serverPort: 3000,
      publish: "127.0.0.1:54401:3000",
    });
  });
});
