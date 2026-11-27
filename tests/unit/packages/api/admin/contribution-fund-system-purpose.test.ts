import { describe, expect, it } from "vitest";

import { loadDesignationSetData } from "../../../../../packages/api/src/admin/contribution-operations/operations";
import { resolveSharedFundDisplayName } from "../../../../../packages/api/src/admin/contribution-shared/row-contract";

type Rows = Record<string, Record<string, unknown>[]>;

function fakeAdmin(rows: Rows) {
  const selects: Record<string, string> = {};
  return {
    selects,
    client: {
      from(table: string) {
        const result = { data: rows[table] ?? [], error: null };
        const builder = {
          select(columns: string) {
            selects[table] = columns;
            return builder;
          },
          eq: () => builder,
          in: () => builder,
          order: () => builder,
          then: (resolve: (value: typeof result) => unknown) => resolve(result),
        };
        return builder;
      },
    },
  };
}

describe("AL-2681 WP8a part 2 rest, PR 1, issue 2776: the contribution detail's fund metadata carries funds.system_purpose", () => {
  it("selects system_purpose and maps it, so the fee-cover fund is named as the list names it", async () => {
    const admin = fakeAdmin({
      staged_gift_allocations: [
        {
          id: "a1",
          amount: 300,
          fund_id: "5d1b0a47-4b2f-4b4a-9c39-2f6f2b7a9e10",
          missionary_id: null,
          memo: null,
        },
      ],
      funds: [
        {
          id: "5d1b0a47-4b2f-4b4a-9c39-2f6f2b7a9e10",
          name: "Processing",
          missionary_id: null,
          goal_amount: null,
          start_date: null,
          end_date: null,
          system_purpose: "fee_cover",
        },
      ],
    });
    const data = await loadDesignationSetData({
      supabaseAdmin: admin.client as never,
      tenantId: "t1",
      stagedGiftId: "7e0c0a51-9f3c-4a1d-8a52-5f0b7f2a8c11",
      donationFundId: null,
      extraFundIds: [],
      extraMissionaryIds: [],
    });
    expect(admin.selects.funds).toContain("system_purpose");
    expect(data.funds).toEqual([
      expect.objectContaining({
        id: "5d1b0a47-4b2f-4b4a-9c39-2f6f2b7a9e10",
        system_purpose: "fee_cover",
      }),
    ]);
    expect(resolveSharedFundDisplayName(data.funds[0]!)).toBe("Fee cover");
  });
});
