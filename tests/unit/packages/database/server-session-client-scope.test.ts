import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The server's per-request session clients send the request's tenant and
 * assignment (plan 12, WP2b: `createClient` and `createRequestSessionClient`
 * send both headers no later than the second release, because from then a
 * read on the caller's token that names no tenant returns nothing; this
 * slice does it now, so that the second release is a migration only;
 * AL-2675). The scope is the one the resolver selected for the request,
 * never a header the caller sent.
 */

vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} }),
}));

const SCOPE = {
  tenantId: "00000000-0000-0000-0000-000000000002",
  assignmentId: "00000000-0000-4000-8000-000000000102",
};

const fetchMock = vi.fn(
  async (_input: RequestInfo | URL, _init?: RequestInit) =>
    new Response("[]", {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
);

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function lastRestHeaders(): Headers {
  const call = fetchMock.mock.calls.findLast(([input]) =>
    String(input instanceof Request ? input.url : input).includes("/rest/v1/"),
  );
  expect(call).toBeDefined();
  const [input, init] = call!;
  return new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  );
}

describe("createClient in @asym/database/supabase/server", () => {
  it("sends the request's tenant and assignment on its Data API reads", async () => {
    const { createClient } =
      await import("../../../../packages/database/supabase/server");
    const supabase = await createClient(SCOPE);

    await supabase.from("tenants").select("id");

    expect(lastRestHeaders().get("x-asym-tenant")).toBe(SCOPE.tenantId);
    expect(lastRestHeaders().get("x-asym-assignment")).toBe(SCOPE.assignmentId);
  });

  it("sends neither header for a request with no resolved scope", async () => {
    const { createClient } =
      await import("../../../../packages/database/supabase/server");
    const supabase = await createClient(null);

    await supabase.from("profiles").select("id");

    expect(lastRestHeaders().has("x-asym-tenant")).toBe(false);
    expect(lastRestHeaders().has("x-asym-assignment")).toBe(false);
  });
});

describe("createRequestSessionClient in @asym/api", () => {
  it.each([
    ["a bearer request", { authorization: "Bearer caller-token" }],
    ["a cookie request", {}],
  ])(
    "sends the resolved tenant and assignment for %s, not the caller's headers",
    async (_label, headers) => {
      const { createRequestSessionClient } =
        await import("../../../../packages/api/src/shared/request-session-client");
      const request = new Request(
        "http://localhost/api/admin/crm/table-preferences",
        {
          headers: {
            ...headers,
            // A forged proposal the resolver refused never reaches the database.
            "x-asym-tenant": "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a",
            "x-asym-assignment": "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5b",
          },
        },
      );
      const supabase = await createRequestSessionClient(request, SCOPE);

      await supabase.from("crm_table_preferences").select("id");

      expect(lastRestHeaders().get("x-asym-tenant")).toBe(SCOPE.tenantId);
      expect(lastRestHeaders().get("x-asym-assignment")).toBe(
        SCOPE.assignmentId,
      );
    },
  );
});
