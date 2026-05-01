import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { randomUUIDMock } = vi.hoisted(() => ({
  randomUUIDMock: vi.fn(),
}));

vi.mock("node:crypto", () => ({
  randomUUID: randomUUIDMock,
}));

import {
  createSupportTicket,
  getSupportTicket,
  listSupportTickets,
} from "../../../../packages/api/src/admin/support/service";

const TENANT_A = "00000000-0000-0000-0000-0000000000aa";

beforeEach(() => {
  randomUUIDMock.mockReturnValue("aaaaaaaa-bbbb-4bbb-8bbb-aaaaaaaaaaaa");
});

afterEach(() => {
  vi.restoreAllMocks();
});

function createQuery(result: unknown) {
  const query: Record<string, ReturnType<typeof vi.fn>> & {
    then?: PromiseLike<unknown>["then"];
  } = {
    eq: vi.fn(() => query),
    ilike: vi.fn(() => query),
    in: vi.fn(() => query),
    insert: vi.fn(() => query),
    limit: vi.fn(() => query),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    order: vi.fn(() => query),
    or: vi.fn(() => query),
    select: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
  };
  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected);

  return query;
}

describe("admin support service tenant isolation", () => {
  it("filters ticket lists by tenant before other filters", async () => {
    const query = createQuery({ data: [], error: null });
    const from = vi.fn(() => query);

    await listSupportTickets({ from } as never, TENANT_A, {
      queueId: "donor_care",
      status: "open",
      search: "receipt",
    });

    expect(from).toHaveBeenCalledWith("support_tickets");
    expect(query.eq).toHaveBeenNthCalledWith(1, "tenant_id", TENANT_A);
    expect(query.eq).toHaveBeenCalledWith("queue_id", "donor_care");
    expect(query.eq).toHaveBeenCalledWith("status", "open");
    expect(query.or).toHaveBeenCalledWith(
      expect.stringContaining("subject.ilike.%receipt%"),
    );
  });

  it("returns null when a ticket id belongs to another tenant", async () => {
    const query = createQuery({ data: null, error: null });
    const from = vi.fn(() => query);

    const ticket = await getSupportTicket(
      { from } as never,
      TENANT_A,
      "SUP-1000",
    );

    expect(ticket).toBeNull();
    expect(query.eq).toHaveBeenCalledWith("tenant_id", TENANT_A);
    expect(query.eq).toHaveBeenCalledWith("public_id", "SUP-1000");
  });

  it("creates tickets with tenant and creator fields", async () => {
    const query = createQuery({
      data: {
        id: "ticket-db-id",
        public_id: "SUP-2000",
        tenant_id: TENANT_A,
        subject: "Need receipt",
        summary: "Please resend the receipt.",
        queue_id: "donor_care",
        status: "open",
        priority: "normal",
        channel: "form",
        contact_id: null,
        contact_name_snapshot: "Maria Chen",
        contact_email_snapshot: "maria@example.org",
        tags: [],
        created_by: "user-1",
        assigned_to_profile_id: null,
        follow_up_at: null,
        created_at: "2026-05-01T00:00:00.000Z",
        updated_at: "2026-05-01T00:00:00.000Z",
      },
      error: null,
    });
    const from = vi.fn(() => query);

    const ticket = await createSupportTicket(
      { from } as never,
      TENANT_A,
      "user-1",
      {
        contactEmail: "maria@example.org",
        contactName: "Maria Chen",
        priority: "normal",
        queueId: "donor_care",
        subject: "Need receipt",
        summary: "Please resend the receipt.",
      },
    );

    expect(from).toHaveBeenCalledWith("support_tickets");
    expect(query.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        created_by: "user-1",
        tenant_id: TENANT_A,
        public_id: expect.stringMatching(/^SUP-/),
      }),
    );
    expect(ticket.id).toBe("SUP-2000");
  });

  it("uses a collision-resistant public id when tickets are created in the same millisecond", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_777_629_895_863);
    randomUUIDMock
      .mockReturnValueOnce("11111111-aaaa-4aaa-8aaa-111111111111")
      .mockReturnValueOnce("22222222-bbbb-4bbb-8bbb-222222222222");
    const query = createQuery({
      data: {
        id: "ticket-db-id",
        public_id: "SUP-2000",
        tenant_id: TENANT_A,
        subject: "Need receipt",
        summary: "Please resend the receipt.",
        queue_id: "donor_care",
        status: "open",
        priority: "normal",
        channel: "form",
        contact_id: null,
        contact_name_snapshot: "Maria Chen",
        contact_email_snapshot: "maria@example.org",
        tags: [],
        created_by: "user-1",
        assigned_to_profile_id: null,
        follow_up_at: null,
        created_at: "2026-05-01T00:00:00.000Z",
        updated_at: "2026-05-01T00:00:00.000Z",
      },
      error: null,
    });
    const from = vi.fn(() => query);
    const input = {
      contactEmail: "maria@example.org",
      contactName: "Maria Chen",
      priority: "normal" as const,
      queueId: "donor_care" as const,
      subject: "Need receipt",
      summary: "Please resend the receipt.",
    };

    await createSupportTicket({ from } as never, TENANT_A, "user-1", input);
    await createSupportTicket({ from } as never, TENANT_A, "user-1", input);

    const publicIds = query.insert.mock.calls.map(
      ([row]) => (row as { public_id: string }).public_id,
    );

    expect(publicIds).toEqual([
      "SUP-1777629895863-11111111AAAA",
      "SUP-1777629895863-22222222BBBB",
    ]);
    expect(new Set(publicIds)).toHaveLength(publicIds.length);
  });
});
