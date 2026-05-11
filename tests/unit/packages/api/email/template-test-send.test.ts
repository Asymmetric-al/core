import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthContextMock,
  requireRoleMock,
  readTenantEmailSettingsMock,
  decryptResendApiKeyMock,
  validateResendApiKeyMock,
  getFirstBlockingDeliverabilityWarningMock,
  toTestSendBlockingErrorCodeMock,
  sendEmailMock,
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
    readTenantEmailSettingsMock: vi.fn(),
    decryptResendApiKeyMock: vi.fn(),
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
      (warning: { code: string }) => warning.code,
    ),
    sendEmailMock: vi.fn(),
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

vi.mock("@asym/email", async () => {
  const actual =
    await vi.importActual<typeof import("@asym/email")>("@asym/email");
  return {
    ...actual,
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
    sendEmail: sendEmailMock,
    validateResendApiKey: validateResendApiKeyMock,
    getFirstBlockingDeliverabilityWarning:
      getFirstBlockingDeliverabilityWarningMock,
    toTestSendBlockingErrorCode: toTestSendBlockingErrorCodeMock,
  };
});

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

vi.mock("../../../../../packages/api/src/email/template-store", () => ({
  requireEmailTemplate: vi.fn(),
  listEmailTemplateVersions: vi.fn(),
}));

import { POST } from "../../../../../packages/api/src/email/template-test-send";

function createRequest(body: unknown): NextRequest {
  return new Request("https://example.com/api/email/templates/test-send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("api/email/templates/test-send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("uuid-1234");
    getAuthContextMock.mockResolvedValue({
      tenantId: "tenant_1",
      profileId: "profile_1",
      role: "admin",
    });
    requireRoleMock.mockReturnValue(undefined);
    readTenantEmailSettingsMock.mockResolvedValue({
      resend_api_key_encrypted: "encrypted",
      default_from_email: "from@example.com",
      default_from_name: "From Team",
      reply_to_email: "reply@example.com",
    });
    decryptResendApiKeyMock.mockReturnValue("re_stored_key");
    validateResendApiKeyMock.mockResolvedValue({
      valid: true,
      warnings: [],
    });
    sendEmailMock.mockResolvedValue({
      success: true,
      messageId: "msg_1",
      correlationId: "corr_1",
    });
    getAdminClientMock.mockReturnValue({
      client: { from: fromMock },
      error: null,
    });
  });

  it("sends the current edited template content through Resend", async () => {
    const response = await POST(
      createRequest({
        toEmail: "recipient@example.com",
        subject: "Hello {{first_name}}",
        builder: "react_email",
        builderVersion: "1.3.8",
        designJson: { type: "doc", content: [] },
        html: "<p>Hello {{first_name}}</p>",
        text: "Hello {{first_name}}",
        sampleMergeTags: { first_name: "Jordan" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(sendEmailMock).toHaveBeenCalledWith(
      "re_stored_key",
      expect.objectContaining({
        subject: "Hello {{first_name}}",
        html: "<p>Hello Jordan</p>",
        text: "Hello Jordan",
        idempotencyKey: "template-test-send/tenant_1/draft/uuid-1234",
        customArgs: expect.objectContaining({
          source: "email_studio_template_test_send",
          builder: "react_email",
        }),
      }),
    );
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: "tenant_1",
        template_builder: "react_email",
        metadata: expect.objectContaining({
          source: "email_studio_template_test_send",
          mergeTags: ["first_name"],
        }),
      }),
    );
  });
});
