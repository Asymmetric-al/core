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
  routeInboundToSupportHubMock,
  requestWorkflowDispatchMock,
  serverEnvMock,
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
  const inboundSingle = vi
    .fn()
    .mockResolvedValue({ data: { id: "inbound-row-1" }, error: null });
  const inboundSelect = vi.fn(() => ({ single: inboundSingle }));
  const upsertInbound = vi.fn(() => ({ select: inboundSelect }));
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
  const serverEnv: {
    RESEND_API_KEY: string | undefined;
    RESEND_WEBHOOK_SECRET: string | undefined;
  } = {
    RESEND_API_KEY: "re_test",
    RESEND_WEBHOOK_SECRET: "whsec_test",
  };

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
    routeInboundToSupportHubMock: vi.fn(),
    requestWorkflowDispatchMock: vi.fn(),
    serverEnvMock: serverEnv,
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

vi.mock("@asym/env", () => ({
  serverEnv: serverEnvMock,
}));

vi.mock("@asym/api/admin/support-hub/inbound-router", () => ({
  routeInboundToSupportHub: routeInboundToSupportHubMock,
}));

vi.mock(
  "../../../../../packages/api/src/admin/support-hub/inbound-router",
  () => ({
    routeInboundToSupportHub: routeInboundToSupportHubMock,
  }),
);

