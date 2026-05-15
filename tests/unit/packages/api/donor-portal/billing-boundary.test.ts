import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("donor billing portal boundary", () => {
  it("hands payment-method management to Stripe Billing Portal", () => {
    const source = readRepoFile("packages/api/src/donor-portal/billing.ts");

    expect(source).toContain("stripe.billingPortal.sessions.create");
    expect(source).toContain("donor.stripe_customer_id");
    expect(source).not.toMatch(/paymentMethods\.create/);
    expect(source).not.toMatch(/setupIntents\.create/);
  });
});
