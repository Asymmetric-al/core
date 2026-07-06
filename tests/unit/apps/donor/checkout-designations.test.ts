import {
  buildCheckoutHref,
  buildWorkerCheckoutHref,
  isGeneralCheckoutAlias,
  resolveCheckoutFundId,
} from "@asym/lib/payments/checkout-designations";
import { describe, expect, it } from "vitest";

describe("checkout designation links", () => {
  it("keeps public worker identity separate from the donation missionary UUID", () => {
    expect(
      buildWorkerCheckoutHref({
        amount: 100,
        missionaryId: "20000000-0000-0000-0000-000000000001",
        workerId: "miss-001",
      }),
    ).toBe(
      "/checkout?workerId=miss-001&missionary_id=20000000-0000-0000-0000-000000000001&amount=100",
    );
  });

  it("keeps the general fund alias semantic instead of converting it to a UUID", () => {
    expect(isGeneralCheckoutAlias("general")).toBe(true);
    expect(isGeneralCheckoutAlias(" General ")).toBe(true);
    expect(resolveCheckoutFundId("general")).toBeNull();
    expect(buildCheckoutHref({ fundId: "general" })).toBe(
      "/checkout?fund=general",
    );
  });

  it("preserves canonical missionary and fund UUIDs", () => {
    expect(resolveCheckoutFundId("40000000-0000-0000-0000-000000000001")).toBe(
      "40000000-0000-0000-0000-000000000001",
    );
    expect(
      buildCheckoutHref({
        fundId: "40000000-0000-0000-0000-000000000001",
        missionaryId: "20000000-0000-0000-0000-000000000002",
      }),
    ).toBe(
      "/checkout?missionary_id=20000000-0000-0000-0000-000000000002&fund_id=40000000-0000-0000-0000-000000000001",
    );
  });
});
