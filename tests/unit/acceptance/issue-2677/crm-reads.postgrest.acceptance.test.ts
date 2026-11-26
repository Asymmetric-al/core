import { randomUUID } from "node:crypto";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  GET as notes,
  POST as createNote,
} from "../../../../packages/api/src/admin/crm/notes";
import * as exportProjection from "../../../../packages/api/src/admin/crm/reports/export-projection";
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
  "Mission Control reads as the selected staff assignment (D-18, AL-2678: fixture missionaries name a Party, activities carry their tenant, and the Parties the donor trigger adds are removed with their donors)",
  () => {
    const dualA = randomUUID();
    const dualB = randomUUID();
    const revokedOwner = randomUUID();
    const noteA = randomUUID();
    const noteB = randomUUID();
    const restrictedA = randomUUID();
    const workerIds = [randomUUID(), randomUUID()];
    const donorIds = [randomUUID(), randomUUID(), randomUUID()];
    let donorPartyIds: string[] = [];
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
    const fieldPolicyRecordType = "crm_report_groups";
    const fieldPolicyKey = `sentinel_${randomUUID().replaceAll("-", "_")}`;
    const noteKeys: string[] = [];
    const noteTitles: string[] = [];
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
        "with party as (insert into public.parties (id,tenant_id,display_name) values ($1,$3,'Fixture Alpha'),($2,$4,'Fixture Beta') returning id) insert into public.missionaries (id,tenant_id,profile_id,location,legal_entity_id,party_id) values ($1,$3,$5,'Fixture Alpha',$7,$1),($2,$4,$6,'Fixture Beta',$8,$2)",
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
      donorPartyIds = (
        await db.query(
          "select party_id from public.donors where id=any($1::uuid[])",
          [donorIds],
        )
      ).rows.map((row) => row.party_id as string);
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
      await db.query(
        "insert into public.field_policies (record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category) values ($1,$2,'mission_control',$3,true,false,false,'internal')",
        [fieldPolicyRecordType, fieldPolicyKey, tenantB],
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
        const failedTables: string[] = [];
        const trackedDeletes: readonly [string, string, unknown[]][] = [
          ["public.donation_crm_links", "id=any($1::uuid[])", [syncIds]],
          ["public.donations", "id=any($1::uuid[])", [giftIds]],
          ["public.donor_merge_candidates", "id=$1", [candidateId]],
          [
            "public.giving_target_entity_locks",
            "missionary_id=any($1::uuid[]) or fund_id=any($2::uuid[])",
            [workerIds, fundIds],
          ],
          ["public.missionaries", "id=any($1::uuid[])", [workerIds]],
          ["public.funds", "id=any($1::uuid[])", [fundIds]],
          ["public.donors", "id=any($1::uuid[])", [donorIds]],
          [
            "public.parties",
            "id=any($1::uuid[]) or id=any($2::uuid[])",
            [workerIds, donorPartyIds],
          ],
          [
            "public.crm_table_preference_audit_events",
            "id=any($1::uuid[])",
            [auditIds],
          ],
          [
            "public.crm_table_user_preferences",
            "id=any($1::uuid[])",
            [preferenceIds],
          ],
          ["public.crm_table_named_views", "id=any($1::uuid[])", [viewIds]],
          [
            "public.crm_table_tenant_defaults",
            "id=any($1::uuid[])",
            [defaultIds],
          ],
          [
            "public.crm_command_logs",
            "idempotency_key=any($1::text[]) or resource_id in (select id::text from public.crm_notes where idempotency_key=any($1::text[]) or title=any($2::text[]))",
            [noteKeys, noteTitles],
          ],
          [
            "public.crm_notes",
            "idempotency_key=any($1::text[]) or title=any($2::text[])",
            [noteKeys, noteTitles],
          ],
          [
            "public.crm_notes",
            "id = any($1::uuid[])",
            [[noteA, noteB, restrictedA]],
          ],
          [
            "authz.memberships",
            "id = any($1::uuid[])",
            [[dualA, dualB, revokedOwner]],
          ],
          [
            "public.field_policies",
            "record_type=$1 and field_key=$2 and surface='mission_control' and tenant_id=$3",
            [fieldPolicyRecordType, fieldPolicyKey, tenantB],
          ],
        ];
        try {
          for (const [table, predicate, params] of trackedDeletes) {
            try {
              await db.query(`delete from ${table} where ${predicate}`, params);
            } catch (error) {
              const reason =
                error instanceof Error ? error.message : String(error);
              failedTables.push(`${table}: ${reason}`);
            }
          }
        } finally {
          await db.end();
        }
        if (failedTables.length > 0) {
          throw new Error(
            `Fixture cleanup failed for tables: ${failedTables.join("; ")}`,
          );
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

    describe("creating a note through the command on the caller's token", () => {
      const keys = noteKeys;
      const titles = noteTitles;
      const title = "Private call " + randomUUID();
      const body = "Private follow-up " + randomUUID();

      function post(
        key: string | null,
        input: Record<string, unknown> = {},
        person = dual,
        tenant = tenantA,
      ) {
        const req = request("/api/admin/crm/notes", person, tenant);
        const headers = new Headers(req.headers);
        headers.set("content-type", "application/json");
        if (key !== null) {
          keys.push(key);
          headers.set("idempotency-key", key);
        }
        return createNote(
          new NextRequest(req.url, {
            method: "POST",
            headers,
            body: JSON.stringify({ title, body, ...input }),
          }),
        );
      }

      async function persisted(key: string) {
        const notes = await db.query(
          "select * from public.crm_notes where idempotency_key=$1",
          [key],
        );
        const logs = await db.query(
          "select * from public.crm_command_logs where idempotency_key=$1",
          [key],
        );
        return { notes: notes.rows, logs: logs.rows };
      }

      it("refuses a tenant the caller holds no row in and writes nothing in either tenant", async () => {
        const key = randomUUID();
        const denied = await post(key, {}, sole, tenantB);
        expect(denied.status).toBe(401);
        expect(denied.headers.has("x-asym-scope-refused")).toBe(true);
        expect(await persisted(key)).toEqual({ notes: [], logs: [] });
        expect((await post(key, {}, sole)).status).toBe(201);
        expect((await persisted(key)).notes).toEqual([
          expect.objectContaining({ tenant_id: tenantA }),
        ]);
        expect(getAdminClient).not.toHaveBeenCalled();
      });

      it("writes in the selected tenant only, by the session's person, whatever the body names", async () => {
        const key = randomUUID();
        const res = await post(key, {
          title: `About ${tenantB}`,
          body: `Tenant ${tenantB}`,
          linkedRecordId: tenantB,
          linkedRecordLabel: tenantB,
          linkedRecordType: "organization",
          tenantId: tenantB,
          tenant_id: tenantB,
          authorProfileId: otherProfile,
          author_profile_id: otherProfile,
          actor_user_id: otherProfile,
          actor_profile_id: otherProfile,
        });
        expect(res.status).toBe(201);
        const reply = await res.json();
        const rows = await persisted(key);
        expect(rows.notes).toEqual([
          expect.objectContaining({
            id: reply.note.id,
            tenant_id: tenantA,
            author_profile_id: dualUser,
            linked_record_id: tenantB,
          }),
        ]);
        expect(rows.logs).toEqual([
          expect.objectContaining({
            id: reply.commandLogId,
            tenant_id: tenantA,
            actor_user_id: dualUser,
            actor_profile_id: dualUser,
            resource_id: reply.note.id,
          }),
        ]);
        expect(getAdminClient).not.toHaveBeenCalled();
      });

      it("refuses a restricted note without the administrator flag and keeps request content out of the log", async () => {
        const key = randomUUID();
        const refused = await post(key, { visibility: "restricted" });
        expect(refused.status).toBe(403);
        expect(await persisted(key)).toEqual({ notes: [], logs: [] });
        expect(
          (await post(key, { visibility: "restricted" }, sole)).status,
        ).toBe(201);
        const { notes, logs } = await persisted(key);
        expect(notes).toEqual([
          expect.objectContaining({ visibility: "restricted" }),
        ]);
        expect(logs).toHaveLength(1);
        expect(logs[0]).toMatchObject({
          action: "crm.note.create",
          resource_type: "note",
          status: "succeeded",
          command_payload: {},
          result_summary: {},
          error_message: null,
        });
        for (const value of [title, body, "restricted"])
          expect(JSON.stringify(logs)).not.toContain(value);
        expect(getAdminClient).not.toHaveBeenCalled();
      });

      it("refuses a suspended tenant before it writes", async () => {
        const key = randomUUID();
        await db.query(
          "update public.tenants set status='suspended' where id=$1",
          [tenantA],
        );
        try {
          const refused = await post(key);
          expect(refused.status).toBe(401);
          expect(refused.headers.has("x-asym-scope-refused")).toBe(true);
          expect(await persisted(key)).toEqual({ notes: [], logs: [] });
        } finally {
          await db.query(
            "update public.tenants set status='active' where id=$1",
            [tenantA],
          );
        }
        expect((await post(key)).status).toBe(201);
        expect(getAdminClient).not.toHaveBeenCalled();
      });

      it("stores one note and one log row for retries of one submission", async () => {
        const key = randomUUID();
        const responses = await Promise.all([post(key), post(key)]);
        expect(responses.map((res) => res.status)).toEqual([201, 201]);
        const replies = await Promise.all(responses.map((res) => res.json()));
        expect(replies[0].note.id).toBe(replies[1].note.id);
        expect(replies[0].commandLogId).toBe(replies[1].commandLogId);
        expect(
          replies
            .map((reply: { duplicate: boolean }) => reply.duplicate)
            .sort(),
        ).toEqual([false, true]);
        expect(replies[0].requestId).not.toBe(replies[1].requestId);
        const rows = await persisted(key);
        expect(rows.notes).toHaveLength(1);
        expect(rows.logs).toHaveLength(1);
        expect((await post(key, { body: "Another submission" })).status).toBe(
          409,
        );
        expect((await post(key, {}, sole)).status).toBe(409);
        expect(await persisted(key)).toEqual(rows);
        expect(getAdminClient).not.toHaveBeenCalled();
      });

      it("mints a key for a request that sends none and refuses one that is not a UUID", async () => {
        const minted = "Unkeyed " + randomUUID();
        const malformed = "Malformed " + randomUUID();
        titles.push(minted, malformed);
        const saved = await post(null, { title: minted });
        expect(saved.status).toBe(201);
        const stored = await db.query(
          "select idempotency_key from public.crm_notes where title=$1",
          [minted],
        );
        expect(stored.rows).toEqual([
          {
            idempotency_key: expect.stringMatching(
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            ),
          },
        ]);
        const refused = await post("not-a-uuid", { title: malformed });
        expect(refused.status).toBe(400);
        expect(
          (
            await db.query("select id from public.crm_notes where title=$1", [
              malformed,
            ])
          ).rows,
        ).toEqual([]);
        expect(getAdminClient).not.toHaveBeenCalled();
      });
    });

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
    ] as const)(
      "D-18 (AL-2678 r3, Q-r3-2: the owner is named only through the record's assignment key; the first owner's sole worker row in tenantA, which the seed gives the profile's own id, is still named, and the second owner's only worker row is in tenantB, so that row, \"Former member\" before, is not named): reads %s with the caller token",
      async (kind, handler) => {
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
          const named = body.rows.find(
            (r: { id: string }) => r.id === donorIds[0],
          );
          expect(named.assignedMissionaryName).toBeTruthy();
          expect(named.ownerAssignmentId).toBe(otherProfile);
          expect(
            body.rows.find((r: { id: string }) => r.id === donorIds[1]),
          ).toMatchObject({
            assignedMissionaryName: null,
            ownerAssignmentId: null,
          });
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
      },
    );

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
          const exportAudit = (await audit()).at(-1);
          expect(exportAudit).toMatchObject({
            tenant_id: tenantA,
            user_id: dualUser,
            details: { anonymousGroups: 1, rowCount: 3 },
          });
          const details = exportAudit.details;
          expect(details.groupIds.sort()).toEqual(
            [ids[0], ids[2]].map((id) => "donors:" + id).sort(),
          );
          const serializedDetails = JSON.stringify(details);
          expect(serializedDetails).not.toContain(ids[1]);
          expect(serializedDetails).not.toContain(names[1]);
          expect(details).toEqual({
            filters: ["dateFrom", "dateTo"],
            groupIds: details.groupIds,
            anonymousGroups: 1,
            rowCount: 3,
          });
          const searched = await run(
            person,
            tenantA,
            "&q=" + encodeURIComponent(names[1]),
          );
          expect(searched.status).toBe(200);
          expect((await searched.text()).includes(names[1])).toBe(finance);
          const searchedDetails = (await audit()).at(-1).details;
          expect(searchedDetails.rowCount).toBe(finance ? 1 : 0);
          const serializedSearchedDetails = JSON.stringify(searchedDetails);
          expect(serializedSearchedDetails).not.toContain(ids[1]);
          expect(serializedSearchedDetails).not.toContain(names[1]);
          expect(searchedDetails).toEqual(
            finance
              ? {
                  filters: ["dateFrom", "dateTo", "search"],
                  groupIds: [],
                  anonymousGroups: 1,
                  rowCount: 1,
                }
              : {
                  filters: ["dateFrom", "dateTo", "search"],
                  groupIds: [],
                  rowCount: 0,
                },
          );
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
        const reportParties = (
          await db.query(
            "select party_id from public.donors where id=any($1::uuid[])",
            [ids],
          )
        ).rows.map((row) => row.party_id as string);
        await db.query("delete from public.donors where id=any($1::uuid[])", [
          ids,
        ]);
        await db.query("delete from public.parties where id=any($1::uuid[])", [
          reportParties,
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
            "insert into public.donor_activities(id,tenant_id,donor_id,type,title) values ($1,$3,$2,'call','Fixture call')",
            [activities[i], donor, tenant],
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
        const careAsDevelopment = await scoped
          .from("member_care_activities")
          .select("id")
          .in("id", care);
        expect(
          careAsDevelopment.error,
          "member_care_activities development",
        ).toBeNull();
        expect(
          careAsDevelopment.data,
          "member_care_activities development",
        ).toEqual([]);
        const careAssignmentId = randomUUID();
        await db.query(
          "insert into authz.memberships (id,user_id,tenant_id,role,staff_role) values ($1,$2,$3,'staff','member_care')",
          [careAssignmentId, dualUser, tenantA],
        );
        try {
          const careScoped = await createRequestSessionClient(
            new NextRequest(new URL("/", url), {
              headers: {
                authorization: `Bearer ${dual.token}`,
                "x-asym-tenant": tenantA,
                "x-asym-assignment": careAssignmentId,
              },
            }),
            { tenantId: tenantA, assignmentId: careAssignmentId },
          );
          const careAsMemberCare = await careScoped
            .from("member_care_activities")
            .select("id")
            .in("id", care);
          expect(
            careAsMemberCare.error,
            "member_care_activities member_care",
          ).toBeNull();
          expect(
            careAsMemberCare.data,
            "member_care_activities member_care",
          ).toEqual([{ id: care[0] }]);
        } finally {
          await db.query("delete from authz.memberships where id = $1", [
            careAssignmentId,
          ]);
        }
        for (const [table, columns, withheld, id] of [
          [
            "staged_gifts",
            "id,tenant_id,donation_id,fund_id,missionary_id,receipt_status,crm_post_status,status,twenty_record_id,posted_at,created_at",
            "last_error_message",
            staged[0],
          ],
          [
            "staged_gift_allocations",
            "id,tenant_id,staged_gift_id,amount,fund_id,missionary_id,memo,created_at",
            "updated_at",
            allocations[0],
          ],
          [
            "donation_crm_links",
            "id,tenant_id,donation_id,staged_gift_id,scope,link_status,twenty_record_id,updated_at",
            "metadata",
            syncIds[0],
          ],
        ] as const) {
          const allowed = await scoped
            .from(table)
            .select(columns)
            .eq("id", id)
            .single();
          expect(allowed.error, table).toBeNull();
          expect(allowed.data, table).toMatchObject({ id, tenant_id: tenantA });
          const denied = await scoped.from(table).select(withheld).limit(0);
          expect(denied.error?.code, `${table}.${withheld}`).toBe("42501");
        }
        const policies = await scoped
          .from("field_policies")
          .select("tenant_id,field_key");
        expect(policies.error).toBeNull();
        expect(policies.data?.length).toBeGreaterThan(0);
        expect(
          policies.data?.every(
            (row) => row.tenant_id === null || row.tenant_id === tenantA,
          ),
        ).toBe(true);
        expect(
          policies.data?.some((row) => row.field_key === fieldPolicyKey),
        ).toBe(false);
        const sentinelPolicy = await scoped
          .from("field_policies")
          .select("tenant_id,field_key")
          .eq("record_type", fieldPolicyRecordType)
          .eq("field_key", fieldPolicyKey)
          .eq("surface", "mission_control");
        expect(sentinelPolicy.error).toBeNull();
        expect(sentinelPolicy.data).toEqual([]);
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
          const before = await exportAuditCount();
          using serialize = vi.spyOn(
            exportProjection,
            "serializeAdminCrmReportCsv",
          );
          const refused = await download(
            request(
              `/api/admin/crm/reports/export?slice=${slice}&dateFrom=2038-01-10&dateTo=2038-01-10`,
            ),
          );
          expect(refused.status).toBe(500);
          expect(refused.headers.get("content-type")).toContain(
            "application/json",
          );
          expect(refused.headers.has("content-disposition")).toBe(false);
          expect(await refused.json()).toEqual({
            error: "Failed to export CRM report.",
            requestId: expect.any(String),
          });
          expect(await exportAuditCount()).toBe(before);
          expect(serialize).not.toHaveBeenCalled();
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

    it("resolves every label across two lookup chunks through PostgREST (D-18, AL-2678: each fixture missionary names a Party)", async () => {
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
          `insert into public.parties(id,tenant_id,display_name) select id,$2::uuid,'Worker '||n from ${source}`,
          [ids, tenantA],
        );
        await db.query(
          `insert into public.missionaries(id,tenant_id,profile_id,legal_entity_id,party_id) select f.id,$2::uuid,p.id,$3::uuid,f.id from ${source} join public.profiles p on p.user_id=f.id`,
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
        const bulkParties = (
          await db.query(
            "select party_id from public.donors where id=any($1::uuid[])",
            [ids],
          )
        ).rows.map((row) => row.party_id as string);
        for (const table of ["donors", "funds", "missionaries"])
          await db.query(
            `delete from public.${table} where id=any($1::uuid[])`,
            [ids],
          );
        await db.query(
          "delete from public.parties where id=any($1::uuid[]) or id=any($2::uuid[])",
          [ids, bulkParties],
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
