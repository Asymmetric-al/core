import { describe, expect, it, vi } from "vitest";

import {
  beginGiftIntake,
  isReservedIdempotencyKey,
} from "../../../../../packages/api/src/donate/begin-gift-intake";
import { buildDonorPortalSnapshot } from "../../../../../packages/api/src/donor-portal/model";
import {
  COUNTED_INTAKE_FILTER,
  isCountedIntake,
  loadLineBasedGiftLines,
} from "../../../../../packages/api/src/shared/line-based-gifts";
import { donationStatusSchema } from "../../../../../packages/database/collections/schemas/giving";

import type { DonorPortalDonationRow } from "../../../../../packages/api/src/donor-portal/model";

const profile = {
  id: "p1",
  email: "giver@example.test",
  first_name: "Pat",
  last_name: "Giver",
  full_name: null,
  display_name: null,
  phone: null,
  avatar_url: null,
};

const donor = {
  id: "d1",
  tenant_id: "t1",
  profile_id: null,
  missionary_id: null,
  name: "Pat Giver",
  email: null,
  phone: null,
  mobile: null,
  preferred_contact: null,
  avatar_url: null,
  location: null,
  status: null,
  giving_preferences: null,
  total_given: null,
  first_gift_date: null,
  last_gift_date: null,
  last_gift_amount: null,
  gift_count: null,
  frequency: null,
  joined_date: null,
  receipt_email_frequency: null,
  default_update_frequency: null,
  preferred_language: null,
  do_not_contact: null,
  do_not_email: null,
  has_active_pledge: null,
  stripe_customer_id: null,
};

const row = (
  over: Partial<DonorPortalDonationRow>,
): DonorPortalDonationRow => ({
  id: "g1",
  amount: 10300,
  currency: "usd",
  status: "completed",
  donation_type: null,
  payment_method: "card",
  is_recurring: false,
  recurring_interval: null,
  gift_date: "2026-11-27T00:00:00Z",
  created_at: "2026-11-27T00:00:00Z",
  completed_at: null,
  processed_at: null,
  stripe_payment_intent_id: null,
  stripe_charge_id: null,
  fund: null,
  missionary: null,
  ...over,
});

const snapshot = (donations: DonorPortalDonationRow[]) =>
  buildDonorPortalSnapshot({
    profile,
    donor,
    donations,
    pledges: [],
    feedPreferences: null,
    now: new Date("2026-11-27T12:00:00Z"),
  });

