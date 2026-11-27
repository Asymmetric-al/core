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

  function tables(
    rows: Record<string, { data: unknown; error?: { message: string } }>,
  ) {
    const calls: string[] = [];
    const from = vi.fn((table: string) => {
      calls.push(table);
      const result = {
        data: rows[table]?.data ?? null,
        error: rows[table]?.error ?? null,
      };
      const chain: Record<string, unknown> = {};
      for (const method of ["select", "eq", "limit"])
        chain[method] = () => chain;
      chain.maybeSingle = async () => result;
      chain.then = (resolve: (value: unknown) => unknown) => resolve(result);
      return chain;
    });
    return { supabase: { from } as never, calls };
  }

  it("accepts the donor of the Party of the caller's sole worker row when no account link names a donor, as the gift writer resolves it (WP5 rest 2a, fix round F1; red: profile)", async () => {
    const { supabase, calls } = tables({
      missionaries: { data: [{ party_id: "party-w" }] },
      donors: { data: { party_id: "party-w" } },
    });
    expect(
      await callerGiftMismatches(
        supabase,
        stored({ profile: null }, "donor-w"),
        GIFT,
        PERSON,
      ),
    ).toEqual([]);
    expect(calls).toEqual(["account_links", "missionaries", "donors"]);
  });

  it("refuses a gift on another Party than the caller's sole worker row's, and any gift when the caller has several worker rows (WP5 rest 2a, fix round F1; guard)", async () => {
    for (const rows of [
      {
        missionaries: { data: [{ party_id: "party-x" }] },
        donors: { data: { party_id: "party-w" } },
      },
      {
        missionaries: {
          data: [{ party_id: "party-w" }, { party_id: "party-w2" }],
        },
        donors: { data: { party_id: "party-w" } },
      },
      {
        missionaries: { data: [{ party_id: null }] },
        donors: { data: { party_id: null } },
      },
      { missionaries: { data: [{ party_id: "party-w" }] } },
    ])
      expect(
        await callerGiftMismatches(
          tables(rows).supabase,
          stored({ profile: null }, "donor-w"),
          GIFT,
          PERSON,
        ),
      ).toEqual(["profile"]);
  });

  it("answers null when the worker row or the gift's donor cannot be read (WP5 rest 2a, fix round F1; red: profile)", async () => {
    for (const rows of [
      { missionaries: { data: null, error: { message: "timeout" } } },
      {
        missionaries: { data: [{ party_id: "party-w" }] },
        donors: { data: null, error: { message: "timeout" } },
      },
    ])
      expect(
        await callerGiftMismatches(
          tables(rows).supabase,
          stored({ profile: null }, "donor-w"),
          GIFT,
          PERSON,
        ),
      ).toBeNull();
  });

  function reads(rows: Record<string, { list?: unknown[]; single?: unknown }>) {
    const calls: string[] = [];
    const from = vi.fn((table: string) => {
      calls.push(table);
      const chain: Record<string, unknown> = {};
      for (const method of ["select", "eq", "limit"])
        chain[method] = () => chain;
      chain.maybeSingle = async () => ({
        data: rows[table]?.single ?? null,
        error: null,
      });
      chain.then = (resolve: (value: unknown) => unknown) =>
        resolve({ data: rows[table]?.list ?? [], error: null });
      return chain;
    });
    return { supabase: { from } as never, calls };
  }

  it("a login with an account link resolves through that link only: its linked Party holds no donor, and a worker row on another Party whose donor gave does not make that gift its own (WP5 rest 2b item zero, issue 2835's item 1; red: accepted through the worker row)", async () => {
    const { supabase, calls } = reads({
      account_links: { single: { party_id: "party-l" } },
      donors: { list: [], single: { party_id: "party-w" } },
      missionaries: { list: [{ party_id: "party-w" }] },
    });
    expect(
      await callerGiftMismatches(
        supabase,
        stored({ profile: null }, "donor-w"),
        GIFT,
        PERSON,
      ),
    ).toEqual(["profile"]);
    expect(calls).not.toContain("missionaries");
  });

  it("on the worker path the Party must hold exactly one donor, the one asked for: a worker's Party with two donors is refused (WP5 rest 2b item zero, issue 2835's item 1; red: accepted)", async () => {
    expect(
      await callerGiftMismatches(
        reads({
          missionaries: { list: [{ party_id: "party-w" }] },
          donors: {
            list: [{ id: "donor-w" }, { id: "donor-x" }],
            single: { party_id: "party-w" },
          },
        }).supabase,
        stored({ profile: null }, "donor-w"),
        GIFT,
        PERSON,
      ),
    ).toEqual(["profile"]);
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
