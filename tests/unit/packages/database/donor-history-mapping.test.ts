import { describe, expect, it } from "vitest";

import { toDonorHistoryTransaction } from "../../../../packages/database/collections/donor-history";

const gift = {
  id: "gift-1",
  date: "2026-05-01T15:00:00.000Z",
  amount: 50,
  designation: {
    name: "Nairobi Water Wells",
    type: "fund" as const,
    avatarUrl: null,
  },
  missionary: {
    id: "m-1",
    name: "Jordan Hale",
    avatarUrl: "https://images.unsplash.com/photo-1",
  },
  fund: { id: "f-1", name: "Nairobi Water Wells" },
  type: "Recurring" as const,
  method: "Card",
  status: "Paid" as const,
  receiptUrl: "/api/donor/receipts/gift-1",
};

describe("donor history rows", () => {
  it("names the missionary a gift supports and the fund separately", () => {
    expect(toDonorHistoryTransaction(gift)).toEqual({
      id: "gift-1",
      date: "2026-05-01T15:00:00.000Z",
      amount: 50,
      recipient: "Jordan Hale",
      recipientAvatar: "https://images.unsplash.com/photo-1",
      fund: "Nairobi Water Wells",
      type: "Recurring",
      method: "Card",
      status: "Paid",
      receiptUrl: "/api/donor/receipts/gift-1",
    });
  });

  it("falls back to the designation when a gift supports a fund only", () => {
    expect(
      toDonorHistoryTransaction({
        ...gift,
        missionary: null,
        status: "Refunded",
      }),
    ).toMatchObject({
      recipient: "Nairobi Water Wells",
      recipientAvatar: undefined,
      fund: null,
      status: "Refunded",
    });
  });
});
