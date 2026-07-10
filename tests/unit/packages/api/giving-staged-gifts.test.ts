import { describe, expect, it, vi } from "vitest";

import {
  buildTwentyGiftSummaryPayload,
  canTransitionStagedGift,
  stageGiftFromStripeDonation,
  type StagedGiftRow,
} from "../../../../packages/api/src/giving/staged-gifts";

const gift: StagedGiftRow = {
  allocationStatus: "single_allocation",
  amount: 12345,
  crmOutboundJobId: null,
  crmPostStatus: "not_required",
  currency: "usd",
  donationId: "donation-1",
  donorId: "donor-1",
  donorMatchStatus: "matched",
  fundId: "fund-1",
  id: "staged-gift-1",
  metadata: {},
  missionaryId: "missionary-1",
  receiptStatus: "pending",
  reviewReason: null,
  status: "received",
  stripeChargeId: "ch_1",
  stripeEventId: "evt_1",
  stripePaymentIntentId: "pi_1",
  stripeRawEventId: "raw-1",
  tenantId: "tenant-1",
  twentyRecordId: null,
};

describe("giving staged gift helpers", () => {
  it("allows review-safe transitions and blocks terminal churn", () => {
    expect(canTransitionStagedGift("received", "ready_to_post")).toBe(true);
    expect(canTransitionStagedGift("ready_to_post", "posted")).toBe(true);
    expect(canTransitionStagedGift("posted", "ready_to_post")).toBe(false);
    expect(canTransitionStagedGift("voided", "ready_to_post")).toBe(false);
  });

  it("builds a summary-only Twenty payload without moving payment truth to CRM", () => {
    expect(buildTwentyGiftSummaryPayload(gift)).toEqual({
      amountCents: 12345,
      asymDonationId: "donation-1",
      asymStagedGiftId: "staged-gift-1",
      asymTenantId: "tenant-1",
      currencyCode: "usd",
      donorId: "donor-1",
      fundId: "fund-1",
      missionaryId: "missionary-1",
      paymentStatus: "received",
      receiptStatus: "pending",
      stripeChargeId: "ch_1",
      stripePaymentIntentId: "pi_1",
    });
  });
});

// ---- stageGiftFromStripeDonation resilience tests -------------------------

const baseDonation = {
  id: "donation-abc",
  tenant_id: "tenant-abc",
  donor_id: "donor-abc",
  missionary_id: null,
  fund_id: "fund-abc",
  amount: 5000,
  currency: "usd",
  status: "completed",
  stripe_payment_intent_id: "pi_abc",
  stripe_charge_id: "ch_abc",
};

const stagedGiftDbRow = {
  id: "sg-abc",
  tenant_id: "tenant-abc",
  donation_id: "donation-abc",
  donor_id: "donor-abc",
  missionary_id: null,
  fund_id: "fund-abc",
  stripe_raw_event_id: null,
  stripe_event_id: "evt_abc",
  stripe_payment_intent_id: "pi_abc",
  stripe_charge_id: "ch_abc",
  amount: 5000,
  currency: "usd",
  status: "received",
  donor_match_status: "matched",
  allocation_status: "single_allocation",
  review_reason: null,
  receipt_status: "pending",
  crm_post_status: "not_required",
  crm_outbound_job_id: null,
  twenty_record_id: null,
  metadata: { source: "stripe_webhook" },
};

const baseStageInput = {
  donation: baseDonation,
  rawEventId: null,
  stripeEventId: "evt_abc",
  stripePaymentIntentId: "pi_abc",
  stripeChargeId: "ch_abc",
};

/**
 * Build a minimal chainable Supabase mock that routes calls per table.
 * Each table entry describes what each chainable method returns.
 */
function buildSupabaseMock(
  tableHandlers: Record<
    string,
    () => {
      data?: unknown;
      error?: { message: string; code?: string } | null;
    }
  >,
) {
  const insertCalls: Record<string, unknown[][]> = {};
  const selectCalls: Record<string, unknown[]> = {};

  const mock = {
    from: vi.fn((table: string) => {
      const handler = tableHandlers[table];
      if (!handler) {
        throw new Error(`Unexpected table in mock: ${table}`);
      }

      // Track insert/select calls per table
      if (!insertCalls[table]) {
        insertCalls[table] = [];
      }
      if (!selectCalls[table]) {
        selectCalls[table] = [];
      }

      // Build a fluent chain where every method returns itself until a
      // terminal like maybeSingle/single/insert is reached.
      const chain: Record<string, unknown> = {};
      const terminal = () => Promise.resolve(handler());

      chain.select = vi.fn(() => chain);
      chain.insert = vi.fn((row: unknown) => {
        insertCalls[table].push(row as unknown[]);
        return chain;
      });
      chain.update = vi.fn(() => chain);
      chain.delete = vi.fn(() => chain);
      chain.eq = vi.fn(() => chain);
      chain.limit = vi.fn(() => chain);
      chain.single = terminal;
      chain.maybeSingle = terminal;
      chain.then = undefined;

      return chain;
    }),
    _insertCalls: insertCalls,
  };

  return mock;
}

