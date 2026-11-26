import { describe, expect, it, vi } from "vitest";

import {
  findMissionaryByProfileId,
  findOwnDonor,
  findProfileById,
  findProfileByUserId,
} from "../../../../../packages/api/src/shared/queries";
import { TENANT_MEMBER_PAGE_SIZE } from "../../../../../packages/api/src/shared/tenant-members";
import {
  memberPages,
  memberRow,
} from "../../../../fixtures/fake-service-client";

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
    mock.rpc.mockImplementation(
      memberPages([memberRow({ profileId: "profile-404" })]),
    );

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

  function linkThenDonors(
    link: { party_id: string } | null,
    donors: { id: string }[] | null,
    errors: { link?: { message: string }; donors?: { message: string } } = {},
  ) {
    const calls: [string, string, unknown[]][] = [];
    const from = vi.fn((table: string) => {
      const chain: Record<string, unknown> = {};
      for (const method of ["select", "eq", "limit"])
        chain[method] = vi.fn((...args: unknown[]) => {
          calls.push([table, method, args]);
          return chain;
        });
      chain.maybeSingle = vi.fn(async () => ({
        data: link,
        error: errors.link ?? null,
      }));
      chain.then = (resolve: (value: unknown) => unknown) =>
        resolve({ data: donors, error: errors.donors ?? null });
      return chain;
    });
    return { supabase: { from } as never, calls };
  }
  const person = { userId: "user-1", tenantId: "tenant-1" };

  it("finds the signed-in person's donor through their account link and its Party in the tenant, never by profile_id", async () => {
    const mock = linkThenDonors({ party_id: "party-1" }, [{ id: "donor-1" }]);

    const lookup = await findOwnDonor(mock.supabase, person, "id, name");

    expect(lookup).toEqual({ status: "found", donor: { id: "donor-1" } });
    expect(mock.calls).toEqual([
      ["account_links", "select", ["party_id"]],
      ["account_links", "eq", ["tenant_id", "tenant-1"]],
      ["account_links", "eq", ["user_id", "user-1"]],
      ["donors", "select", ["id, name"]],
      ["donors", "eq", ["tenant_id", "tenant-1"]],
      ["donors", "eq", ["party_id", "party-1"]],
      ["donors", "limit", [2]],
    ]);
    expect(JSON.stringify(mock.calls)).not.toContain("profile_id");
  });

  it("answers none without reading donors when the person has no account link in the tenant", async () => {
    const mock = linkThenDonors(null, [{ id: "donor-1" }]);

    expect(await findOwnDonor(mock.supabase, person)).toEqual({
      status: "none",
    });
    expect(mock.calls.some(([table]) => table === "donors")).toBe(false);
  });

  it("answers none for a link whose Party has no donor in the tenant, and multiple, naming neither, for two donors on one Party", async () => {
    expect(
      await findOwnDonor(
        linkThenDonors({ party_id: "party-1" }, []).supabase,
        person,
      ),
    ).toEqual({ status: "none" });
    expect(
      await findOwnDonor(
        linkThenDonors({ party_id: "party-1" }, [
          { id: "donor-1" },
          { id: "donor-2" },
        ]).supabase,
        person,
      ),
    ).toEqual({ status: "multiple" });
  });

  it("throws when the link or the donor read fails", async () => {
    await expect(
      findOwnDonor(
        linkThenDonors(null, null, { link: { message: "link down" } }).supabase,
        person,
      ),
    ).rejects.toThrow("link down");
    await expect(
      findOwnDonor(
        linkThenDonors({ party_id: "party-1" }, null, {
          donors: { message: "donors down" },
        }).supabase,
        person,
      ),
    ).rejects.toThrow("donors down");
  });

  it("queries missionary by profile id", async () => {
    const result = { data: { id: "missionary-1" }, error: null };
    const mock = createSingleChainMock(result);

    mock.rpc.mockReturnValue({ ...mock.query, maybeSingle: mock.single });
    const response = await findMissionaryByProfileId(mock.supabase, {
      profileId: "profile-1",
      tenantId: "tenant-1",
      assignmentId: "assignment-1",
    });

    expect(response).toEqual(result);
    expect(mock.rpc).toHaveBeenCalledWith("missionary_own_record", {
      p_profile_id: "profile-1",
      p_tenant_id: "tenant-1",
      p_assignment_id: "assignment-1",
    });
    expect(mock.select).toHaveBeenCalledWith(
      "id, bio, tagline, location, phone, cover_url, social_links",
    );
  });
});
