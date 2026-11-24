import { readFileSync } from "node:fs";

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { membershipsForRole } from "../../../../../fixtures/auth-memberships";

import type * as AuthContext from "@asym/auth/context";

const state = vi.hoisted(() => ({
  auth: {} as Record<string, unknown>,
  hasSession: true,
  rpcMock: vi.fn(),
  fromMock: vi.fn(),
  revalidateTag: vi.fn(),
  adminCalls: 0,
}));

vi.mock("next/cache", () => ({
  revalidateTag: state.revalidateTag,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    state.adminCalls += 1;
    throw new Error("Member Care handler must not call getAdminClient");
  },
  createAdminClient: () => {
    state.adminCalls += 1;
    throw new Error("Member Care handler must not call createAdminClient");
  },
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthContext>()),
  getAuthContext: async () => state.auth,
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: () => ({ log: vi.fn() }),
}));

vi.mock(
  "../../../../../../packages/api/src/shared/request-session-client",
  () => ({
    requestCarriesSupabaseSession: () => state.hasSession,
    createRequestSessionClient: async () => ({
      rpc: state.rpcMock,
      from: state.fromMock,
    }),
  }),
);

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const USER_ID = "11111111-1111-4111-8111-111111111111";
const ASSIGNMENT_ID = "22222222-2222-4222-8222-222222222222";
const MISSIONARY_ID = "33333333-3333-4333-8333-333333333333";
const RETURNED_ID = "44444444-4444-4444-8444-444444444444";

function setStaffActor(staffRole: "member_care" | "development" | "finance") {
  const membership = {
    tenantId: TENANT_ID,
    role: "staff" as const,
    staffRole,
    isTenantAdmin: staffRole === "development",
    isActive: true,
  };
  state.auth = {
    isAuthenticated: true,
    userId: USER_ID,
    email: "care@example.test",
    tenantId: TENANT_ID,
    role: staffRole === "development" ? "admin" : "staff",
    profileId: USER_ID,
    memberships: [membership],
    assignment: {
      assignmentId: ASSIGNMENT_ID,
      userId: USER_ID,
      tenantId: TENANT_ID,
      membershipRole: "staff",
      staffRole,
      isTenantAdmin: membership.isTenantAdmin,
      revision: "2026-11-24T00:00:00Z",
    },
  };
}

function makeReq(
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: BodyInit,
  contentType: string | null = "application/json",
) {
  const headers: Record<string, string> = {};
  if (contentType) headers["content-type"] = contentType;
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers,
    body,
  });
}

