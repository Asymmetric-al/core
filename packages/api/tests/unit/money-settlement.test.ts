import { describe, expect, it, vi } from "vitest";

import { resolveTenantSettlementCurrency } from "../../src/money/settlement";

function fake(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { client: { from } as never, from, select, eq };
}

describe("independently server-resolved existing settlement context", () => {
  it("resolves USD only after the exact existing tenant identity is verified", async () => {
    const db = fake({ id: "tenant-1" });
    expect(await resolveTenantSettlementCurrency(db.client, "tenant-1")).toBe(
      "USD",
    );
    expect(db.from).toHaveBeenCalledWith("tenants");
    expect(db.select).toHaveBeenCalledWith("id");
    expect(db.eq).toHaveBeenCalledWith("id", "tenant-1");
  });
  it.each([null, {}, { id: "other-tenant" }])(
    "fails closed on absent/mismatched tenant %j",
    async (data) => {
      expect(
        await resolveTenantSettlementCurrency(fake(data).client, "tenant-1"),
      ).toBeNull();
    },
  );
  it("fails closed on a lookup failure even if data accompanies it", async () => {
    expect(
      await resolveTenantSettlementCurrency(
        fake({ id: "tenant-1" }, { message: "unavailable" }).client,
        "tenant-1",
      ),
    ).toBeNull();
  });
});
