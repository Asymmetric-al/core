import { describe, expect, it, vi } from "vitest";

import {
  listInboundAttachments,
  loadInboundEmailForWorkflow,
  markInboundBodyRetrievalFailed,
  requestInboundEmailRetryDispatch,
  retrieveInboundBody,
  routeReadyInboundEmail,
  type InboundEmailRow,
} from "../../../../../packages/api/src/workflows/adapters/inbound-email";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const ROW_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const CLAIM_ID = "55555555-5555-4555-8555-555555555555";

function inboundRow(overrides: Partial<InboundEmailRow> = {}): InboundEmailRow {
  return {
    id: ROW_ID,
    tenant_id: TENANT_ID,
    resend_email_id: "re_inbound_1",
    from_email: "sender@example.com",
    subject: "Need help",
    to_recipients: ["support@one.org"],
    cc_recipients: [],
    bcc_recipients: [],
    received_at: "2026-06-11T00:00:00.000Z",
    parsed_text: null,
    parsed_html: null,
    message_id_header: null,
    in_reply_to_header: null,
    references_headers: [],
    attachment_count: 0,
    body_retrieval_status: "pending",
    body_retrieval_attempts: 0,
    attachment_retrieval_status: "none",
    attachment_retrieval_attempts: 0,
    conversation_id: null,
    support_message_id: null,
    ...overrides,
  };
}

interface InboundClientMockOptions {
  /** Existing support message returned by the bridge-recovery lookup. */
  supportMessage?: { id: string; conversation_id: string | null } | null;
  /** Error returned by the bridge-recovery lookup itself. */
  supportMessageError?: { message: string } | null;
  /** Error returned by email_inbound_messages updates (bridge failure). */
  updateError?: { message: string } | null;
}

function createInboundClientMock(
  row: InboundEmailRow | null,
  options: InboundClientMockOptions = {},
) {
  const updates: Array<{ values: Record<string, unknown> }> = [];

  const from = vi.fn((table: string) => {
    if (table === "support_messages") {
      const limit = vi.fn().mockResolvedValue({
        data: options.supportMessage ? [options.supportMessage] : [],
        error: options.supportMessageError ?? null,
      });
      const eqSecond = vi.fn(() => ({ limit }));
      const eqFirst = vi.fn(() => ({ eq: eqSecond }));
      return { select: vi.fn(() => ({ eq: eqFirst })) };
    }

    const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const selectEq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq: selectEq }));

    const updateIn = vi.fn().mockResolvedValue({ data: null, error: null });
    const updateEqResult = Object.assign(
      Promise.resolve({ data: null, error: options.updateError ?? null }),
      { in: updateIn },
    );
    const updateEq = vi.fn(() => updateEqResult);
    const update = vi.fn((values: Record<string, unknown>) => {
      updates.push({ values });
      return { eq: updateEq };
    });

    return { select, update };
  });

  const rpc = vi.fn();

  return { client: { from, rpc } as never, updates, rpc, from };
}

