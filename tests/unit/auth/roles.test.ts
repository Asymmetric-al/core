import {
  defaultRouteForRole,
  isAppRole,
  routeForProfileRole,
} from "@asym/auth/roles";
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
    expect(routeForProfileRole("admin")).toBe("/");
    expect(routeForProfileRole("staff")).toBe("/");
    expect(routeForProfileRole("super_admin")).toBe("/");
    expect(routeForProfileRole("donor")).toBe("/donor-dashboard");
    expect(routeForProfileRole("unknown_role")).toBeNull();
  });
});
