import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthContextMock,
  requireRoleMock,
  sendTestEmailMock,
  validateResendApiKeyMock,
  getFirstBlockingDeliverabilityWarningMock,
  toTestSendBlockingErrorCodeMock,
  readTenantEmailSettingsMock,
  decryptResendApiKeyMock,
  getAdminClientMock,
  fromMock,
  insertMock,
  tenantEmailSettingsStorageUnavailableError,
} = vi.hoisted(() => {
  const insert = vi.fn().mockResolvedValue({ data: null, error: null });
  const from = vi.fn(() => ({ insert }));
  return {
    getAuthContextMock: vi.fn(),
    requireRoleMock: vi.fn(),
    sendTestEmailMock: vi.fn(),
    validateResendApiKeyMock: vi.fn(),
    getFirstBlockingDeliverabilityWarningMock: vi.fn(
      (
        warnings:
          | Array<{
              severity?: "info" | "warning" | "error";
            }>
          | undefined,
      ) => warnings?.find((warning) => warning.severity === "error"),
    ),
    toTestSendBlockingErrorCodeMock: vi.fn(
      (warning: { code: string }) =>
        warning.code === "DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED"
          ? "default_from_email_domain_not_verified"
          : "domain_not_authenticated",
    ),
    readTenantEmailSettingsMock: vi.fn(),
    decryptResendApiKeyMock: vi.fn(),
    getAdminClientMock: vi.fn(),
    fromMock: from,
    insertMock: insert,
    tenantEmailSettingsStorageUnavailableError: Object.assign(
      new Error("storage unavailable"),
      {
        name: "TenantEmailSettingsStorageUnavailableError",
        status: 503,
      },
    ),
  };
});

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireRole: requireRoleMock,
}));

