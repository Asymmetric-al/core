/**
 * AL-2675 real-stack acceptance (WP2b, first release, slice B; rewritten by
 * the second release).
 *
 * 1. "Every read on the caller's own token gives the rows of the request's
 *    tenant and assignment": the first release sends `x-asym-tenant` and
 *    `x-asym-assignment` on every request a page makes, from the browser
 *    client and the server's session clients. On the seeded application each
 *    surface reads, with the two headers, exactly the rows its membership
 *    class may see in that tenant; with no headers, with the tenant alone
 *    where the person holds several rows there, or with another
 *    organization's id, no row of a tenant table and no error. Each surface
 *    acts as the seed's people do: the demo owner's staff row in Mission
 *    Control, their missionary row in the workspace and their donor row in
 *    the portal, and the second organization's administrator.
 * 2. "A forged header can at most select a tenant where the caller already
 *    holds a live membership", on a session-client read: where the database
 *    reads the assignment header (the member directory, the command
 *    resolver), a header naming a row that is not the caller's live row in
 *    that tenant is refused.
 *
 * Rewritten by the second release of WP2b (AL-2675; record D-18). The first
 * release could only promise that the headers changed nothing, because the
 * database still read the token's claim: its cases compared each read with
 * the headers against the same read without them and required them equal.
 * The second release's migration (20261119022102_request_tenant_policies.sql)
 * makes the database read the headers, so that equality ends on purpose:
 * without them a tenant table gives nothing. The cases now pin each read,
 * with the same people and the same reads, against the rows the database
 * owner computes with the rule the policy applies (`rule` below), with the
 * headers and in each case without a selected row. That is stricter than the
 * comparison it replaces, which two empty sets or two equal refusals passed.
 * The first release's half was dropped rather than kept beside it: CI builds
 * the whole migration chain, this migration included, so no database it
 * builds still reads the claim, and that half could no longer run.
 * The second organization holds no business data in the seed, so the suite
 * adds one fund, one donor and one gift there, inside its transaction, for
 * its administrator's reads to be more than empty sets and for the demo
 * owner's to be shown not to reach them.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL with supabase/seed.sql
 * applied, as CI's `migrate` job leaves it: skips without the URL, except in
 * that job, where it fails. In one transaction that is always rolled back.
 * Callers are emulated as PostgREST does it (../issue-2674).
 */
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, asRole, type Outcome } from "./harness";

const DEMO = "00000000-0000-0000-0000-000000000001";
const SECOND = "00000000-0000-0000-0000-000000000002";
/** supabase/seed.sql: the demo owner and the second organization's administrator. */
const OWNER = "11111111-1111-1111-1111-111111111111";
const MORGAN = "33333333-3333-3333-3333-333333333333";

/** The second organization's fixture rows, added inside the transaction. */
const SECOND_FUND = "7a000000-0000-4000-8000-000000000001";
const SECOND_DONOR = "7a000000-0000-4000-8000-000000000002";
const SECOND_GIFT = "7a000000-0000-4000-8000-000000000003";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

type Role = "staff" | "missionary" | "donor";

/**
 * One read a surface makes on the caller's own token, and the rule the
 * database owner applies to compute what it may return. In `rule`, `$1` is
 * the tenant the request resolves to (NULL when it resolves to none) and `$2`
 * the caller's login. A read of a tenant table gives nothing when no tenant
 * resolves; the reads that keep no tenant condition (the caller's own
 * profile, the caller's own rows and organizations) give the same rows
 * whatever the headers say
 * (docs/security/tenant-policy-activation-review.md, section 3).
 * `refused`: `authenticated` holds no SELECT on the table, so every call is
 * refused, as the owner's privilege check shows.
 */
type Read = { sql: string; rule: string; tenant: boolean; refused?: true };

/** The caller's profiles, as `authz.caller_profile_ids()` finds them. */
const OWN_PROFILES =
  "select p.id from public.profiles p where p.user_id = $2 or p.id = $2";

