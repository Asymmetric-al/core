import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../../packages/api/src/shared/with-operation", () => ({
  withOperation: (handler: unknown) => handler,
}));

import { GET } from "../../../../../packages/api/src/admin/fund-directory";

type Call = [method: string, ...args: unknown[]];

function recordingClient(rows: unknown[] = []) {
  const calls: Call[] = [];
  const query: Record<string, unknown> = {};
  for (const method of ["select", "order", "range", "eq", "ilike"]) {
    query[method] = (...args: unknown[]) => {
      calls.push([method, ...args]);
      return query;
    };
  }
  query.then = (resolve: (value: unknown) => unknown) =>
    resolve({ data: rows, error: null });
  return {
    calls,
    client: {
      from: (table: string) => {
        calls.push(["from", table]);
        return query;
      },
    },
  };
}

const handler = GET as unknown as (context: unknown) => Promise<Response>;

async function callDirectory(
  url: string,
  auth: { role: string; tenantId: string },
) {
  const { calls, client } = recordingClient([{ id: "fund-1" }]);
  const response = await handler({
    supabaseAdmin: client,
    auth,
    request: new Request(url),
  });
  return { calls, response };
}

describe("admin fund directory", () => {
  it("keeps staff in their own tenant even when another tenant is asked for", async () => {
    const { calls, response } = await callDirectory(
      "http://admin.test/api/admin/funds?tenantId=00000000-0000-4000-8000-000000000002",
      { role: "admin", tenantId: "tenant-own" },
    );

    expect(response.status).toBe(200);
    const tenantFilters = calls.filter(
      ([method, column]) => method === "eq" && column === "tenant_id",
    );
    expect(tenantFilters).toEqual([["eq", "tenant_id", "tenant-own"]]);
  });

  it("lets a super admin scope the directory to one tenant", async () => {
    const { calls } = await callDirectory(
      "http://admin.test/api/admin/funds?tenantId=00000000-0000-4000-8000-000000000002",
      { role: "super_admin", tenantId: "tenant-own" },
    );

    expect(calls).toContainEqual([
      "eq",
      "tenant_id",
      "00000000-0000-4000-8000-000000000002",
    ]);
  });

  it("rejects a malformed tenant id instead of ignoring it", async () => {
    const { calls, response } = await callDirectory(
      "http://admin.test/api/admin/funds?tenantId=not-a-tenant",
      { role: "super_admin", tenantId: "tenant-own" },
    );

    expect(response.status).toBe(400);
    expect(calls.some(([method]) => method === "from")).toBe(false);
  });

  it("searches fund names on the server, with LIKE wildcards escaped", async () => {
    const { calls } = await callDirectory(
      "http://admin.test/api/admin/funds?q=%20100%25_Fund%20",
      { role: "admin", tenantId: "tenant-own" },
    );

    expect(calls).toContainEqual(["ilike", "name", String.raw`%100\%\_Fund%`]);
  });

  it("adds no name filter for an empty search", async () => {
    const { calls } = await callDirectory(
      "http://admin.test/api/admin/funds?q=%20%20",
      { role: "admin", tenantId: "tenant-own" },
    );

    expect(calls.some(([method]) => method === "ilike")).toBe(false);
  });
});
