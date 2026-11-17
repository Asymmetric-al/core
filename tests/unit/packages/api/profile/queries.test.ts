import { describe, expect, it, vi } from "vitest";

import { findFullProfileById } from "../../../../../packages/api/src/profile/queries";
import { memberRow } from "../../../../fixtures/fake-service-client";

function createSingleChainMock<T>(result: {
  data: T | null;
  error: { message: string } | null;
}) {
  const single = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnThis();
  const select = vi.fn().mockReturnThis();
  const query = { select, eq, single };
  const from = vi.fn().mockReturnValue(query);
  // AL-2675 (WP2a sweep; NR-68): membership in the tenant is read through
  // tenant_member_profiles; profiles are read by id alone.
  const rpc = vi.fn().mockResolvedValue({
    data: [memberRow({ profileId: "profile-1" })],
    error: null,
  });
  const supabase = { from, rpc } as never;
  return { supabase, from, select, eq, rpc };
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
    expect(mock.rpc).toHaveBeenCalledWith("tenant_member_profiles", {
      p_tenant_id: "tenant-1",
      p_profile_ids: ["profile-1"],
      p_user_ids: null,
      p_include_revoked: false,
    });
    expect(mock.eq.mock.calls).toEqual([["id", "profile-1"]]);
  });

  it("finds no profile in a tenant the profile's login does not belong to", async () => {
    const mock = createSingleChainMock({ data: { id: "x" }, error: null });
    mock.rpc.mockResolvedValue({ data: [], error: null });

    const response = await findFullProfileById(
      mock.supabase,
      "profile-1",
      "tenant-2",
    );

    expect(response.data).toBeNull();
    expect(response.error).toMatchObject({ code: "PGRST116" });
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("returns null data for missing profile", async () => {
    const result = { data: null, error: { message: "No rows found" } };
    const mock = createSingleChainMock(result);

    const response = await findFullProfileById(
      mock.supabase,
      "profile-1",
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