const read = {
  tenants: {
    sql: "select id from public.tenants order by id",
    rule: "select has_table_privilege('authenticated', 'public.tenants', 'SELECT') as granted",
    tenant: false,
    refused: true,
  },
  profiles: {
    sql: "select id from public.profiles order by id",
    rule: `select id from public.profiles where id in (${OWN_PROFILES})`,
    tenant: false,
  },
  fieldPolicies: {
    sql: "select record_type, field_key, surface from public.field_policies order by 1, 2, 3",
    rule: `select record_type, field_key, surface from public.field_policies
            where $1::uuid is not null and (tenant_id is null or tenant_id = $1)`,
    tenant: true,
  },
  assignments: {
    sql: "select id from public.current_user_assignments() order by id",
    rule: "select id from authz.memberships where user_id = $2 and is_active",
    tenant: false,
  },
  organizations: {
    sql: "select tenant_id from public.current_user_organizations() order by tenant_id",
    rule: `select t.id from public.tenants t
            where exists (select 1 from authz.memberships m
                           where m.tenant_id = t.id and m.user_id = $2
                             and m.is_active and m.revoked_at is null)`,
    tenant: false,
  },
} satisfies Record<string, Read>;

const SERVED_POST =
  "review_state = 'approved' and status = 'published' and not worker_withheld";
const FOLLOWED_MINISTRY = `ministry_assignment_id in (select f.ministry_assignment_id from public.follows f
   where f.tenant_id = $1 and f.status = 'approved'
     and f.donor_id in (select d.id from public.donors d
                         where d.tenant_id = $1
                           and d.party_id in (select al.party_id from public.account_links al
                                               where al.tenant_id = $1 and al.user_id = $2)))`;
const POSTS_BY_CLASS: Record<Role, string> = {
  staff: "tenant_id = $1 and status = 'published'",
  missionary: `tenant_id = $1 and (author_user_id = $2 or (${SERVED_POST} and visibility = 'public'))`,
  donor: `tenant_id = $1 and ${SERVED_POST} and (visibility = 'public' or ${FOLLOWED_MINISTRY})`,
};
const posts = (role: Role): Read => ({
  sql: "select id from public.posts order by id",
  rule: `select id from public.posts where ${POSTS_BY_CLASS[role]}`,
  tenant: true,
});
const postComments = (role: Role): Read => ({
  sql: "select id from public.post_comments order by id",
  rule: `select c.id from public.post_comments c
          where c.tenant_id = $1
            and c.post_id in (select id from public.posts where ${POSTS_BY_CLASS[role]})`,
  tenant: true,
});

/** A tenant table every row of which the class reads in the tenant. */
const wholeTenant = (table: string): Read => ({
  sql: `select id from public.${table} order by id`,
  rule: `select id from public.${table} where tenant_id = $1`,
  tenant: true,
});
/**
 * A tenant table whose rows the class reads where they name `column`'s own
 * record, by the rule the policy applies: the row in the request's tenant and
 * its record one of the caller's. The policies' sub-select over `donors`
 * names the request's tenant too (council R11), so the rule does. The one
 * over `missionaries` cannot, because signed-in users may not read that
 * table's `tenant_id`, so the rule does not either, and the row's own tenant
 * term is what holds the read in the tenant (fixcheck F6).
 */
const ownRows = (
  table: string,
  column: string,
  records: "donors" | "missionaries",
): Read => ({
  sql: `select id from public.${table} order by id`,
  rule: `select id from public.${table}
          where tenant_id = $1
            and ${column} in (select r.id from public.${records} r
                               where ${records === "donors" ? "r.tenant_id = $1 and " : ""}r.profile_id in (${OWN_PROFILES}))`,
  tenant: true,
});

/** What each surface reads on the caller's own token, by membership class. */
const READS: Record<Role, Read[]> = {
  staff: [
    read.tenants,
    read.profiles,
    wholeTenant("donors"),
    wholeTenant("donations"),
    {
      ...wholeTenant("funds"),
      rule: "select id from public.funds where tenant_id = $1 and system_purpose is null",
    },
    posts("staff"),
    postComments("staff"),
    read.fieldPolicies,
    read.assignments,
    read.organizations,
  ],
  missionary: [
    read.profiles,
    ownRows("donations", "missionary_id", "missionaries"),
    ownRows("donor_pledges", "missionary_id", "missionaries"),
    posts("missionary"),
    {
      // Follows admit staff and a donor's own; a missionary row reads none.
      sql: "select id from public.follows order by id",
      rule: "select id from public.follows where false",
      tenant: true,
    },
    read.fieldPolicies,
    read.assignments,
  ],
  donor: [
    read.profiles,
    {
      sql: "select id from public.donors order by id",
      rule: `select id from public.donors where tenant_id = $1 and profile_id in (${OWN_PROFILES})`,
      tenant: true,
    },
    ownRows("donations", "donor_id", "donors"),
    ownRows("donor_feed_preferences", "donor_id", "donors"),
    posts("donor"),
    read.fieldPolicies,
    read.assignments,
  ],
};

