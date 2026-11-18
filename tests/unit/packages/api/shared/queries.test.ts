import { describe, expect, it, vi } from "vitest";

import {
  findDonorByProfileId,
  findMissionaryByProfileId,
  findProfileById,
  findProfileByUserId,
} from "../../../../../packages/api/src/shared/queries";
import { TENANT_MEMBER_PAGE_SIZE } from "../../../../../packages/api/src/shared/tenant-members";
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
  const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
  const supabase = { from, rpc };
  return { supabase, from, query, select, eq, single, rpc };
}

/**
 * AL-2675 (WP2a sweep; NR-68): the profile lookups decide tenant membership
 * through `tenant_member_profiles`, never by filtering profiles on
 * `tenant_id`; the old assertions on that filter become assertions on the
 * membership read and on profiles read by id alone.
 */
const memberRead = (args: Record<string, unknown>) => [
  "tenant_member_profiles",
  {
    p_tenant_id: "tenant-1",
    p_profile_ids: null,
    p_user_ids: null,
    p_include_revoked: false,
    p_role: null,
    p_tenant_admin: null,
    p_after_membership_id: null,
    p_limit: TENANT_MEMBER_PAGE_SIZE,
    ...args,
  },
];

describe("api/shared/queries", () => {
  // Council round 1 on WP2a, F12: every caller passes the signed-in person's
  // login, whose membership the resolver has checked, so the lookup reads no
  // membership again and filters profiles on user_id alone.
  it("returns the signed-in person's profile id by login, reading no membership again", async () => {
    const result = { data: { id: "profile-1" }, error: null };
    const mock = createSingleChainMock(result);

    const response = await findProfileByUserId(
      mock.supabase as never,
      "user-1",
    );

    expect(response).toEqual(result);
    expect(mock.rpc).not.toHaveBeenCalled();
    expect(mock.from).toHaveBeenCalledWith("profiles");
    expect(mock.select).toHaveBeenCalledWith("id");
    expect(mock.eq.mock.calls).toEqual([["user_id", "user-1"]]);
    expect(mock.single).toHaveBeenCalledOnce();
  });

  it("returns null data when profile is not found", async () => {
    const result = { data: null, error: { message: "No rows found" } };
    const mock = createSingleChainMock(result);
    mock.rpc.mockResolvedValue({
      data: [memberRow({ profileId: "profile-404" })],
      error: null,
    });

    const response = await findProfileById(
      mock.supabase as never,
      "profile-404",
      "tenant-1",
    );

    expect(response).toEqual(result);
    expect(mock.rpc).toHaveBeenCalledWith(
      ...memberRead({ p_profile_ids: ["profile-404"] }),
    );
    expect(mock.from).toHaveBeenCalledWith("profiles");
    expect(mock.select).toHaveBeenCalledWith("*");
    expect(mock.eq.mock.calls).toEqual([["id", "profile-404"]]);
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