vi.mock("../../../../../packages/api/src/workflows/ledger", async () => {
  const actual = await vi.importActual<
    typeof import("../../../../../packages/api/src/workflows/ledger")
  >("../../../../../packages/api/src/workflows/ledger");
  return {
    ...actual,
    requestWorkflowDispatch: requestWorkflowDispatchMock,
  };
});

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
    serverEnvMock.RESEND_WEBHOOK_SECRET = "whsec_test";
    serverEnvMock.RESEND_API_KEY = "re_test";
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
    routeInboundToSupportHubMock.mockResolvedValue({
      status: "skipped",
      conversationId: null,
      messageId: null,
      reason: "No Support Hub inbox matched the inbound recipients.",
    });
    requestWorkflowDispatchMock.mockResolvedValue({
      outcome: "dispatched",
      request: { id: "wdr-1" },
      reused: false,
      error: null,
    });
    getAdminClientMock.mockReturnValue({
      client: { from: fromMock },
      error: null,
    });
  });

  afterEach(() => {
    serverEnvMock.RESEND_WEBHOOK_SECRET = "whsec_test";
    serverEnvMock.RESEND_API_KEY = "re_test";
  });

  it("returns 503 when webhook verification secret is not configured", async () => {
    serverEnvMock.RESEND_WEBHOOK_SECRET = undefined;

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("webhook_verification_unconfigured");
    expect(verifyResendWebhookSignatureMock).not.toHaveBeenCalled();
  });

  it("returns 503 when Resend API access is not configured", async () => {
    serverEnvMock.RESEND_API_KEY = undefined;

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("resend_api_key_unconfigured");
    expect(verifyResendWebhookSignatureMock).not.toHaveBeenCalled();
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
      expect(insertEmailEventsMock).not.toHaveBeenCalled();
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
    expect(insertEmailEventsMock).toHaveBeenCalledTimes(1);
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
    expect(upsertEmailEventsMock).not.toHaveBeenCalled();
  });

  it("returns 503 when core event persistence fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      insertEmailEventsMock.mockResolvedValueOnce({
        data: null,
        error: { code: "XX000", message: "event write failed" },
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
      expect(body.error).toBe("Failed to persist Resend webhook event.");
      expect(body.correlationId).toEqual(expect.any(String));
      expect(body.operation).toBeUndefined();
      expect(body.messageId).toBeUndefined();
      expect(updateSendLogsMock).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("treats duplicate Resend event inserts as idempotent replays", async () => {
    insertEmailEventsMock.mockResolvedValueOnce({
      data: null,
      error: {
        code: "23505",
        message: "duplicate key value violates unique constraint",
      },
    });
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.delivered",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          tenant_id: "tenant_direct",
          resend_event_id: "evt_duplicate",
          email_id: "msg_duplicate",
          email: "recipient@example.com",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.accepted).toBe(true);
    expect(insertEmailEventsMock).toHaveBeenCalledTimes(1);
    expect(updateSendLogsMock).toHaveBeenCalledTimes(1);
    expect(upsertEmailEventsMock).not.toHaveBeenCalled();
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
    expect(insertEmailEventsMock).toHaveBeenCalledTimes(2);
    const firstEventPayload = insertEmailEventsMock.mock.calls[0]?.[0] as
      | { resend_event_id?: string }
      | undefined;
    const secondEventPayload = insertEmailEventsMock.mock.calls[1]?.[0] as
      | { resend_event_id?: string }
      | undefined;
    expect(firstEventPayload?.resend_event_id).toMatch(
      /^synthetic_[a-f0-9]{64}$/,
    );
    expect(secondEventPayload?.resend_event_id).toBe(
      firstEventPayload?.resend_event_id,
    );
    expect(upsertEmailEventsMock).not.toHaveBeenCalled();
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
    expect(insertEmailEventsMock).not.toHaveBeenCalled();
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
    expect(insertEmailEventsMock).not.toHaveBeenCalled();
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

  it("returns 503 for inbound events when tenant resolution is ambiguous", async () => {
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

    expect(response.status).toBe(503);
    expect(body.accepted).toBe(false);
    expect(body.code).toBe("tenant_resolution_ambiguous");
    expect(upsertEmailEventsMock).not.toHaveBeenCalled();
    expect(insertEmailEventsMock).not.toHaveBeenCalled();
    expect(getReceivedEmailMock).not.toHaveBeenCalled();
    expect(listReceivedEmailAttachmentsMock).not.toHaveBeenCalled();
    expect(upsertInboundMock).not.toHaveBeenCalled();
  });

  it("returns 503 for inbound events when recipient domain is invalid", async () => {
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

    expect(response.status).toBe(503);
    expect(body.accepted).toBe(false);
    expect(body.code).toBe("tenant_resolution_unresolved");
    expect(tenantSettingsSelectMock).not.toHaveBeenCalled();
    expect(getReceivedEmailMock).not.toHaveBeenCalled();
    expect(listReceivedEmailAttachmentsMock).not.toHaveBeenCalled();
    expect(upsertInboundMock).not.toHaveBeenCalled();
  });

  it("returns 503 for retryable inbound tenant lookup failures", async () => {
    tenantSettingsIlikeMock.mockResolvedValueOnce({
      data: null,
      error: { message: "database unavailable" },
    });
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.received",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_inbound_lookup_error",
          email_id: "inbound_lookup_error_1",
          from: "sender@example.com",
          to: ["user@one.org"],
          subject: "lookup failed",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.accepted).toBe(false);
    expect(body.code).toBe("tenant_resolution_dependency_unavailable");
    expect(getReceivedEmailMock).not.toHaveBeenCalled();
    expect(listReceivedEmailAttachmentsMock).not.toHaveBeenCalled();
    expect(upsertInboundMock).not.toHaveBeenCalled();
  });

  it("stores a metadata-only placeholder and dispatches the inbound workflow (#293)", async () => {
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
          resend_event_id: "evt_inbound_placeholder",
          email_id: "inbound_placeholder_1",
          from: "sender@example.com",
          to: ["user@one.org"],
          subject: "placeholder",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.accepted).toBe(true);
    expect(body.dispatch).toBe("dispatched");

    // The webhook never calls the provider for content; the placeholder
    // carries verified metadata only.
    expect(getReceivedEmailMock).not.toHaveBeenCalled();
    expect(listReceivedEmailAttachmentsMock).not.toHaveBeenCalled();
    expect(routeInboundToSupportHubMock).not.toHaveBeenCalled();

    expect(upsertInboundMock).toHaveBeenCalledTimes(1);
    const placeholder = upsertInboundMock.mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;
    expect(placeholder).toMatchObject({
      tenant_id: "tenant_inbound",
      resend_email_id: "inbound_placeholder_1",
    });
    expect(placeholder).not.toHaveProperty("parsed_text");
    expect(placeholder).not.toHaveProperty("parsed_html");
    expect(placeholder).not.toHaveProperty("attachment_count");
    // The workflow is the single writer of threading headers; a webhook
    // redelivery must not clobber the enriched values with placeholders.
    expect(placeholder).not.toHaveProperty("message_id_header");
    expect(placeholder).not.toHaveProperty("in_reply_to_header");
    expect(placeholder).not.toHaveProperty("references_headers");

    expect(requestWorkflowDispatchMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: "tenant_inbound",
        productArea: "email",
        subject: expect.objectContaining({ type: "email_inbound_message" }),
        idempotencyKey: "inbound-email/inbound_placeholder_1",
      }),
    );
  });

  it("acknowledges stored inbound events when immediate dispatch fails (#293)", async () => {
    tenantSettingsIlikeMock.mockResolvedValueOnce({
      data: [
        {
          tenant_id: "tenant_inbound",
          default_from_email: "noreply@one.org",
        },
      ],
      error: null,
    });
    requestWorkflowDispatchMock.mockResolvedValueOnce({
      outcome: "failed",
      request: { id: "wdr-1" },
      reused: false,
      error: "connect ECONNREFUSED",
    });
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.received",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_inbound_dispatch_fail",
          email_id: "inbound_dispatch_fail_1",
          from: "sender@example.com",
          to: ["user@one.org"],
          subject: "dispatch failure",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.accepted).toBe(true);
    expect(body.dispatch).toBe("failed");
  });

  it("lets the provider retry when the workflow handoff cannot be recorded (#293)", async () => {
    tenantSettingsIlikeMock.mockResolvedValueOnce({
      data: [
        {
          tenant_id: "tenant_inbound",
          default_from_email: "noreply@one.org",
        },
      ],
      error: null,
    });
    requestWorkflowDispatchMock.mockRejectedValueOnce(
      new Error("ledger unavailable"),
    );
    verifyResendWebhookSignatureMock.mockReturnValueOnce({
      success: true,
      event: {
        type: "email.received",
        created_at: "2026-02-23T10:00:00.000Z",
        data: {
          resend_event_id: "evt_inbound_no_ledger",
          email_id: "inbound_no_ledger_1",
          from: "sender@example.com",
          to: ["user@one.org"],
          subject: "no ledger",
        },
      },
    });

    const response = await POST(createWebhookRequest({ hello: "world" }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.accepted).toBe(false);
    expect(body.code).toBe("workflow_dispatch_unrecorded");
  });

  it("reuses the same handoff for duplicate inbound webhook replays (#293)", async () => {
    tenantSettingsIlikeMock.mockResolvedValue({
      data: [
        {
          tenant_id: "tenant_inbound",
          default_from_email: "noreply@one.org",
        },
      ],
      error: null,
    });
    requestWorkflowDispatchMock
      .mockResolvedValueOnce({
        outcome: "dispatched",
        request: { id: "wdr-1" },
        reused: false,
        error: null,
      })
      .mockResolvedValueOnce({
        outcome: "already_dispatched",
        request: { id: "wdr-1" },
        reused: true,
        error: null,
      });
    const inboundEvent = {
      type: "email.received",
      created_at: "2026-02-23T10:00:00.000Z",
      data: {
        resend_event_id: "evt_inbound_replay",
        email_id: "inbound_replay_1",
        from: "sender@example.com",
        to: ["user@one.org"],
        subject: "replay",
      },
    };
    verifyResendWebhookSignatureMock
      .mockReturnValueOnce({ success: true, event: inboundEvent })
      .mockReturnValueOnce({ success: true, event: inboundEvent });

    const first = await POST(createWebhookRequest({ hello: "world" }));
    const second = await POST(createWebhookRequest({ hello: "world" }));
    const secondBody = await second.json();

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(secondBody.dispatch).toBe("already_dispatched");

    const idempotencyKeys = requestWorkflowDispatchMock.mock.calls.map(
      ([, input]) => (input as { idempotencyKey: string }).idempotencyKey,
    );
    expect(idempotencyKeys).toEqual([
      "inbound-email/inbound_replay_1",
      "inbound-email/inbound_replay_1",
    ]);
  });
});
