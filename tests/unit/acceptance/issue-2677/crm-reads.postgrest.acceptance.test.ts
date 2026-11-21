import { randomUUID } from "node:crypto";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { GET as notes } from "../../../../packages/api/src/admin/crm/notes";
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
  getAdminClient: vi.fn(() => {
    throw new Error("CRM read used the service key");
  }),
}));
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: () => ({ logRequired: vi.fn() }),
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
    const noteA = randomUUID();
    const noteB = randomUUID();
    const restrictedA = randomUUID();
    const donorIds = [randomUUID(), randomUUID(), randomUUID()];
    const marker = `CRM-fixture-${randomUUID()}`;
    const preferenceIds = Array.from({ length: 3 }, () => randomUUID());
    const auditIds: string[] = [];
    const viewIds = Array.from({ length: 3 }, () => randomUUID());
    const defaultIds = [randomUUID(), randomUUID()];
    const otherProfile = "11111111-1111-1111-1111-111111111111";
    const tableId = "crm.giftHistory";
    let db: pg.Client;
    let sole: { token: string; assignment: string };
    let dual: { token: string; assignment: string };

    beforeAll(async () => {
      const database = process.env.CRM_READ_IT_ADMIN_DATABASE_URL;
      const key = process.env.CRM_READ_IT_ANON_KEY;
      const local = (value?: string) =>
        value && ["127.0.0.1", "localhost"].includes(new URL(value).hostname);
      if (!local(url) || !local(database) || !key)
        throw new Error(
          "CRM acceptance requires the disposable local stack, database and public key",
        );
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url!);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
      db = new pg.Client({ connectionString: database });
      await db.connect();
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
            { columns: { hidden: [`preference-${index}`] } },
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
              columns: { hidden: [`default-${index}`] },
            },
          ],
        );
      }
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
            [[dualA, dualB]],
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
            user: { settings: { columns: { hidden: ["preference-0"] } } },
            tenantDefault: { settings: { columns: { hidden: ["default-0"] } } },
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
