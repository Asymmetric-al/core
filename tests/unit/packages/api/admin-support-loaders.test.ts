import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAdminClientMock,
  getAuthContextMock,
  getSupportSummaryMock,
  getSupportTicketMock,
  listSupportTicketsMock,
} = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
  getAuthContextMock: vi.fn(),
  getSupportSummaryMock: vi.fn(),
  getSupportTicketMock: vi.fn(),
  listSupportTicketsMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireRole: vi.fn((context, roles: string[]) => {
    if (!context?.isAuthenticated || !context.userId || !context.tenantId) {
      throw new Error("Unauthorized");
    }
    if (!roles.includes(context.role)) {
      throw new Error(`Forbidden: requires one of ${roles.join(", ")} role`);
    }
  }),
}));

vi.mock("../../../../packages/api/src/admin/support/service", () => ({
  getSupportSummary: getSupportSummaryMock,
  getSupportTicket: getSupportTicketMock,
  listSupportTickets: listSupportTicketsMock,
}));

import {
  loadSupportHubReadModel,
  loadSupportTicketDetail,
  loadSupportTicketList,
} from "../../../../packages/api/src/admin/support/loaders";

const authContext = {
  isAuthenticated: true,
  memberships: [],
  profileId: "profile-1",
  profileRole: "staff",
  role: "staff",
  tenantId: "tenant-1",
  userId: "user-1",
};

const supabaseAdmin = { from: vi.fn() };

const summary = {
  contacts: [{ id: "contact-1", name: "Maria Chen" }],
  generatedAt: "2026-05-01T00:00:00.000Z",
  knowledge: [],
  macros: [],
  queues: [{ id: "donor_care", label: "Donor Care" }],
  tickets: [{ id: "SUP-1", queueId: "donor_care" }],
};

describe("admin support server loaders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminClientMock.mockReturnValue({ client: supabaseAdmin, error: null });
    getAuthContextMock.mockResolvedValue(authContext);
    getSupportSummaryMock.mockResolvedValue(summary);
    getSupportTicketMock.mockResolvedValue({
      id: "SUP-1",
      queueId: "donor_care",
    });
    listSupportTicketsMock.mockResolvedValue([
      { id: "SUP-2", queueId: "donor_care", status: "open" },
    ]);
  });

  it("loads the Support Hub read model through tenant-scoped package services", async () => {
    await expect(loadSupportHubReadModel()).resolves.toBe(summary);

    expect(getAuthContextMock).toHaveBeenCalled();
    expect(getSupportSummaryMock).toHaveBeenCalledWith(
      supabaseAdmin,
      "tenant-1",
    );
  });

  it("loads filtered tickets using the same query vocabulary as the API", async () => {
    const model = await loadSupportTicketList(
      new URLSearchParams("queueId=donor_care&status=open"),
    );

    expect(model).toMatchObject({ tickets: [{ id: "SUP-2" }] });
    expect(listSupportTicketsMock).toHaveBeenCalledWith(
      supabaseAdmin,
      "tenant-1",
      {
        queueId: "donor_care",
        status: "open",
      },
    );
  });

  it("loads a focused ticket detail with shared support metadata", async () => {
    await expect(loadSupportTicketDetail("SUP-1")).resolves.toMatchObject({
      ticket: { id: "SUP-1" },
      contacts: summary.contacts,
      queues: summary.queues,
    });

    expect(getSupportTicketMock).toHaveBeenCalledWith(
      supabaseAdmin,
      "tenant-1",
      "SUP-1",
    );
  });
});
