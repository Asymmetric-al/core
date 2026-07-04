import { describe, expect, it } from "vitest";

import {
  buildOfflineContributionRow,
  resolveOfflineReceiptStatus,
} from "../../src/admin/contributions/offline-logic";
import type { OfflineContributionRequest } from "../../src/schemas/contributions-offline";

/** TDD — offline gift entry pure logic (spec §6, §8.1, §11.3). */

describe("resolveOfflineReceiptStatus", () => {
  it("unknown_offline gifts are not receiptable (§11.3)", () => {
    expect(resolveOfflineReceiptStatus({ donorMode: "unknown_offline" })).toBe(
      "not_receiptable",
    );
  });
  it("known + receipt requested → pending", () => {
    expect(
      resolveOfflineReceiptStatus({
        donorMode: "known",
        receiptRequested: true,
      }),
    ).toBe("pending");
  });
  it("known + no receipt requested → no_receipt_requested", () => {
    expect(
      resolveOfflineReceiptStatus({
        donorMode: "known",
        receiptRequested: false,
      }),
    ).toBe("no_receipt_requested");
  });
});

describe("buildOfflineContributionRow", () => {
  it("unknown cash gift → status unknown_offline, donor stays out, not receiptable, cents", () => {
    const input: OfflineContributionRequest = {
      donorMode: "unknown_offline",
      amount: 20.5,
      currency: "usd",
      receivedDate: "2026-07-01",
      method: "cash",
      designation: { missionaryId: "m-1" },
    };
    const row = buildOfflineContributionRow(input);
    expect(row.donor_identity_status).toBe("unknown_offline");
    expect(row.amount_cents).toBe(2050);
    expect(row.receipt_status).toBe("not_receiptable");
    expect(row.anonymous_to_recipient).toBe(false);
    expect(row.missionary_id).toBe("m-1");
    expect(row.fund_id).toBeNull();
  });

  it("known anonymous gift → carries anonymity flags + pending receipt", () => {
    const input: OfflineContributionRequest = {
      donorMode: "known",
      donorId: "donor-1",
      amount: 100,
      currency: "usd",
      receivedDate: "2026-07-01",
      method: "check",
      designation: { fundId: "fund-1" },
      anonymousToRecipient: true,
      anonymousToPublic: true,
      receiptRequested: true,
      referenceNumber: "chk-4021",
    };
    const row = buildOfflineContributionRow(input);
    expect(row.donor_identity_status).toBe("known");
    expect(row.anonymous_to_recipient).toBe(true);
    expect(row.anonymous_to_public).toBe(true);
    expect(row.receipt_status).toBe("pending");
    expect(row.method).toBe("check");
    expect(row.reference_number).toBe("chk-4021");
    expect(row.fund_id).toBe("fund-1");
  });
});
