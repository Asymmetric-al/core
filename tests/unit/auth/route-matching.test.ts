import { describe, expect, it } from "vitest";

import {
  matchesListedRoute,
  matchesProtectedPrefix,
} from "../../../packages/auth/route-matching";

describe("matchesProtectedPrefix", () => {
  it('treats "/" as the entire app (not the broken "//" prefix bug)', () => {
    expect(matchesProtectedPrefix("/admin", "/")).toBe(true);
    expect(matchesProtectedPrefix("/web-studio", "/")).toBe(true);
    expect(matchesProtectedPrefix("/", "/")).toBe(true);
  });

  it("matches nested paths for non-root prefixes", () => {
    expect(matchesProtectedPrefix("/donor-dashboard", "/donor-dashboard")).toBe(
      true,
    );
    expect(
      matchesProtectedPrefix("/donor-dashboard/settings", "/donor-dashboard"),
    ).toBe(true);
    expect(matchesProtectedPrefix("/login", "/donor-dashboard")).toBe(false);
  });
});

describe("matchesListedRoute", () => {
  it('lists "/" as homepage only (so public "/" does not open every route)', () => {
    expect(matchesListedRoute("/", "/")).toBe(true);
    expect(matchesListedRoute("/about", "/")).toBe(false);
    expect(matchesListedRoute("/admin", "/")).toBe(false);
  });

  it("matches prefix for non-root listed routes", () => {
    expect(matchesListedRoute("/workers/1", "/workers")).toBe(true);
    expect(matchesListedRoute("/workers", "/workers")).toBe(true);
  });
});
