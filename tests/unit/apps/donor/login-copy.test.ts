import { describe, expect, it } from "vitest";

import { donorLoginCopy } from "../../../../apps/donor/lib/auth/login-copy";

describe("donor sign-in copy", () => {
  it("says why sign-in is needed when it interrupted a gift", () => {
    expect(
      donorLoginCopy("/checkout?workerId=miss-001&amount=100").subtitle,
    ).toBe("Sign in to finish your gift. We’ll bring you straight back to it.");
  });

  it("keeps the portal wording for every other sign-in", () => {
    expect(donorLoginCopy(null).subtitle).toBe("Access the donor portal");
    expect(donorLoginCopy("/donor-dashboard/history").subtitle).toBe(
      "Access the donor portal",
    );
    // A look-alike path is not a checkout.
    expect(donorLoginCopy("/checkouts").subtitle).toBe(
      "Access the donor portal",
    );
  });
});
