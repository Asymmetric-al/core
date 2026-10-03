import { describe, expect, it } from "vitest";

import { parseAdminContributionsParams } from "../../../../../packages/api/src/admin/contributions/query";
import { listAdminContributions } from "../../../../../packages/api/src/admin/contributions/service";

function makeDatabase(amount: number, refunded: number) {
  const donation = {
    id: "donation-1",
    tenant_id: "tenant-1",
    donor_id: null,
    missionary_id: null,
    fund_id: null,
    amount: 10_000,
    currency: "usd",
    status: "completed",
    donation_type: "one_time",
    payment_method: "card",
    is_recurring: false,
    recurring_interval: null,
    notes: null,
    stripe_payment_intent_id: "pi_1",
    gift_date: "2026-04-08",
    campaign_id: null,
    pledge_id: null,
    processed_at: null,
    completed_at: null,
    failed_at: null,
    error_code: null,
    error_message: null,
    stripe_charge_id: "ch_1",
    refunded_at: null,
    refund_amount: refunded,
    source: "online",
    created_at: "2026-04-08T10:00:00.000Z",
    updated_at: "2026-04-08T12:00:00.000Z",
  };
  const tables: Record<string, unknown[]> = {
    donations: [donation],
    staged_gifts: [],
    contribution_corrections: [{ donation_id: donation.id, status: "applied" }],
    contribution_correction_requests: [],
    contribution_adjustments: [
      {
        id: "adjustment-1",
        donation_id: donation.id,
        adjustment_type: "amount_correction",
        status: "applied",
        effective_values: { amountCents: amount },
        reason: "Correct recorded amount",
        actor_profile_id: "profile-1",
        source_surface: "contributions_hub",
        created_at: "2026-04-09T10:00:00.000Z",
      },
    ],
  };
  const database = {
    from(table: string) {
      if (!(table in tables)) {
        throw new Error(`Unexpected table ${table}`);
      }
      const result = { data: tables[table], error: null };
      const query = {
        select: () => query,
        eq: () => query,
        in: () => query,
        order: () => query,
        limit: () => Promise.resolve(result),
        then: (resolve: (value: typeof result) => unknown) =>
          Promise.resolve(result).then(resolve),
      };
      return query;
    },
  } as unknown as Parameters<typeof listAdminContributions>[0];
  return { database, donation };
}

describe("Contributions Hub refund basis", () => {
  it.each([
    [7_500, 7_500, "partial_refund", "completed"],
    [7_500, 8_000, "partial_refund", "completed"],
    [15_000, 10_000, "refunded", "refunded"],
    [7_500, 0, "none", "completed"],
  ] as const)(
    "preserves the original charge through Hub list assembly with corrected %i and refunded %i",
    async (amount, refunded, refundState, paymentStatus) => {
      const { database, donation } = makeDatabase(amount, refunded);
      const result = await listAdminContributions(
        database,
        "tenant-1",
        parseAdminContributionsParams(new URLSearchParams()),
      );
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toMatchObject({
        amount,
        amountGross: amount,
        // Legacy Hub status preserves payment vocabulary; shared status
        // carries refund classification and drives shared refund filtering.
        status: "completed",
        shared: {
          amountCents: amount,
          refundedAmountCents: refunded,
          refundState,
          paymentStatus,
        },
      });
      expect(donation.amount).toBe(10_000);
    },
  );
});
