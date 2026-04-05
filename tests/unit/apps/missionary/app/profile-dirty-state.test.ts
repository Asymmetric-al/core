import { describe, expect, it } from "vitest";

import { hasProfileChanges } from "../../../../../apps/missionary/app/profile/profile-dirty-state";

const baseProfile = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "+1 555 111 2222",
  location: "Chiang Mai",
  ministryFocus: "Serving families well",
  bio: "A".repeat(220),
  facebook: "https://facebook.com/jane",
  instagram: "https://instagram.com/jane",
  twitter: "https://x.com/jane",
  youtube: "https://youtube.com/jane",
  website: "https://example.com",
  avatarUrl: "https://example.com/avatar.jpg",
  coverUrl: "https://example.com/cover.jpg",
};

describe("hasProfileChanges", () => {
  it("returns false when profile fields are unchanged", () => {
    expect(hasProfileChanges(baseProfile, baseProfile)).toBe(false);
  });

  it("returns true when a tracked field changes", () => {
    expect(
      hasProfileChanges(
        {
          ...baseProfile,
          ministryFocus: "Serving churches well",
        },
        baseProfile,
      ),
    ).toBe(true);
  });

  it("handles long bio strings without relying on JSON serialization", () => {
    const currentProfile = {
      ...baseProfile,
      bio: `${baseProfile.bio}\n${"Long-form update ".repeat(200)}`,
    };

    expect(hasProfileChanges(currentProfile, baseProfile)).toBe(true);
  });
});
