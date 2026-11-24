import { createHash } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
} from "../issue-2675/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2676 WP3c item 1: membership_invitations table, field policies, reader and internal issuer",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    const as = asRole(db, id);
    const hdr = (tenant: string, assignment?: string) => ({
      "x-asym-tenant": id[tenant]!,
      ...(assignment ? { "x-asym-assignment": id[assignment]! } : {}),
    });

    async function tx<T>(body: () => Promise<T>): Promise<T> {
      await db.query("begin");
      try {
        return await body();
      } finally {
        await db.query("rollback");
      }
    }

    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      try {
        await db.query(fixtureSql(id));
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      try {
        await db.query("rollback").catch(() => undefined);
        const tenants = [id.TA, id.TB];
        const users = [id.UFC, id.UADM, id.UDEV, id.UDON, id.UREV, id.UB];
        await db
          .query(
            "delete from public.membership_invitations where tenant_id = any($1::uuid[])",
            [tenants],
          )
          .catch(() => undefined);
        await db.query(
          "delete from public.audit_logs where tenant_id = any($1::uuid[])",
          [tenants],
        );
        await db.query(
          "delete from authz.memberships where tenant_id = any($1::uuid[]) or user_id = any($2::uuid[])",
          [tenants, users],
        );
        await db.query(
          "delete from public.profiles where user_id = any($1::uuid[])",
          [users],
        );
        await db.query("delete from auth.users where id = any($1::uuid[])", [
          users,
        ]);
        await db.query(
          "delete from public.tenants where id = any($1::uuid[])",
          [tenants],
        );
      } finally {
        await db.end();
      }
    });

    it("creates public.membership_invitations with FORCE RLS, RESTRICT tenant FK, strict table grants, and partial unique index for one live operator admin invite", () =>
      tx(async () => {
        const rel = await db.query(
          `select c.relrowsecurity as rls, c.relforcerowsecurity as force_rls, c.relowner::regrole::text as owner
             from pg_class c
             join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relname = 'membership_invitations'`,
        );
        expect(rel.rows).toEqual([
          { rls: true, force_rls: true, owner: "postgres" },
        ]);

        const fk = await db.query(
          `select confdeltype::text as del
             from pg_constraint
            where conrelid = 'public.membership_invitations'::regclass
              and contype = 'f'
              and confrelid = 'public.tenants'::regclass`,
        );
        expect(fk.rows).toEqual([{ del: "r" }]);

        const privs = await db.query(
          `select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end as grantee,
                  string_agg(a.privilege_type, ',' order by a.privilege_type) as privs
             from pg_class c, aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
            where c.oid = 'public.membership_invitations'::regclass
              and a.grantee <> c.relowner
            group by 1
            order by 1`,
        );
        expect(privs.rows).toEqual([
          { grantee: "tenant_guard", privs: "INSERT,SELECT,UPDATE" },
        ]);

        const colPrivs = await db.query(
          `select count(*)::int as n
             from pg_attribute t, aclexplode(t.attacl) a
            where t.attrelid = 'public.membership_invitations'::regclass
              and a.grantee <> 'postgres'::regrole`,
        );
        expect(colPrivs.rows[0].n).toBe(0);

        const issuer = await db.query(
          `select p.proowner::regrole::text as owner, p.prosecdef as definer, p.proconfig as config,
                  array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                          from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                         where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner order by 1) as grantees
             from pg_proc p
            where p.oid = to_regprocedure('tenant_guard.issue_membership_invitation(uuid,text,authz.membership_role,authz.staff_role,boolean,text,text,uuid,text,interval)')`,
        );
        expect(issuer.rows).toEqual([
          {
            owner: "postgres",
            definer: false,
            config: ['search_path=""'],
            grantees: ["tenant_guard"],
          },
        ]);
      }));

    it("issues a protected-action credential storing only selector and versioned SHA-256 digest, never the raw verifier", () =>
      tx(async () => {
        await db.query("set local role tenant_guard");
        await db.query("select tenant_guard.enter($1::uuid)", [id.TA]);
        const issued = await db.query<{
          invitation_id: string;
          selector: string;
          verifier: string;
          expires_at: Date;
        }>(
          `select invitation_id, selector, verifier, expires_at
             from tenant_guard.issue_membership_invitation(
               $1::uuid,
               '  New.Staff@Example.TEST  ',
               'staff'::authz.membership_role,
               'finance'::authz.staff_role,
               false,
               'member_invite',
               'email',
               $2::uuid,
               '  Joining finance team  ',
               interval '7 days'
             )`,
          [id.TA, id.UADM],
        );
        expect(issued.rows).toHaveLength(1);
        const row = issued.rows[0]!;
        expect(row.selector).toMatch(/^[A-Za-z0-9_-]{32}$/);
        expect(row.verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
        expect(Buffer.from(row.verifier, "base64url").byteLength).toBe(32);

        const stored = await db.query(
          `select id, tenant_id, email, email_normalized, role::text as role,
                  staff_role::text as staff_role, is_tenant_admin, purpose,
                  delivery_mode, selector, verifier_digest_version,
                  encode(verifier_digest, 'hex') as digest_hex,
                  invited_by, reason, status, accepted_at, revoked_at,
                  row_to_json(i)::text as serialized
             from public.membership_invitations i
            where id = $1`,
          [row.invitation_id],
        );
        expect(stored.rows).toHaveLength(1);
        const expectedDigest = createHash("sha256")
          .update(
            `asym-membership-invitation:v1:${row.selector}:${row.verifier}`,
          )
          .digest("hex");
        expect(stored.rows[0]).toMatchObject({
          id: row.invitation_id,
          tenant_id: id.TA,
          email: "New.Staff@Example.TEST",
          email_normalized: "new.staff@example.test",
          role: "staff",
          staff_role: "finance",
          is_tenant_admin: false,
          purpose: "member_invite",
          delivery_mode: "email",
          selector: row.selector,
          verifier_digest_version: 1,
          digest_hex: expectedDigest,
          invited_by: id.UADM,
          reason: "Joining finance team",
          status: "issued",
          accepted_at: null,
          revoked_at: null,
        });
        expect(stored.rows[0].serialized).not.toContain(row.verifier);

        await expect(
          db.query(
            `select * from tenant_guard.issue_membership_invitation(
               $1::uuid, 'other@example.test', 'missionary'::authz.membership_role,
               null, false, 'member_invite', 'email', $2::uuid, 'Cross tenant'
             )`,
            [id.TB, id.UADM],
          ),
        ).rejects.toMatchObject({ code: "42501" });
      }));

    it("enforces at most one live operator administrator invitation per tenant via partial unique index", () =>
      tx(async () => {
        const first = await db.query<{ invitation_id: string }>(
          `select invitation_id from tenant_guard.issue_membership_invitation(
             $1::uuid, 'first-admin@example.test', 'staff'::authz.membership_role,
             'development'::authz.staff_role, true, 'operator_admin_invite',
             'operator_handoff', $2::uuid, 'Initial admin handoff', interval '24 hours'
           )`,
          [id.TA, id.UADM],
        );
        expect(first.rows).toHaveLength(1);

        await db.query("savepoint sp_dup");
        await expect(
          db.query(
            `select invitation_id from tenant_guard.issue_membership_invitation(
               $1::uuid, 'second-admin@example.test', 'staff'::authz.membership_role,
               'development'::authz.staff_role, true, 'operator_admin_invite',
               'operator_handoff', $2::uuid, 'Duplicate live admin invite', interval '24 hours'
             )`,
            [id.TA, id.UADM],
          ),
        ).rejects.toMatchObject({ code: "23505" });
        await db.query("rollback to savepoint sp_dup");

        await db.query(
          `update public.membership_invitations
              set status = 'revoked', revoked_at = pg_catalog.now(), revoked_by = $2
            where id = $1`,
          [first.rows[0]!.invitation_id, id.UADM],
        );

        const replacement = await db.query<{ invitation_id: string }>(
          `select invitation_id from tenant_guard.issue_membership_invitation(
             $1::uuid, 'second-admin@example.test', 'staff'::authz.membership_role,
             'development'::authz.staff_role, true, 'operator_admin_invite',
             'operator_handoff', $2::uuid, 'Replacement admin handoff', interval '24 hours'
           )`,
          [id.TA, id.UADM],
        );
        expect(replacement.rows).toHaveLength(1);
      }));

    it("refuses invalid role combinations, blank email, whitespace reason, and direct authenticated execution of the internal issuer", () =>
      tx(async () => {
        const badCalls = [
          `select * from tenant_guard.issue_membership_invitation('${id.TA}', 'a@example.test', 'donor'::authz.membership_role, null, false, 'member_invite', 'email', '${id.UADM}', 'reason')`,
          `select * from tenant_guard.issue_membership_invitation('${id.TA}', 'a@example.test', 'staff'::authz.membership_role, null, false, 'member_invite', 'email', '${id.UADM}', 'reason')`,
          `select * from tenant_guard.issue_membership_invitation('${id.TA}', 'a@example.test', 'missionary'::authz.membership_role, 'finance'::authz.staff_role, false, 'member_invite', 'email', '${id.UADM}', 'reason')`,
          `select * from tenant_guard.issue_membership_invitation('${id.TA}', 'a@example.test', 'missionary'::authz.membership_role, null, true, 'member_invite', 'email', '${id.UADM}', 'reason')`,
          `select * from tenant_guard.issue_membership_invitation('${id.TA}', '   ', 'missionary'::authz.membership_role, null, false, 'member_invite', 'email', '${id.UADM}', 'reason')`,
          `select * from tenant_guard.issue_membership_invitation('${id.TA}', 'a@example.test', 'missionary'::authz.membership_role, null, false, 'member_invite', 'email', '${id.UADM}', E' \t\n ')`,
          `select * from tenant_guard.issue_membership_invitation('${id.TA}', 'a@example.test', 'staff'::authz.membership_role, 'development'::authz.staff_role, false, 'operator_admin_invite', 'operator_handoff', '${id.UADM}', 'reason')`,
          `select * from tenant_guard.issue_membership_invitation('${id.TA}', 'a@example.test', 'staff'::authz.membership_role, 'development'::authz.staff_role, true, 'operator_admin_invite', 'email', '${id.UADM}', 'reason')`,
        ];
        for (const sql of badCalls) {
          await db.query("savepoint sp");
          await expect(db.query(sql), sql).rejects.toMatchObject({
            code: "22023",
          });
          await db.query("rollback to savepoint sp");
        }

        for (const role of ["authenticated", "anon", "service_role"]) {
          const refused = await as(
            role,
            { sub: "UADM" },
            `select * from tenant_guard.issue_membership_invitation('${id.TA}', 'x@example.test', 'missionary'::authz.membership_role, null, false, 'member_invite', 'email', '${id.UADM}', 'reason')`,
          );
          expect([role, refused.code]).toEqual([role, "42501"]);
        }
      }));

    it("exposes non-secret invitation listing only through public.tenant_membership_invitations for people.manage_members callers", () =>
      tx(async () => {
        const issued = await db.query<{ invitation_id: string }>(
          `select invitation_id from tenant_guard.issue_membership_invitation(
             $1::uuid, 'pending@example.test', 'missionary'::authz.membership_role,
             null, false, 'member_invite', 'email', $2::uuid, 'Welcome missionary'
           )`,
          [id.TA, id.UADM],
        );
        const directTable = await as(
          "authenticated",
          { sub: "UADM", headers: hdr("TA", "mAdm") },
          "select * from public.membership_invitations",
        );
        expect(directTable.code).toBe("42501");

        const allowed = await as(
          "authenticated",
          { sub: "UADM", headers: hdr("TA", "mAdm") },
          `select * from public.tenant_membership_invitations('${id.TA}')`,
        );
        expect(allowed.code, allowed.message ?? "").toBeNull();
        expect(allowed.rows).toHaveLength(1);
        expect(Object.keys(allowed.rows[0]!).sort()).toEqual([
          "created_at",
          "delivery_mode",
          "email",
          "expires_at",
          "id",
          "is_tenant_admin",
          "purpose",
          "role",
          "staff_role",
          "status",
          "tenant_id",
        ]);
        expect(allowed.rows[0]!.id).toBe(issued.rows[0]!.invitation_id);

        for (const [label, role, caller] of [
          [
            "non-admin staff",
            "authenticated",
            { sub: "UDEV", headers: hdr("TA", "mDev") },
          ],
          [
            "donor",
            "authenticated",
            { sub: "UDON", headers: hdr("TA", "mDonA") },
          ],
          [
            "other tenant staff",
            "authenticated",
            { sub: "UB", headers: hdr("TB", "mB") },
          ],
          ["anon", "anon", {}],
        ] as const) {
          const refused = await as(
            role,
            caller,
            `select * from public.tenant_membership_invitations('${id.TA}')`,
          );
          expect([label, refused.code]).toEqual([label, "42501"]);
        }

        await db.query(
          "update public.tenants set status = 'suspended' where id = $1",
          [id.TA],
        );
        const suspended = await as(
          "authenticated",
          { sub: "UADM", headers: hdr("TA", "mAdm") },
          `select * from public.tenant_membership_invitations('${id.TA}')`,
        );
        expect(suspended.code).toBe("42501");
      }));

    it("seeds five field_policies rows per column with security secrets hidden on every surface", () =>
      tx(async () => {
        const policies = await db.query<{
          field_key: string;
          surface: string;
          visible: boolean;
          editable: boolean;
          exportable: boolean;
          sensitivity_category: string;
        }>(
          `select field_key, surface, visible, editable, exportable, sensitivity_category::text
             from public.field_policies
            where record_type = 'membership_invitations'
              and tenant_id is null
            order by field_key, surface`,
        );
        expect(policies.rows).toHaveLength(22 * 5);
        for (const secretCol of [
          "selector",
          "verifier_digest",
          "verifier_digest_version",
        ]) {
          const rows = policies.rows.filter((r) => r.field_key === secretCol);
          expect(rows).toHaveLength(5);
          for (const r of rows) {
            expect(r).toMatchObject({
              visible: false,
              editable: false,
              exportable: false,
              sensitivity_category: "security",
            });
          }
        }
      }));
  },
);