describe("Member Care handlers contract, Zod validation, and static 500 error isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.adminCalls = 0;
    state.hasSession = true;
    setStaffActor("member_care");
    state.rpcMock.mockResolvedValue({
      data: [{ id: RETURNED_ID }],
      error: null,
    });
    state.fromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      or: vi.fn().mockResolvedValue({ data: [], error: null }),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    });
  });

  it("contains zero use cache directives in reads/member-care.ts", () => {
    const src = readFileSync("packages/api/src/reads/member-care.ts", "utf8");
    expect(src).not.toMatch(/["']use cache["']/);
    expect(src).not.toContain("getAdminClient");
    expect(src).not.toContain("actorIsSuperAdmin");
  });

  it("gates all 9 routes on care.access and SESSION_REQUIRED without touching getAdminClient", async () => {
    const routes = await Promise.all([
      import("../../../../../../apps/admin/app/api/admin/member-care/dashboard/route"),
      import("../../../../../../apps/admin/app/api/admin/member-care/directory/route"),
      import("../../../../../../apps/admin/app/api/admin/member-care/directory/[id]/route"),
      import("../../../../../../apps/admin/app/api/admin/member-care/thread/route"),
      import("../../../../../../apps/admin/app/api/admin/member-care/private-notes/route"),
      import("../../../../../../apps/admin/app/api/admin/member-care/goals/route"),
      import("../../../../../../apps/admin/app/api/admin/member-care/activity/route"),
      import("../../../../../../apps/admin/app/api/admin/member-care/requirements/route"),
      import("../../../../../../apps/admin/app/api/admin/member-care/attention/route"),
    ]);

    setStaffActor("development");
    const devResponses = await Promise.all([
      routes[0].GET(makeReq("/api/admin/member-care/dashboard", "GET")),
      routes[1].GET(makeReq("/api/admin/member-care/directory", "GET")),
      routes[2].GET(
        makeReq(`/api/admin/member-care/directory/${MISSIONARY_ID}`, "GET"),
        { params: Promise.resolve({ id: MISSIONARY_ID }) },
      ),
      routes[3].POST(
        makeReq(
          "/api/admin/member-care/thread",
          "POST",
          JSON.stringify({ personnelId: MISSIONARY_ID, content: "x" }),
        ),
      ),
      routes[4].POST(
        makeReq(
          "/api/admin/member-care/private-notes",
          "POST",
          JSON.stringify({ personnelId: MISSIONARY_ID, content: "x" }),
        ),
      ),
      routes[5].POST(
        makeReq(
          "/api/admin/member-care/goals",
          "POST",
          JSON.stringify({ personnelId: MISSIONARY_ID, title: "x" }),
        ),
      ),
      routes[6].POST(
        makeReq(
          "/api/admin/member-care/activity",
          "POST",
          JSON.stringify({
            personnelId: MISSIONARY_ID,
            type: "Check-in",
            content: "x",
          }),
        ),
      ),
      routes[7].POST(
        makeReq(
          "/api/admin/member-care/requirements",
          "POST",
          JSON.stringify({
            personnelId: MISSIONARY_ID,
            activityType: "Check-in",
            intervalDays: 30,
          }),
        ),
      ),
      routes[8].PATCH(
        makeReq(
          "/api/admin/member-care/attention",
          "PATCH",
          JSON.stringify({
            personnelId: MISSIONARY_ID,
            manualAttention: true,
          }),
        ),
      ),
    ]);
    for (const res of devResponses) {
      expect(res.status).toBe(403);
    }

    setStaffActor("member_care");
    state.hasSession = false;
    const sessionlessResponses = await Promise.all([
      routes[0].GET(makeReq("/api/admin/member-care/dashboard", "GET")),
      routes[3].POST(
        makeReq(
          "/api/admin/member-care/thread",
          "POST",
          JSON.stringify({ personnelId: MISSIONARY_ID, content: "x" }),
        ),
      ),
      routes[4].POST(
        makeReq(
          "/api/admin/member-care/private-notes",
          "POST",
          JSON.stringify({ personnelId: MISSIONARY_ID, content: "x" }),
        ),
      ),
    ]);
    for (const res of sessionlessResponses) {
      expect(res.status).toBe(401);
      expect(await res.json()).toMatchObject({
        code: "SESSION_REQUIRED",
        requestId: expect.any(String),
      });
    }

    expect(state.adminCalls).toBe(0);
  });

  it("maps P0002 to static 500, 22023 to plain 422, and 42501 to 403 without logging across all 6 write routes", async () => {
    const [thread, notes, goals, activity, reqs, attention] = await Promise.all(
      [
        import("../../../../../../apps/admin/app/api/admin/member-care/thread/route"),
        import("../../../../../../apps/admin/app/api/admin/member-care/private-notes/route"),
        import("../../../../../../apps/admin/app/api/admin/member-care/goals/route"),
        import("../../../../../../apps/admin/app/api/admin/member-care/activity/route"),
        import("../../../../../../apps/admin/app/api/admin/member-care/requirements/route"),
        import("../../../../../../apps/admin/app/api/admin/member-care/attention/route"),
      ],
    );

    const cases = [
      {
        name: "thread",
        call: () =>
          thread.POST(
            makeReq(
              "/api/admin/member-care/thread",
              "POST",
              JSON.stringify({
                personnelId: MISSIONARY_ID,
                content: "SENSITIVE_THREAD_TEXT",
              }),
            ),
          ),
        expected500: "Failed to create thread post.",
      },
      {
        name: "private-notes",
        call: () =>
          notes.POST(
            makeReq(
              "/api/admin/member-care/private-notes",
              "POST",
              JSON.stringify({
                personnelId: MISSIONARY_ID,
                content: "SENSITIVE_NOTE_TEXT",
              }),
            ),
          ),
        expected500: "Internal error",
      },
      {
        name: "goals",
        call: () =>
          goals.POST(
            makeReq(
              "/api/admin/member-care/goals",
              "POST",
              JSON.stringify({
                personnelId: MISSIONARY_ID,
                title: "SENSITIVE_GOAL_TEXT",
              }),
            ),
          ),
        expected500: "Failed to upsert care goal.",
      },
      {
        name: "activity",
        call: () =>
          activity.POST(
            makeReq(
              "/api/admin/member-care/activity",
              "POST",
              JSON.stringify({
                personnelId: MISSIONARY_ID,
                type: "Check-in",
                content: "SENSITIVE_ACTIVITY_TEXT",
              }),
            ),
          ),
        expected500: "Failed to log care activity.",
      },
      {
        name: "requirements",
        call: () =>
          reqs.POST(
            makeReq(
              "/api/admin/member-care/requirements",
              "POST",
              JSON.stringify({
                personnelId: MISSIONARY_ID,
                activityType: "Check-in",
                intervalDays: 30,
                notes: "SENSITIVE_REQ_TEXT",
              }),
            ),
          ),
        expected500: "Failed to upsert care requirement.",
      },
      {
        name: "attention",
        call: () =>
          attention.PATCH(
            makeReq(
              "/api/admin/member-care/attention",
              "PATCH",
              JSON.stringify({
                personnelId: MISSIONARY_ID,
                manualAttention: true,
              }),
            ),
          ),
        expected500: "Failed to set manual attention flag.",
      },
    ];

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      state.rpcMock.mockResolvedValue({
        data: null,
        error: { code: "P0002", message: "Missionary not found." },
      });

      for (const c of cases) {
        const res = await c.call();
        expect(res.status, `${c.name} P0002`).toBe(500);
        expect(await res.json(), `${c.name} P0002 body`).toEqual({
          error: c.expected500,
          requestId: expect.any(String),
        });
      }
      expect(consoleSpy).not.toHaveBeenCalled();

      state.rpcMock.mockResolvedValue({
        data: null,
        error: { code: "22023", message: "SENSITIVE_FIELD_VALUE invalid" },
      });
      for (const c of cases) {
        const res = await c.call();
        expect(res.status, `${c.name} 22023`).toBe(422);
        const body = await res.json();
        expect(body, `${c.name} 22023 body`).toEqual({
          error: "Invalid request payload.",
          requestId: expect.any(String),
        });
        expect(JSON.stringify(body)).not.toContain("SENSITIVE");
      }
      expect(consoleSpy).not.toHaveBeenCalled();

      state.rpcMock.mockResolvedValue({
        data: null,
        error: { code: "42501", message: "Forbidden" },
      });
      for (const c of cases) {
        const res = await c.call();
        expect(res.status, `${c.name} 42501`).toBe(403);
      }
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("rejects malformed RPC rows via Zod in directory reader and care mutations", async () => {
    const { readMemberCareDirectorySnapshot } =
      await import("../../../../../../packages/api/src/reads/member-care");
    const { createCareThreadPost } =
      await import("../../../../../../packages/api/src/admin/member-care/mutations");

    state.rpcMock.mockResolvedValueOnce({
      data: [{ id: 12345, invalid: true }],
      error: null,
    });
    const fakeSession = {
      rpc: state.rpcMock,
      from: state.fromMock,
    } as never;

    await expect(
      (
        readMemberCareDirectorySnapshot as (
          sessionClient: unknown,
          tenantId: string,
        ) => Promise<unknown>
      )(fakeSession, TENANT_ID),
    ).rejects.toMatchObject({ name: "ZodError" });

    state.rpcMock.mockResolvedValueOnce({
      data: [{ not_id: "bad" }],
      error: null,
    });
    await expect(
      (
        createCareThreadPost as (
          sessionClient: unknown,
          tenantId: string,
          input: { personnelId: string; content: string },
        ) => Promise<unknown>
      )(fakeSession, TENANT_ID, {
        personnelId: MISSIONARY_ID,
        content: "Hello",
      }),
    ).rejects.toMatchObject({ name: "ZodError" });
  });

  it("rejects donor caller with 403", async () => {
    const memberships = membershipsForRole("donor", TENANT_ID);
    state.auth = {
      isAuthenticated: true,
      userId: USER_ID,
      email: "donor@example.test",
      tenantId: TENANT_ID,
      role: "donor",
      profileId: USER_ID,
      memberships,
      assignment: {
        assignmentId: ASSIGNMENT_ID,
        userId: USER_ID,
        tenantId: TENANT_ID,
        membershipRole: "donor",
        staffRole: null,
        isTenantAdmin: false,
        revision: "2026-11-24T00:00:00Z",
      },
    };
    const { GET } =
      await import("../../../../../../apps/admin/app/api/admin/member-care/dashboard/route");
    const res = await GET(makeReq("/api/admin/member-care/dashboard", "GET"));
    expect(res.status).toBe(403);
  });
});
