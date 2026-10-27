/** #2402 r1 + addendum criterion mapping:
 * c2/2a: fresh + hosted ACLs (M1 anon, M3 service_role); c3: private ACL/denials;
 * c4/5: catalog attributes/signatures; c6/7/8: denial matrix + exact snapshots
 * (M2 skipped tenant guard); c9: ownership/not-found; c10: delegated managers
 * (M4 delegate changes delegates); c11: original-body differential parity;
 * c12: unchanged memberships; c15: migration/rollback/migration round trip.
 * Private throwaway DB per file; no URL means clean skip. Never use shared DDL.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as H from "./harness";

const URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
describe.skipIf(!URL)("#2402 real-stack", () => {
  let s: H.Stack;
  beforeAll(async () => {
    s = new H.Stack(URL);
    await s.open();
  }, 120_000);
  afterAll(async () => {
    if (s) await s.close();
  });
  const tx = (fn: () => Promise<void>) => s.tx(fn);
  const check = (name: string, fn: () => Promise<void>) =>
    it(name, () => tx(fn));
  const invoke = (i: number, actor = "staff", a = input(i)) =>
    s.as("authenticated", actor, H.call(i, a));
  const input = (i: number, view?: string, patch?: unknown) =>
    H.args(i, s.ids.A!, view, patch);
  async function ok(i: number, actor = "staff", a = input(i)) {
    const r = await invoke(i, actor, a);
    expect(r.code).toBeNull();
    return r.value as Record<string, unknown>;
  }
  async function denied(
    role: "anon" | "authenticated" | "service_role",
    actor: string | null,
    i: number,
    tenant: string,
  ) {
    const before = await s.snapshot();
    expect((await s.as(role, actor, H.call(i, H.args(i, tenant)))).code).toBe(
      "42501",
    );
    expect(await s.snapshot()).toEqual(before);
  }
  async function acl(schema: string, grantees: string[]) {
    const rows = await s.catalog(schema);
    expect(rows).toHaveLength(5);
    for (const row of rows) {
      expect(row.owner).toBe("postgres");
      expect(row.grantees).toEqual(grantees);
    }
  }
  check("2-5: wrapper/body ACLs, attributes and signatures", async () => {
    await acl("public", ["authenticated", "postgres"]);
    await acl("private", ["postgres"]);
    for (const p of await s.catalog()) {
      expect(p.prosecdef).toBe(true);
      expect(p.proconfig).toContain('search_path=""');
      expect(p.args).not.toMatch(/p_(profile|actor|user)|can_manage/i);
      expect(String(p.args).match(/uuid/g)).toHaveLength(1);
    }
  });
  check("2/2a M1/M3: remove hosted grants by name", async () => {
    const statements =
      H.code(H.read(H.FORWARD)).match(
        /\b(?:REVOKE|GRANT)\s+(?:ALL|EXECUTE)[\s\S]*?;/gi,
      ) ?? [];
    const grants = statements.filter((sql) =>
      H.FNS.some((f) => sql.includes(f)),
    );
    expect(grants.length).toBeGreaterThanOrEqual(15);
    for (const schema of ["public", "private"])
      for (const p of await s.catalog(schema))
        await s.db.query(
          `grant execute on function ${schema}.${p.proname}(${p.args}) to public,anon,authenticated,service_role`,
        );
    await s.db.query(grants.join("\n"));
    await acl("public", ["authenticated", "postgres"]);
    await acl("private", ["postgres"]);
    for (let i = 0; i < 5; i++)
      for (const role of ["anon", "service_role"] as const)
        await denied(role, "staff", i, s.ids.A!);
  });
  it.each(H.FNS)("3: private.%s denies all API roles", (fn) =>
    tx(async () => {
      const p = (await s.catalog("private", [fn]))[0];
      expect(p).toBeDefined();
      // Typed NULLs reach the original signature; permission must fail before its body runs.
      const types = String(p!.args)
        .split(",")
        .map((a) => a.trim().replace(/^\w+\s+/, ""));
      for (const role of ["anon", "authenticated", "service_role"] as const)
        expect(
          (
            await s.as(
              role,
              "staff",
              `select private.${fn}(${types.map((t) => `NULL::${t}`).join(",")})`,
            )
          ).code,
        ).toBe("42501");
    }),
  );
  for (let i = 0; i < 5; i++) {
    it.each([
      ["anon", null, "A"],
      ["anon", "staff", "A"],
      ["service_role", "staff", "A"],
      ["authenticated", null, "A"],
      ["authenticated", "missing", "A"],
      ["authenticated", "donor", "A"],
      ["authenticated", "inactive", "A"],
      ["authenticated", "staff", "B"],
      ["authenticated", "member", "B"],
    ] as const)(
      `6/7/8 (M2): ${H.FNS[i]} denies %s / %s / tenant %s without writes`,
      (role, actor, tenant) => tx(() => denied(role, actor, i, s.ids[tenant]!)),
    );
  }
  it.each(["staff", "admin", "member"])(
    "8/9 OQ2: %s writes in its profile tenant",
    (actor) =>
      tx(async () => {
        const created = await ok(0, actor);
        expect(created.profile_id).toBe(s.profiles[actor]);
        const updated = await ok(1, actor, input(1, String(created.id)));
        expect(updated.profile_id).toBe(s.profiles[actor]);
        expect((await ok(3, actor)).profile_id).toBe(s.profiles[actor]);
      }),
  );
  check("8 OQ2: super admin tenant authority", async () => {
    for (const tenant of [s.ids.A!, s.ids.B!])
      expect((await ok(0, "super", H.args(0, tenant))).tenant_id).toBe(tenant);
    const view = (
      await s.rows(
        "select id from public.crm_table_named_views where tenant_id=$1",
        [s.ids.B],
      )
    )[0]!.id;
    for (const i of [1, 3, 4, 2])
      await ok(i, "super", H.args(i, s.ids.B!, String(view)));
    await denied("authenticated", "super", 0, s.ids.missing!);
  });
  check("9: other users' views are unchanged/not found", async () => {
    const foreign = await ok(0, "admin");
    const before = await s.snapshot();
    for (const view of [String(foreign.id), s.ids.missing!]) {
      expect((await invoke(1, "staff", input(1, view))).value).toBeNull();
      expect((await invoke(2, "staff", input(2, view))).value).toEqual({
        deleted: false,
        reason: "view_not_found",
      });
    }
    expect(
      (
        await invoke(
          3,
          "staff",
          input(3, undefined, { activeViewId: foreign.id }),
        )
      ).code,
    ).toBe("P0002");
    expect(await s.snapshot()).toEqual(before);
  });
  check("10 M4: delegate authority and audit identity", async () => {
    const delegates = {
      delegatedManagerProfileIds: [s.profiles.staff, s.profiles.donor],
    };
    expect(
      (await ok(4, "super", input(4, undefined, delegates))).updated_by,
    ).toBe(s.profiles.super);
    await denied("authenticated", "donor", 4, s.ids.A!);
    expect((await ok(4)).updated_by).toBe(s.profiles.staff);
    for (const patch of [
      { delegatedManagerProfileIds: [] },
      { delegatedManagerProfileIds: null },
      delegates,
    ]) {
      const before = await s.snapshot();
      expect((await invoke(4, "staff", input(4, undefined, patch))).code).toBe(
        "42501",
      );
      expect(await s.snapshot()).toEqual(before);
    }
    await denied("authenticated", "admin", 4, s.ids.A!);
    const audit = await s.db.query(
      "select actor_profile_id from public.crm_table_preference_audit_events where tenant_id=$1 order by created_at,id",
      [s.ids.A],
    );
    expect(audit.rows.map((r) => r.actor_profile_id).sort()).toEqual(
      [s.profiles.staff, s.profiles.super].sort(),
    );
    await ok(
      4,
      "super",
      input(4, undefined, {
        delegatedManagerProfileIds: [s.profiles.admin],
      }),
    );
    await denied("authenticated", "staff", 4, s.ids.A!);
    expect((await ok(4, "admin")).updated_by).toBe(s.profiles.admin);
  });
  check("OQ8: direct RPC validates tables and view names", async () => {
    for (let i = 0; i < 5; i++) {
      const a = input(i);
      a[1] = "crm.unknown";
      expect((await invoke(i, "staff", a)).code).toBe("22023");
    }
    for (const name of ["   ", "x".repeat(81)]) {
      const a = input(0);
      a[2] = name;
      expect((await invoke(0, "staff", a)).code).toBe("22023");
    }
  });
  check("11: differential parity with pinned develop bodies", async () => {
    async function scenario(old: boolean) {
      const values: unknown[] = [],
        views: string[] = [];
      async function run(i: number, a = input(i)) {
        const r = await s.as(
          old ? "service_role" : "authenticated",
          "staff",
          H.call(i, a, old ? s.profiles.staff : undefined),
        );
        values.push(r);
        if (i !== 3) expect(r.code).toBeNull();
        return r.value as Record<string, unknown>;
      }
      const first = await run(0);
      views.push(String(first.id));
      const a = input(0);
      a[2] = "Second";
      a[3] = true;
      views.push(String((await run(0, a)).id));
      const update = H.args(1, s.ids.A!, views[0], {
        columns: { designation: false },
      });
      await run(1, update);
      update[9] = false;
      update[5] = false;
      await run(1, update);
      update[8] = null;
      update[9] = true;
      update[5] = true;
      await run(1, update);
      await run(3, input(3, undefined, { activeViewId: views[0] }));
      values.push(await s.snapshot());
      const del = input(2, views[0]);
      del[3] = views[1]!;
      await run(2, del);
      values.push(await s.snapshot());
      await run(2, input(2, views[1]));
      for (const [activeViewId, state] of [
        [4, "22023"],
        ["bad", "22023"],
        [s.ids.missing, "P0002"],
      ]) {
        await run(3, input(3, undefined, { activeViewId }));
        expect((values.at(-1) as { code: string }).code).toBe(state);
      }
      await run(3, input(3, undefined, { activeViewId: null, columns: null }));
      const preference = input(3);
      preference[2] = null;
      await run(3, preference);
      preference[3] = false;
      await run(3, preference);
      values.push(await s.snapshot());
      return JSON.parse(
        JSON.stringify(values, (key, value: unknown) =>
          ["id", "created_at", "updated_at"].includes(key) ? undefined : value,
        ).replace(
          new RegExp(views.join("|"), "g"),
          (m) => `view${views.indexOf(m)}`,
        ),
      );
    }
    expect(H.read(H.ROLLBACK)).not.toBe("");
    await s.db.query("savepoint baseline");
    await s.db.query(H.batch(H.ROLLBACK));
    expect((await s.catalog()).map((r) => r.definition)).toEqual(
      s.original.map((r) => r.definition),
    );
    const before = await scenario(true);
    await s.db.query("rollback to savepoint baseline");
    expect(await scenario(false)).toEqual(before);
  });
  check("12: unchanged current_user_memberships grants", async () => {
    const rows = await s.catalog("public", ["current_user_memberships"]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.grantees).toEqual(["authenticated", "postgres"]);
    expect(
      (
        await s.as(
          "anon",
          "staff",
          `select public.current_user_memberships('${s.ids.A}')`,
        )
      ).code,
    ).toBe("42501");
  });
  check("15: migration/rollback/migration restores bodies/ACLs", async () => {
    expect(H.read(H.FORWARD)).not.toBe("");
    expect(H.read(H.ROLLBACK)).not.toBe("");
    const before = await s.snapshot();
    await s.db.query(H.batch(H.ROLLBACK));
    expect(await s.catalog()).toEqual(s.original);
    await acl("public", ["postgres", "service_role"]);
    expect(await s.snapshot()).toEqual(before);
    await s.db.query(H.batch(H.FORWARD));
    await acl("public", ["authenticated", "postgres"]);
    await acl("private", ["postgres"]);
    expect(await s.snapshot()).toEqual(before);
  });
});
