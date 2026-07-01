import { describe, expect, it, vi } from "vitest";

import {
  bulkMoveSupportConversations,
  moveSupportConversation,
  retryFailedBulkMove,
  validateMoveReason,
  MOVE_FAILURE_MESSAGES,
} from "../../../../packages/api/src/admin/support-hub/move-service";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const CLAIM_ID = "55555555-5555-4555-8555-555555555555";
const BATCH_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

interface MoveTables {
  conversations?: Record<string, Record<string, unknown> | null>;
  destination?: Record<string, unknown> | null;
  agent?: Record<string, unknown> | null;
  batch?: Record<string, unknown> | null;
  acquire?: Array<{ acquired: boolean; claim_id?: string }>;
}

function createMoveClientMock(tables: MoveTables) {
  const writes: Array<{ table: string; op: string; values?: unknown }> = [];
  let conversationLookupId: string | null = null;

  function chainFor(table: string) {
    const filters: Record<string, unknown> = {};
    const builder: Record<string, unknown> = {};
    const handler = {
      get(_t: unknown, prop: string) {
        if (prop === "then") {
          return (resolve: (value: unknown) => unknown) =>
            resolve({ data: null, error: null });
        }
        if (prop === "maybeSingle") {
          return () => {
            if (table === "support_conversations") {
              const row =
                tables.conversations?.[
                  String(filters.id ?? conversationLookupId)
                ] ?? null;
              return Promise.resolve({ data: row, error: null });
            }
            if (table === "support_inboxes") {
              return Promise.resolve({
                data: tables.destination ?? null,
                error: null,
              });
            }
            if (table === "support_agents") {
              return Promise.resolve({
                data: tables.agent ?? null,
                error: null,
              });
            }
            if (table === "support_bulk_move_operations") {
              return Promise.resolve({
                data: tables.batch ?? null,
                error: null,
              });
            }
            return Promise.resolve({ data: null, error: null });
          };
        }
        return (...args: unknown[]) => {
          if (prop === "eq" && typeof args[0] === "string") {
            filters[args[0] as string] = args[1];
            if (args[0] === "id" && table === "support_conversations") {
              conversationLookupId = String(args[1]);
            }
          }
          return proxy;
        };
      },
    };
    const proxy = new Proxy(builder, handler as ProxyHandler<object>);
    return proxy;
  }

  const rpc = vi.fn((fn: string) => {
    if (fn === "acquire_workflow_work_claim") {
      const next = tables.acquire?.shift() ?? {
        acquired: true,
        claim_id: CLAIM_ID,
      };
      return Promise.resolve({ data: next, error: null });
    }
    return Promise.resolve({ data: true, error: null });
  });

  const from = vi.fn((table: string) => ({
    select: () => chainFor(table),
    update: (values: unknown) => {
      writes.push({ table, op: "update", values });
      return chainFor(table);
    },
    insert: (values: unknown) => {
      writes.push({ table, op: "insert", values });
      return Promise.resolve({ data: null, error: null });
    },
    upsert: (values: unknown) => {
      writes.push({ table, op: "upsert", values });
      return Promise.resolve({ data: null, error: null });
    },
  }));

  return { client: { from, rpc } as never, writes, rpc };
}

function auditRowsFrom(
  writes: Array<{ table: string; op: string; values?: unknown }>,
): Array<{ verb: string; metadata: Record<string, unknown> }> {
  return writes
    .filter((write) => write.table === "support_audit_log")
    .flatMap((write) =>
      Array.isArray(write.values) ? write.values : [write.values],
    ) as Array<{ verb: string; metadata: Record<string, unknown> }>;
}

function conversationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "conv-1",
    tenant_id: TENANT_ID,
    inbox_id: "inbox-src",
    status: "open",
    assignee_agent_id: null,
    snoozed_until: null,
    priority: "high",
    ...overrides,
  };
}

