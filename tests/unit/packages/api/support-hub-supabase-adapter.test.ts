/**
 * Unit tests for the SQL-filter changes in the Supabase Support Hub adapter.
 *
 * We mock `@asym/database/supabase/admin` at the module boundary so that
 * `client()` inside supabase.ts returns a chainable query builder mock, and
 * we use `runWithSupportHubTenant` to establish the tenant context that
 * `tenantId()` reads from AsyncLocalStorage.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock the admin Supabase client before any adapter imports resolve.
// vi.mock factories are hoisted to the top of the file, so the mock function
// must be declared via vi.hoisted() to be available inside the factory.
// ---------------------------------------------------------------------------

const { getAdminClientMock } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));
// Same module as the adapter when worktree `node_modules` is a symlink to
// another clone: `packages/api` resolves `@asym/database` locally.
vi.mock("../../../../packages/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are registered)
// ---------------------------------------------------------------------------

import { runWithSupportHubTenant } from "../../../../packages/api/src/admin/support-hub/request-context";
import { supabaseSupportHubAdapter } from "../../../../packages/api/src/admin/support-hub/adapter/supabase";

// ---------------------------------------------------------------------------
// Chainable query builder factory
// ---------------------------------------------------------------------------

/**
 * Creates a minimal chainable mock of the Supabase PostgREST query builder.
 * Each method returns `this` (the same mock) to allow chaining.
 * The terminal `.select()` / implicit await resolves `resolveWith`.
 */
function createQueryMock(resolveWith: { data: unknown; error: null | object }) {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};

  // Build the object first, then attach methods that reference it.
  const queryBuilder: Record<string, unknown> = {};
  const methods = [
    "select",
    "eq",
    "is",
    "in",
    "order",
    "limit",
    "range",
    "maybeSingle",
    "single",
    "insert",
    "update",
    "upsert",
    "delete",
    "filter",
  ];
  for (const name of methods) {
    queryBuilder[name] = vi.fn().mockReturnValue(queryBuilder);
  }

  // Make the builder thenable so `const { data, error } = await builder` works.
  (queryBuilder as Record<string, unknown>).then = (
    resolve: (v: unknown) => void,
  ) => {
    resolve(resolveWith);
    return Promise.resolve(resolveWith);
  };

  return queryBuilder as typeof queryBuilder & {
    [K in (typeof methods)[number]]: ReturnType<typeof vi.fn>;
  } & { then: (resolve: (v: unknown) => void) => Promise<unknown> };
}

/** Build a `from()` spy that returns the given query builder for any table. */
function buildFromSpy(qb: ReturnType<typeof createQueryMock>) {
  return vi.fn().mockReturnValue(qb);
}

/** Wire up `getAdminClientMock` to use the given `from` spy. */
function setClient(fromSpy: ReturnType<typeof vi.fn>) {
  getAdminClientMock.mockReturnValue({
    client: { from: fromSpy },
    error: null,
  });
}

