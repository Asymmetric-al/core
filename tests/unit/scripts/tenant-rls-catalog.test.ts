import { describe, expect, it } from "vitest";

import {
  TENANT_RLS_CATALOG_SQL,
  evaluateTenantRlsCatalog,
  formatTenantRlsCatalogSummary,
} from "../../../scripts/verify/tenant-rls-catalog.mjs";

const table = (name: string, over: Record<string, unknown> = {}) => ({
  ...{ table: name, tenant: true, rls: true, force: true, policies: 1 },
  ...{ owner: "postgres", owner_bypass: true, ...over },
});
/** A compliant SECURITY DEFINER row: fixed empty search path, no PUBLIC or anon EXECUTE. */
const definer = (
  fn: string,
  owner = "postgres",
  bypass = true,
  over: Record<string, unknown> = {},
) => ({
  ...{ function: fn, schema: fn.split(".")[0], owner, owner_bypass: bypass },
  ...{ search_path: '""', volatility: "v" },
  ...{ public_execute: false, anon_execute: false, ...over },
});
/** The body of a human entry point that follows the convention. */
const HUMAN_BODY = `
DECLARE
  v_ctx tenant_guard.command_context;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id);
  RETURN NULL;
END;
`;
/** The body of a platform command that follows the convention. */
const PLATFORM_BODY = `
DECLARE
  v_operator uuid := platform.require_operator();
BEGIN
  RETURN pg_catalog.jsonb_build_object('operator', v_operator);
END;
`;
/** A command-schema function row; compliant worker entry point by default. */
const command = (fn: string, over: Record<string, unknown> = {}) => ({
  ...{ function: fn, schema: fn.split(".")[0], owner: "tenant_guard" },
  ...{ definer: true, authenticated: false, service_role: true },
  ...{ anon: false, public_execute: false, language: "plpgsql" },
  ...{ body: "BEGIN PERFORM tenant_guard.enter(p_tenant_id); END;", ...over },
});
/** A compliant human entry point row. */
const human = (fn: string, over: Record<string, unknown> = {}) =>
  command(fn, {
    authenticated: true,
    service_role: false,
    body: HUMAN_BODY,
    ...over,
  });
/** A compliant platform command row. */
const platformCommand = (fn: string, over: Record<string, unknown> = {}) =>
  command(fn, {
    owner: "postgres",
    authenticated: true,
    service_role: false,
    body: PLATFORM_BODY,
    ...over,
  });
/** A function outside the command schemas whose body calls into them; compliant service-key wrapper by default. */
const wrapper = (
  fn: string,
  body: string,
  over: Record<string, unknown> = {},
) => ({
  ...{ function: fn, schema: fn.split(".")[0], definer: false },
  ...{ search_path: '""', body, authenticated: false, anon: false },
  ...{ public_execute: false, ...over },
});
/** A table or column grant row as the catalog query reports one that no policy admits. */
const grant = (
  relation: string,
  grantee: string,
  privilege: string,
  over: { kind?: string; column?: string | null } = {},
) => ({ relation, column: null, kind: "r", grantee, privilege, ...over });
const listed = (...tables: string[]) => ({
  entries: tables.map((t) => ({ table: t, outcome: "deny_by_default" })),
});
const allow = (...fns: string[]) => ({
  entries: fns.map((f) => ({
    function: f,
    reason: "fixture",
    reviewed_by: "x",
  })),
});
const evaluate = (
  tables: object[],
  exceptions: unknown = listed(),
  definers: object[] = [],
  commands: object[] = [],
  anonAllowlist: unknown = allow(),
  more: { wrappers?: object[]; grants?: object[] } = {},
) =>
  evaluateTenantRlsCatalog(
    {
      tables,
      definers,
      commands,
      wrappers: more.wrappers ?? [],
      grants: more.grants ?? [],
    },
    exceptions,
    anonAllowlist,
  );
const codes = (result: ReturnType<typeof evaluate>) =>
  result.failures.map(
    (f: { code: string; table?: string; function?: string }) =>
      `${f.code} ${f.table ?? f.function ?? "-"}`,
  );

