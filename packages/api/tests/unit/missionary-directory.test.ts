import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/shared/with-operation", () => ({
  withOperation: (handler: unknown) => handler,
}));
import { GET } from "../../src/admin/missionary-directory";

function query(data: unknown[], error: { message: string } | null = null) {
  const chain = {
    select: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    then: (resolve: (value: unknown) => void) =>
      Promise.resolve({ data, error }).then(resolve),
  };
  for (const name of ["select", "order", "range", "eq", "in"] as const)
    chain[name].mockReturnValue(chain);
  return chain;
}
const handler = GET as unknown as (ctx: {
  supabaseAdmin: { from: (name: string) => unknown };
  auth: { role: string; tenantId: string };
  request: NextRequest;
}) => Promise<Response>;

describe("admin missionary directory context", () => {
  it("returns nullable identifying context and retains tenant and paging constraints", async () => {
    const missionaries = query([
      {
        id: "m1",
        tenant_id: "t1",
        profile_id: "p1",
        location: "Bangkok",
        mission_field: "Thailand",
      },
      { id: "m2", tenant_id: "t1", profile_id: null },
    ]);
    const profiles = query([
      { id: "p1", full_name: "Sam", display_name: null },
    ]);
    const response = await handler({
      supabaseAdmin: {
        from: (name) => (name === "missionaries" ? missionaries : profiles),
      },
      auth: { tenantId: "t1", role: "staff" },
      request: new NextRequest(
        "https://example.com/api/admin/missionaries?offset=10&limit=20",
      ),
    });
    expect(missionaries.select).toHaveBeenCalledWith(
      "id, tenant_id, profile_id, location, mission_field",
    );
    expect(missionaries.eq).toHaveBeenCalledWith("tenant_id", "t1");
    expect(missionaries.range).toHaveBeenCalledWith(10, 29);
    expect(await response.json()).toEqual({
      missionaries: [
        {
          id: "m1",
          tenant_id: "t1",
          location: "Bangkok",
          missionField: "Thailand",
          profile: { full_name: "Sam", display_name: null },
        },
        {
          id: "m2",
          tenant_id: "t1",
          location: null,
          missionField: null,
          profile: null,
        },
      ],
    });
  });
  it("preserves the super-admin scope and reports failed profile reads", async () => {
    const missionaries = query([
      { id: "m1", tenant_id: "t2", profile_id: "p1" },
    ]);
    const profiles = query([], { message: "Lookup failed" });
    const response = await handler({
      supabaseAdmin: {
        from: (name) => (name === "missionaries" ? missionaries : profiles),
      },
      auth: { tenantId: "t1", role: "super_admin" },
      request: new NextRequest("https://example.com/api/admin/missionaries"),
    });
    expect(missionaries.eq).not.toHaveBeenCalled();
    expect(response.status).toBe(500);
  });
});
