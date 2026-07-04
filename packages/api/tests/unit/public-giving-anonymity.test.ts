import { describe, expect, it } from "vitest";

import {
  buildReceiptIdentitySnapshot,
  isIdentityPrivilegedScope,
  projectGiftForViewer,
  type RawGiftForView,
} from "../../src/public-giving";

/**
 * Public-giving WIRING — gift anonymity redaction projection.
 *
 * Conrad 2026-07-04 §2.7: "Anonymous giving means anonymous to missionary/public
 * views. It does not mean anonymous to admin/finance." §2.6: receipts preserve
 * the identity snapshot used at the time of giving.
 *
 * Data-boundary LAW (charter isolation #2): a public/anonymous viewer may only
 * ever see non-identifying fields — donor email is NEVER exposed to public or
 * missionary scopes, anonymous or not.
 */

const anonymousGift: RawGiftForView = {
  id: "gift-anon",
  donorFirstName: "Dana",
  donorLastName: "Ortiz",
  donorDisplayName: "Dana Ortiz",
  donorEmail: "dana@example.com",
  isAnonymous: true,
  amountCents: 25_000, // $250
  currency: "usd",
  designationLabel: "Water Project",
  createdAt: "2026-07-04T10:00:00.000Z",
};

const namedGift: RawGiftForView = {
  ...anonymousGift,
  id: "gift-named",
  isAnonymous: false,
};

describe("isIdentityPrivilegedScope", () => {
  it("grants identity to admin and finance, denies it to public and missionary", () => {
    expect(isIdentityPrivilegedScope("admin")).toBe(true);
    expect(isIdentityPrivilegedScope("finance")).toBe(true);
    expect(isIdentityPrivilegedScope("missionary")).toBe(false);
    expect(isIdentityPrivilegedScope("public")).toBe(false);
  });
});

describe("projectGiftForViewer — public / missionary scopes", () => {
  it("redacts an anonymous gift to 'Anonymous' for the public scope, with no PII", () => {
    const view = projectGiftForViewer(
      anonymousGift,
      "public",
    ) as unknown as Record<string, unknown>;
    expect(view.donorDisplay).toBe("Anonymous");
    expect(view.amount).toBe(250);
    expect(view.designationLabel).toBe("Water Project");
    // No PII may reach a public viewer.
    expect(view.donorEmail).toBeUndefined();
    expect(view.donorFirstName).toBeUndefined();
    expect(view.donorLastName).toBeUndefined();
    expect(JSON.stringify(view)).not.toContain("dana@example.com");
    expect(JSON.stringify(view)).not.toContain("Ortiz");
  });

  it("redacts an anonymous gift for the missionary scope too", () => {
    const view = projectGiftForViewer(
      anonymousGift,
      "missionary",
    ) as unknown as Record<string, unknown>;
    expect(view.donorDisplay).toBe("Anonymous");
    expect(view.donorEmail).toBeUndefined();
  });

  it("shows a named gift's display name but NEVER the email to public/missionary", () => {
    const pub = projectGiftForViewer(namedGift, "public") as unknown as Record<
      string,
      unknown
    >;
    expect(pub.donorDisplay).toBe("Dana Ortiz");
    expect(pub.donorEmail).toBeUndefined();
    expect(JSON.stringify(pub)).not.toContain("dana@example.com");
  });
});

describe("projectGiftForViewer — admin / finance scopes", () => {
  it("shows the REAL identity to admin even when the gift is anonymous", () => {
    const view = projectGiftForViewer(
      anonymousGift,
      "admin",
    ) as unknown as Record<string, unknown>;
    expect(view.donorEmail).toBe("dana@example.com");
    expect(view.donorName).toBe("Dana Ortiz");
    expect(view.isAnonymous).toBe(true);
  });

  it("shows the real identity to finance for reconciliation/audit", () => {
    const view = projectGiftForViewer(
      anonymousGift,
      "finance",
    ) as unknown as Record<string, unknown>;
    expect(view.donorEmail).toBe("dana@example.com");
  });
});

describe("projectGiftForViewer — anonymity fails CLOSED", () => {
  it("redacts to 'Anonymous' when the anonymity flag is missing/null (never leak a name)", () => {
    // Simulate the unmigrated `is_anonymous` column arriving as null/undefined.
    const flagless = {
      ...namedGift,
      isAnonymous: null as unknown as boolean,
    };
    const pub = projectGiftForViewer(flagless, "public") as unknown as Record<
      string,
      unknown
    >;
    expect(pub.donorDisplay).toBe("Anonymous");
    expect(JSON.stringify(pub)).not.toContain("Ortiz");
  });
});

describe("projectGiftForViewer — finance/admin money precision", () => {
  it("gives finance/admin EXACT cents (no floored dollars) for reconciliation", () => {
    const gift: RawGiftForView = { ...namedGift, amountCents: 999 }; // $9.99
    const view = projectGiftForViewer(gift, "finance") as unknown as Record<
      string,
      unknown
    >;
    expect(view.amountCents).toBe(999);
    expect(view.amount).toBeCloseTo(9.99, 2);
  });
});

describe("buildReceiptIdentitySnapshot", () => {
  it("preserves the real identity at time of giving even for anonymous gifts", () => {
    const snap = buildReceiptIdentitySnapshot(anonymousGift);
    expect(snap.name).toBe("Dana Ortiz");
    expect(snap.email).toBe("dana@example.com");
    expect(snap.capturedAtGiving).toBe(true);
  });
});
