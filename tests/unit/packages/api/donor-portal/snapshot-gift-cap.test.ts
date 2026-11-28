import { describe, expect, it } from "vitest";

import { getDonorPortalSnapshot } from "../../../../../packages/api/src/donor-portal/service";

type Row = Record<string, unknown>;

/** Answers each table's query, honoring `.limit()` like PostgREST. */
function fakeAdmin(donations: Row[], pledges: Row[] = []) {
  const limits: number[] = [];
  const rpcs: Array<{ fn: string; args: Row }> = [];
  const client = {
    rpc: (fn: string, args: Row) => {
      rpcs.push({ fn, args });
      return Promise.resolve({
        data:
          fn === "donor_portal_lifetime" || fn === "donor_portal_login_lifetime"
            ? [{ given_cents: 0, gift_count: 0 }]
            : [],
        error: null,
      });
    },
    from(table: string) {
      let limit: number | null = null;
      const answer = () => {
        if (table === "profiles") {
          return {
            data: { id: "p-1", display_name: "Dana", user_id: "u-1" },
            error: null,
          };
        }
        if (table === "account_links") {
          return { data: { party_id: "party-1" }, error: null };
        }
        if (table === "donors") {
          return { data: [{ id: "d-1", tenant_id: "t-1" }], error: null };
        }
        if (table === "donations") {
          return {
            data: limit === null ? donations : donations.slice(0, limit),
            error: null,
          };
        }
        if (table === "donor_pledges") {
          return {
            data: limit === null ? pledges : pledges.slice(0, limit),
            error: null,
          };
        }
        return { data: null, error: null };
      };
      const query: Row = {
        select: () => query,
        eq: () => query,
        or: () => query,
        order: () => query,
        limit: (count: number) => {
          limit = count;
          if (table === "donations") limits.push(count);
          return query;
        },
        single: () => Promise.resolve(answer()),
        maybeSingle: () => Promise.resolve(answer()),
        then: (ok: (value: unknown) => unknown) =>
          Promise.resolve(answer()).then(ok),
      };
      return query;
    },
  };
  return { client: client as never, limits, rpcs };
}

function gifts(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `g-${index}`,
    amount: 1000,
    currency: "usd",
    status: "completed",
    gift_date: "2026-03-01",
    created_at: "2026-03-01T00:00:00.000Z",
  }));
}

describe("donor portal snapshot gift list (D-18, AL-2678 WP5 rest: the fake answers the person's account link and a list of at most two donors on its Party; D-18, AL-2681: the fake answers .or, the filter that keeps the person's own and counted gifts, and the read of the login's gifts without a donor, none (fix round F2))", () => {
  it("carries the newest 250 gifts and says when older gifts were left out", async () => {
    const { client } = fakeAdmin(gifts(300));

    const snapshot = await getDonorPortalSnapshot({
      supabaseAdmin: client,
      profileId: "p-1",
      tenantId: "t-1",
    });

    expect(snapshot.donations).toHaveLength(250);
    expect(snapshot.donationsComplete).toBe(false);
  });

  it("says the list is complete when every gift fits", async () => {
    const { client } = fakeAdmin(gifts(250));

    const snapshot = await getDonorPortalSnapshot({
      supabaseAdmin: client,
      profileId: "p-1",
      tenantId: "t-1",
    });

    expect(snapshot.donations).toHaveLength(250);
    expect(snapshot.donationsComplete).toBe(true);
  });
});

describe("donor portal snapshot recurring gifts (D-18, AL-2681: the fake answers .or, the filter that keeps the person's own and counted gifts, and the read of the login's gifts without a donor, none (fix round F2))", () => {
  it("says when recurring gifts past the newest 100 were left out", async () => {
    const pledges = Array.from({ length: 120 }, (_, index) => ({
      id: `p-${index}`,
      amount: 1000,
      currency: "usd",
      frequency: "monthly",
      status: index === 119 ? "active" : "cancelled",
      created_at: "2026-03-01T00:00:00.000Z",
    }));
    const { client } = fakeAdmin([], pledges);

    const snapshot = await getDonorPortalSnapshot({
      supabaseAdmin: client,
      profileId: "p-1",
      tenantId: "t-1",
    });

    expect(snapshot.recurringGifts).toHaveLength(100);
    expect(snapshot.recurringGiftsComplete).toBe(false);
  });

  it("says the recurring gifts are complete when they all fit", async () => {
    const { client } = fakeAdmin([], []);
    const snapshot = await getDonorPortalSnapshot({
      supabaseAdmin: client,
      profileId: "p-1",
      tenantId: "t-1",
    });
    expect(snapshot.recurringGiftsComplete).toBe(true);
  });
});

describe("donor portal snapshot refunds (D-18, AL-2681: the fake answers .or, the filter that keeps the person's own and counted gifts, and the read of the login's gifts without a donor, none (fix round F2))", () => {
  it("carries each gift's refunded amount", async () => {
    const { client } = fakeAdmin([
      { ...gifts(1)[0], id: "g-r", amount: 10000, refund_amount: 4000 },
    ]);
    const snapshot = await getDonorPortalSnapshot({
      supabaseAdmin: client,
      profileId: "p-1",
      tenantId: "t-1",
    });
    expect(snapshot.donations[0]).toMatchObject({
      amountCents: 10000,
      refundedAmountCents: 4000,
      refundedAmount: 40,
    });
  });
});

describe("AL-2681 PR 2b, issue 2857 item 36: the lifetime figures are read by login, with no capped list", () => {
  it("the snapshot reads donor_portal_login_lifetime with the tenant, the donor and the login, and passes no gift list", async () => {
    const { client, rpcs } = fakeAdmin(gifts(3));
    await getDonorPortalSnapshot({
      supabaseAdmin: client,
      profileId: "p-1",
      tenantId: "t-1",
    });
    const lifetime = rpcs.filter((r) => /lifetime/.test(r.fn));
    expect(lifetime).toEqual([
      {
        fn: "donor_portal_login_lifetime",
        args: { p_tenant_id: "t-1", p_donor_id: "d-1", p_login_id: "u-1" },
      },
    ]);
  });
});
