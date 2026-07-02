import { describe, expect, it } from "vitest";

import {
  applyEffectiveContributionToDonation,
  assembleSharedContributionEffectiveState,
  buildSharedContributionDesignationSets,
  collectSharedContributionLookupIds,
  loadSharedContributionRowInputs,
  toContributionCents,
} from "../../../../../packages/api/src/admin/contribution-shared/row-inputs";
import { buildContributionGridRow } from "../../../../../packages/api/src/admin/contributions/model";
import { buildCrmGiftHistoryRow } from "../../../../../packages/api/src/admin/crm/detail/gift-history";

import type {
  DesignationAllocationInput,
  DesignationFundInput,
} from "../../../../../packages/api/src/admin/contribution-shared/designation-set";

const donation = {
  id: "donation-1",
  donor_id: "donor-1",
  missionary_id: "missionary-1",
  fund_id: "fund-1",
  amount: 25_000,
  currency: "usd",
  status: "completed",
  gift_date: "2026-04-08",
  refund_amount: 0,
  refunded_at: null,
  created_at: "2026-04-08T10:00:00.000Z",
  updated_at: "2026-04-08T12:00:00.000Z",
};

const donor = {
  id: "donor-1",
  name: "Alice Johnson",
  email: "alice@example.com",
};

const funds = new Map<string, DesignationFundInput>([
  [
    "fund-1",
    {
      id: "fund-1",
      name: "Clean Water Initiative",
      missionary_id: null,
      goal_amount: 100_000,
      start_date: null,
      end_date: null,
    },
  ],
  [
    "fund-2",
    {
      id: "fund-2",
      name: "Martinez Family Support",
      missionary_id: "missionary-1",
      goal_amount: null,
      start_date: null,
      end_date: null,
    },
  ],
]);

const missionaries = new Map<string, string | null>([
  ["missionary-1", "John Martinez"],
]);

const appliedAmountAdjustment = {
  id: "adjustment-1",
  donation_id: "donation-1",
  adjustment_type: "amount_correction",
  status: "applied",
  effective_values: { amountCents: 30_000, fundId: "fund-2" },
  reason: "Donor intended a larger split gift.",
  actor_profile_id: "profile-1",
  source_surface: "contributions_hub",
  created_at: "2026-04-10T09:00:00.000Z",
};