describe("inbound email workflow adapter (#294)", () => {
  it("enforces tenant isolation when loading the placeholder", async () => {
    const mock = createInboundClientMock(
      inboundRow({ tenant_id: "99999999-9999-4999-8999-999999999999" }),
    );

    await expect(
      loadInboundEmailForWorkflow(mock.client, {
        tenantId: TENANT_ID,
        inboundEmailRowId: ROW_ID,
      }),
    ).rejects.toThrow("inbound_email_tenant_mismatch");
  });

  it("retrieves the body and marks the placeholder available", async () => {
    const mock = createInboundClientMock(inboundRow());
    const provider = {
      apiKey: "re_test",
      fetchReceivedEmail: vi.fn().mockResolvedValue({
        success: true,
        data: {
          text: "Hello support",
          html: "<p>Hello support</p>",
          headers: [{ name: "Message-Id", value: "<m1@example.com>" }],
        },
      }),
      fetchAttachments: vi.fn(),
    };

    const result = await retrieveInboundBody(mock.client, provider, {
      tenantId: TENANT_ID,
      inboundEmailRowId: ROW_ID,
    });

    expect(result.status).toBe("available");
    expect(mock.updates[0]?.values).toMatchObject({
      parsed_text: "Hello support",
      body_retrieval_status: "available",
      body_retrieval_attempts: 1,
      message_id_header: "<m1@example.com>",
    });
  });

  it("records the attempt and throws when the provider returns an empty body", async () => {
    const mock = createInboundClientMock(inboundRow());
    const provider = {
      apiKey: "re_test",
      fetchReceivedEmail: vi.fn().mockResolvedValue({
        success: true,
        data: { text: "", html: null, headers: [] },
      }),
      fetchAttachments: vi.fn(),
    };

    await expect(
      retrieveInboundBody(mock.client, provider, {
        tenantId: TENANT_ID,
        inboundEmailRowId: ROW_ID,
      }),
    ).rejects.toThrow(
      /inbound_body_retrieval_failed: provider returned empty body/,
    );

    expect(mock.updates[0]?.values).toMatchObject({
      body_retrieval_attempts: 1,
      body_retrieval_error: "provider returned empty body",
    });
    expect(mock.updates[0]?.values).not.toHaveProperty("body_retrieval_status");
  });

  it("records the attempt and throws on body retrieval failure so the step retries", async () => {
    const mock = createInboundClientMock(inboundRow());
    const provider = {
      apiKey: "re_test",
      fetchReceivedEmail: vi
        .fn()
        .mockResolvedValue({ success: false, error: "rate limited" }),
      fetchAttachments: vi.fn(),
    };

    await expect(
      retrieveInboundBody(mock.client, provider, {
        tenantId: TENANT_ID,
        inboundEmailRowId: ROW_ID,
      }),
    ).rejects.toThrow(/inbound_body_retrieval_failed/);

    expect(mock.updates[0]?.values).toMatchObject({
      body_retrieval_attempts: 1,
      body_retrieval_error: "rate limited",
    });
  });

  it("marks exhausted body retrieval failed while keeping the placeholder visible", async () => {
    const mock = createInboundClientMock(inboundRow());

    await markInboundBodyRetrievalFailed(mock.client, {
      inboundEmailRowId: ROW_ID,
    });

    expect(mock.updates[0]?.values).toEqual({
      body_retrieval_status: "failed",
    });
  });

  it("records attachment failures without blocking the workflow", async () => {
    const mock = createInboundClientMock(
      inboundRow({ body_retrieval_status: "available" }),
    );
    const provider = {
      apiKey: "re_test",
      fetchReceivedEmail: vi.fn(),
      fetchAttachments: vi
        .fn()
        .mockResolvedValue({ success: false, error: "boom" }),
    };

    const result = await listInboundAttachments(mock.client, provider, {
      tenantId: TENANT_ID,
      inboundEmailRowId: ROW_ID,
    });

    expect(result.status).toBe("failed");
    expect(mock.updates[0]?.values).toMatchObject({
      attachment_retrieval_status: "failed",
      attachment_retrieval_attempts: 1,
    });
  });

  it("never routes a placeholder without a retrieved body", async () => {
    const mock = createInboundClientMock(
      inboundRow({ body_retrieval_status: "pending" }),
    );
    const route = vi.fn();

    const result = await routeReadyInboundEmail(
      mock.client,
      { tenantId: TENANT_ID, inboundEmailRowId: ROW_ID },
      route,
    );

    expect(result.status).toBe("skipped_no_body");
    expect(route).not.toHaveBeenCalled();
  });

  it("never routes a placeholder marked available with empty content", async () => {
    const mock = createInboundClientMock(
      inboundRow({
        body_retrieval_status: "available",
        parsed_text: "",
        parsed_html: null,
      }),
    );
    const route = vi.fn();

    const result = await routeReadyInboundEmail(
      mock.client,
      { tenantId: TENANT_ID, inboundEmailRowId: ROW_ID },
      route,
    );

    expect(result.status).toBe("skipped_no_body");
    expect(route).not.toHaveBeenCalled();
  });

  it("prevents duplicate routing when a support message already exists", async () => {
    const mock = createInboundClientMock(
      inboundRow({
        body_retrieval_status: "available",
        support_message_id: "msg-1",
        conversation_id: "conv-1",
      }),
    );
    const route = vi.fn();

    const result = await routeReadyInboundEmail(
      mock.client,
      { tenantId: TENANT_ID, inboundEmailRowId: ROW_ID },
      route,
    );

    expect(result.status).toBe("already_routed");
    expect(result.messageId).toBe("msg-1");
    expect(route).not.toHaveBeenCalled();
  });

  it("recovers a lost bridge link instead of routing twice", async () => {
    // A previous run inserted the support message but lost the bridge write;
    // re-dispatch must backfill the link, never create a duplicate message.
    const mock = createInboundClientMock(
      inboundRow({ body_retrieval_status: "available" }),
      { supportMessage: { id: "msg-9", conversation_id: "conv-9" } },
    );
    const route = vi.fn();

    const result = await routeReadyInboundEmail(
      mock.client,
      { tenantId: TENANT_ID, inboundEmailRowId: ROW_ID },
      route,
    );

    expect(result).toMatchObject({
      status: "already_routed",
      conversationId: "conv-9",
      messageId: "msg-9",
    });
    expect(route).not.toHaveBeenCalled();
    expect(mock.updates[0]?.values).toEqual({
      conversation_id: "conv-9",
      support_message_id: "msg-9",
    });
  });

  it("throws when the recovery lookup fails instead of routing a duplicate", async () => {
    // A transport failure (or duplicate rows) in the recovery lookup must not
    // be treated as "not routed yet" — that would mint another support
    // message. The step throws so the run retries.
    const mock = createInboundClientMock(
      inboundRow({ body_retrieval_status: "available" }),
      { supportMessageError: { message: "connection reset" } },
    );
    const route = vi.fn();

    await expect(
      routeReadyInboundEmail(
        mock.client,
        { tenantId: TENANT_ID, inboundEmailRowId: ROW_ID },
        route,
      ),
    ).rejects.toThrow("inbound_recovery_lookup_failed");
    expect(route).not.toHaveBeenCalled();
  });

  it("throws when the bridge write fails so the step retries", async () => {
    const mock = createInboundClientMock(
      inboundRow({
        body_retrieval_status: "available",
        parsed_text: "Hello support",
      }),
      { updateError: { message: "boom" } },
    );
    const route = vi.fn().mockResolvedValue({
      status: "routed",
      conversationId: "conv-1",
      messageId: "msg-1",
      reason: "created a new Support Hub conversation.",
    });
    const resolveDecision = vi.fn().mockResolvedValue({
      kind: "inbox",
      inboxId: "inbox-1",
      source: "inbox_address",
    });

    await expect(
      routeReadyInboundEmail(
        mock.client,
        { tenantId: TENANT_ID, inboundEmailRowId: ROW_ID },
        route,
        resolveDecision,
      ),
    ).rejects.toThrow(/inbound_bridge_persist_failed/);
  });

  it("routes a ready inbound email and records the bridge ids", async () => {
    const mock = createInboundClientMock(
      inboundRow({
        body_retrieval_status: "available",
        parsed_text: "Hello support",
      }),
    );
    const route = vi.fn().mockResolvedValue({
      status: "routed",
      conversationId: "conv-1",
      messageId: "msg-1",
      reason: "created a new Support Hub conversation.",
    });
    const resolveDecision = vi.fn().mockResolvedValue({
      kind: "inbox",
      inboxId: "inbox-1",
      source: "inbox_address",
    });

    const result = await routeReadyInboundEmail(
      mock.client,
      { tenantId: TENANT_ID, inboundEmailRowId: ROW_ID },
      route,
      resolveDecision,
    );

    expect(result.status).toBe("routed");
    expect(route).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        bodyText: "Hello support",
        inboxId: "inbox-1",
      }),
    );
    expect(mock.updates[0]?.values).toEqual({
      conversation_id: "conv-1",
      support_message_id: "msg-1",
    });
  });
});

