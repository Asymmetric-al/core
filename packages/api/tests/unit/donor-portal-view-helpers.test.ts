import { describe, expect, it } from "vitest";

import {
  buildDonorSettingsPatch,
  buildProfileFormState,
  splitDisplayName,
} from "../../src/donor-portal/settings-patch";
import { mapRecurringGiftToPledgeView } from "../../src/donor-portal/pledge-view";

/**
 * TDD — pure helpers the donor-portal views consume when wiring off MOCK_*.
 * Business logic lives in packages/api; the page-clients stay thin.
 */

describe("splitDisplayName (settings prefill)", () => {
  it("splits into first + last (last = remainder)", () => {
    expect(splitDisplayName("Ada Lovelace")).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
    });
    expect(splitDisplayName("Blaise de Pascal")).toEqual({
      firstName: "Blaise",
      lastName: "de Pascal",
    });
    expect(splitDisplayName("Cher")).toEqual({ firstName: "Cher", lastName: "" });
    expect(splitDisplayName(null)).toEqual({ firstName: "", lastName: "" });
  });
});

describe("buildDonorSettingsPatch — only PATCH-supported keys (schema is .strict())", () => {
  it("includes supported, defined fields", () => {
    const patch = buildDonorSettingsPatch({
      firstName: "Ada",
      lastName: "Lovelace",
      phone: "+1-555-0100",
      preferredContact: "email",
      receiptEmailFrequency: "monthly",
      defaultUpdateFrequency: "weekly",
      doNotEmail: false,
      doNotContact: false,
    });
    expect(patch).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      phone: "+1-555-0100",
      preferredContact: "email",
      receiptEmailFrequency: "monthly",
      defaultUpdateFrequency: "weekly",
      doNotEmail: false,
      doNotContact: false,
    });
  });

  it("DROPS unsupported keys (email/address/notification toggles) so .strict() never throws", () => {
    const patch = buildDonorSettingsPatch({
      firstName: "Ada",
      email: "ada@example.com",
      street: "1 Analytical Way",
      city: "London",
      receipts: true,
      newsletters: false,
    } as Record<string, unknown>);
    expect(patch).toEqual({ firstName: "Ada" });
    expect(patch).not.toHaveProperty("email");
    expect(patch).not.toHaveProperty("street");
    expect(patch).not.toHaveProperty("receipts");
  });

  it("omits undefined fields (only sends what changed/present)", () => {
    const patch = buildDonorSettingsPatch({ phone: undefined, firstName: "Ada" });
    expect(patch).toEqual({ firstName: "Ada" });
  });
});

describe("buildProfileFormState (settings prefill)", () => {
  it("splits displayName + carries email/phone/avatar, defaulting nulls to ''", () => {
    expect(
      buildProfileFormState({
        displayName: "Ada Lovelace",
        email: "ada@example.com",
        phone: "+1-555-0100",
        avatarUrl: null,
      }),
    ).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "+1-555-0100",
      avatarUrl: "",
    });
  });

  it("handles a fully empty snapshot", () => {
    expect(buildProfileFormState({})).toEqual({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      avatarUrl: "",
    });
  });
});

describe("mapRecurringGiftToPledgeView", () => {
  const gift = {
    id: "rg-1",
    amountCents: 5000,
    amount: 50,
    currency: "USD",
    frequency: "monthly",
    status: "active",
    startedAt: "2026-01-01",
    endsAt: null,
    nextChargeAt: "2026-08-01",
    stripeSubscriptionId: "sub_1",
    paymentMethodLabel: "Visa ····4242",
    totalPaidCents: 30000,
    totalExpectedCents: 60000,
    paymentsCompleted: 6,
    paymentsRemaining: 6,
    designation: {
      id: "m-1",
      name: "Jane Missionary",
      type: "missionary" as const,
      avatarUrl: "https://cdn/j.png",
    },
  };

  it("flattens designation + normalizes frequency/status to Title case", () => {
    const view = mapRecurringGiftToPledgeView(gift);
    expect(view).toMatchObject({
      id: "rg-1",
      recipientName: "Jane Missionary",
      recipientCategory: "Missionary",
      recipientAvatar: "https://cdn/j.png",
      amount: 50,
      frequency: "Monthly",
      status: "Active",
      nextChargeDate: "2026-08-01",
      paymentMethodLabel: "Visa ····4242",
      totalPaid: 300,
      totalExpected: 600,
    });
  });

  it("maps fund/general designation categories and null next charge", () => {
    expect(
      mapRecurringGiftToPledgeView({
        ...gift,
        nextChargeAt: null,
        designation: { id: "f-1", name: "Medical Fund", type: "fund", avatarUrl: null },
      }).recipientCategory,
    ).toBe("Fund");
    expect(
      mapRecurringGiftToPledgeView({
        ...gift,
        designation: { id: null, name: "General", type: "general", avatarUrl: null },
      }).recipientCategory,
    ).toBe("General");
  });
});