describe("evaluateTenantRlsCatalog", () => {
  it("passes a forced table with a policy and a listed zero-policy table, and counts them", () => {
    const plain = { tenant: false, rls: false, force: false, policies: 0 };
    const result = evaluate(
      [
        table("donors"),
        table("audit_backup", { policies: 0 }),
        table("plain", { ...plain, owner_bypass: false }),
      ],
      listed("audit_backup"),
      [definer("public.f()")],
      [human("tenant_guard.cmd(uuid)"), command("tenant_guard.work(uuid)")],
      allow(),
      {
        wrappers: [
          wrapper("public.cmd(uuid)", "SELECT tenant_guard.cmd(p_tenant_id);", {
            authenticated: true,
          }),
          wrapper("public.work(uuid)", "SELECT tenant_guard.work(p);"),
          // Mentions the schema but calls nothing in it: not a wrapper.
          wrapper("public.reads()", "SELECT kind FROM platform.environment;", {
            definer: true,
            search_path: null,
          }),
        ],
      },
    );
    expect(result.failures).toEqual([]);
    expect(result.counts).toEqual({
      ...{ tenant: 2, withPolicy: 1, listed: 1, stale: 0, definers: 1 },
      ...{ anonAllowed: 0, humanEntryPoints: 1, platformCommands: 0 },
      ...{ wrappers: 2 },
    });
    expect(formatTenantRlsCatalogSummary(result)).toBe(
      "PASS: tenant RLS catalog gate: 2 tenant tables enabled and forced (1 with policies, 1 listed deny-by-default, 0 stale), 1 SECURITY DEFINER functions with RLS-bypassing owners, a fixed search path and no PUBLIC EXECUTE (0 anon-allowlisted); command lanes: 1 human entry points, 0 platform commands, 2 wrappers; no table grant in public outside a policy.",
    );
  });

  it("reports every violated rule of one table with its own code", () => {
    const bad = { rls: false, force: false, policies: 0, owner: "app" };
    const result = evaluate([table("t", { ...bad, owner_bypass: false })]);
    expect(result.ok).toBe(false);
    expect(codes(result)).toEqual([
      "RLS_DISABLED t",
      "FORCE_MISSING t",
      "NO_POLICY_UNLISTED t",
      "OWNER_NO_BYPASS t",
    ]);
  });

  it("flags each kind of stale exception and counts them", () => {
    const result = evaluate(
      [table("has_policy"), table("not_tenant", { tenant: false })],
      listed("has_policy", "not_tenant", "dropped"),
    );
    expect(codes(result)).toEqual([
      "STALE_HAS_POLICY has_policy",
      "STALE_NOT_TENANT not_tenant",
      "STALE_MISSING_TABLE dropped",
    ]);
    expect(result.counts.stale).toBe(3);
  });

  it("exempts tenant_guard-owned definers in the tenant_guard schema only, and no other non-bypass owner", () => {
    const result = evaluate([], listed(), [
      definer("tenant_guard.owned()", "tenant_guard", false),
      definer("authz.f(uuid)", "app", false),
      definer("private.g()"),
      // AL-2674 council round 1 (A1): the exemption is bound to the schema.
      definer("public.guard_owned(uuid)", "tenant_guard", false),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_OWNER_NO_BYPASS authz.f(uuid)",
      "DEFINER_OWNER_NO_BYPASS public.guard_owned(uuid)",
    ]);
  });

  it.each<[string, unknown, string[]]>([
    ["an unreadable list", new Error("ENOENT"), ["EXCEPTIONS_MALFORMED -"]],
    ["a list without entries", {}, ["EXCEPTIONS_MALFORMED -"]],
    [
      "an entry without table",
      { entries: [{ outcome: "x" }] },
      ["EXCEPTIONS_MALFORMED -", "NO_POLICY_UNLISTED t"],
    ],
    [
      "a duplicate table",
      { entries: [{ table: "t" }, { table: "t" }] },
      ["EXCEPTIONS_MALFORMED t"],
    ],
  ])(
    "fails on %s, never guessing what is listed",
    (_, exceptions, expected) => {
      const result = evaluate([table("t", { policies: 0 })], exceptions);
      expect(codes(result)).toEqual(expected);
    },
  );
});

