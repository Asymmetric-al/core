import { describe, expect, it } from "vitest";

describe("@asym/lib payment package exports", () => {
  it("exposes checkout confirmation helpers through package subpaths", async () => {
    const packageJson = await import("../../../../packages/lib/package.json");
    const confirmation =
      await import("../../../../packages/lib/payments/checkout-confirmation");
    const orchestration =
      await import("../../../../packages/lib/payments/confirm-checkout-payment");

    expect(packageJson.default.exports).toMatchObject({
      "./payments/checkout-confirmation": "./payments/checkout-confirmation.ts",
      "./payments/confirm-checkout-payment":
        "./payments/confirm-checkout-payment.ts",
    });
    expect(confirmation.decideCheckoutOutcome).toBeTypeOf("function");
    expect(orchestration.confirmCheckoutPayment).toBeTypeOf("function");
  });
});
