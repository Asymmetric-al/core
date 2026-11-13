import { describe, expect, it } from "vitest";

import { describeCorrectionRequestChange } from "../../../../../packages/api/src/admin/contribution-operations/correction-request-change";

const CURRENT = {
  amountCents: 100_000,
  currencyCode: "USD",
  fundId: "fund-general",
  fundName: "General Fund",
  missionaryId: "mis-1",
  missionaryName: "Grace Okafor",
  paymentStatus: "completed",
  designationLineCount: 2,
  donorId: "donor-1",
  donorName: "Kenji Nakamura",
};

const NAMES = {
  funds: new Map([
    ["fund-general", "General Fund"],
    ["fund-water", "Clean Water Initiative"],
  ]),
  missionaries: new Map([
    ["mis-1", "Grace Okafor"],
    ["mis-2", "Samuel Osei"],
  ]),
  donors: new Map([["donor-2", "Northfield Community Bank"]]),
};

describe("describeCorrectionRequestChange", () => {
  it("states an amount correction as current → proposed in the gift's currency", () => {
    expect(
      describeCorrectionRequestChange({
        actionType: "amount_correction",
        payload: { amount: 150_000 },
        current: CURRENT,
        names: NAMES,
      }),
    ).toEqual([{ label: "Amount", from: "$1,000.00", to: "$1,500.00" }]);
  });

  it("names the funds of a fund or designation correction", () => {
    for (const actionType of ["fund_correction", "designation_correction"]) {
      expect(
        describeCorrectionRequestChange({
          actionType,
          payload: { fundId: "fund-water" },
          current: CURRENT,
          names: NAMES,
        }),
      ).toEqual([
        { label: "Fund", from: "General Fund", to: "Clean Water Initiative" },
      ]);
    }
  });

  it("says when a fund or missionary is removed or cannot be named", () => {
    expect(
      describeCorrectionRequestChange({
        actionType: "allocation_correction",
        payload: { fundId: null, missionaryId: "mis-unknown" },
        current: CURRENT,
        names: NAMES,
      }),
    ).toEqual([
      { label: "Fund", from: "General Fund", to: "None" },
      { label: "Missionary", from: "Grace Okafor", to: "Unknown missionary" },
    ]);
  });

  it("lists replacement designation lines with their amounts", () => {
    expect(
      describeCorrectionRequestChange({
        actionType: "allocation_correction",
        payload: {
          designationLines: [
            { amountCents: 60_000, fundId: "fund-water" },
            {
              amountCents: 40_000,
              fundId: "fund-general",
              missionaryId: "mis-2",
            },
          ],
        },
        current: CURRENT,
        names: NAMES,
      }),
    ).toEqual([
      {
        label: "Designation",
        from: "2 lines",
        to: "Clean Water Initiative $600.00; General Fund (Samuel Osei) $400.00",
      },
    ]);
  });

  it("states a payment-state correction in plain words", () => {
    expect(
      describeCorrectionRequestChange({
        actionType: "payment_state_correction",
        payload: { status: "refunded" },
        current: CURRENT,
        names: NAMES,
      }),
    ).toEqual([{ label: "Payment status", from: "Completed", to: "Refunded" }]);
  });

  it("states a refund request's amount", () => {
    expect(
      describeCorrectionRequestChange({
        actionType: "refund",
        payload: { amount: 50_000 },
        current: CURRENT,
        names: NAMES,
      }),
    ).toEqual([{ label: "Refund amount", from: null, to: "$500.00" }]);
    expect(
      describeCorrectionRequestChange({
        actionType: "refund",
        payload: { amount: 0 },
        current: CURRENT,
        names: NAMES,
      }),
    ).toBeNull();
  });

  it("names the donor a relink request moves the gift to", () => {
    expect(
      describeCorrectionRequestChange({
        actionType: "donor_relink",
        payload: { donorId: "donor-2" },
        current: CURRENT,
        names: NAMES,
      }),
    ).toEqual([
      {
        label: "Donor",
        from: "Kenji Nakamura",
        to: "Northfield Community Bank",
      },
    ]);
  });

  it("returns null when the stored payload cannot be read, so approval waits", () => {
    expect(
      describeCorrectionRequestChange({
        actionType: "amount_correction",
        payload: { amount: "a lot" },
        current: CURRENT,
        names: NAMES,
      }),
    ).toBeNull();
    expect(
      describeCorrectionRequestChange({
        actionType: "statement_correction",
        payload: {},
        current: CURRENT,
        names: NAMES,
      }),
    ).toBeNull();
  });

  it("lists the reference ids a payload needs named", async () => {
    const { correctionRequestReferenceIds } =
      await import("../../../../../packages/api/src/admin/contribution-operations/correction-request-change");
    expect(
      correctionRequestReferenceIds([
        { actionType: "fund_correction", payload: { fundId: "fund-water" } },
        {
          actionType: "allocation_correction",
          payload: {
            designationLines: [
              { amountCents: 1, fundId: "fund-a", missionaryId: "mis-9" },
            ],
          },
        },
        { actionType: "amount_correction", payload: { amount: "bad" } },
        { actionType: "donor_relink", payload: { donorId: "donor-2" } },
      ]),
    ).toEqual({
      fundIds: ["fund-water", "fund-a"],
      missionaryIds: ["mis-9"],
      donorIds: ["donor-2"],
    });
  });
});