describe("admin/contribution-shared/row-inputs", () => {
  it("normalizes BIGINT amounts that arrive as strings", () => {
    expect(toContributionCents("25000")).toBe(25_000);
    expect(toContributionCents(25_000.4)).toBe(25_000);
    expect(toContributionCents(null)).toBe(0);
    expect(toContributionCents("not-a-number")).toBe(0);
  });

  it("merges corrections and pending requests into one correction list", () => {
    const { correctionsByDonationId } =
      assembleSharedContributionEffectiveState({
        donations: [donation],
        corrections: [{ donation_id: "donation-1", status: "applied" }],
        correctionRequests: [{ donation_id: "donation-1", status: "pending" }],
        adjustments: [],
      });

    expect(correctionsByDonationId.get("donation-1")).toEqual([
      { status: "applied" },
      { status: "pending" },
    ]);
  });

  it("derives effective values from applied adjustments only", () => {
    const { effectiveByDonationId } = assembleSharedContributionEffectiveState({
      donations: [donation],
      corrections: [],
      correctionRequests: [],
      adjustments: [
        appliedAmountAdjustment,
        {
          ...appliedAmountAdjustment,
          id: "adjustment-2",
          status: "reversed",
          effective_values: { amountCents: 1 },
          created_at: "2026-04-11T09:00:00.000Z",
        },
      ],
    });

    const effective = effectiveByDonationId.get("donation-1")?.effective;
    expect(effective).toEqual({
      amountCents: 30_000,
      fundId: "fund-2",
      missionaryId: "missionary-1",
      paymentStatus: "completed",
    });
  });

  it("applies effective values onto the donation row for grid derivation", () => {
    const { effectiveByDonationId } = assembleSharedContributionEffectiveState({
      donations: [donation],
      corrections: [],
      correctionRequests: [],
      adjustments: [appliedAmountAdjustment],
    });

    const effectiveDonation = applyEffectiveContributionToDonation(
      donation,
      effectiveByDonationId,
    );
    expect(effectiveDonation.amount).toBe(30_000);
    expect(effectiveDonation.fund_id).toBe("fund-2");

    const untouched = applyEffectiveContributionToDonation(
      { ...donation, id: "donation-unknown" },
      effectiveByDonationId,
    );
    expect(untouched.amount).toBe(25_000);
  });

  it("collects lookup ids from donations, staged gifts, allocations, effective values, and extras", () => {
    const { effectiveByDonationId } = assembleSharedContributionEffectiveState({
      donations: [donation],
      corrections: [],
      correctionRequests: [],
      adjustments: [appliedAmountAdjustment],
    });

    const { fundIds, missionaryIds } = collectSharedContributionLookupIds({
      donations: [donation],
      stagedGifts: [
        {
          id: "staged-1",
          donation_id: "donation-1",
          fund_id: "fund-3",
          missionary_id: null,
        },
      ],
      allocations: [
        {
          id: "alloc-1",
          staged_gift_id: "staged-1",
          amount: 10_000,
          fund_id: "fund-4",
          missionary_id: "missionary-2",
          memo: null,
        },
      ],
      effectiveByDonationId,
      extraFundIds: ["fund-5", null],
      extraMissionaryIds: ["missionary-3", undefined],
    });

    expect(fundIds.sort()).toEqual([
      "fund-1",
      "fund-2",
      "fund-3",
      "fund-4",
      "fund-5",
    ]);
    expect(missionaryIds.sort()).toEqual([
      "missionary-1",
      "missionary-2",
      "missionary-3",
    ]);
  });

  it("builds designation sets that reconcile to the effective gift amount", () => {
    const { effectiveByDonationId } = assembleSharedContributionEffectiveState({
      donations: [donation],
      corrections: [],
      correctionRequests: [],
      adjustments: [appliedAmountAdjustment],
    });

    const allocationsByStagedGiftId = new Map<
      string,
      DesignationAllocationInput[]
    >([
      [
        "staged-1",
        [
          {
            id: "alloc-1",
            amount: 10_000,
            fund_id: "fund-1",
            missionary_id: null,
            memo: null,
          },
          {
            id: "alloc-2",
            amount: 20_000,
            fund_id: "fund-2",
            missionary_id: "missionary-1",
            memo: null,
          },
        ],
      ],
    ]);

    const sets = buildSharedContributionDesignationSets({
      donations: [donation],
      stagedGifts: [{ id: "staged-1", donation_id: "donation-1" }],
      allocationsByStagedGiftId,
      effectiveByDonationId,
      funds,
      missionaries,
    });

    const set = sets.get("donation-1");
    expect(set?.lines).toHaveLength(2);
    expect(set?.totalAmountCents).toBe(30_000);
    expect(set?.reconcilesToGiftAmount).toBe(true);
  });

  it("falls back to a single effective-amount line when no allocations exist", () => {
    const { effectiveByDonationId } = assembleSharedContributionEffectiveState({
      donations: [donation],
      corrections: [],
      correctionRequests: [],
      adjustments: [appliedAmountAdjustment],
    });

    const sets = buildSharedContributionDesignationSets({
      donations: [donation],
      stagedGifts: [],
      allocationsByStagedGiftId: new Map(),
      effectiveByDonationId,
      funds,
      missionaries,
    });

    const set = sets.get("donation-1");
    expect(set?.lines).toHaveLength(1);
    expect(set?.lines[0]?.fundId).toBe("fund-2");
    expect(set?.lines[0]?.amountCents).toBe(30_000);
    expect(set?.reconcilesToGiftAmount).toBe(true);
  });

  it("prefers replacement designation lines from applied allocation adjustments", () => {
    const { effectiveByDonationId } = assembleSharedContributionEffectiveState({
      donations: [donation],
      corrections: [],
      correctionRequests: [],
      adjustments: [
        {
          ...appliedAmountAdjustment,
          effective_values: {
            amountCents: 30_000,
            designationLines: [
              {
                id: "line-1",
                amountCents: 30_000,
                fundId: "fund-2",
                missionaryId: "missionary-1",
                memo: "Reassigned by correction",
              },
            ],
          },
        },
      ],
    });

    const sets = buildSharedContributionDesignationSets({
      donations: [donation],
      stagedGifts: [{ id: "staged-1", donation_id: "donation-1" }],
      allocationsByStagedGiftId: new Map([
        [
          "staged-1",
          [
            {
              id: "alloc-1",
              amount: 25_000,
              fund_id: "fund-1",
              missionary_id: null,
              memo: null,
            },
          ],
        ],
      ]),
      effectiveByDonationId,
      funds,
      missionaries,
    });

    const set = sets.get("donation-1");
    expect(set?.lines).toHaveLength(1);
    expect(set?.lines[0]?.id).toBe("line-1");
    expect(set?.lines[0]?.memo).toBe("Reassigned by correction");
    expect(set?.reconcilesToGiftAmount).toBe(true);
  });

  it("tenant-scopes every loader query, including fund and missionary lookups", async () => {
    type ChainCall = [method: string, args: unknown[]];
    const chainsByTable = new Map<string, ChainCall[][]>();

    function createQueryStub(table: string) {
      const calls: ChainCall[] = [];
      const existing = chainsByTable.get(table) ?? [];
      existing.push(calls);
      chainsByTable.set(table, existing);

      const builder = {
        select: (...args: unknown[]) => {
          calls.push(["select", args]);
          return builder;
        },
        eq: (...args: unknown[]) => {
          calls.push(["eq", args]);
          return builder;
        },
        in: (...args: unknown[]) => {
          calls.push(["in", args]);
          return builder;
        },
        order: (...args: unknown[]) => {
          calls.push(["order", args]);
          return builder;
        },
        then: (
          resolve: (value: { data: unknown[]; error: null }) => unknown,
          reject?: (reason: unknown) => unknown,
        ) => Promise.resolve({ data: [], error: null }).then(resolve, reject),
      };
      return builder;
    }

    const supabaseStub = {
      from: (table: string) => createQueryStub(table),
    } as unknown as Parameters<typeof loadSharedContributionRowInputs>[0];

    await loadSharedContributionRowInputs(supabaseStub, {
      tenantId: "tenant-1",
      donations: [donation],
      stagedGifts: [{ id: "staged-1", donation_id: "donation-1" }],
    });

    const expectTenantScoped = (table: string) => {
      const chains = chainsByTable.get(table);
      expect(chains, `expected a query against ${table}`).toBeDefined();
      for (const calls of chains ?? []) {
        expect(
          calls.some(
            ([method, args]) =>
              method === "eq" &&
              args[0] === "tenant_id" &&
              args[1] === "tenant-1",
          ),
          `expected the ${table} query to filter on tenant_id`,
        ).toBe(true);
      }
    };

    expectTenantScoped("contribution_corrections");
    expectTenantScoped("contribution_correction_requests");
    expectTenantScoped("contribution_adjustments");
    expectTenantScoped("staged_gift_allocations");
    expectTenantScoped("funds");
    expectTenantScoped("missionaries");
  });
});

