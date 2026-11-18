/**
 * AL-2675 real-stack acceptance (WP2b, first release, slice B).
 *
 * 1. "Between the two releases of WP2b every read still works": the first
 *    release sends `x-asym-tenant` and `x-asym-assignment` on every request a
 *    page makes, from the browser client and the server's session clients,
 *    while the database still runs today's helper. On the seeded application,
 *    each surface's reads on the caller's own token give the same outcome
 *    with the two headers as without them: the same rows, or the same
 *    refusal. Each surface acts as the seed's people do: the demo owner's
 *    staff row in Mission Control, their missionary row in the workspace and
 *    their donor row in the portal, and the second organization's
 *    administrator.
 * 2. "A forged header can at most select a tenant where the caller already
 *    holds a live membership", on a session-client read: where the database
 *    reads the assignment header today (the member directory, the command
 *    resolver), a header naming a row that is not the caller's live row in
 *    that tenant is refused.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL with supabase/seed.sql
 * applied, as CI's `migrate` job leaves it: skips without the URL, except in
 * that job, where it fails. Read-only, in one transaction that is always
 * rolled back. Callers are emulated as PostgREST does it (../issue-2674).
 */
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, asRole, type Outcome } from "./harness";

const DEMO = "00000000-0000-0000-0000-000000000001";
const SECOND = "00000000-0000-0000-0000-000000000002";
/** supabase/seed.sql: the demo owner and the second organization's administrator. */
const OWNER = "11111111-1111-1111-1111-111111111111";
const MORGAN = "33333333-3333-3333-3333-333333333333";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

/** What each surface reads on the caller's own token, by membership class. */
const READS: Record<"staff" | "missionary" | "donor", string[]> = {
  staff: [
    "select id from public.tenants order by id",
    "select id from public.profiles order by id",
    "select id from public.donors order by id",
    "select id from public.donations order by id",
    "select id from public.funds order by id",
    "select id from public.posts order by id",
    "select id from public.post_comments order by id",
    "select record_type, field_key, surface from public.field_policies order by 1, 2, 3",
    "select id from public.current_user_assignments() order by id",
    "select tenant_id from public.current_user_organizations() order by tenant_id",
  ],
  missionary: [
    "select id from public.profiles order by id",
    "select id from public.donations order by id",
    "select id from public.donor_pledges order by id",
    "select id from public.posts order by id",
    "select id from public.follows order by id",
    "select record_type, field_key, surface from public.field_policies order by 1, 2, 3",
    "select id from public.current_user_assignments() order by id",
  ],
  donor: [
    "select id from public.profiles order by id",
    "select id from public.donors order by id",
    "select id from public.donations order by id",
    "select id from public.donor_feed_preferences order by id",
    "select id from public.posts order by id",
    "select record_type, field_key, surface from public.field_policies order by 1, 2, 3",
    "select id from public.current_user_assignments() order by id",
  ],
};