/** Each surface: its person, the tenant and class of the row it acts under. */
const SURFACES = [
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
] as const;

/** A row as a comparable line: its values, in column order. */
const lines = (rows: Record<string, unknown>[]) =>
  rows.map((row) => Object.values(row).map(String).join("|"));

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
      // The second organization's fixture rows, as its owner would add them.
      await db.query(
        `insert into public.funds (id, tenant_id, name, legal_entity_id)
         select $1, tenant_id, 'Second organization fund', id from public.legal_entities where tenant_id=$2`,
        [SECOND_FUND, SECOND],
      );
      await db.query(
        `insert into public.donors (id, tenant_id, party_id, name, email)
         values ($1, $2, public.donor_party_for_insert($2, null, 'Second Donor', 'second-donor@example.test'), 'Second Donor', 'second-donor@example.test')`,
        [SECOND_DONOR, SECOND],
      );
      await db.query(
        `insert into public.donations (id, tenant_id, donor_id, fund_id, amount)
         values ($1, $2, $3, $4, 25)`,
        [SECOND_GIFT, SECOND, SECOND_DONOR, SECOND_FUND],
      );
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

    /**
     * What the owner computes for `read` when the request resolves to
     * `tenant` (or none). The one-row join types both parameters, which a
     * rule need not both use; rows are compared as sets.
     */
    async function expected(r: Read, tenant: string | null, user: string) {
      const { rows: owned } = await db.query(
        `select owned.* from (${r.rule}) owned, (select $1::uuid, $2::uuid) typed`,
        [tenant, user],
      );
      return lines(owned).sort();
    }

    /** Asserts one read as the caller against the owner's rule. */
    async function pin(
      r: Read,
      sub: string,
      user: string,
      headers: Record<string, string> | undefined,
      resolvesTo: string | null,
      label: string,
    ): Promise<string[]> {
      const outcome: Outcome = await as(
        "authenticated",
        headers ? { sub, headers } : { sub },
        r.sql,
      );
      if (r.refused) {
        const [{ granted }] = (await db.query(r.rule)).rows as [
          { granted: boolean },
        ];
        expect(granted, `${label}: ${r.sql}`).toBe(false);
        expect(outcome.code, `${label}: ${r.sql}`).toBe("42501");
        return [];
      }
      expect(outcome.code, `${label}: ${r.sql}: ${outcome.message}`).toBeNull();
      const want = await expected(r, resolvesTo, user);
      expect(lines(outcome.rows).sort(), `${label}: ${r.sql}`).toEqual(want);
      return want;
    }

    describe("every read gives exactly the rows its class may see when the headers are sent (AL-2680: each class's posts rule is the review's, the author's own, a reviewer's published ones and approved ones, no longer every published post)", () => {
      it.each(SURFACES)("%s", async (_label, sub, user, tenant, role) => {
        const headers = {
          "x-asym-tenant": tenant,
          "x-asym-assignment": row(user, tenant, role),
        };
        let readable = 0;
        let tenantRowsRead = 0;
        for (const r of READS[role]) {
          const got = await pin(r, sub, user, headers, tenant, "headers");
          if (got.length > 0) readable += 1;
          if (r.tenant && got.length > 0) tenantRowsRead += 1;
        }
        // The surface reads something, and something of its tenant: the
        // rules are not checked against empty sets.
        expect(readable).toBeGreaterThan(2);
        expect(tenantRowsRead).toBeGreaterThan(0);
      });

      it("Mission Control reads the second organization's fixture rows only there", async () => {
        const gifts = async (sub: string, user: string, tenant: string) =>
          lines(
            (
              await as(
                "authenticated",
                {
                  sub,
                  headers: {
                    "x-asym-tenant": tenant,
                    "x-asym-assignment": row(user, tenant, "staff"),
                  },
                },
                "select id from public.donations order by id",
              )
            ).rows,
          );
        expect(await gifts("MORGAN", MORGAN, SECOND)).toEqual([SECOND_GIFT]);
        const demo = await gifts("OWNER", OWNER, DEMO);
        expect(demo.length).toBeGreaterThan(0);
        expect(demo).not.toContain(SECOND_GIFT);
      });
    });

    describe("without the headers, with the tenant alone, or with another organization's id, no tenant row and no error (AL-2680: posts follow the review's rules here too)", () => {
      it.each(SURFACES)("%s", async (_label, sub, user, tenant, role) => {
        const other = tenant === DEMO ? SECOND : DEMO;
        const own = row(user, tenant, role);
        // With the tenant alone the request resolves to the caller's one live
        // row there, if they hold exactly one: the owner computes it as
        // authz.request_assignment() does.
        const {
          rows: [alone],
        } = await db.query<{ tenant: string | null }>(
          `select case when count(*) = 1 then $1::uuid end as tenant
             from authz.memberships
            where user_id = $2 and tenant_id = $1 and is_active and revoked_at is null`,
          [tenant, user],
        );
        const variants: [
          string,
          Record<string, string> | undefined,
          string | null,
        ][] = [
          ["no headers", undefined, null],
          ["the tenant alone", { "x-asym-tenant": tenant }, alone!.tenant],
          [
            "another organization's id with the caller's own row",
            { "x-asym-tenant": other, "x-asym-assignment": own },
            null,
          ],
          ["another organization's id alone", { "x-asym-tenant": other }, null],
        ];
        // The demo owner holds three live rows in the demo organization, so
        // the tenant alone selects none of them; the second organization's
        // administrator holds one, which the tenant alone selects.
        expect(alone!.tenant).toBe(sub === "OWNER" ? null : tenant);
        for (const [label, headers, resolvesTo] of variants) {
          for (const r of READS[role]) {
            const got = await pin(r, sub, user, headers, resolvesTo, label);
            if (r.tenant && resolvesTo === null)
              expect(got, `${label}: ${r.sql}`).toEqual([]);
          }
        }
      });
    });

    describe("the member directory as the second release leaves it", () => {
      const directory = (tenant: string) =>
        `select membership_id from public.tenant_member_directory('${tenant}') order by 1`;
      const members = async (tenant: string) =>
        lines(
          (
            await db.query(
              `select id from authz.memberships
                where tenant_id = $1 and is_active and revoked_at is null order by 1`,
              [tenant],
            )
          ).rows,
        );

      it("the member directory, which reads the header, lists the tenant's members when it names the staff row", async () => {
        const outcome = await as(
          "authenticated",
          {
            sub: "OWNER",
            headers: {
              "x-asym-tenant": DEMO,
              "x-asym-assignment": row(OWNER, DEMO, "staff"),
            },
          },
          directory(DEMO),
        );
        expect(outcome.code, outcome.message).toBeNull();
        const want = await members(DEMO);
        expect(want.length).toBeGreaterThan(1);
        expect(lines(outcome.rows)).toEqual(want);
      });

      it("refuses the demo owner without the assignment header, who holds three live rows there (review defect 9) (D-18: AL-2676, D-16 ruling on caller_assignment Q3: drops undefined-header variant now proved in the next test and asserts exact message under x-asym-tenant)", async () => {
        const outcome = await as(
          "authenticated",
          { sub: "OWNER", headers: { "x-asym-tenant": DEMO } },
          directory(DEMO),
        );
        expect(outcome.code).toBe("42501");
        expect(outcome.message).toBe(
          "Forbidden: the member directory requires a live staff membership in this tenant.",
        );
        expect(outcome.rows).toEqual([]);
      });

      it("admits a caller with one live row when x-asym-tenant names that tenant alone and refuses with no headers (D-18: AL-2676, D-16 ruling on caller_assignment Q3: no-header fallback removed; one-row fallback holds only when x-asym-tenant names that tenant)", async () => {
        const served = await as(
          "authenticated",
          { sub: "MORGAN", headers: { "x-asym-tenant": SECOND } },
          directory(SECOND),
        );
        expect(served.code, served.message).toBeNull();
        expect(lines(served.rows)).toEqual(await members(SECOND));

        const refused = await as(
          "authenticated",
          { sub: "MORGAN" },
          directory(SECOND),
        );
        expect(refused.code).toBe("42501");
        expect(refused.message).toBe(
          "Forbidden: the member directory requires a live staff membership in this tenant.",
        );
        expect(refused.rows).toEqual([]);
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
