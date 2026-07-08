import { describe, expect, it } from "vitest";

import { offlineContributionSchema } from "../../../../../packages/api/src/schemas/contributions-offline";

import {
  INITIAL_OFFLINE_GIFT_FORM_VALUES,
  OFFLINE_METHOD_OPTIONS_KNOWN,
  OFFLINE_METHOD_OPTIONS_UNKNOWN,
  OFFLINE_RECEIPT_STATUS_DISPLAY,
  offlineGiftFormSchema,
  previewOfflineReceiptStatus,
  toOfflineContributionRequest,
  type OfflineGiftFormValues,
} from "../../../../../apps/admin/app/contributions/offline-gift/offline-gift-form-model";

/**
 * TDD — offline gift entry FORM model (Contributions Hub UI, spec §6/§9.3).
 * Pure mapping from the flat form values → the server §9.3 contract, plus the
 * live receipt-status preview. No DB, no React — provable in isolation.
 */

function knownValues(
  overrides: Partial<OfflineGiftFormValues> = {},
): OfflineGiftFormValues {
  return {
    ...INITIAL_OFFLINE_GIFT_FORM_VALUES,
    donorMode: "known",
    createNewDonor: true,
    firstName: "Ada",
    lastName: "Lovelace",
    amount: "100",
    receivedDate: "2026-07-01",
    method: "check",
    designationType: "fund",
    fundId: "fund-1",
    receiptRequested: true,
    ...overrides,
  };
}

function unknownValues(
  overrides: Partial<OfflineGiftFormValues> = {},
): OfflineGiftFormValues {
  return {
    ...INITIAL_OFFLINE_GIFT_FORM_VALUES,
    donorMode: "unknown_offline",
    amount: "20",
    receivedDate: "2026-07-01",
    method: "cash",
    designationType: "missionary",
    missionaryId: "m-1",
    ...overrides,
  };
}

describe("toOfflineContributionRequest — known mode", () => {
  it("maps a new-donor known gift to a valid §9.3 known request", () => {
    const request = toOfflineContributionRequest(knownValues());
    // The mapped output MUST satisfy the server contract (single source of truth).
    const parsed = offlineContributionSchema.safeParse(request);
    expect(parsed.success).toBe(true);
    expect(request.donorMode).toBe("known");
    if (request.donorMode !== "known") throw new Error("narrowing");
    expect(request.donorInput).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
    });
    expect(request.donorId).toBeUndefined();
    expect(request.amount).toBe(100);
    expect(request.designation).toEqual({ fundId: "fund-1" });
    expect(request.receiptRequested).toBe(true);
  });

  it("uses an existing donorId when not creating a new donor", () => {
    const request = toOfflineContributionRequest(
      knownValues({ createNewDonor: false, donorId: "donor-7" }),
    );
    expect(offlineContributionSchema.safeParse(request).success).toBe(true);
    if (request.donorMode !== "known") throw new Error("narrowing");
    expect(request.donorId).toBe("donor-7");
    expect(request.donorInput).toBeUndefined();
  });

  it("carries anonymity flags for a known gift", () => {
    const request = toOfflineContributionRequest(
      knownValues({ anonymousToRecipient: true, anonymousToPublic: true }),
    );
    if (request.donorMode !== "known") throw new Error("narrowing");
    expect(request.anonymousToRecipient).toBe(true);
    expect(request.anonymousToPublic).toBe(true);
  });

  it("passes optional reference number + internal note through, omitting blanks", () => {
    const withRef = toOfflineContributionRequest(
      knownValues({ referenceNumber: "chk-4021", internalNote: "  " }),
    );
    expect(withRef.referenceNumber).toBe("chk-4021");
    expect(withRef.internalNote).toBeUndefined();
  });
});

