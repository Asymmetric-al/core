import { describe, expect, it } from "vitest";

import { getDonorPortalSnapshot } from "../../../../../packages/api/src/donor-portal/service";

type Row = Record<string, unknown>;

/** Answers each table's query, honoring `.limit()` like PostgREST. */
function fakeAdmin(donations: Row[]) {
  const limits: number[] = [];
  const client = {
    from(table: string) {
      let limit: number | null = null;
      const answer = () => {
        if (table === "profiles") {
          return { data: { id: "p-1", display_name: "Dana" }, error: null };
        }
        if (table === "donors") {
          return { data: { id: "d-1", tenant_id: "t-1" }, error: null };
        }
        if (table === "donations") {
          return {
            data: limit === null ? donations : donations.slice(0, limit),
            error: null,
          };
        }
        if (table === "donor_pledges") return { data: [], error: null };
        return { data: null, error: null };
      };
      const query: Row = {
        select: () => query,
        eq: () => query,
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
  return { client: client as never, limits };
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

describe("donor portal snapshot gift list", () => {
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