vi.mock("@asym/email", () => ({
  RESEND_ERROR_CODES: {
    UNAUTHORIZED: "unauthorized",
    FORBIDDEN: "forbidden",
    RATE_LIMITED: "rate_limited",
    CONFLICT: "conflict",
    INVALID_EMAIL: "invalid_email",
    VALIDATION_ERROR: "validation_error",
    INVALID_API_KEY: "invalid_api_key",
    DOMAIN_NOT_AUTHENTICATED: "domain_not_authenticated",
    DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED:
      "default_from_email_domain_not_verified",
    SENDER_NOT_VERIFIED: "sender_not_verified",
    SERVER_ERROR: "server_error",
  },
  sendTestEmail: sendTestEmailMock,
  validateResendApiKey: validateResendApiKeyMock,
  getFirstBlockingDeliverabilityWarning:
    getFirstBlockingDeliverabilityWarningMock,
  toTestSendBlockingErrorCode: toTestSendBlockingErrorCodeMock,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("../../../../../packages/api/src/email/settings-store", () => ({
  readTenantEmailSettings: readTenantEmailSettingsMock,
  isTenantEmailSettingsStorageUnavailable: (error: unknown) =>
    error === tenantEmailSettingsStorageUnavailableError,
}));

vi.mock("../../../../../packages/api/src/email/crypto", () => ({
  decryptResendApiKey: decryptResendApiKeyMock,
}));

import { POST } from "../../../../../packages/api/src/email/test-send";

function createPostRequest(body: unknown): NextRequest {
  return new Request("https://example.com/api/email/test-send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("api/email/test-send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("uuid-1234");
    getAuthContextMock.mockResolvedValue({
      tenantId: "tenant_1",
      role: "admin",
    });
    requireRoleMock.mockReturnValue(undefined);
    validateResendApiKeyMock.mockResolvedValue({
      valid: true,
      warnings: [],
    });
    getAdminClientMock.mockReturnValue({
      client: { from: fromMock },
      error: null,
    });
  });

  it("uses stored encrypted key and persisted sender defaults", async () => {
    readTenantEmailSettingsMock.mockResolvedValueOnce({
      resend_api_key_encrypted: "encrypted",
      default_from_email: "stored-from@example.com",
      default_from_name: "Stored Sender",
    });
    decryptResendApiKeyMock.mockReturnValueOnce("re_stored_key");
    sendTestEmailMock.mockResolvedValueOnce({
      success: true,
      messageId: "msg_1",
      correlationId: "corr_1",
      recipientCount: 1,
    });

    const response = await POST(
      createPostRequest({
        toEmail: "recipient@example.com",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    const expectedIdempotencyKey = "test-send/tenant_1/uuid-1234";
    expect(sendTestEmailMock).toHaveBeenCalledWith(
      "re_stored_key",
      "recipient@example.com",
      "stored-from@example.com",
      "Stored Sender",
      expect.objectContaining({
        idempotencyKey: expectedIdempotencyKey,
      }),
    );
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotency_key: expectedIdempotencyKey,
      }),
    );
  });

  it("returns 400 when no API key is available", async () => {
    readTenantEmailSettingsMock.mockResolvedValueOnce(null);

    const response = await POST(
      createPostRequest({
        toEmail: "recipient@example.com",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Resend API key is required");
  });

  it("sends with explicit session values when persistence storage is unavailable", async () => {
    readTenantEmailSettingsMock.mockRejectedValueOnce(
      tenantEmailSettingsStorageUnavailableError,
    );
    sendTestEmailMock.mockResolvedValueOnce({
      success: true,
      messageId: "msg_2",
      correlationId: "corr_2",
      recipientCount: 1,
    });

    const response = await POST(
      createPostRequest({
        apiKey: "re_session_key",
        toEmail: "recipient@example.com",
        fromEmail: "session-from@example.com",
        fromName: "Session Sender",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(sendTestEmailMock).toHaveBeenCalledWith(
      "re_session_key",
      "recipient@example.com",
      "session-from@example.com",
      "Session Sender",
      expect.objectContaining({
        idempotencyKey: "test-send/tenant_1/uuid-1234",
      }),
    );
  });

  it("reuses the same idempotency key for the provider send and audit log write", async () => {
    readTenantEmailSettingsMock.mockResolvedValueOnce({
      resend_api_key_encrypted: "encrypted",
      default_from_email: "stored-from@example.com",
      default_from_name: "Stored Sender",
    });
    decryptResendApiKeyMock.mockReturnValueOnce("re_stored_key");
    sendTestEmailMock.mockResolvedValueOnce({
      success: true,
      messageId: "msg_1",
      correlationId: "corr_1",
      recipientCount: 1,
    });

    await POST(
      createPostRequest({
        toEmail: "recipient@example.com",
      }),
    );

    const sendIdempotencyKey =
      sendTestEmailMock.mock.calls[0]?.[4]?.idempotencyKey;
    const loggedIdempotencyKey = insertMock.mock.calls[0]?.[0]?.idempotency_key;

    expect(sendIdempotencyKey).toBe("test-send/tenant_1/uuid-1234");
    expect(loggedIdempotencyKey).toBe(sendIdempotencyKey);
  });

  it("surfaces audit-log persistence failures without turning a delivered email into a hard failure", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      readTenantEmailSettingsMock.mockResolvedValueOnce({
        resend_api_key_encrypted: "encrypted",
        default_from_email: "stored-from@example.com",
        default_from_name: "Stored Sender",
      });
      decryptResendApiKeyMock.mockReturnValueOnce("re_stored_key");
      sendTestEmailMock.mockResolvedValueOnce({
        success: true,
        messageId: "msg_1",
        correlationId: "corr_1",
        recipientCount: 1,
      });
      insertMock.mockResolvedValueOnce({
        data: null,
        error: { message: "insert failed" },
      });

      const response = await POST(
        createPostRequest({
          toEmail: "recipient@example.com",
        }),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.auditLogged).toBe(false);
      expect(body.warning).toContain("audit");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to persist Resend test email audit log",
        expect.objectContaining({
          tenantId: "tenant_1",
          correlationId: "corr_1",
          idempotencyKey: "test-send/tenant_1/uuid-1234",
          message: "insert failed",
        }),
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("blocks test sends when the from address is not on a verified Resend domain", async () => {
    readTenantEmailSettingsMock.mockRejectedValueOnce(
      tenantEmailSettingsStorageUnavailableError,
    );
    validateResendApiKeyMock.mockResolvedValueOnce({
      valid: true,
      warnings: [
        {
          code: "DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED",
          severity: "error",
          message:
            "conrad@globalfellowship.org does not use one of your exact verified Resend domains.",
        },
      ],
    });

    const response = await POST(
      createPostRequest({
        apiKey: "re_session_key",
        toEmail: "recipient@example.com",
        fromEmail: "conrad@globalfellowship.org",
        fromName: "Session Sender",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.code).toBe("default_from_email_domain_not_verified");
    expect(body.error).toContain("exact verified Resend domains");
    expect(sendTestEmailMock).not.toHaveBeenCalled();
  });

  it("falls back to a generic validation code for unknown blocking warnings", async () => {
    readTenantEmailSettingsMock.mockRejectedValueOnce(
      tenantEmailSettingsStorageUnavailableError,
    );
    validateResendApiKeyMock.mockResolvedValueOnce({
      valid: true,
      warnings: [
        {
          code: "TEST_BLOCKING_WARNING",
          severity: "error",
          message: "Blocked by a future deliverability rule.",
        },
      ],
    });

    const response = await POST(
      createPostRequest({
        apiKey: "re_session_key",
        toEmail: "recipient@example.com",
        fromEmail: "sender@example.com",
        fromName: "Session Sender",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.code).toBe("domain_not_authenticated");
    expect(body.error).toContain("future deliverability rule");
    expect(sendTestEmailMock).not.toHaveBeenCalled();
  });
});
