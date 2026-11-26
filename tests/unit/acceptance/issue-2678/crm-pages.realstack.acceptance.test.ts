import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, asRole } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const NOTES = "public.crm_notes_page(uuid,text,text,boolean,integer,integer)";
const RELATIONSHIPS =
  "public.crm_relationships_page(uuid,text,text[],text,boolean,integer,integer,timestamptz)";

type Page = {
  totalCount: number;
  rows: Record<string, unknown>[];
  report?: Record<string, unknown>;
};

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 rest r6 (brief invariants 9 and 10, ruling WP5 part 2 Q11): CRM notes and relationships page in Postgres on the caller's token, keeping what the Node model guaranteed and adding the paging and care-gate rules; each case rolls back",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const id: Record<string, string> = {};
    const key = (name: string) => (id[name] ??= randomUUID());
    const PEOPLE = ["staff", "care", "admin", "other"] as const;

    async function tx<T>(fn: () => Promise<T>) {
      for (const k of Object.keys(id)) delete id[k];
      await db.query("begin");
      try {
        const T = key("T");
        const U = key("U");
        await db.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'r6 T', 'r6-t-' || $1::text), ($2::uuid, 'r6 U', 'r6-u-' || $2::text)",
          [T, U],
        );
        await db.query(
          "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'T', 'US', 'usd', 'T'), ($2, $2, 'U', 'US', 'usd', 'U')",
          [T, U],
        );
        for (const who of PEOPLE) {
          await db.query(
            "insert into auth.users (id, email, email_confirmed_at) values ($1::uuid, 'r6-' || $1::text || '@example.test', now())",
            [key(who)],
          );
          await db.query(
            "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values ($1, $2, $3, 'staff', $4, $5, true)",
            [
              key(`m:${who}`),
              key(who),
              who === "other" ? U : T,
              who === "care" ? "member_care" : "development",
              who === "admin",
            ],
          );
        }
        return await fn();
      } finally {
        await db.query("rollback");
      }
    }

    const as = asRole(db, id);
    async function call<T = Page>(
      who: (typeof PEOPLE)[number],
      sql: string,
    ): Promise<T> {
      const out = await as(
        "authenticated",
        {
          sub: who,
          headers: {
            "x-asym-tenant": who === "other" ? id.U! : id.T!,
            "x-asym-assignment": id[`m:${who}`]!,
          },
        },
        sql,
      );
      expect(out.code, out.message).toBeNull();
      return out.rows[0]!.page as T;
    }
    const relationships = (
      who: (typeof PEOPLE)[number],
      options: {
        search?: string;
        domains?: string[];
        sort?: string;
        descending?: boolean;
        offset?: number;
        limit?: number;
        tenant?: string;
      } = {},
    ) =>
      call(
        who,
        `select public.crm_relationships_page('${options.tenant ?? id.T}', ${options.search ? `'${options.search}'` : "null"}, '{${(options.domains ?? []).join(",")}}'::text[], '${options.sort ?? "updatedAt"}', ${options.descending ?? true}, ${options.offset ?? 0}, ${options.limit ?? 100}, '2026-11-26T00:00:00Z') page`,
      );
    const notes = (
      who: (typeof PEOPLE)[number],
      options: {
        search?: string;
        sort?: string;
        descending?: boolean;
        offset?: number;
        limit?: number;
      } = {},
    ) =>
      call(
        who,
        `select public.crm_notes_page('${id.T}', ${options.search ? `'${options.search}'` : "null"}, '${options.sort ?? "updatedAt"}', ${options.descending ?? true}, ${options.offset ?? 0}, ${options.limit ?? 100}) page`,
      );
    const donor = (
      name: string | null,
      fields: Record<string, unknown> = {},
      tenant = id.T!,
    ) => {
      const row = randomUUID();
      return db
        .query(
          `insert into public.donors (id, tenant_id, name, type, organization, spouse, status, location, updated_at, created_at)
           values ($1, $2, $3, $4, $5, $6, $7, $8, coalesce($9::timestamptz, now()), coalesce($9::timestamptz, now()))`,
          [
            row,
            tenant,
            name,
            fields.type ?? "individual",
            fields.organization ?? null,
            fields.spouse ?? null,
            fields.status ?? null,
            fields.location ?? null,
            fields.at ?? "2026-08-18T12:00:00Z",
          ],
        )
        .then(() => row);
    };
    const pledge = (fields: Record<string, unknown>) =>
      db.query(
        "insert into public.donor_pledges (id, tenant_id, donor_id, amount, frequency, currency, status, start_date, created_at) values ($1, $2, $3, $4, $5, $6, $7, $8, '2026-01-01T00:00:00Z')",
        [
          fields.id ?? randomUUID(),
          id.T,
          fields.donor ?? null,
          fields.amount ?? 12000,
          "frequency" in fields ? fields.frequency : "monthly",
          fields.currency ?? "usd",
          "status" in fields ? fields.status : "active",
          "start" in fields ? fields.start : "2026-01-01",
        ],
      );
    const careWorker = async () => {
      const party = randomUUID();
      await db.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Cared-for worker')",
        [party, id.T],
      );
      await db.query(
        "insert into public.missionaries (id, tenant_id, party_id, legal_entity_id) values ($1, $2, $3, $2)",
        [key("careWorker"), id.T, party],
      );
    };
    const care = (type: string, title: string, description = "Detail") =>
      db.query(
        "insert into public.member_care_activities (id, tenant_id, missionary_id, author_user_id, type, title, description, occurred_at) values ($1, $2, $3, $4, $5, $6, $7, '2026-08-02T00:00:00Z')",
        [randomUUID(), id.T, id.careWorker, id.care, type, title, description],
      );

    it("both functions are postgres-owned invokers with an empty search path, EXECUTE for authenticated only (red: 42883)", async () => {
      const r = await db.query(
        `select p.oid::regprocedure::text fn, p.prosecdef, pg_get_userbyid(p.proowner) owner, p.proconfig,
                (select string_agg(a.grantee::regrole::text, '+' order by a.grantee::regrole::text) from aclexplode(p.proacl) a
                  where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner) grantees
           from pg_proc p where p.oid in ($1::regprocedure, $2::regprocedure) order by 1`,
        [NOTES, RELATIONSHIPS],
      );
      expect(r.rows).toEqual([
        {
          fn: "crm_notes_page(uuid,text,text,boolean,integer,integer)",
          prosecdef: false,
          owner: "postgres",
          proconfig: ['search_path=""'],
          grantees: "authenticated",
        },
        {
          fn: "crm_relationships_page(uuid,text,text[],text,boolean,integer,integer,timestamp with time zone)",
          prosecdef: false,
          owner: "postgres",
          proconfig: ['search_path=""'],
          grantees: "authenticated",
        },
      ]);
    });

    it("lists the tenant's people, households, churches, organizations, workers and pledges in the service's row shape, and never another tenant's (red: 42883)", () =>
      tx(async () => {
        const jordan = await donor("Jordan Lee");
        const pat = await donor("Pat Rivera", {
          spouse: "Alex Rivera",
          at: "2026-08-18T11:00:00Z",
        });
        const grace = await donor(null, {
          type: "church",
          organization: "Grace Church",
          at: "2026-08-18T10:00:00Z",
        });
        const acme = await donor(null, {
          type: "Company",
          organization: "Acme Builders",
          at: "2026-08-18T09:30:00Z",
        });
        await donor("Other Tenant Donor", {}, id.U);
        const party = randomUUID();
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Worker Party')",
          [party, id.T],
        );
        await db.query(
          "update public.profiles set display_name = 'Sam Ortiz' where id = $1",
          [id.staff],
        );
        await db.query(
          "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id, location, created_at, updated_at) values ($1, $2, $3, $4, $2, ' Kampala ', '2026-08-18T08:00:00Z', '2026-08-18T08:00:00Z')",
          [key("worker"), id.T, party, id.staff],
        );
        await pledge({ id: key("pledge"), donor: jordan, amount: 25000 });

        const page = await relationships("staff");
        const byId = Object.fromEntries(
          page.rows.map((row) => [row.id as string, row]),
        );
        expect(Object.keys(byId).sort()).toEqual(
          [
            `person:${jordan}`,
            `person:${pat}`,
            `household:${pat}`,
            `church:${grace}`,
            `organization:${acme}`,
            `missionary:${id.worker}`,
            `commitment:${id.pledge}`,
          ].sort(),
        );
        expect(byId[`person:${jordan}`]).toEqual({
          authorityLabel: "Asym CRM",
          authorityScope: "crm_relationship",
          commitmentAmountCents: null,
          commitmentCurrency: null,
          commitmentFrequency: null,
          createdAt: "2026-08-18T12:00:00+00:00",
          dedupeKey: "person:jordan-lee",
          displayName: "Jordan Lee",
          donorId: jordan,
          domain: "people",
          id: `person:${jordan}`,
          lastActivityAt: "2026-08-18T12:00:00+00:00",
          location: null,
          memberCount: null,
          primaryContactName: null,
          recordId: jordan,
          recordKind: "person",
          relationshipKind: "person",
          secondaryLabel: null,
          sourceSystem: "Asym CRM",
          status: null,
          tenantId: id.T,
          updatedAt: "2026-08-18T12:00:00+00:00",
        });
        expect(byId[`household:${pat}`]).toMatchObject({
          displayName: "Pat Rivera Household",
          domain: "households",
          donorId: pat,
          memberCount: 2,
          primaryContactName: "Alex Rivera",
          secondaryLabel: "Alex Rivera",
          dedupeKey: "household:pat-rivera-household",
        });
        expect(byId[`person:${pat}`]).toMatchObject({
          primaryContactName: "Alex Rivera",
          secondaryLabel: "Alex Rivera",
        });
        expect(byId[`church:${grace}`]).toMatchObject({
          displayName: "Grace Church",
          domain: "churches",
          secondaryLabel: null,
        });
        expect(byId[`organization:${acme}`]).toMatchObject({
          displayName: "Acme Builders",
          domain: "organizations",
        });
        expect(byId[`missionary:${id.worker}`]).toMatchObject({
          displayName: "Sam Ortiz",
          domain: "people",
          donorId: null,
          secondaryLabel: "Missionary",
          location: "Kampala",
          dedupeKey: "person:sam-ortiz",
        });
        expect(byId[`commitment:${id.pledge}`]).toMatchObject({
          displayName: "Jordan Lee pledge",
          domain: "pledges",
          donorId: jordan,
          commitmentAmountCents: 25000,
          commitmentCurrency: "usd",
          commitmentFrequency: "monthly",
          primaryContactName: "Jordan Lee",
          secondaryLabel: "monthly",
          relationshipKind: "monthly",
          authorityLabel: "Asym finance summary",
          sourceSystem: "Asym finance summary",
          updatedAt: "2026-01-01",
        });
        expect(JSON.stringify(page)).not.toContain("Other Tenant Donor");
        expect(page.totalCount).toBe(7);
        expect(page.report).toMatchObject({
          totalRows: 7,
          householdCount: 1,
          domainCounts: {
            people: 3,
            households: 1,
            organizations: 1,
            churches: 1,
            pledges: 1,
            activity: 0,
          },
        });
      }));

    it("names a worker with no profile 'Missionary' and one whose profile is no member 'Former member'; links a pledge only to a donor of this tenant; leaks no finance identifier", () =>
      tx(async () => {
        const jordan = await donor("Jordan Lee", { spouse: "Pat Lee" });
        const elsewhere = await donor("Elsewhere", {}, id.U);
        for (const [worker, profile] of [
          ["noProfile", null],
          ["former", id.other],
        ] as const) {
          const party = randomUUID();
          await db.query(
            "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Worker')",
            [party, id.T],
          );
          await db.query(
            "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $4, $2)",
            [key(worker), id.T, party, profile],
          );
        }
        await pledge({ id: key("known"), donor: jordan, amount: 1000 });
        await pledge({ id: key("orphan"), donor: elsewhere, amount: 1000 });
        await db.query(
          "update public.donor_pledges set stripe_subscription_id = 'sub_secret', payment_method = 'pm_secret' where tenant_id = $1",
          [id.T],
        );

        const page = await relationships("staff");
        const row = (rid: string) =>
          page.rows.find((r) => r.id === rid) as Record<string, unknown>;
        expect(row(`missionary:${id.noProfile}`).displayName).toBe(
          "Missionary",
        );
        expect(row(`missionary:${id.former}`).displayName).toBe(
          "Former member",
        );
        expect(row(`person:${jordan}`).donorId).toBe(jordan);
        expect(row(`household:${jordan}`).donorId).toBe(jordan);
        expect(row(`commitment:${id.known}`).donorId).toBe(jordan);
        expect(row(`commitment:${id.orphan}`)).toMatchObject({
          donorId: null,
          displayName: "Pledge",
          primaryContactName: null,
        });
        expect(JSON.stringify(page)).not.toMatch(/sub_secret|pm_secret/);

        const pledges = await relationships("staff", { domains: ["pledges"] });
        expect(pledges.rows.map((r) => r.id).sort()).toEqual(
          [`commitment:${id.known}`, `commitment:${id.orphan}`].sort(),
        );
        expect(pledges.totalCount).toBe(2);
        expect(pledges.report).toEqual(page.report);
      }));

    it("care: a non-care caller's whole response is the same before and after care activity is added, every care number 0; a care reader sees non-sensitive activity and the sensitive counted (red: 42883)", () =>
      tx(async () => {
        await donor("Jordan Lee");
        await careWorker();
        const before = {
          all: await relationships("staff"),
          activity: await relationships("staff", { domains: ["activity"] }),
          search: await relationships("staff", { search: "check" }),
          admin: await relationships("admin"),
        };
        await care("check_in", "Weekly check-in", "Follow-up call");
        await care("pastoral_note", "Pastoral note", "Confidential");
        await care(
          "crisis_intervention",
          "Crisis intervention",
          "Confidential crisis details",
        );
        await care("in_person_visit", "A private conversation");
        await care("video_call", "Scared of flying");
        expect({
          all: await relationships("staff"),
          activity: await relationships("staff", { domains: ["activity"] }),
          search: await relationships("staff", { search: "check" }),
          admin: await relationships("admin"),
        }).toEqual(before);
        expect(before.all.report).toMatchObject({
          excludedCareActivityCount: 0,
          recentActivityCount: 0,
          domainCounts: { activity: 0 },
        });

        const reader = await relationships("care", { domains: ["activity"] });
        expect(reader.rows.map((r) => r.displayName)).toEqual([
          "Weekly check-in",
        ]);
        expect(reader.rows[0]).toMatchObject({
          authorityLabel: "Asym member care",
          authorityScope: "member_care",
          sourceSystem: "Asym member care",
          secondaryLabel: "Follow-up call",
          relationshipKind: "check_in",
          updatedAt: "2026-08-02T00:00:00+00:00",
        });
        expect(JSON.stringify(reader)).not.toMatch(
          /Confidential|private conversation|Scared/,
        );
        expect(reader.report).toMatchObject({
          excludedCareActivityCount: 4,
          recentActivityCount: 1,
        });
      }));

    it("counts only active pledges toward commitments whatever the status spelling, states each as a monthly equivalent, counts unknown frequencies and keeps currencies apart, ordered by currency", () =>
      tx(async () => {
        for (const [status, amount, frequency, currency] of [
          ["active", 10000, "monthly", "usd"],
          ["Active", 30000, "quarterly", "usd"],
          [" ACTIVE ", 120000, "Annually", "usd"],
          ["active", 1200, "weekly", "usd"],
          ["active", 50000, "one_time", "usd"],
          ["active", 50000, null, "usd"],
          ["active", 5000, "Semi-Annual", "CAD"],
          ["paused", 99999, "monthly", "usd"],
          ["cancelled", 99999, "monthly", "usd"],
          [null, 99999, "monthly", "usd"],
        ] as const)
          await pledge({ status, amount, frequency, currency });
        const page = await relationships("staff");
        expect(page.report!.activeCommitments).toEqual({
          monthlyByCurrency: [
            { currency: "CAD", monthlyCents: 833, pledgeCount: 1 },
            {
              currency: "USD",
              monthlyCents: 10000 + 10000 + 10000 + 5200,
              pledgeCount: 4,
            },
          ],
          pledgeCount: 7,
          unknownFrequencyCount: 2,
        });
        expect(
          page.rows
            .filter((row) => row.domain === "pledges")
            .map((row) => row.status)
            .sort(),
        ).toEqual(
          [
            "ACTIVE",
            "Active",
            "active",
            "active",
            "active",
            "active",
            "active",
            "cancelled",
            "paused",
            null,
          ].sort(),
        );
      }));

    it("counts church-named organization duplicates and duplicate people as merge candidates, separately", () =>
      tx(async () => {
        await donor(null, { type: "church", organization: "Grace Church" });
        await donor(null, {
          type: "organization",
          organization: "Grace Church",
        });
        await donor("Jordan Lee");
        await donor("  jordan  LEE ");
        const page = await relationships("staff");
        expect(page.report).toMatchObject({
          duplicateCompanyCandidates: 1,
          duplicatePersonCandidates: 1,
        });
      }));

    it("pages exactly over tied sort keys in either direction and every sort field: disjoint, complete, ending on the unique id; totalCount is the filtered set and the report the whole authorized set", () =>
      tx(async () => {
        for (let i = 0; i < 37; i += 1)
          await donor(`Tied ${i % 3}`, {
            status: i % 2 ? "active" : null,
            spouse: i % 5 === 0 ? "Spouse" : null,
          });
        for (let i = 0; i < 11; i += 1)
          await pledge({ amount: i % 2 ? 500 : 900 });
        const whole = await relationships("staff", { limit: 100 });
        const everyId = whole.rows.map((row) => row.id).sort();
        expect(whole.totalCount).toBe(everyId.length);
        for (const sort of [
          "updatedAt",
          "lastActivityAt",
          "createdAt",
          "displayName",
          "domain",
          "status",
          "commitmentAmountCents",
        ])
          for (const descending of [false, true]) {
            const seen: unknown[] = [];
            for (let offset = 0; offset < whole.totalCount; offset += 7) {
              const page = await relationships("staff", {
                sort,
                descending,
                offset,
                limit: 7,
              });
              expect(page.totalCount).toBe(whole.totalCount);
              seen.push(...page.rows.map((row) => row.id));
            }
            expect([sort, descending, seen.length]).toEqual([
              sort,
              descending,
              everyId.length,
            ]);
            expect([sort, descending, [...seen].sort()]).toEqual([
              sort,
              descending,
              everyId,
            ]);
          }
        const people = await relationships("staff", {
          domains: ["people"],
          search: "tied 1",
        });
        expect(people.totalCount).toBe(12);
        expect(people.report).toEqual(whole.report);
        expect(whole.report!.totalRows).toBe(whole.totalCount);
      }));

    it("notes: restricted notes are in neither the rows nor the total for staff and in both for the administrator; search totals are exact; tied keys page disjoint and complete; another tenant's notes never (red: 42883)", () =>
      tx(async () => {
        const at = "2026-08-18T12:00:00Z";
        for (let i = 0; i < 29; i += 1)
          await db.query(
            "insert into public.crm_notes (tenant_id, title, body, visibility, author_name, linked_record_label, created_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $7)",
            [
              id.T,
              `Note ${i % 4}`,
              i % 3 ? "Plain body" : "Line one\n\n  line two",
              i < 5 ? "restricted" : "standard",
              i === 7 ? " " : "Author Ann",
              i === 9 ? "Linked Lab" : null,
              i < 20 ? at : `2026-08-${10 + (i % 5)}T00:00:00Z`,
            ],
          );
        await db.query(
          "insert into public.crm_notes (tenant_id, title, body, visibility) values ($1, 'Other tenant', 'Body', 'standard')",
          [id.U],
        );
        const staff = await notes("staff", { limit: 100 });
        const admin = await notes("admin", { limit: 100 });
        expect(staff.totalCount).toBe(24);
        expect(admin.totalCount).toBe(29);
        expect(staff.rows.some((row) => row.visibility === "restricted")).toBe(
          false,
        );
        expect(JSON.stringify(admin)).not.toContain("Other tenant");
        expect(
          (await notes("staff", { search: "line one line two" })).totalCount,
        ).toBe((await notes("staff", { search: "line one" })).totalCount);
        expect(
          (await notes("staff", { search: "MISSION control" })).totalCount,
        ).toBe(1);
        expect((await notes("staff", { search: "lab" })).totalCount).toBe(1);
        expect((await notes("staff", { search: "note 1" })).totalCount).toBe(6);
        const everyId = staff.rows.map((row) => row.id).sort();
        for (const sort of ["updatedAt", "createdAt", "title"])
          for (const descending of [false, true]) {
            const seen: unknown[] = [];
            for (let offset = 0; offset < staff.totalCount; offset += 5)
              seen.push(
                ...(
                  await notes("staff", { sort, descending, offset, limit: 5 })
                ).rows.map((row) => row.id),
              );
            expect([sort, descending, [...seen].sort()]).toEqual([
              sort,
              descending,
              everyId,
            ]);
          }
      }));
  },
);
