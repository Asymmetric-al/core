import { describe, expect, it } from "vitest";

import {
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
/** A command-schema function row; compliant worker entry point by default. */
const command = (fn: string, over: Record<string, unknown> = {}) => ({
  ...{ function: fn, schema: fn.split(".")[0], owner: "tenant_guard" },
  ...{ definer: true, authenticated: false, service_role: true },
  ...{ anon: false, public_execute: false, preamble: false, ...over },
});
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
) =>
  evaluateTenantRlsCatalog(
    { tables, definers, commands },
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
      [
        command("tenant_guard.cmd(uuid)", {
          authenticated: true,
          service_role: false,
          preamble: true,
        }),
        command("tenant_guard.work(uuid)"),
      ],
    );
    expect(result.failures).toEqual([]);
    expect(result.counts).toEqual({
      ...{ tenant: 2, withPolicy: 1, listed: 1, stale: 0, definers: 1 },
      ...{ anonAllowed: 0, humanEntryPoints: 1, platformCommands: 0 },
    });
    expect(formatTenantRlsCatalogSummary(result)).toBe(
      "PASS: tenant RLS catalog gate: 2 tenant tables enabled and forced (1 with policies, 1 listed deny-by-default, 0 stale), 1 SECURITY DEFINER functions with RLS-bypassing owners, a fixed search path and no PUBLIC EXECUTE (0 anon-allowlisted); command lanes: 1 human entry points, 0 platform commands.",
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

  it("exempts tenant_guard-owned definers but no other non-bypass owner", () => {
    const result = evaluate([], listed(), [
      definer("tenant_guard.owned()", "tenant_guard", false),
      definer("authz.f(uuid)", "app", false),
      definer("platform.p()", "app", false),
      definer("private.g()"),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_OWNER_NO_BYPASS authz.f(uuid)",
      "DEFINER_OWNER_NO_BYPASS platform.p()",
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
      definer("platform.c()", "postgres", true, { search_path: "public" }),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_SEARCH_PATH_UNSET public.a()",
      "DEFINER_SEARCH_PATH_UNSET tenant_guard.b()",
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
      [
        command("tenant_guard.both(uuid)", {
          authenticated: true,
          service_role: true,
          preamble: true,
        }),
      ],
    );
    expect(codes(result)).toEqual([
      "COMMAND_LANE_MIXED tenant_guard.both(uuid)",
    ]);
  });

  it("fails a tenant_guard function signed-in users may execute without the human preamble", () => {
    const human = { authenticated: true, service_role: false };
    const result = evaluate(
      [],
      listed(),
      [],
      [
        command("tenant_guard.no_preamble(uuid)", {
          ...human,
          preamble: false,
        }),
        command("tenant_guard.enter(uuid)", {
          ...human,
          definer: false,
          owner: "postgres",
        }),
        command("tenant_guard.wrong_owner(uuid)", {
          ...human,
          owner: "postgres",
          preamble: true,
        }),
        command("tenant_guard.ok(uuid)", { ...human, preamble: true }),
      ],
    );
    expect(codes(result)).toEqual([
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.no_preamble(uuid)",
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.enter(uuid)",
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.wrong_owner(uuid)",
    ]);
    expect(result.counts.humanEntryPoints).toBe(4);
  });

  it("fails a platform function signed-in users may execute without the shared operator check", () => {
    const signedIn = {
      owner: "postgres",
      authenticated: true,
      service_role: false,
    };
    const result = evaluate(
      [],
      listed(),
      [],
      [
        command("platform.unchecked(uuid)", { ...signedIn, preamble: false }),
        command("platform.invoker(uuid)", {
          ...signedIn,
          definer: false,
          preamble: true,
        }),
        command("platform.provision(text)", { ...signedIn, preamble: true }),
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
