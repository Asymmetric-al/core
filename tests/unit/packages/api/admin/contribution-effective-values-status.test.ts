import { describe, expect, it } from "vitest";

import {
  deriveEffectiveContribution,
  mapContributionAdjustmentRow,
} from "../../../../../packages/api/src/admin/contribution-shared/effective-values";

const original = {
  amountCents: 10_000,
  fundId: "fund-1",
  missionaryId: null,
  paymentStatus: "succeeded",
};

describe("admin/contribution-shared/effective-values adjustment status", () => {
  it("applies an explicit applied adjustment to effective values", () => {
    const adjustment = mapContributionAdjustmentRow({
      id: "adj-1",
      adjustment_type: "amount_correction",
      status: "applied",
      effective_values: { amountCents: 7_500 },
      created_at: "2026-06-01T00:00:00.000Z",
    });

    expect(adjustment.status).toBe("applied");

    const result = deriveEffectiveContribution({
      original,
      adjustments: [adjustment],
    });
    expect(result.effective.amountCents).toBe(7_500);
    expect(result.materiallyDiffers).toBe(true);
  });

  it("never lets an unapproved/unknown status change effective values (fail closed)", () => {
    const adjustment = mapContributionAdjustmentRow({
      id: "adj-2",
      adjustment_type: "amount_correction",
      status: "pending",
      effective_values: { amountCents: 1 },
      created_at: "2026-06-01T00:00:00.000Z",
    });

    expect(adjustment.status).not.toBe("applied");

    const result = deriveEffectiveContribution({
      original,
      adjustments: [adjustment],
    });
    expect(result.effective.amountCents).toBe(10_000);
    expect(result.materiallyDiffers).toBe(false);
  });

  it("excludes reversed adjustments from effective values", () => {
    const adjustment = mapContributionAdjustmentRow({
      id: "adj-3",
      adjustment_type: "amount_correction",
      status: "reversed",
      effective_values: { amountCents: 1 },
      created_at: "2026-06-01T00:00:00.000Z",
    });

    expect(adjustment.status).toBe("reversed");

    const result = deriveEffectiveContribution({
      original,
      adjustments: [adjustment],
    });
    expect(result.effective.amountCents).toBe(10_000);
  });
});
