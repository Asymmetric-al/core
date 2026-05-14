import { afterEach, describe, expect, it } from "vitest";

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
      apiBaseUrl: "https://twenty.example.test/rest",
      workspaceId: "workspace-1",
      hasWebhookSecret: true,
      actor: {
        tenantId: "tenant-1",
        userId: "user-1",
        role: "staff",
      },
    });
    expect(JSON.stringify(status)).not.toContain("twenty-secret-key");
    expect(JSON.stringify(status)).not.toContain("twenty-webhook-secret");
  });
});
