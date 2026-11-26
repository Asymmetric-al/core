import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  anon,
  database,
  required,
  service,
  url,
} from "./identity-keys.postgrest-fixture";
import { GET as notes } from "../../../../packages/api/src/admin/crm/notes";
import { GET as relationships } from "../../../../packages/api/src/admin/crm/relationships";

/**
 * AL-2678 (WP5 rest, pull request 1, r6; plan line 999, "A seeded 1,500-note
 * tenant pages with exact counts"; ruling WP5 part 2 Q11): Mission Control's
 * notes and relationships routes page in Postgres on the caller's token,
 * through real PostgREST with real staff tokens; the service key is never used.
 */
vi.mock("@asym/database/supabase/admin", () => ({
  createAdminClient: () => ({
    from(table: string) {
      if (table !== "audit_logs")
        throw new Error("Unexpected privileged table");
      const audit = createClient(url!, service!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      return {
        insert: (row: Record<string, unknown>) =>
          audit.from("audit_logs").insert(row),
      };
    },
  }),
  getAdminClient: vi.fn(() => {
    throw new Error("A CRM read used the service key");
  }),
}));

const PEOPLE = ["staff", "admin", "care", "staffB"] as const;
type Person = (typeof PEOPLE)[number];

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2678 WP5 rest r6: the CRM's notes and relationships page exactly through the routes",
  () => {
    const TA = randomUUID();
    const TB = randomUUID();
    const user = {} as Record<Person, string>;
    const token = {} as Record<Person, string>;
    const membership = {} as Record<Person, string>;
    const db = new pg.Client({ connectionString: database });
    const api = (path: string, init: RequestInit & { key: string }) =>
      fetch(`${url}/${path}`, {
        ...init,
        headers: {
          apikey: init.key,
          Authorization: `Bearer ${init.key}`,
          "Content-Type": "application/json",
          ...init.headers,
        },
      });

    beforeAll(async () => {
      if (
        !url ||
        !database ||
        !anon ||
        !service ||
        ![url, database].every((value) =>
          ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname),
        )
      )
        throw Error("A disposable local Supabase stack is required");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", anon);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon);
      for (const who of PEOPLE) {
        const credentials = {
          email: `r6-${who}-${TA}@example.test`,
          password: randomUUID(),
        };
        const created = await api("auth/v1/admin/users", {
          key: service,
          method: "POST",
          body: JSON.stringify({ ...credentials, email_confirm: true }),
        });
        expect(created.ok, `Auth fixture ${who}: ${created.status}`).toBe(true);
        user[who] = (await created.json()).id;
        const login = await api("auth/v1/token?grant_type=password", {
          key: anon,
          method: "POST",
          body: JSON.stringify(credentials),
        });
        expect(login.ok, `Sign-in ${who}: ${login.status}`).toBe(true);
        token[who] = (await login.json()).access_token;
      }
      await db.connect();
      await db.query("begin");
      try {
        await db.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'r6 A', 'r6-a-' || $1::text), ($2::uuid, 'r6 B', 'r6-b-' || $2::text)",
          [TA, TB],
        );
        await db.query(
          "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'A', 'US', 'usd', 'A'), ($2, $2, 'B', 'US', 'usd', 'B')",
          [TA, TB],
        );
        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [Object.values(user)],
        );
        for (const who of PEOPLE) {
          membership[who] = randomUUID();
          await db.query(
            "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin) values ($1, $2, $3, 'staff', $4, $5)",
            [
              membership[who],
              user[who],
              who === "staffB" ? TB : TA,
              who === "care" ? "member_care" : "development",
              who === "admin",
            ],
          );
        }
        await db.query(
          `insert into public.crm_notes (tenant_id, title, body, visibility, created_at, updated_at)
           select $1, 'Note ' || (g % 7), 'Body ' || g, case when g <= 50 then 'restricted' else 'standard' end,
                  '2026-08-01T00:00:00Z'::timestamptz + make_interval(mins => g % 300),
                  '2026-08-01T00:00:00Z'::timestamptz + make_interval(mins => g % 300)
             from generate_series(1, 1500) g`,
          [TA],
        );
        await db.query(
          "insert into public.crm_notes (tenant_id, title, body, visibility) select $1, 'Tenant B note', 'Body', 'standard' from generate_series(1, 30)",
          [TB],
        );
        await db.query(
          `insert into public.donors (tenant_id, party_id, name, type, spouse, status, updated_at, created_at)
           select $1, public.donor_party_for_insert($1, null, 'Donor ' || (g % 40), null), 'Donor ' || (g % 40), 'individual',
                  case when g <= 100 then 'Spouse ' || g end, case when g % 3 = 0 then 'active' end,
                  '2026-08-01T00:00:00Z'::timestamptz + make_interval(mins => g % 50),
                  '2026-08-01T00:00:00Z'::timestamptz
             from generate_series(1, 700) g`,
          [TA],
        );
        await db.query(
          `with p as (insert into public.parties (tenant_id, display_name) select $1, 'Worker ' || g from generate_series(1, 150) g returning id)
           insert into public.missionaries (tenant_id, party_id, legal_entity_id, created_at, updated_at)
           select $1, p.id, $1, '2026-08-01T00:00:00Z', '2026-08-01T00:00:00Z' from p`,
          [TA],
        );
        await db.query(
          `insert into public.donor_pledges (tenant_id, donor_id, amount, frequency, status, start_date)
           select $1, null, 1000 + (g % 5) * 100, 'monthly', 'active', '2026-01-01' from generate_series(1, 200) g`,
          [TA],
        );
        await db.query(
          `insert into public.donors (tenant_id, party_id, name)
           select $1, public.donor_party_for_insert($1, null, 'Tenant B donor', null), 'Tenant B donor' from generate_series(1, 20)`,
          [TB],
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    }, 120_000);

    afterAll(async () => {
      vi.unstubAllEnvs();
      try {
        await db.query("begin");
        for (const sql of [
          "delete from public.member_care_activities where tenant_id = any($1::uuid[])",
          "delete from public.crm_notes where tenant_id = any($1::uuid[])",
          "delete from public.donor_pledges where tenant_id = any($1::uuid[])",
          "delete from public.donors where tenant_id = any($1::uuid[])",
          "delete from public.missionaries where tenant_id = any($1::uuid[])",
          "delete from public.parties where tenant_id = any($1::uuid[])",
          "delete from public.audit_logs where tenant_id = any($1::uuid[])",
          "delete from public.legal_entities where tenant_id = any($1::uuid[])",
          "delete from authz.memberships where tenant_id = any($1::uuid[])",
          "delete from public.tenants where id = any($1::uuid[])",
        ])
          await db.query(sql, [[TA, TB]]);
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      } finally {
        await db.end();
        const failures: string[] = [];
        for (const who of PEOPLE)
          if (user[who]) {
            const deleted = await api(`auth/v1/admin/users/${user[who]}`, {
              key: service!,
              method: "DELETE",
            });
            if (!deleted.ok) failures.push(`${who}: ${deleted.status}`);
          }
        expect(failures, "auth users the fixture could not delete").toEqual([]);
      }
    });

    function request(path: string, who: Person) {
      return new NextRequest(new URL(path, url), {
        headers: {
          authorization: `Bearer ${token[who]}`,
          "x-asym-tenant": who === "staffB" ? TB : TA,
          "x-asym-assignment": membership[who],
          "x-asym-role-class": "staff",
          "sec-fetch-site": "same-origin",
        },
      });
    }

    type Answer = Record<string, unknown> & {
      rows: Record<string, unknown>[];
      nextCursor: string | null;
      totalCount: number;
      report?: Record<string, unknown>;
    };

    /** Every page of one listing, each answer without its request id. */
    async function allPages(
      route: (request: NextRequest) => Promise<Response>,
      base: string,
      who: Person,
    ) {
      const pages: Answer[] = [];
      let after: string | null = null;
      for (let guard = 0; guard < 40; guard += 1) {
        const path = `${base}${base.includes("?") ? "&" : "?"}limit=100${after ? `&after=${after}` : ""}`;
        const response = await route(request(path, who));
        const body = (await response.json()) as Answer;
        expect(response.status, JSON.stringify(body).slice(0, 300)).toBe(200);
        delete body.requestId;
        pages.push(body);
        after = body.nextCursor;
        if (!after) break;
      }
      return pages;
    }
    const ids = (pages: Answer[]) =>
      pages.flatMap((page) => page.rows.map((row) => row.id as string));

    it("1,500 notes page exactly past 1,000: every page disjoint, the total exact for staff (restricted notes out) and for the administrator, an exact search total, nothing of B (red: no totalCount; the list stops at PostgREST's row cap)", async () => {
      for (const [who, expected] of [
        ["staff", 1450],
        ["admin", 1500],
      ] as const) {
        const pages = await allPages(notes, "/api/admin/crm/notes", who);
        const seen = ids(pages);
        expect([who, pages[0]!.totalCount]).toEqual([who, expected]);
        expect([who, seen.length, new Set(seen).size]).toEqual([
          who,
          expected,
          expected,
        ]);
        expect(pages.every((page) => page.totalCount === expected)).toBe(true);
        expect(JSON.stringify(pages)).not.toContain("Tenant B note");
      }
      const staffPages = await allPages(notes, "/api/admin/crm/notes", "staff");
      expect(
        staffPages
          .flatMap((page) => page.rows)
          .some((row) => row.visibility === "restricted"),
      ).toBe(false);
      const titled = await allPages(
        notes,
        "/api/admin/crm/notes?q=note%203&sort=title&dir=asc",
        "staff",
      );
      expect(titled[0]!.totalCount).toBe(
        Array.from({ length: 1500 }, (_, i) => i + 1).filter(
          (g) => g > 50 && g % 7 === 3,
        ).length,
      );
      expect(ids(titled)).toHaveLength(titled[0]!.totalCount);
    });

    it("more than 1,050 relationships page exactly past 1,000 over tied keys: disjoint and complete, the page total the filtered set, the report the whole authorized set, nothing of B (red: no totalCount)", async () => {
      const pages = await allPages(
        relationships,
        "/api/admin/crm/relationships",
        "staff",
      );
      const seen = ids(pages);
      expect(pages[0]!.totalCount).toBe(1150);
      expect([seen.length, new Set(seen).size]).toEqual([1150, 1150]);
      expect((pages[0]!.report as { totalRows: number }).totalRows).toBe(1150);
      expect(JSON.stringify(pages)).not.toContain("Tenant B donor");
      const byName = ids(
        await allPages(
          relationships,
          "/api/admin/crm/relationships?sort=displayName&dir=asc",
          "staff",
        ),
      );
      expect([byName.length, new Set(byName).size]).toEqual([1150, 1150]);
      const filtered = await allPages(
        relationships,
        "/api/admin/crm/relationships?domain=households",
        "staff",
      );
      expect(filtered[0]!.totalCount).toBe(100);
      expect(filtered[0]!.report).toEqual(pages[0]!.report);
    });

    it("care: a caller without care.access gets the same response, every page and filter, before and after care activity is added, sensitive or not; a care reader sees the activity they may and the sensitive counted", async () => {
      const listings = [
        "/api/admin/crm/relationships",
        "/api/admin/crm/relationships?domain=activity",
        "/api/admin/crm/relationships?q=check",
        "/api/admin/crm/relationships?sort=status&dir=asc",
      ];
      const capture = async (who: Person) => {
        const out: Record<string, Answer[]> = {};
        for (const listing of listings)
          out[listing] = await allPages(relationships, listing, who);
        return out;
      };
      const before = {
        staff: await capture("staff"),
        admin: await capture("admin"),
      };
      await db.query(
        `insert into public.member_care_activities (tenant_id, missionary_id, author_user_id, type, title, description, occurred_at)
         select $1, (select m.id from public.missionaries m where m.tenant_id = $1 order by m.id limit 1), $2, v.type, v.title, v.description, v.at::timestamptz
           from (values
             ('check_in', 'Weekly check-in', 'Follow-up call', '2026-08-02T00:00:00Z'),
             ('in_person_visit', 'Home visit', 'Visited', '2026-08-03T00:00:00Z'),
             ('pastoral_note', 'Pastoral note', 'Confidential', '2026-08-04T00:00:00Z'),
             ('crisis_intervention', 'Crisis intervention', 'Confidential crisis details', '2026-08-05T00:00:00Z'),
             ('video_call', 'A private call', 'Private', '2026-08-06T00:00:00Z')
           ) as v (type, title, description, at)`,
        [TA, user.care],
      );
      expect({
        staff: await capture("staff"),
        admin: await capture("admin"),
      }).toEqual(before);
      expect(
        before.staff["/api/admin/crm/relationships"]![0]!.report,
      ).toMatchObject({
        excludedCareActivityCount: 0,
        recentActivityCount: 0,
        domainCounts: { activity: 0 },
      });

      const reader = await allPages(
        relationships,
        "/api/admin/crm/relationships?domain=activity",
        "care",
      );
      expect(
        reader
          .flatMap((page) => page.rows.map((row) => row.displayName))
          .sort(),
      ).toEqual(["Home visit", "Weekly check-in"]);
      expect(reader[0]!.totalCount).toBe(2);
      expect(reader[0]!.report).toMatchObject({
        excludedCareActivityCount: 3,
        recentActivityCount: 2,
        totalRows: 1152,
      });
      expect(JSON.stringify(reader)).not.toMatch(/Confidential|private call/i);
    });
  },
);