describe("evaluateTenantRlsCatalog: SECURITY DEFINER hygiene (AL-2674, plan 5.4)", () => {
  it("fails a definer with no fixed search path, in any app schema, the guard's included", () => {
    const result = evaluate([], listed(), [
      definer("public.a()", "postgres", true, { search_path: null }),
      definer("tenant_guard.b()", "tenant_guard", false, { search_path: null }),
      definer("platform.c()", "postgres", true, { search_path: null }),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_SEARCH_PATH_UNSET public.a()",
      "DEFINER_SEARCH_PATH_UNSET tenant_guard.b()",
      "DEFINER_SEARCH_PATH_UNSET platform.c()",
    ]);
  });

  it("requires the empty search path in tenant_guard and platform, and a path without $user elsewhere (A3)", () => {
    const at = (fn: string, path: string, owner = "postgres") =>
      definer(fn, owner, owner === "postgres", { search_path: path });
    const result = evaluate([], listed(), [
      at("tenant_guard.a()", '""', "tenant_guard"),
      at("tenant_guard.b()", "public", "tenant_guard"),
      at("platform.c()", '""'),
      at("platform.d()", "public, pg_temp"),
      at("public.e()", "public, pg_temp"),
      at("public.f()", "public"),
      at("authz.g()", "authz"),
      at("private.h()", "public, private"),
      at("public.i()", '"$user", public'),
      at("private.j()", 'public, "$user"'),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_SEARCH_PATH_UNSAFE tenant_guard.b()",
      "DEFINER_SEARCH_PATH_UNSAFE platform.d()",
      "DEFINER_SEARCH_PATH_UNSAFE public.i()",
      "DEFINER_SEARCH_PATH_UNSAFE private.j()",
    ]);
  });

  it("fails a definer that PUBLIC may execute, and anon with it", () => {
    const result = evaluate([], listed(), [
      definer("public.handle_new_user()", "postgres", true, {
        public_execute: true,
        anon_execute: true,
      }),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_PUBLIC_EXECUTE public.handle_new_user()",
      "DEFINER_ANON_EXECUTE public.handle_new_user()",
    ]);
  });

  it("fails a definer granted to anon by name unless it is allowlisted", () => {
    const granted = definer("public.read_x(uuid)", "postgres", true, {
      anon_execute: true,
      volatility: "s",
    });
    expect(codes(evaluate([], listed(), [granted]))).toEqual([
      "DEFINER_ANON_EXECUTE public.read_x(uuid)",
    ]);
    const result = evaluate(
      [],
      listed(),
      [granted],
      [],
      allow("public.read_x(uuid)"),
    );
    expect(result.failures).toEqual([]);
    expect(result.counts.anonAllowed).toBe(1);
  });

  it("fails an allowlisted function that is volatile or has a non-empty search path", () => {
    const result = evaluate(
      [],
      listed(),
      [
        definer("public.writes()", "postgres", true, { anon_execute: true }),
        definer("public.loose()", "postgres", true, {
          anon_execute: true,
          volatility: "s",
          search_path: "public",
        }),
      ],
      [],
      allow("public.writes()", "public.loose()"),
    );
    expect(codes(result)).toEqual([
      "ANON_ALLOWLISTED_UNSAFE public.writes()",
      "ANON_ALLOWLISTED_UNSAFE public.loose()",
    ]);
  });

  it("fails an allowlist entry whose function is gone or is not a definer", () => {
    const result = evaluate([], listed(), [], [], allow("public.dropped()"));
    expect(codes(result)).toEqual(["ANON_ALLOWLIST_STALE public.dropped()"]);
  });

  it.each<[string, unknown, string[]]>([
    ["an unreadable list", new Error("ENOENT"), ["ANON_ALLOWLIST_MALFORMED -"]],
    ["a list without entries", {}, ["ANON_ALLOWLIST_MALFORMED -"]],
    [
      "an entry without function",
      { entries: [{ reason: "r" }] },
      ["ANON_ALLOWLIST_MALFORMED -"],
    ],
    [
      "an entry without reason",
      { entries: [{ function: "public.f()" }] },
      ["ANON_ALLOWLIST_MALFORMED public.f()"],
    ],
    [
      "a duplicate function",
      {
        entries: [
          { function: "public.f()", reason: "r" },
          { function: "public.f()", reason: "r" },
        ],
      },
      ["ANON_ALLOWLIST_MALFORMED public.f()"],
    ],
  ])("fails on an anon allowlist with %s", (_, list, expected) => {
    const ok = definer("public.f()", "postgres", true, {
      volatility: "s",
      anon_execute: false,
    });
    expect(codes(evaluate([], listed(), [ok], [], list))).toEqual(expected);
  });
});

describe("evaluateTenantRlsCatalog: command lanes (AL-2674, plan 5.4)", () => {
  it("fails a tenant_guard function that both lanes may execute", () => {
    const result = evaluate(
      [],
      listed(),
      [],
      [human("tenant_guard.both(uuid)", { service_role: true })],
    );
    expect(codes(result)).toEqual([
      "COMMAND_LANE_MIXED tenant_guard.both(uuid)",
    ]);
  });

  it("fails a tenant_guard function signed-in users may execute without the human preamble", () => {
    const result = evaluate(
      [],
      listed(),
      [],
      [
        human("tenant_guard.no_preamble(uuid)", {
          body: "BEGIN RETURN NULL; END;",
        }),
        human("tenant_guard.enter(uuid)", {
          definer: false,
          owner: "postgres",
          body: "BEGIN PERFORM pg_catalog.set_config('x', '', true); END;",
        }),
        human("tenant_guard.wrong_owner(uuid)", { owner: "postgres" }),
        human("tenant_guard.ok(uuid)"),
        human("tenant_guard.perform(uuid)", {
          body: "BEGIN\n  PERFORM tenant_guard.begin_human_command(p_tenant_id);\n  RETURN 1;\nEND;",
        }),
      ],
    );
    expect(codes(result)).toEqual([
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.no_preamble(uuid)",
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.enter(uuid)",
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.wrong_owner(uuid)",
    ]);
    expect(result.counts.humanEntryPoints).toBe(5);
  });

  it("fails a platform function signed-in users may execute without the shared operator check", () => {
    const result = evaluate(
      [],
      listed(),
      [],
      [
        platformCommand("platform.unchecked(uuid)", {
          body: "BEGIN RETURN NULL; END;",
        }),
        platformCommand("platform.invoker(uuid)", { definer: false }),
        platformCommand("platform.provision(text)"),
        command("platform.health()", { owner: "postgres", definer: true }),
      ],
    );
    expect(codes(result)).toEqual([
      "PLATFORM_COMMAND_NO_OPERATOR_CHECK platform.unchecked(uuid)",
      "PLATFORM_COMMAND_NO_OPERATOR_CHECK platform.invoker(uuid)",
    ]);
    expect(result.counts.platformCommands).toBe(3);
  });

  it("fails any command-schema function PUBLIC or anon may execute, definer or not", () => {
    const result = evaluate(
      [],
      listed(),
      [],
      [
        command("tenant_guard.helper()", {
          definer: false,
          owner: "postgres",
          service_role: false,
          public_execute: true,
          anon: true,
          body: HUMAN_BODY,
        }),
        command("platform.read()", {
          owner: "postgres",
          service_role: false,
          anon: true,
        }),
      ],
    );
    expect(codes(result)).toEqual([
      "COMMAND_PUBLIC_EXECUTE tenant_guard.helper()",
      "COMMAND_PUBLIC_EXECUTE platform.read()",
    ]);
  });
});

