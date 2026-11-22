import { randomUUID } from "node:crypto";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { GET as notes } from "../../../../packages/api/src/admin/crm/notes";
import { GET as download } from "../../../../packages/api/src/admin/crm/reports/export";
import { GET as report } from "../../../../packages/api/src/admin/crm/reports";
import { GET as detail } from "../../../../packages/api/src/admin/crm/detail";
import { GET as relationships } from "../../../../packages/api/src/admin/crm/relationships";
import {
  GET as records,
  GET_TAG_OPTIONS as tags,
} from "../../../../packages/api/src/admin/crm";
import {
  GET as preferences,
  GET_NAMED_VIEWS as views,
  PUT_TENANT_DEFAULT as setDefault,
} from "../../../../packages/api/src/admin/crm/table-preferences/route";
import { createRequestSessionClient } from "../../../../packages/api/src/shared/request-session-client";

vi.mock("@asym/database/supabase/admin", () => ({
  // The accepted audit exception exposes only an insert, through the local Data API.
  createAdminClient: () => ({
    from(table: string) {
      if (table !== "audit_logs")
        throw new Error("Unexpected privileged table");
      const audit = createClient(url!, process.env.CRM_READ_IT_AUDIT_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      return {
        insert: (row: Record<string, unknown>) =>
          audit.from("audit_logs").insert(row),
      };
    },
  }),
  getAdminClient: vi.fn(() => {
    throw new Error("CRM read used the service key");
  }),
}));

const url = process.env.CRM_READ_IT_SUPABASE_URL;
const tenantA = "00000000-0000-0000-0000-000000000001";
const tenantB = "00000000-0000-0000-0000-000000000002";
const dualUser = "44444444-4444-4444-4444-444444444444";

describe.skipIf(!url && process.env.CRM_READ_IT_REQUIRED !== "1")(
  "Mission Control reads as the selected staff assignment",
  () => {
    const dualA = randomUUID();
    const dualB = randomUUID();
    const revokedOwner = randomUUID();
    const noteA = randomUUID();
    const noteB = randomUUID();
    const restrictedA = randomUUID();
    const workerIds = [randomUUID(), randomUUID()];
    const donorIds = [randomUUID(), randomUUID(), randomUUID()];
    const candidateId = randomUUID();
    const giftIds = [randomUUID(), randomUUID()];
    const fundIds = [randomUUID(), randomUUID()];
    const syncIds = [randomUUID(), randomUUID()];
    const marker = `CRM-fixture-${randomUUID()}`;
    const preferenceIds = Array.from({ length: 3 }, () => randomUUID());
    const auditIds: string[] = [];
    const viewIds = Array.from({ length: 3 }, () => randomUUID());
    const defaultIds = [randomUUID(), randomUUID()];
    const otherProfile = "11111111-1111-1111-1111-111111111111";
    const tableId = "crm.giftHistory";
    let entityA: string;
    let entityB: string;
    let db: pg.Client;
    let sole: { token: string; assignment: string };
    let dual: { token: string; assignment: string };

    beforeAll(async () => {
      const database = process.env.CRM_READ_IT_ADMIN_DATABASE_URL;
      const key = process.env.CRM_READ_IT_ANON_KEY;
      const local = (value?: string) =>
        value && ["127.0.0.1", "localhost"].includes(new URL(value).hostname);
      if (
        !local(url) ||
        !local(database) ||
        !key ||
        !process.env.CRM_READ_IT_AUDIT_KEY
      )
        throw new Error(
          "CRM acceptance requires the disposable local stack, database and public key",
        );
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url!);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
      db = new pg.Client({ connectionString: database });
      await db.connect();
      const entities = await db.query<{ id: string; tenant_id: string }>(
        "select id,tenant_id from public.legal_entities where tenant_id=any($1::uuid[]) order by tenant_id",
        [[tenantA, tenantB]],
      );
      expect(entities.rows.map((row) => row.tenant_id)).toEqual([
        tenantA,
        tenantB,
      ]);
      [entityA, entityB] = entities.rows.map((row) => row.id) as [
        string,
        string,
      ];
      await db.query(
        "insert into authz.memberships (id,user_id,tenant_id,role,staff_role,is_active,revoked_at) values ($1,$2,$3,'staff','development',false,now())",
        [revokedOwner, "33333333-3333-3333-3333-333333333333", tenantA],
      );
      await db.query(
        "insert into public.missionaries (id,tenant_id,profile_id,location,legal_entity_id) values ($1,$3,$5,'Fixture Alpha',$7),($2,$4,$6,'Fixture Beta',$8)",
        [
          ...workerIds,
          tenantA,
          tenantB,
          dualUser,
          "33333333-3333-3333-3333-333333333333",
          entityA,
          entityB,
        ],
      );
      await db.query(
        "insert into public.donors (id,tenant_id,missionary_id,name,tags) values ($1,$4,$6,$8,array[$8]),($2,$4,$7,$8,array[$8]),($3,$5,$7,$8,array[$9])",
        [
          ...donorIds,
          tenantA,
          tenantB,
          otherProfile,
          "33333333-3333-3333-3333-333333333333",
          marker,
          marker + "-B",
        ],
      );
      await db.query(
        "insert into authz.memberships (id,user_id,tenant_id,role,staff_role) values ($1,$3,$4,'staff','development'),($2,$3,$5,'staff','development')",
        [dualA, dualB, dualUser, tenantA, tenantB],
      );
      await db.query(
        "insert into public.crm_notes (tenant_id,id,title,body,visibility) values ($1,$3,'Fixture A','Local test','standard'),($2,$4,'Fixture B','Local test','standard'),($1,$5,'Restricted A','Local test','restricted')",
        [tenantA, tenantB, noteA, noteB, restrictedA],
      );
      for (const [index, [tenant, profile]] of [
        [tenantA, dualUser],
        [tenantA, otherProfile],
        [tenantB, dualUser],
      ].entries()) {
        await db.query(
          "insert into public.crm_table_user_preferences (id,tenant_id,profile_id,table_id,settings) values ($1,$2,$3,$4,$5)",
          [
            preferenceIds[index],
            tenant,
            profile,
            tableId,
            { columns: { designation: index === 0, statusLine: index === 2 } },
          ],
        );
        await db.query(
          "insert into public.crm_table_named_views (id,tenant_id,profile_id,table_id,name) values ($1,$2,$3,$4,$5)",
          [viewIds[index], tenant, profile, tableId, `view-${index}`],
        );
      }
      for (const [index, tenant] of [tenantA, tenantB].entries()) {
        await db.query(
          "insert into public.crm_table_tenant_defaults (id,tenant_id,table_id,settings) values ($1,$2,$3,$4)",
          [
            defaultIds[index],
            tenant,
            tableId,
            {
              delegatedManagerProfileIds: [dualUser],
              columns: { designation: index === 0, statusLine: false },
            },
          ],
        );
      }
      await db.query(
        "insert into public.donor_merge_candidates (id,tenant_id,existing_donor_id,incoming_donor_id,confidence) values ($1,$2,$3,$4,'possible')",
        [candidateId, tenantA, donorIds[0], donorIds[1]],
      );
      await db.query(
        "insert into public.donations (id,tenant_id,donor_id,missionary_id,amount,currency,status,gift_date) values ($1,$3,$5,$7,1234,'usd','completed','2038-01-10'),($2,$4,$6,$8,4321,'usd','completed','2038-01-10')",
        [...giftIds, tenantA, tenantB, donorIds[0], donorIds[2], ...workerIds],
      );
      await db.query(
        "insert into public.funds (id,tenant_id,name,legal_entity_id) values ($1,$3,'Scope A fund',$5),($2,$4,'Scope B fund',$6)",
        [...fundIds, tenantA, tenantB, entityA, entityB],
      );
      await db.query(
        "update public.donations set fund_id=case when tenant_id=$3 then $1::uuid else $2::uuid end where id=any($4::uuid[])",
        [...fundIds, tenantA, giftIds],
      );
      await db.query(
        "insert into public.donation_crm_links (id,tenant_id,donation_id,scope,link_status) values ($1,$3,$5,'parent','failed'),($2,$4,$6,'parent','failed')",
        [...syncIds, tenantA, tenantB, ...giftIds],
      );
      async function signIn(email: string) {
        const client = createClient(url!, key!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password: "demo-password",
        });
        if (error || !data.session) throw new Error("Fixture sign-in failed");
        const assignments = await client.rpc("current_user_assignments");
        if (assignments.error) throw assignments.error;
        const assignment = assignments.data.find(
          (row: { tenant_id: string; role: string }) =>
            row.role === "staff" && row.tenant_id === tenantA,
        );
        expect(assignment).toBeTruthy();
        return {
          token: data.session.access_token,
          assignment: assignment.id as string,
        };
      }
      sole = await signIn("demo-owner@givehope.test");
      dual = await signIn("two-organizations@donors.test");
    });
    afterAll(async () => {
      vi.unstubAllEnvs();
      if (db) {
        try {
          await db.query(
            "delete from public.donation_crm_links where id=any($1::uuid[])",
            [syncIds],
          );
          await db.query(
            "delete from public.donations where id=any($1::uuid[])",
            [giftIds],
          );
          await db.query(
            "delete from public.donor_merge_candidates where id=$1",
            [candidateId],
          );
          await db.query(
            "delete from public.giving_target_entity_locks where missionary_id=any($1::uuid[]) or fund_id=any($2::uuid[])",
            [workerIds, fundIds],
          );
          await db.query(
            "delete from public.missionaries where id=any($1::uuid[])",
            [workerIds],
          );
          await db.query("delete from public.funds where id=any($1::uuid[])", [
            fundIds,
          ]);
          await db.query("delete from public.donors where id=any($1::uuid[])", [
            donorIds,
          ]);
          await db.query(
            "delete from public.crm_table_preference_audit_events where id=any($1::uuid[])",
            [auditIds],
          );
          await db.query(
            "delete from public.crm_table_user_preferences where id=any($1::uuid[])",
            [preferenceIds],
          );
          await db.query(
            "delete from public.crm_table_named_views where id=any($1::uuid[])",
            [viewIds],
          );
          await db.query(
            "delete from public.crm_table_tenant_defaults where id=any($1::uuid[])",
            [defaultIds],
          );
          await db.query(
            "delete from public.crm_notes where id = any($1::uuid[])",
            [[noteA, noteB, restrictedA]],
          );
          await db.query(
            "delete from authz.memberships where id = any($1::uuid[])",
            [[dualA, dualB, revokedOwner]],
          );
        } finally {
          await db.end();
        }
      }
    });
    function request(path: string, person = dual, tenant = tenantA) {
      return new NextRequest(new URL(path, url), {
        headers: {
          authorization: `Bearer ${person.token}`,
          "x-asym-tenant": tenant,
          "x-asym-assignment": person.assignment,
          "x-asym-role-class": "staff",
          "sec-fetch-site": "same-origin",
        },
      });
    }

    async function exportAuditCount() {
      const count = await db.query<{ n: number }>(
        "select count(*)::int as n from public.audit_logs where tenant_id=$1 and action='crm_export_created'",
        [tenantA],
      );
      return count.rows[0]!.n;
    }

    it("refuses all moved reads for a suspended tenant and writes no export audit", async () => {
      const held = await db.query<{ status: string }>(
        "select status from public.tenants where id=$1",
        [tenantA],
      );
      expect(held.rows).toEqual([{ status: "active" }]);
      const before = await exportAuditCount();
      try {
        await db.query(
          "update public.tenants set status='suspended' where id=$1",
          [tenantA],
        );
        const settings = "/api/admin/crm/table-preferences";
        for (const [name, handler, path] of [
          ["records", records, "/api/admin/crm/records"],
          ["tags", tags, "/api/admin/crm/tags"],
          ["detail", detail, "/api/admin/crm/records/" + donorIds[0]],
          ["relationships", relationships, "/api/admin/crm/relationships"],
          ["notes", notes, "/api/admin/crm/notes"],
          ["report", report, "/api/admin/crm/reports?slice=funds"],
          ["export", download, "/api/admin/crm/reports/export?slice=funds"],
          ["preferences", preferences, settings],
          ["named views", views, settings + "/named-views"],
          ["tenant default", setDefault, settings + "/tenant-default"],
        ] as const) {
          const req = request(path);
          const res = await handler(
            handler === setDefault
              ? new NextRequest(req.url, {
                  method: "PUT",
                  headers: {
                    ...Object.fromEntries(req.headers),
                    "content-type": "application/json",
                  },
                  body: JSON.stringify({
                    tableId,
                    columns: { statusLine: true },
                  }),
                })
              : req,
          );
          expect(res.status, name).toBe(401);
          expect(res.headers.has("x-asym-scope-refused"), name).toBe(true);
        }
        expect(await exportAuditCount()).toBe(before);
      } finally {
        await db.query("update public.tenants set status=$2 where id=$1", [
          tenantA,
          held.rows[0]!.status,
        ]);
      }
    });

    it.each(["preferences", "views", "default pre-check"] as const)(
      "scopes the %s handler to the tenant and personal settings to their owner",
      async (operation) => {
        const invoke = async (person: typeof dual, tenant: string) => {
          const req = request(
            "/api/admin/crm/table-preferences",
            person,
            tenant,
          );
          if (operation === "preferences") return preferences(req);
          if (operation === "views") return views(req);
          const headers = new Headers(req.headers);
          headers.set("content-type", "application/json");
          return setDefault(
            new NextRequest(req.url, {
              method: "PUT",
              headers,
              body: JSON.stringify({ tableId, columns: { statusLine: true } }),
            }),
          );
        };
        const auditCount = async () =>
          (
            await db.query(
              "select count(*)::int as n from public.crm_table_preference_audit_events where tenant_id=$1",
              [tenantB],
            )
          ).rows[0].n;
        const before = await auditCount();
        const refused = await invoke(sole, tenantB);
        expect(refused.status).toBe(401);
        expect(refused.headers.has("x-asym-scope-refused")).toBe(true);
        expect(await auditCount()).toBe(before);
        const stamp = (await db.query("select clock_timestamp()::text as ts"))
          .rows[0].ts;
        const res = await invoke(dual, tenantA);
        if (operation === "default pre-check")
          auditIds.push(
            ...(
              await db.query(
                "select id from public.crm_table_preference_audit_events where tenant_id=$1 and actor_profile_id=$2 and table_id=$3 and created_at >= $4",
                [tenantA, dualUser, tableId, stamp],
              )
            ).rows.map((row) => row.id),
          );
        expect(res.status).toBe(200);
        const body = await res.json();
        if (operation === "preferences")
          expect(body).toMatchObject({
            user: {
              settings: { columns: { designation: true, statusLine: false } },
            },
            tenantDefault: {
              settings: { columns: { designation: true, statusLine: false } },
            },
            canManageTenantDefaults: true,
          });
        if (operation === "views")
          expect(body.views.map((view: { id: string }) => view.id)).toEqual([
            viewIds[0],
          ]);
        if (operation === "default pre-check")
          expect(body.tenantDefault.settings.columns.statusLine).toBe(true);
        expect(getAdminClient).not.toHaveBeenCalled();
      },
    );

    it("applies tenant and owner policies with no application tenant or profile filter", async () => {
      const scoped = await createRequestSessionClient(request("/"), {
        tenantId: tenantA,
        assignmentId: dual.assignment,
      });
      for (const [table, cols] of [
        ["crm_table_user_preferences", "profile_id,tenant_id"],
        ["crm_table_named_views", "profile_id,tenant_id"],
        ["crm_table_tenant_defaults", "tenant_id"],
      ] as const) {
        const { data, error } = await scoped.from(table).select(cols);
        expect(error).toBeNull();
        expect(data).toEqual([
          table === "crm_table_tenant_defaults"
            ? { tenant_id: tenantA }
            : { tenant_id: tenantA, profile_id: dualUser },
        ]);
      }
    });

    it.each([
      ["records", records],
      ["tags", tags],
    ] as const)("reads %s with the caller token", async (kind, handler) => {
      const path = "/api/admin/crm?q=" + marker;
      const refused = await handler(request(path, sole, tenantB));
      expect(refused.status).toBe(401);
      expect(refused.headers.has("x-asym-scope-refused")).toBe(true);
      const req = request(path, dual);
      const list = await handler(req);
      expect(list.status).toBe(200);
      const body = await list.json();
      if (kind === "records") {
        expect(body.rows.map((r: { id: string }) => r.id).sort()).toEqual(
          donorIds.slice(0, 2).sort(),
        );
        expect(
          body.rows.find((r: { id: string }) => r.id === donorIds[0])
            .assignedMissionaryName,
        ).toBeTruthy();
        expect(
          body.rows.find((r: { id: string }) => r.id === donorIds[1])
            .assignedMissionaryName,
        ).toBe("Former member");
      } else {
        expect(body.tags).toContain(marker);
        expect(body.tags).not.toContain(marker + "-B");
      }
      const scoped = await createRequestSessionClient(req, {
        tenantId: tenantA,
        assignmentId: dual.assignment,
      });
      const direct = await scoped
        .from("donors")
        .select("id")
        .in("id", donorIds);
      expect(direct.error).toBeNull();
      expect(direct.data?.map((r) => r.id).sort()).toEqual(
        donorIds.slice(0, 2).sort(),
      );
      expect(getAdminClient).not.toHaveBeenCalled();
    });

    it("reads relationships from the selected tenant and names workers from the directory", async () => {
      const path = "/api/admin/crm/relationships?q=Riley";
      const refused = await relationships(request(path, sole, tenantB));
      expect(refused.status).toBe(401);
      expect(refused.headers.has("x-asym-scope-refused")).toBe(true);
      const req = request(path);
      const res = await relationships(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.rows).toContainEqual(
        expect.objectContaining({
          recordId: workerIds[0],
          displayName: "Riley Okafor",
          location: "Fixture Alpha",
        }),
      );
      expect(JSON.stringify(body)).not.toContain(workerIds[1]);
      const scoped = await createRequestSessionClient(req, {
        tenantId: tenantA,
        assignmentId: dual.assignment,
      });
      const direct = await scoped
        .from("missionaries")
        .select("id")
        .in("id", workerIds);
      expect(direct.error).toBeNull();
      expect(direct.data).toEqual([{ id: workerIds[0] }]);
      const care = await scoped
        .from("missionaries")
        .select("health_status")
        .in("id", workerIds);
      expect(care.error?.code).toBe("42501");
      expect(getAdminClient).not.toHaveBeenCalled();
    });

    it("reads donor detail, gifts and either side of an open native duplicate candidate", async () => {
      const path = (id: string) => "/api/admin/crm/records/" + id;
      const denied = await detail(request(path(donorIds[2]), sole, tenantB));
      expect(denied.status).toBe(401);
      expect(denied.headers.has("x-asym-scope-refused")).toBe(true);
      const hidden = await detail(request(path(donorIds[2])));
      expect(hidden.status).toBe(404);
      expect((await detail(request(path(randomUUID())))).status).toBe(404);
      for (const side of [0, 1]) {
        const res = await detail(request(path(donorIds[side])));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.donor.id).toBe(donorIds[side]);
        expect(body.duplicateWarnings).toEqual([
          expect.objectContaining({
            id: candidateId,
            candidateId: donorIds[1 - side],
            candidateLabel: marker,
            confidence: null,
            score: null,
          }),
        ]);
        if (side === 0) {
          expect(JSON.stringify(body.giftHistory)).toContain(giftIds[0]);
          expect(JSON.stringify(body)).toContain("Riley Okafor");
        }
        expect(JSON.stringify(body)).not.toContain(giftIds[1]);
      }
      expect(getAdminClient).not.toHaveBeenCalled();
    });

    it.each(["donors", "funds", "missionaries", "sync-failures"] as const)(
      "scopes the %s report to the active staff assignment",
      async (slice) => {
        const path = `/api/admin/crm/reports?slice=${slice}&dateFrom=2038-01-10&dateTo=2038-01-10`;
        const denied = await report(request(path, sole, tenantB));
        expect(denied.status).toBe(401);
        expect(denied.headers.has("x-asym-scope-refused")).toBe(true);
        const res = await report(request(path));
        expect(res.status).toBe(200);
        const body = await res.json();
        const ids = {
          donors: donorIds,
          funds: fundIds,
          missionaries: workerIds,
          "sync-failures": syncIds,
        }[slice];
        expect(body.rows.map((row: { id: string }) => row.id)).toContain(
          ids[0],
        );
        expect(JSON.stringify(body)).not.toContain(ids.at(-1));
        if (slice !== "sync-failures") {
          expect(body.rows).toHaveLength(1);
          expect(body.rows[0]).toMatchObject({
            amountCents: 1234,
            label: {
              donors: marker,
              funds: "Scope A fund",
              missionaries: "Riley Okafor",
            }[slice],
          });
          expect(body.completeness.complete).toBe(true);
        }
        expect(getAdminClient).not.toHaveBeenCalled();
      },
    );

    it("projects donor anonymity for both export audiences and stores only safe audit references", async () => {
      const ids = [randomUUID(), randomUUID(), randomUUID()];
      const gifts = ids.map(() => randomUUID());
      const assignment = randomUUID();
      const auditMarker = randomUUID();
      const path =
        "/api/admin/crm/reports/export?slice=donors&dateFrom=2038-02-01&dateTo=2038-02-01";
      const names = ids.map((_, i) => `Export choice ${i}`);
      const run = async (person: typeof dual, tenant: string, query = "") => {
        const req = request(path + query, person, tenant);
        req.headers.set("user-agent", auditMarker);
        return download(req);
      };
      const audit = async () =>
        (
          await db.query(
            "select tenant_id,user_id,details from public.audit_logs where user_agent=$1 order by created_at",
            [auditMarker],
          )
        ).rows;
      try {
        await db.query(
          "insert into authz.memberships(id,user_id,tenant_id,role,staff_role) values ($1,$2,$3,'staff','finance')",
          [assignment, dualUser, tenantA],
        );
        for (const [i, id] of ids.entries()) {
          await db.query(
            "insert into public.donors (id,name,tenant_id,giving_preferences) values ($1,$2,$3,$4)",
            [
              id,
              names[i],
              tenantA,
              i === 0 ? {} : { defaultAnonymousToPublic: i === 1 },
            ],
          );
          await db.query(
            "insert into public.donations(id,donor_id,tenant_id,amount,status,gift_date) values ($1,$2,$3,123,'completed','2038-02-01')",
            [gifts[i], id, tenantA],
          );
        }
        const denied = await run(sole, tenantB);
        expect(denied.status).toBe(401);
        expect(await audit()).toEqual([]);
        for (const finance of [false, true]) {
          const person = finance ? { ...dual, assignment } : dual;
          const res = await run(person, tenantA);
          expect(res.status).toBe(200);
          const csv = await res.text();
          expect(csv).toContain('"label","net_amount_cents"');
          expect(csv).toContain(names[0]);
          expect(csv).toContain(names[2]);
          expect(csv.includes(names[1])).toBe(finance);
          expect(csv).not.toMatch(
            /giving_preferences|defaultAnonymousToPublic/,
          );
          expect((await audit()).at(-1)).toMatchObject({
            tenant_id: tenantA,
            user_id: dualUser,
            details: { anonymousGroups: 1, rowCount: 3 },
          });
          const details = (await audit()).at(-1).details;
          expect(details.groupIds.sort()).toEqual(
            [ids[0], ids[2]].map((id) => "donors:" + id).sort(),
          );
          const searched = await run(
            person,
            tenantA,
            "&q=" + encodeURIComponent(names[1]),
          );
          expect(searched.status).toBe(200);
          expect((await searched.text()).includes(names[1])).toBe(finance);
          expect((await audit()).at(-1).details.rowCount).toBe(finance ? 1 : 0);
        }
        expect(getAdminClient).not.toHaveBeenCalled();
      } finally {
        await db.query("delete from public.audit_logs where user_agent=$1", [
          auditMarker,
        ]);
        await db.query(
          "delete from public.donations where id=any($1::uuid[])",
          [gifts],
        );
        await db.query("delete from public.donors where id=any($1::uuid[])", [
          ids,
        ]);
        await db.query("delete from authz.memberships where id=$1", [
          assignment,
        ]);
      }
    });

    it("keeps both tenants' populated CRM tables isolated without a caller-side tenant condition", async () => {
      const pairs = () => [randomUUID(), randomUUID()];
      const staged = pairs(),
        allocations = pairs(),
        commitments = pairs(),
        activities = pairs(),
        care = pairs(),
        corrections = pairs(),
        requests = pairs(),
        adjustments = pairs();
      const secondCandidate = randomUUID();
      const addedPolicies: string[] = [];
      try {
        for (const [i, tenant] of [tenantA, tenantB].entries()) {
          const donor = donorIds[i === 0 ? 0 : 2],
            gift = giftIds[i];
          await db.query(
            "insert into public.staged_gifts(id,tenant_id,donation_id,amount) values ($1,$2,$3,123)",
            [staged[i], tenant, gift],
          );
          await db.query(
            "insert into public.staged_gift_allocations(id,tenant_id,staged_gift_id,amount) values ($1,$2,$3,123)",
            [allocations[i], tenant, staged[i]],
          );
          await db.query(
            "insert into public.donor_pledges(id,tenant_id,donor_id,amount) values ($1,$2,$3,123)",
            [commitments[i], tenant, donor],
          );
          await db.query(
            "insert into public.donor_activities(id,donor_id,type,title) values ($1,$2,'call','Fixture call')",
            [activities[i], donor],
          );
          await db.query(
            "insert into public.member_care_activities(id,tenant_id,missionary_id,author_user_id,type,description) values ($1,$2,$3,$4,'video_call','Fixture call')",
            [care[i], tenant, workerIds[i], dualUser],
          );
          await db.query(
            "insert into public.contribution_corrections(id,tenant_id,donation_id,correction_type,reason,source_surface) values ($1,$2,$3,'metadata_update','test','api')",
            [corrections[i], tenant, gift],
          );
          await db.query(
            "insert into public.contribution_correction_requests(id,tenant_id,donation_id,action_type,reason,source_surface) values ($1,$2,$3,'metadata_update','test','api')",
            [requests[i], tenant, gift],
          );
          // A legacy adjustment in A can name B's targets. Neither label may appear.
          await db.query(
            "insert into public.contribution_adjustments(id,tenant_id,donation_id,adjustment_type,reason,source_surface,effective_values) values ($1,$2,$3,'fund_correction','test','api',$4)",
            [
              adjustments[i],
              tenant,
              gift,
              { fundId: fundIds[1], missionaryId: workerIds[1] },
            ],
          );
          const policy = await db.query(
            "insert into public.contribution_approval_policies(tenant_id) values ($1) on conflict do nothing returning tenant_id",
            [tenant],
          );
          if (policy.rowCount) addedPolicies.push(tenant);
        }
        await db.query(
          "insert into public.donor_merge_candidates(id,tenant_id,existing_donor_id,confidence) values ($1,$2,$3,'low')",
          [secondCandidate, tenantB, donorIds[2]],
        );
        const req = request("/"),
          scoped = await createRequestSessionClient(req, {
            tenantId: tenantA,
            assignmentId: dual.assignment,
          });
        for (const [table, key, ids] of [
          ["donations", "id", giftIds],
          ["funds", "id", fundIds],
          ["staged_gifts", "id", staged],
          ["staged_gift_allocations", "id", allocations],
          ["donor_pledges", "id", commitments],
          ["donor_activities", "id", activities],
          ["member_care_activities", "id", care],
          ["contribution_corrections", "donation_id", giftIds],
          ["contribution_correction_requests", "donation_id", giftIds],
          ["contribution_adjustments", "id", adjustments],
          ["donor_merge_candidates", "id", [candidateId, secondCandidate]],
          ["donation_crm_links", "id", syncIds],
          ["contribution_approval_policies", "tenant_id", [tenantA, tenantB]],
        ] as const) {
          const result = await scoped.from(table).select(key).in(key, ids);
          expect(result.error, table).toBeNull();
          expect(result.data, table).toEqual([{ [key]: ids[0] }]);
        }
        const policies = await scoped
          .from("field_policies")
          .select("tenant_id");
        expect(policies.error).toBeNull();
        expect(policies.data?.length).toBeGreaterThan(0);
        expect(
          policies.data?.every(
            (row) => row.tenant_id === null || row.tenant_id === tenantA,
          ),
        ).toBe(true);
        for (const slice of ["funds", "missionaries"]) {
          const res = await report(
            request(
              `/api/admin/crm/reports?slice=${slice}&dateFrom=2038-01-10&dateTo=2038-01-10`,
            ),
          );
          expect(res.status).toBe(200);
          const body = await res.json();
          expect(body.completeness.complete).toBe(false);
          expect(body.rows.map((row: { label: string }) => row.label)).toEqual([
            slice === "funds" ? "Unnamed fund" : "Unassigned",
          ]);
        }
      } finally {
        for (const [table, ids] of [
          ["staged_gift_allocations", allocations],
          ["staged_gifts", staged],
          ["donor_pledges", commitments],
          ["donor_activities", activities],
          ["member_care_activities", care],
          ["contribution_corrections", corrections],
          ["contribution_correction_requests", requests],
          ["contribution_adjustments", adjustments],
          ["donor_merge_candidates", [secondCandidate]],
        ] as const) {
          await db.query(
            `delete from public.${table} where id=any($1::uuid[])`,
            [ids],
          );
        }
        await db.query(
          "delete from public.contribution_approval_policies where tenant_id=any($1::uuid[])",
          [addedPolicies],
        );
      }
    });

    it("resolves every label across two lookup chunks through PostgREST", async () => {
      const ids = Array.from({ length: 151 }, () => randomUUID());
      const source = "unnest($1::uuid[]) with ordinality as f(id,n)";
      try {
        await db.query("begin");
        await db.query(
          `insert into auth.users(id,email,raw_user_meta_data) select id,id::text || '@crm-fixture.invalid','{}'::jsonb from ${source}`,
          [ids],
        );
        await db.query(
          `update public.profiles p set display_name=case when f.n>1 then 'Worker '||f.n end,first_name=null,last_name=null,full_name=null from ${source} where p.user_id=f.id`,
          [ids],
        );
        await db.query(
          `insert into public.missionaries(id,tenant_id,profile_id,legal_entity_id) select f.id,$2::uuid,p.id,$3::uuid from ${source} join public.profiles p on p.user_id=f.id`,
          [ids, tenantA, entityA],
        );
        await db.query(
          `insert into public.funds(id,tenant_id,name,legal_entity_id) select id,$2::uuid,'Fund '||n,$3::uuid from ${source}`,
          [ids, tenantA, entityA],
        );
        await db.query(
          `insert into public.donors(id,tenant_id,name) select id,$2::uuid,'Donor '||n from ${source}`,
          [ids, tenantA],
        );
        await db.query(
          `insert into public.donations(id,tenant_id,donor_id,fund_id,missionary_id,amount,status,gift_date) select id,$2::uuid,id,id,id,123,'completed','2038-03-01' from ${source}`,
          [ids, tenantA],
        );
        await db.query("commit");
        for (const [slice, prefix] of [
          ["donors", "Donor"],
          ["funds", "Fund"],
          ["missionaries", "Worker"],
        ] as const) {
          const url = `/api/admin/crm/reports?slice=${slice}&dateFrom=2038-03-01&dateTo=2038-03-01`;
          const response = await report(request(url));
          expect(response.status).toBe(200);
          const body = await response.json();
          expect(body.completeness.complete).toBe(true);
          expect(body.totals.giftCount).toBe(ids.length);
          const labels = new Map(
            body.rows.map((row: { id: string; label: string }) => [
              row.id,
              row.label,
            ]),
          );
          ids.forEach((id, index) =>
            expect(labels.get(id)).toBe(
              slice === "missionaries" && index === 0
                ? id + "@crm-fixture.invalid"
                : prefix + " " + (index + 1),
            ),
          );
        }
      } finally {
        await db.query("rollback");
        await db.query(
          "delete from public.donations where id=any($1::uuid[])",
          [ids],
        );
        await db.query(
          "delete from public.giving_target_entity_locks where missionary_id=any($1::uuid[]) or fund_id=any($1::uuid[])",
          [ids],
        );
        for (const table of ["donors", "funds", "missionaries"])
          await db.query(
            `delete from public.${table} where id=any($1::uuid[])`,
            [ids],
          );
        await db.query("delete from auth.users where id=any($1::uuid[])", [
          ids,
        ]);
      }
    });
    it("reads the selected tenant's notes and enforces restricted visibility in PostgREST", async () => {
      const path = "/api/admin/crm/notes";
      const refused = await notes(request(path, sole, tenantB));
      expect(refused.status).toBe(401);
      expect(refused.headers.has("x-asym-scope-refused")).toBe(true);
      for (const [person, visible] of [
        [dual, [noteA]],
        [sole, [noteA, restrictedA]],
      ] as const) {
        const req = request(path, person);
        const res = await notes(req);
        expect(res.status).toBe(200);
        const ids = (await res.json()).rows.map(
          (row: { id: string }) => row.id,
        );
        expect(
          ids
            .filter((id: string) => [noteA, noteB, restrictedA].includes(id))
            .sort(),
        ).toEqual([...visible].sort());
        const client = await createRequestSessionClient(req, {
          tenantId: tenantA,
          assignmentId: person.assignment,
        });
        const direct = await client
          .from("crm_notes")
          .select("id")
          .in("id", [noteA, noteB, restrictedA]);
        expect(direct.error).toBeNull();
        expect(direct.data?.map((row) => row.id).sort()).toEqual(
          [...visible].sort(),
        );
      }
      expect(getAdminClient).not.toHaveBeenCalled();
    });
  },
);
