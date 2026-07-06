import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getTwentyCrmHealthMock } = vi.hoisted(() => ({
  getTwentyCrmHealthMock: vi.fn(),
}));

vi.mock("../../../../../packages/api/src/crm/health", () => ({
  getTwentyCrmHealth: getTwentyCrmHealthMock,
}));

import { GET } from "../../../../../packages/api/src/health/crm";

function createRequest(headers?: HeadersInit): NextRequest {
  return new Request("https://example.com/api/health/crm", {
    headers,
  }) as NextRequest;
}

const readyHealth = {
  apiBaseUrlKind: "twenty_cloud_rest" as const,
  configured: true as const,
  giftSummaries: {
    exists: true,
    missingFields: ["internalAmountMicros", "internalDonorLookup"],
  },
  hasWebhookSecret: true,
  metadataRead: { attempted: true as const, ok: true },
  objectInventory: {
    count: 3,
    names: ["customRevenueObject", "giftSummaries", "people"],
  },
  ok: true,
  repoExpectedObjects: ["giftSummaries", "customRevenueObject"],
  status: "ready" as const,
  workspaceConfigured: true,
};

const providerErrorHealth = {
  apiBaseUrlKind: "custom_rest" as const,
  configured: true as const,
  giftSummaries: {
    exists: false,
    missingFields: ["internalAmountMicros", "internalDonorLookup"],
  },
  hasWebhookSecret: false,
  metadataRead: { attempted: true as const, ok: false, status: 502 },
  objectInventory: {
    count: 0,
    names: [] as string[],
  },
  ok: false as const,
  repoExpectedObjects: ["giftSummaries", "customRevenueObject"],
  status: "provider_error" as const,
  workspaceConfigured: false,
};

const missingHealth = {
  configured: false as const,
  invalid: [] as never[],
  metadataRead: { attempted: false as const, ok: false as const },
  missing: ["TWENTY_API_URL", "TWENTY_API_KEY"],
  ok: false as const,
  status: "missing" as const,
};

describe("api/health/crm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CRON_SECRET;
  });

  it("returns 200 with a sanitized ready payload when the CRM is healthy", async () => {
    getTwentyCrmHealthMock.mockResolvedValue(readyHealth);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.status).toBe("ready");
    expect(body.ok).toBe(true);
    expect(body.giftSummaries).toEqual({
      exists: true,
      missingFieldCount: 2,
    });
    expect(body.giftSummaries.missingFields).toBeUndefined();
    expect(body.repoExpectedObjects).toBeUndefined();
    // Inventory is collapsed for a prod-reachable endpoint: never dump the raw object-name list.
    expect(body.objectInventory).toEqual({
      count: 3,
      includesGiftSummaries: true,
    });
    expect(body.objectInventory.names).toBeUndefined();
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("internalAmountMicros");
    expect(serialized).not.toContain("internalDonorLookup");
    expect(serialized).not.toContain("customRevenueObject");
    expect(serialized).not.toContain("people");
    expect(typeof body.requestId).toBe("string");
    expect(body.requestId.length).toBeGreaterThan(0);
  });

  it("returns 503 with a sanitized configured provider-error payload", async () => {
    getTwentyCrmHealthMock.mockResolvedValue(providerErrorHealth);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.status).toBe("provider_error");
    expect(body.ok).toBe(false);
    expect(body.giftSummaries).toEqual({
      exists: false,
      missingFieldCount: 2,
    });
    expect(body.giftSummaries.missingFields).toBeUndefined();
    expect(body.objectInventory).toEqual({
      count: 0,
      includesGiftSummaries: false,
    });
    expect(body.repoExpectedObjects).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain("customRevenueObject");
  });

  it("returns 503 when the CRM health check is not ok", async () => {
    getTwentyCrmHealthMock.mockResolvedValue(missingHealth);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.status).toBe("missing");
    expect(body.ok).toBe(false);
    // Not configured => no inventory block leaks.
    expect(body.objectInventory).toBeUndefined();
    expect(typeof body.requestId).toBe("string");
  });

  it("returns 401 when CRON_SECRET is set and the bearer token is missing", async () => {
    process.env.CRON_SECRET = "secret";

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(getTwentyCrmHealthMock).not.toHaveBeenCalled();
  });

  it("returns 401 when CRON_SECRET is set and the bearer token is wrong", async () => {
    process.env.CRON_SECRET = "secret";

    const response = await GET(
      createRequest({ authorization: "Bearer wrong" }),
    );

    expect(response.status).toBe(401);
    expect(getTwentyCrmHealthMock).not.toHaveBeenCalled();
  });

  it("runs the health check when CRON_SECRET is set and the bearer token matches", async () => {
    process.env.CRON_SECRET = "secret";
    getTwentyCrmHealthMock.mockResolvedValue(readyHealth);

    const response = await GET(
      createRequest({ authorization: "Bearer secret" }),
    );

    expect(response.status).toBe(200);
    expect(getTwentyCrmHealthMock).toHaveBeenCalledTimes(1);
  });

  it("skips the auth guard when CRON_SECRET is unset (parity with /api/health/db)", async () => {
    getTwentyCrmHealthMock.mockResolvedValue(readyHealth);

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    expect(getTwentyCrmHealthMock).toHaveBeenCalledTimes(1);
  });

  it("always sets cache-control: no-store", async () => {
    getTwentyCrmHealthMock.mockResolvedValue(readyHealth);

    const healthyResponse = await GET(createRequest());
    expect(healthyResponse.headers.get("cache-control")).toBe("no-store");

    process.env.CRON_SECRET = "secret";
    const unauthorizedResponse = await GET(createRequest());
    expect(unauthorizedResponse.headers.get("cache-control")).toBe("no-store");
  });
});
