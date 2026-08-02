import {
  getDefaultPostLoginPathForApp,
  getDemoRoleForApp,
  safeNextParam,
} from "@asym/auth/demo-login";
import { describe, expect, it } from "vitest";

describe("auth/demo-login", () => {
  it("maps app id to demo role", () => {
    expect(getDemoRoleForApp("admin")).toBe("admin");
    expect(getDemoRoleForApp("missionary")).toBe("missionary");
    expect(getDemoRoleForApp("donor")).toBe("donor");
  });

  it("maps app id to default post-login path", () => {
    expect(getDefaultPostLoginPathForApp("admin")).toBe("/");
    expect(getDefaultPostLoginPathForApp("missionary")).toBe("/");
    expect(getDefaultPostLoginPathForApp("donor")).toBe("/donor-dashboard");
  });

  it("accepts safe relative paths and preserves query/hash", () => {
    expect(safeNextParam("/donor-dashboard")).toBe("/donor-dashboard");
    expect(safeNextParam("/mc?tab=users#top")).toBe("/mc?tab=users#top");
    expect(safeNextParam("   /tasks?filter=open   ")).toBe(
      "/tasks?filter=open",
    );
  });

  it("rejects unsafe or blocked next params", () => {
    expect(safeNextParam(null)).toBeNull();
    expect(safeNextParam("")).toBeNull();
    expect(safeNextParam("https://evil.example")).toBeNull();
    expect(safeNextParam("//evil.example")).toBeNull();
    expect(safeNextParam("/..//evil.example")).toBeNull();
    expect(safeNextParam("javascript:alert(1)")).toBeNull();
    expect(safeNextParam("/login")).toBeNull();
    expect(safeNextParam("/register")).toBeNull();
    expect(safeNextParam("/auth/callback")).toBeNull();
    expect(safeNextParam("/api/auth/demo-account")).toBeNull();
  });
});
