import { describe, expect, it, vi } from "vitest";

import type { InboundEmailRow } from "../../../../../packages/api/src/workflows/adapters/inbound-email";
import {
  deleteInboundRoute,
  ensureRoutingReview,
  resolveInboundRouteDecision,
  saveInboundRouteAndResume,
} from "../../../../../packages/api/src/workflows/adapters/inbound-routing";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const ROW_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ROUTE_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

function inboundRow(overrides: Partial<InboundEmailRow> = {}): InboundEmailRow {
  return {
    id: ROW_ID,
    tenant_id: TENANT_ID,
    resend_email_id: "re_inbound_1",
    from_email: "brand-new-sender@example.com",
    subject: "An unusual subject with attachments!!",
    to_recipients: ["help@one.org"],
    cc_recipients: [],
    bcc_recipients: [],
    received_at: "2026-06-11T00:00:00.000Z",
    parsed_text: "body",
    parsed_html: null,
    message_id_header: null,
    in_reply_to_header: null,
    references_headers: [],
    attachment_count: 3,
    body_retrieval_status: "available",
    body_retrieval_attempts: 1,
    attachment_retrieval_status: "available",
    attachment_retrieval_attempts: 1,
    conversation_id: null,
    support_message_id: null,
    ...overrides,
  };
}

/** Awaitable + chainable supabase query stub resolving to `result`. */
function chain(result: { data: unknown; error: unknown }) {
  const target: Record<string, unknown> = {};
  const proxy: Record<string, unknown> = new Proxy(target, {
    get(_t, prop) {
      if (prop === "then") {
        return (resolve: (value: unknown) => unknown) =>
          resolve(result);
      }
      if (prop === "maybeSingle" || prop === "single") {
        return () => Promise.resolve(result);
      }
      return () => proxy;
    },
  });
  return proxy;
}

interface RoutingTables {
  threadParent?: { conversation_id: string } | null;
  conversationInbox?: { inbox_id: string } | null;
  inboxes?: Array<{ id: string; inbound_address: string }>;
  routes?: Array<{
    id: string;
    tenant_id: string;
    scope: string;
    match_value: string;
    inbox_id: string;
    is_active: boolean;
  }>;
}

function createRoutingClientMock(tables: RoutingTables) {
  const writes: Array<{ table: string; op: string; values?: unknown }> = [];

  const from = vi.fn((table: string) => {
    if (table === "email_inbound_messages") {
      return {
        select: () => chain({ data: tables.threadParent ?? null, error: null }),
      };
    }
    if (table === "support_conversations") {
      return {
        select: () =>
          chain({ data: tables.conversationInbox ?? null, error: null }),
      };
    }
    if (table === "support_inboxes") {
      return {
        select: () => chain({ data: tables.inboxes ?? [], error: null }),
      };
    }
    if (table === "support_inbound_routes") {
      return {
        select: () => chain({ data: tables.routes ?? [], error: null }),
        upsert: (values: unknown) => {
          writes.push({ table, op: "upsert", values });
          return chain({ data: { id: ROUTE_ID }, error: null });
        },
        update: (values: unknown) => {
          writes.push({ table, op: "update", values });
          return chain({ data: null, error: null });
        },
        delete: () => {
          writes.push({ table, op: "delete" });
          return chain({ data: null, error: null });
        },
      };
    }
    if (table === "support_inbound_routing_reviews") {
      return {
        upsert: (values: unknown) => {
          writes.push({ table, op: "upsert", values });
          return Promise.resolve({ data: null, error: null });
        },
        update: (values: unknown) => {
          writes.push({ table, op: "update", values });
          return chain({ data: null, error: null });
        },
        select: () => chain({ data: [], error: null }),
      };
    }
    if (table === "support_audit_log") {
      return {
        insert: (values: unknown) => {
          writes.push({ table, op: "insert", values });
          return Promise.resolve({ data: null, error: null });
        },
      };
    }
    return { select: () => chain({ data: null, error: null }) };
  });

  return { client: { from } as never, writes, from };
}

