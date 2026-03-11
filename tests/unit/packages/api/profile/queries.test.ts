import { describe, expect, it, vi } from "vitest";

import { findFullProfileById } from "../../../../../packages/api/src/profile/queries";

function createSingleChainMock<T>(result: {
  data: T | null;
  error: { message: string } | null;
}) {
  const single = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnThis();
  const select = vi.fn().mockReturnThis();
  const query = { select, eq, single };
  const from = vi.fn().mockReturnValue(query);
  const supabase = { from };
  return { supabase, from, select, eq };
}

describe("api/profile/queries", () => {
  it("returns full profile row for tenant (happy path)", async () => {
    const result = {
      data: { id: "profile-1", tenant_id: "tenant-1" },
      error: null,
    };
    const mock = createSingleChainMock(result);

    const response = await findFullProfileById(
      mock.supabase,
      "profile-1",
      "tenant-1",
    );

    expect(response).toEqual(result);
    expect(mock.from).toHaveBeenCalledWith("profiles");
    expect(mock.select).toHaveBeenCalledWith("*");
    expect(mock.eq).toHaveBeenNthCalledWith(1, "id", "profile-1");
    expect(mock.eq).toHaveBeenNthCalledWith(2, "tenant_id", "tenant-1");
  });

  it("returns null data for missing profile", async () => {
    const result = { data: null, error: { message: "No rows found" } };
    const mock = createSingleChainMock(result);

    const response = await findFullProfileById(
      mock.supabase,
      "missing-profile",
      "tenant-1",
    );

    expect(response).toEqual(result);
  });

  it("returns raw error from Supabase (error path)", async () => {
    const result = { data: null, error: { message: "database timeout" } };
    const mock = createSingleChainMock(result);

    const response = await findFullProfileById(
      mock.supabase,
      "profile-1",
      "tenant-1",
    );

    expect(response).toEqual(result);
  });
});