const TENANT = "tenant-test-001";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("supabaseSupportHubAdapter — SQL filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // listMessages
  // -------------------------------------------------------------------------

  describe("listMessages", () => {
    it("queries support_messages with conversation_id eq filter", async () => {
      // Empty messages result — we only care that the right query was built.
      const qb = createQueryMock({ data: [], error: null });
      setClient(buildFromSpy(qb));

      await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.listMessages("conv-1"),
      );

      // The adapter must call .eq("conversation_id", "conv-1") on the query.
      expect(qb.eq).toHaveBeenCalledWith("conversation_id", "conv-1");
    });

    it("does NOT fetch support_message_attachments when there are zero messages", async () => {
      const qb = createQueryMock({ data: [], error: null });
      const fromSpy = buildFromSpy(qb);
      setClient(fromSpy);

      await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.listMessages("conv-empty"),
      );

      // `from` should only have been called once (for support_messages).
      // If attachments were fetched, from would be called a second time.
      const tablesCalled = fromSpy.mock.calls.map((c) => c[0]);
      expect(tablesCalled).not.toContain("support_message_attachments");
    });

    it("pages support_messages with range until a short page is returned", async () => {
      const firstPage = Array.from({ length: 1000 }, (_, index) => ({
        id: `msg-${index}`,
        tenant_id: TENANT,
        conversation_id: "conv-big",
        type: "email",
        direction: "inbound",
        is_private: false,
        delivery_state: "delivered",
        author: {
          id: "donor:a@b.com",
          role: "donor",
          name: "A",
          email: "a@b.com",
          avatarUrl: null,
        },
        body: { text: "hello", html: null },
        email_headers: null,
        outbound_send_log_id: null,
        inbound_email_id: null,
        posted_at: "2026-01-01T00:00:00.000Z",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      }));
      const secondPage = [
        {
          ...firstPage[0],
          id: "msg-1000",
        },
      ];

      let page = 0;
      const qbMessages = createQueryMock({ data: [], error: null });
      qbMessages.range.mockImplementation(() => {
        page += 1;
        const data = page === 1 ? firstPage : secondPage;
        return Object.assign(qbMessages, {
          then: (resolve: (v: unknown) => void) => {
            resolve({ data, error: null });
            return Promise.resolve({ data, error: null });
          },
        });
      });

      const fromSpy = vi.fn().mockImplementation((table: string) => {
        if (table === "support_messages") return qbMessages;
        if (table === "support_message_attachments") {
          return createQueryMock({ data: [], error: null });
        }
        return createQueryMock({ data: [], error: null });
      });
      setClient(fromSpy);

      const messages = await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.listMessages("conv-big"),
      );

      expect(qbMessages.range).toHaveBeenCalledWith(0, 999);
      expect(qbMessages.range).toHaveBeenCalledWith(1000, 1999);
      expect(messages).toHaveLength(1001);
    });

    it("fetches attachments via .in('message_id', [...]) with only returned message ids", async () => {
      // Two independent query builders: one for messages, one for attachments.
      const messageRow = {
        id: "msg-1",
        tenant_id: TENANT,
        conversation_id: "conv-1",
        type: "email",
        direction: "inbound",
        is_private: false,
        delivery_state: "delivered",
        author: {
          id: "donor:a@b.com",
          role: "donor",
          name: "A",
          email: "a@b.com",
          avatarUrl: null,
        },
        body: { text: "hello", html: null },
        email_headers: null,
        outbound_send_log_id: null,
        inbound_email_id: null,
        posted_at: "2026-01-01T00:00:00.000Z",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      };

      const qbMessages = createQueryMock({ data: [messageRow], error: null });
      const qbAttachments = createQueryMock({ data: [], error: null });

      let callCount = 0;
      const fromSpy = vi.fn().mockImplementation((table: string) => {
        callCount++;
        if (table === "support_messages") return qbMessages;
        if (table === "support_message_attachments") return qbAttachments;
        // Other tables (labels, agents, teams for snapshot) return empty.
        return createQueryMock({ data: [], error: null });
      });
      setClient(fromSpy);

      await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.listMessages("conv-1"),
      );

      // Attachments query must use .in("message_id", ["msg-1"]).
      expect(qbAttachments.in).toHaveBeenCalledWith("message_id", ["msg-1"]);
      // Attachments query must also scope to tenant.
      expect(qbAttachments.eq).toHaveBeenCalledWith("tenant_id", TENANT);
    });
  });

  // -------------------------------------------------------------------------
  // conversations.list
  // -------------------------------------------------------------------------

  describe("conversations.list", () => {
    /**
     * Build a minimal from-spy that returns empty data for all tables except
     * support_conversations, where it returns `conversationRows`.
     */
    function buildListFromSpy(
      conversationRows: unknown[],
    ): ReturnType<typeof vi.fn> {
      return vi.fn().mockImplementation((table: string) => {
        if (table === "support_conversations") {
          return createQueryMock({ data: conversationRows, error: null });
        }
        // Labels, agents, teams, conversation_labels — return empty.
        return createQueryMock({ data: [], error: null });
      });
    }

    it("applies eq('status', ...) when status is not 'all'", async () => {
      let convQb: ReturnType<typeof createQueryMock> | null = null;
      const fromSpy = vi.fn().mockImplementation((table: string) => {
        if (table === "support_conversations") {
          convQb = createQueryMock({ data: [], error: null });
          return convQb;
        }
        return createQueryMock({ data: [], error: null });
      });
      setClient(fromSpy);

      await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.list({ status: "open" }),
      );

      expect(convQb).not.toBeNull();
      expect(convQb!.eq).toHaveBeenCalledWith("status", "open");
    });

    it("does NOT add a status eq filter when status is 'all'", async () => {
      let convQb: ReturnType<typeof createQueryMock> | null = null;
      const fromSpy = vi.fn().mockImplementation((table: string) => {
        if (table === "support_conversations") {
          convQb = createQueryMock({ data: [], error: null });
          return convQb;
        }
        return createQueryMock({ data: [], error: null });
      });
      setClient(fromSpy);

      await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.list({ status: "all" }),
      );

      expect(convQb).not.toBeNull();
      // eq should have been called for tenant_id but NOT for status.
      const eqStatusCalls = convQb!.eq.mock.calls.filter(
        (c: unknown[]) => c[0] === "status",
      );
      expect(eqStatusCalls).toHaveLength(0);
    });

    it("applies eq('inbox_id', ...) when inboxId is provided", async () => {
      let convQb: ReturnType<typeof createQueryMock> | null = null;
      const fromSpy = vi.fn().mockImplementation((table: string) => {
        if (table === "support_conversations") {
          convQb = createQueryMock({ data: [], error: null });
          return convQb;
        }
        return createQueryMock({ data: [], error: null });
      });
      setClient(fromSpy);

      await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.list({
          status: "all",
          inboxId: "inbox-1",
        }),
      );

      expect(convQb).not.toBeNull();
      expect(convQb!.eq).toHaveBeenCalledWith("inbox_id", "inbox-1");
    });

    it("applies is('assignee_agent_id', null) when assigneeAgentId is null", async () => {
      let convQb: ReturnType<typeof createQueryMock> | null = null;
      const fromSpy = vi.fn().mockImplementation((table: string) => {
        if (table === "support_conversations") {
          convQb = createQueryMock({ data: [], error: null });
          return convQb;
        }
        return createQueryMock({ data: [], error: null });
      });
      setClient(fromSpy);

      await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.list({
          status: "all",
          assigneeAgentId: null,
        }),
      );

      expect(convQb).not.toBeNull();
      expect(convQb!.is).toHaveBeenCalledWith("assignee_agent_id", null);
    });

    it("applies eq('assignee_agent_id', id) when assigneeAgentId is a string", async () => {
      let convQb: ReturnType<typeof createQueryMock> | null = null;
      const fromSpy = vi.fn().mockImplementation((table: string) => {
        if (table === "support_conversations") {
          convQb = createQueryMock({ data: [], error: null });
          return convQb;
        }
        return createQueryMock({ data: [], error: null });
      });
      setClient(fromSpy);

      await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.list({
          status: "all",
          assigneeAgentId: "agent-42",
        }),
      );

      expect(convQb).not.toBeNull();
      expect(convQb!.eq).toHaveBeenCalledWith("assignee_agent_id", "agent-42");
    });

    it("does NOT add assignee filter when assigneeAgentId is undefined", async () => {
      let convQb: ReturnType<typeof createQueryMock> | null = null;
      const fromSpy = vi.fn().mockImplementation((table: string) => {
        if (table === "support_conversations") {
          convQb = createQueryMock({ data: [], error: null });
          return convQb;
        }
        return createQueryMock({ data: [], error: null });
      });
      setClient(fromSpy);

      await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.list({ status: "all" }),
      );

      expect(convQb).not.toBeNull();
      const isAssigneeCalls = convQb!.is.mock.calls.filter(
        (c: unknown[]) => c[0] === "assignee_agent_id",
      );
      const eqAssigneeCalls = convQb!.eq.mock.calls.filter(
        (c: unknown[]) => c[0] === "assignee_agent_id",
      );
      expect(isAssigneeCalls).toHaveLength(0);
      expect(eqAssigneeCalls).toHaveLength(0);
    });

    it("normalizes empty subject, SQL-CHECK emails, and partial contact refs", async () => {
      const conversationRow = {
        id: "conv-adapter-1",
        tenant_id: TENANT,
        inbox_id: "inbox-1",
        subject: "   ",
        status: "open",
        priority: "normal",
        channel: "email",
        assignee_agent_id: null,
        team_id: null,
        external_contact_email: "a@b",
        external_contact_name: "Pat",
        contact_ref: { donorId: "donor-1" },
        unread_count: 0,
        message_count: 1,
        first_message_at: "2026-01-01T00:00:00.000Z",
        last_message_at: "2026-01-01T00:00:00.000Z",
        last_customer_message_at: null,
        last_message_direction: "inbound",
        first_responded_at: null,
        first_response_due_at: null,
        next_response_due_at: null,
        resolved_at: null,
        snoozed_until: null,
        escalated_at: null,
        board_order: 0,
        sla_policy_id: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      };
      const fromSpy = vi.fn().mockImplementation((table: string) => {
        if (table === "support_conversations") {
          return createQueryMock({ data: [conversationRow], error: null });
        }
        return createQueryMock({ data: [], error: null });
      });
      setClient(fromSpy);

      const conversations = await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.list({ status: "all" }),
      );

      expect(conversations).toHaveLength(1);
      expect(conversations[0]).toEqual(
        expect.objectContaining({
          id: "conv-adapter-1",
          subject: "(no subject)",
          externalContactEmail: "a@b",
          contact: expect.objectContaining({
            donorId: "donor-1",
            contactId: null,
            giftId: null,
          }),
        }),
      );
    });

    it("keeps a null contact_ref as null", async () => {
      const conversationRow = {
        id: "conv-adapter-2",
        tenant_id: TENANT,
        inbox_id: "inbox-1",
        subject: "Receipt",
        status: "open",
        priority: "normal",
        channel: "email",
        assignee_agent_id: null,
        team_id: null,
        external_contact_email: "donor@example.org",
        external_contact_name: "Donor",
        contact_ref: null,
        unread_count: 0,
        message_count: 1,
        first_message_at: "2026-01-01T00:00:00.000Z",
        last_message_at: "2026-01-01T00:00:00.000Z",
        last_customer_message_at: null,
        last_message_direction: "inbound",
        first_responded_at: null,
        first_response_due_at: null,
        next_response_due_at: null,
        resolved_at: null,
        snoozed_until: null,
        escalated_at: null,
        board_order: 0,
        sla_policy_id: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      };
      const fromSpy = vi.fn().mockImplementation((table: string) => {
        if (table === "support_conversations") {
          return createQueryMock({ data: [conversationRow], error: null });
        }
        return createQueryMock({ data: [], error: null });
      });
      setClient(fromSpy);

      const conversations = await runWithSupportHubTenant(TENANT, () =>
        supabaseSupportHubAdapter.conversations.list({ status: "all" }),
      );

      expect(conversations[0]?.contact).toBeNull();
    });
  });
});
