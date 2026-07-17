import { describe, expect, it } from "vitest";

import {
  formatPledgeCurrency,
  formatPledgeDate,
  mapRecurringGiftToPledgeView,
} from "../../src/donor-portal/pledge-view";
import {
  buildDonorProfileSettingsPatch,
  buildDonorSettingsPatch,
  buildProfileFormState,
  splitDisplayName,
} from "../../src/donor-portal/settings-patch";

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
    expect(splitDisplayName("Cher")).toEqual({
      firstName: "Cher",
      lastName: "",
    });
    expect(splitDisplayName(null)).toEqual({ firstName: "", lastName: "" });
  });
});

describe("buildDonorSettingsPatch", () => {
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

  it("rejects unsupported runtime keys through the strict schema", () => {
    expect(() =>
      buildDonorSettingsPatch({
        firstName: "Ada",
        email: "ada@example.com",
      } as unknown as Parameters<typeof buildDonorSettingsPatch>[0]),
    ).toThrow();
  });

  it("omits undefined fields (only sends what changed/present)", () => {
    const patch = buildDonorSettingsPatch({
      phone: undefined,
      firstName: "Ada",
    });
    expect(patch).toEqual({ firstName: "Ada" });
  });

  it("keeps explicit null values (used to clear fields)", () => {
    const patch = buildDonorSettingsPatch({
      phone: null,
      avatarUrl: null,
      firstName: "Ada",
    });
    expect(patch).toEqual({ phone: null, avatarUrl: null, firstName: "Ada" });
  });
});

describe("buildDonorProfileSettingsPatch", () => {
  it("rejects blank required name fields before building a PATCH", () => {
    expect(
      buildDonorProfileSettingsPatch({
        firstName: " ",
        lastName: "Lovelace",
        phone: "",
        avatarUrl: "",
      }),
    ).toEqual({ ok: false, errorMessage: "First name is required." });

    expect(
      buildDonorProfileSettingsPatch({
        firstName: "Ada",
        lastName: " ",
        phone: "",
        avatarUrl: "",
      }),
    ).toEqual({ ok: false, errorMessage: "Last name is required." });
  });

  it("trims names, derives displayName, and preserves explicit null clears", () => {
    expect(
      buildDonorProfileSettingsPatch({
        firstName: " Ada ",
        lastName: " Lovelace ",
        phone: " ",
        avatarUrl: "",
      }),
    ).toEqual({
      ok: true,
      patch: {
        firstName: "Ada",
        lastName: "Lovelace",
        displayName: "Ada Lovelace",
        phone: null,
        avatarUrl: null,
      },
    });
  });

  it("returns a form error instead of throwing for invalid optional values", () => {
    expect(
      buildDonorProfileSettingsPatch({
        firstName: "Ada",
        lastName: "Lovelace",
        phone: "",
        avatarUrl: "not-a-url",
      }),
    ).toEqual({
      ok: false,
      errorMessage: "Please check your profile details.",
    });
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
        designation: {
          id: "f-1",
          name: "Medical Fund",
          type: "fund",
          avatarUrl: null,
        },
      }).recipientCategory,
    ).toBe("Fund");
    expect(
      mapRecurringGiftToPledgeView({
        ...gift,
        designation: {
          id: null,
          name: "General",
          type: "general",
          avatarUrl: null,
        },
      }).recipientCategory,
    ).toBe("General");
  });
});

describe("pledge display formatting", () => {
  it("formats date-only next charge values without shifting the calendar day", () => {
    expect(formatPledgeDate("2026-08-01", "en-US")).toBe("Aug 1, 2026");
  });

  it("formats pledge amounts with the pledge currency", () => {
    expect(formatPledgeCurrency(50, "EUR", "en-US")).toBe("€50.00");
  });
});
