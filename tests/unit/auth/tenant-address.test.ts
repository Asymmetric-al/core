import { describe, expect, it } from "vitest";

import {
  buildTenantPrefix,
  isOutsideTenantSegment,
  parseTenantAddress,
  stripTenantAddress,
  withTenantAddress,
} from "../../../packages/auth/tenant-address";

/** The demo tenant: version digit 0, which the old helper refused (NX-03). */
const DEMO = "00000000-0000-0000-0000-000000000001";
const OTHER = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";

describe("parseTenantAddress (plan 5.2)", () => {
  it("reads a canonical lower-case UUID first segment as the tenant", () => {
    expect(parseTenantAddress(`/${DEMO}/care/directory`)).toEqual({
      tenantId: DEMO,
      subRole: null,
      prefix: `/${DEMO}`,
      innerPathname: "/care/directory",
    });
  });

  it("reads the bare prefix as the tenant's home page", () => {
    expect(parseTenantAddress(`/${OTHER}`)?.innerPathname).toBe("/");
    expect(parseTenantAddress(`/${OTHER}/`)?.innerPathname).toBe("/");
  });

  it("reads one staff sub-role after a tilde", () => {
    expect(parseTenantAddress(`/${DEMO}~member_care/care`)).toEqual({
      tenantId: DEMO,
      subRole: "member_care",
      prefix: `/${DEMO}~member_care`,
      innerPathname: "/care",
    });
  });

  it.each([
    ["an upper-case UUID", `/${OTHER.toUpperCase()}/care`],
    ["a UUID without hyphens", `/${DEMO.replaceAll("-", "")}/care`],
    ["a tenant slug", "/demo-org/care"],
    ["a page name", "/care/directory"],
    ["a name that is not a staff sub-role", `/${DEMO}~admin/care`],
    ["an operator suffix before WP10", `/${DEMO}~support/care`],
    ["two suffixes", `/${DEMO}~finance~hr/care`],
    ["a UUID that only starts the segment", `/${DEMO}x/care`],
    ["the root", "/"],
  ])("reads nothing else as a tenant: %s", (_label, pathname) => {
    expect(parseTenantAddress(pathname)).toBeNull();
  });
});

describe("stripTenantAddress and buildTenantPrefix", () => {
  it("strips the prefix and leaves other paths alone", () => {
    expect(stripTenantAddress(`/${DEMO}~finance/contributions`)).toBe(
      "/contributions",
    );
    expect(stripTenantAddress(`/${DEMO}`)).toBe("/");
    expect(stripTenantAddress("/contributions")).toBe("/contributions");
  });

  it("builds the prefix with and without a sub-role", () => {
    expect(buildTenantPrefix(DEMO, null)).toBe(`/${DEMO}`);
    expect(buildTenantPrefix(DEMO, "finance")).toBe(`/${DEMO}~finance`);
  });
});

describe("isOutsideTenantSegment", () => {
  it.each([
    "/api/admin/member-care/dashboard",
    "/login",
    "/register",
    "/forgot-password",
    "/auth/callback",
    "/no-access",
    "/choose-organization",
    "/web-studio",
    "/web-studio/collections/pages",
    "/boneyard/care",
    "/_next/static/chunk.js",
  ])("keeps %s outside the tenant segment", (pathname) => {
    expect(isOutsideTenantSegment(pathname)).toBe(true);
  });

  it.each(["/", "/care", "/apiary", "/logins", "/web-studios"])(
    "puts the signed-in page %s inside it",
    (pathname) => {
      expect(isOutsideTenantSegment(pathname)).toBe(false);
    },
  );
});

describe("withTenantAddress", () => {
  const prefix = `/${DEMO}~finance`;

  it("prefixes an internal page address, keeping query and fragment", () => {
    expect(withTenantAddress(prefix, "/contributions?gift=1#row")).toBe(
      `${prefix}/contributions?gift=1#row`,
    );
  });

  it("maps the home page onto the bare prefix", () => {
    expect(withTenantAddress(prefix, "/")).toBe(prefix);
    expect(withTenantAddress(prefix, "/?tab=open")).toBe(`${prefix}?tab=open`);
    expect(withTenantAddress(prefix, "/#top")).toBe(`${prefix}#top`);
  });

  it.each([
    ["no document prefix", null, "/contributions", "/contributions"],
    [
      "an absolute URL",
      prefix,
      "https://example.org/care",
      "https://example.org/care",
    ],
    [
      "a protocol-relative URL",
      prefix,
      "//example.org/care",
      "//example.org/care",
    ],
    ["a mail link", prefix, "mailto:a@example.org", "mailto:a@example.org"],
    ["a relative href", prefix, "detail/1", "detail/1"],
    ["a query-only href", prefix, "?page=2", "?page=2"],
    ["a fragment", prefix, "#section", "#section"],
    ["an API route", prefix, "/api/admin/export", "/api/admin/export"],
    ["sign-in", prefix, "/login?next=%2F", "/login?next=%2F"],
    [
      "Web Studio",
      prefix,
      "/web-studio/collections",
      "/web-studio/collections",
    ],
    [
      "the organization chooser",
      prefix,
      "/choose-organization",
      "/choose-organization",
    ],
    ["another tenant's address", prefix, `/${OTHER}/care`, `/${OTHER}/care`],
    ["an already prefixed address", prefix, `${prefix}/care`, `${prefix}/care`],
  ])("leaves %s unchanged", (_label, documentPrefix, href, expected) => {
    expect(withTenantAddress(documentPrefix, href)).toBe(expected);
  });
});
