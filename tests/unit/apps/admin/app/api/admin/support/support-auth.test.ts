import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock, getAuthContextMock } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
  getAuthContextMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({
    log: vi.fn(),
    logDonation: vi.fn(),
    logPost: vi.fn(),
    logRoleChange: vi.fn(),
  })),
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireAuth: vi.fn((context) => {
    if (
      !context?.isAuthenticated ||
      !context.userId ||
      !context.tenantId ||
      !context.role ||
      !context.profileId
    ) {
      throw new Error("Unauthorized");
    }
  }),
  requireRole: vi.fn((context, roles: string[]) => {
    if (
      !context?.isAuthenticated ||
      !context.userId ||
      !context.tenantId ||
      !context.role ||
      !context.profileId
    ) {
      throw new Error("Unauthorized");
    }

    if (!roles.includes(context.role)) {
      throw new Error(`Forbidden: requires one of ${roles.join(", ")} role`);
    }
  }),
}));

import { GET as getSupportSummary } from "../../../../../../../../packages/api/src/admin/support/index";
import { GET as getSupportTicket } from "../../../../../../../../packages/api/src/admin/support/ticket";
import { GET as getSupportTickets } from "../../../../../../../../packages/api/src/admin/support/tickets";

const baseAuth = {
  userId: "user-1",
  tenantId: "tenant-1",
  role: "staff",
  profileId: "profile-1",
  isAuthenticated: true,
  profileRole: "staff",
  memberships: [],
};

function request(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

function queryResult(data: unknown) {
  const query: Record<string, ReturnType<typeof vi.fn>> & {
    then?: PromiseLike<unknown>["then"];
  } = {
    eq: vi.fn(() => query),
    maybeSingle: vi.fn(() => Promise.resolve({ data, error: null })),
    or: vi.fn(() => query),
    order: vi.fn(() => query),
    select: vi.fn(() => query),
  };
  query.then = (onFulfilled, onRejected) =>
    Promise.resolve({ data, error: null }).then(onFulfilled, onRejected);

  return query;
}

const ticketRow = {
  id: "ticket-db-id",
  public_id: "SUP-1040",
  tenant_id: "tenant-1",
  subject: "Escalate pledge allocation for partner church",
  summary: "Church pledge was allocated to the general fund.",
  queue_id: "donor_care",
  status: "escalated",
  priority: "high",
  channel: "email",
  contact_id: null,
  contact_name_snapshot: "Grace Community Church",
  contact_email_snapshot: "ops@grace.example.org",
  tags: ["pledge"],
  created_by: "user-1",
  assigned_to_profile_id: null,
  follow_up_at: null,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
};

function mockAdminClient() {
  const ticketsQuery = queryResult([ticketRow]);
  const contactsQuery = queryResult([]);
  getAdminClientMock.mockReturnValue({
    client: {
      from: vi.fn((table: string) =>
        table === "support_contacts" ? contactsQuery : ticketsQuery,
      ),
    },
    error: null,
  });
}

describe("admin support API auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminClient();
  });

  it.each([
    ["summary", () => getSupportSummary(request("/api/admin/support"))],
    ["tickets", () => getSupportTickets(request("/api/admin/support/tickets"))],
    [
      "ticket detail",
      () =>
        getSupportTicket(request("/api/admin/support/tickets/SUP-1042"), {
          params: Promise.resolve({ id: "SUP-1042" }),
        }),
    ],
  ])("returns 401 for unauthenticated %s requests", async (_name, call) => {
    getAuthContextMock.mockResolvedValue({
      userId: null,
      tenantId: null,
      role: null,
      profileId: null,
      isAuthenticated: false,
      profileRole: null,
      memberships: [],
    });

    const response = await call();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "Unauthorized",
    });
  });

  it.each([
    ["summary", () => getSupportSummary(request("/api/admin/support"))],
    ["tickets", () => getSupportTickets(request("/api/admin/support/tickets"))],
    [
      "ticket detail",
      () =>
        getSupportTicket(request("/api/admin/support/tickets/SUP-1042"), {
          params: Promise.resolve({ id: "SUP-1042" }),
        }),
    ],
  ])("returns 403 for non-staff %s requests", async (_name, call) => {
    getAuthContextMock.mockResolvedValue({
      ...baseAuth,
      role: "donor",
      profileRole: "donor",
    });

    const response = await call();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "Forbidden: requires one of staff, admin, super_admin role",
    });
  });

  it.each(["staff", "admin", "super_admin"] as const)(
    "allows %s to read support summary",
    async (role) => {
      getAuthContextMock.mockResolvedValue({
        ...baseAuth,
        role,
        profileRole: role,
      });

      const response = await getSupportSummary(request("/api/admin/support"));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        tickets: expect.any(Array),
        contacts: expect.any(Array),
        queues: expect.any(Array),
      });
    },
  );

  it("returns 400 for an invalid ticket queue filter", async () => {
    getAuthContextMock.mockResolvedValue(baseAuth);

    const response = await getSupportTickets(
      request("/api/admin/support/tickets?queueId=invalid"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid support ticket query.",
    });
  });

  it("returns 400 for an invalid ticket status filter", async () => {
    getAuthContextMock.mockResolvedValue(baseAuth);

    const response = await getSupportTickets(
      request("/api/admin/support/tickets?status=invalid"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid support ticket query.",
    });
  });

  it("filters tickets by valid queue and status", async () => {
    getAuthContextMock.mockResolvedValue(baseAuth);

    const response = await getSupportTickets(
      request("/api/admin/support/tickets?queueId=donor_care&status=escalated"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      expect.objectContaining({
        id: "SUP-1040",
        queueId: "donor_care",
        status: "escalated",
      }),
    ]);
  });
});