describe("evaluateTenantRlsCatalog: the guard owner and the platform owner (AL-2674 council round 1, A1)", () => {
  it("fails a function owned by tenant_guard outside the tenant_guard schema, definer or invoker, in any schema", () => {
    const result = evaluate(
      [],
      listed(),
      [definer("public.act_as_guard(uuid)", "tenant_guard", false)],
      [
        // The council's case: a definer in public, owned by the guard, with a
        // fixed path, EXECUTE for authenticated and a body that enters a tenant.
        human("public.act_as_guard(uuid)", {
          body: "BEGIN PERFORM tenant_guard.enter(p_tenant_id); END;",
        }),
        command("private.helper()", { definer: false, service_role: false }),
        command("cms.elsewhere()", { authenticated: false }),
        human("tenant_guard.ok(uuid)"),
      ],
    );
    expect(codes(result)).toEqual([
      "DEFINER_OWNER_NO_BYPASS public.act_as_guard(uuid)",
      "GUARD_OWNED_OUTSIDE_SCHEMA public.act_as_guard(uuid)",
      "GUARD_OWNED_OUTSIDE_SCHEMA private.helper()",
      "GUARD_OWNED_OUTSIDE_SCHEMA cms.elsewhere()",
    ]);
    // A guard-owned function outside the schema is not counted as an entry point.
    expect(result.counts.humanEntryPoints).toBe(1);
  });

  it("fails a platform definer that postgres does not own, even one owned by a bypass role (plan 7.2)", () => {
    const result = evaluate([], listed(), [
      definer("platform.ok()", "postgres", true),
      definer("platform.guard()", "tenant_guard", false),
      definer("platform.admin()", "supabase_admin", true),
      definer("platform.app()", "app", false),
      // Outside platform, any owner that bypasses RLS may own a definer.
      definer("public.other()", "supabase_admin", true),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_OWNER_NO_BYPASS platform.guard()",
      "PLATFORM_DEFINER_OWNER platform.guard()",
      "PLATFORM_DEFINER_OWNER platform.admin()",
      "DEFINER_OWNER_NO_BYPASS platform.app()",
      "PLATFORM_DEFINER_OWNER platform.app()",
    ]);
  });
});

