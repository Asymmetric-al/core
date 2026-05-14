import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

const actor = {
  action: "crm.gateway.read",
  authTenantId: "tenant-1",
  isSuperAdmin: false,
  profileId: "profile-1",
  role: "staff",
  tenantId: "tenant-1",
  userId: "user-1",
} as const;

describe("CRM gateway", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("lets a non-production staff actor call the CRM gateway without exposing credentials", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      SKIP_ENV_VALIDATION: "1",
    };

    const { getCrmGatewayStatus } =
      await import("../../../../packages/api/src/crm/gateway");

    const status = await getCrmGatewayStatus({
      actor,
      env: {
        TWENTY_API_URL: "https://twenty.example.test/rest",
        TWENTY_API_KEY: "twenty-secret-key",
        TWENTY_WORKSPACE_ID: "workspace-1",
        TWENTY_WEBHOOK_SECRET: "twenty-webhook-secret",
      },
      requestId: "request-1",
    });

    expect(status).toMatchObject({
      configured: true,
      enabled: true,
      mode: "ready",
      requestId: "request-1",
      apiBaseUrlKind: "custom_rest",
      workspaceConfigured: true,
      hasWebhookSecret: true,
      actor: {
        tenantId: "tenant-1",
        userId: "user-1",
        role: "staff",
      },
    });
    expect(JSON.stringify(status)).not.toContain("https://twenty.example.test");
    expect(JSON.stringify(status)).not.toContain("twenty-secret-key");
    expect(JSON.stringify(status)).not.toContain("twenty-webhook-secret");
  });

  it("returns safe missing and malformed states without probing Twenty", async () => {
    const { getCrmGatewayStatus } =
      await import("../../../../packages/api/src/crm/gateway");

    await expect(
      getCrmGatewayStatus({
        actor,
        env: {},
        fetchImpl: vi.fn(),
        probe: true,
      }),
    ).resolves.toMatchObject({
      configured: false,
      mode: "missing_config",
      missing: ["TWENTY_API_URL", "TWENTY_API_KEY"],
    });

    const invalid = await getCrmGatewayStatus({
      actor,
      env: {
        TWENTY_API_KEY: "twenty-secret-key",
        TWENTY_API_URL: "https://api.twenty.com",
      },
      probe: true,
    });

    expect(invalid).toMatchObject({
      configured: false,
      mode: "degraded",
      missing: [],
      invalid: [
        {
          key: "TWENTY_API_URL",
          reason: "missing_rest_path",
        },
      ],
    });
    expect(JSON.stringify(invalid)).not.toContain("twenty-secret-key");
  });

  it("reports provider errors without leaking configured values", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ message: "bad key" }, { status: 401 }),
    );
    const { getCrmGatewayStatus } =
      await import("../../../../packages/api/src/crm/gateway");

    const status = await getCrmGatewayStatus({
      actor,
      env: {
        TWENTY_API_KEY: "twenty-secret-key",
        TWENTY_API_URL: "https://api.twenty.com/rest",
      },
      fetchImpl,
      probe: true,
    });

    expect(status).toMatchObject({
      configured: true,
      mode: "provider_error",
      apiBaseUrlKind: "twenty_cloud_rest",
      probe: {
        ok: false,
        status: 401,
      },
    });
    expect(JSON.stringify(status)).not.toContain("https://api.twenty.com/rest");
    expect(JSON.stringify(status)).not.toContain("twenty-secret-key");
  });
});
