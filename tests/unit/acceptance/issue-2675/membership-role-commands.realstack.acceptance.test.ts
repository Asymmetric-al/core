/**
 * AL-2675 (WP2c, part 1; plan 5.1, 5.4, 5.5 and 12 WP2c) real-stack acceptance
 * for the role-change and revoke commands, the human commands that replace
 * GraphQL `updateUserRole` and its SQL function:
 *
 *   "The role-change command: a tenant administrator promotes, demotes and
 *    revokes a member of their own tenant; a staff member without the flag is
 *    refused; nobody changes their own row; a platform operator's row is not a
 *    target; a person in another tenant is not a target; a revoked row loses
 *    the administrator flag (WP2a's rule) and its access at the next request.
 *    Each write leaves an audit row." (brief, from plan 12 WP2c)
 *
 * The commands write the membership (a staff row's sub-role and
 * tenant-administrator flag, the revocation) and never `profiles.role`. The
 * role change never changes a row's class: since the review of WP2c part 1
 * (WC5) it refuses one, either way, and says what to do instead (a class is
 * given by invitation and left by revocation). They keep every refusal the
 * retired function proved (tests/unit/acceptance/issue-2672/role-change-command.realstack.acceptance.test.ts):
 * no change of one's own row, no platform operator as a target (now the
 * operator list, not `profiles.role = 'super_admin'`). Another tenant's row
 * is never changed; it does not bar a local change.
 * Plan 5.4: a reason is required (WC10: one character that is not
 * whitespace), and the commands refuse to remove a tenant's last
 * administrator.
 *
 * Runs against the migrated database named by
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL; without it the block skips, except in
 * the CI `migrate` job, where it fails. Each check runs in its own transaction,
 * always rolled back, except the race at the end, which commits a tenant of
 * its own on two connections and removes it afterwards.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, fixtureIds, fixtureSql } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const OWN_ROLE = "Administrators cannot change their own role";
const OWN_REVOKE = "Administrators cannot revoke their own membership";
const PROTECTED = "This person's role cannot be changed here";
const CLASS_CHANGE =
  "A role change keeps the row's class: change the sub-role or the administrator flag of a staff row. Give a row of another class by invitation, and end one with revoke_membership";
const NOT_GRANTABLE =
  "This role cannot be granted by an organization administrator";
const NOT_FOUND = "No live membership with that id in this organization";
const REASON = "A reason is required";
const ALREADY_HELD =
  "This person already holds that role in this organization; change or revoke that row instead";
const LAST_ADMIN =
  "This is the organization's last administrator; make someone else an administrator first";
const NO_CAPABILITY =
  "tenant_guard: the selected assignment does not hold the capability this command requires";

type Outcome = {
  rows: Record<string, unknown>[];
  code: string | null;
  message: string;
};

describe.skipIf(!ADMIN_URL)(
  "AL-2675 WP2c: the role-change and revoke commands (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    let id: Record<string, string> = {};

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    /**
     * The harness fixture (TA, TB and their people), plus: UD1, a donor of TA
     * only (mD1); ADM2, a second administrator of TA (mAdm2); OPR, a
     * development staff member of TA who is on the operator list (mOpr); and
     * a revoked finance row of UDEV (mDevFin) that a change can revive.
     */
    async function tx(fn: () => Promise<void>) {
      id = fixtureIds();
      for (const k of ["UD1", "ADM2", "OPR", "mD1", "mAdm2", "mOpr", "mDevFin"])
        id[k] = randomUUID();
      await db.query("begin");
      try {
        await db.query(fixtureSql(id));
        await db.query(
          `insert into auth.users (id) values ($1), ($2), ($3);
           delete from authz.memberships where user_id in ($1, $2, $3);`.replace(
            /\$(\d)/g,
            (_m, n: string) => `'${[id.UD1, id.ADM2, id.OPR][Number(n) - 1]}'`,
          ),
        );
        await db.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values
             ('${id.mD1}', '${id.UD1}', '${id.TA}', 'donor', null, false, true),
             ('${id.mAdm2}', '${id.ADM2}', '${id.TA}', 'staff', 'development', true, true),
             ('${id.mOpr}', '${id.OPR}', '${id.TA}', 'staff', 'development', false, true),
             ('${id.mDevFin}', '${id.UDEV}', '${id.TA}', 'staff', 'finance', false, false);
           insert into authz.platform_operators (user_id, added_by, reason)
             values ('${id.OPR}', 'acceptance', 'WP2c fixture');`,
        );
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    /**
     * Runs one statement as a signed-in person, as PostgREST does, and keeps
     * what it wrote (the outer transaction is rolled back). The guard's tenant
     * setting is cleared afterwards, as it is at the end of a request.
     */
    async function call(
      who: string | null,
      sql: string,
      headers?: Record<string, string>,
      role = "authenticated",
    ): Promise<Outcome> {
      await db.query("savepoint call");
      try {
        await db.query(`set local role ${role}`);
        await db.query(
          `select set_config('request.jwt.claims', $1, true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', $2, true)`,
          [
            who ? JSON.stringify({ sub: id[who], role, aal: "aal1" }) : "",
            headers ? JSON.stringify(headers) : "",
          ],
        );
        const r = await db.query(sql);
        await db.query("reset role");
        await db.query(
          `select set_config('request.jwt.claims', '', true), set_config('request.headers', '', true),
                  set_config('app.current_tenant_id', '', true)`,
        );
        await db.query("release savepoint call");
        return { rows: r.rows, code: null, message: "" };
      } catch (e) {
        await db.query("rollback to savepoint call");
        const err = e as { code?: string; message?: string };
        return { rows: [], code: err.code ?? "?", message: err.message ?? "" };
      }
    }

    const lit = (v: string | null) =>
      v === null ? "null" : `'${v.replace(/'/g, "''")}'`;

    function change(
      who: string,
      row: string,
      to: { role: string; staff?: string | null; admin?: boolean },
      opts: { tenant?: string; reason?: string | null } = {},
    ) {
      const reason =
        opts.reason === undefined ? "Organization change" : opts.reason;
      return call(
        who,
        `select public.change_membership_role('${id[opts.tenant ?? "TA"]}', '${id[row] ?? row}', ${lit(to.role)}, ${lit(to.staff ?? null)}, ${to.admin ?? false}, ${lit(reason)}) as r`,
      );
    }

    function revoke(
      who: string,
      row: string,
      opts: { tenant?: string; reason?: string | null } = {},
    ) {
      const reason =
        opts.reason === undefined ? "Left the organization" : opts.reason;
      return call(
        who,
        `select public.revoke_membership('${id[opts.tenant ?? "TA"]}', '${id[row] ?? row}', ${lit(reason)}) as r`,
      );
    }

    async function membership(rowId: string) {
      const r = await db.query(
        `select user_id, tenant_id, role::text, staff_role::text, is_tenant_admin, is_active,
                revoked_at is not null as revoked, granted_by
           from authz.memberships where id = $1`,
        [rowId],
      );
      return r.rows[0] as Record<string, unknown> | undefined;
    }

    async function liveRows(user: string) {
      const r = await db.query(
        `select id, role::text, staff_role::text, is_tenant_admin from authz.memberships
          where user_id = $1 and tenant_id = $2 and is_active order by role, staff_role`,
        [id[user], id.TA],
      );
      return r.rows as Array<Record<string, unknown>>;
    }

    async function audits(tenant = "TA") {
      const r = await db.query(
        `select user_id, action, resource_type, resource_id, details from public.audit_logs
          where tenant_id = $1 and action in ('membership_role_changed', 'membership_revoked')
          order by created_at, id`,
        [id[tenant]],
      );
      return r.rows as Array<Record<string, unknown>>;
    }

    it("keeps membership audit writes exclusive to the commands on the joined chain", () =>
      tx(async () => {
        for (const action of [
          "membership_role_changed",
          "membership_revoked",
        ]) {
          const direct = await call(
            "UDEV",
            `insert into public.audit_logs (tenant_id,user_id,action,resource_type,resource_id,details)
          values ('${id.TA}','${id.UDEV}','${action}','membership','${id.mDev}','{}')`,
            { "x-asym-assignment": id.mDev },
          );
          expect(direct.code, direct.message).toBe("42501");
        }
        expect(await audits()).toEqual([]);
        const changed = await change("UADM", "mDev", {
          role: "staff",
          staff: "development",
          admin: true,
        });
        expect(changed.code, changed.message).toBeNull();
        const revoked = await revoke("UADM", "mDev");
        expect(revoked.code, revoked.message).toBeNull();
        expect((await audits()).map((row) => row.action).sort()).toEqual([
          "membership_revoked",
          "membership_role_changed",
        ]);
      }));

    describe("a tenant administrator", () => {
      // Review of WP2c part 1, WC5: the command changes a staff row only. A
      // change of class (a donor made staff, a staff member made a donor) is
      // refused below; within staff the old sub-role's row is revoked and the
      // new one granted or revived.
      it("moves a staff member to a new sub-role: the old row is revoked, a new one is granted by them, and one audit row says so", () =>
        tx(async () => {
          // The profile is display data: its role column is not written
          // (review 4650094382 on #2741: compared before and after, so any
          // write shows, not only one of the new sub-role).
          const profileRole = async () =>
            (
              await db.query(
                "select role from public.profiles where user_id = $1",
                [id.UDEV],
              )
            ).rows;
          const profileBefore = await profileRole();
          expect(profileBefore).toHaveLength(1);
          const out = await change(
            "UADM",
            "mDev",
            { role: "staff", staff: "hr" },
            { reason: "Moved to the HR team" },
          );
          expect(out.code, out.message).toBeNull();
          const r = out.rows[0]!.r as Record<string, unknown>;
          expect(r).toMatchObject({
            changed: true,
            tenant_id: id.TA,
            user_id: id.UDEV,
            previous_membership_id: id.mDev,
            role: "staff",
            staff_role: "hr",
            is_tenant_admin: false,
          });
          const granted = String(r.membership_id);
          expect(granted).not.toBe(id.mDev);
          expect(granted).not.toBe(id.mDevFin);
          expect(await membership(id.mDev)).toMatchObject({
            is_active: false,
            revoked: true,
            staff_role: "development",
          });
          expect(await membership(granted)).toMatchObject({
            user_id: id.UDEV,
            tenant_id: id.TA,
            role: "staff",
            staff_role: "hr",
            is_tenant_admin: false,
            is_active: true,
            revoked: false,
            granted_by: id.UADM,
          });
          expect(await audits()).toEqual([
            {
              user_id: id.UADM,
              action: "membership_role_changed",
              resource_type: "membership",
              resource_id: granted,
              details: {
                reason: "Moved to the HR team",
                assignment_id: id.mAdm,
                target_user_id: id.UDEV,
                from: {
                  membership_id: id.mDev,
                  role: "staff",
                  staff_role: "development",
                  is_tenant_admin: false,
                },
                to: {
                  membership_id: granted,
                  role: "staff",
                  staff_role: "hr",
                  is_tenant_admin: false,
                },
              },
            },
          ]);
          expect(await profileRole()).toEqual(profileBefore);
        }));

      it("makes a staff member an administrator on the same row, and demotes them again, each with an audit row", () =>
        tx(async () => {
          const up = await change("UADM", "mDev", {
            role: "staff",
            staff: "development",
            admin: true,
          });
          expect(up.code, up.message).toBeNull();
          expect(up.rows[0]!.r).toMatchObject({
            changed: true,
            membership_id: id.mDev,
            previous_membership_id: id.mDev,
            is_tenant_admin: true,
          });
          expect(await membership(id.mDev)).toMatchObject({
            is_tenant_admin: true,
            is_active: true,
          });
          const down = await change(
            "UADM",
            "mDev",
            { role: "staff", staff: "development", admin: false },
            { reason: "Stepped down" },
          );
          expect(down.code, down.message).toBeNull();
          expect(await membership(id.mDev)).toMatchObject({
            is_tenant_admin: false,
            is_active: true,
          });
          // Both rows carry the transaction's time, so they are compared as a set.
          const rows = (await audits()).map((a) => {
            const d = a.details as {
              reason: string;
              to: { is_tenant_admin: boolean };
            };
            return [a.action, d.to.is_tenant_admin, d.reason];
          });
          expect(rows).toHaveLength(2);
          expect(rows).toEqual(
            expect.arrayContaining([
              ["membership_role_changed", true, "Organization change"],
              ["membership_role_changed", false, "Stepped down"],
            ]),
          );
        }));

      it("demotes another administrator", () =>
        tx(async () => {
          const out = await change("UADM", "mAdm2", {
            role: "staff",
            staff: "development",
            admin: false,
          });
          expect(out.code, out.message).toBeNull();
          expect(await membership(id.mAdm2)).toMatchObject({
            is_tenant_admin: false,
            is_active: true,
          });
          expect(await audits()).toHaveLength(1);
        }));

      it("changes nothing and writes nothing when the row already is what is asked", () =>
        tx(async () => {
          const out = await change("UADM", "mDev", {
            role: "staff",
            staff: "development",
            admin: false,
          });
          expect(out.code, out.message).toBeNull();
          expect(out.rows[0]!.r).toMatchObject({
            changed: false,
            membership_id: id.mDev,
          });
          expect(await audits()).toEqual([]);
        }));

      it("moves a staff member to another sub-role by reviving the row they held before, not by a second row", () =>
        tx(async () => {
          const out = await change("UADM", "mDev", {
            role: "staff",
            staff: "finance",
          });
          expect(out.code, out.message).toBeNull();
          expect(out.rows[0]!.r).toMatchObject({
            membership_id: id.mDevFin,
            previous_membership_id: id.mDev,
          });
          expect(await membership(id.mDevFin)).toMatchObject({
            is_active: true,
            revoked: false,
            granted_by: id.UADM,
          });
          expect(await membership(id.mDev)).toMatchObject({
            is_active: false,
            revoked: true,
          });
          expect(await liveRows("UDEV")).toEqual([
            {
              id: id.mDevFin,
              role: "staff",
              staff_role: "finance",
              is_tenant_admin: false,
            },
          ]);
        }));

      it("revokes a member: the row is revoked, loses the administrator flag, and its access ends at the next request", () =>
        tx(async () => {
          const before = await call(
            "ADM2",
            `select public.resolve_command_assignment('${id.TA}') as r`,
          );
          expect(before.code, before.message).toBeNull();
          const out = await revoke("UADM", "mAdm2", {
            reason: "Left the organization",
          });
          expect(out.code, out.message).toBeNull();
          expect(out.rows[0]!.r).toMatchObject({
            changed: true,
            tenant_id: id.TA,
            membership_id: id.mAdm2,
            user_id: id.ADM2,
          });
          expect(await membership(id.mAdm2)).toMatchObject({
            is_active: false,
            revoked: true,
            is_tenant_admin: false,
          });
          expect(await audits()).toEqual([
            {
              user_id: id.UADM,
              action: "membership_revoked",
              resource_type: "membership",
              resource_id: id.mAdm2,
              details: {
                reason: "Left the organization",
                assignment_id: id.mAdm,
                target_user_id: id.ADM2,
                membership: {
                  role: "staff",
                  staff_role: "development",
                  is_tenant_admin: true,
                },
              },
            },
          ]);
          // The next request: the command lane, the membership helpers and the
          // resolver's own reader all refuse or omit the row.
          const after = await call(
            "ADM2",
            `select public.resolve_command_assignment('${id.TA}') as r`,
          );
          expect([after.code, after.message]).toEqual([
            "42501",
            "tenant_guard: the caller has no live assignment in this tenant",
          ]);
          const helper = await call(
            "ADM2",
            `select authz.has_membership('${id.TA}', null::authz.membership_role[]) as v`,
          );
          expect(helper.rows).toEqual([{ v: false }]);
          const assignments = await call(
            "ADM2",
            "select count(*)::int as n from public.current_user_assignments()",
          );
          expect(assignments.rows).toEqual([{ n: 0 }]);
          const asCaller = await change("ADM2", "mDev", {
            role: "staff",
            staff: "hr",
          });
          expect(asCaller.code).toBe("42501");
        }));

      it("revokes a member who also belongs to another organization", () =>
        tx(async () => {
          const out = await revoke("UADM", "mDonA");
          expect(out.code, out.message).toBeNull();
          expect(await membership(id.mDonA)).toMatchObject({
            is_active: false,
          });
          expect(await membership(id.mDonB)).toMatchObject({ is_active: true });
        }));
    });

    describe("refusals, each changing nothing and writing no audit row", () => {
      async function unchanged() {
        expect(await audits()).toEqual([]);
        expect(await audits("TB")).toEqual([]);
        expect(await membership(id.mD1)).toMatchObject({
          role: "donor",
          is_active: true,
        });
        expect(await membership(id.mDev)).toMatchObject({
          is_tenant_admin: false,
          is_active: true,
        });
        expect(await membership(id.mAdm)).toMatchObject({
          is_tenant_admin: true,
          is_active: true,
        });
      }

      it("refuses a staff member without the flag, and a donor", () =>
        tx(async () => {
          for (const who of ["UDEV", "UD1"]) {
            const a = await change(who, "mD1", {
              role: "staff",
              staff: "finance",
            });
            expect([who, a.code, a.message]).toEqual([
              who,
              "42501",
              NO_CAPABILITY,
            ]);
            const b = await revoke(who, "mD1");
            expect([who, b.code, b.message]).toEqual([
              who,
              "42501",
              NO_CAPABILITY,
            ]);
          }
          await unchanged();
        }));

      it("refuses an administrator's own row, for a change and for a revocation", () =>
        tx(async () => {
          const a = await change("UADM", "mAdm", {
            role: "staff",
            staff: "finance",
            admin: true,
          });
          expect([a.code, a.message]).toEqual(["42501", OWN_ROLE]);
          const b = await change("UADM", "mAdm", { role: "donor" });
          expect([b.code, b.message]).toEqual(["42501", OWN_ROLE]);
          const c = await revoke("UADM", "mAdm");
          expect([c.code, c.message]).toEqual(["42501", OWN_REVOKE]);
          await unchanged();
        }));

      it("refuses a platform operator's row as a target, judged by the operator list, without saying why", () =>
        tx(async () => {
          const a = await change("UADM", "mOpr", {
            role: "staff",
            staff: "development",
            admin: true,
          });
          expect([a.code, a.message]).toEqual(["42501", PROTECTED]);
          const b = await revoke("UADM", "mOpr");
          expect([b.code, b.message]).toEqual(["42501", PROTECTED]);
          expect(await membership(id.mOpr)).toMatchObject({
            is_active: true,
            is_tenant_admin: false,
          });
          // A request that changes nothing answers as for anyone (WC9): the
          // refusal comes after that answer, so it reveals nothing.
          const same = await change("UADM", "mOpr", {
            role: "staff",
            staff: "development",
          });
          expect(same.code, same.message).toBeNull();
          expect(same.rows[0]!.r).toMatchObject({ changed: false });
          // Off the list, the same row is an ordinary member's.
          await db.query(
            "delete from authz.platform_operators where user_id = $1",
            [id.OPR],
          );
          const c = await revoke("UADM", "mOpr");
          expect(c.code, c.message).toBeNull();
        }));

      it("refuses a person of another tenant: their row is not found here, and their tenant is not the caller's", () =>
        tx(async () => {
          const a = await change("UADM", "mB", { role: "donor" });
          expect([a.code, a.message]).toEqual(["P0002", NOT_FOUND]);
          const b = await revoke("UADM", "mB");
          expect([b.code, b.message]).toEqual(["P0002", NOT_FOUND]);
          const c = await change(
            "UADM",
            "mB",
            { role: "donor" },
            { tenant: "TB" },
          );
          expect(c.code).toBe("42501");
          const d = await revoke("UADM", "mB", { tenant: "TB" });
          expect(d.code).toBe("42501");
          expect(await membership(id.mB)).toMatchObject({
            role: "staff",
            is_active: true,
          });
          await unchanged();
        }));

      it("changes only the local role of a staff member with a donor row elsewhere", () =>
        tx(async () => {
          const other = await db.query(
            "insert into authz.memberships (user_id, tenant_id, role) values ($1, $2, 'donor') returning id",
            [id.UDEV, id.TB],
          );
          const out = await change("UADM", "mDev", {
            role: "staff",
            staff: "finance",
          });
          expect(out.code, out.message).toBeNull();
          expect(await membership(id.mDevFin)).toMatchObject({
            is_active: true,
            staff_role: "finance",
          });
          expect(await membership(other.rows[0].id)).toMatchObject({
            is_active: true,
            role: "donor",
            tenant_id: id.TB,
          });
          expect(await audits()).toHaveLength(1);
          expect(await audits("TB")).toEqual([]);
        }));

      // Review of WP2c part 1, WC5 (the coordinator's ruling): the command
      // changes the sub-role and the flag of a staff row, and refuses a change
      // of class either way. A row of another class is given by invitation
      // (WP3), and leaving a class is revoke_membership; ending a donor row to
      // make the person staff would take the donor portal from them, and
      // making staff a donor would leave their staff access unseen.
      it("refuses a change of class, either way, with what to do instead", () =>
        tx(async () => {
          for (const [row, to] of [
            ["mD1", { role: "staff", staff: "finance" }],
            ["mD1", { role: "missionary" }],
            ["mDev", { role: "donor" }],
            ["mDev", { role: "missionary" }],
            ["mDonA", { role: "staff", staff: "development", admin: true }],
          ] as const) {
            const out = await change("UADM", row, to);
            expect([row, out.code, out.message]).toEqual([
              row,
              "42501",
              CLASS_CHANGE,
            ]);
          }
          expect(await liveRows("UD1")).toEqual([
            {
              id: id.mD1,
              role: "donor",
              staff_role: null,
              is_tenant_admin: false,
            },
          ]);
          await unchanged();
        }));

      it("refuses even an unchanged request on a row of another class: it changes staff rows only", () =>
        tx(async () => {
          const out = await change("UADM", "mD1", { role: "donor" });
          expect([out.code, out.message]).toEqual(["42501", CLASS_CHANGE]);
          await unchanged();
        }));

      it("refuses to change a row into a role the person already holds live in another row, which would rewrite that row's flag", () =>
        tx(async () => {
          // UFC holds live finance and member-care rows in TA.
          for (const admin of [false, true]) {
            const out = await change("UADM", "mCare", {
              role: "staff",
              staff: "finance",
              admin,
            });
            expect([out.code, out.message]).toEqual(["23505", ALREADY_HELD]);
          }
          expect(await membership(id.mCare)).toMatchObject({ is_active: true });
          expect(await membership(id.mFin)).toMatchObject({
            is_active: true,
            is_tenant_admin: false,
          });
          await unchanged();
        }));

      it("refuses a revoked or unknown row as not found", () =>
        tx(async () => {
          for (const row of ["mRev", randomUUID()]) {
            const a = await change("UADM", row, { role: "donor" });
            expect([a.code, a.message]).toEqual(["P0002", NOT_FOUND]);
            const b = await revoke("UADM", row);
            expect([b.code, b.message]).toEqual(["P0002", NOT_FOUND]);
          }
          await unchanged();
        }));

      // WC10: a reason needs one character that is not whitespace.
      it("requires a reason with one character that is not whitespace", () =>
        tx(async () => {
          for (const reason of [null, "", "   ", "\t", "\n\r\n", " \t \n "]) {
            const a = await change(
              "UADM",
              "mDev",
              { role: "staff", staff: "finance" },
              { reason },
            );
            expect([a.code, a.message]).toEqual(["22023", REASON]);
            const b = await revoke("UADM", "mD1", { reason });
            expect([b.code, b.message]).toEqual(["22023", REASON]);
          }
          await unchanged();
          // A reason with surrounding whitespace is kept, trimmed.
          const ok = await change(
            "UADM",
            "mDev",
            { role: "staff", staff: "finance" },
            { reason: "\t Moved to finance \n" },
          );
          expect(ok.code, ok.message).toBeNull();
          expect(
            ((await audits())[0]!.details as { reason: string }).reason,
          ).toBe("Moved to finance");
        }));

      it.each([
        [{ role: "super_admin" }],
        [{ role: "admin" }],
        [{ role: "finance" }],
        [{ role: "" }],
        [{ role: "staff" }],
        [{ role: "staff", staff: "owner" }],
        [{ role: "donor", staff: "finance" }],
        [{ role: "donor", admin: true }],
        [{ role: "missionary", admin: true }],
      ])("refuses to grant %j, which is not a tenant role", (to) =>
        tx(async () => {
          const out = await change("UADM", "mD1", to);
          expect([out.code, out.message]).toEqual(["42501", NOT_GRANTABLE]);
          await unchanged();
        }),
      );

      it("refuses a request with no signed-in caller, and anyone but a signed-in user", () =>
        tx(async () => {
          const a = await call(
            null,
            `select public.change_membership_role('${id.TA}', '${id.mD1}', 'missionary', null, false, 'x') as r`,
          );
          expect(a.code).toBe("42501");
          for (const role of ["anon", "service_role"]) {
            const b = await call(
              "UADM",
              `select public.revoke_membership('${id.TA}', '${id.mD1}', 'x') as r`,
              undefined,
              role,
            );
            expect([role, b.code]).toEqual([role, "42501"]);
            expect(b.message).toMatch(/permission denied/);
          }
          await unchanged();
        }));

      it("acts only under the assignment the request names, which must be the caller's", () =>
        tx(async () => {
          const named = await call(
            "UADM",
            `select public.revoke_membership('${id.TA}', '${id.mD1}', 'x') as r`,
            { "x-asym-assignment": id.mDev },
          );
          expect(named.code).toBe("42501");
          await unchanged();
        }));
    });

    it("refuses to remove the last administrator, should another assignment ever hold people.manage_members", () =>
      tx(async () => {
        // Today only the tenant-administrator flag holds the capability, so a
        // caller is always an administrator who cannot target their own row,
        // and the rule cannot fire. Simulate an owner's later bundle that gives
        // it to the hr sub-role, inside this rolled-back transaction.
        await db.query(
          `alter function authz.assignment_capabilities(uuid) rename to assignment_capabilities_wp2c_orig;
           create function authz.assignment_capabilities(p_assignment_id uuid) returns text[]
             language sql stable set search_path = '' as $$
               select authz.assignment_capabilities_wp2c_orig(p_assignment_id)
                 || case when exists (select 1 from authz.memberships m where m.id = p_assignment_id
                                        and m.staff_role = 'hr' and m.is_active)
                         then array['people.manage_members'] else array[]::text[] end $$;
           grant execute on function authz.assignment_capabilities(uuid) to tenant_guard;
           update authz.memberships set is_tenant_admin = false where id = '${id.mAdm2}';
           insert into auth.users (id) values ('${id.UREV}') on conflict do nothing;
           update authz.memberships set is_active = true where id = '${id.mRev}';`,
        );
        // UADM is now the only administrator of TA; UREV (hr) may manage members.
        for (const attempt of [
          () =>
            change("UREV", "mAdm", {
              role: "staff",
              staff: "development",
              admin: false,
            }),
          () => change("UREV", "mAdm", { role: "staff", staff: "finance" }),
          () => revoke("UREV", "mAdm"),
        ]) {
          const out = await attempt();
          expect([out.code, out.message]).toEqual(["42501", LAST_ADMIN]);
        }
        expect(await membership(id.mAdm)).toMatchObject({
          is_tenant_admin: true,
          is_active: true,
        });
        // With a second administrator, the same demotion passes.
        const second = await change("UADM", "mDev", {
          role: "staff",
          staff: "development",
          admin: true,
        });
        expect(second.code, second.message).toBeNull();
        const out = await change("UREV", "mAdm", {
          role: "staff",
          staff: "development",
          admin: false,
        });
        expect(out.code, out.message).toBeNull();
      }));

    it("leaves no function in the chain that sets profiles.role, the column that once granted access", () =>
      tx(async () => {
        const writers = await db.query(
          `select n.nspname || '.' || p.proname as fn
             from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname in ('public', 'authz', 'private', 'tenant_guard', 'platform')
              and p.prosrc ~* 'update\\s+(public\\.)?profiles\\s+(as\\s+\\w+\\s+)?set\\s+[^;]*\\mrole\\s*='
            order by 1`,
        );
        expect(writers.rows).toEqual([]);
      }));

    it("is reached through postgres-owned invoker wrappers, runs as the guard, and the retired function is gone", () =>
      tx(async () => {
        const fns = await db.query(
          `select p.oid::regprocedure::text as fn, p.proowner::regrole::text as owner, p.prosecdef as definer,
                  p.proconfig as config,
                  array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                          from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                         where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner order by 1) as grantees
             from pg_proc p
            where p.oid in (to_regprocedure('tenant_guard.change_membership_role(uuid,uuid,text,text,boolean,text)'),
                            to_regprocedure('tenant_guard.revoke_membership(uuid,uuid,text)'),
                            to_regprocedure('public.change_membership_role(uuid,uuid,text,text,boolean,text)'),
                            to_regprocedure('public.revoke_membership(uuid,uuid,text)'),
                            to_regprocedure('private.is_platform_operator(uuid)'),
                            to_regprocedure('private.is_member_elsewhere(uuid,uuid)'))
            `,
        );
        const byText = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);
        expect(
          [...fns.rows].sort((x, y) => byText(String(x.fn), String(y.fn))),
        ).toEqual([
          {
            fn: "change_membership_role(uuid,uuid,text,text,boolean,text)",
            owner: "postgres",
            definer: false,
            config: ['search_path=""'],
            grantees: ["authenticated"],
          },
          {
            fn: "private.is_platform_operator(uuid)",
            owner: "postgres",
            definer: true,
            config: ['search_path=""'],
            grantees: ["tenant_guard"],
          },
          {
            fn: "revoke_membership(uuid,uuid,text)",
            owner: "postgres",
            definer: false,
            config: ['search_path=""'],
            grantees: ["authenticated"],
          },
          {
            fn: "tenant_guard.change_membership_role(uuid,uuid,text,text,boolean,text)",
            owner: "tenant_guard",
            definer: true,
            config: ['search_path=""'],
            grantees: ["authenticated"],
          },
          {
            fn: "tenant_guard.revoke_membership(uuid,uuid,text)",
            owner: "tenant_guard",
            definer: true,
            config: ['search_path=""'],
            grantees: ["authenticated"],
          },
        ]);
        const gone = await db.query(
          "select to_regprocedure('public.atomic_update_user_role_with_audit(uuid,uuid,uuid,text,text,text)') as fn",
        );
        expect(gone.rows).toEqual([{ fn: null }]);
        // The guard may insert and change lifecycle columns of memberships in
        // the tenant it entered, and insert audit rows there; nothing else.
        const privileges = await db.query(
          `select c.oid::regclass::text as rel, '*' as col, a.privilege_type as p
             from pg_class c, aclexplode(c.relacl) a
            where c.oid in ('authz.memberships'::regclass, 'public.audit_logs'::regclass)
              and a.grantee = 'tenant_guard'::regrole
           union all
           select c.oid::regclass::text, t.attname::text, a.privilege_type
             from pg_class c
             join pg_attribute t on t.attrelid = c.oid and t.attnum > 0 and not t.attisdropped,
                  aclexplode(t.attacl) a
            where c.oid in ('authz.memberships'::regclass, 'public.audit_logs'::regclass)
              and a.grantee = 'tenant_guard'::regrole`,
        );
        const table = privileges.rows
          .filter((r) => r.col === "*")
          .map((r) => `${r.rel} ${r.p}`)
          .sort(byText);
        const columns = privileges.rows
          .filter((r) => r.col !== "*")
          .map((r) => `${r.rel}.${r.col} ${r.p}`)
          .sort(byText);
        expect(table).toEqual([
          "audit_logs INSERT",
          "authz.memberships SELECT",
        ]);
        expect(columns).toEqual([
          "authz.memberships.granted_by INSERT",
          "authz.memberships.granted_by UPDATE",
          "authz.memberships.is_active INSERT",
          "authz.memberships.is_active UPDATE",
          "authz.memberships.is_tenant_admin INSERT",
          "authz.memberships.is_tenant_admin UPDATE",
          "authz.memberships.revoked_at UPDATE",
          "authz.memberships.role INSERT",
          "authz.memberships.staff_role INSERT",
          "authz.memberships.tenant_id INSERT",
          "authz.memberships.updated_at UPDATE",
          "authz.memberships.user_id INSERT",
        ]);
        const policies = await db.query(
          `select polrelid::regclass::text as rel, polname, polcmd, pg_get_expr(polqual, polrelid) as q,
                  pg_get_expr(polwithcheck, polrelid) as c
             from pg_policy where polroles @> array['tenant_guard'::regrole::oid]
              and polrelid in ('authz.memberships'::regclass, 'public.audit_logs'::regclass)`,
        );
        expect(
          [...policies.rows].sort((x, y) =>
            byText(`${x.rel} ${x.polname}`, `${y.rel} ${y.polname}`),
          ),
        ).toEqual([
          {
            rel: "audit_logs",
            polname: "tenant_guard_isolation",
            polcmd: "a",
            q: null,
            c: "(tenant_id = tenant_guard.current_tenant_id())",
          },
          {
            rel: "authz.memberships",
            polname: "tenant_guard_isolation",
            polcmd: "*",
            q: "(tenant_id = tenant_guard.current_tenant_id())",
            c: "(tenant_id = tenant_guard.current_tenant_id())",
          },
          {
            rel: "authz.memberships",
            polname: "tenant_guard_own_assignments",
            polcmd: "r",
            q: "(user_id = ( SELECT tenant_guard.caller_id() AS caller_id))",
            c: null,
          },
        ]);
      }));
  },
);