describe("inbound route decision (#295)", () => {
  it("routes automatically when a recipient matches a Support Hub inbox", async () => {
    const mock = createRoutingClientMock({
      inboxes: [{ id: "inbox-1", inbound_address: "help@one.org" }],
    });

    // New sender, unusual subject, and attachments are present on the row —
    // none of that forces review when the route is known.
    const decision = await resolveInboundRouteDecision(
      mock.client,
      inboundRow(),
    );

    expect(decision).toEqual({
      kind: "inbox",
      inboxId: "inbox-1",
      source: "inbox_address",
    });
  });

  it("routes thread replies into the existing conversation inbox", async () => {
    const mock = createRoutingClientMock({
      threadParent: { conversation_id: "conv-1" },
      conversationInbox: { inbox_id: "inbox-2" },
    });

    const decision = await resolveInboundRouteDecision(
      mock.client,
      inboundRow({ in_reply_to_header: "<m1@example.com>" }),
    );

    expect(decision).toEqual({
      kind: "inbox",
      inboxId: "inbox-2",
      source: "thread_reply",
    });
  });

  it("routes via a saved recipient route", async () => {
    const mock = createRoutingClientMock({
      inboxes: [],
      routes: [
        {
          id: ROUTE_ID,
          tenant_id: TENANT_ID,
          scope: "recipient",
          match_value: "help@one.org",
          inbox_id: "inbox-3",
          is_active: true,
        },
      ],
    });

    const decision = await resolveInboundRouteDecision(
      mock.client,
      inboundRow(),
    );

    expect(decision).toEqual({
      kind: "inbox",
      inboxId: "inbox-3",
      source: "saved_route",
    });
  });

  it("routes via an approved tenant-domain default", async () => {
    const mock = createRoutingClientMock({
      inboxes: [],
      routes: [
        {
          id: ROUTE_ID,
          tenant_id: TENANT_ID,
          scope: "domain_default",
          match_value: "one.org",
          inbox_id: "inbox-4",
          is_active: true,
        },
      ],
    });

    const decision = await resolveInboundRouteDecision(
      mock.client,
      inboundRow(),
    );

    expect(decision).toEqual({
      kind: "inbox",
      inboxId: "inbox-4",
      source: "domain_default",
    });
  });

  it("holds unknown routes for tenant review", async () => {
    const mock = createRoutingClientMock({ inboxes: [], routes: [] });
    const row = inboundRow();

    const decision = await resolveInboundRouteDecision(mock.client, row);
    expect(decision).toEqual({
      kind: "review",
      reason: "no_route",
      candidateInboxIds: [],
    });

    await ensureRoutingReview(
      mock.client,
      row,
      decision as Extract<typeof decision, { kind: "review" }>,
    );
    const reviewWrite = mock.writes.find(
      (write) => write.table === "support_inbound_routing_reviews",
    );
    expect(reviewWrite?.values).toMatchObject({
      tenant_id: TENANT_ID,
      inbound_email_id: ROW_ID,
      status: "pending",
      reason: "no_route",
    });
  });

  it("holds ambiguous safe routes for review with candidates", async () => {
    const mock = createRoutingClientMock({
      inboxes: [],
      routes: [
        {
          id: "r1",
          tenant_id: TENANT_ID,
          scope: "recipient",
          match_value: "help@one.org",
          inbox_id: "inbox-a",
          is_active: true,
        },
        {
          id: "r2",
          tenant_id: TENANT_ID,
          scope: "alias",
          match_value: "billing@one.org",
          inbox_id: "inbox-b",
          is_active: true,
        },
      ],
    });

    const decision = await resolveInboundRouteDecision(
      mock.client,
      inboundRow({ to_recipients: ["help@one.org", "billing@one.org"] }),
    );

    expect(decision).toEqual({
      kind: "review",
      reason: "ambiguous",
      candidateInboxIds: ["inbox-a", "inbox-b"],
    });
  });
});

