import { defaultRouteForRole, isAppRole, routeForRole } from "@asym/auth/roles";
import { describe, expect, it } from "vitest";

describe("auth/roles", () => {
  it("returns default routes for canonical roles", () => {
    expect(defaultRouteForRole("admin")).toBe("/");
    expect(defaultRouteForRole("missionary")).toBe("/");
    expect(defaultRouteForRole("donor")).toBe("/donor-dashboard");
  });

  it("identifies canonical app roles", () => {
    expect(isAppRole("admin")).toBe(true);
    expect(isAppRole("ticketing")).toBe(true);
    expect(isAppRole("staff")).toBe(false);
  });

  it("maps profile role aliases to home routes", () => {
    expect(routeForRole("admin")).toBe("/");
    expect(routeForRole("staff")).toBe("/");
    expect(routeForRole("super_admin")).toBe("/");
    expect(routeForRole("donor")).toBe("/donor-dashboard");
    expect(routeForRole("unknown_role")).toBeNull();
  });
});
