/**
 * #2708: a tenant fixture that fails part-way removes what it wrote before
 * the error reaches the test, so a failed run leaves no rows behind for the
 * next one. The failure is injected at the fixture's last write (the fund)
 * through a client that otherwise passes every query to the real database.
 */
import { afterAll, beforeAll, expect, it } from "vitest";

import { createTenantFixture, removeTenantFixture } from "./fixtures";
import { adminDatabase, describeLive } from "./live-stack";

import type pg from "pg";

describeLive("tenant fixture cleanup", (stack) => {
  let db: pg.Client;
  /** Ids the fixture wrote, captured from its inserts. */
  const written = { tenantId: "", userId: "" };

  beforeAll(async () => {
    db = await adminDatabase(stack);
  });

  afterAll(async () => {
    if (!db) return;
    // Whatever the assertions found, leave nothing behind for later tests.
    if (written.tenantId)
      await removeTenantFixture(db, {
        tenantId: written.tenantId,
        userId: written.userId,
      } as Parameters<typeof removeTenantFixture>[1]);
    await db.end();
  });

  /** The real client, except that the insert into `failAt` throws. */
  function failingAt(failAt: string): pg.Client {
    return new Proxy(db, {
      get(target, property, receiver) {
        if (property !== "query")
          return Reflect.get(target, property, receiver);
        return async (sql: unknown, values?: unknown[]) => {
          const text = typeof sql === "string" ? sql : "";
          if (text.startsWith('insert into "public"."tenants"'))
            written.tenantId = String(values?.[0]);
          if (text.startsWith('insert into "auth"."users"'))
            written.userId = String(values?.[0]);
          if (text.startsWith(`insert into ${failAt}`))
            throw new Error(`injected failure at ${failAt}`);
          return target.query(sql as string, values);
        };
      },
    });
  }

  it("removes every row it wrote when a later write fails, then rethrows", async () => {
    await expect(
      createTenantFixture(failingAt('"public"."funds"'), "Cleanup"),
    ).rejects.toThrow(/injected failure at "public"."funds"/);
    expect(written.tenantId, "the fixture wrote its tenant").not.toBe("");

    const { rows } = await db.query<{ table: string; n: number }>(
      `select 'public.tenants' as table, count(*)::int as n from public.tenants where id = $1
       union all select 'auth.users', count(*)::int from auth.users where id = $2
       union all select 'public.profiles', count(*)::int from public.profiles where id = $2
       union all select 'authz.memberships', count(*)::int from authz.memberships where user_id = $2
       union all select 'public.missionaries', count(*)::int from public.missionaries where tenant_id = $1
       union all select 'public.donors', count(*)::int from public.donors where tenant_id = $1
       union all select 'public.missionary_tasks', count(*)::int from public.missionary_tasks where missionary_id = $2
       union all select 'public.donor_pledges', count(*)::int from public.donor_pledges where tenant_id = $1
       union all select 'public.donations', count(*)::int from public.donations where tenant_id = $1
       union all select 'public.posts', count(*)::int from public.posts where tenant_id = $1
       union all select 'public.locations', count(*)::int from public.locations where tenant_id = $1
       union all select 'public.funds', count(*)::int from public.funds where tenant_id = $1`,
      [written.tenantId, written.userId],
    );
    console.info(
      `API contract: a fixture failing at its last write left ${
        rows
          .filter((row) => row.n > 0)
          .map((row) => `${row.table} (${row.n})`)
          .join(", ") || "no row"
      } behind.`,
    );
    expect(
      rows.filter((row) => row.n > 0),
      "rows left behind by the failed fixture",
    ).toEqual([]);
  });
});
