import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

const expectedGiftFields = [
  "asymTenantId",
  "asymDonationId",
  "asymStagedGiftId",
  "donorId",
  "missionaryId",
  "fundId",
  "amountCents",
  "currencyCode",
  "stripePaymentIntentId",
  "stripeChargeId",
  "receiptStatus",
  "paymentStatus",
];

describe("Twenty CRM health proof", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns sanitized missing config without reading provider metadata", async () => {
    const fetchImpl = vi.fn();
    const { getTwentyCrmHealth } =
      await import("../../../../packages/api/src/crm/health");

    const health = await getTwentyCrmHealth({
      env: {},
      fetchImpl,
    });

    expect(health).toMatchObject({
      configured: false,
      metadataRead: {
        attempted: false,
        ok: false,
      },
      missing: ["TWENTY_API_URL", "TWENTY_API_KEY"],
      ok: false,
      status: "missing",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("reads metadata through Twenty server-side config and validates giftSummaries", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        data: [
          {
            namePlural: "giftSummaries",
            fields: expectedGiftFields.map((name) => ({ name })),
          },
          {
            namePlural: "people",
            fields: [],
          },
        ],
      }),
    );
    const { getTwentyCrmHealth } =
      await import("../../../../packages/api/src/crm/health");

    const health = await getTwentyCrmHealth({
      env: {
        TWENTY_API_KEY: "twenty-secret-key",
        TWENTY_API_URL: "https://api.twenty.com/rest",
        TWENTY_WEBHOOK_SECRET: "twenty-webhook-secret",
      },
      fetchImpl,
    });

    expect(health).toMatchObject({
      apiBaseUrlKind: "twenty_cloud_rest",
      configured: true,
      giftSummaries: {
        exists: true,
        missingFields: [],
      },
      hasWebhookSecret: true,
      metadataRead: {
        attempted: true,
        ok: true,
      },
      ok: true,
      status: "ready",
      workspaceConfigured: false,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.twenty.com/rest/metadata/objects",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(JSON.stringify(health)).not.toContain("twenty-secret-key");
    expect(JSON.stringify(health)).not.toContain("twenty-webhook-secret");
  });

  it("keeps the staging health route disabled in production target envs", async () => {
    process.env = {
      ...originalEnv,
      SKIP_ENV_VALIDATION: "1",
    };
    const { isTwentyCrmStagingHealthEnabled } =
      await import("../../../../packages/api/src/admin/crm/twenty-health");

    expect(
      isTwentyCrmStagingHealthEnabled({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        VERCEL_TARGET_ENV: "production",
      }),
    ).toBe(false);
    expect(
      isTwentyCrmStagingHealthEnabled({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
        VERCEL_TARGET_ENV: "staging",
      }),
    ).toBe(true);
    expect(
      isTwentyCrmStagingHealthEnabled({
        NODE_ENV: "development",
        VERCEL_ENV: undefined,
        VERCEL_TARGET_ENV: undefined,
      }),
    ).toBe(true);
  });
});