const baseInput = {
  tenantId: TENANT_ID,
  conversationId: "conv-1",
  destinationInboxId: "inbox-dst",
  reason: "Customer asked billing, this belongs in finance inbox",
  actorProfileId: "profile-1",
};

describe("audited support conversation move (#296)", () => {
  it("validates the reason lightly: trimmed, 5-500 chars, free text", () => {
    expect(validateMoveReason("   ok   ")).toBeNull();
    expect(validateMoveReason("x".repeat(501))).toBeNull();
    expect(validateMoveReason("  belongs in billing  ")).toBe(
      "belongs in billing",
    );
  });

  it("moves between tenant-owned inboxes and audits both quiet markers", async () => {
    const mock = createMoveClientMock({
      conversations: { "conv-1": conversationRow() },
      destination: { id: "inbox-dst", tenant_id: TENANT_ID },
    });

    const result = await moveSupportConversation(mock.client, baseInput);

    expect(result.status).toBe("moved");

    const conversationUpdate = mock.writes.find(
      (write) => write.table === "support_conversations",
    );
    expect(conversationUpdate?.values).toEqual({ inbox_id: "inbox-dst" });

    // Both markers land in ONE insert so they succeed or fail together.
    const audits = mock.writes.filter(
      (write) => write.table === "support_audit_log",
    );
    expect(audits).toHaveLength(1);
    const markerRows = audits[0]?.values as Array<{
      verb: string;
      conversation_id: string;
      metadata: Record<string, unknown>;
    }>;
    expect(Array.isArray(markerRows)).toBe(true);
    expect(markerRows).toHaveLength(2);
    const movedFrom = markerRows.find(
      (row) => row.verb === "conversation_moved",
    );
    const movedTo = markerRows.find(
      (row) => row.verb === "conversation_moved_out",
    );
    expect(movedFrom).toBeTruthy();
    expect(movedTo).toBeTruthy();
    expect(movedFrom).toMatchObject({
      conversation_id: "conv-1",
      metadata: expect.objectContaining({
        sourceInboxId: "inbox-src",
        destinationInboxId: "inbox-dst",
        reason: baseInput.reason,
        marker: "moved_from",
        retained: expect.objectContaining({
          priority: "high",
          status: "open",
        }),
      }),
    });
  });

  it("rejects moves to inboxes the tenant does not own", async () => {
    const mock = createMoveClientMock({
      conversations: { "conv-1": conversationRow() },
      destination: null,
    });

    const result = await moveSupportConversation(mock.client, baseInput);

    expect(result).toMatchObject({
      status: "failed",
      code: "destination_not_found",
    });
  });

  it("requires quiet confirmation before moving resolved conversations", async () => {
    const mock = createMoveClientMock({
      conversations: { "conv-1": conversationRow({ status: "resolved" }) },
      destination: { id: "inbox-dst", tenant_id: TENANT_ID },
    });

    const blocked = await moveSupportConversation(mock.client, baseInput);
    expect(blocked).toMatchObject({
      status: "failed",
      code: "resolved_confirmation_required",
    });

    const confirmed = await moveSupportConversation(mock.client, {
      ...baseInput,
      confirmResolved: true,
    });
    expect(confirmed.status).toBe("moved");

    // Move Status Retention: the resolved status is never touched.
    const conversationUpdates = mock.writes.filter(
      (write) => write.table === "support_conversations",
    );
    for (const update of conversationUpdates) {
      expect(update.values).not.toHaveProperty("status");
      expect(update.values).not.toHaveProperty("snoozed_until");
      expect(update.values).not.toHaveProperty("priority");
    }
  });

  it("keeps the assignee when they can still work the destination queue", async () => {
    const mock = createMoveClientMock({
      conversations: {
        "conv-1": conversationRow({ assignee_agent_id: "agent-1" }),
      },
      destination: { id: "inbox-dst", tenant_id: TENANT_ID },
      agent: { id: "agent-1", is_active: true },
    });

    const result = await moveSupportConversation(mock.client, baseInput);

    expect(result).toMatchObject({ status: "moved", assigneeCleared: false });
    const update = mock.writes.find(
      (write) => write.table === "support_conversations",
    );
    expect(update?.values).not.toHaveProperty("assignee_agent_id");
  });

  it("clears the assignee without round-robin when they cannot work the destination", async () => {
    const mock = createMoveClientMock({
      conversations: {
        "conv-1": conversationRow({ assignee_agent_id: "agent-1" }),
      },
      destination: { id: "inbox-dst", tenant_id: TENANT_ID },
      agent: { id: "agent-1", is_active: false },
    });

    const result = await moveSupportConversation(mock.client, baseInput);

    expect(result).toMatchObject({ status: "moved", assigneeCleared: true });
    const update = mock.writes.find(
      (write) => write.table === "support_conversations",
    );
    expect(update?.values).toMatchObject({ assignee_agent_id: null });
  });
});