describe("evaluateTenantRlsCatalog: wrappers of the command lanes (AL-2674 council round 1, A2)", () => {
  const lanes = [
    human("tenant_guard.resolve(uuid)"),
    command("tenant_guard.acquire_claim(uuid)"),
    platformCommand("platform.provision(text)"),
    command("platform.health()", { owner: "postgres" }),
  ];
  const judge = (wrappers: object[]) =>
    evaluate([], listed(), [], lanes, allow(), { wrappers });

  it("passes invoker wrappers with a fixed path, granted to the lane their target belongs to", () => {
    const result = judge([
      wrapper("public.resolve(uuid)", "SELECT tenant_guard.resolve(p);", {
        authenticated: true,
      }),
      wrapper(
        "public.acquire_claim(uuid)",
        "SELECT tenant_guard.acquire_claim(p);",
      ),
      wrapper("public.provision(text)", "SELECT platform.provision(p);", {
        authenticated: true,
        search_path: "public",
      }),
      wrapper("public.platform_health()", "SELECT platform.health();"),
    ]);
    expect(result.failures).toEqual([]);
    expect(result.counts.wrappers).toBe(4);
  });

  it("fails the council's case: a postgres-owned definer wrapper that hands a worker entry point to signed-in users", () => {
    const result = judge([
      wrapper(
        "public.claim_for_anyone(uuid)",
        "SELECT tenant_guard.acquire_claim(p);",
        { definer: true, authenticated: true },
      ),
    ]);
    expect(codes(result)).toEqual([
      "WRAPPER_DEFINER public.claim_for_anyone(uuid)",
      "WRAPPER_GRANTS_WORKER public.claim_for_anyone(uuid)",
    ]);
  });

  it("fails a wrapper with no fixed path or one naming $user, and one PUBLIC or anon may execute", () => {
    const result = judge([
      wrapper("public.a(uuid)", "SELECT tenant_guard.resolve(p);", {
        search_path: null,
      }),
      wrapper("public.b(uuid)", "SELECT tenant_guard.resolve(p);", {
        search_path: '"$user", public',
      }),
      wrapper("public.c(uuid)", "SELECT tenant_guard.resolve(p);", {
        public_execute: true,
      }),
      wrapper("public.d()", "SELECT platform.health();", { anon: true }),
    ]);
    expect(codes(result)).toEqual([
      "WRAPPER_SEARCH_PATH public.a(uuid)",
      "WRAPPER_SEARCH_PATH public.b(uuid)",
      "WRAPPER_PUBLIC_EXECUTE public.c(uuid)",
      "WRAPPER_PUBLIC_EXECUTE public.d()",
    ]);
  });

  it("lets signed-in users execute a wrapper only when every target is a human entry point or a platform command", () => {
    const result = judge([
      wrapper("public.health_for_all()", "SELECT platform.health();", {
        authenticated: true,
      }),
      wrapper(
        "public.enter_any(uuid)",
        "BEGIN PERFORM tenant_guard.enter(p); END;",
        { authenticated: true },
      ),
      wrapper(
        "public.two(uuid)",
        'SELECT tenant_guard.resolve(p), "tenant_guard"."acquire_claim"(p);',
        { authenticated: true },
      ),
    ]);
    expect(codes(result)).toEqual([
      "WRAPPER_GRANTS_WORKER public.health_for_all()",
      "WRAPPER_GRANTS_WORKER public.enter_any(uuid)",
      "WRAPPER_GRANTS_WORKER public.two(uuid)",
    ]);
  });

  it("counts a call made through dynamic SQL, and ignores one that appears only in a comment", () => {
    const result = judge([
      wrapper(
        "public.dynamic(uuid)",
        "BEGIN EXECUTE 'SELECT tenant_guard.acquire_claim($1)' USING p; END;",
        { definer: true },
      ),
      wrapper(
        "public.commented()",
        "-- calls tenant_guard.acquire_claim(p) in a later release\n/* platform.health() */ SELECT 1;",
        { definer: true },
      ),
    ]);
    expect(codes(result)).toEqual(["WRAPPER_DEFINER public.dynamic(uuid)"]);
    expect(result.counts.wrappers).toBe(1);
  });
});