describe("CRM and Hub display parity through the shared assembly path (#256)", () => {
  it("derives identical shared fields for a corrected split gift on both surfaces", () => {
    const stagedGift = {
      id: "staged-1",
      donation_id: "donation-1",
      fund_id: null,
      missionary_id: null,
      status: "posted",
      receipt_status: "sent",
      crm_post_status: "posted",
    };
    const allocationsByStagedGiftId = new Map<
      string,
      DesignationAllocationInput[]
    >([
      [
        "staged-1",
        [
          {
            id: "alloc-1",
            amount: 10_000,
            fund_id: "fund-1",
            missionary_id: null,
            memo: null,
          },
          {
            id: "alloc-2",
            amount: 20_000,
            fund_id: "fund-2",
            missionary_id: "missionary-1",
            memo: null,
          },
        ],
      ],
    ]);

    // One shared assembly, exactly like loadSharedContributionRowInputs.
    const { correctionsByDonationId, effectiveByDonationId } =
      assembleSharedContributionEffectiveState({
        donations: [donation],
        corrections: [{ donation_id: "donation-1", status: "applied" }],
        correctionRequests: [{ donation_id: "donation-1", status: "pending" }],
        adjustments: [appliedAmountAdjustment],
      });
    const designationSetByDonationId = buildSharedContributionDesignationSets({
      donations: [donation],
      stagedGifts: [stagedGift],
      allocationsByStagedGiftId,
      effectiveByDonationId,
      funds,
      missionaries,
    });
    const fundNamesById = new Map(
      Array.from(funds.values()).map((fund) => [fund.id, fund.name]),
    );

    // Contributions Hub assembly (mirrors listAdminContributions).
    const hubDonation = applyEffectiveContributionToDonation(
      {
        ...donation,
        donation_type: "one_time",
        payment_method: "card",
        is_recurring: false,
        recurring_interval: null,
        notes: null,
        stripe_payment_intent_id: "pi_1",
        campaign_id: null,
        pledge_id: null,
        processed_at: null,
        completed_at: null,
        failed_at: null,
        error_code: null,
        error_message: null,
        stripe_charge_id: null,
        source: "online",
      },
      effectiveByDonationId,
    );
    const hubRow = buildContributionGridRow({
      donation: hubDonation,
      donor: {
        ...donor,
        phone: null,
        type: null,
        location: null,
        organization: null,
        notes: null,
      },
      profile: null,
      fund: hubDonation.fund_id
        ? {
            id: hubDonation.fund_id,
            name: fundNamesById.get(hubDonation.fund_id) ?? null,
          }
        : null,
      missionary: hubDonation.missionary_id
        ? {
            id: hubDonation.missionary_id,
            display_name: missionaries.get(hubDonation.missionary_id) ?? null,
          }
        : null,
      stagedGift: {
        id: stagedGift.id,
        status: stagedGift.status,
        review_reason: null,
        receipt_status: stagedGift.receipt_status,
        receipt_send_log_id: null,
        crm_post_status: stagedGift.crm_post_status,
      },
      corrections: correctionsByDonationId.get("donation-1"),
      designationSet: designationSetByDonationId.get("donation-1"),
    });

    // CRM gift history assembly (mirrors getAdminCrmDonorDetail).
    const effective = effectiveByDonationId.get("donation-1")!.effective;
    const crmRow = buildCrmGiftHistoryRow({
      designationSet: designationSetByDonationId.get("donation-1"),
      donation: {
        id: donation.id,
        donor_id: donation.donor_id,
        missionary_id: effective.missionaryId,
        fund_id: effective.fundId,
        amount: effective.amountCents,
        currency: donation.currency,
        status: effective.paymentStatus,
        gift_date: donation.gift_date,
        refund_amount: donation.refund_amount,
        refunded_at: donation.refunded_at,
        created_at: donation.created_at,
        updated_at: donation.updated_at,
        is_recurring: false,
        recurring_interval: null,
        pledge_id: null,
      },
      donor,
      fund: effective.fundId
        ? {
            id: effective.fundId,
            name: fundNamesById.get(effective.fundId) ?? null,
          }
        : null,
      missionary: effective.missionaryId
        ? {
            id: effective.missionaryId,
            display_name: missionaries.get(effective.missionaryId) ?? null,
          }
        : null,
      stagedGift: {
        id: stagedGift.id,
        status: stagedGift.status,
        receipt_status: stagedGift.receipt_status,
        crm_post_status: stagedGift.crm_post_status,
        twenty_record_id: null,
      },
      corrections: correctionsByDonationId.get("donation-1"),
      provider: { stripePaymentIntentId: "pi_1", stripeChargeId: null },
    });

    // The acceptance criterion: same gift, same shared field values.
    expect(crmRow.shared).toEqual(hubRow.shared);

    // The corrected effective truth shows on both surfaces.
    expect(hubRow.shared.amountCents).toBe(30_000);
    expect(hubRow.shared.correctionState).toBe("pending");
    expect(hubRow.shared.paymentStatus).toBe("completed");
    expect(hubRow.shared.designationSummary).toEqual({
      fundId: null,
      fundName: "2 designations",
      missionaryId: null,
      missionaryName: null,
      lineCount: 2,
    });
  });
});