describe("bulk support move and retry failed (#297)", () => {
  it("partially succeeds, copies the shared reason, and marks batch audit entries", async () => {
    const mock = createMoveClientMock({
      conversations: {
        "conv-1": conversationRow(),
        "conv-2": null, // unknown conversation fails safely
      },
      destination: { id: "inbox-dst", tenant_id: TENANT_ID },
      acquire: [
        { acquired: true, claim_id: CLAIM_ID },
        { acquired: true, claim_id: CLAIM_ID },
      ],
    });

    const result = await bulkMoveSupportConversations(mock.client, {
      tenantId: TENANT_ID,
      conversationIds: ["conv-1", "conv-2"],
      destinationInboxId: "inbox-dst",
      reason: "Routing cleanup after inbox restructure",
      actorProfileId: "profile-1",
    });

    expect(result.status).toBe("partial");
    expect(result.moved).toBe(1);
    expect(result.failed).toBe(1);

    const failedItem = result.items.find(
      (item) => item.conversationId === "conv-2",
    );
    expect(failedItem?.message).toBe(
      MOVE_FAILURE_MESSAGES.conversation_not_found,
    );
    expect(failedItem?.message).not.toMatch(/stack|sql|supabase|tenant_id/i);

    const audit = auditRowsFrom(mock.writes).find(
      (row) => row.verb === "conversation_moved",
    );
    expect(audit).toMatchObject({
      metadata: expect.objectContaining({
        reason: "Routing cleanup after inbox restructure",
        batchOperationId: result.batchOperationId,
        isRetry: false,
      }),
    });

    const batchUpsert = mock.writes.find(
      (write) => write.table === "support_bulk_move_operations",
    );
    expect(batchUpsert?.values).toMatchObject({
      id: result.batchOperationId,
      status: "partial",
    });
  });

  it("skips items whose move is already claimed elsewhere", async () => {
    const mock = createMoveClientMock({
      conversations: { "conv-1": conversationRow() },
      destination: { id: "inbox-dst", tenant_id: TENANT_ID },
      acquire: [{ acquired: false }],
    });

    const result = await bulkMoveSupportConversations(mock.client, {
      tenantId: TENANT_ID,
      conversationIds: ["conv-1"],
      destinationInboxId: "inbox-dst",
      reason: "Routing cleanup after inbox restructure",
      actorProfileId: "profile-1",
    });

    expect(result.items[0]?.status).toBe("skipped_claimed");
    expect(result.moved).toBe(0);
  });

  it("retries only failed items, reuses the original reason, and links retry audit", async () => {
    const mock = createMoveClientMock({
      conversations: { "conv-2": conversationRow({ id: "conv-2" }) },
      destination: { id: "inbox-dst", tenant_id: TENANT_ID },
      batch: {
        id: BATCH_ID,
        tenant_id: TENANT_ID,
        destination_inbox_id: "inbox-dst",
        reason: "Original shared batch reason",
        items: [
          { conversationId: "conv-1", status: "moved" },
          { conversationId: "conv-2", status: "failed", code: "move_failed" },
        ],
      },
      acquire: [
        { acquired: true, claim_id: CLAIM_ID }, // retry-level claim
        { acquired: true, claim_id: CLAIM_ID }, // per-item claim
      ],
    });

    const result = await retryFailedBulkMove(mock.client, {
      tenantId: TENANT_ID,
      batchOperationId: BATCH_ID,
      actorProfileId: "profile-1",
    });

    expect(result.status).toBe("retried");
    if (result.status !== "retried") throw new Error("unreachable");
    expect(result.moved).toBe(2);
    expect(result.failed).toBe(0);

    const retryAudit = auditRowsFrom(mock.writes).find(
      (row) => row.verb === "conversation_moved",
    );
    expect(retryAudit).toMatchObject({
      metadata: expect.objectContaining({
        reason: "Original shared batch reason",
        batchOperationId: BATCH_ID,
        isRetry: true,
      }),
    });
  });

  it("retry treats an already-moved conversation as success", async () => {
    // The original attempt moved conv-2 but failed before its bookkeeping
    // landed, so the batch row still says "failed" while the conversation
    // already sits in the destination inbox. Retry must not fail forever.
    const mock = createMoveClientMock({
      conversations: {
        "conv-2": conversationRow({ id: "conv-2", inbox_id: "inbox-dst" }),
      },
      destination: { id: "inbox-dst", tenant_id: TENANT_ID },
      batch: {
        id: BATCH_ID,
        tenant_id: TENANT_ID,
        destination_inbox_id: "inbox-dst",
        reason: "Original shared batch reason",
        items: [
          { conversationId: "conv-1", status: "moved" },
          { conversationId: "conv-2", status: "failed", code: "move_failed" },
        ],
      },
      acquire: [
        { acquired: true, claim_id: CLAIM_ID }, // retry-level claim
        { acquired: true, claim_id: CLAIM_ID }, // per-item claim
      ],
    });

    const result = await retryFailedBulkMove(mock.client, {
      tenantId: TENANT_ID,
      batchOperationId: BATCH_ID,
      actorProfileId: "profile-1",
    });

    expect(result.status).toBe("retried");
    if (result.status !== "retried") throw new Error("unreachable");
    expect(result.moved).toBe(2);
    expect(result.failed).toBe(0);
    const retried = result.items.find(
      (item) => item.conversationId === "conv-2",
    );
    expect(retried?.status).toBe("moved");
  });

  it("reuses the active retry attempt on duplicate clicks", async () => {
    const mock = createMoveClientMock({
      batch: {
        id: BATCH_ID,
        tenant_id: TENANT_ID,
        destination_inbox_id: "inbox-dst",
        reason: "Original shared batch reason",
        items: [{ conversationId: "conv-2", status: "failed" }],
      },
      acquire: [{ acquired: false }],
    });

    const result = await retryFailedBulkMove(mock.client, {
      tenantId: TENANT_ID,
      batchOperationId: BATCH_ID,
      actorProfileId: "profile-1",
    });

    expect(result.status).toBe("active_retry_in_progress");
  });

  it("reports nothing to retry when every item already moved", async () => {
    const mock = createMoveClientMock({
      batch: {
        id: BATCH_ID,
        tenant_id: TENANT_ID,
        destination_inbox_id: "inbox-dst",
        reason: "Original shared batch reason",
        items: [{ conversationId: "conv-1", status: "moved" }],
      },
    });

    const result = await retryFailedBulkMove(mock.client, {
      tenantId: TENANT_ID,
      batchOperationId: BATCH_ID,
      actorProfileId: "profile-1",
    });

    expect(result.status).toBe("nothing_to_retry");
  });
});
