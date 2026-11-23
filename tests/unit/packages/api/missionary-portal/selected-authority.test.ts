import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { membershipsForRole } from "../../../../fixtures/auth-memberships";
import * as portal from "../../../../../packages/api/src/missionary-portal";
import * as donors from "../../../../../packages/api/src/missionary-portal/donors";
import * as crm from "../../../../../packages/api/src/admin/crm/detail";
import * as adminDirectory from "../../../../../packages/api/src/admin/missionary-directory";
import * as tasks from "../../../../../packages/api/src/missionary-portal/tasks";
import * as task from "../../../../../packages/api/src/missionary-portal/task";
import * as followers from "../../../../../packages/api/src/follower-requests";
import * as follower from "../../../../../packages/api/src/follower-requests/request";
import * as profile from "../../../../../packages/api/src/profile";
import * as directory from "../../../../../packages/api/src/missionaries";
import {
  POST_ACTIVITY,
  PATCH as patchDonor,
} from "../../../../../packages/api/src/missionary-portal/donor";

const fake = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  role: "missionary",
  assigned: true,
  update: vi.fn(),
  selection: vi.fn(),
}));
const tenant = "00000000-0000-4000-8000-000000000001";
const id = "00000000-0000-4000-8000-000000000002";
const assignment = "00000000-0000-4000-8000-000000000003";
vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<
      typeof import("../../../../../packages/api/src/shared/request-session-client")
    >()),
    createRequestSessionClient: async () => fake,
  }),
);
function crmRequest(record: string) {
  return new NextRequest("https://app.test/api/admin/crm/records/" + record, {
    headers: { authorization: "Bearer staff-fixture" },
  });
}
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: fake, error: null }),
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/auth/context")>()),
  getAuthContext: async () => ({
    userId: id,
    profileId: id,
    tenantId: tenant,
    isAuthenticated: true,
    role: fake.role,
    memberships: membershipsForRole(fake.role, tenant),
    assignment: fake.assigned
      ? {
          assignmentId: assignment,
          membershipRole: fake.role,
          tenantId: tenant,
          userId: id,
        }
      : null,
  }),
}));
function query(data: unknown, error: unknown = null) {
  const result = { data, error };
  const chain = {
    select: (columns: string) => {
      fake.selection(columns);
      return chain;
    },
    update: (value: unknown) => {
      fake.update(value);
      return chain;
    },
    in: () => chain,
    eq: () => chain,
    not: () => chain,
    or: () => chain,
    order: () => chain,
    range: () => chain,
    limit: () => chain,
    single: async () => result,
    maybeSingle: async () => result,
    then: (resolve: (value: unknown) => unknown) => resolve(result),
  };
  return chain;
}
function request(method: string, body?: unknown) {
  // Typed as the browser sends it: the shared JSON reader refuses an untyped
  // or text/plain body (AL-2677, fix check G1).
  return new NextRequest("https://app.test/api/resource", {
    method,
    ...(body
      ? {
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
}
const args = { params: Promise.resolve({ taskId: id, requestId: id }) };
const routes = [
  ["portal", "missionary_own_record", () => portal.GET(request("GET"))],
  ["donors", "missionary_activities", () => donors.GET(request("GET"))],
  ["directory", "missionary_directory", () => directory.GET(request("GET"))],
  [
    "activity create",
    "missionary_activity_create",
    () =>
      POST_ACTIVITY(request("POST", { activityType: "note", note: "called" }), {
        params: Promise.resolve({ donorId: id }),
      }),
  ],
  ["task list", "missionary_owned_tasks", () => tasks.GET(request("GET"))],
  [
    "task create",
    "missionary_task_write",
    () => tasks.POST(request("POST", { title: "call", donor_id: id })),
  ],
  [
    "task update",
    "missionary_task_write",
    () => task.PATCH(request("PATCH", { title: "call" }), args),
  ],
  [
    "task delete",
    "missionary_task_write",
    () => task.DELETE(request("DELETE"), args),
  ],
  [
    "follower list",
    "missionary_follower_requests",
    () => followers.GET(request("GET")),
  ],
  [
    "follower update",
    "missionary_follower_request_write",
    () => follower.PATCH(request("PATCH", { status: "approved" }), args),
  ],
  [
    "follower delete",
    "missionary_follower_request_write",
    () => follower.DELETE(request("DELETE"), args),
  ],
  [
    "missionary profile",
    "missionary_own_record",
    () => profile.GET(request("GET")),
  ],
  [
    "missionary profile update",
    "missionary_own_record_write",
    () => profile.PATCH(request("PATCH", { bio: "changed" })),
  ],
] as const;
beforeEach(() => {
  vi.clearAllMocks();
  fake.role = "missionary";
  fake.assigned = true;
  fake.from.mockImplementation((table: string) => {
    if (table === "donors") return query([{ id, missionary_id: id }]);
    if (table === "donor_pledges") return query([]);
    if (table !== "profiles") throw Error("unscoped access");
    return query({ id });
  });
  fake.rpc.mockImplementation((fn: string) =>
    query(
      fn === "missionary_owned_tasks" ||
        fn === "missionary_follower_requests" ||
        fn === "missionary_directory"
        ? []
        : null,
    ),
  );
});
describe("missionary handler delegation", () => {
  it.each([
    ["POST", { title: "General task" }, "create", 201],
    ["POST", { title: "General task", donor_id: null }, "create", 201],
    ["PATCH", { donor_id: null }, "update", 200],
  ] as const)(
    "%s delegates %j to the database history check",
    async (method, body, operation, status) => {
      fake.rpc.mockReturnValue(query({ id, donor_id: null }));
      const response =
        method === "POST"
          ? await tasks.POST(request(method, body))
          : await task.PATCH(request(method, body), args);
      expect(response.status).toBe(status);
      expect(fake.rpc).toHaveBeenCalledWith("missionary_task_write", {
        p_profile_id: id,
        p_tenant_id: tenant,
        p_assignment_id: assignment,
        p_operation: operation,
        p_id: method === "POST" ? null : id,
        p_patch: expect.objectContaining(body),
      });
    },
  );

  it.each(routes)(
    "%s sends the resolved tenant, profile and exact assignment",
    async (_name, fn, invoke) => {
      const response = await invoke();
      expect(fake.rpc).toHaveBeenCalledWith(
        fn,
        expect.objectContaining({
          p_profile_id: id,
          p_tenant_id: tenant,
          p_assignment_id: assignment,
        }),
      );
      const bodies: Record<string, unknown> = {
        directory: { missionaries: [] },
        donors: { donors: [{ id }], hasMore: false },
        "task list": { tasks: [] },
        "follower list": { requests: [] },
        "missionary profile": { profile: { id } },
      };
      expect(await response.json()).toMatchObject(
        bodies[_name] ?? { error: expect.any(String) },
      );
      expect(response.status).toBe(
        [
          "directory",
          "donors",
          "task list",
          "follower list",
          "missionary profile",
        ].includes(_name)
          ? 200
          : 404,
      );
    },
  );
  describe.each(["staff", "donor"])("%s class", (role) => {
    it.each(routes)(
      "%s does not dispatch missionary work",
      async (name, _fn, invoke) => {
        fake.role = role;
        const response = await invoke();
        expect(response.status).toBe(name === "missionary profile" ? 200 : 403);
        expect(await response.json()).toMatchObject(
          name === "missionary profile"
            ? { profile: { id } }
            : { error: expect.any(String) },
        );
        expect(fake.rpc).not.toHaveBeenCalled();
      },
    );
    it("saves common profile fields without a missionary write", async () => {
      fake.role = role;
      expect(
        (
          await profile.PATCH(
            request("PATCH", { firstName: "Jo", phone: "123" }),
          )
        ).status,
      ).toBe(200);
      expect(fake.update).toHaveBeenCalledWith(
        expect.objectContaining({ first_name: "Jo", phone: "123" }),
      );
      expect(fake.rpc).not.toHaveBeenCalled();
    });
  });
  it.each(["donor_activities", "missionaries"])(
    "preserves staff read refusal on %s",
    async (table) => {
      fake.role = "staff";
      fake.from.mockImplementation((name: string) =>
        name === table
          ? query(null, { code: "42501", message: "Insufficient privilege" })
          : query(
              name === "donors"
                ? { id }
                : name === "contribution_approval_policies"
                  ? null
                  : [],
            ),
      );
      const response =
        table === "missionaries"
          ? await adminDirectory.GET(request("GET"))
          : await crm.GET(crmRequest(id));
      expect(fake.from).toHaveBeenCalledWith(table);
      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({
        error: "Insufficient privilege",
      });
    },
  );
  it.each(["missionary", "donor", "staff"])(
    "enforces CRM record read access for %s",
    async (role) => {
      fake.role = role;
      fake.from.mockReturnValue(query(null));
      const response = await crm.GET(crmRequest(id));
      expect(response.status).toBe(role === "staff" ? 404 : 403);
      expect(fake.from.mock.calls.map(([table]) => table)).toEqual(
        role === "staff" ? ["donors"] : [],
      );
    },
  );
  it.each(
    routes.filter(([name]) =>
      [
        "task list",
        "task update",
        "portal",
        "donors",
        "missionary profile",
        "missionary profile update",
      ].includes(name),
    ),
  )(
    "%s refuses missing assignment before accessing data",
    async (_name, _fn, invoke) => {
      fake.assigned = false;
      expect((await invoke()).status).toBe(403);
      expect(fake.rpc).not.toHaveBeenCalled();
      expect(fake.from).not.toHaveBeenCalled();
    },
  );
  it.each([
    ["task create", () => tasks.POST(request("POST", {}))],
    [
      "task update",
      () => task.PATCH(request("PATCH", { priority: "invalid" }), args),
    ],
    [
      "follower decision",
      () => follower.PATCH(request("PATCH", { status: "invalid" }), args),
    ],
    [
      "donor edit",
      () =>
        patchDonor(request("PATCH", {}), {
          params: Promise.resolve({ donorId: "invalid" }),
        }),
    ],
    [
      "donor activity",
      () =>
        POST_ACTIVITY(request("POST", {}), {
          params: Promise.resolve({ donorId: "invalid" }),
        }),
    ],
  ] as const)(
    "requires an assignment before validating %s",
    async (_name, invoke) => {
      fake.assigned = false;
      const response = await invoke();
      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({
        error: "A selected missionary membership is required",
      });
      expect(fake.rpc).not.toHaveBeenCalled();
      expect(fake.from).not.toHaveBeenCalled();
    },
  );
  it("returns the selected missionary portal snapshot", async () => {
    fake.from.mockImplementation((name: string) =>
      query(name === "profiles" ? { id, email: "person@example.test" } : []),
    );
    fake.rpc.mockImplementation((fn: string) =>
      query(fn === "missionary_own_record" ? { id } : []),
    );
    const response = await portal.GET(request("GET"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      portal: {
        profile: { id, email: "person@example.test" },
        publicPage: { missionaryId: id },
      },
    });
  });
  it("preserves a database permission refusal", async () => {
    fake.rpc.mockReturnValue(
      query(null, { code: "42501", message: "permission denied" }),
    );
    expect((await tasks.GET(request("GET"))).status).toBe(403);
  });
  it.each(
    routes.filter(([, fn]) => fn.endsWith("_write") || fn.endsWith("_create")),
  )("%s returns its success status", async (name, _fn, invoke) => {
    fake.rpc.mockReturnValue(query({ id }));
    const response = await invoke();
    expect(response.status).toBe(name.endsWith("create") ? 201 : 200);
    const bodies: Record<string, unknown> = {
      "task create": { task: { id } },
      "task update": { task: { id } },
      "task delete": { success: true },
      "follower update": { request: { id } },
      "follower delete": { success: true },
      "activity create": { ok: true },
      "missionary profile update": { profile: { id } },
    };
    expect(await response.json()).toMatchObject(bodies[name]!);
  });
  it.each([false, true])(
    "missing missionary record, missionary-only field %s",
    async (missionaryField) => {
      const response = await profile.PATCH(
        request("PATCH", {
          firstName: "Jo",
          phone: "123",
          ...(missionaryField && { bio: "new" }),
        }),
      );
      expect(response.status).toBe(missionaryField ? 404 : 200);
      expect(fake.update).toHaveBeenCalledTimes(missionaryField ? 0 : 1);
    },
  );
  it.each(["POST", "PATCH"])(
    "%s rounds the stored sort key",
    async (method) => {
      fake.rpc.mockReturnValue(query({ id }));
      const req = request(method, { title: "task", sort_key: 1.7 });
      const response =
        method === "POST" ? await tasks.POST(req) : await task.PATCH(req, args);
      expect(response.status).toBe(method === "POST" ? 201 : 200);
      expect(fake.rpc).toHaveBeenCalledWith(
        "missionary_task_write",
        expect.objectContaining({
          p_patch: expect.objectContaining({ sort_key: 2 }),
        }),
      );
    },
  );
  it("passes an echoed null donor and the title to the scoped task update", async () => {
    const patch = { donor_id: null, title: "edited" };
    fake.rpc.mockReturnValue(query({ id, ...patch }));
    const response = await task.PATCH(request("PATCH", patch), args);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      task: { id, ...patch, donor: null },
    });
    expect(fake.rpc).toHaveBeenCalledWith(
      "missionary_task_write",
      expect.objectContaining({
        p_operation: "update",
        p_id: id,
        p_assignment_id: assignment,
        p_patch: expect.objectContaining(patch),
      }),
    );
  });
  it("selects only the deleted task id", async () => {
    fake.rpc.mockReturnValue(query({ id }));
    expect((await task.DELETE(request("DELETE"), args)).status).toBe(200);
    expect(fake.selection).toHaveBeenCalledExactlyOnceWith("id");
  });
  const invalid = {
    params: Promise.resolve({
      taskId: "invalid",
      requestId: "invalid",
      donorId: "invalid",
    }),
  };
  it("rejects a malformed CRM donor id before its lookup", async () => {
    fake.role = "staff";
    const response = await crm.GET(crmRequest("invalid"));
    expect(response.status).toBe(404);
    expect(fake.from).not.toHaveBeenCalled();
  });
  it("refuses a donor update without a selected missionary row", async () => {
    fake.assigned = false;
    expect(
      (
        await patchDonor(request("PATCH", { tags: [] }), {
          params: Promise.resolve({ donorId: id }),
        })
      ).status,
    ).toBe(403);
    expect(fake.from).not.toHaveBeenCalled();
  });
  it.each([
    () => patchDonor(request("PATCH", { tags: [] }), invalid),
    () =>
      tasks.GET(
        new NextRequest(
          "https://app.test/api/missionary/tasks?donorId=invalid",
        ),
      ),
    () => task.PATCH(request("PATCH", { title: "task" }), invalid),
    () => task.DELETE(request("DELETE"), invalid),
    () => follower.PATCH(request("PATCH", { status: "approved" }), invalid),
    () => follower.DELETE(request("DELETE"), invalid),
    () =>
      POST_ACTIVITY(
        request("POST", { activityType: "note", note: "called" }),
        invalid,
      ),
  ])("rejects an invalid path or query id before dispatch", async (invoke) => {
    expect((await invoke()).status).toBe(404);
    expect(fake.rpc).not.toHaveBeenCalled();
  });
});