describe.skipIf(!ADMIN_URL)(
  "AL-2675 request scope headers on the seeded application (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    /** Seed people by name, for the PostgREST emulation. */
    const people: Record<string, string> = { OWNER, MORGAN };
    const as = asRole(db, people);
    /** The seed's membership row ids: `${user}:${tenant}:${role}`. */
    const rows = new Map<string, string>();

    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      const { rows: found } = await db.query<{
        id: string;
        user_id: string;
        tenant_id: string;
        role: string;
      }>(
        `select id, user_id, tenant_id, role::text
           from authz.memberships
          where user_id = any($1::uuid[]) and is_active`,
        [[OWNER, MORGAN]],
      );
      for (const row of found)
        rows.set(`${row.user_id}:${row.tenant_id}:${row.role}`, row.id);
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    function row(user: string, tenant: string, role: string) {
      const id = rows.get(`${user}:${tenant}:${role}`);
      expect(
        id,
        `seed row ${role} of ${user} in ${tenant}: apply supabase/seed.sql`,
      ).toBeDefined();
      return id!;
    }

    function sameOutcome(outcome: Outcome) {
      return { code: outcome.code, rows: outcome.rows };
    }

    describe("every read gives what it gave before when the headers are sent", () => {
      it.each([
        [
          "Mission Control, the demo owner's staff row",
          "OWNER",
          OWNER,
          DEMO,
          "staff",
        ],
        [
          "the workspace, the demo owner's missionary row",
          "OWNER",
          OWNER,
          DEMO,
          "missionary",
        ],
        [
          "the donor portal, the demo owner's donor row",
          "OWNER",
          OWNER,
          DEMO,
          "donor",
        ],
        [
          "Mission Control, the second organization's administrator",
          "MORGAN",
          MORGAN,
          SECOND,
          "staff",
        ],
      ] as const)("%s", async (_label, sub, user, tenant, role) => {
        const headers = {
          "x-asym-tenant": tenant,
          "x-asym-assignment": row(user, tenant, role),
        };
        let readable = 0;
        for (const sql of READS[role]) {
          const before = await as("authenticated", { sub }, sql);
          const after = await as("authenticated", { sub, headers }, sql);
          expect(sameOutcome(after), sql).toEqual(sameOutcome(before));
          if (before.code === null && before.rows.length > 0) readable += 1;
        }
        // The surface reads something: the comparison is not of empty sets.
        expect(readable).toBeGreaterThan(2);
      });

      it("the member directory, which already reads the header, lists the same members", async () => {
        const sql = `select membership_id from public.tenant_member_directory('${DEMO}') order by 1`;
        const before = await as("authenticated", { sub: "OWNER" }, sql);
        const after = await as(
          "authenticated",
          {
            sub: "OWNER",
            headers: {
              "x-asym-tenant": DEMO,
              "x-asym-assignment": row(OWNER, DEMO, "staff"),
            },
          },
          sql,
        );
        expect(before.code, before.message).toBeNull();
        expect(before.rows.length).toBeGreaterThan(0);
        expect(sameOutcome(after)).toEqual(sameOutcome(before));
      });
    });

    describe("a forged assignment header on a session-client read selects nothing", () => {
      const directory = (tenant: string) =>
        `select membership_id from public.tenant_member_directory('${tenant}')`;
      const resolve = (tenant: string) =>
        `select public.resolve_command_assignment('${tenant}') as assignment`;

      it.each([
        ["another person's row", () => row(MORGAN, SECOND, "staff")],
        [
          "a row that does not exist",
          () => "00000000-0000-4000-8000-00000000dead",
        ],
      ])(
        "refuses %s in the directory and the command resolver",
        async (_label, forged) => {
          const headers = {
            "x-asym-tenant": DEMO,
            "x-asym-assignment": forged(),
          };
          for (const sql of [directory(DEMO), resolve(DEMO)]) {
            const outcome = await as(
              "authenticated",
              { sub: "OWNER", headers },
              sql,
            );
            expect(outcome.code, sql).toBe("42501");
            expect(outcome.rows).toEqual([]);
          }
        },
      );

      it("refuses a tenant where the caller holds no row, whatever the headers name", async () => {
        const headers = {
          "x-asym-tenant": DEMO,
          "x-asym-assignment": row(MORGAN, SECOND, "staff"),
        };
        for (const sql of [directory(DEMO), resolve(DEMO)]) {
          const outcome = await as(
            "authenticated",
            { sub: "MORGAN", headers },
            sql,
          );
          expect(outcome.code, sql).toBe("42501");
        }
      });

      it("admits the caller's own live row", async () => {
        const own = row(OWNER, DEMO, "staff");
        const outcome = await as(
          "authenticated",
          {
            sub: "OWNER",
            headers: { "x-asym-tenant": DEMO, "x-asym-assignment": own },
          },
          resolve(DEMO),
        );
        expect(outcome.code, outcome.message).toBeNull();
        expect(JSON.stringify(outcome.rows)).toContain(own);
      });
    });
  },
);
