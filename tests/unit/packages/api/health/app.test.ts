import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: createClientMock,
}));

import { createAppHealthHandler } from "../../../../../packages/api/src/health/app";

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

function mockClientWithQuery(result: QueryResult) {
  const query = createThenableQuery(result);
  const from = vi.fn(() => query);

  createClientMock.mockResolvedValue({
    from,
  });

  return { from, query };
}

describe("app health handler", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.SKIP_ENV_VALIDATION;
    process.env.VERCEL_GIT_COMMIT_SHA = "commit-1";
    process.env.VERCEL_GIT_COMMIT_REF = "production";
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_RUNTIME = "nodejs";
  });

  it("returns release metadata and keeps the legacy health shape", async () => {
    const { from, query } = mockClientWithQuery({
      data: [{ id: "profile-1" }],
      error: null,
    });
    const GET = createAppHealthHandler("donor");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.status).toBe("ok");
    expect(body.checks.supabase).toBe("ok");
    expect(body.observability.surface).toBe("donor");
    expect(body.observability.release).toMatchObject({
      commit: "commit-1",
      ref: "production",
      environment: "production",
      runtime: "nodejs",
    });
    expect(typeof body.observability.supabaseLatencyMs).toBe("number");
    expect(from).toHaveBeenCalledWith("profiles");
    expect(query.select).toHaveBeenCalledWith("id");
    expect(query.limit).toHaveBeenCalledWith(1);
  });

  it("returns degraded with sanitized provider errors", async () => {
    mockClientWithQuery({
      data: null,
      error: {
        message:
          "failed against postgresql://secret@example/db with sk_live_123",
      },
    });
    const GET = createAppHealthHandler("admin");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.supabase).toContain("error:");
    expect(body.checks.supabase).not.toContain("postgresql://");
    expect(body.checks.supabase).not.toContain("sk_live_123");
  });

  it("skips database access for CI env validation bypass", async () => {
    process.env.SKIP_ENV_VALIDATION = "1";
    const GET = createAppHealthHandler("missionary");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.observability.supabaseLatencyMs).toBeNull();
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
