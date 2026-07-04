import { describe, expect, it } from "vitest";

import {
  ANONYMOUS_DONOR_LABEL,
  isAnonymousToRecipient,
  isAnonymousToPublic,
  projectPublicDonorDisplayName,
  redactDonorRelationshipForMissionary,
  redactGiftForMissionary,
  redactTaskDonorForMissionary,
} from "../../src/missionary-portal/redaction";

/**
 * TDD — missionary/public redaction (DONOR_ANONYMITY_GUEST_GIVING_SPEC §7.2/§7.3).
 * SECURITY invariant: a redacted payload contains ZERO donor identifiers
 * (name/email/phone/avatar/location). Named ONLY when the donor consented
 * (i.e. is not anonymous to that surface).
 */

describe("isAnonymousToRecipient — signal resolution", () => {
  it("unknown_offline gifts are always anonymous", () => {
    expect(
      isAnonymousToRecipient({ donorIdentityStatus: "unknown_offline" }),
    ).toBe(true);
  });
  it("a per-gift flag overrides the donor default", () => {
    expect(
      isAnonymousToRecipient({
        giftAnonymousToRecipient: true,
        givingPreferences: { defaultAnonymousToRecipient: false },
      }),
    ).toBe(true);
    expect(
      isAnonymousToRecipient({
        giftAnonymousToRecipient: false,
        givingPreferences: { defaultAnonymousToRecipient: true },
      }),
    ).toBe(false);
  });
  it("falls back to the donor-level default", () => {
    expect(
      isAnonymousToRecipient({
        givingPreferences: { defaultAnonymousToRecipient: true },
      }),
    ).toBe(true);
  });
  it("defaults to NOT anonymous (named) when there is no signal", () => {
    expect(isAnonymousToRecipient({})).toBe(false);
    expect(isAnonymousToRecipient({ givingPreferences: null })).toBe(false);
  });
});

describe("isAnonymousToPublic — keyed on the public preference", () => {
  it("uses defaultAnonymousToPublic, independent of recipient", () => {
    expect(
      isAnonymousToPublic({ givingPreferences: { defaultAnonymousToPublic: true } }),
    ).toBe(true);
    expect(
      isAnonymousToPublic({
        givingPreferences: { defaultAnonymousToRecipient: true },
      }),
    ).toBe(false);
  });
  it("unknown_offline always anonymous to public too", () => {
    expect(isAnonymousToPublic({ donorIdentityStatus: "unknown_offline" })).toBe(
      true,
    );
  });
});

const donorRel = {
  id: "donor-1",
  displayName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1-555-0100",
  preferredContact: "email",
  avatarUrl: "https://cdn/x.png",
  location: "Chiang Mai",
  status: "active",
  totalGivenCents: 50000,
  lastGiftAt: "2026-07-01",
  lastGiftAmountCents: 10000,
  giftCount: 5,
  frequency: "monthly",
  tags: ["major-donor"],
  hasActivePledge: true,
};

describe("redactDonorRelationshipForMissionary", () => {
  it("named donor (not anonymous) is unchanged", () => {
    expect(redactDonorRelationshipForMissionary(donorRel, false)).toEqual(
      donorRel,
    );
  });

  it("anonymous donor → Anonymous donor + ZERO identifiers, stats preserved", () => {
    const out = redactDonorRelationshipForMissionary(donorRel, true);
    expect(out.displayName).toBe(ANONYMOUS_DONOR_LABEL);
    expect(out.email).toBeNull();
    expect(out.phone).toBeNull();
    expect(out.avatarUrl).toBeNull();
    expect(out.location).toBeNull();
    expect(out.tags).toEqual([]);
    // Aggregate support stats stay visible (§7.2 allows amount/date/frequency).
    expect(out.totalGivenCents).toBe(50000);
    expect(out.giftCount).toBe(5);
    expect(out.frequency).toBe("monthly");
    // No raw PII anywhere in the serialized payload.
    const s = JSON.stringify(out);
    expect(s).not.toContain("Ada");
    expect(s).not.toContain("ada@example.com");
    expect(s).not.toContain("555-0100");
    expect(s).not.toContain("Chiang Mai");
    expect(s).not.toContain("major-donor");
  });
});

describe("redactGiftForMissionary", () => {
  it("nulls donorId for an anonymous gift (breaks correlation)", () => {
    expect(redactGiftForMissionary({ donorId: "donor-1", amount: 10 }, true))
      .toEqual({ donorId: null, amount: 10 });
  });
  it("keeps donorId when named", () => {
    expect(redactGiftForMissionary({ donorId: "donor-1", amount: 10 }, false))
      .toEqual({ donorId: "donor-1", amount: 10 });
  });
});

describe("redactTaskDonorForMissionary", () => {
  const donor = {
    id: "donor-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    avatar_url: "https://cdn/x.png",
  };
  it("anonymous → Anonymous donor, no email/avatar", () => {
    const out = redactTaskDonorForMissionary(donor, true);
    expect(out?.name).toBe(ANONYMOUS_DONOR_LABEL);
    expect(out?.email).toBeNull();
    expect(out?.avatar_url).toBeNull();
    expect(JSON.stringify(out)).not.toContain("ada@example.com");
  });
  it("named → unchanged; null donor → null", () => {
    expect(redactTaskDonorForMissionary(donor, false)).toEqual(donor);
    expect(redactTaskDonorForMissionary(null, true)).toBeNull();
  });
});

describe("projectPublicDonorDisplayName (§7.3)", () => {
  it("Anonymous donor when anonymous to public, else the name", () => {
    expect(projectPublicDonorDisplayName("Ada", true)).toBe(
      ANONYMOUS_DONOR_LABEL,
    );
    expect(projectPublicDonorDisplayName("Ada", false)).toBe("Ada");
    expect(projectPublicDonorDisplayName(null, false)).toBe(
      ANONYMOUS_DONOR_LABEL,
    );
  });
});
