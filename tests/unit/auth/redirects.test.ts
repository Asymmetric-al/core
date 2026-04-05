import { describe, expect, it } from "vitest";

import { getProtectedAppRedirectPath } from "../../../packages/auth/redirects";

describe("getProtectedAppRedirectPath", () => {
  it("returns the login path when no session user exists", () => {
    expect(
      getProtectedAppRedirectPath(
        {
          userId: null,
          isAuthenticated: false,
        },
        "/login?next=/donor-dashboard",
      ),
    ).toBe("/login?next=/donor-dashboard");
  });

  it("returns no-access when a session exists but auth context is unusable", () => {
    expect(
      getProtectedAppRedirectPath(
        {
          userId: "user_1",
          isAuthenticated: false,
        },
        "/login?next=%2Fmissionary%2Fprofile",
      ),
    ).toBe("/no-access");
  });

  it("returns null when the user is authenticated", () => {
    expect(
      getProtectedAppRedirectPath(
        {
          userId: "user_1",
          isAuthenticated: true,
        },
        "/login?next=/donor-dashboard",
      ),
    ).toBeNull();
  });
});
