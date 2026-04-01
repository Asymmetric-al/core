import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthContextMock,
  requireRoleMock,
  validateResendApiKeyMock,
  encryptResendApiKeyMock,
  decryptResendApiKeyMock,
  readTenantEmailSettingsMock,
  upsertTenantEmailSettingsMock,
  disconnectTenantEmailSettingsMock,
  tenantEmailSettingsStorageUnavailableError,
} = vi.hoisted(() => ({
  getAuthContextMock: vi.fn(),
  requireRoleMock: vi.fn(),
  validateResendApiKeyMock: vi.fn(),
  encryptResendApiKeyMock: vi.fn(),
  decryptResendApiKeyMock: vi.fn(),
  readTenantEmailSettingsMock: vi.fn(),
  upsertTenantEmailSettingsMock: vi.fn(),
  disconnectTenantEmailSettingsMock: vi.fn(),
  tenantEmailSettingsStorageUnavailableError: Object.assign(
    new Error("storage unavailable"),
    {
      name: "TenantEmailSettingsStorageUnavailableError",
      status: 503,
    },
  ),
}));

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
    INVALID_API_KEY: "invalid_api_key",
    VALIDATION_ERROR: "validation_error",
    SERVER_ERROR: "server_error",
  },
  validateResendApiKey: validateResendApiKeyMock,
}));

vi.mock("../../../../../packages/api/src/email/crypto", () => ({
  encryptResendApiKey: encryptResendApiKeyMock,
  decryptResendApiKey: decryptResendApiKeyMock,
}));

vi.mock("../../../../../packages/api/src/email/settings-store", () => ({
  readTenantEmailSettings: readTenantEmailSettingsMock,
  upsertTenantEmailSettings: upsertTenantEmailSettingsMock,
  disconnectTenantEmailSettings: disconnectTenantEmailSettingsMock,
  isTenantEmailSettingsStorageUnavailable: (error: unknown) =>
    error === tenantEmailSettingsStorageUnavailableError,
}));

import {
  DELETE,
  GET,
  POST,
} from "../../../../../packages/api/src/email/connect";

function createPostRequest(body: unknown): NextRequest {
  return new Request("https://example.com/api/email/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("api/email/connect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthContextMock.mockResolvedValue({
      tenantId: "tenant_1",
      role: "admin",
    });
    requireRoleMock.mockReturnValue(undefined);
  });

  it("persists validated Resend connection settings", async () => {
    validateResendApiKeyMock.mockResolvedValueOnce({
      valid: true,
      senderIdentities: [
        {
          id: 1,
          nickname: "default",
          from_email: "a@b.com",
          from_name: "A",
          reply_to_email: null,
          verified: true,
        },
      ],
      domainAuthentication: [
        { id: 1, domain: "example.com", subdomain: null, valid: true },
      ],
      deliverabilityScore: 100,
      warnings: [],
    });
    encryptResendApiKeyMock.mockReturnValueOnce("encrypted-key");
    upsertTenantEmailSettingsMock.mockResolvedValueOnce({});

    const response = await POST(
      createPostRequest({
        apiKey: "re_live_1234",
        defaultFromEmail: "from@example.com",
        defaultFromName: "From Team",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(upsertTenantEmailSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant_1",
        encryptedApiKey: "encrypted-key",
        defaultFromEmail: "from@example.com",
      }),
    );
  });

  it("hydrates disconnected state when settings do not exist", async () => {
    readTenantEmailSettingsMock.mockResolvedValueOnce(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.connected).toBe(false);
  });

  it("disconnects tenant integration and clears persisted key", async () => {
    disconnectTenantEmailSettingsMock.mockResolvedValueOnce({});

    const response = await DELETE();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.connected).toBe(false);
    expect(disconnectTenantEmailSettingsMock).toHaveBeenCalledWith("tenant_1");
  });

  it("returns disconnected session-only state when persistence storage is unavailable", async () => {
    readTenantEmailSettingsMock.mockRejectedValueOnce(
      tenantEmailSettingsStorageUnavailableError,
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.connected).toBe(false);
    expect(body.persisted).toBe(false);
    expect(body.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "EMAIL_SETTINGS_STORAGE_UNAVAILABLE",
        }),
      ]),
    );
  });

  it("validates and returns a session-only connection when persistence storage is unavailable", async () => {
    validateResendApiKeyMock.mockResolvedValueOnce({
      valid: true,
      senderIdentities: [],
      domainAuthentication: [],
      deliverabilityScore: 88,
      warnings: [],
    });
    encryptResendApiKeyMock.mockReturnValueOnce("encrypted-key");
    upsertTenantEmailSettingsMock.mockRejectedValueOnce(
      tenantEmailSettingsStorageUnavailableError,
    );

    const response = await POST(
      createPostRequest({
        apiKey: "re_live_1234",
        defaultFromEmail: "from@example.com",
        defaultFromName: "From Team",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.persisted).toBe(false);
    expect(body.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "EMAIL_SETTINGS_STORAGE_UNAVAILABLE",
        }),
      ]),
    );
  });
});