describe("evaluateTenantRlsCatalog: the preamble is the real first step (AL-2674 council round 1, A4)", () => {
  const humanWith = (body: string) =>
    evaluate([], listed(), [], [human("tenant_guard.cmd(uuid)", { body })]);
  const platformWith = (body: string) =>
    evaluate(
      [],
      listed(),
      [],
      [platformCommand("platform.cmd(uuid)", { body })],
    );
  const HUMAN_FAIL = ["COMMAND_HUMAN_NO_PREAMBLE tenant_guard.cmd(uuid)"];
  const PLATFORM_FAIL = [
    "PLATFORM_COMMAND_NO_OPERATOR_CHECK platform.cmd(uuid)",
  ];

  it.each<[string, string]>([
    [
      "a preamble whose refusal an EXCEPTION clause swallows",
      "BEGIN PERFORM tenant_guard.begin_human_command(p); EXCEPTION WHEN OTHERS THEN NULL; END;",
    ],
    [
      "the same, with the handler after a nested block and a CASE",
      `BEGIN
         v := tenant_guard.begin_human_command(p);
         BEGIN x := 1; EXCEPTION WHEN unique_violation THEN x := 2; END;
         y := CASE WHEN x = 1 THEN 'a' ELSE 'b' END;
         IF x = 1 THEN y := 'c'; END IF;
       EXCEPTION WHEN insufficient_privilege THEN RETURN NULL;
       END;`,
    ],
    [
      "a preamble that appears only in a comment",
      "BEGIN\n  -- v := tenant_guard.begin_human_command(p);\n  RETURN NULL;\nEND;",
    ],
    [
      "a preamble inside a block comment",
      "BEGIN /* PERFORM tenant_guard.begin_human_command(p); */ RETURN NULL; END;",
    ],
    [
      "a preamble that is not the first statement",
      "BEGIN PERFORM public.write_something(); PERFORM tenant_guard.begin_human_command(p); END;",
    ],
    [
      "a preamble inside a string",
      "BEGIN PERFORM 'tenant_guard.begin_human_command(p)'; END;",
    ],
    [
      "an EXCEPTION clause hidden from a naive comment strip by a string",
      "BEGIN PERFORM tenant_guard.begin_human_command(p); x := '/*'; EXCEPTION WHEN OTHERS THEN NULL; x := '*/'; END;",
    ],
  ])("fails a human entry point with %s", (_name, body) => {
    expect(codes(humanWith(body))).toEqual(HUMAN_FAIL);
  });

  it("fails a human entry point or a platform command written in SQL, not PL/pgSQL", () => {
    const result = evaluate(
      [],
      listed(),
      [],
      [
        human("tenant_guard.cmd(uuid)", {
          language: "sql",
          body: "SELECT tenant_guard.begin_human_command(p)",
        }),
        platformCommand("platform.cmd(uuid)", {
          language: "sql",
          body: "SELECT platform.require_operator()",
        }),
      ],
    );
    expect(codes(result)).toEqual([...HUMAN_FAIL, ...PLATFORM_FAIL]);
  });

  it.each<[string, string]>([
    ["the convention's form", HUMAN_BODY],
    [
      "PERFORM, comments and a nested handler that does not enclose the preamble",
      `-- resolve the assignment first
       DECLARE v_x int; /* a note */
       BEGIN
         PERFORM tenant_guard.begin_human_command(p_tenant_id); -- refuses
         BEGIN
           INSERT INTO public.t VALUES (1);
         EXCEPTION WHEN unique_violation THEN
           RAISE EXCEPTION 'tenant_guard: duplicate';
         END;
         v_x := CASE WHEN true THEN 1 END;
         FOR i IN 1..2 LOOP v_x := v_x + 1; END LOOP;
         RETURN v_x;
       END;`,
    ],
    [
      "a label, quoted words and a string that holds comment markers",
      `<<outer>>
       DECLARE v_note text := 'it''s -- not a comment';
       BEGIN
         v := tenant_guard.begin_human_command(p);
         RAISE NOTICE E'\\' EXCEPTION WHEN OTHERS';
         RETURN $q$ EXCEPTION WHEN OTHERS THEN $q$;
       END outer;`,
    ],
  ])("passes a human entry point with %s", (_name, body) => {
    expect(humanWith(body).failures).toEqual([]);
  });

  it.each<[string, string]>([
    [
      "an operator check whose refusal an EXCEPTION clause swallows",
      "BEGIN PERFORM platform.require_operator(); EXCEPTION WHEN OTHERS THEN NULL; END;",
    ],
    [
      "an operator check in the body instead of the DECLARE section",
      "DECLARE v uuid; BEGIN v := platform.require_operator(); RETURN v; END;",
    ],
    [
      "an operator check that appears only in a comment",
      "DECLARE v uuid; -- := platform.require_operator();\nBEGIN RETURN v; END;",
    ],
    [
      "an operator check wrapped in another call",
      "DECLARE v uuid := coalesce(platform.require_operator(), NULL); BEGIN RETURN v; END;",
    ],
    [
      "an operator check in a nested block's DECLARE",
      "BEGIN DECLARE v uuid := platform.require_operator(); BEGIN NULL; END; EXCEPTION WHEN OTHERS THEN NULL; END;",
    ],
  ])("fails a platform command with %s", (_name, body) => {
    expect(codes(platformWith(body))).toEqual(PLATFORM_FAIL);
  });

  it.each<[string, string]>([
    ["the convention's form", PLATFORM_BODY],
    [
      "DEFAULT, more declarations and a handler (a declaration's error is outside its block's handler)",
      `DECLARE
         v_reason text := p_reason;
         v_operator uuid DEFAULT platform.require_operator();
       BEGIN
         RETURN v_operator;
       EXCEPTION WHEN unique_violation THEN RETURN NULL;
       END;`,
    ],
  ])("passes a platform command with %s", (_name, body) => {
    expect(platformWith(body).failures).toEqual([]);
  });
});

describe("evaluateTenantRlsCatalog: table grants in public (AL-2674 council round 1, A5)", () => {
  it("fails each kind of grant the default-privileges migration closed, naming the relation", () => {
    const result = evaluate([], listed(), [], [], allow(), {
      grants: [
        grant("donors", "PUBLIC", "SELECT"),
        grant("donors", "anon", "TRUNCATE"),
        grant("donor_view", "authenticated", "REFERENCES"),
        grant("funds", "authenticated", "TRIGGER"),
        grant("funds", "anon", "MAINTAIN"),
        grant("donations", "anon", "SELECT"),
        grant("donations", "authenticated", "DELETE"),
      ],
    });
    expect(codes(result)).toEqual([
      "GRANT_TO_PUBLIC donors",
      "GRANT_UNSAFE_PRIVILEGE donors",
      "GRANT_UNSAFE_PRIVILEGE donor_view",
      "GRANT_UNSAFE_PRIVILEGE funds",
      "GRANT_UNSAFE_PRIVILEGE funds",
      "GRANT_WITHOUT_POLICY donations",
      "GRANT_WITHOUT_POLICY donations",
    ]);
    expect(result.failures[5]).toMatchObject({
      detail: expect.stringContaining("anon holds SELECT"),
    });
  });
});

