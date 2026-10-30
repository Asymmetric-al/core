import { describe, expect, it } from "vitest";

import {
  evaluateTenantRlsCatalog,
  formatTenantRlsCatalogSummary,
} from "../../../scripts/verify/tenant-rls-catalog.mjs";

const table = (name: string, over: Record<string, unknown> = {}) => ({
  ...{ table: name, tenant: true, rls: true, force: true, policies: 1 },
  ...{ owner: "postgres", owner_bypass: true, ...over },
});
const definer = (fn: string, owner = "postgres", bypass = true) => ({
  ...{ function: fn, owner, owner_bypass: bypass },
});
const listed = (...tables: string[]) => ({
  entries: tables.map((t) => ({ table: t, outcome: "deny_by_default" })),
});
const evaluate = (
  tables: object[],
  exceptions: unknown = listed(),
  definers: object[] = [],
) => evaluateTenantRlsCatalog({ tables, definers }, exceptions);
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
    );
    expect(result.failures).toEqual([]);
    expect(result.counts).toEqual({
      ...{ tenant: 2, withPolicy: 1, listed: 1, stale: 0, definers: 1 },
    });
    expect(formatTenantRlsCatalogSummary(result)).toBe(
      "PASS: tenant RLS catalog gate: 2 tenant tables enabled and forced (1 with policies, 1 listed deny-by-default, 0 stale), 1 SECURITY DEFINER functions with RLS-bypassing owners.",
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
      definer("tenant_guard_owned()", "tenant_guard", false),
      definer("authz.f(uuid)", "app", false),
      definer("private.g()"),
    ]);
    expect(codes(result)).toEqual(["DEFINER_OWNER_NO_BYPASS authz.f(uuid)"]);
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
