import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
} from "../issue-2675/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)("tenant status under a selected membership", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const id = fixtureIds();
  const queryAs = asRole(db, id);
  beforeAll(() => db.connect());
  afterAll(() => db.end());

  it.each(["active", "suspended", "closed"])(
    "applies %s across assignment, Storage, chooser, Web Studio and preamble",
    async (status) => {
      await db.query("begin");
      try {
        await db.query(fixtureSql(id));
        await db.query(`insert into public.posts(id,tenant_id,content,status,visibility) values ('${id.TA}','${id.TA}','Fixture','published','public');
          insert into public.post_comments(post_id,user_id,content) values ('${id.TA}','${id.UADM}','Fixture');
          insert into public.donors(id,tenant_id,profile_id) select '${id.TA}','${id.TA}',id from public.profiles where user_id='${id.UDON}';
          insert into public.donations(id,tenant_id,donor_id,amount) values ('${id.TA}','${id.TA}','${id.TA}',10)`);
        await db.query("update public.tenants set status=$1 where id=$2", [
          status,
          id.TA,
        ]);
        const caller = {
          sub: "UDON",
          headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mDonA! },
        };
        for (const sql of [
          "select tenant_id from public.current_user_assignments()",
          "select tenant_id from public.current_user_organizations()",
          "select authz.caller_tenant_ids() as tenant_id",
        ]) {
          const result = await queryAs("authenticated", caller, sql);
          expect(result.code).toBeNull();
          expect(result.rows.map((row) => row.tenant_id).sort()).toEqual(
            (status === "active" ? [id.TA, id.TB] : [id.TB]).sort(),
          );
        }
        const assignment = await queryAs(
          "authenticated",
          caller,
          "select membership_id from authz.request_assignment()",
        );
        expect(assignment.rows).toEqual([
          { membership_id: status === "active" ? id.mDonA : null },
        ]);
        const internal = await queryAs(
          "postgres",
          caller,
          `select authz.caller_assignment('${id.TA}','donor') as assignment`,
        );
        expect(internal.rows).toEqual([
          { assignment: status === "active" ? id.mDonA : null },
        ]);
        const admin = {
          sub: "UADM",
          headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mAdm! },
        };
        const command = await queryAs(
          "tenant_guard",
          admin,
          `select (tenant_guard.begin_human_command('${id.TA}','people.manage_members')).assignment_id`,
        );
        expect(command.code).toBe(status === "active" ? null : "42501");
        for (const principal of [admin, caller]) {
          const gifts = await queryAs(
            "authenticated",
            principal,
            `select id from public.donations where id='${id.TA}'`,
          );
          expect(gifts.code, gifts.message).toBeNull();
          expect(gifts.rows).toEqual(
            status === "active" ? [{ id: id.TA }] : [],
          );
        }
        const memberships = await queryAs(
          "authenticated",
          caller,
          `select tenant_id from public.current_user_memberships('${id.TA}')`,
        );
        expect(memberships.code, memberships.message).toBeNull();
        expect
          .soft(memberships.rows)
          .toEqual(status === "active" ? [{ tenant_id: id.TA }] : []);
        const authors = await queryAs(
          "authenticated",
          caller,
          `select display_name from public.post_comment_authors('${id.TA}')`,
        );
        expect(authors.code, authors.message).toBeNull();
        expect(authors.rows).toEqual([
          { display_name: status === "active" ? "Blair Admin" : null },
        ]);
      } finally {
        await db.query("rollback");
      }
    },
  );
});
