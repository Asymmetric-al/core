import { describe, expect, it } from "vitest";

import { getStagedCheckoutPaymentTransition } from "../../../../apps/donor/app/(public)/checkout/checkout-payment-transition";

describe("getStagedCheckoutPaymentTransition", () => {
  it("keeps card and wallet pending payments on the payment step", () => {
    for (const paymentMethod of ["card", "wallet"] as const) {
      const transition = getStagedCheckoutPaymentTransition(paymentMethod);

      expect(transition.paymentState).toBe("pending");
      expect(transition.nextStep).toBe("payment");
      expect(transition.showConfirmation).toBe(false);
    }
  });

  it("allows ACH processing acknowledgements to show the confirmation screen", () => {
    const transition = getStagedCheckoutPaymentTransition("ach");

    expect(transition.paymentState).toBe("processing");
    expect(transition.nextStep).toBe("success");
    expect(transition.showConfirmation).toBe(true);
  });
});
