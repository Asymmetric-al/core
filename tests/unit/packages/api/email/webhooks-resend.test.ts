import { type NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  verifyResendWebhookSignatureMock,
  getReceivedEmailMock,
  listReceivedEmailAttachmentsMock,
  getAdminClientMock,
  fromMock,
  upsertEmailEventsMock,
  insertEmailEventsMock,
  upsertSuppressionsMock,
  updateSendLogsMock,
  updateSendLogsEqFirstMock,
  updateSendLogsEqSecondMock,
  upsertInboundMock,
  emailSendLogsSelectMock,
  emailSendLogsSelectEqMock,
  emailSendLogsSelectLimitMock,
  tenantSettingsSelectMock,
  tenantSettingsEqMock,
  tenantSettingsIlikeMock,
} = vi.hoisted(() => {
  const upsertEmailEvents = vi
    .fn()
    .mockResolvedValue({ data: null, error: null });
  const insertEmailEvents = vi
    .fn()
    .mockResolvedValue({ data: null, error: null });
  const upsertSuppressions = vi
    .fn()
    .mockResolvedValue({ data: null, error: null });
  const upsertInbound = vi.fn().mockResolvedValue({ data: null, error: null });
  const emailSendLogsSelectLimit = vi
    .fn()
    .mockResolvedValue({ data: [], error: null });
  const emailSendLogsSelectEq = vi.fn(() => ({
    limit: emailSendLogsSelectLimit,
  }));
  const emailSendLogsSelect = vi.fn(() => ({ eq: emailSendLogsSelectEq }));
  const updateSendLogsEqSecond = vi
    .fn()
    .mockResolvedValue({ data: null, error: null });
  const updateSendLogsEqFirst = vi.fn(() => ({ eq: updateSendLogsEqSecond }));
  const updateSendLogs = vi.fn(() => ({ eq: updateSendLogsEqFirst }));
  const tenantSettingsIlike = vi
    .fn()
    .mockResolvedValue({ data: [], error: null });
  const tenantSettingsEq = vi.fn(() => ({ ilike: tenantSettingsIlike }));
  const tenantSettingsSelect = vi.fn(() => ({ eq: tenantSettingsEq }));

  const from = vi.fn((table: string) => {
    if (table === "email_events") {
      return {
        upsert: upsertEmailEvents,
        insert: insertEmailEvents,
      };
    }
    if (table === "email_suppressions") {
      return {
        upsert: upsertSuppressions,
      };
    }
    if (table === "email_send_logs") {
      return {
        select: emailSendLogsSelect,
        update: updateSendLogs,
      };
    }
    if (table === "email_inbound_messages") {
      return {
        upsert: upsertInbound,
      };
    }
    if (table === "tenant_email_settings") {
      return {
        select: tenantSettingsSelect,
      };
    }
    return {};
  });

  return {
    verifyResendWebhookSignatureMock: vi.fn(),
    getReceivedEmailMock: vi.fn(),
    listReceivedEmailAttachmentsMock: vi.fn(),
    getAdminClientMock: vi.fn(),
    fromMock: from,
    upsertEmailEventsMock: upsertEmailEvents,
    insertEmailEventsMock: insertEmailEvents,
    upsertSuppressionsMock: upsertSuppressions,
    updateSendLogsMock: updateSendLogs,
    updateSendLogsEqFirstMock: updateSendLogsEqFirst,
    updateSendLogsEqSecondMock: updateSendLogsEqSecond,
    upsertInboundMock: upsertInbound,
    emailSendLogsSelectMock: emailSendLogsSelect,
    emailSendLogsSelectEqMock: emailSendLogsSelectEq,
    emailSendLogsSelectLimitMock: emailSendLogsSelectLimit,
    tenantSettingsSelectMock: tenantSettingsSelect,
    tenantSettingsEqMock: tenantSettingsEq,
    tenantSettingsIlikeMock: tenantSettingsIlike,
  };
});

