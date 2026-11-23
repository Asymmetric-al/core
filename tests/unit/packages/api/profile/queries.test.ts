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
  const rpc = vi.fn();
  const supabase = { from, rpc } as never;
  return { supabase, from, select, eq, rpc };
}

/**
 * Council round 1 on WP2a, F12: the one caller passes the signed-in person's
 * profile, whose membership in the request's tenant the resolver has checked,
 * so the lookup reads no membership again (it used to read
 * tenant_member_profiles first). Profiles are read by id, never by the
 * profile's tenant column (AL-2675, NR-68).
 */
describe("api/profile/queries", () => {
  it("returns the signed-in person's full profile by id, reading no membership again", async () => {
    const result = {
      data: { id: "profile-1", tenant_id: "tenant-1" },
      error: null,
    };
    const mock = createSingleChainMock(result);

    const response = await findFullProfileById(mock.supabase, "profile-1");

    expect(response).toEqual(result);
    expect(mock.rpc).not.toHaveBeenCalled();
    expect(mock.from).toHaveBeenCalledWith("profiles");
    expect(mock.select).toHaveBeenCalledWith(
      "id, email, first_name, last_name, avatar_url",
    );
    expect(mock.eq.mock.calls).toEqual([["id", "profile-1"]]);
  });

  it("returns null data for missing profile", async () => {
    const result = { data: null, error: { message: "No rows found" } };
    const mock = createSingleChainMock(result);

    const response = await findFullProfileById(mock.supabase, "profile-1");

    expect(response).toEqual(result);
  });

  it("returns raw error from Supabase (error path)", async () => {
    const result = { data: null, error: { message: "database timeout" } };
    const mock = createSingleChainMock(result);

    const response = await findFullProfileById(mock.supabase, "profile-1");

    expect(response).toEqual(result);
  });
});
