import { describe, expect, it, vi } from "vitest";

import {
  TWENTY_BATCH_SIZE,
  TWENTY_RATE_LIMIT_RPM,
  TwentyCoreClient,
} from "../../../../packages/api/src/crm/client/core";
import { resolveTwentyRuntimeConfig } from "../../../../packages/api/src/crm/client/config";

describe("Twenty CRM client wrappers", () => {
  it("resolves server-only Twenty configuration without exposing the API key", () => {
    const config = resolveTwentyRuntimeConfig({
      TWENTY_API_URL: "https://twenty.example.test",
      TWENTY_API_KEY: "twenty-secret-key",
      TWENTY_WEBHOOK_SECRET: "twenty-webhook-secret",
      TWENTY_WORKSPACE_ID: "workspace-1",
      TWENTY_RATE_LIMIT_RPM: 42,
    });

    expect(config).toMatchObject({
      configured: true,
      apiBaseUrl: "https://twenty.example.test",
      workspaceId: "workspace-1",
      rateLimitRpm: 42,
      hasWebhookSecret: true,
    });
    expect(JSON.stringify(config)).not.toContain("twenty-secret-key");
    expect(JSON.stringify(config)).not.toContain("twenty-webhook-secret");
  });

  it("reports missing API URL or key as unconfigured", () => {
    expect(resolveTwentyRuntimeConfig({ TWENTY_API_URL: undefined })).toEqual({
      configured: false,
      missing: ["TWENTY_API_URL", "TWENTY_API_KEY"],
      rateLimitRpm: TWENTY_RATE_LIMIT_RPM,
    });
  });

  it("attaches authorization headers and parses JSON responses", async () => {
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        expect(headers.get("authorization")).toBe("Bearer twenty-secret-key");
        expect(headers.get("content-type")).toBe("application/json");
        return Response.json({ data: [{ id: "person-1" }] });
      },
    );
    const client = new TwentyCoreClient({
      apiBaseUrl: "https://twenty.example.test/rest",
      apiKey: "twenty-secret-key",
      fetchImpl,
    });

    await expect(
      client.request({
        method: "GET",
        path: "/people",
        query: { limit: "1" },
      }),
    ).resolves.toEqual({ data: [{ id: "person-1" }] });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://twenty.example.test/rest/people?limit=1",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("retries transient safe requests", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ error: "temporary" }, { status: 503 }),
      )
      .mockResolvedValueOnce(Response.json({ data: [] }));
    const client = new TwentyCoreClient({
      apiBaseUrl: "https://twenty.example.test/rest",
      apiKey: "twenty-secret-key",
      fetchImpl,
    });

    await expect(
      client.request({
        method: "GET",
        path: "/people",
      }),
    ).resolves.toEqual({ data: [] });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("requires idempotency keys before retrying non-idempotent requests", async () => {
    const client = new TwentyCoreClient({
      apiBaseUrl: "https://twenty.example.test/rest",
      apiKey: "twenty-secret-key",
      fetchImpl: vi.fn(),
    });

    await expect(
      client.request({
        method: "POST",
        path: "/people",
        body: { name: "Ada" },
        retry: { retries: 1 },
      }),
    ).rejects.toThrow(/idempotency/i);
  });

  it("chunks batch create operations at the documented Twenty batch size", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ data: [] }));
    const client = new TwentyCoreClient({
      apiBaseUrl: "https://twenty.example.test/rest",
      apiKey: "twenty-secret-key",
      fetchImpl,
    });

    await client.batchCreateRecords({
      objectName: "people",
      records: Array.from({ length: TWENTY_BATCH_SIZE + 1 }, (_, index) => ({
        name: `Person ${index}`,
      })),
      idempotencyKeyPrefix: "phase-01-test",
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