describe("AL-2681 WP8a part 2 rest, PR 1: what a person reads of a line-based gift (plan :1161, :1162; R-35; ADR 0008)", () => {
  it("abandoned joins the browser's donation statuses", () => {
    expect(donationStatusSchema.parse("abandoned")).toBe("abandoned");
  });

  it("an unpaid or abandoned line-based intake counts nowhere; a legacy row keeps every status it has", () => {
    expect(COUNTED_INTAKE_FILTER).toBe(
      "intake_format.eq.legacy_header,status.in.(processing,completed,failed,refunded)",
    );
    for (const status of ["pending", "abandoned"])
      expect(isCountedIntake({ intake_format: "line_based", status })).toBe(
        false,
      );
    for (const status of ["processing", "completed", "failed", "refunded"])
      expect(isCountedIntake({ intake_format: "line_based", status })).toBe(
        true,
      );
    for (const status of ["pending", "abandoned", "completed"])
      expect(isCountedIntake({ intake_format: "legacy_header", status })).toBe(
        true,
      );
  });

  it("a paid line-based gift waiting for review reads Received (not yet receipted) and is designated from its first donor line by the worker's public name; a posted one reads Paid; a declined one Failed; a legacy gift reads as before", () => {
    const lines = [
      {
        donation_id: "g1",
        line_number: 1,
        fund_id: null,
        fund_name: null,
        missionary_id: "m1",
        worker_public_name: "Field Partner",
        is_fee_cover: false,
        amount: 10000,
      },
      {
        donation_id: "g1",
        line_number: 2,
        fund_id: "f-fee",
        fund_name: "Fee cover",
        missionary_id: null,
        worker_public_name: null,
        is_fee_cover: true,
        amount: 300,
      },
    ];
    const built = snapshot([
      row({
        id: "g1",
        intake_format: "line_based",
        staged_gift: { status: "needs_review" },
        lines,
      }),
      row({
        id: "g2",
        intake_format: "line_based",
        staged_gift: { status: "posted" },
        lines: lines.map((l) => ({ ...l, donation_id: "g2" })),
      }),
      row({
        id: "g3",
        intake_format: "line_based",
        status: "failed",
        lines: [],
      }),
      row({
        id: "g4",
        intake_format: "legacy_header",
        fund: { id: "f1", name: "Building" },
      }),
    ]);
    const byId = Object.fromEntries(built.donations.map((d) => [d.id, d]));
    expect(byId.g1).toMatchObject({
      status: "Received",
      designation: { id: "m1", name: "Field Partner", type: "missionary" },
      missionary: { id: "m1", name: "Field Partner" },
      fund: null,
    });
    expect(byId.g2!.status).toBe("Paid");
    expect(byId.g3!.status).toBe("Failed");
    expect(byId.g4).toMatchObject({
      status: "Paid",
      designation: { id: "f1", name: "Building", type: "fund" },
    });
  });

  function pagedRpc(pages: unknown[][]) {
    const ranges: Array<[number, number]> = [];
    const orders: string[] = [];
    const rpc = vi.fn(() => {
      const builder = {
        order: (column: string) => {
          orders.push(column);
          return builder;
        },
        range: (from: number, to: number) => {
          ranges.push([from, to]);
          return Promise.resolve({ data: pages.shift() ?? [], error: null });
        },
      };
      return builder;
    });
    return { rpc, ranges, orders };
  }

  const lineRow = (donation: string, number: number) => ({
    donation_id: donation,
    line_number: number,
    fund_id: "f1",
    fund_name: "Building",
    missionary_id: null,
    worker_public_name: null,
    is_fee_cover: false,
    amount: "500",
  });

  it("the lines read goes through public.line_based_gift_lines for the tenant and the named intakes only, in a fixed order, and nothing is read for none", async () => {
    const { rpc, orders } = pagedRpc([[lineRow("g1", 1)]]);
    const lines = await loadLineBasedGiftLines({ rpc }, "t1", ["g1"]);
    expect(rpc).toHaveBeenCalledWith("line_based_gift_lines", {
      p_tenant_id: "t1",
      p_donation_ids: ["g1"],
    });
    expect(orders).toEqual(["donation_id", "line_number"]);
    expect(lines.get("g1")).toEqual([expect.objectContaining({ amount: 500 })]);
    const none = vi.fn();
    expect((await loadLineBasedGiftLines({ rpc: none }, "t1", [])).size).toBe(
      0,
    );
    expect(none).not.toHaveBeenCalled();
  });

  it("F12: the lines read pages past the Data API's row cap, 500 lines a page, until a short page", async () => {
    const first = Array.from({ length: 500 }, (_, i) =>
      lineRow(`g${Math.floor(i / 5)}`, (i % 5) + 1),
    );
    const second = [lineRow("g100", 1), lineRow("g100", 2)];
    const { rpc, ranges } = pagedRpc([first, second]);
    const ids = Array.from({ length: 101 }, (_, i) => `g${i}`);
    const lines = await loadLineBasedGiftLines({ rpc }, "t1", ids);
    expect(ranges).toEqual([
      [0, 499],
      [500, 999],
    ]);
    expect([...lines.values()].flat()).toHaveLength(502);
    expect(lines.get("g100")).toHaveLength(2);
  });

  it("F6: the portal's figures count settled gifts and the same ones everywhere: a paid line-based gift is in lifetime given, the gift count and this year's total; a failed gift counts nowhere; a line-based gift has no receipt link, receipt count or statement year until WP8b gives it a receipt", () => {
    const fundLine = (donation: string, fund: string, amount: number) => [
      {
        donation_id: donation,
        line_number: 1,
        fund_id: fund,
        fund_name: `Fund ${fund}`,
        missionary_id: null,
        worker_public_name: null,
        is_fee_cover: false,
        amount,
      },
    ];
    const built = buildDonorPortalSnapshot({
      profile,
      donor: { ...donor, total_given: 2500, gift_count: 1 },
      donations: [
        row({
          id: "declined",
          intake_format: "line_based",
          status: "failed",
          amount: 7000,
          lines: fundLine("declined", "f-declined", 7000),
        }),
        row({
          id: "received",
          intake_format: "line_based",
          staged_gift: { status: "needs_review" },
          amount: 10300,
          lines: fundLine("received", "f-received", 10300),
        }),
        row({
          id: "posted",
          intake_format: "line_based",
          staged_gift: { status: "posted" },
          amount: 5000,
          lines: fundLine("posted", "f-posted", 5000),
        }),
        row({
          id: "legacy",
          intake_format: "legacy_header",
          amount: 2500,
          gift_date: "2025-03-01T00:00:00Z",
          fund: { id: "f-legacy", name: "Building" },
        }),
      ],
      pledges: [],
      feedPreferences: null,
      now: new Date("2026-11-27T12:00:00Z"),
    });
    expect(built.summary).toMatchObject({
      yearToDateCents: 15300,
      lifetimeGivenCents: 17800,
      giftCount: 3,
      supportedDesignationCount: 3,
      receiptCount: 1,
      statementYears: [2025],
      latestImpactLabel: "Fund f-received",
    });
    const byId = Object.fromEntries(built.donations.map((d) => [d.id, d]));
    for (const id of ["declined", "received", "posted"])
      expect(byId[id]).toMatchObject({ receiptUrl: null, statementYear: null });
    expect(byId.legacy).toMatchObject({
      receiptUrl: "/api/donor/receipts/legacy",
      statementYear: 2025,
    });
  });

  it("issue 2857 item 8: lifetime given and the gift count come from the settled aggregate the service reads with the list's ownership filters, not from the newest 250 gifts", () => {
    const built = buildDonorPortalSnapshot({
      profile,
      donor: { ...donor, total_given: 100, gift_count: 1 },
      donations: [row({ id: "one", amount: 2500 })],
      pledges: [],
      feedPreferences: null,
      now: new Date("2026-11-27T12:00:00Z"),
      lifetime: { givenCents: 1_234_500, giftCount: 312 },
    });
    expect(built.summary).toMatchObject({
      lifetimeGivenCents: 1_234_500,
      giftCount: 312,
    });
  });

  it("F6: with no stored totals, lifetime given and the gift count are the settled gifts' own; a failed or processing gift is in neither", () => {
    const built = buildDonorPortalSnapshot({
      profile,
      donor,
      donations: [
        row({ id: "failed", intake_format: "legacy_header", status: "failed" }),
        row({
          id: "processing",
          intake_format: "line_based",
          status: "processing",
          amount: 900,
          lines: [],
        }),
        row({ id: "paid", intake_format: "legacy_header", amount: 2500 }),
        row({
          id: "received",
          intake_format: "line_based",
          staged_gift: { status: "needs_review" },
          amount: 10300,
          lines: [],
        }),
      ],
      pledges: [],
      feedPreferences: null,
      now: new Date("2026-11-27T12:00:00Z"),
    });
    expect(built.summary).toMatchObject({
      lifetimeGivenCents: 12800,
      giftCount: 2,
      receiptCount: 1,
    });
  });
});

