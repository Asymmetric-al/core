// AL-2675 (WP2c, part 1; plan 5.4): the operator list's one writer,
// scripts/platform/operators.mjs. Its arguments, the one address check it
// shares with the release job, and the rule that the person, the actor and the
// reason reach psql only as environment variables. The database behaviour is
// proved in tests/unit/acceptance/issue-2675/platform-operator-script.realstack.acceptance.test.ts.
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import {
  PSQL_INPUTS,
  admitDatabase,
  operatorScript,
  operatorStatements,
  parseArguments,
  psqlInputs,
} from "../../../scripts/platform/operators.mjs";

const REF = "abcdefghijklmnopqrst";
const ID = "0c6f1a5e-3b0b-4f61-9f8b-5a3b7f1d2e4c";

describe("operator script arguments", () => {
  it("reads add and remove with a login id or an email, an actor and a reason", () => {
    expect(
      parseArguments([
        "add",
        "--user",
        ID.toUpperCase(),
        "--actor",
        " Owner ",
        "--reason",
        "First operator",
      ]),
    ).toEqual({
      action: "add",
      userId: ID,
      actor: "Owner",
      reason: "First operator",
    });
    expect(
      parseArguments([
        "remove",
        "--reason",
        "Rotation",
        "--user",
        "Ops@Example.org",
        "--actor",
        "Owner",
      ]),
    ).toEqual({
      action: "remove",
      email: "ops@example.org",
      actor: "Owner",
      reason: "Rotation",
    });
    expect(parseArguments(["list"])).toEqual({ action: "list" });
  });

  it.each([
    [[]],
    [["grant", "--user", ID, "--actor", "a", "--reason", "r"]],
    [["add", "--user", ID, "--actor", "a"]],
    [["add", "--user", ID, "--reason", "r"]],
    [["add", "--actor", "a", "--reason", "r"]],
    [["add", "--user", ID, "--actor", "  ", "--reason", "r"]],
    [["add", "--user", ID, "--actor", "a", "--reason", ""]],
    [["add", "--user", "not-a-login", "--actor", "a", "--reason", "r"]],
    [["add", "--user", ID, "--user", ID, "--actor", "a", "--reason", "r"]],
    [["add", "--user", ID, "--actor", "a", "--reason", "line\nbreak"]],
    [["add", "--user", ID, "--actor", "a", "--reason", "x".repeat(501)]],
    [["add", "--user", ID, "--actor", "a", "--reason", "r", "--tenant", "t"]],
    [["list", "--user", ID]],
  ])("refuses %j", (argv) => {
    expect(() => parseArguments(argv)).toThrow();
  });
});

describe("operator script target (the release job's one address check)", () => {
  const local = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
  const pooled = `postgresql://postgres.${REF}:secret-value@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=/certs/project.crt`;

  it("admits a database on this machine without a project ref", () => {
    expect(admitDatabase({ OPERATORS_DATABASE_URL: local })).toBe(local);
  });

  it("admits a hosted address only for the postgres role of the named project, with TLS", () => {
    expect(
      admitDatabase({
        OPERATORS_DATABASE_URL: pooled,
        OPERATORS_SUPABASE_PROJECT_REF: REF,
      }),
    ).toBe(pooled);
  });

  it.each([
    pooled.replace("verify-full", "require"),
    `${pooled}&sslmode=verify-full`,
    pooled.replace("&sslrootcert=/certs/project.crt", ""),
  ])("requires exactly one verify-full mode and the project CA", (url) => {
    expect(() =>
      admitDatabase({
        OPERATORS_DATABASE_URL: url,
        OPERATORS_SUPABASE_PROJECT_REF: REF,
      }),
    ).toThrow(/OPERATORS_DATABASE_URL.*sslmode=verify-full.*project.*CA/i);
  });

  it.each([
    ["no URL", {}],
    [
      "a hosted address with no project ref",
      { OPERATORS_DATABASE_URL: pooled },
    ],
    [
      "a hosted address of another project",
      {
        OPERATORS_DATABASE_URL: pooled,
        OPERATORS_SUPABASE_PROJECT_REF: "zyxwvutsrqponmlkjihg",
      },
    ],
    [
      "a hosted address without TLS",
      {
        OPERATORS_DATABASE_URL: pooled.replace("sslmode=verify-full&", ""),
        OPERATORS_SUPABASE_PROJECT_REF: REF,
      },
    ],
    [
      "a hosted address as another role",
      {
        OPERATORS_DATABASE_URL: pooled.replace(
          `postgres.${REF}`,
          `authenticator.${REF}`,
        ),
        OPERATORS_SUPABASE_PROJECT_REF: REF,
      },
    ],
    [
      "a local-looking address with a routing override",
      { OPERATORS_DATABASE_URL: `${local}?host=db.${REF}.supabase.co` },
    ],
  ])("refuses %s, without repeating the address", (_name, env) => {
    let message = "";
    try {
      admitDatabase(env as Record<string, string>);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).not.toBe("");
    expect(message).not.toContain("secret-value");
    expect(message).not.toContain("pooler.supabase.com");
  });

  it("refuses a hosted address with no project ref before it starts psql", () => {
    const r = spawnSync(
      process.execPath,
      ["scripts/platform/operators.mjs", "list"],
      {
        encoding: "utf8",
        timeout: 30_000,
        env: {
          ...process.env,
          OPERATORS_DATABASE_URL: pooled,
          OPERATORS_SUPABASE_PROJECT_REF: "",
          PSQL_BIN: "/nonexistent/psql",
        },
      },
    );
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("OPERATORS_SUPABASE_PROJECT_REF");
    expect(r.stderr).not.toContain("could not run psql");
    expect(r.stderr).not.toContain("secret-value");
  });
});

describe("operator script statements", () => {
  it("runs each action in one transaction that locks the list against every other writer", () => {
    for (const action of ["add", "remove"] as const) {
      const sql = operatorScript(action);
      expect(sql.startsWith("BEGIN;\n")).toBe(true);
      expect(sql.endsWith("COMMIT;\n")).toBe(true);
      expect(sql).toContain(
        "LOCK TABLE authz.platform_operators IN SHARE ROW EXCLUSIVE MODE;",
      );
      expect(sql.indexOf("LOCK TABLE")).toBeLessThan(
        sql.indexOf(
          action === "add" ? "INSERT INTO authz" : "DELETE FROM authz",
        ),
      );
      expect(sql).toContain(
        "INSERT INTO public.audit_logs (tenant_id, user_id,",
      );
    }
    expect(operatorStatements("list")).not.toMatch(/INSERT|DELETE|UPDATE/);
  });

  it("passes the person, the actor and the reason to psql as environment variables, never in its text", () => {
    const parsed = parseArguments([
      "add",
      "--user",
      "o'brien@example.org",
      "--actor",
      "Robert'); DROP TABLE x; --",
      "--reason",
      "$add$ break out",
    ]);
    const sql = operatorScript(parsed.action);
    for (const value of ["o'brien", "DROP TABLE x", "break out"])
      expect(sql).not.toContain(value);
    expect(psqlInputs(parsed)).toEqual({
      [PSQL_INPUTS.userId]: "",
      [PSQL_INPUTS.email]: "o'brien@example.org",
      [PSQL_INPUTS.actor]: "Robert'); DROP TABLE x; --",
      [PSQL_INPUTS.reason]: "$add$ break out",
    });
    for (const name of Object.values(PSQL_INPUTS))
      expect(sql).toMatch(new RegExp(`^\\\\getenv op_\\w+ ${name}$`, "m"));
  });
});
