import { describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Pure donor overview model at its app boundary.
import {
  giveHref,
  givenThisYear,
  lastSupported,
  nextScheduledGift,
  noNextGiftNote,
  overviewAlerts,
  statementPromptYear,
} from "../../../../apps/donor/features/donor/components/overview/overview-model";

const NOW = new Date(2026, 10, 11, 12);

const jordan = { id: "m-jordan", name: "Jordan Hale", avatarUrl: null };
const team = { id: "m-team", name: "Field Team 1", avatarUrl: null };

const donation = (overrides: Record<string, unknown>) => ({
  id: "d",
  date: "2026-11-05T15:00:00.000Z",
  amountCents: 5_000,
  amount: 50,
  currency: "usd",
  status: "Paid",
  type: "Recurring",
  method: "Card",
  receiptUrl: "",
  statementYear: 2026,
  designation: {
    id: "m-jordan",
    name: "Jordan Hale",
    type: "missionary",
    avatarUrl: null,
  },
  missionary: jordan,
  fund: null,
  ...overrides,
});

const recurring = (overrides: Record<string, unknown>) => ({
  id: "r",
  amountCents: 5_000,
  amount: 50,
  currency: "usd",
  frequency: "monthly",
  status: "active",
  startedAt: null,
  endsAt: null,
  nextChargeAt: "2026-12-05",
  stripeSubscriptionId: null,
  paymentMethodLabel: "",
  totalPaidCents: 0,
  totalExpectedCents: 0,
  paymentsCompleted: 0,
  paymentsRemaining: null,
  designation: {
    id: "m-jordan",
    name: "Jordan Hale",
    type: "missionary",
    avatarUrl: null,
  },
  missionary: jordan,
  fund: null,
  ...overrides,
});

const snapshot = (overrides: Record<string, unknown> = {}) =>
  ({
    summary: { statementYears: [2025, 2026] },
    donations: [
      donation({ id: "d3", date: "2026-11-05T15:00:00.000Z" }),
      donation({
        id: "d2",
        date: "2026-10-20T15:00:00.000Z",
        status: "Failed",
        missionary: team,
        designation: {
          id: "m-team",
          name: "Field Team 1",
          type: "missionary",
          avatarUrl: null,
        },
        amount: 30,
        amountCents: 3_000,
      }),
      donation({
        id: "d1",
        date: "2026-03-01T15:00:00.000Z",
        status: "Processing",
        amount: 20,
        amountCents: 2_000,
      }),
      donation({ id: "d0", date: "2025-12-01T15:00:00.000Z" }),
    ],
    recurringGifts: [
      recurring({ id: "r1" }),
      recurring({
        id: "r2",
        missionary: team,
        nextChargeAt: "2026-11-20",
        amount: 30,
        amountCents: 3_000,
      }),
      recurring({ id: "r3", status: "cancelled", nextChargeAt: "2026-11-12" }),
    ],
    ...overrides,
  }) as never;

const wallet = (expMonth: number, expYear: number) =>
  ({
    status: "linked",
    methods: [
      {
        id: "pm",
        kind: "card",
        brand: "visa",
        last4: "4242",
        expMonth,
        expYear,
        isDefault: true,
        recurringGiftIds: ["r1"],
      },
    ],
  }) as never;

describe("donor overview", () => {
  it("raises a failed gift and a card about to expire, with a way to fix each", () => {
    const alerts = overviewAlerts({
      snapshot: snapshot(),
      wallet: wallet(12, 2026),
      now: NOW,
    });
    expect(alerts).toEqual([
      {
        id: "failed-d2",
        title: "A gift didn’t go through",
        detail:
          "Your $30.00 gift to Field Team 1 on Oct 20 didn’t go through. Check your card or choose another way to pay.",
        href: "/donor-dashboard/wallet",
        action: "Update payment method",
      },
      {
        id: "expiring-pm",
        title: "Your card expires soon",
        detail:
          "Your Visa ending in 4242 expires at the end of December. It pays for 1 recurring gift.",
        href: "/donor-dashboard/wallet",
        action: "Update card",
      },
    ]);
  });

  it("stays quiet when the card is fine and a later gift went through", () => {
    const alerts = overviewAlerts({
      snapshot: snapshot({
        donations: [
          donation({
            id: "later",
            date: "2026-11-01T15:00:00.000Z",
            missionary: team,
          }),
          donation({
            id: "failed",
            date: "2026-10-20T15:00:00.000Z",
            status: "Failed",
            missionary: team,
          }),
        ],
      }),
      wallet: wallet(4, 2029),
      now: NOW,
    });
    expect(alerts).toEqual([]);
  });

  it("finds the next scheduled gift among active recurring gifts", () => {
    expect(nextScheduledGift(snapshot(), NOW)).toEqual({
      amount: 30,
      name: "Field Team 1",
      date: "2026-11-20",
    });
  });

  it("says why there is no next gift without calling active gifts paused", () => {
    const only = (status: string) =>
      snapshot({ recurringGifts: [recurring({ status, nextChargeAt: null })] });
    expect(noNextGiftNote(only("active"))).toBe(
      "Your next gift date isn’t set yet.",
    );
    expect(noNextGiftNote(only("paused"))).toBe(
      "Your recurring gifts are paused.",
    );
    expect(noNextGiftNote(only("cancelled"))).toBe(
      "Set up a monthly gift on any missionary’s page.",
    );
  });

  it("totals paid gifts this year and names what is still processing", () => {
    expect(givenThisYear(snapshot(), NOW)).toEqual({
      paid: 50,
      paidCount: 1,
      processing: 20,
    });
  });

  it("offers last year’s statement from January to April only", () => {
    expect(statementPromptYear(snapshot(), new Date(2027, 1, 3))).toBe(2026);
    expect(statementPromptYear(snapshot(), NOW)).toBeNull();
  });

  it("knows who the donor last gave to, for giving again", () => {
    expect(lastSupported(snapshot())).toEqual(jordan);
  });
});

describe("giveHref", () => {
  // Public missionary pages are still samples, so giving again goes straight
  // to checkout for the missionary account the donor already supports.
  it("opens checkout for that missionary", () => {
    expect(giveHref("m-jordan")).toBe("/checkout?missionary_id=m-jordan");
    expect(giveHref("a b")).toBe("/checkout?missionary_id=a%20b");
  });
});
