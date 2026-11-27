import { describe, expect, it, vi } from "vitest";

import { callerGiftMismatches } from "../../../packages/api/src/donations/select";

const GIFT = {
  profileId: "profile-c",
  amountCents: 2500,
  currency: "usd",
  missionaryId: "00000000-0000-4000-8000-0000000000a1",
  fundId: null,
};
const PERSON = { userId: "user-c", tenantId: "tenant-a" };

function stored(donor: Record<string, unknown> | null, donorId: string) {
  return {
    amount: 2500,
    currency: "usd",
    missionary_id: GIFT.missionaryId,
    fund_id: null,
    donor_id: donorId,
    donor,
  };
}

function client(link: { party_id: string } | null, donors: { id: string }[]) {
  const calls: string[] = [];
  const from = vi.fn((table: string) => {
    calls.push(table);
    const chain: Record<string, unknown> = {};
    for (const method of ["select", "eq", "limit"]) chain[method] = () => chain;
    chain.maybeSingle = async () => ({ data: link, error: null });
    chain.then = (resolve: (value: unknown) => unknown) =>
      resolve({ data: donors, error: null });
    return chain;
  });
  return { supabase: { from } as never, calls };
}

describe("a gift read back is the caller's when its donor is theirs by profile, or by their account link and its Party (AL-2678 WP5 rest, fix round F2)", () => {
  it("accepts a claimed donor with no profile that the caller's link and Party name (red: profile mismatch)", async () => {
    const { supabase, calls } = client({ party_id: "party-c" }, [
      { id: "donor-c" },
    ]);
    expect(
      await callerGiftMismatches(
        supabase,
        stored({ profile: null }, "donor-c"),
        GIFT,
        PERSON,
      ),
    ).toEqual([]);
    expect(calls).toEqual(["account_links", "donors"]);
  });

  it("refuses a donor the caller's link does not name, and reads nothing more when the profile already matches", async () => {
    expect(
      await callerGiftMismatches(
        client({ party_id: "party-c" }, [{ id: "donor-other" }]).supabase,
        stored({ profile: null }, "donor-c"),
        GIFT,
        PERSON,
      ),
    ).toEqual(["profile"]);
    expect(
      await callerGiftMismatches(
        client(null, []).supabase,
        stored({ profile: null }, "donor-c"),
        GIFT,
        PERSON,
      ),
    ).toEqual(["profile"]);
    const matched = client(null, []);
    expect(
      await callerGiftMismatches(
        matched.supabase,
        stored({ profile: { id: "PROFILE-C" } }, "donor-c"),
        GIFT,
        PERSON,
      ),
    ).toEqual([]);
    expect(matched.calls).toEqual([]);
  });

  it("answers null, an outcome not known, when the own-donor lookup fails, never a mismatch (WP5 rest 2 item zero (e); red: profile)", async () => {
    const from = vi.fn(() => {
      const chain: Record<string, unknown> = {};
      for (const method of ["select", "eq", "limit"])
        chain[method] = () => chain;
      chain.maybeSingle = async () => ({
        data: null,
        error: { message: "canceling statement due to statement timeout" },
      });
      return chain;
    });
    expect(
      await callerGiftMismatches(
        { from } as never,
        stored({ profile: null }, "donor-c"),
        GIFT,
        PERSON,
      ),
    ).toBeNull();
  });

  it("still reports the other fields when the donor is the caller's", async () => {
    expect(
      await callerGiftMismatches(
        client({ party_id: "party-c" }, [{ id: "donor-c" }]).supabase,
        { ...stored({ profile: null }, "donor-c"), amount: 9900 },
        GIFT,
        PERSON,
      ),
    ).toEqual(["amount"]);
  });
});
