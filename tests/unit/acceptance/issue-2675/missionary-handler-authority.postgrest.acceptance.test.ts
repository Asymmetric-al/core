import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { membershipsForRole } from "../../../fixtures/auth-memberships";
import * as tasks from "../../../../packages/api/src/missionary-portal/tasks";
import * as portal from "../../../../packages/api/src/missionary-portal";
import * as donors from "../../../../packages/api/src/missionary-portal/donors";
import * as follower from "../../../../packages/api/src/follower-requests/request";
import * as task from "../../../../packages/api/src/missionary-portal/task";
import * as followers from "../../../../packages/api/src/follower-requests";
import * as directory from "../../../../packages/api/src/missionaries";
import * as profile from "../../../../packages/api/src/profile";
import { POST_ACTIVITY } from "../../../../packages/api/src/missionary-portal/donor";

const url = process.env.MISSIONARY_IT_SUPABASE_URL;
const key = process.env.MISSIONARY_IT_SERVICE_ROLE_KEY;
const database = process.env.MISSIONARY_IT_ADMIN_DATABASE_URL;
const configured = Boolean(url || key || database);
const person = randomUUID();
const orgs = Array.from({ length: 2 }, () => ({
  tenant: randomUUID(),
  assignment: randomUUID(),
  wrong: randomUUID(),
  missionary: randomUUID(),
  donor: randomUUID(),
  task: randomUUID(),
  follower: randomUUID(),
}));
let selected = orgs[0]!;
let role: "donor" | "missionary" = "missionary";
let client: ReturnType<typeof createClient>;
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client, error: null }),
}));
vi.mock("@asym/auth/context", async (original) => ({
  ...(await original<typeof import("@asym/auth/context")>()),
  getAuthContext: async () => ({
    userId: person,
    profileId: person,
    tenantId: selected.tenant,
    isAuthenticated: true,
    role,
    memberships: membershipsForRole(role, selected.tenant),
    assignment: {
      userId: person,
      tenantId: selected.tenant,
      membershipRole: role,
      assignmentId:
        role === "missionary" ? selected.assignment : selected.wrong,
    },
  }),
}));
function request(method: string, path: string, body?: unknown) {
  return new NextRequest("http://localhost" + path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}
async function json(response: Response, status: number) {
  const body = await response.json();
  expect(response.status, JSON.stringify(body)).toBe(status);
  return body;
}
describe.skipIf(!configured)(
  "missionary handlers through PostgREST with image privileges",
  () => {
    let db: pg.Client;
    let installed = false;
    beforeAll(async () => {
      if (!url || !key || !database)
        throw Error(
          "Set all three MISSIONARY_IT settings for the disposable local stack",
        );
      for (const addr of [url, database])
        if (
          !["localhost", "127.0.0.1", "[::1]"].includes(new URL(addr).hostname)
        )
          throw Error("Only a local disposable stack is supported");
      db = new pg.Client({ connectionString: database });
      await db.connect();
      client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await db.query("begin");
      try {
        for (const org of orgs)
          await db.query(
            "insert into public.tenants(id,name,slug) values ($1::uuid,'WP2H',$1::uuid::text)",
            [org.tenant],
          );
        await db.query("insert into auth.users(id) values($1)", [person]);
        for (const org of orgs) {
          await db.query(
            "insert into authz.memberships(id,tenant_id,user_id,role) values ($1,$2,$3,'missionary'),($4,$2,$3,'donor')",
            [org.assignment, org.tenant, person, org.wrong],
          );
          await db.query(
            "insert into public.missionaries(id,tenant_id,profile_id) values($1,$2,$3)",
            [org.missionary, org.tenant, person],
          );
          await db.query(
            "insert into public.donors(id,tenant_id,missionary_id,name,giving_preferences) values($1,$2,$3,$4,$5)",
            [
              org.donor,
              org.tenant,
              person,
              org.donor,
              { defaultAnonymousToRecipient: false },
            ],
          );
          await db.query(
            "insert into public.missionary_tasks(id,missionary_id,donor_id,title) values ($1,$2,$3,'original')",
            [org.task, person, org.donor],
          );
          await db.query(
            "insert into public.follower_requests(id,missionary_id,donor_id) values ($1,$2,$3)",
            [org.follower, person, org.donor],
          );
        }
        await db.query("commit");
        installed = true;
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });
    afterAll(async () => {
      if (!db) return;
      try {
        if (installed) {
          await db.query("begin");
          for (const table of [
            "donor_activities",
            "follower_requests",
            "missionary_tasks",
          ])
            await db.query(
              "delete from public." + table + " where donor_id=any($1::uuid[])",
              [orgs.map((org) => org.donor)],
            );
          await db.query("delete from public.donors where id=any($1::uuid[])", [
            orgs.map((org) => org.donor),
          ]);
          await db.query("delete from auth.users where id=$1", [person]);
          await db.query(
            "delete from public.tenants where id=any($1::uuid[])",
            [orgs.map((org) => org.tenant)],
          );
          await db.query("commit");
        }
      } finally {
        await db.end();
      }
    });
    it("keeps the task but not its former donor after reassignment within the tenant", async () => {
      const org = orgs[0]!;
      selected = org;
      role = "missionary";
      const newOwner = randomUUID();
      await db.query("insert into auth.users(id) values ($1)", [newOwner]);
      try {
        await db.query(
          "insert into public.missionaries(tenant_id,profile_id) values ($1,$2)",
          [org.tenant, newOwner],
        );
        await db.query(
          "update public.donors set missionary_id=$2 where id=$1",
          [org.donor, newOwner],
        );
        const path = "/api/missionary/tasks";
        expect(
          (await json(await tasks.GET(request("GET", path)), 200)).tasks,
        ).toMatchObject([{ id: org.task, donor: null }]);
        expect(
          (
            await json(
              await tasks.GET(request("GET", path + "?donorId=" + org.donor)),
              200,
            )
          ).tasks,
        ).toEqual([]);
        expect(
          (
            await json(
              await task.PATCH(
                request("PATCH", path + "/" + org.task, { title: "retained" }),
                { params: Promise.resolve({ taskId: org.task }) },
              ),
              200,
            )
          ).task,
        ).toMatchObject({ id: org.task, title: "retained", donor: null });
      } finally {
        await db.query(
          "update public.donors set missionary_id=$2 where id=$1",
          [org.donor, person],
        );
        await db.query("delete from public.missionaries where profile_id=$1", [
          newOwner,
        ]);
        await db.query("delete from auth.users where id=$1", [newOwner]);
      }
    });
    it.each(orgs)(
      "returns only the selected organization's rows ($tenant)",
      async (org) => {
        selected = org;
        role = "missionary";
        const listed = await json(
          await tasks.GET(
            request("GET", "/api/missionary/tasks?donorId=" + org.donor),
          ),
          200,
        );
        expect(listed.tasks).toMatchObject([
          { id: org.task, donor: { id: org.donor, name: org.donor } },
        ]);
        const foreign = orgs.find((other) => other.tenant !== org.tenant)!;
        expect(
          (
            await json(
              await tasks.GET(
                request(
                  "GET",
                  "/api/missionary/tasks?donorId=" + foreign.donor,
                ),
              ),
              200,
            )
          ).tasks,
        ).toEqual([]);
        const args = {
          p_profile_id: person,
          p_tenant_id: org.tenant,
          p_assignment_id: org.assignment,
        };
        const one = await client
          .rpc("missionary_owned_tasks", args)
          .select("id")
          .eq("id", org.task)
          .single();
        expect(one.error).toBeNull();
        expect(one.data).toEqual({ id: org.task });
        const params = { params: Promise.resolve({ taskId: org.task }) };
        expect(
          (
            await json(
              await task.PATCH(
                request("PATCH", "/api/missionary/tasks/" + org.task, {
                  title: "edited",
                }),
                params,
              ),
              200,
            )
          ).task,
        ).toMatchObject({ id: org.task, title: "edited" });
        expect(
          (
            await json(
              await followers.GET(request("GET", "/api/follower-requests")),
              200,
            )
          ).requests,
        ).toMatchObject([{ id: org.follower, name: org.donor }]);
        expect(
          (
            await json(
              await directory.GET(
                request("GET", "/api/missionaries?limit=1&offset=0"),
              ),
              200,
            )
          ).missionaries,
        ).toMatchObject([{ id: org.missionary, profile: { id: person } }]);
        expect(
          (await json(await profile.GET(request("GET", "/api/profile")), 200))
            .profile.missionary.id,
        ).toBe(org.missionary);
        expect(
          (
            await json(
              await profile.PATCH(
                request("PATCH", "/api/profile", { bio: org.tenant }),
              ),
              200,
            )
          ).profile.missionary,
        ).toMatchObject({ id: org.missionary, bio: org.tenant });
        const activity = () =>
          POST_ACTIVITY(
            request(
              "POST",
              "/api/missionary/donors/" + org.donor + "/activities",
              { note: "called", activityType: "note" },
            ),
            { params: Promise.resolve({ donorId: org.donor }) },
          );
        await json(await activity(), 201);
        expect(
          (
            await json(
              await donors.GET(request("GET", "/api/missionary/donors")),
              200,
            )
          ).donors,
        ).toMatchObject([
          { id: org.donor, activities: [{ title: expect.any(String) }] },
        ]);
        expect(
          (
            await json(
              await portal.GET(request("GET", "/api/missionary/portal")),
              200,
            )
          ).portal,
        ).toMatchObject({
          profile: { id: person },
          publicPage: { missionaryId: org.missionary },
        });
        const taskPath = "/api/missionary/tasks";
        const created = (
          await json(
            await tasks.POST(
              request("POST", taskPath, { title: "Call", donor_id: org.donor }),
            ),
            201,
          )
        ).task;
        expect(created).toMatchObject({
          title: "Call",
          donor: { id: org.donor },
        });
        const wrongArgs = { ...args, p_assignment_id: org.wrong };
        for (const [fn, extra] of [
          [
            "missionary_task_write",
            { p_operation: "delete", p_id: created.id, p_patch: {} },
          ],
          ["missionary_follower_requests", {}],
          [
            "missionary_follower_request_write",
            {
              p_operation: "delete",
              p_id: org.follower,
              p_status: null,
              p_access_level: null,
            },
          ],
          ["missionary_own_record", {}],
          ["missionary_own_record_write", { p_patch: { bio: "wrong" } }],
          ["missionary_directory", {}],
          ["missionary_activities", { p_donor_ids: [org.donor] }],
          [
            "missionary_activity_create",
            {
              p_donor_id: org.donor,
              p_type: "note",
              p_title: "wrong",
              p_note: "wrong",
              p_date: new Date().toISOString(),
            },
          ],
        ] as const) {
          const result = await client
            .rpc(fn, { ...wrongArgs, ...extra })
            .select("id");
          expect(result.error, fn).toBeNull();
          expect(result.data, fn).toEqual([]);
        }
        expect(
          await json(
            await task.DELETE(request("DELETE", taskPath + "/" + created.id), {
              params: Promise.resolve({ taskId: created.id }),
            }),
            200,
          ),
        ).toEqual({ success: true });
        const followerPath = "/api/follower-requests/" + org.follower;
        const followerParams = {
          params: Promise.resolve({ requestId: org.follower }),
        };
        expect(
          (
            await json(
              await follower.PATCH(
                request("PATCH", followerPath, {
                  status: "approved",
                  access_level: "comment",
                }),
                followerParams,
              ),
              200,
            )
          ).request,
        ).toMatchObject({
          id: org.follower,
          status: "approved",
          access_level: "comment",
          donor: { id: org.donor, name: org.donor },
        });
        expect(
          await json(
            await follower.DELETE(
              request("DELETE", followerPath),
              followerParams,
            ),
            200,
          ),
        ).toEqual({ success: true });
        role = "donor";
        const wrong = await client
          .rpc("missionary_owned_tasks", {
            ...args,
            p_assignment_id: org.wrong,
          })
          .select("id")
          .eq("id", org.task)
          .single();
        expect(wrong.error?.code).toBe("PGRST116");
        await json(
          await tasks.GET(
            request("GET", "/api/missionary/tasks?donorId=" + org.donor),
          ),
          403,
        );
        await json(
          await task.PATCH(
            request("PATCH", "/api/missionary/tasks/" + org.task, {
              title: "wrong",
            }),
            params,
          ),
          403,
        );
        await json(
          await followers.GET(request("GET", "/api/follower-requests")),
          403,
        );
        await json(
          await directory.GET(
            request("GET", "/api/missionaries?limit=1&offset=0"),
          ),
          403,
        );
        expect(
          (await json(await profile.GET(request("GET", "/api/profile")), 200))
            .profile,
        ).not.toHaveProperty("missionary");
        await json(
          await profile.PATCH(
            request("PATCH", "/api/profile", { bio: "wrong" }),
          ),
          403,
        );
        await json(await activity(), 403);
      },
    );
  },
);
