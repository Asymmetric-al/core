import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => ({ rpc: vi.fn() }));
const auth = {
  profileId: "00000000-0000-4000-8000-000000000001",
  tenantId: "00000000-0000-4000-8000-000000000002",
  assignment: { assignmentId: "00000000-0000-4000-8000-000000000003" },
};
const taskId = "00000000-0000-4000-8000-000000000004";

vi.mock("../../src/shared/with-operation", () => ({
  withPlatformOperation:
    (handler: (ctx: unknown) => Promise<Response>) => (request: NextRequest) =>
      handler({ supabaseAdmin: { rpc: fake.rpc }, auth, request }),
}));
vi.mock("../../src/missionary-portal/route-helpers", () => ({
  runMissionaryPortalOperation: (
    _request: NextRequest,
    handler: (ctx: unknown) => Promise<Response>,
  ) => handler({ supabaseAdmin: { rpc: fake.rpc }, auth }),
}));

import { PATCH } from "../../src/missionary-portal/task";
import { POST } from "../../src/missionary-portal/tasks";

function request(method: string, body: unknown) {
  return new NextRequest("https://app.test/api/missionary/tasks", {
    method,
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("missionary task sort keys (AL-2678, record line 594)", () => {
  beforeEach(() => {
    fake.rpc.mockReset();
    fake.rpc.mockReturnValue({
      select: () => ({
        single: async () => ({
          data: { id: taskId, title: "task", sort_key: 15.5, donor: null },
          error: null,
        }),
      }),
    });
  });

  it.each([
    ["POST", () => POST(request("POST", { title: "task", sort_key: 15.5 }))],
    [
      "PATCH",
      () =>
        PATCH(request("PATCH", { sort_key: 15.5 }), {
          params: Promise.resolve({ taskId }),
        }),
    ],
  ])("%s passes the fractional midpoint through unrounded", async (_, call) => {
    const response = await call();
    expect(response.status).toBeLessThan(300);
    expect(fake.rpc).toHaveBeenCalledWith(
      "missionary_task_write",
      expect.objectContaining({
        p_patch: expect.objectContaining({ sort_key: 15.5 }),
      }),
    );
  });
});
