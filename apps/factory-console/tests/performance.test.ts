// Pure Performance rules: what counts as a verified delivery, when waiting
// time is measurable, and how a sample turns into a range.
import { describe, expect, it } from "vitest";

import { seedFactory } from "./fixtures/factory-fixture";
import { workItemSchema, type WorkItem } from "../src/lib/factory";
import { delivery, statistic, unverifiedReason } from "../src/lib/performance";

const BASE = Date.parse("2026-11-10T12:00:00Z");

function item(change: (value: Record<string, unknown>) => void = () => {}) {
  const value = structuredClone(seedFactory(BASE)["core/issues/103"]) as Record<
    string,
    unknown
  >;
  change(value);
  return workItemSchema.parse(value) as WorkItem;
}

describe("verified delivery", () => {
  it("accepts CLEAR reviews and PASS acceptance bound to the published head", () => {
    expect(unverifiedReason(item())).toBeNull();
  });

  it("names the first missing or mismatched piece of evidence", () => {
    expect(
      unverifiedReason(
        item((value) => {
          (value.pr as Record<string, unknown>).head = "f".repeat(40);
        }),
      ),
    ).toBe(
      "Final acceptance is for a different candidate than the published head",
    );
    expect(
      unverifiedReason(
        item((value) => {
          const reviews = value.reviews as Record<
            string,
            Record<string, unknown>
          >;
          reviews.luke.decision = "INCONCLUSIVE";
        }),
      ),
    ).toBe("Luke's review is INCONCLUSIVE, not CLEAR");
    expect(
      unverifiedReason(
        item((value) => {
          (value.acceptance as Record<string, unknown>).revision = "9".repeat(
            64,
          );
        }),
      ),
    ).toBe("Final acceptance is for an earlier acceptance revision");
    expect(
      unverifiedReason(
        item((value) => {
          value.status = "MERGED";
        }),
      ),
    ).toBe("The merge is not recorded with its time and merge commit");
  });
});

describe("waiting between rounds", () => {
  it("is not measured when rounds were trimmed from the history", () => {
    const trimmed = item((value) => {
      value.round = 5;
      value.history = (value.history as Record<string, unknown>[]).map(
        (entry) => ({
          ...entry,
          startedAt: new Date(
            Date.parse(String(entry.at)) - 600_000,
          ).toISOString(),
        }),
      );
    });
    expect(delivery(trimmed, null)?.waitMs).toBeNull();
    expect(delivery(trimmed, null)?.cycleMs).toBe(100 * 60_000);
  });

  it("counts repair, acceptance-correction and review-only rounds as rework", () => {
    const reworked = item((value) => {
      const history = value.history as Record<string, unknown>[];
      history[1] = { ...history[1], route: "repair" };
      history[2] = { ...history[2], route: "review" };
    });
    expect(delivery(reworked, null)?.repairRounds).toBe(2);
  });
});

describe("statistic", () => {
  it("withholds every estimate below the minimum sample but keeps its size and freshness", () => {
    expect(
      statistic(
        [
          { value: 1, at: "2026-11-01T00:00:00Z" },
          { value: 2, at: "2026-11-03T00:00:00Z" },
        ],
        5,
      ),
    ).toEqual({
      n: 2,
      enough: false,
      median: null,
      low: null,
      high: null,
      latestAt: "2026-11-03T00:00:00Z",
    });
  });

  it("interpolates the median and middle half", () => {
    expect(
      statistic(
        [4, 1, 3, 2, 5].map((value) => ({ value, at: null })),
        5,
      ),
    ).toMatchObject({ n: 5, enough: true, median: 3, low: 2, high: 4 });
  });
});
