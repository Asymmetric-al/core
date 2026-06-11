import { describe, expect, it } from "vitest";

import { deriveEffectiveContribution } from "../../../../../packages/api/src/admin/contribution-shared/effective-values";

const original = {
  amountCents: 25_000,
  fundId: "fund-1",
  missionaryId: null,
  paymentStatus: "completed" as const,
};

function adjustment(
  overrides: Partial<{
    id: string;
    adjustmentType: string;
    status: "applied" | "reversed";
    effectiveValues: Record<string, unknown>;
    createdAt: string;
  }> = {},
) {
  return {
    id: "adj-1",
    adjustmentType: "amount_correction",
    status: "applied" as const,
    effectiveValues: {},
    reason: "data entry error",
    actorProfileId: "profile-1",
    sourceSurface: "contribution_hub",
    createdAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("admin/contribution-shared/effective-values", () => {
  it("derives effective values from the original donation plus applied adjustments", () => {
    const result = deriveEffectiveContribution({
      original,
      adjustments: [
        adjustment({
          id: "adj-1",
          effectiveValues: { amountCents: 20_000 },
          createdAt: "2026-06-01T00:00:00.000Z",
        }),
        adjustment({
          id: "adj-2",
          adjustmentType: "fund_correction",
          effectiveValues: { fundId: "fund-2" },
          createdAt: "2026-06-02T00:00:00.000Z",
        }),
      ],
    });

    expect(result.effective).toEqual({
      amountCents: 20_000,
      fundId: "fund-2",
      missionaryId: null,
      paymentStatus: "completed",
    });
    expect(result.changedFields.sort()).toEqual(["amountCents", "fundId"]);
    expect(result.materiallyDiffers).toBe(true);
  });

  it("ignores reversed adjustments and preserves the original untouched", () => {
    const result = deriveEffectiveContribution({
      original,
      adjustments: [
        adjustment({
          status: "reversed",
          effectiveValues: { amountCents: 1 },
        }),
      ],
    });

    expect(result.effective.amountCents).toBe(25_000);
    expect(result.materiallyDiffers).toBe(false);
    expect(original.amountCents).toBe(25_000);
  });

  it("applies adjustments in chronological order so the latest value wins", () => {
    const result = deriveEffectiveContribution({
      original,
      adjustments: [
        adjustment({
          id: "adj-late",
          effectiveValues: { amountCents: 18_000 },
          createdAt: "2026-06-05T00:00:00.000Z",
        }),
        adjustment({
          id: "adj-early",
          effectiveValues: { amountCents: 22_000 },
          createdAt: "2026-06-01T00:00:00.000Z",
        }),
      ],
    });

    expect(result.effective.amountCents).toBe(18_000);
  });

  it("returns no changes for a donation without adjustments", () => {
    const result = deriveEffectiveContribution({
      original,
      adjustments: [],
    });

    expect(result.effective).toEqual(original);
    expect(result.changedFields).toEqual([]);
    expect(result.materiallyDiffers).toBe(false);
  });
});
