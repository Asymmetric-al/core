import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { membershipsForRole } from "../../../../fixtures/auth-memberships";
import * as tasks from "../../../../../packages/api/src/missionary-portal/tasks";
import * as task from "../../../../../packages/api/src/missionary-portal/task";
import * as followers from "../../../../../packages/api/src/follower-requests";
import * as follower from "../../../../../packages/api/src/follower-requests/request";
import * as profile from "../../../../../packages/api/src/profile";
import * as directory from "../../../../../packages/api/src/missionaries";
import { POST_ACTIVITY } from "../../../../../packages/api/src/missionary-portal/donor";

const fake = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  role: "missionary",
}));
const tenant = "00000000-0000-4000-8000-000000000001";
const id = "00000000-0000-4000-8000-000000000002";
const assignment = "00000000-0000-4000-8000-000000000003";
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
    assignment: {
      assignmentId: assignment,
      membershipRole: fake.role,
      tenantId: tenant,
      userId: id,
    },
  }),
}));
function query(data: unknown) {
  const result = { data, error: null };
  const chain = {
    select: () => chain,
    eq: () => chain,
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
  return new NextRequest("https://app.test/api/resource", {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}
const args = { params: Promise.resolve({ taskId: id, requestId: id }) };
const routes = [
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
  fake.from.mockImplementation((table: string) => {
    if (table !== "profiles") throw Error("unscoped access");
    return query({ id });
  });
  fake.rpc.mockImplementation((fn: string) =>
    query(
      fn === "missionary_owned_tasks" || fn === "missionary_follower_requests"
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
      expect(response.status).toBeLessThan(500);
    },
  );
  it.each(routes)(
    "%s never dispatches missionary work for the donor class",
    async (name, _fn, invoke) => {
      fake.role = "donor";
      const response = await invoke();
      expect(response.status).toBe(name === "missionary profile" ? 200 : 403);
      expect(fake.rpc).not.toHaveBeenCalled();
    },
  );
});