describe("staff inbound retry dispatch (#294)", () => {
  function createRetryClientMock(
    row: InboundEmailRow,
    acquireResult: { acquired: boolean; claim_id?: string },
  ) {
    const base = createInboundClientMock(row);
    (base.rpc as ReturnType<typeof vi.fn>).mockImplementation((fn: string) => {
      if (fn === "acquire_workflow_work_claim") {
        return Promise.resolve({ data: acquireResult, error: null });
      }
      return Promise.resolve({ data: true, error: null });
    });
    return base;
  }

  it("dispatches a retry through claims and the workflow ledger", async () => {
    const mock = createRetryClientMock(
      inboundRow({
        body_retrieval_status: "failed",
        body_retrieval_attempts: 4,
      }),
      { acquired: true, claim_id: CLAIM_ID },
    );
    const requestDispatch = vi.fn().mockResolvedValue({
      outcome: "dispatched",
      request: { id: "wdr-1" },
      reused: false,
      error: null,
    });

    const result = await requestInboundEmailRetryDispatch(
      { client: mock.client, requestDispatch },
      {
        tenantId: TENANT_ID,
        inboundEmailRowId: ROW_ID,
        kind: "body",
        requestedBy: "user-1",
      },
    );

    expect(result).toEqual({
      status: "retry_dispatched",
      dispatch: "dispatched",
    });
    expect(requestDispatch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        idempotencyKey: `inbound-email-retry/${ROW_ID}/body/attempt-4`,
        subject: { type: "email_inbound_message", id: ROW_ID },
      }),
    );
    expect(mock.rpc).toHaveBeenCalledWith(
      "release_workflow_work_claim",
      expect.objectContaining({ p_claim_id: CLAIM_ID }),
    );

    const dispatchInput = requestDispatch.mock.calls[0]?.[1] as {
      context: Record<string, unknown>;
    };
    const serialized = JSON.stringify(dispatchInput.context);
    expect(serialized).not.toMatch(/re_|signed|url|bytes/i);
  });

  it("leaves the failed status untouched when the handoff cannot be recorded", async () => {
    // The visible status flips only after the ledger write succeeds —
    // otherwise the row stays 'failed' and the staff Retry button remains.
    const mock = createRetryClientMock(
      inboundRow({ body_retrieval_status: "failed" }),
      { acquired: true, claim_id: CLAIM_ID },
    );
    const requestDispatch = vi
      .fn()
      .mockRejectedValue(new Error("ledger unavailable"));

    await expect(
      requestInboundEmailRetryDispatch(
        { client: mock.client, requestDispatch },
        {
          tenantId: TENANT_ID,
          inboundEmailRowId: ROW_ID,
          kind: "body",
          requestedBy: "user-1",
        },
      ),
    ).rejects.toThrow("ledger unavailable");

    const statusWrites = mock.updates.filter(
      (update) =>
        "body_retrieval_status" in update.values ||
        "attachment_retrieval_status" in update.values,
    );
    expect(statusWrites).toHaveLength(0);
    expect(mock.rpc).toHaveBeenCalledWith(
      "release_workflow_work_claim",
      expect.objectContaining({ p_claim_id: CLAIM_ID }),
    );
  });

  it("reuses the active retry instead of duplicating provider work", async () => {
    const mock = createRetryClientMock(
      inboundRow({ body_retrieval_status: "failed" }),
      { acquired: false },
    );
    const requestDispatch = vi.fn();

    const result = await requestInboundEmailRetryDispatch(
      { client: mock.client, requestDispatch },
      {
        tenantId: TENANT_ID,
        inboundEmailRowId: ROW_ID,
        kind: "body",
        requestedBy: "user-1",
      },
    );

    expect(result.status).toBe("active_retry_in_progress");
    expect(requestDispatch).not.toHaveBeenCalled();
  });

  it("reports not_needed when the body is already available", async () => {
    const mock = createRetryClientMock(
      inboundRow({ body_retrieval_status: "available" }),
      { acquired: true, claim_id: CLAIM_ID },
    );
    const requestDispatch = vi.fn();

    const result = await requestInboundEmailRetryDispatch(
      { client: mock.client, requestDispatch },
      {
        tenantId: TENANT_ID,
        inboundEmailRowId: ROW_ID,
        kind: "body",
        requestedBy: "user-1",
      },
    );

    expect(result.status).toBe("not_needed");
    expect(requestDispatch).not.toHaveBeenCalled();
  });
});