vi.mock("@asym/email", () => ({
  verifyResendWebhookSignature: verifyResendWebhookSignatureMock,
  getReceivedEmail: getReceivedEmailMock,
  listReceivedEmailAttachments: listReceivedEmailAttachmentsMock,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

import { POST } from "../../../../../packages/api/src/email/webhooks/resend";

function createWebhookRequest(payload: unknown): NextRequest {
  return new Request("https://example.com/api/email/webhooks/resend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "svix-id": "evt_1",
      "svix-timestamp": "1700000000",
      "svix-signature": "v1,test",
    },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  }) as NextRequest;
}

describe("api/email/webhooks/resend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
    process.env.RESEND_API_KEY = "re_test";
    getReceivedEmailMock.mockResolvedValue({
      success: true,
      data: { text: "body", html: "<p>body</p>" },
    });
    listReceivedEmailAttachmentsMock.mockResolvedValue({
      success: true,
      data: [],
    });
    emailSendLogsSelectLimitMock.mockResolvedValue({ data: [], error: null });
    tenantSettingsIlikeMock.mockResolvedValue({ data: [], error: null });
    getAdminClientMock.mockReturnValue({
      client: { from: fromMock },
      error: null,
    });
  });

  afterEach(() => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    delete process.env.RESEND_API_KEY;
  });

  it("returns 401 when webhook signature verification fails", async () => {
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: false,
      error: "invalid signature",
      errorCode: "webhook_signature_invalid",
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("webhook_signature_invalid");
  });

  it("returns 503 when webhook persistence is unavailable", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      getAdminClientMock.mockReturnValueOnce({
        client: null,
        error: "Admin client unavailable",
      });
      verifyResendWebhookSignatureMock.mockReturnValueOnce({
        success: true,
        event: {
          type: "email.delivered",
          created_at: "2026-02-23T10:00:00.000Z",
          data: {
            tenant_id: "tenant_direct",
            email_id: "msg_123",
          },
        },
      });

      const response = await POST(createWebhookRequest({ hello: "world" }));
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.code).toBe("webhook_persistence_unavailable");
      expect(body.accepted).toBe(false);
      expect(upsertEmailEventsMock).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("prefers payload tenant_id over metadata and tags", async () => {
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.delivered",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          tenant_id: "tenant_direct",
          metadata: {
            tenant_id: "tenant_metadata",
          },
          tags: [{ name: "tenant_id", value: "tenant_tag" }],
          resend_event_id: "evt_123",
          email_id: "msg_123",
          email: "recipient@example.com",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.accepted).toBe(true);
    expect(body.eventType).toBe("email.delivered");
    expect(body.tenantId).toBe("tenant_direct");
    expect(body.resolutionSource).toBe("payload");
    expect(emailSendLogsSelectMock).not.toHaveBeenCalled();
    expect(tenantSettingsSelectMock).not.toHaveBeenCalled();
    expect(upsertEmailEventsMock).toHaveBeenCalledTimes(1);
    expect(updateSendLogsMock).toHaveBeenCalledTimes(1);
    expect(updateSendLogsEqFirstMock).toHaveBeenCalledWith(
      "tenant_id",
      "tenant_direct",
    );
    expect(updateSendLogsEqSecondMock).toHaveBeenCalledWith(
      "resend_message_id",
      "msg_123",
    );
    expect(upsertSuppressionsMock).not.toHaveBeenCalled();
    expect(upsertInboundMock).not.toHaveBeenCalled();
    expect(insertEmailEventsMock).not.toHaveBeenCalled();
  });

  it("returns 503 when core event persistence fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      upsertEmailEventsMock.mockResolvedValueOnce({
        data: null,
        error: { code: "23505", message: "event write failed" },
      });
      verifyResendWebhookSignatureMock.mockReturnValueOnce({
        success: true,
        event: {
          type: "email.delivered",
          created_at: "2026-02-23T10:00:00.000Z",
          data: {
            tenant_id: "tenant_direct",
            resend_event_id: "evt_123",
            email_id: "msg_123",
            email: "recipient@example.com",
          },
        },
      });

      const response = await POST(createWebhookRequest({ hello: "world" }));
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.accepted).toBe(false);
      expect(body.code).toBe("webhook_persistence_failed");
      expect(body.operation).toBe("email_events.upsert");
      expect(updateSendLogsMock).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("falls back to email_send_logs tenant lookup for outbound events", async () => {
    emailSendLogsSelectLimitMock.mockResolvedValueOnce({
      data: [{ tenant_id: "tenant_lookup" }],
      error: null,
    });
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.delivered",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_lookup",
          email_id: "msg_lookup",
          email: "recipient@example.com",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tenantId).toBe("tenant_lookup");
    expect(body.resolutionSource).toBe("send_logs");
    expect(emailSendLogsSelectEqMock).toHaveBeenCalledWith(
      "resend_message_id",
      "msg_lookup",
    );
    expect(updateSendLogsEqFirstMock).toHaveBeenCalledWith(
      "tenant_id",
      "tenant_lookup",
    );
  });

  it("uses deterministic synthetic event ids when resend_event_id is missing", async () => {
    verifyResendWebhookSignatureMock.mockReturnValue({
      success: true,
      event: {
        type: "email.delivered",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          tenant_id: "tenant_direct",
          email_id: "msg_synthetic_1",
          email: "recipient@example.com",
        },
      },
    });

    const firstResponse = await POST(createWebhookRequest({ hello: "world" }));
    const secondResponse = await POST(createWebhookRequest({ hello: "world" }));
    const firstBody = await firstResponse.json();
    const secondBody = await secondResponse.json();

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(firstBody.accepted).toBe(true);
    expect(secondBody.accepted).toBe(true);
    expect(upsertEmailEventsMock).toHaveBeenCalledTimes(2);
    const firstEventPayload = upsertEmailEventsMock.mock.calls[0]?.[0] as
      | { resend_event_id?: string }
      | undefined;
    const secondEventPayload = upsertEmailEventsMock.mock.calls[1]?.[0] as
      | { resend_event_id?: string }
      | undefined;
    expect(firstEventPayload?.resend_event_id).toMatch(
      /^synthetic_[a-f0-9]{64}$/,
    );
    expect(secondEventPayload?.resend_event_id).toBe(
      firstEventPayload?.resend_event_id,
    );
    expect(insertEmailEventsMock).not.toHaveBeenCalled();
  });

  it("returns sorted candidate tenant ids for ambiguous outbound send-log lookup", async () => {
    emailSendLogsSelectLimitMock.mockResolvedValueOnce({
      data: [{ tenant_id: "tenant_z" }, { tenant_id: "tenant_a" }],
      error: null,
    });
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.delivered",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_outbound_ambiguous",
          email_id: "msg_outbound_ambiguous",
          email: "recipient@example.com",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.accepted).toBe(false);
    expect(body.code).toBe("tenant_resolution_ambiguous");
    expect(body.candidateTenantIds).toEqual(["tenant_a", "tenant_z"]);
    expect(upsertEmailEventsMock).not.toHaveBeenCalled();
    expect(updateSendLogsMock).not.toHaveBeenCalled();
  });

  it("returns 422 for outbound events when tenant cannot be resolved", async () => {
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.delivered",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_unresolved",
          email_id: "msg_unresolved",
          email: "recipient@example.com",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.accepted).toBe(false);
    expect(body.code).toBe("tenant_resolution_unresolved");
    expect(body.messageId).toBe("msg_unresolved");
    expect(upsertEmailEventsMock).not.toHaveBeenCalled();
    expect(insertEmailEventsMock).not.toHaveBeenCalled();
    expect(updateSendLogsMock).not.toHaveBeenCalled();
    expect(upsertSuppressionsMock).not.toHaveBeenCalled();
    expect(upsertInboundMock).not.toHaveBeenCalled();
  });

  it("returns 503 for retryable outbound tenant lookup failures", async () => {
    emailSendLogsSelectLimitMock.mockResolvedValueOnce({
      data: null,
      error: { message: "database unavailable" },
    });
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.delivered",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_lookup_error",
          email_id: "msg_lookup_error",
          email: "recipient@example.com",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.accepted).toBe(false);
    expect(body.code).toBe("tenant_resolution_dependency_unavailable");
    expect(upsertEmailEventsMock).not.toHaveBeenCalled();
  });

  it("resolves inbound tenant from recipient domain", async () => {
    tenantSettingsIlikeMock.mockResolvedValueOnce({
      data: [
        {
          tenant_id: "tenant_inbound",
          default_from_email: "noreply@one.org",
        },
      ],
      error: null,
    });
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.received",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_inbound",
          email_id: "inbound_1",
          from: "sender@example.com",
          to: ["Receiver <user@one.org>"],
          cc: [],
          bcc: [],
          subject: "hello",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tenantId).toBe("tenant_inbound");
    expect(body.resolutionSource).toBe("inbound_recipients");
    expect(tenantSettingsEqMock).toHaveBeenCalledWith("is_connected", true);
    expect(tenantSettingsIlikeMock).toHaveBeenCalledWith(
      "default_from_email",
      "%@one.org",
    );
    expect(upsertInboundMock).toHaveBeenCalledTimes(1);
    const firstUpsertCall = upsertInboundMock.mock.calls[0];
    expect(firstUpsertCall?.[0]).toMatchObject({
      tenant_id: "tenant_inbound",
      resend_email_id: "inbound_1",
    });
  });

  it("returns 202 for inbound events when tenant resolution is ambiguous", async () => {
    tenantSettingsIlikeMock.mockResolvedValueOnce({
      data: [
        {
          tenant_id: "tenant_a",
          default_from_email: "support@shared.org",
        },
        {
          tenant_id: "tenant_b",
          default_from_email: "noreply@shared.org",
        },
      ],
      error: null,
    });
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.received",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_inbound_ambiguous",
          email_id: "inbound_ambiguous_1",
          from: "sender@example.com",
          to: ["user@shared.org"],
          subject: "ambiguous",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.accepted).toBe(true);
    expect(body.tenantId).toBeNull();
    expect(body.tenantWarningCode).toBe("tenant_resolution_ambiguous");
    expect(body.candidateTenantIds).toEqual(["tenant_a", "tenant_b"]);
    expect(upsertEmailEventsMock).not.toHaveBeenCalled();
    expect(insertEmailEventsMock).not.toHaveBeenCalled();
    expect(upsertInboundMock).toHaveBeenCalledTimes(1);
    const firstUpsertCall = upsertInboundMock.mock.calls[0];
    expect(firstUpsertCall?.[0]).toMatchObject({
      tenant_id: null,
      resend_email_id: "inbound_ambiguous_1",
    });
  });

  it("returns 202 for inbound events when recipient domain is invalid", async () => {
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.received",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          email_id: "inbound_invalid_1",
          from: "sender@example.com",
          to: ["not-an-email"],
          subject: "invalid recipient",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.accepted).toBe(true);
    expect(body.tenantId).toBeNull();
    expect(body.tenantWarningCode).toBe("tenant_resolution_unresolved");
    expect(tenantSettingsSelectMock).not.toHaveBeenCalled();
    expect(upsertInboundMock).toHaveBeenCalledTimes(1);
    const firstUpsertCall = upsertInboundMock.mock.calls[0];
    expect(firstUpsertCall?.[0]).toMatchObject({
      tenant_id: null,
      resend_email_id: "inbound_invalid_1",
    });
  });

  it("keeps inbound processing alive when attachment listing fails", async () => {
    tenantSettingsIlikeMock.mockResolvedValueOnce({
      data: [
        {
          tenant_id: "tenant_inbound",
          default_from_email: "noreply@one.org",
        },
      ],
      error: null,
    });
    listReceivedEmailAttachmentsMock.mockRejectedValueOnce(new Error("boom"));
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.received",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_inbound_partial_1",
          email_id: "inbound_partial_1",
          from: "sender@example.com",
          to: ["user@one.org"],
          subject: "partial",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.receivedEmailLoaded).toBe(true);
    expect(body.attachmentsLoaded).toBe(false);
    expect(body.attachmentCount).toBe(0);
    expect(upsertInboundMock).toHaveBeenCalledTimes(1);
    const firstUpsertCall = upsertInboundMock.mock.calls[0];
    expect(firstUpsertCall?.[0]).toMatchObject({
      tenant_id: "tenant_inbound",
      resend_email_id: "inbound_partial_1",
      parsed_text: "body",
      attachment_count: 0,
    });
  });

  it("keeps inbound processing alive when email body retrieval fails", async () => {
    tenantSettingsIlikeMock.mockResolvedValueOnce({
      data: [
        {
          tenant_id: "tenant_inbound",
          default_from_email: "noreply@one.org",
        },
      ],
      error: null,
    });
    getReceivedEmailMock.mockRejectedValueOnce(new Error("boom"));
    listReceivedEmailAttachmentsMock.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: "att_1",
          filename: "doc.pdf",
          content_type: "application/pdf",
          download_url: "https://example.com/doc.pdf",
          expires_at: "2026-02-23T11:00:00.000Z",
        },
      ],
    });
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.received",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_inbound_partial_2",
          email_id: "inbound_partial_2",
          from: "sender@example.com",
          to: ["user@one.org"],
          subject: "partial",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.receivedEmailLoaded).toBe(false);
    expect(body.attachmentsLoaded).toBe(true);
    expect(body.attachmentCount).toBe(1);
    expect(upsertInboundMock).toHaveBeenCalledTimes(1);
    const firstUpsertCall = upsertInboundMock.mock.calls[0];
    expect(firstUpsertCall?.[0]).toMatchObject({
      tenant_id: "tenant_inbound",
      resend_email_id: "inbound_partial_2",
      parsed_text: null,
      attachment_count: 1,
    });
  });
});
