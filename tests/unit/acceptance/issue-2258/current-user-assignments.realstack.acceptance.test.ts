/**
 * #2258 real-stack acceptance (spec r2 = issue comment 6388953289, pins
 * addendum 1 = 6419311427, approved 6419380148): criteria 7 (R rows, R grants
 * incl. addendum 1 item 3's hosted-defaults case), 9 (R) and 17 (R). Runs in CI
 * `migrate` step "Verify tenant isolation (real stack)" through that step's
 * explicit path list (addendum 1 item 4), against the migrated PG17 superuser
 * URL TENANT_GUARD_IT_ADMIN_DATABASE_URL. Without the URL the DB block skips,
 * except in the CI `migrate` job, where it fails.
 *
 * Every check is one transaction, always rolled back, with the fixture created
 * inside it. Callers are emulated as PostgREST does it: SET LOCAL ROLE plus
 * request.jwt.claim.sub and request.jwt.claims = {"sub", "role"} with NO
 * app_metadata (r1 OQ8).
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as H from "./harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("#2258 current_user_assignments() (R)", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const id: Record<string, string> = {};
  for (const k of "TA TB U1 U2 U3 U4 m1 m2 m3 m4 m5 m6 m7 m8 m9".split(" "))
    id[k] = randomUUID();
  /**
   * §4 R fixture. m1 U1/TA staff+finance; m2 U1/TB donor; m3 U1/TB missionary
   * INACTIVE; m4 U2/TB missionary; m5-m7 U3/TA staff+member_care, donor,
   * missionary; m8-m9 U4/TA staff+finance, staff+member_care.
   */
  const MEMBERSHIPS: [
    string,
    string,
    string,
    string,
    string | null,
    boolean,
  ][] = [
    ["m1", "U1", "TA", "staff", "finance", true],
    ["m2", "U1", "TB", "donor", null, true],
    ["m3", "U1", "TB", "missionary", null, false],
    ["m4", "U2", "TB", "missionary", null, true],
    ["m5", "U3", "TA", "staff", "member_care", true],
    ["m6", "U3", "TA", "donor", null, true],
    ["m7", "U3", "TA", "missionary", null, true],
    ["m8", "U4", "TA", "staff", "finance", true],
    ["m9", "U4", "TA", "staff", "member_care", true],
  ];
  const q = (k: string) => `'${id[k]}'`;
  const FIXTURE = `insert into public.tenants (id, name, slug) values (${q("TA")}, 'acc2258 A', 'acc2258-' || ${q("TA")}), (${q("TB")}, 'acc2258 B', 'acc2258-' || ${q("TB")});
    insert into auth.users (id) values ${["U1", "U2", "U3", "U4"].map((u) => `(${q(u)})`).join(", ")};
    insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active) values ${MEMBERSHIPS.map(
      ([m, u, t, role, staff, active]) =>
        `(${q(m)}, ${q(u)}, ${q(t)}, '${role}', ${staff ? `'${staff}'` : "null"}, ${active})`,
    ).join(", ")};`;
  const keyOf = (v: unknown) =>
    Object.keys(id).find((k) => id[k] === v) ?? String(v);

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  async function tx(fn: () => Promise<void>) {
    await db.query("begin");
    try {
      await db.query(FIXTURE);
      await fn();
    } finally {
      await db.query("rollback");
    }
  }
  /** One statement as `role` with JWT subject `sub` (fixture key; null: no claims). Returns rows and SQLSTATE. */
  async function as(role: string, sub: string | null, sql: string) {
    await db.query("savepoint q");
    try {
      await db.query(`set local role ${role}`);
      await db.query(
        "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', $2, true)",
        sub
          ? [JSON.stringify({ sub: id[sub], role: "authenticated" }), id[sub]]
          : ["", ""],
      );
      const r = await db.query(sql);
      await db.query("rollback to savepoint q");
      return { rows: r.rows as Record<string, unknown>[], code: null };
    } catch (e) {
      await db.query("rollback to savepoint q");
      return { rows: [], code: (e as { code?: string }).code ?? String(e) };
    }
  }
  const CALL = `select * from ${H.FN}`;
  /** Fixture keys of the rows `sub` gets back, in RPC order. */
  async function rows(sub: string | null) {
    const r = await as("authenticated", sub, CALL);
    expect(r.code).toBeNull();
    return r.rows;
  }
  /** pg-backed port over the real RPC, values as PostgREST would serialize them (JSON). */
  const reader = (sub: string): H.Reader => ({
    async listActiveAssignments() {
      const r = await as(
        "authenticated",
        sub,
        `select coalesce(json_agg(t), '[]'::json) as rows from ${H.FN} t`,
      );
      if (r.code) throw new Error(`rpc failed: ${r.code}`);
      return r.rows[0]!.rows as H.Row[];
    },
  });
  const resolver = async () => {
    const spec: string = H.MOD.assignment;
    return (
      (await import(/* @vite-ignore */ spec)) as {
        resolveActiveAssignment: H.Resolve;
      }
    ).resolveActiveAssignment;
  };
  async function rerun() {
    expect(existsSync(H.MIGRATION), `${H.MIGRATION} must exist`).toBe(true);
    await db.query(H.migrationBatch());
  }
  async function proc() {
    const r = await db.query(
      `select p.prosecdef, p.provolatile, p.pronargs, p.proconfig,
              array(select distinct case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                      from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                     where a.grantee <> p.proowner order by 1) as grantees
         from pg_proc p where p.oid = to_regprocedure($1)`,
      [H.FN],
    );
    expect(r.rows, `${H.FN} must exist`).toHaveLength(1);
    return r.rows[0] as {
      prosecdef: boolean;
      provolatile: string;
      pronargs: number;
      proconfig: string[] | null;
      grantees: string[];
    };
  }

  describe("criterion 7 (R): rows", () => {
    it("7: U1 sees exactly {TA staff+finance, TB donor}, never U2's or the inactive row; every user_id = U1", () =>
      tx(async () => {
        const r = await rows("U1");
        expect(r.map((x) => keyOf(x.id)).sort()).toEqual(["m1", "m2"]);
        expect(new Set(r.map((x) => x.user_id))).toEqual(new Set([id.U1]));
        expect(Object.keys(r[0]!).sort()).toEqual([
          "id",
          "role",
          "staff_role",
          "tenant_id",
          "updated_at",
          "user_id",
        ]);
      }));
    it.each([
      ["U2", ["m4"]],
      ["U3", ["m5", "m6", "m7"]],
      ["U4", ["m8", "m9"]],
    ])("7: %s sees exactly its own active rows", (u, want) =>
      tx(async () =>
        expect((await rows(u)).map((x) => keyOf(x.id)).sort()).toEqual(want),
      ),
    );
    it("7: no sub gives 0 rows", () =>
      tx(async () => expect(await rows(null)).toEqual([])));
  });

  describe("criterion 7 (R): grants and attributes", () => {
    it("7: grantees other than the owner are exactly {authenticated}", () =>
      tx(async () =>
        expect((await proc()).grantees).toEqual(["authenticated"]),
      ));
    it.each([
      ["anon", null],
      ["anon", "U1"],
      ["service_role", null],
      ["service_role", "U1"],
    ] as const)("7: %s (sub %s) gets 42501", (role, sub) =>
      tx(async () => expect((await as(role, sub, CALL)).code).toBe("42501")),
    );
    it("7: prosecdef = false, provolatile = 's', pronargs = 0, proconfig has the empty search_path", () =>
      tx(async () => {
        const p = await proc();
        expect([p.prosecdef, p.provolatile, p.pronargs]).toEqual([
          false,
          "s",
          0,
        ]);
        expect(p.proconfig ?? []).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/^search_path=(""|'')$/),
          ]),
        );
      }));
    it("7 (addendum 1 item 3): hosted defaults: EXECUTE granted to PUBLIC, anon and service_role, then the migration body re-run → exactly {authenticated}", () =>
      tx(async () => {
        await db.query(
          `grant execute on function ${H.FN} to public, anon, service_role`,
        );
        expect((await proc()).grantees).toEqual(
          expect.arrayContaining(["anon", "service_role"]),
        );
        await rerun();
        expect((await proc()).grantees).toEqual(["authenticated"]);
        expect((await as("anon", "U1", CALL)).code).toBe("42501");
        expect((await as("service_role", null, CALL)).code).toBe("42501");
        expect((await rows("U1")).map((x) => keyOf(x.id)).sort()).toEqual([
          "m1",
          "m2",
        ]);
      }));
  });

  describe("criteria 9 and 17 (R): resolver through the real RPC (claimless JWTs)", () => {
    const resolve = async (
      sub: string,
      extra: { proposedAssignmentId?: string; expectedTenantId?: string } = {},
    ) => (await resolver())({ userId: id[sub]!, ...extra }, reader(sub));
    const pick = (r: Awaited<ReturnType<typeof resolve>>) =>
      r.ok
        ? [
            keyOf(r.assignment.assignmentId),
            keyOf(r.assignment.tenantId),
            r.selection,
          ]
        : [r.reason];

    it("9: U1 proposing its TA row gets tenantId TA and exactly one assignment", () =>
      tx(async () => {
        const r = await resolve("U1", { proposedAssignmentId: id.m1 });
        expect(pick(r)).toEqual(["m1", "TA", "proposed"]);
        expect(Object.values(r).some(Array.isArray)).toBe(false);
      }));
    it("9: U1 proposing U2's row, or its own inactive row, gets not_owned_or_inactive", () =>
      tx(async () => {
        for (const m of ["m4", "m3"])
          expect(
            pick(await resolve("U1", { proposedAssignmentId: id[m] })),
          ).toEqual(["not_owned_or_inactive"]);
      }));
    it.each([
      [
        "17: U3, no proposal → its staff+member_care row, default_staff",
        "U3",
        {},
        ["m5", "TA", "default_staff"],
      ],
      ["17: U4 (two staff roles) → ambiguous", "U4", {}, ["ambiguous"]],
      ["17: U1, no expectedTenantId → ambiguous (5a)", "U1", {}, ["ambiguous"]],
      [
        "17: U1, expectedTenantId TA → its staff row, sole",
        "U1",
        { expectedTenantId: "TA" },
        ["m1", "TA", "sole"],
      ],
    ] as const)("%s", (_n, sub, extra, want) =>
      tx(async () => {
        const e =
          "expectedTenantId" in extra
            ? { expectedTenantId: id[extra.expectedTenantId] }
            : {};
        expect(pick(await resolve(sub, e))).toEqual(want);
      }),
    );
  });
});
