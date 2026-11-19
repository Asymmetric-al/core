/**
 * #2708: the harness reads the Data API surface from supabase/config.toml and
 * hands it to PostgREST unchanged, stays on loopback, and removes only the
 * Docker resources it started. Pure: no real Docker or database.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

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

  it.each([
    "port=54322",
    "user=supabase_admin",
    "dbname=other",
    "PORT=54322",
    "password=secret",
    "sslpassword=secret",
  ])(
    "refuses a query override of the admitted database target (%s)",
    (override) => {
      expect(() =>
        assertLoopbackDatabaseUrl(
          `postgresql://postgres@127.0.0.1:5432/db?${override}`,
        ),
      ).toThrow(/Refusing DATABASE_URL/);
    },
  );

  it.each(["postgresql://localhost/db", "postgresql://postgres@localhost/"])(
    "requires an explicit login and database name (%s)",
    (url) =>
      expect(() => assertLoopbackDatabaseUrl(url)).toThrow(
        /login, and database name/,
      ),
  );

  it("refuses a URL that is not a Postgres URL", () => {
    expect(() => assertLoopbackDatabaseUrl("http://127.0.0.1:5432/db")).toThrow(
      /Postgres/,
    );
  });
});

describe.skipIf(process.platform === "win32")(
  "guarded API contract database writes",
  () => {
    const roots: string[] = [];
    afterEach(() => {
      for (const dir of roots.splice(0))
        rmSync(dir, { recursive: true, force: true });
    });

    function runWithMarker(command: string, marker: string) {
      const dir = mkdtempSync(
        path.join(os.tmpdir(), "core-api-contract-psql-"),
      );
      roots.push(dir);
      const psql = path.join(dir, "psql");
      const log = path.join(dir, "calls.jsonl");
      writeFileSync(log, "");
      writeFileSync(
        psql,
        `#!${process.execPath}
const fs = require("node:fs");
const args = process.argv.slice(2);
const sql = args[args.indexOf("-c") + 1] ?? "";
const input = args.includes("-") ? fs.readFileSync(0, "utf8") : "";
const pg = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("PG")));
fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify({ args, pg, input }) + "\\n");
const marker = ${JSON.stringify(marker)};
if (marker === "unreadable") process.exit(2);
if (sql.includes("to_regprocedure")) console.log(marker === "missing" ? "f" : "t");
else if (args.includes("-c")) console.log(marker);
`,
        { mode: 0o755 },
      );
      writeFileSync(
        path.join(dir, "docker"),
        "#!/bin/sh\necho fake docker invoked >&2\nexit 1\n",
        { mode: 0o755 },
      );
      const result = spawnSync(
        process.execPath,
        ["scripts/api-contract/stack.mjs", command],
        {
          encoding: "utf8",
          timeout: 5000,
          env: {
            ...process.env,
            PATH: `${dir}${path.delimiter}${process.env.PATH ?? ""}`,
            PSQL_BIN: psql,
            API_CONTRACT_NAME: "contract-psql-test",
            API_CONTRACT_STATE_FILE: path.join(dir, "state.json"),
            DATABASE_URL:
              "postgresql://postgres:fixture-password@127.0.0.1:1/contract",
            PGHOST: "localhost",
            PGHOSTADDR: "127.0.0.1",
            PGPORT: "2",
            PGDATABASE: "other",
            PGUSER: "other",
            PGSERVICE: "other",
            PGOPTIONS: "-c search_path=other",
            PGPASSWORD: "ambient-password",
          },
        },
      );
      const calls = readFileSync(log, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map(
          (line) =>
            JSON.parse(line) as {
              args: string[];
              pg: Record<string, string>;
              input: string;
            },
        );
      return { result, calls };
    }

    it.each([
      ["seed", "shared", /is marked shared/],
      ["prepare", "production", /is marked production/],
      ["seed", "missing", /has no environment marker/],
      ["prepare", "unreadable", /could not read the environment marker/],
    ] as const)(
      "%s refuses a %s marker before any write",
      (command, marker, reason) => {
        const { result, calls } = runWithMarker(command, marker);
        expect(result.status).toBe(1);
        expect(result.stderr).toMatch(reason);
        expect(result.stderr).not.toContain("fake docker invoked");
        expect(calls).toHaveLength(
          ["missing", "unreadable"].includes(marker) ? 1 : 2,
        );
        expect(calls.every(({ args }) => args.includes("-c"))).toBe(true);
      },
    );

    it.each(["seed", "prepare"])(
      "%s uses the marker target and keeps passwords out of arguments",
      (command) => {
        const { result, calls } = runWithMarker(command, "disposable");
        if (command === "seed") expect(result.status).toBe(0);
        else expect(result.stderr).toContain("fake docker invoked");
        expect(calls).toHaveLength(3);
        for (const { args, pg } of calls) {
          expect(args[0]).toBe("postgresql://postgres@127.0.0.1:1/contract");
          expect(args.join(" ")).not.toContain("fixture-password");
          expect(pg).toEqual({ PGPASSWORD: "fixture-password" });
        }
        const write = calls[2]!;
        if (command === "seed")
          expect(write.args).toContain("supabase/seed.sql");
        else {
          expect(write.input).toContain(
            "CREATE OR REPLACE FUNCTION auth.uid()",
          );
          const password =
            /ALTER ROLE authenticator WITH LOGIN PASSWORD '([0-9a-f]{64})'/.exec(
              write.input,
            )?.[1];
          expect(password).toBeDefined();
          expect(write.args.join(" ")).not.toContain(password!);
        }
      },
    );
  },
);

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
