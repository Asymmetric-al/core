/**
 * AL-2675 real-stack acceptance (WP2a, the membership core; plan 5.1, 5.4,
 * the WP2a paragraph, WP2 "Data" and "Interim rules"; audit A03, A06, A09,
 * NR-18, NR-49): the membership lifecycle, the tenant-administrator flag, the
 * assignments functions, the human-command preamble's capability and
 * revocation checks, the member directory, the data step, the sign-up rule
 * and the contribution trigger functions.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL (see ./harness.ts).
 */
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  DEMO_TENANT,
  DISPLAY,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
  migration,
  read,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("AL-2675 membership core (real stack)", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const id = fixtureIds();
  const as = asRole(db, id);
  const keyOf = (v: unknown) =>
    Object.keys(id).find((k) => id[k] === v) ?? String(v);
  const header = (m: string) => ({ "x-asym-assignment": id[m] ?? m });

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  async function tx(fn: () => Promise<void>) {
    await db.query("begin");
    try {
      await db.query(fixtureSql(id));
      await fn();
    } finally {
      await db.query("rollback");
    }
  }
  const rows = async (sql: string, params: unknown[] = []) =>
    (await db.query(sql, params)).rows as Record<string, unknown>[];
  const one = async (sql: string, params: unknown[] = []) =>
    (await rows(sql, params))[0]!;
  const membership = (m: string) =>
    one(
      "select id, is_active, revoked_at, granted_by, is_tenant_admin, staff_role from authz.memberships where id = $1",
      [id[m]],
    );

  describe("the membership row", () => {
    it("has granted_by, revoked_at and the flag, the lifecycle trigger, both checks and the active-membership index", () =>
      tx(async () => {
        const cols = await rows(
          `select column_name, data_type, is_nullable, column_default from information_schema.columns
            where table_schema = 'authz' and table_name = 'memberships'
              and column_name in ('granted_by', 'revoked_at', 'is_tenant_admin') order by 1`,
        );
        expect(cols).toEqual([
          {
            column_name: "granted_by",
            data_type: "uuid",
            is_nullable: "YES",
            column_default: null,
          },
          {
            column_name: "is_tenant_admin",
            data_type: "boolean",
            is_nullable: "NO",
            column_default: "false",
          },
          {
            column_name: "revoked_at",
            data_type: "timestamp with time zone",
            is_nullable: "YES",
            column_default: null,
          },
        ]);
        const checks = await rows(
          `select conname, pg_get_constraintdef(oid) def from pg_constraint
            where conrelid = 'authz.memberships'::regclass and contype = 'c' order by 1`,
        );
        expect(checks.map((c) => c.conname)).toEqual(
          expect.arrayContaining([
            "authz_memberships_live_chk",
            "authz_memberships_tenant_admin_staff_chk",
          ]),
        );
        const trigger = await one(
          `select tgname, tgenabled from pg_trigger where tgrelid = 'authz.memberships'::regclass and not tgisinternal`,
        );
        expect(trigger).toEqual({
          tgname: "authz_memberships_lifecycle",
          tgenabled: "O",
        });
        const index = await one(
          `select pg_get_indexdef('authz.authz_memberships_live_idx'::regclass) def`,
        );
        expect(index.def).toMatch(
          /\(user_id, tenant_id, role, staff_role\) INCLUDE \(is_tenant_admin\) WHERE is_active/,
        );
      }));

    it("revoking sets revoked_at and is_active = false together, whichever the writer sets", () =>
      tx(async () => {
        await db.query(
          "update authz.memberships set is_active = false where id = $1",
          [id.mDev],
        );
        const byFlag = await membership("mDev");
        expect(byFlag.is_active).toBe(false);
        expect(byFlag.revoked_at).toBeInstanceOf(Date);

        await db.query(
          "update authz.memberships set revoked_at = now() where id = $1",
          [id.mAdm],
        );
        const byStamp = await membership("mAdm");
        expect(byStamp.is_active).toBe(false);
        expect(byStamp.revoked_at).toBeInstanceOf(Date);
      }));

    it("granting a role held before revives the same row, clears revoked_at and records the new granted_by", () =>
      tx(async () => {
        const before = await membership("mRev");
        expect(before.is_active).toBe(false);
        expect(before.revoked_at).toBeInstanceOf(Date);
        const regrant = await one(
          `insert into authz.memberships (user_id, tenant_id, role, staff_role, granted_by)
           values ($1, $2, 'staff', 'hr', $3)
           on conflict (user_id, tenant_id, role, staff_role)
           do update set is_active = true, granted_by = excluded.granted_by
           returning id`,
          [id.UREV, id.TA, id.UADM],
        );
        expect(keyOf(regrant.id)).toBe("mRev");
        const after = await membership("mRev");
        expect(after).toMatchObject({
          is_active: true,
          revoked_at: null,
          granted_by: id.UADM,
        });
      }));

    // Council round 1 on WP2a, F1: a revocation must take the administration
    // with it, or the pinned re-grant above brings it back.
    it("revoking a flagged row clears the flag, so a re-grant with the same upsert brings no administration back", () =>
      tx(async () => {
        await db.query(
          "update authz.memberships set is_active = false where id = $1",
          [id.mAdm],
        );
        expect(await membership("mAdm")).toMatchObject({
          is_active: false,
          is_tenant_admin: false,
        });
        const regrant = await one(
          `insert into authz.memberships (user_id, tenant_id, role, staff_role, granted_by)
           values ($1, $2, 'staff', 'development', $3)
           on conflict (user_id, tenant_id, role, staff_role)
           do update set is_active = true, granted_by = excluded.granted_by
           returning id`,
          [id.UADM, id.TA, id.UDEV],
        );
        expect(keyOf(regrant.id)).toBe("mAdm");
        expect(await membership("mAdm")).toMatchObject({
          is_active: true,
          revoked_at: null,
          is_tenant_admin: false,
        });
      }));

    it("keeps the flag on a row granted with it in the statement that makes the row live", () =>
      tx(async () => {
        await db.query(
          "update authz.memberships set revoked_at = now() where id = $1",
          [id.mAdm],
        );
        await db.query(
          `insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin, granted_by)
           values ($1, $2, 'staff', 'development', true, $3)
           on conflict (user_id, tenant_id, role, staff_role)
           do update set is_active = true, is_tenant_admin = excluded.is_tenant_admin, granted_by = excluded.granted_by`,
          [id.UADM, id.TA, id.UDEV],
        );
        expect(await membership("mAdm")).toMatchObject({
          is_active: true,
          revoked_at: null,
          is_tenant_admin: true,
        });
      }));

    it("refuses the flag on a row that is not staff, and a live row that carries revoked_at", () =>
      tx(async () => {
        await db.query("savepoint s");
        await expect(
          db.query(
            "update authz.memberships set is_tenant_admin = true where id = $1",
            [id.mDonA],
          ),
        ).rejects.toMatchObject({ code: "23514" });
        await db.query("rollback to savepoint s");
        const live = await rows(
          "select count(*)::int n from authz.memberships where is_active <> (revoked_at is null)",
        );
        expect(live[0]!.n).toBe(0);
      }));
  });

  describe("the assignments functions return the flag", () => {
    it("current_user_assignments returns each live row with its flag and no revoked row", () =>
      tx(async () => {
        const adm = await as(
          "authenticated",
          { sub: "UADM" },
          "select id, tenant_id, role, staff_role, is_tenant_admin from public.current_user_assignments()",
        );
        expect(adm.code, adm.message).toBeNull();
        expect(
          adm.rows.map((r) => ({
            ...r,
            id: keyOf(r.id),
            tenant_id: keyOf(r.tenant_id),
          })),
        ).toEqual([
          {
            id: "mAdm",
            tenant_id: "TA",
            role: "staff",
            staff_role: "development",
            is_tenant_admin: true,
          },
        ]);
        const rev = await as(
          "authenticated",
          { sub: "UREV" },
          "select id from public.current_user_assignments()",
        );
        expect(rev.rows).toEqual([]);
      }));

    it("current_user_memberships returns the flag for one tenant", () =>
      tx(async () => {
        const r = await as(
          "authenticated",
          { sub: "UADM" },
          `select role, staff_role, is_active, is_tenant_admin from public.current_user_memberships('${id.TA}')`,
        );
        expect(r.code, r.message).toBeNull();
        expect(r.rows).toEqual([
          {
            role: "staff",
            staff_role: "development",
            is_active: true,
            is_tenant_admin: true,
          },
        ]);
      }));
  });

  describe("the human-command preamble (implementation record, section 9)", () => {
    // A guard-owned command calls the preamble as tenant_guard.
    const begin = (tenant: string, capability: string | null) =>
      `select (c).assignment_id, (c).is_tenant_admin, tenant_guard.current_tenant_id() entered
         from (select tenant_guard.begin_human_command('${id[tenant]}'${
           capability === null ? "" : `, '${capability}'`
         }) c) s`;

    it("enters the tenant only when the selected row holds the capability", () =>
      tx(async () => {
        const ok = await as(
          "tenant_guard",
          { sub: "UADM" },
          begin("TA", "people.manage_members"),
        );
        expect(ok.code, ok.message).toBeNull();
        expect({
          ...ok.rows[0],
          assignment_id: keyOf(ok.rows[0]!.assignment_id),
          entered: keyOf(ok.rows[0]!.entered),
        }).toEqual({
          assignment_id: "mAdm",
          is_tenant_admin: true,
          entered: "TA",
        });
        const refused = await as(
          "tenant_guard",
          { sub: "UDEV" },
          begin("TA", "people.manage_members"),
        );
        expect(refused.code).toBe("42501");
        expect(refused.message).toMatch(/does not hold the capability/);
      }));

    it("judges the one row the header names: finance has no care.access, member care has it", () =>
      tx(async () => {
        const finance = await as(
          "tenant_guard",
          { sub: "UFC", headers: header("mFin") },
          begin("TA", "care.access"),
        );
        expect(finance.code).toBe("42501");
        const care = await as(
          "tenant_guard",
          { sub: "UFC", headers: header("mCare") },
          begin("TA", "care.access"),
        );
        expect(care.code, care.message).toBeNull();
        expect(keyOf(care.rows[0]!.assignment_id)).toBe("mCare");
        const none = await as(
          "tenant_guard",
          { sub: "UFC" },
          begin("TA", "care.access"),
        );
        expect(none.code).toBe("42501");
        expect(none.message).toMatch(/several live assignments/);
      }));

    it("refuses a revoked row, named or not, and a revocation takes effect at the next call", () =>
      tx(async () => {
        const named = await as(
          "tenant_guard",
          { sub: "UREV", headers: header("mRev") },
          begin("TA", null),
        );
        expect(named.code).toBe("42501");
        const sole = await as(
          "tenant_guard",
          { sub: "UREV" },
          begin("TA", null),
        );
        expect(sole.code).toBe("42501");

        const before = await as(
          "tenant_guard",
          { sub: "UDEV" },
          begin("TA", "web_studio.publish"),
        );
        expect(before.code, before.message).toBeNull();
        await db.query(
          "update authz.memberships set is_active = false where id = $1",
          [id.mDev],
        );
        const after = await as(
          "tenant_guard",
          { sub: "UDEV" },
          begin("TA", "web_studio.publish"),
        );
        expect(after.code).toBe("42501");
      }));

    it("refuses an empty capability name, and the one-argument form still checks membership only", () =>
      tx(async () => {
        const empty = await as(
          "tenant_guard",
          { sub: "UADM" },
          begin("TA", " "),
        );
        expect(empty.code).toBe("22023");
        const plain = await as(
          "tenant_guard",
          { sub: "UDON" },
          begin("TA", null),
        );
        expect(plain.code, plain.message).toBeNull();
        expect(keyOf(plain.rows[0]!.assignment_id)).toBe("mDonA");
        const wrapper = await as(
          "authenticated",
          { sub: "UADM" },
          `select public.resolve_command_assignment('${id.TA}') r`,
        );
        expect(wrapper.code, wrapper.message).toBeNull();
      }));

    it("is one function, with the capability defaulted, executable by the guard role only", () =>
      tx(async () => {
        const acl = await rows(
          `select p.oid::regprocedure::text fn,
                  array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                          from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                         where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner order by 1) grantees
             from pg_proc p where p.proname in ('begin_human_command', 'assignment_capabilities')`,
        );
        expect(
          acl.sort((a, b) => (String(a.fn) < String(b.fn) ? -1 : 1)),
        ).toEqual([
          {
            fn: "authz.assignment_capabilities(uuid)",
            grantees: ["tenant_guard"],
          },
          {
            fn: "tenant_guard.begin_human_command(uuid,text)",
            grantees: ["tenant_guard"],
          },
        ]);
      }));
  });

  describe("the capability function judges one row alone", () => {
    it("returns nothing for a revoked, inactive or unknown row", () =>
      tx(async () => {
        const r = await one(
          `select authz.assignment_capabilities($1) revoked,
                  authz.assignment_capabilities(gen_random_uuid()) unknown`,
          [id.mRev],
        );
        expect(r).toEqual({ revoked: [], unknown: [] });
      }));

    it("gives a person with finance and member-care rows no care.access under the finance row", () =>
      tx(async () => {
        const r = await one(
          `select 'care.access' = any(authz.assignment_capabilities($1)) finance,
                  'care.access' = any(authz.assignment_capabilities($2)) care`,
          [id.mFin, id.mCare],
        );
        expect(r).toEqual({ finance: false, care: true });
      }));
  });

  describe("the member directory", () => {
    const DIRECTORY = (tenant: string) =>
      `select membership_id, user_id, display_name, role, staff_role, is_tenant_admin
         from public.tenant_member_directory('${id[tenant]}')`;

    it("returns the active tenant's live members and no others", () =>
      tx(async () => {
        const r = await as("authenticated", { sub: "UDEV" }, DIRECTORY("TA"));
        expect(r.code, r.message).toBeNull();
        expect(
          r.rows
            .map((row) => ({
              ...row,
              membership_id: keyOf(row.membership_id),
              user_id: keyOf(row.user_id),
            }))
            .sort((a, b) => a.membership_id.localeCompare(b.membership_id)),
        ).toEqual(
          [
            ["mAdm", "UADM", "staff", "development", true],
            ["mCare", "UFC", "staff", "member_care", false],
            ["mDev", "UDEV", "staff", "development", false],
            ["mDonA", "UDON", "donor", null, false],
            ["mFin", "UFC", "staff", "finance", false],
          ].map(([m, u, role, staff, admin]) => ({
            membership_id: m,
            user_id: u,
            display_name: DISPLAY[u as keyof typeof DISPLAY],
            role,
            staff_role: staff,
            is_tenant_admin: admin,
          })),
        );
        const b = await as("authenticated", { sub: "UB" }, DIRECTORY("TB"));
        expect(b.rows.map((row) => keyOf(row.membership_id)).sort()).toEqual([
          "mB",
          "mDonB",
        ]);
      }));

    it("refuses a caller with no live staff row in that tenant, an ambiguous caller, a foreign header and anon", () =>
      tx(async () => {
        for (const [caller, tenant] of [
          [{ sub: "UDEV" }, "TB"],
          [{ sub: "UDON" }, "TA"],
          [{ sub: "UREV" }, "TA"],
          [{ sub: "UFC" }, "TA"],
          [{ sub: "UDEV", headers: header("mAdm") }, "TA"],
          [{ sub: "UFC", headers: header("mDonA") }, "TA"],
        ] as const) {
          const r = await as("authenticated", caller, DIRECTORY(tenant));
          expect(r.code, JSON.stringify(caller)).toBe("42501");
        }
        const chosen = await as(
          "authenticated",
          { sub: "UFC", headers: header("mFin") },
          DIRECTORY("TA"),
        );
        expect(chosen.code, chosen.message).toBeNull();
        const anon = await as("anon", {}, DIRECTORY("TA"));
        expect(anon.code).toBe("42501");
      }));

    it("refuses at the next request once the caller's row is revoked", () =>
      tx(async () => {
        expect(
          (await as("authenticated", { sub: "UDEV" }, DIRECTORY("TA"))).code,
        ).toBeNull();
        await db.query(
          "update authz.memberships set is_active = false where id = $1",
          [id.mDev],
        );
        expect(
          (await as("authenticated", { sub: "UDEV" }, DIRECTORY("TA"))).code,
        ).toBe("42501");
      }));
  });

  /**
   * The WP2a sweep (NR-68): service-key server code reads a tenant's people
   * from membership. UDON holds donor rows in TA and TB; a profile holds one
   * tenant at most, so only membership gives each tenant its own members.
   */
  describe("the service-key member reader (sweep, NR-68)", () => {
    const READER = (tenant: string, args = "") =>
      `select membership_id, profile_id, role, staff_role, is_tenant_admin, is_live
         from public.tenant_member_profiles('${id[tenant]}'${args})`;
    const keys = (r: { rows: Record<string, unknown>[] }) =>
      r.rows.map((row) => keyOf(row.membership_id)).sort();

    it("gives each tenant its own live members, the two-tenant donor in both", () =>
      tx(async () => {
        const a = await as("service_role", {}, READER("TA"));
        expect(a.code, a.message).toBeNull();
        expect(keys(a)).toEqual(["mAdm", "mCare", "mDev", "mDonA", "mFin"]);
        const b = await as("service_role", {}, READER("TB"));
        expect(keys(b)).toEqual(["mB", "mDonB"]);
        const profile = await one(
          "select id from public.profiles where user_id = $1",
          [id.UDON],
        );
        for (const r of [a, b])
          expect(r.rows.map((row) => row.profile_id)).toContain(profile.id);
        expect(
          a.rows.find((row) => keyOf(row.membership_id) === "mAdm"),
        ).toMatchObject({
          role: "staff",
          is_tenant_admin: true,
          is_live: true,
        });
      }));

    it("narrows by profile or login, and keeps revoked rows only on request", () =>
      tx(async () => {
        const udon = await one(
          "select id from public.profiles where user_id = $1",
          [id.UDON],
        );
        const byProfile = await as(
          "service_role",
          {},
          READER("TB", `, array['${udon.id}']::uuid[]`),
        );
        expect(keys(byProfile)).toEqual(["mDonB"]);
        const byLogin = await as(
          "service_role",
          {},
          READER("TA", `, null, array['${id.UREV}', '${id.UB}']::uuid[]`),
        );
        expect(keys(byLogin)).toEqual([]);
        const history = await as(
          "service_role",
          {},
          READER("TA", `, null, array['${id.UREV}']::uuid[], true`),
        );
        expect(
          history.rows.map((row) => [keyOf(row.membership_id), row.is_live]),
        ).toEqual([["mRev", false]]);
      }));

    it("is executable by the service role only", () =>
      tx(async () => {
        for (const role of ["authenticated", "anon"]) {
          const r = await as(role, { sub: "UADM" }, READER("TA"));
          expect(r.code, role).toBe("42501");
        }
      }));
  });

  describe("the data step (WP2 'Data', 5.1)", () => {
    // Section 4 of the migration, run again on rows shaped like a hosted
    // database's: the migration itself ran on an empty one.
    const DATA_STEP = (() => {
      const text = read(
        migration("_membership_lifecycle_and_tenant_admin_flag"),
      );
      const start = text.indexOf("-- 4a. ");
      const end = text.indexOf(
        "DROP FUNCTION IF EXISTS public.current_user_assignments();",
      );
      return start >= 0 && end > start ? text.slice(start, end) : "";
    })();

    it("gives each legacy profile its membership, takes member care away from every staff row and flags admins", () =>
      tx(async () => {
        expect(DATA_STEP).not.toBe("");
        const legacy: Record<string, [string, string | null]> = {
          staffCare: ["staff", "TA"],
          adminNone: ["admin", "TA"],
          adminCare: ["admin", "TA"],
          donorNone: ["donor", "TA"],
          missNone: ["missionary", "TB"],
          superNoTenant: ["super_admin", null],
          financeRole: ["finance", "TA"],
          staffRevoked: ["staff", "TA"],
          careAndDev: ["staff", "TA"],
        };
        const people = Object.keys(legacy);
        const ids = Object.fromEntries(
          people.map((p) => [p, crypto.randomUUID()]),
        );
        await db.query(
          "insert into auth.users (id) select unnest($1::uuid[])",
          [Object.values(ids)],
        );
        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [Object.values(ids)],
        );
        for (const [p, [role, tenant]] of Object.entries(legacy))
          await db.query(
            "update public.profiles set role = $2, tenant_id = $3 where user_id = $1",
            [ids[p], role, tenant ? id[tenant] : null],
          );
        // Rows the 2026-02 backfill and later grants left behind.
        await db.query(
          `insert into authz.memberships (user_id, tenant_id, role, staff_role, is_active) values
             ($1, $5, 'staff', 'member_care', true),
             ($2, $5, 'staff', 'member_care', true),
             ($3, $5, 'staff', 'development', false),
             ($4, $5, 'staff', 'member_care', true),
             ($4, $5, 'staff', 'development', false)`,
          [
            ids.staffCare,
            ids.adminCare,
            ids.staffRevoked,
            ids.careAndDev,
            id.TA,
          ],
        );

        await db.query(DATA_STEP);

        const after = await rows(
          `select u.k, m.tenant_id, m.role::text, m.staff_role::text, m.is_tenant_admin, m.is_active,
                  coalesce(authz.assignment_capabilities(m.id), '{}') caps
             from unnest($1::text[], $2::uuid[]) u(k, user_id)
             join authz.memberships m on m.user_id = u.user_id
            order by u.k, m.staff_role nulls first, m.role`,
          [people, people.map((p) => ids[p])],
        );
        const view = after.map((r) => [
          r.k,
          r.tenant_id === DEMO_TENANT ? "DEMO" : keyOf(r.tenant_id),
          r.role,
          r.staff_role,
          r.is_tenant_admin,
          r.is_active,
        ]);
        expect(view).toEqual([
          ["adminCare", "TA", "staff", "development", true, true],
          ["adminNone", "TA", "staff", "development", true, true],
          ["careAndDev", "TA", "staff", "development", false, true],
          ["careAndDev", "TA", "staff", "member_care", false, false],
          ["donorNone", "TA", "donor", null, false, true],
          ["missNone", "TB", "missionary", null, false, true],
          ["staffCare", "TA", "staff", "development", false, true],
          ["staffRevoked", "TA", "staff", "development", false, false],
          ["superNoTenant", "DEMO", "staff", "development", true, true],
        ]);
        // A staff member created by the backfill holds the development
        // sub-role and not the care.access capability.
        const live = after.filter((r) => r.is_active && r.role === "staff");
        expect(live.length).toBeGreaterThan(0);
        for (const r of live) expect(r.caps).not.toContain("care.access");
        expect(
          after.find((r) => r.k === "adminNone")!.caps as string[],
        ).toContain("people.manage_members");
      }));
  });

  describe("sign-up for this release (WP2 'Interim rules')", () => {
    it("creates a profile with no tenant and a donor membership in the demo tenant, or the app-metadata tenant", () =>
      tx(async () => {
        const plain = crypto.randomUUID();
        const invited = crypto.randomUUID();
        await db.query(
          `insert into auth.users (id, raw_app_meta_data) values ($1, '{}'::jsonb), ($2, jsonb_build_object('tenant_id', $3::text))`,
          [plain, invited, id.TB],
        );
        const r = await rows(
          `select p.user_id, p.role, p.tenant_id profile_tenant, m.tenant_id, m.role::text membership_role, m.is_active
             from public.profiles p join authz.memberships m on m.user_id = p.user_id
            where p.user_id = any($1::uuid[]) order by p.user_id = $2 desc`,
          [[plain, invited], plain],
        );
        expect(r).toEqual([
          {
            user_id: plain,
            role: "donor",
            profile_tenant: null,
            tenant_id: DEMO_TENANT,
            membership_role: "donor",
            is_active: true,
          },
          {
            user_id: invited,
            role: "donor",
            profile_tenant: null,
            tenant_id: id.TB,
            membership_role: "donor",
            is_active: true,
          },
        ]);
      }));
  });

  describe("the contribution trigger functions test membership (NR-49)", () => {
    const PREF =
      "insert into public.contribution_approval_notification_preferences (tenant_id, profile_id) values ($1, $2) returning id";
    const profileOf = async (user: string) =>
      (
        await one("select id from public.profiles where user_id = $1", [
          id[user],
        ])
      ).id as string;

    it("accepts a profile whose login is a live member of the row's tenant, whatever the profile's tenant", () =>
      tx(async () => {
        const ub = await profileOf("UB");
        await db.query(
          "update public.profiles set tenant_id = $1 where id = $2",
          [id.TA, ub],
        );
        const inB = await one(PREF, [id.TB, ub]);
        expect(inB.id).toBeTruthy();
        await db.query(
          "insert into public.contribution_notification_settings (tenant_id, action_type, updated_by) values ($1, 'resend_receipt', $2)",
          [id.TB, ub],
        );
      }));

    it("refuses a profile with no live membership in the row's tenant", () =>
      tx(async () => {
        for (const [user, tenant, sql, message] of [
          [
            "UDEV",
            "TB",
            PREF,
            "contribution operation profile tenant mismatch",
          ],
          [
            "UREV",
            "TA",
            PREF,
            "contribution operation profile tenant mismatch",
          ],
          [
            "UDEV",
            "TB",
            "insert into public.contribution_notification_settings (tenant_id, action_type, updated_by) values ($1, 'resend_receipt', $2)",
            "contribution notification updater profile tenant mismatch",
          ],
        ] as const) {
          await db.query("savepoint s");
          await expect(
            db.query(sql, [id[tenant], await profileOf(user)]),
          ).rejects.toMatchObject({ code: "23514", message });
          await db.query("rollback to savepoint s");
        }
      }));

    it("does not judge an unchanged reference again after a revocation, and judges a new one", () =>
      tx(async () => {
        const dev = await profileOf("UDEV");
        const pref = await one(PREF, [id.TA, dev]);
        await db.query(
          "update authz.memberships set is_active = false where id = $1",
          [id.mDev],
        );
        await db.query(
          "update public.contribution_approval_notification_preferences set profile_id = profile_id, email_enabled = true where id = $1",
          [pref.id],
        );
        await db.query("savepoint s");
        await expect(
          db.query(
            "update public.contribution_approval_notification_preferences set profile_id = $2 where id = $1",
            [pref.id, await profileOf("UREV")],
          ),
        ).rejects.toMatchObject({ code: "23514" });
        await db.query("rollback to savepoint s");
      }));
  });
});
