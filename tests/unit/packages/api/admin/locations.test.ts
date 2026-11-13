import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const { insert, client } = vi.hoisted(() => {
  const insert = vi.fn();
  const chain = { insert, select: vi.fn(), single: vi.fn() };
  insert.mockImplementation(() => chain);
  chain.select.mockImplementation(() => chain);
  chain.single.mockResolvedValue({ data: { id: "new-location" }, error: null });
  return { insert, client: { from: vi.fn(() => chain) } };
});
vi.mock("@asym/auth/context", () => ({
  getAuthContext: vi.fn(async () => ({ tenantId: "tenant", role: "staff" })),
  requireRole: vi.fn(),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client }),
}));
import { POST } from "../../../../../packages/api/src/admin/locations";
beforeEach(() => insert.mockClear());
it.each(["partner", "custom"])(
  "accepts %s markers without carrying an incompatible relationship",
  async (type) => {
    const response = await POST(
      new NextRequest("https://example.test/api/admin/locations", {
        method: "POST",
        body: JSON.stringify({
          title: "Partner site",
          type,
          lat: 10,
          lng: 20,
          linked_id: "old-member",
          status: "draft",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(response.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ tenant_id: "tenant", type, linked_id: null }),
    );
  },
);
