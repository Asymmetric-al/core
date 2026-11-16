import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("donor high-complexity extraction contracts", () => {
  it("keeps settings ProfileTab on loading, error, photo, and details siblings", () => {
    const source = readRepoFile(
      "apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx",
    );

    expect(source).toContain("type ProfileFormFields = {");
    expect(source).toContain("function TabLoading(");
    expect(source).toContain("function TabError(");
    expect(source).toContain("function PhotoCard(");
    expect(source).toContain("function DetailsCard(");
    expect(source).toContain("function ProfileTab() {");
    expect(source).toContain("void handleSave();");

    const profileTab = source.slice(
      source.indexOf("function ProfileTab() {"),
      source.indexOf("function PreferenceSwitch("),
    );
    expect(profileTab).toContain("buildProfileFormState({");
    expect(profileTab).toContain("<TabLoading");
    expect(profileTab).toContain("<TabError");
    expect(profileTab).toContain("<PhotoCard");
    expect(profileTab).toContain("<DetailsCard");
    // The form fields live in DetailsCard, not in the tab itself.
    expect(profileTab).not.toContain('htmlFor="firstName"');
  });

  it("keeps checkout payment pane, missing-target, and active flow as siblings", () => {
    const source = readRepoFile(
      "apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx",
    );

    expect(source).toContain("function resolveMountedPublishableKey(");
    expect(source).toContain("function resolveCheckoutSummaryWorkerTitle(");
    expect(source).toContain("function CheckoutMissingTargetState(");
    expect(source).toContain("function CheckoutPaymentPane(");
    expect(source).toContain("function CheckoutActiveFlow(");
    expect(source).toContain("function CheckoutContent(");
    expect(source).toContain("resolveMountedPublishableKey(");
    expect(source).toContain("<CheckoutMissingTargetState");
    expect(source).toContain("<CheckoutPaymentPane");
    expect(source).toContain("<CheckoutActiveFlow");
    expect(source).toContain('step === "config" ?');
    expect(source).toContain('step === "details" ?');
    expect(source).toContain('step === "payment" ? paymentPane');

    const checkoutContent = source.slice(
      source.indexOf("function CheckoutContent("),
    );
    expect(checkoutContent).toContain("const handlePayment = async (");
    expect(checkoutContent).toContain('fetch("/api/donate"');
    expect(checkoutContent).toContain("Idempotency-Key");
    expect(checkoutContent).toContain("stripe.confirmCardPayment(");
    expect(checkoutContent).not.toContain("Preparing secure checkout");
    expect(checkoutContent).not.toContain("Target Unspecified");

    const paymentPane = source.slice(
      source.indexOf("function CheckoutPaymentPane("),
      source.indexOf("function CheckoutActiveFlow("),
    );
    expect(paymentPane).toContain("if (stripeOverride)");
    expect(paymentPane).toContain('runtimeConfig.status === "loading"');
    expect(paymentPane).toContain('runtimeConfig.status === "error"');
    expect(paymentPane).toContain("<StripePaymentStep");
    expect(paymentPane).toContain("elements={null}");
  });
});
