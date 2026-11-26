import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { GET as records } from "../../../../packages/api/src/admin/crm";
import { GET as detail } from "../../../../packages/api/src/admin/crm/detail";
import {
  listMissionaryTasks,
  writeMissionaryTask,
} from "../../../../packages/api/src/missionary-portal/service";

const url = process.env.WP5_IDENTITY_IT_URL;
const database = process.env.WP5_IDENTITY_IT_DATABASE_URL;
const anon = process.env.WP5_IDENTITY_IT_ANON_KEY;
const service = process.env.WP5_IDENTITY_IT_SERVICE_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";

vi.mock("@asym/database/supabase/admin", () => ({
  createAdminClient: () => ({
    from(table: string) {
      if (table !== "audit_logs")
        throw new Error("Unexpected privileged table");
      const audit = createClient(
        process.env.WP5_IDENTITY_IT_URL!,
        process.env.WP5_IDENTITY_IT_SERVICE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
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

const PEOPLE = ["P", "Q", "R", "staffA", "staffB"] as const;
type Person = (typeof PEOPLE)[number];

type GridRow = {
  id: string;
  assignedMissionaryName: string | null;
  ownerAssignmentId?: string | null;
};

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2678 WP5 part 2-r3 through PostgREST: the CRM names a record's owner by its assignment key (plan line 997, Q-r3-2), and the running build's task reads return the key",
  () => {
    const TA = randomUUID();
    const TB = randomUUID();
    const marker = `r3-${randomUUID()}`;
    const ids = Object.fromEntries(
      [
        "mSA",
        "mSB",
        "mPA",
        "mPB",
        "mQ",
        "mR",
        "MA",
        "MB",
        "MQ1",
        "MQ2",
        "DA",
        "DB",
        "DQ",
        "DR",
      ].map((k) => [k, randomUUID()]),
    ) as Record<string, string>;
    const user = {} as Record<Person, string>;
    const token = {} as Record<Person, string>;
    let db: pg.Client | undefined;
    let planted = false;

    async function api(
      path: string,
      init: {
        key?: string;
        bearer?: string;
        body?: unknown;
        method?: string;
      } = {},
    ) {
      return fetch(`${url}/${path}`, {
        method: init.method ?? (init.body === undefined ? "GET" : "POST"),
        headers: {
          apikey: init.key ?? anon!,
          Authorization: `Bearer ${init.bearer ?? anon!}`,
          "Content-Type": "application/json",
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
      });
    }

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
      for (const who of PEOPLE) {
        const credentials = {
          email: `wp5r3-${who.toLowerCase()}-${TA}@example.test`,
          password: randomUUID(),
        };
        const created = await api("auth/v1/admin/users", {
          key: service,
          bearer: service,
          body: { ...credentials, email_confirm: true },
        });
        expect(created.ok, `Auth fixture ${who}: ${created.status}`).toBe(true);
        user[who] = (await created.json()).id;
        if (who.startsWith("staff")) {
          const login = await api("auth/v1/token?grant_type=password", {
            body: credentials,
          });
          expect(login.ok, `Sign-in ${who}: ${login.status}`).toBe(true);
          token[who] = (await login.json()).access_token;
        }
      }
      db = new pg.Client({ connectionString: database });
      await db.connect();
      await db.query("begin");
      try {
        await db.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'WP5 r3 A', 'wp5r3-a-' || $1::text), ($2::uuid, 'WP5 r3 B', 'wp5r3-b-' || $2::text)",
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
        await db.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role) values
             ($1, $7, $12, 'staff', 'development'), ($2, $8, $13, 'staff', 'development'),
             ($3, $9, $12, 'missionary', null), ($4, $9, $13, 'missionary', null),
             ($5, $10, $12, 'missionary', null), ($6, $11, $12, 'missionary', null)`,
          [
            ids.mSA,
            ids.mSB,
            ids.mPA,
            ids.mPB,
            ids.mQ,
            ids.mR,
            user.staffA,
            user.staffB,
            user.P,
            user.Q,
            user.R,
            TA,
            TB,
          ],
        );
        for (const [who, name] of [
          ["P", "Pat Assignment"],
          ["Q", "Quinn Twice"],
          ["R", "Rae Absent"],
        ] as const)
          await db.query(
            "update public.profiles set display_name = $2, full_name = $2 where id = $1",
            [user[who], name],
          );
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $5, 'Worker A'), ($2, $6, 'Worker B'), ($3, $5, 'Worker Q1'), ($4, $5, 'Worker Q2')",
          [ids.MA, ids.MB, ids.MQ1, ids.MQ2, TA, TB],
        );
        await db.query(
          `insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values
             ($1, $5, $1, $7, $5), ($2, $6, $2, $7, $6), ($3, $5, $3, $8, $5), ($4, $5, $4, $8, $5)`,
          [ids.MA, ids.MB, ids.MQ1, ids.MQ2, TA, TB, user.P, user.Q],
        );
        await db.query(
          `insert into public.donors (id, tenant_id, missionary_id, name) values
             ($1, $5, $7, $10 || ' A'), ($2, $6, $7, $10 || ' B'), ($3, $5, $8, $10 || ' Q'), ($4, $5, $9, $10 || ' R')`,
          [
            ids.DA,
            ids.DB,
            ids.DQ,
            ids.DR,
            TA,
            TB,
            user.P,
            user.Q,
            user.R,
            marker,
          ],
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      vi.unstubAllEnvs();
      const failures: string[] = [];
      try {
        if (db) {
          await db.query("rollback");
          if (planted)
            try {
              await db.query(
                "select * from private.repair_ministry_assignment_ids()",
              );
            } catch (error) {
              failures.push(`repair: ${String(error)}`);
            }
          for (const sql of [
            "delete from public.audit_logs where tenant_id = any($1::uuid[])",
            "delete from public.missionary_tasks where tenant_id = any($1::uuid[])",
            "delete from public.donors where tenant_id = any($1::uuid[])",
            "delete from public.giving_target_entity_locks where tenant_id = any($1::uuid[])",
            "delete from public.missionaries where tenant_id = any($1::uuid[])",
            "delete from public.parties where tenant_id = any($1::uuid[])",
            "delete from public.legal_entities where tenant_id = any($1::uuid[])",
            "delete from authz.memberships where tenant_id = any($1::uuid[])",
            "delete from public.tenants where id = any($1::uuid[])",
          ])
            try {
              await db.query(sql, [[TA, TB]]);
            } catch (error) {
              failures.push(`${sql}: ${String(error)}`);
            }
          await db.end();
        }
      } finally {
        for (const who of PEOPLE)
          if (user[who])
            try {
              const deleted = await api(`auth/v1/admin/users/${user[who]}`, {
                key: service,
                bearer: service,
                method: "DELETE",
              });
              if (!deleted.ok) failures.push(`${who}: ${deleted.status}`);
            } catch (error) {
              failures.push(`${who}: ${String(error)}`);
            }
      }
      expect(failures, "the fixture's cleanup").toEqual([]);
    });

    function request(path: string, who: "staffA" | "staffB") {
      return new NextRequest(new URL(path, url), {
        headers: {
          authorization: `Bearer ${token[who]}`,
          "x-asym-tenant": who === "staffA" ? TA : TB,
          "x-asym-assignment": who === "staffA" ? ids.mSA! : ids.mSB!,
          "x-asym-role-class": "staff",
          "sec-fetch-site": "same-origin",
        },
      });
    }

    async function owner(who: "staffA" | "staffB", donor: string) {
      const response = await detail(
        request(`/api/admin/crm/records/${donor}`, who),
      );
      const text = await response.text();
      expect(response.status, text).toBe(200);
      const body = JSON.parse(text);
      return {
        text,
        missionaryId: body.donor.missionaryId as string | null,
        missionaryName: body.donor.missionaryName as string | null,
        ownerAssignmentId: body.donor.ownerAssignmentId as string | null,
      };
    }

    async function rows(who: "staffA" | "staffB", query: string) {
      const response = await records(request(`/api/admin/crm?${query}`, who));
      const text = await response.text();
      expect(response.status, text).toBe(200);
      return {
        text,
        byId: new Map(
          (JSON.parse(text).rows as GridRow[]).map((row) => [
            row.id,
            [
              row.assignedMissionaryName,
              "ownerAssignmentId" in row ? row.ownerAssignmentId : "absent",
            ],
          ]),
        ),
      };
    }

    const PATHS = [
      `q=${marker}`,
      "sort=name&dir=asc",
      "sort=updatedAt&dir=desc",
    ];

    it("9. under organization A, the owner with a sole worker row there is named, and the key is that row's (MA, not the profile id); an owner with two rows there (Q) or none (R) is not named and carries no key, in the detail and in the list through the search, the first text page and the table (red: no key on the base, and Q named by profile)", async () => {
      const a = await owner("staffA", ids.DA!);
      expect([a.missionaryId, a.missionaryName, a.ownerAssignmentId]).toEqual([
        user.P,
        "Pat Assignment",
        ids.MA,
      ]);
      expect(ids.MA).not.toBe(user.P);
      for (const donor of [ids.DQ!, ids.DR!])
        expect(await owner("staffA", donor)).toMatchObject({
          missionaryName: null,
          ownerAssignmentId: null,
        });
      for (const query of PATHS) {
        const list = await rows("staffA", query);
        expect(
          [ids.DA, ids.DQ, ids.DR].map((id) => list.byId.get(id!)),
          query,
        ).toEqual([
          ["Pat Assignment", ids.MA],
          [null, null],
          [null, null],
        ]);
        expect(list.byId.has(ids.DB!), query).toBe(false);
        expect(list.text, query).not.toContain(ids.MB);
      }
    });

    it("9. under organization B, the same person's record names the worker row of B (MB)", async () => {
      const b = await owner("staffB", ids.DB!);
      expect([b.missionaryName, b.ownerAssignmentId]).toEqual([
        "Pat Assignment",
        ids.MB,
      ]);
      expect(b.text).not.toContain(ids.MA);
      for (const query of PATHS) {
        const list = await rows("staffB", query);
        expect(list.byId.get(ids.DB!), query).toEqual([
          "Pat Assignment",
          ids.MB,
        ]);
        expect(list.text, query).not.toContain(ids.MA);
      }
    });

    it("9. a key planted as owner to name organization B's worker on a record of A gives no name and no key in A, and no body holds MB; the repair restores MA after the suite", async () => {
      await db!.query("begin");
      await db!.query(
        "alter table public.donors disable trigger zz_wp5_assignment_key_update",
      );
      await db!.query(
        "update public.donors set ministry_assignment_id = $2 where id = $1",
        [ids.DA, ids.MB],
      );
      await db!.query(
        "alter table public.donors enable trigger zz_wp5_assignment_key_update",
      );
      await db!.query("commit");
      planted = true;
      const a = await owner("staffA", ids.DA!);
      expect([a.missionaryName, a.ownerAssignmentId]).toEqual([null, null]);
      expect(a.text).not.toContain(ids.MB);
      for (const query of PATHS) {
        const list = await rows("staffA", query);
        expect(list.byId.get(ids.DA!), query).toEqual([null, null]);
        expect(list.text, query).not.toContain(ids.MB);
      }
    });

    it("11. the running build's task list and task update through PostgREST: missionary_owned_tasks and the update branch of missionary_task_write return A = MA, and the service's own task list is unchanged (red: 42703)", async () => {
      const client = createClient(url!, service!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const scope = {
        supabaseAdmin: client as never,
        profileId: user.P,
        tenantId: TA,
        assignmentId: ids.mPA!,
      };
      const created = (await writeMissionaryTask(scope, "create", null, {
        title: "Call the donor",
        donor_id: ids.DA,
        sort_key: 3,
      })) as { id: string };
      const listed = await listMissionaryTasks(scope);
      expect(listed.map((task) => [task.id, task.title])).toEqual([
        [created.id, "Call the donor"],
      ]);
      expect(Object.keys(listed[0]!)).not.toContain("ministry_assignment_id");
      const args = {
        p_profile_id: user.P,
        p_tenant_id: TA,
        p_assignment_id: ids.mPA,
      };
      const read = await api(
        `rest/v1/rpc/missionary_owned_tasks?${new URLSearchParams({ select: "id,ministry_assignment_id" })}`,
        { key: service, bearer: service, body: args },
      );
      const readBody = await read.json();
      expect(read.status, JSON.stringify(readBody)).toBe(200);
      expect(readBody).toEqual([
        { id: created.id, ministry_assignment_id: ids.MA },
      ]);
      const update = await api(
        `rest/v1/rpc/missionary_task_write?${new URLSearchParams({ select: "id,title,ministry_assignment_id" })}`,
        {
          key: service,
          bearer: service,
          body: {
            ...args,
            p_operation: "update",
            p_id: created.id,
            p_patch: { title: "Call again" },
          },
        },
      );
      const updateBody = await update.json();
      expect(update.status, JSON.stringify(updateBody)).toBe(200);
      expect(updateBody).toEqual([
        { id: created.id, title: "Call again", ministry_assignment_id: ids.MA },
      ]);
    });
  },
);
