import { describe, expect, it, vi } from "vitest";

import {
  findDonorByProfileId,
  findMissionaryByProfileId,
  findProfileById,
  findProfileByUserId,
} from "../../../../../packages/api/src/shared/queries";

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
  return { supabase, from, query, select, eq, single };
}

describe("api/shared/queries", () => {
  it("returns profile by user id (happy path)", async () => {
    const result = { data: { id: "profile-1" }, error: null };
    const mock = createSingleChainMock(result);

    const response = await findProfileByUserId(
      mock.supabase,
      "user-1",
      "tenant-1",
    );

    expect(response).toEqual(result);
    expect(mock.from).toHaveBeenCalledWith("profiles");
    expect(mock.select).toHaveBeenCalledWith("id");
    expect(mock.eq).toHaveBeenNthCalledWith(1, "user_id", "user-1");
    expect(mock.eq).toHaveBeenNthCalledWith(2, "tenant_id", "tenant-1");
    expect(mock.single).toHaveBeenCalledOnce();
  });

  it("returns null data when profile is not found", async () => {
    const result = { data: null, error: { message: "No rows found" } };
    const mock = createSingleChainMock(result);

    const response = await findProfileById(
      mock.supabase,
      "profile-404",
      "tenant-1",
    );

    expect(response).toEqual(result);
    expect(mock.from).toHaveBeenCalledWith("profiles");
    expect(mock.select).toHaveBeenCalledWith("*");
    expect(mock.eq).toHaveBeenNthCalledWith(1, "id", "profile-404");
    expect(mock.eq).toHaveBeenNthCalledWith(2, "tenant_id", "tenant-1");
  });

  it("returns raw error from donor query (error path)", async () => {
    const result = { data: null, error: { message: "Database unavailable" } };
    const mock = createSingleChainMock(result);

    const response = await findDonorByProfileId(
      mock.supabase,
      "profile-1",
      "tenant-1",
    );

    expect(response).toEqual(result);
    expect(mock.from).toHaveBeenCalledWith("donors");
    expect(mock.select).toHaveBeenCalledWith(
      "id, stripe_customer_id, profile_id",
    );
    expect(mock.eq).toHaveBeenNthCalledWith(1, "profile_id", "profile-1");
    expect(mock.eq).toHaveBeenNthCalledWith(2, "tenant_id", "tenant-1");
  });

  it("queries missionary by profile id", async () => {
    const result = { data: { id: "missionary-1" }, error: null };
    const mock = createSingleChainMock(result);

    const response = await findMissionaryByProfileId(
      mock.supabase,
      "profile-1",
    );

    expect(response).toEqual(result);
    expect(mock.from).toHaveBeenCalledWith("missionaries");
    expect(mock.select).toHaveBeenCalledWith("*");
    expect(mock.eq).toHaveBeenCalledWith("profile_id", "profile-1");
  });
});