describe("toOfflineContributionRequest — unknown_offline mode", () => {
  it("maps an unknown cash gift to a valid §9.3 unknown request with no donor data", () => {
    const request = toOfflineContributionRequest(unknownValues());
    expect(offlineContributionSchema.safeParse(request).success).toBe(true);
    expect(request.donorMode).toBe("unknown_offline");
    expect(request.designation).toEqual({ missionaryId: "m-1" });
    // §6.2 — no donor identity fields on the unknown request member.
    expect((request as Record<string, unknown>).donorId).toBeUndefined();
    expect((request as Record<string, unknown>).donorInput).toBeUndefined();
    expect(
      (request as Record<string, unknown>).anonymousToRecipient,
    ).toBeUndefined();
  });

  it("does not silently coerce a stale payer-identifying method to cash", () => {
    expect(() =>
      toOfflineContributionRequest(unknownValues({ method: "check" })),
    ).toThrow(/cash or other/i);
  });
});

describe("designation mapping", () => {
  it("emits exactly the selected designation (missionary)", () => {
    const request = toOfflineContributionRequest(
      knownValues({
        designationType: "missionary",
        missionaryId: "m-9",
        fundId: "fund-1",
      }),
    );
    expect(request.designation).toEqual({ missionaryId: "m-9" });
  });
});

describe("previewOfflineReceiptStatus", () => {
  it("unknown gift → not_receiptable", () => {
    expect(previewOfflineReceiptStatus(unknownValues())).toBe(
      "not_receiptable",
    );
  });
  it("known + receipt requested → pending", () => {
    expect(
      previewOfflineReceiptStatus(knownValues({ receiptRequested: true })),
    ).toBe("pending");
  });
  it("known + no receipt requested → no_receipt_requested", () => {
    expect(
      previewOfflineReceiptStatus(knownValues({ receiptRequested: false })),
    ).toBe("no_receipt_requested");
  });
  it("every receipt status has a display config with a label + class", () => {
    for (const status of [
      "pending",
      "no_receipt_requested",
      "not_receiptable",
    ] as const) {
      expect(
        OFFLINE_RECEIPT_STATUS_DISPLAY[status].label.length,
      ).toBeGreaterThan(0);
      expect(
        OFFLINE_RECEIPT_STATUS_DISPLAY[status].className.length,
      ).toBeGreaterThan(0);
    }
  });
});

describe("offlineGiftFormSchema — inline UX validation", () => {
  it("accepts a valid known gift", () => {
    expect(offlineGiftFormSchema.safeParse(knownValues()).success).toBe(true);
  });

  it("rejects a known new-donor gift missing the last name", () => {
    const result = offlineGiftFormSchema.safeParse(
      knownValues({ lastName: "" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a malformed optional email before the submit round-trip", () => {
    const result = offlineGiftFormSchema.safeParse(
      knownValues({ email: "not-an-email" }),
    );
    expect(result.success).toBe(false);
    if (result.success) throw new Error("expected invalid email");
    expect(result.error.issues.some((issue) => issue.path[0] === "email")).toBe(
      true,
    );
  });

  it("rejects a known existing-donor gift with no donor selected", () => {
    const result = offlineGiftFormSchema.safeParse(
      knownValues({ createNewDonor: false, donorId: "" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an unknown gift with a payer-identifying method (check)", () => {
    const result = offlineGiftFormSchema.safeParse(
      unknownValues({ method: "check" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive amount", () => {
    expect(
      offlineGiftFormSchema.safeParse(knownValues({ amount: "0" })).success,
    ).toBe(false);
  });

  it("rejects a missing received date", () => {
    expect(
      offlineGiftFormSchema.safeParse(knownValues({ receivedDate: "" }))
        .success,
    ).toBe(false);
  });

  it("rejects when the chosen designation id is empty", () => {
    expect(
      offlineGiftFormSchema.safeParse(
        knownValues({ designationType: "fund", fundId: "" }),
      ).success,
    ).toBe(false);
  });
});

describe("method option catalogs", () => {
  it("unknown-mode methods are cash/other only (§6.2)", () => {
    expect(
      OFFLINE_METHOD_OPTIONS_UNKNOWN.map((option) => option.value),
    ).toEqual(["cash", "other"]);
  });
  it("known-mode methods include payer-identifying instruments", () => {
    const values = OFFLINE_METHOD_OPTIONS_KNOWN.map((option) => option.value);
    expect(values).toContain("check");
    expect(values).toContain("stock");
    expect(values).toContain("wire");
  });
});
