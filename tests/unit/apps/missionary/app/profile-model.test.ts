import { describe, expect, it } from "vitest";

import {
  asObject,
  asString,
  countWords,
  mapApiProfileToProfileData,
} from "../../../../../apps/missionary/app/profile/profile-model";

describe("profile-model helpers", () => {
  it("returns null for non-object values", () => {
    expect(asObject(null)).toBeNull();
    expect(asObject("profile")).toBeNull();
  });

  it("returns an object for plain object values", () => {
    const value = { first_name: "Jane" };
    expect(asObject(value)).toEqual(value);
  });

  it("returns an empty string for non-string values", () => {
    expect(asString(undefined)).toBe("");
    expect(asString(42)).toBe("");
  });

  it("maps nested API profile data into the UI model", () => {
    expect(
      mapApiProfileToProfileData({
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com",
        avatar_url: "https://example.com/avatar.jpg",
        missionary: {
          phone: "+1 555 111 2222",
          location: "Chiang Mai",
          tagline: "Serving families well",
          bio: "A long bio",
          cover_url: "https://example.com/cover.jpg",
          social_links: {
            facebook: "https://facebook.com/jane",
            instagram: "https://instagram.com/jane",
            twitter: "https://x.com/jane",
            youtube: "https://youtube.com/jane",
            website: "https://example.com",
          },
        },
      }),
    ).toEqual({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "+1 555 111 2222",
      location: "Chiang Mai",
      ministryFocus: "Serving families well",
      bio: "A long bio",
      facebook: "https://facebook.com/jane",
      instagram: "https://instagram.com/jane",
      twitter: "https://x.com/jane",
      youtube: "https://youtube.com/jane",
      website: "https://example.com",
      avatarUrl: "https://example.com/avatar.jpg",
      coverUrl: "https://example.com/cover.jpg",
    });
  });

  it("counts words by ignoring repeated whitespace", () => {
    expect(countWords("one two   three\nfour")).toBe(4);
    expect(countWords("   ")).toBe(0);
  });
});