describe("stageGiftFromStripeDonation resilience", () => {
  it("repairs a missing allocation on webhook retry (second call inserts allocation)", async () => {
    let stagedGiftsCallCount = 0;
    let allocationsCallCount = 0;
    let allocationsInsertCount = 0;

    const supabaseAdmin = {
      from: vi.fn((table: string) => {
        const chain: Record<string, unknown> = {};
        chain.eq = vi.fn(() => chain);
        chain.limit = vi.fn(() => chain);
        chain.select = vi.fn(() => chain);
        chain.insert = vi.fn(() => {
          if (table === "staged_gift_allocations") {
            allocationsInsertCount += 1;
          }
          return chain;
        });

        chain.single = vi.fn(() => {
          if (table === "staged_gifts") {
            stagedGiftsCallCount += 1;
            return Promise.resolve({ data: stagedGiftDbRow, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        });

        chain.maybeSingle = vi.fn(() => {
          if (table === "staged_gifts") {
            // Second call: gift already exists
            return Promise.resolve({ data: stagedGiftDbRow, error: null });
          }
          if (table === "staged_gift_allocations") {
            allocationsCallCount += 1;
            // No allocation rows exist yet — repair needed
            return Promise.resolve({ data: null, error: null });
          }
          if (table === "staged_gift_audit_events") {
            return Promise.resolve({ data: null, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        });

        return chain;
      }),
    } as never;

    const result = await stageGiftFromStripeDonation({
      ...baseStageInput,
      supabaseAdmin,
    });

    expect(result.id).toBe("sg-abc");
    expect(allocationsCallCount).toBeGreaterThanOrEqual(1);
    expect(allocationsInsertCount).toBe(1);
  });

  it("does not duplicate allocation when one already exists on retry", async () => {
    let allocationsInsertCount = 0;

    const supabaseAdmin = {
      from: vi.fn((table: string) => {
        const chain: Record<string, unknown> = {};
        chain.eq = vi.fn(() => chain);
        chain.limit = vi.fn(() => chain);
        chain.select = vi.fn(() => chain);
        chain.insert = vi.fn(() => {
          if (table === "staged_gift_allocations") {
            allocationsInsertCount += 1;
          }
          return chain;
        });

        chain.single = vi.fn(() =>
          Promise.resolve({ data: stagedGiftDbRow, error: null }),
        );

        chain.maybeSingle = vi.fn(() => {
          if (table === "staged_gifts") {
            // Gift already exists
            return Promise.resolve({ data: stagedGiftDbRow, error: null });
          }
          if (table === "staged_gift_allocations") {
            // Allocation already exists
            return Promise.resolve({
              data: { id: "alloc-existing" },
              error: null,
            });
          }
          return Promise.resolve({ data: null, error: null });
        });

        return chain;
      }),
    } as never;

    const result = await stageGiftFromStripeDonation({
      ...baseStageInput,
      supabaseAdmin,
    });

    expect(result.id).toBe("sg-abc");
    expect(allocationsInsertCount).toBe(0);
  });

  it("does not recreate full initial allocation when reviewed admin-split rows exist", async () => {
    let allocationsInsertCount = 0;

    const supabaseAdmin = {
      from: vi.fn((table: string) => {
        const chain: Record<string, unknown> = {};
        chain.eq = vi.fn(() => chain);
        chain.limit = vi.fn(() => chain);
        chain.select = vi.fn(() => chain);
        chain.insert = vi.fn(() => {
          if (table === "staged_gift_allocations") {
            allocationsInsertCount += 1;
          }
          return chain;
        });

        chain.single = vi.fn(() =>
          Promise.resolve({ data: stagedGiftDbRow, error: null }),
        );

        chain.maybeSingle = vi.fn(() => {
          if (table === "staged_gifts") {
            return Promise.resolve({ data: stagedGiftDbRow, error: null });
          }
          if (table === "staged_gift_allocations") {
            return Promise.resolve({
              data: { id: "alloc-reviewed-split" },
              error: null,
            });
          }
          return Promise.resolve({ data: null, error: null });
        });

        return chain;
      }),
    } as never;

    await stageGiftFromStripeDonation({
      ...baseStageInput,
      supabaseAdmin,
    });

    expect(allocationsInsertCount).toBe(0);
  });

  it("skips allocation read and insert entirely for zero-amount gift", async () => {
    let allocationsCallCount = 0;
    let allocationsInsertCount = 0;

    const supabaseAdmin = {
      from: vi.fn((table: string) => {
        const chain: Record<string, unknown> = {};
        chain.eq = vi.fn(() => chain);
        chain.limit = vi.fn(() => chain);
        chain.select = vi.fn(() => chain);
        chain.insert = vi.fn(() => {
          if (table === "staged_gift_allocations") {
            allocationsInsertCount += 1;
          }
          return chain;
        });

        chain.single = vi.fn(() => {
          if (table === "staged_gifts") {
            return Promise.resolve({
              data: { ...stagedGiftDbRow, amount: 0 },
              error: null,
            });
          }
          return Promise.resolve({ data: null, error: null });
        });

        chain.maybeSingle = vi.fn(() => {
          if (table === "staged_gifts") {
            // Return existing gift with amount 0
            return Promise.resolve({
              data: { ...stagedGiftDbRow, amount: 0 },
              error: null,
            });
          }
          if (table === "staged_gift_allocations") {
            allocationsCallCount += 1;
            return Promise.resolve({ data: null, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        });

        return chain;
      }),
    } as never;

    const zeroDonation = { ...baseDonation, amount: 0 };
    const result = await stageGiftFromStripeDonation({
      ...baseStageInput,
      donation: zeroDonation,
      supabaseAdmin,
    });

    expect(result.amount).toBe(0);
    expect(allocationsCallCount).toBe(0);
    expect(allocationsInsertCount).toBe(0);
  });

  it("does not throw when audit event insert fails — returns the staged gift", async () => {
    let auditInsertAttempted = false;

    const supabaseAdmin = {
      from: vi.fn((table: string) => {
        const chain: Record<string, unknown> = {};
        chain.eq = vi.fn(() => chain);
        chain.limit = vi.fn(() => chain);
        chain.select = vi.fn(() => chain);
        chain.insert = vi.fn(() => {
          if (table === "staged_gift_audit_events") {
            auditInsertAttempted = true;
            // Return as a thenable for the .insert() direct await path
            const failResult = {
              data: null,
              error: { message: "audit write failed" },
            };
            // Need to return a chain with a then-able for direct destructuring
            return Promise.resolve(failResult);
          }
          // allocations insert succeeds
          return chain;
        });

        chain.single = vi.fn(() => {
          if (table === "staged_gifts") {
            return Promise.resolve({ data: stagedGiftDbRow, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        });

        chain.maybeSingle = vi.fn(() => {
          if (table === "staged_gifts") {
            // No existing gift — fresh insert path
            return Promise.resolve({ data: null, error: null });
          }
          if (table === "staged_gift_allocations") {
            // No existing allocation
            return Promise.resolve({ data: null, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        });

        return chain;
      }),
    } as never;

    const result = await stageGiftFromStripeDonation({
      ...baseStageInput,
      supabaseAdmin,
    });

    expect(result.id).toBe("sg-abc");
    expect(auditInsertAttempted).toBe(true);
  });

  it("does not throw when allocation insert returns 23505 (concurrent webhook delivery)", async () => {
    // Simulates two concurrent webhook deliveries for the same payment_intent.
    // The concurrent loser: staged gift already exists (or was just inserted),
    // no allocation row is visible yet (both workers pass the existence check),
    // and the allocation insert races and loses — returning 23505. The function
    // must resolve successfully instead of throwing.
    const supabaseAdmin = {
      from: vi.fn((table: string) => {
        const chain: Record<string, unknown> = {};
        chain.eq = vi.fn(() => chain);
        chain.limit = vi.fn(() => chain);
        chain.select = vi.fn(() => chain);
        chain.insert = vi.fn(() => {
          if (table === "staged_gift_allocations") {
            // The concurrent peer already committed — unique index fires.
            return Promise.resolve({
              data: null,
              error: { message: "duplicate key value", code: "23505" },
            });
          }
          return chain;
        });

        chain.single = vi.fn(() => {
          if (table === "staged_gifts") {
            return Promise.resolve({ data: stagedGiftDbRow, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        });

        chain.maybeSingle = vi.fn(() => {
          if (table === "staged_gifts") {
            // Gift already exists (concurrent winner inserted it).
            return Promise.resolve({ data: stagedGiftDbRow, error: null });
          }
          if (table === "staged_gift_allocations") {
            // No allocation visible yet — both workers pass the read check.
            return Promise.resolve({ data: null, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        });

        return chain;
      }),
    } as never;

    const result = await stageGiftFromStripeDonation({
      ...baseStageInput,
      supabaseAdmin,
    });

    // Concurrent loser should resolve with the staged gift, not throw.
    expect(result.id).toBe("sg-abc");
  });

  it("throws when staged gift insert returns no row", async () => {
    const supabaseAdmin = {
      from: vi.fn((table: string) => {
        const chain: Record<string, unknown> = {};
        chain.eq = vi.fn(() => chain);
        chain.limit = vi.fn(() => chain);
        chain.select = vi.fn(() => chain);
        chain.insert = vi.fn(() => chain);

        chain.single = vi.fn(() => {
          if (table === "staged_gifts") {
            // Insert succeeded (no error) but returned null data
            return Promise.resolve({ data: null, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        });

        chain.maybeSingle = vi.fn(() => {
          if (table === "staged_gifts") {
            // No existing gift
            return Promise.resolve({ data: null, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        });

        return chain;
      }),
    } as never;

    await expect(
      stageGiftFromStripeDonation({
        ...baseStageInput,
        supabaseAdmin,
      }),
    ).rejects.toThrow("Staged gift insert returned no row.");
  });
});