describe("evaluateTenantRlsCatalog: council round 2 (A3)", () => {
  const lanes = [
    human("tenant_guard.resolve(uuid)"),
    command("tenant_guard.acquire_claim(uuid)"),
  ];
  const judge = (wrappers: object[]) =>
    evaluate([], listed(), [], lanes, allow(), { wrappers });

  it("reads a SQL-standard body as the catalog deparses it: a definer wrapper that hands a worker to signed-in users fails", () => {
    const result = judge([
      wrapper(
        "public.atomic_claim(uuid)",
        "\nBEGIN ATOMIC\n SELECT tenant_guard.acquire_claim(atomic_claim.p);\nEND",
        { definer: true, authenticated: true },
      ),
    ]);
    expect(codes(result)).toEqual([
      "WRAPPER_DEFINER public.atomic_claim(uuid)",
      "WRAPPER_GRANTS_WORKER public.atomic_claim(uuid)",
    ]);
  });

  it.each<[string, string]>([
    ["the guard schema alone", "tenant_guard"],
    ["the platform schema quoted, among others", '"platform", public'],
    ["the guard schema after pg_catalog", "pg_catalog, tenant_guard"],
  ])(
    "fails a function outside the command schemas whose search path names %s, whatever its body",
    (_name, searchPath) => {
      const result = judge([
        wrapper("public.unqualified(uuid)", "SELECT acquire_claim(p);", {
          definer: true,
          authenticated: true,
          search_path: searchPath,
        }),
      ]);
      expect(codes(result)).toEqual([
        "COMMAND_SCHEMA_ON_SEARCH_PATH public.unqualified(uuid)",
      ]);
    },
  );

  it.each<[string, string]>([
    ["an empty path", '""'],
    ["a path of ordinary schemas", "pg_catalog, public"],
    ["a schema whose name only contains a command schema's", "tenant_guard_x"],
    ["a quoted name that differs in case", '"Platform"'],
  ])("passes a function whose search path is %s", (_name, searchPath) => {
    const result = judge([
      wrapper("public.plain()", "SELECT 1;", { search_path: searchPath }),
    ]);
    expect(result.failures).toEqual([]);
  });

  const humanWith = (body: string) =>
    evaluate([], listed(), [], [human("tenant_guard.cmd(uuid)", { body })]);
  const platformWith = (body: string) =>
    evaluate(
      [],
      listed(),
      [],
      [platformCommand("platform.cmd(uuid)", { body })],
    );

  it.each<[string, string]>([
    [
      "PERFORM ... WHERE false, which never calls it",
      "BEGIN PERFORM tenant_guard.begin_human_command(p) WHERE false; RETURN 1; END;",
    ],
    [
      "a call inside a larger expression",
      "BEGIN v := tenant_guard.begin_human_command(p) IS NULL AND false; RETURN 1; END;",
    ],
    [
      "PERFORM ... FROM an empty set",
      "BEGIN PERFORM tenant_guard.begin_human_command(p) FROM pg_catalog.generate_series(1, 0); END;",
    ],
    [
      "a call that is never closed",
      "BEGIN PERFORM tenant_guard.begin_human_command(p; END;",
    ],
  ])("fails a human entry point whose first statement is %s", (_n, body) => {
    expect(codes(humanWith(body))).toEqual([
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.cmd(uuid)",
    ]);
  });

  it.each<[string, string]>([
    [
      "nested parentheses in its arguments",
      "BEGIN v := tenant_guard.begin_human_command(coalesce(p, (NULL)::uuid), 'x)'); RETURN v; END;",
    ],
    [
      "a quoted identifier that holds a parenthesis",
      'BEGIN PERFORM tenant_guard.begin_human_command(p."odd)name" ) ; END;',
    ],
  ])("passes a human entry point whose preamble has %s", (_n, body) => {
    expect(humanWith(body).failures).toEqual([]);
  });

  it("fails a platform command whose operator check is part of a larger initialiser", () => {
    expect(
      codes(
        platformWith(
          "DECLARE v boolean := platform.require_operator() IS NULL AND false; BEGIN RETURN v; END;",
        ),
      ),
    ).toEqual(["PLATFORM_COMMAND_NO_OPERATOR_CHECK platform.cmd(uuid)"]);
  });

  it("fails a grant to a Data API role on a view, a materialized view or a foreign table, and a column grant no policy admits", () => {
    const result = evaluate([], listed(), [], [], allow(), {
      grants: [
        grant("donor_view", "authenticated", "SELECT", { kind: "v" }),
        grant("donor_totals", "anon", "SELECT", { kind: "m" }),
        grant("donor_view", "authenticated", "UPDATE", {
          kind: "v",
          column: "name",
        }),
        grant("donations", "authenticated", "SELECT", { column: "amount" }),
        grant("donations", "anon", "REFERENCES", { column: "id" }),
      ],
    });
    expect(codes(result)).toEqual([
      "GRANT_ON_VIEW donor_view",
      "GRANT_ON_VIEW donor_totals",
      "GRANT_ON_VIEW donor_view",
      "GRANT_WITHOUT_POLICY donations",
      "GRANT_UNSAFE_PRIVILEGE donations",
    ]);
    expect(result.failures[3]).toMatchObject({
      detail: expect.stringContaining(
        "authenticated holds SELECT on column amount",
      ),
    });
  });
});