describe("AL-2681 WP8a part 2 rest, PR 1, ruling Q-C: beginGiftIntake refuses a key whose first five bytes, ASCII letters lowercased, are gift:", () => {
  const base = {
    tenantId: "t1",
    profileId: "p1",
    actorUserId: "u1",
    missionaryId: null,
    fundId: null,
    amountCents: 2500,
    currency: "usd",
    ipAddress: null,
    userAgent: null,
  };

  it("refuses gift:, GIFT:, Gift: and the same after the JavaScript trim (a no-break space included), before the saga is called", async () => {
    for (const key of [
      "gift:x",
      "GIFT:abc",
      "Gift:",
      "  gift:1:create_payment\n",
    ]) {
      const rpc = vi.fn();
      expect(
        await beginGiftIntake({ ...base, idempotencyKey: key, rpc }),
      ).toEqual({
        ok: false,
        code: "invalid",
        message: "Idempotency keys that begin with gift: are reserved.",
      });
      expect(rpc).not.toHaveBeenCalled();
    }
  });

  it("admits every other key: gift without the colon, a non-ASCII letter that lowercases to i, a fullwidth colon, the prefix later in the key", () => {
    for (const key of [
      "gift",
      "gift-1",
      "gİft:x",
      "gift：x",
      "x-gift:1",
      "gif:t",
    ])
      expect(isReservedIdempotencyKey(key)).toBe(false);
  });
});
