import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

import { GET } from "../../../../../packages/api/src/health/db";

type QueryResult = {
  data: Array<{ id: string }> | null;
  error: { message: string } | null;
};

function createThenableQuery(result: QueryResult) {
  const query: {
    select: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    then?: PromiseLike<QueryResult>["then"];
  } = {
    select: vi.fn(() => query),
    limit: vi.fn(() => query),
  };

  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected);

  return query;
}

function createRequest(headers?: HeadersInit): NextRequest {
  return new Request("https://example.com/api/health/db", {
    headers,
  }) as NextRequest;
}

function mockClientWithQuery(result: QueryResult) {
  const query = createThenableQuery(result);
  const from = vi.fn(() => query);

  getAdminClientMock.mockReturnValue({
    client: { from } as never,
    error: null,
  });

  return { from, query };
}

describe("api/health/db", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CRON_SECRET;
  });

  it("returns healthy response when admin client and query succeed", async () => {
    const { from, query } = mockClientWithQuery({
      data: [{ id: "tenant-1" }],
      error: null,
    });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.status).toBe("healthy");
    expect(body.checks.admin_client.status).toBe("ok");
    expect(typeof body.checks.admin_client.latency_ms).toBe("number");
    expect(body.checks.admin_client.latency_ms).toBeGreaterThanOrEqual(0);
    expect(JSON.stringify(body)).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(from).toHaveBeenCalledWith("tenants");
    expect(query.select).toHaveBeenCalledWith("id");
    expect(query.limit).toHaveBeenCalledWith(1);
  });

  it("returns unhealthy when the admin client is unavailable", async () => {
    getAdminClientMock.mockReturnValue({
      client: null,
      error: "Admin client unavailable",
    });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.status).toBe("unhealthy");
    expect(body.checks.admin_client.status).toBe("error");
    expect(body.checks.admin_client.error).toContain(
      "Admin client unavailable",
    );
  });

  it("returns unhealthy when the health query fails", async () => {
    mockClientWithQuery({
      data: null,
      error: {
        message:
          "query failed for sk_live_123456789 and https://secret.example.com",
      },
    });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("unhealthy");
    expect(body.checks.admin_client.status).toBe("error");
    expect(body.checks.admin_client.error).toBeTruthy();
    expect(body.checks.admin_client.error).not.toContain("sk_live_123456789");
    expect(body.checks.admin_client.error).not.toContain(
      "https://secret.example.com",
    );
  });

  it("returns 401 when CRON_SECRET is set and token is missing", async () => {
    process.env.CRON_SECRET = "secret";

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 401 when CRON_SECRET is set and token is wrong", async () => {
    process.env.CRON_SECRET = "secret";

    const response = await GET(
      createRequest({
        authorization: "Bearer wrong",
      }),
    );

    expect(response.status).toBe(401);
  });

  it("skips auth guard when CRON_SECRET is unset", async () => {
    mockClientWithQuery({
      data: [{ id: "tenant-1" }],
      error: null,
    });

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
  });

  it("always sets Cache-Control: no-store", async () => {
    mockClientWithQuery({
      data: [{ id: "tenant-1" }],
      error: null,
    });

    const healthyResponse = await GET(createRequest());
    expect(healthyResponse.headers.get("Cache-Control")).toBe("no-store");

    process.env.CRON_SECRET = "secret";
    const unauthorizedResponse = await GET(createRequest());
    expect(unauthorizedResponse.headers.get("Cache-Control")).toBe("no-store");
  });
});
