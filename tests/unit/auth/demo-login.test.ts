import {
  getDefaultPostLoginPathForApp,
  getDemoRoleForApp,
  safeNextParam,
} from "@asym/auth/demo-login";
import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("auth/demo-login: next stays a same-app path", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function onTheDonorApp() {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
  }

  it.each([
    "/admin",
    "/admin/donors",
    "/admin/donors?tab=all#top",
    "/Admin/donors",
    "/missionary",
    "/missionary/profile",
    "/MISSIONARY/profile",
  ])("on, the donor app refuses %s, which another app serves", (next) => {
    onTheDonorApp();
    expect(safeNextParam(next)).toBeNull();
  });

  it.each([
    "/administration",
    "/admins/x",
    "/missionary-stories",
    "/donor-dashboard/x",
    "/workers/admin",
  ])("on, the donor app keeps %s (guard)", (next) => {
    onTheDonorApp();
    expect(safeNextParam(next)).toBe(next);
  });

  it.each([undefined, "0"])(
    "off (switch %s), the donor app keeps /admin/donors as today (guard)",
    (value) => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
      expect(safeNextParam("/admin/donors")).toBe("/admin/donors");
    },
  );

  it.each(["/admin", "/missionary"])(
    "on, the dashboard under %s keeps /missionary/x and /admin/x: its base path keeps them inside it (guard)",
    (base) => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
      vi.stubEnv("CORE_APP_BASE_PATH", base);
      expect(safeNextParam("/missionary/x")).toBe("/missionary/x");
      expect(safeNextParam("/admin/x")).toBe("/admin/x");
    },
  );
});
