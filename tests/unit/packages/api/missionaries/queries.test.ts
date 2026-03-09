import { describe, expect, it, vi } from "vitest";

import { findMissionaryById } from "../../../../../packages/api/src/missionaries/queries";

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
  return { supabase, from, select, eq, single };
}

describe("api/missionaries/queries", () => {
  it("returns missionary id for matching tenant (happy path)", async () => {
    const result = { data: { id: "missionary-1" }, error: null };
    const mock = createSingleChainMock(result);

    const response = await findMissionaryById(
      mock.supabase,
      "missionary-1",
      "tenant-1",
    );

    expect(response).toEqual(result);
    expect(mock.from).toHaveBeenCalledWith("missionaries");
    expect(mock.select).toHaveBeenCalledWith("id");
    expect(mock.eq).toHaveBeenNthCalledWith(1, "id", "missionary-1");
    expect(mock.eq).toHaveBeenNthCalledWith(2, "tenant_id", "tenant-1");
  });

  it("returns null data when missionary is not found", async () => {
    const result = { data: null, error: { message: "No rows found" } };
    const mock = createSingleChainMock(result);

    const response = await findMissionaryById(
      mock.supabase,
      "missing-id",
      "tenant-1",
    );

    expect(response).toEqual(result);
  });

  it("returns raw error from Supabase (error path)", async () => {
    const result = { data: null, error: { message: "query failed" } };
    const mock = createSingleChainMock(result);

    const response = await findMissionaryById(
      mock.supabase,
      "missionary-1",
      "tenant-1",
    );

    expect(response).toEqual(result);
  });
});
