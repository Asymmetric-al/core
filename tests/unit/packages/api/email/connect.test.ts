import { type NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("@asym/email", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@asym/email")>();

  return {
    ...actual,
    validateResendApiKey: validateResendApiKeyMock,
  };
});

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
    vi.useRealTimers();
    getAuthContextMock.mockResolvedValue({
      tenantId: "tenant_1",
      role: "admin",
    });
    requireRoleMock.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("persists validated Resend connection settings", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-02T12:00:00.000Z"));

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
        {
          id: 1,
          domain: "example.com",
          subdomain: null,
          valid: true,
          records: [
            {
              record: "SPF",
              type: "TXT",
              name: "send",
              value: '"v=spf1 include:amazonses.com ~all"',
              status: "verified",
            },
            {
              record: "DKIM",
              type: "TXT",
              name: "resend._domainkey",
              value: "p=abc123",
              status: "verified",
            },
          ],
        },
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
    expect(body.sendReady).toBe(true);
    expect(body.validatedAt).toBe("2026-04-02T12:00:00.000Z");
    expect(upsertTenantEmailSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant_1",
        encryptedApiKey: "encrypted-key",
        defaultFromEmail: "from@example.com",
        domainAuthenticated: true,
        dkimVerified: true,
        spfVerified: true,
        validationSnapshot: expect.objectContaining({
          validatedAt: expect.any(String),
          domainAuthenticated: true,
          dkimVerified: true,
          spfVerified: true,
          deliverabilityScore: 100,
        }),
      }),
    );

    vi.useRealTimers();
  });

  it("hydrates disconnected state when settings do not exist", async () => {
    readTenantEmailSettingsMock.mockResolvedValueOnce(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.connected).toBe(false);
    expect(body.sendReady).toBe(false);
  });

  it("hydrates disconnected persisted sender defaults when settings were previously configured", async () => {
    readTenantEmailSettingsMock.mockResolvedValueOnce({
      is_connected: false,
      resend_api_key_encrypted: null,
      resend_api_key_hint: null,
      default_from_email: "saved-from@example.com",
      default_from_name: "Saved Sender",
      reply_to_email: "reply@example.com",
      deliverability_score: null,
      validation_snapshot: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.connected).toBe(false);
    expect(body.sendReady).toBe(false);
    expect(body.defaultFromEmail).toBe("saved-from@example.com");
    expect(body.defaultFromName).toBe("Saved Sender");
    expect(body.replyToEmail).toBe("reply@example.com");
    expect(validateResendApiKeyMock).not.toHaveBeenCalled();
  });

  it("hydrates persisted connected state from the stored validation snapshot without revalidating against Resend on GET", async () => {
    readTenantEmailSettingsMock.mockResolvedValueOnce({
      is_connected: true,
      resend_api_key_encrypted: "encrypted-key",
      resend_api_key_hint: "1234",
      default_from_email: "from@example.com",
      default_from_name: "From Team",
      reply_to_email: "reply@example.com",
      deliverability_score: 91,
      validation_snapshot: {
        senderIdentities: [
          {
            id: 1,
            nickname: "default",
            from_email: "from@example.com",
            from_name: "From Team",
            reply_to_email: "reply@example.com",
            verified: true,
          },
        ],
        domainAuthentication: [
          {
            id: 1,
            domain: "example.com",
            subdomain: null,
            valid: true,
            records: [
              {
                record: "SPF",
                type: "TXT",
                name: "send",
                value: '"v=spf1 include:amazonses.com ~all"',
                status: "verified",
              },
            ],
          },
        ],
        warnings: [],
        deliverabilityScore: 91,
        validatedAt: "2026-04-02T12:00:00.000Z",
        domainAuthenticated: true,
        dkimVerified: false,
        spfVerified: true,
      },
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.connected).toBe(true);
    expect(body.apiKeyHint).toBe("1234");
    expect(body.defaultFromEmail).toBe("from@example.com");
    expect(body.defaultFromName).toBe("From Team");
    expect(body.replyToEmail).toBe("reply@example.com");
    expect(body.deliverabilityScore).toBe(91);
    expect(body.validatedAt).toBe("2026-04-02T12:00:00.000Z");
    expect(body.sendReady).toBe(true);
    expect(body.senderIdentities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from_email: "from@example.com",
        }),
      ]),
    );
    expect(body.domainAuthentication).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          domain: "example.com",
        }),
      ]),
    );
    expect(validateResendApiKeyMock).not.toHaveBeenCalled();
    expect(decryptResendApiKeyMock).not.toHaveBeenCalled();
  });

  it("marks legacy connected rows without a validation snapshot as requiring revalidation", async () => {
    readTenantEmailSettingsMock.mockResolvedValueOnce({
      is_connected: true,
      resend_api_key_encrypted: "encrypted-key",
      resend_api_key_hint: "1234",
      default_from_email: "from@example.com",
      default_from_name: "From Team",
      reply_to_email: "reply@example.com",
      deliverability_score: 91,
      validation_snapshot: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.connected).toBe(true);
    expect(body.sendReady).toBe(false);
    expect(body.senderIdentities).toBeUndefined();
    expect(body.domainAuthentication).toBeUndefined();
    expect(body.deliverabilityScore).toBeUndefined();
    expect(body.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "RESEND_CONNECTION_REQUIRES_REVALIDATION",
        }),
      ]),
    );
    expect(validateResendApiKeyMock).not.toHaveBeenCalled();
  });

  it("disconnects tenant integration and clears persisted key", async () => {
    disconnectTenantEmailSettingsMock.mockResolvedValueOnce({});

    const response = await DELETE();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.connected).toBe(false);
    expect(body.sendReady).toBe(false);
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
    expect(body.sendReady).toBe(false);
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
      domainAuthentication: [
        {
          id: 1,
          domain: "example.com",
          subdomain: null,
          valid: true,
        },
      ],
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
    expect(body.sendReady).toBe(true);
    expect(body.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "EMAIL_SETTINGS_STORAGE_UNAVAILABLE",
        }),
      ]),
    );
  });

  it("rejects a default sender on an unverified domain before persisting", async () => {
    validateResendApiKeyMock.mockResolvedValueOnce({
      valid: true,
      senderIdentities: [],
      domainAuthentication: [
        { id: 1, domain: "asymmetric.al", subdomain: null, valid: true },
      ],
      deliverabilityScore: 100,
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
        apiKey: "re_live_1234",
        defaultFromEmail: "conrad@globalfellowship.org",
        defaultFromName: "From Team",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error).toContain("exact verified Resend domains");
    expect(upsertTenantEmailSettingsMock).not.toHaveBeenCalled();
  });
});
