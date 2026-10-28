import { afterEach, describe, expect, it, vi } from "vitest";

import {
  checkProfileImageUrl,
  getProfileImageOrigin,
  isOwnProfileImageUrl,
} from "../../../../../packages/api/src/profile/image-url";

const ORIGIN = "https://proj.supabase.co";
const P = `${ORIGIN}/storage/v1/object/public/profiles`;
const T = "aaaaaaaa-0000-4000-8000-00000000000a";
const T2 = "bbbbbbbb-0000-4000-8000-00000000000b";
const U = "cccccccc-0000-4000-8000-00000000000c";
const X = "eeeeeeee-0000-4000-8000-00000000000e";
const DEMO = "00000000-0000-0000-0000-000000000001";
const F = "0b0e6c3e-7d1a-4b55-9b52-6a3f1d2c4e5f.webp";
const own = { purpose: "avatars", tenantId: T, userId: U } as const;
const valid = (url: string, expected: Partial<typeof own> = {}) =>
  isOwnProfileImageUrl(url, { ...own, origin: ORIGIN, ...expected });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isOwnProfileImageUrl", () => {
  it("accepts the caller's own avatars and covers object URLs", () => {
    expect(valid(`${P}/avatars/${T}/${U}/${F}`)).toBe(true);
    expect(valid(`${P}/covers/${T}/${U}/x.jpg`, { purpose: "covers" })).toBe(
      true,
    );
    expect(valid(`${P}/avatars/${T}/${U}/nested/x.png`)).toBe(true);
  });

  it("accepts the demo tenant folder only when the caller's tenant is the demo tenant", () => {
    const url = `${P}/avatars/${DEMO}/${U}/${F}`;
    expect(valid(url, { tenantId: DEMO })).toBe(true);
    expect(valid(url)).toBe(false);
  });

  it.each([
    ["another user's folder", `${P}/avatars/${T}/${X}/${F}`],
    ["another tenant's folder", `${P}/avatars/${T2}/${U}/${F}`],
    ["the other purpose", `${P}/covers/${T}/${U}/${F}`],
    ["an unknown purpose", `${P}/documents/${T}/${U}/${F}`],
    ["a legacy object", `${P}/avatars/${U}-123.webp`],
    ["a bucket-root object", `${P}/${U}.webp`],
    ["a folder with no file", `${P}/avatars/${T}/${U}/`],
    ["an empty segment", `${P}/avatars/${T}/${U}//${F}`],
    ["an upper-cased tenant", `${P}/avatars/${T.toUpperCase()}/${U}/${F}`],
    ["an upper-cased uid", `${P}/avatars/${T}/${U.toUpperCase()}/${F}`],
    ["an upper-cased purpose", `${P}/AVATARS/${T}/${U}/${F}`],
  ])("rejects %s", (_label, url) => {
    expect(valid(url)).toBe(false);
  });

  const path = `/storage/v1/object/public/profiles/avatars/${T}/${U}/${F}`;
  it.each([
    ["another origin", `https://evil.example${path}`],
    ["a host extending the origin", `${ORIGIN}.evil.example${path}`],
    ["a host sharing a string prefix", `${ORIGIN}evil.example${path}`],
    ["http for an https origin", `http://proj.supabase.co${path}`],
    ["a different port", `${ORIGIN}:8443${path}`],
    ["an explicit default port", `${ORIGIN}:443${path}`],
    ["an upper-cased host", `https://PROJ.supabase.co${path}`],
    ["credentials", `https://user:pass@proj.supabase.co${path}`],
    ["a username", `https://user@proj.supabase.co${path}`],
  ])("rejects %s", (_label, url) => {
    expect(valid(url)).toBe(false);
  });

  const mine = `avatars/${T}/${U}`;
  it.each([
    [
      "another bucket",
      `${ORIGIN}/storage/v1/object/public/documents/${mine}/${F}`,
    ],
    [
      "a bucket that starts with profiles",
      `${ORIGIN}/storage/v1/object/public/profiles-archive/${mine}/${F}`,
    ],
    [
      "the sign endpoint",
      `${ORIGIN}/storage/v1/object/sign/profiles/${mine}/${F}`,
    ],
    [
      "the authenticated endpoint",
      `${ORIGIN}/storage/v1/object/authenticated/profiles/${mine}/${F}`,
    ],
    [
      "the render endpoint",
      `${ORIGIN}/storage/v1/render/image/public/profiles/${mine}/${F}`,
    ],
    ["a query string", `${P}/${mine}/${F}?width=64`],
    ["an empty query", `${P}/${mine}/${F}?`],
    ["a fragment", `${P}/${mine}/${F}#top`],
    ["a raw . segment", `${P}/${mine}/./${F}`],
    ["a raw .. segment", `${P}/${mine}/../${U}/${F}`],
    [
      "a .. segment out of another folder",
      `${P}/avatars/${T}/${X}/../${U}/${F}`,
    ],
    ["an encoded .. segment", `${P}/${mine}/%2e%2e/${U}/${F}`],
    ["an encoded . segment", `${P}/${mine}/%2E/${F}`],
    ["a mixed encoded .. segment", `${P}/${mine}/.%2e/${F}`],
    ["an encoded / in the file", `${P}/${mine}/a%2F${F}`],
    ["an encoded / joining segments", `${P}/avatars%2F${T}/${U}/${F}`],
    ["a backslash", `${P}/${mine}\\${F}`],
    ["an empty object path", `${P}/`],
    ["no object path", P],
    ["an ftp scheme", `ftp://proj.supabase.co${path}`],
    ["a javascript scheme", "javascript:alert(1)"],
    ["an empty string", ""],
    ["a relative URL", `/storage/v1/object/public/profiles/${mine}/${F}`],
  ])("rejects %s", (_label, url) => {
    expect(valid(url)).toBe(false);
  });

  it("rejects everything when the caller's tenant or uid is empty", () => {
    expect(valid(`${P}/avatars//${U}/${F}`, { tenantId: "" })).toBe(false);
    expect(valid(`${P}/avatars/${T}//${F}`, { userId: "" })).toBe(false);
  });
});

