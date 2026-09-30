import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("donor high-complexity extraction contracts", () => {
  it("keeps settings ProfileTab on loading, error, avatar, and form siblings", () => {
    const source = readRepoFile(
      "apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx",
    );

    expect(source).toContain("type ProfileFormFields = {");
    expect(source).toContain("function ProfileTabLoading(");
    expect(source).toContain("function ProfileTabError(");
    expect(source).toContain("function ProfileAvatarCard(");
    expect(source).toContain("function ProfilePersonalInfoCard(");
    expect(source).toContain("const ProfileTab = () => {");
    expect(source).toContain("<ProfileTabLoading");
    expect(source).toContain("<ProfileTabError");
    expect(source).toContain("<ProfileAvatarCard");
    expect(source).toContain("<ProfilePersonalInfoCard");
    expect(source).toContain("void handleSave();");

    const profileTab = source.slice(
      source.indexOf("const ProfileTab = () => {"),
      source.indexOf("interface NotificationPreferences"),
    );
    expect(profileTab).toContain("buildProfileFormState({");
    expect(profileTab).not.toContain('htmlFor="firstName"');
    expect(profileTab).not.toContain('triggerAriaLabel="Upload public avatar"');
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