describe.skipIf(!ADMIN_URL)(
  "AL-2675 WP2c: two administrators demoting each other at once (real stack, committed)",
  () => {
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    const one = new pg.Client({ connectionString: ADMIN_URL });
    const two = new pg.Client({ connectionString: ADMIN_URL });
    const t = randomUUID();
    const u1 = randomUUID();
    const u2 = randomUUID();
    const m1 = randomUUID();
    const m2 = randomUUID();

    beforeAll(async () => {
      await Promise.all([admin.connect(), one.connect(), two.connect()]);
      await admin.query(
        `begin;
         insert into public.tenants (id, name, slug) values ('${t}', 'wp2c race', 'wp2c-race-${t}');
         insert into auth.users (id) values ('${u1}'), ('${u2}');
         delete from authz.memberships where user_id in ('${u1}', '${u2}');
         insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin) values
           ('${m1}', '${u1}', '${t}', 'staff', 'development', true),
           ('${m2}', '${u2}', '${t}', 'staff', 'development', true);
         commit;`,
      );
    });

    afterAll(async () => {
      try {
        // A race case that failed midway can leave either worker in its
        // transaction, holding row locks the clean-up below would wait on
        // (review 4650094384 on #2741). End `one` first: `two` may be waiting
        // on its locks. A rollback with no transaction open only warns.
        await one.query("rollback");
        await two.query("rollback");
        await admin.query(
          `begin;
           delete from public.audit_logs where tenant_id = '${t}';
           delete from authz.memberships where tenant_id = '${t}' or user_id in ('${u1}', '${u2}');
           delete from public.tenants where id = '${t}';
           delete from auth.users where id in ('${u1}', '${u2}');
           commit;`,
        );
      } finally {
        await Promise.all([admin.end(), one.end(), two.end()]);
      }
    });

    async function begin(client: pg.Client, user: string) {
      await client.query("begin");
      await client.query("set local role authenticated");
      await client.query(
        "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', '', true)",
        [JSON.stringify({ sub: user, role: "authenticated", aal: "aal1" })],
      );
    }

    it("leaves the organization one administrator: the second command waits, then finds its caller no longer one", async () => {
      await begin(one, u1);
      await begin(two, u2);
      const first = await one.query(
        `select public.change_membership_role('${t}', '${m2}', 'staff', 'development', false, 'race') as r`,
      );
      expect(first.rows[0]?.r).toMatchObject({ changed: true });
      const pid = (await two.query("select pg_backend_pid() as p")).rows[0]!
        .p as number;
      const second = two
        .query(
          `select public.change_membership_role('${t}', '${m1}', 'staff', 'development', false, 'race') as r`,
        )
        .then(
          () => ({ code: null as string | null, message: "" }),
          (e: { code?: string; message?: string }) => ({
            code: e.code ?? "?",
            message: e.message ?? "",
          }),
        );
      // The second command waits on the first one's row locks.
      let waiting = false;
      for (let i = 0; i < 100 && !waiting; i += 1) {
        const r = await admin.query(
          "select wait_event_type from pg_stat_activity where pid = $1",
          [pid],
        );
        waiting = r.rows[0]?.wait_event_type === "Lock";
        if (!waiting) await new Promise((resolve) => setTimeout(resolve, 50));
      }
      expect(waiting).toBe(true);
      await one.query("commit");
      const outcome = await second;
      await two.query("rollback");
      expect([outcome.code, outcome.message]).toEqual(["42501", NO_CAPABILITY]);
      const admins = await admin.query(
        "select id from authz.memberships where tenant_id = $1 and is_tenant_admin and is_active",
        [t],
      );
      expect(admins.rows).toEqual([{ id: m1 }]);
    });
  },
);
