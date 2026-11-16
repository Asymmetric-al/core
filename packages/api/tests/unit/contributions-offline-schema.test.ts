import { describe, expect, it } from "vitest";

import { offlineContributionSchema } from "../../src/schemas/contributions-offline";

/** TDD — offline gift entry contract (DONOR_ANONYMITY_GUEST_GIVING_SPEC §6/§9.3). */

const knownWithId = {
  donorMode: "known",
  donorId: "donor-1",
  amount: 100,
  currency: "usd",
  receivedDate: "2026-07-01",
  method: "check",
  designation: { fundId: "fund-1" },
  anonymousToRecipient: false,
  receiptRequested: true,
};

const unknownCash = {
  donorMode: "unknown_offline",
  amount: 20,
  currency: "usd",
  receivedDate: "2026-07-01",
  method: "cash",
  designation: { missionaryId: "m-1" },
};

describe("offlineContributionSchema — known mode", () => {
  it("accepts a known gift attached to an existing donorId", () => {
    expect(offlineContributionSchema.parse(knownWithId).donorMode).toBe(
      "known",
    );
  });

  it("accepts a known gift with inline donorInput (create/match)", () => {
    const parsed = offlineContributionSchema.parse({
      ...knownWithId,
      donorId: undefined,
      donorInput: { firstName: "Ada", lastName: "Lovelace" },
    });
    expect(parsed.donorMode).toBe("known");
  });

  it("rejects a known gift with NEITHER donorId nor donorInput", () => {
    const bad = { ...knownWithId };
    delete (bad as Record<string, unknown>).donorId;
    expect(() => offlineContributionSchema.parse(bad)).toThrow();
  });

  it("allows check/wire/stock/manual_ach for known gifts", () => {
    for (const method of [
      "check",
      "wire",
      "stock",
      "manual_ach",
      "cash",
      "other",
    ]) {
      expect(() =>
        offlineContributionSchema.parse({ ...knownWithId, method }),
      ).not.toThrow();
    }
  });
});

describe("offlineContributionSchema — unknown_offline mode", () => {
  it("accepts an unknown cash gift with no donor data", () => {
    expect(offlineContributionSchema.parse(unknownCash).donorMode).toBe(
      "unknown_offline",
    );
  });

  it("rejects unknown_offline with a payer-identifying method (check)", () => {
    expect(() =>
      offlineContributionSchema.parse({ ...unknownCash, method: "check" }),
    ).toThrow();
  });

  it("does not accept a donorId on an unknown_offline gift (stripped/invalid)", () => {
    const parsed = offlineContributionSchema.parse({
      ...unknownCash,
      donorId: "sneaky",
    });
    // discriminated union member has no donorId field → not carried through.
    expect((parsed as Record<string, unknown>).donorId).toBeUndefined();
  });
});

describe("offlineContributionSchema — shared rules", () => {
  it("rejects both designations present", () => {
    expect(() =>
      offlineContributionSchema.parse({
        ...knownWithId,
        designation: { missionaryId: "m-1", fundId: "f-1" },
      }),
    ).toThrow();
  });

  it("rejects neither designation present", () => {
    expect(() =>
      offlineContributionSchema.parse({ ...knownWithId, designation: {} }),
    ).toThrow();
  });

  it("rejects a missing received date", () => {
    const bad = { ...knownWithId, receivedDate: "" };
    expect(() => offlineContributionSchema.parse(bad)).toThrow();
  });

  it("rejects a received date that is not an ISO date or timestamp", () => {
    for (const receivedDate of ["not-a-date", "2026-13-01", "2026-02-30"]) {
      expect(() =>
        offlineContributionSchema.parse({ ...knownWithId, receivedDate }),
      ).toThrow();
    }
  });

  it("accepts a full ISO timestamp as a received date", () => {
    expect(() =>
      offlineContributionSchema.parse({
        ...knownWithId,
        receivedDate: "2026-07-01T10:30:00.000Z",
      }),
    ).not.toThrow();
  });

  it("rejects a non-usd currency", () => {
    expect(() =>
      offlineContributionSchema.parse({ ...knownWithId, currency: "eur" }),
    ).toThrow();
  });

  it("rejects a non-positive amount", () => {
    expect(() =>
      offlineContributionSchema.parse({ ...knownWithId, amount: 0 }),
    ).toThrow();
  });
});

describe("offlineContributionSchema — whole-cent amounts", () => {
  function parseAmount(amount: unknown) {
    return offlineContributionSchema.safeParse({ ...unknownCash, amount });
  }

  it("rejects sub-cent amounts instead of rounding them", () => {
    for (const amount of [0.004, 10.005, "0.004", "10.005"]) {
      expect(parseAmount(amount).success).toBe(false);
    }
  });

  it("rejects exponent, non-numeric and non-positive input", () => {
    for (const amount of ["1e-3", "abc", "", 0, "0.00", -5, Number.NaN]) {
      expect(parseAmount(amount).success).toBe(false);
    }
  });

  it("keeps ordinary dollar amounts exact", () => {
    const cases: Array<[unknown, number]> = [
      [100, 100],
      [20.5, 20.5],
      ["0.29", 0.29],
      ["1,500.00", 1500],
    ];
    for (const [amount, expected] of cases) {
      const parsed = parseAmount(amount);
      expect(parsed.success).toBe(true);
      expect(parsed.data?.amount).toBe(expected);
    }
  });
});