describe("getProfileImageOrigin", () => {
  it.each([
    ["the plain URL", ORIGIN],
    ["a trailing slash", `${ORIGIN}/`],
    ["a mixed-case host", "https://Proj.Supabase.CO"],
    ["a mixed-case host and trailing slash", "https://PROJ.supabase.co/"],
    ["surrounding whitespace", ` ${ORIGIN} `],
  ])("normalizes %s to the parsed origin", (_label, configured) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", configured);
    const origin = getProfileImageOrigin();
    expect(origin).toBe(ORIGIN);
    expect(
      isOwnProfileImageUrl(`${P}/avatars/${T}/${U}/${F}`, {
        ...own,
        origin: origin!,
      }),
    ).toBe(true);
  });

  it.each([
    ["unset", undefined],
    ["empty", ""],
    ["not a URL", "proj.supabase.co"],
    ["not http(s)", "ftp://proj.supabase.co"],
  ])("returns null when the configured URL is %s", (_label, configured) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", configured);
    expect(getProfileImageOrigin()).toBeNull();
  });
});

describe("checkProfileImageUrl", () => {
  const input = { ...own, stored: [] as (string | null)[] };
  const status = (fn: () => unknown) => {
    try {
      fn();
    } catch (error) {
      return (error as { status?: number }).status;
    }
    return "no error";
  };

  it("skips an absent value and writes null without needing config", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    expect(checkProfileImageUrl(undefined, input)).toBe(false);
    expect(checkProfileImageUrl(null, input)).toBe(true);
  });

  it("skips a value equal to a stored value, even one that would fail (OQ2)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    const external = "https://images.unsplash.com/photo-1?w=400";
    expect(
      checkProfileImageUrl(external, { ...input, stored: [null, external] }),
    ).toBe(false);
  });

  it("writes a new own-folder URL and rejects others with 400", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ORIGIN);
    expect(checkProfileImageUrl(`${P}/avatars/${T}/${U}/${F}`, input)).toBe(
      true,
    );
    expect(
      status(() => checkProfileImageUrl(`${P}/avatars/${T}/${X}/${F}`, input)),
    ).toBe(400);
    expect(
      status(() =>
        checkProfileImageUrl("https://images.unsplash.com/photo-2", {
          ...input,
          stored: ["https://images.unsplash.com/photo-1"],
        }),
      ),
    ).toBe(400);
  });

  it("returns 503 for a new non-null URL when the public URL is not configured (OQ9)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    expect(
      status(() => checkProfileImageUrl(`${P}/avatars/${T}/${U}/${F}`, input)),
    ).toBe(503);
  });
});
