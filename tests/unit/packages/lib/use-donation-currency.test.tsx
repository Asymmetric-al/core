// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDonationMetrics } from "../../../../packages/lib/hooks/use-donation-metrics";

const gift = (amount: number, currency: string | null) => ({
  id: String(amount),
  amount,
  currency,
  status: "completed",
  donation_type: "one_time",
  created_at: new Date().toISOString(),
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function metrics(
  currency: string | null | undefined,
  donations: ReturnType<typeof gift>[],
) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ currency, donations }),
    }),
  );
  const { result } = renderHook(() => useDonationMetrics("missionary"));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  return result.current;
}

describe("donation metrics currency containment", () => {
  it.each([
    [null, [gift(1000, "JPY"), gift(1000, "USD")]],
    [null, [gift(1000, null)]],
    [undefined, [gift(1000, "USD")]],
    ["USD", [gift(1000, "JPY"), gift(1000, "USD")]],
    ["USD", [gift(Number.MAX_SAFE_INTEGER, "USD"), gift(1, "USD")]],
  ])(
    "suppresses unqualified money without hiding the gifts",
    async (currency, gifts) => {
      const result = await metrics(currency, gifts);
      expect(result.thisMonth.total).toBeNull();
      expect(result.thisMonth.change).toBeNull();
      expect(result.thisMonth.data).toEqual([]);
      expect(result.monthlyBreakdown).toEqual([]);
      expect(result.gifts).toHaveLength(gifts.length);
    },
  );

  it("retains original minor integers and explicit currencies", async () => {
    const result = await metrics("JPY", [gift(1000, "JPY")]);
    expect(result.currency).toBe("JPY");
    expect(result.thisMonth.total).toBe(1000);
    expect(result.gifts[0]).toMatchObject({
      amountCents: 1000,
      currency: "JPY",
    });
    expect(result.monthlyBreakdown.at(-1)?.total).toBe(1000);
  });
});