describe("route save and continue (#295)", () => {
  it("requires explicit confirmation for tenant-domain defaults and audits the refusal", async () => {
    const mock = createRoutingClientMock({});
    const requestDispatch = vi.fn();

    const result = await saveInboundRouteAndResume(
      { client: mock.client, requestDispatch },
      {
        tenantId: TENANT_ID,
        inboundEmailRowId: ROW_ID,
        inboxId: "inbox-1",
        scope: "domain_default",
        matchValue: "one.org",
        actorProfileId: "profile-1",
      },
    );

    expect(result.status).toBe("confirmation_required");
    expect(requestDispatch).not.toHaveBeenCalled();
    const routeWrites = mock.writes.filter(
      (write) => write.table === "support_inbound_routes",
    );
    expect(routeWrites).toHaveLength(0);
    const audit = mock.writes.find(
      (write) => write.table === "support_audit_log",
    );
    expect(audit?.values).toMatchObject({
      verb: "inbound_route_confirmation_required",
      metadata: expect.objectContaining({
        domainDefaultConfirmationAccepted: false,
      }),
    });
  });

  it("saves a confirmed domain default, audits the confirmation, and resumes the email", async () => {
    const mock = createRoutingClientMock({});
    const requestDispatch = vi.fn().mockResolvedValue({
      outcome: "dispatched",
      request: { id: "wdr-1" },
      reused: false,
      error: null,
    });

    const result = await saveInboundRouteAndResume(
      { client: mock.client, requestDispatch },
      {
        tenantId: TENANT_ID,
        inboundEmailRowId: ROW_ID,
        inboxId: "inbox-1",
        scope: "domain_default",
        matchValue: "one.org",
        domainDefaultConfirmed: true,
        actorProfileId: "profile-1",
      },
    );

    expect(result.status).toBe("saved");
    expect(result.dispatch).toBe("dispatched");
    const audit = mock.writes.find(
      (write) => write.table === "support_audit_log",
    );
    expect(audit?.values).toMatchObject({
      verb: "inbound_route_saved",
      metadata: expect.objectContaining({
        savedScope: "domain_default",
        domainDefaultConfirmationAccepted: true,
      }),
    });
    expect(requestDispatch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        idempotencyKey: `inbound-email-route-resume/${ROW_ID}/route-${ROUTE_ID}`,
      }),
    );
  });

  it("saves an exact recipient route and resolves the pending review", async () => {
    const mock = createRoutingClientMock({});
    const requestDispatch = vi.fn().mockResolvedValue({
      outcome: "dispatched",
      request: { id: "wdr-1" },
      reused: false,
      error: null,
    });

    const result = await saveInboundRouteAndResume(
      { client: mock.client, requestDispatch },
      {
        tenantId: TENANT_ID,
        inboundEmailRowId: ROW_ID,
        inboxId: "inbox-1",
        scope: "recipient",
        matchValue: "Help@One.org",
        actorProfileId: "profile-1",
      },
    );

    expect(result.status).toBe("saved");
    const routeWrite = mock.writes.find(
      (write) =>
        write.table === "support_inbound_routes" && write.op === "upsert",
    );
    expect(routeWrite?.values).toMatchObject({
      scope: "recipient",
      match_value: "help@one.org",
    });
    const reviewUpdate = mock.writes.find(
      (write) =>
        write.table === "support_inbound_routing_reviews" &&
        write.op === "update",
    );
    expect(reviewUpdate?.values).toMatchObject({ status: "resolved" });
  });

  it("deletes a route while audit history stays in the audit log", async () => {
    const mock = createRoutingClientMock({});

    await deleteInboundRoute(mock.client, {
      tenantId: TENANT_ID,
      routeId: ROUTE_ID,
      actorProfileId: "profile-1",
    });

    expect(
      mock.writes.find(
        (write) =>
          write.table === "support_inbound_routes" && write.op === "delete",
      ),
    ).toBeTruthy();
    const audit = mock.writes.find(
      (write) => write.table === "support_audit_log",
    );
    expect(audit?.values).toMatchObject({ verb: "inbound_route_deleted" });
  });
});

describe("pending email resume (#295)", () => {
  it("resumes other pending reviews that the new route resolves", async () => {
    const secondReviewEmailId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
    const mock = createRoutingClientMock({});
    // Override the reviews select to return one matching pending review.
    const originalFrom = mock.from.getMockImplementation()!;
    mock.from.mockImplementation((table: string) => {
      if (table === "support_inbound_routing_reviews") {
        const base = originalFrom(table) as Record<string, unknown>;
        return {
          ...base,
          select: () =>
            chain({
              data: [
                {
                  id: "review-2",
                  inbound_email_id: secondReviewEmailId,
                  email_inbound_messages: {
                    to_recipients: ["help@one.org"],
                    cc_recipients: [],
                    bcc_recipients: [],
                  },
                },
              ],
              error: null,
            }),
        };
      }
      return originalFrom(table);
    });
    const requestDispatch = vi.fn().mockResolvedValue({
      outcome: "dispatched",
      request: { id: "wdr-1" },
      reused: false,
      error: null,
    });

    const result = await saveInboundRouteAndResume(
      { client: mock.client, requestDispatch },
      {
        tenantId: TENANT_ID,
        inboundEmailRowId: ROW_ID,
        inboxId: "inbox-1",
        scope: "recipient",
        matchValue: "help@one.org",
        actorProfileId: "profile-1",
      },
    );

    expect(result.resumedPendingReviews).toBe(1);
    const dispatchedSubjects = requestDispatch.mock.calls.map(
      ([, input]) =>
        (input as { subject: { id: string } }).subject.id,
    );
    expect(dispatchedSubjects).toContain(ROW_ID);
    expect(dispatchedSubjects).toContain(secondReviewEmailId);
  });
});
