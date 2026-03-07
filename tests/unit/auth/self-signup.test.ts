import { describe, expect, it } from "vitest";

import {
  SELF_SIGNUP_ROLES,
  getSelfSignupRedirectPath,
  normalizeSelfSignupRole,
} from "../../../packages/auth/self-signup";

describe("self-signup role policy", () => {
  it("only exposes safe public self-signup roles", () => {
    expect(SELF_SIGNUP_ROLES).toEqual(["donor", "missionary"]);
  });

  it("preserves supported self-signup roles", () => {
    expect(normalizeSelfSignupRole("donor")).toBe("donor");
    expect(normalizeSelfSignupRole("missionary")).toBe("missionary");
  });

  it("downgrades privileged or unknown roles to donor", () => {
    expect(normalizeSelfSignupRole("staff")).toBe("donor");
    expect(normalizeSelfSignupRole("admin")).toBe("donor");
    expect(normalizeSelfSignupRole("super_admin")).toBe("donor");
    expect(normalizeSelfSignupRole("totally-unknown")).toBe("donor");
    expect(normalizeSelfSignupRole(null)).toBe("donor");
  });

  it("maps safe self-signup roles to stable post-signup destinations", () => {
    expect(getSelfSignupRedirectPath("donor")).toBe("/donor-dashboard");
    expect(getSelfSignupRedirectPath("missionary")).toBe("/");
  });
});
