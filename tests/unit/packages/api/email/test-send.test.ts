import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthContextMock,
  requireRoleMock,
  sendTestEmailMock,
  readTenantEmailSettingsMock,
  decryptResendApiKeyMock,
  getAdminClientMock,
  fromMock,
  insertMock,
} = vi.hoisted(() => {
  const insert = vi.fn().mockResolvedValue({ data: null, error: null });
  const from = vi.fn(() => ({ insert }));
  return {
    getAuthContextMock: vi.fn(),
    requireRoleMock: vi.fn(),
    sendTestEmailMock: vi.fn(),
    readTenantEmailSettingsMock: vi.fn(),
    decryptResendApiKeyMock: vi.fn(),
    getAdminClientMock: vi.fn(),
    fromMock: from,
    insertMock: insert,
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
    SENDER_NOT_VERIFIED: "sender_not_verified",
    SERVER_ERROR: "server_error",
  },
  sendTestEmail: sendTestEmailMock,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("../../../../../packages/api/src/email/settings-store", () => ({
  readTenantEmailSettings: readTenantEmailSettingsMock,
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
    getAuthContextMock.mockResolvedValue({
      tenantId: "tenant_1",
      role: "admin",
    });
    requireRoleMock.mockReturnValue(undefined);
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
    expect(sendTestEmailMock).toHaveBeenCalledWith(
      "re_stored_key",
      "recipient@example.com",
      "stored-from@example.com",
      "Stored Sender",
    );
    expect(insertMock).toHaveBeenCalledTimes(1);
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
});