// AL-2674 A9 (plan 15.2): on Supabase's own image the guard cannot be granted
// anything on `auth`, so no function in a command schema may name it.
describe("evaluateTenantRlsCatalog: command schemas never use auth (A9)", () => {
  const helper = (fn: string, body: string, language = "sql") =>
    command(fn, {
      owner: "postgres",
      definer: false,
      service_role: false,
      language,
      body,
    });

  it.each<[string, object]>([
    [
      "a guard helper that calls auth.uid()",
      helper("tenant_guard.caller_id()", "SELECT auth.uid();"),
    ],
    [
      "a platform check that reads auth.jwt()",
      helper(
        "platform.require_operator()",
        "DECLARE v uuid; BEGIN IF auth.jwt() ->> 'aal' <> 'aal2' THEN RAISE EXCEPTION 'x'; END IF; RETURN v; END;",
        "plpgsql",
      ),
    ],
    [
      "a quoted schema name with spaces",
      helper("tenant_guard.who()", 'SELECT "auth" . uid();'),
    ],
    [
      "a SQL-standard body as the catalog deparses it",
      helper(
        "tenant_guard.who()",
        "\nBEGIN ATOMIC\n SELECT auth.uid() AS uid;\nEND",
      ),
    ],
    [
      "dynamic SQL",
      helper(
        "tenant_guard.who()",
        "BEGIN EXECUTE 'select auth.uid()'; END;",
        "plpgsql",
      ),
    ],
    [
      "a human entry point",
      human("tenant_guard.cmd(uuid)", {
        body: HUMAN_BODY.replace("RETURN NULL;", "RETURN auth.uid();"),
      }),
    ],
  ])("fails %s", (_name, row) => {
    const result = evaluate([], listed(), [], [row]);
    expect(
      codes(result).filter((code: string) =>
        code.startsWith("COMMAND_READS_AUTH"),
      ),
    ).toHaveLength(1);
  });

  it.each<[string, string]>([
    [
      "the claims settings",
      "SELECT pg_catalog.current_setting('request.jwt.claims', true)::jsonb ->> 'sub';",
    ],
    ["authz", "SELECT m.id FROM authz.memberships AS m;"],
    [
      "a comment that names auth.uid()",
      "-- not auth.uid(): the claims setting\nSELECT tenant_guard.caller_id();",
    ],
    [
      "a name that only ends in auth",
      "SELECT tenant_guard.request_auth_x(), v_auth.id FROM x AS v_auth;",
    ],
  ])("passes a body that reads %s", (_name, body) => {
    const result = evaluate(
      [],
      listed(),
      [],
      [helper("tenant_guard.ok()", body)],
    );
    expect(result.failures).toEqual([]);
  });
});

describe("TENANT_RLS_CATALOG_SQL", () => {
  it("reads SQL-standard bodies and search paths that name a command schema, and checks column grants", () => {
    // Commands and wrappers both read the deparsed SQL-standard body.
    expect(
      TENANT_RLS_CATALOG_SQL.match(/pg_get_function_sqlbody\(p\.oid\)/g),
    ).toHaveLength(3);
    expect(TENANT_RLS_CATALOG_SQL).toMatch(
      /search_path=%' limit 1\) ~\* '\(tenant_guard\|platform\)'/,
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain("aclexplode(att.attacl)");
    expect(TENANT_RLS_CATALOG_SQL).toContain("or c.relkind not in ('r', 'p')");
  });

  it("selects command rows by schema or by the guard owner, the wrappers outside the command schemas, and the unadmitted table grants", () => {
    expect(TENANT_RLS_CATALOG_SQL).toMatch(
      /n\.nspname in \('tenant_guard', 'platform'\)\s+or r\.rolname = 'tenant_guard'/,
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain("'wrappers'");
    expect(TENANT_RLS_CATALOG_SQL).toContain("'grants'");
    expect(TENANT_RLS_CATALOG_SQL).toContain(
      "a.privilege_type in ('TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN')",
    );
  });
});
