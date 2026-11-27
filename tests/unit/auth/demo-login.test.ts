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

  it("accepts safe relative paths, keeps the query and drops any fragment", () => {
    expect(safeNextParam("/donor-dashboard")).toBe("/donor-dashboard");
    expect(safeNextParam("/mc?tab=users#top")).toBe("/mc?tab=users");
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

  it.each([
    "/forgot-password",
    "/forgot-password/reset",
    "/admin/login",
    "/missionary/login",
    "/admin/register",
    "/missionary/register",
    "/api/x",
    "/API/x",
    "/admin/api/x",
    "/missionary/api/x",
    "/%61pi/x",
  ])(
    "refuses %s, which is no page to land on (N4: the default instead)",
    (next) => {
      expect(safeNextParam(next)).toBeNull();
    },
  );

  it("accepts a selector-only doorway path, without its fragment or query", () => {
    expect(safeNextParam("/invite/sel_ABC123")).toBe("/invite/sel_ABC123");
    expect(safeNextParam("/invite/sel_ABC123#verifier")).toBe(
      "/invite/sel_ABC123",
    );
    expect(safeNextParam("/invite/sel_ABC123?v=secret#verifier")).toBe(
      "/invite/sel_ABC123",
    );
  });

  it.each(["/apiary", "/workers/api", "/admin-notes", "/forgot-passwords"])(
    "keeps %s, which only looks like a refused path (guard)",
    (next) => {
      expect(safeNextParam(next)).toBe(next);
    },
  );
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
    "/%61dmin/donors",
    "/admin%2fdonors",
    "/%6Dissionary/profile",
  ])("on, the donor app refuses %s, which another app serves", (next) => {
    onTheDonorApp();
    expect(safeNextParam(next)).toBeNull();
  });

  it.each([
    "/.%2fadmin/donors",
    "/..%2fadmin/donors",
    "/x/..%2fadmin/donors",
    "/admin%3fx",
    "/admin%23x",
    "/%2e/admin",
    "/.%2fmissionary/x",
  ])(
    "on, the donor app refuses %s, which could leave it after decoding",
    (next) => {
      onTheDonorApp();
      expect(safeNextParam(next)).toBeNull();
    },
  );

  it.each(["/workers/a%2520b", "/workers/a%09b", "/x%0Ay", "/x%0dy"])(
    "on, the donor app refuses %s, which still holds a percent sign, a tab or a line break after decoding (issue 2845 item 12)",
    (next) => {
      onTheDonorApp();
      expect(safeNextParam(next)).toBeNull();
    },
  );

  it.each([
    "/administration",
    "/admins/x",
    "/missionary-stories",
    "/donor-dashboard/x",
    "/workers/admin",
    "/workers/jos%C3%A9",
  ])("on, the donor app keeps %s (guard)", (next) => {
    onTheDonorApp();
    expect(safeNextParam(next)).toBe(next);
  });

  it("on, the donor app keeps a page with its query and drops its fragment (guard)", () => {
    onTheDonorApp();
    expect(safeNextParam("/checkout?gift=1#pay")).toBe("/checkout?gift=1");
  });

  it.each([undefined, "0"])(
    "off (switch %s), the donor app keeps /admin/donors as today (guard)",
    (value) => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
      expect(safeNextParam("/admin/donors")).toBe("/admin/donors");
      expect(safeNextParam("/%61dmin/donors")).toBe("/%61dmin/donors");
      expect(safeNextParam("/admin%2fdonors")).toBe("/admin%2fdonors");
      expect(safeNextParam("/admin%3fx")).toBe("/admin%3fx");
      expect(safeNextParam("/workers/a%2520b")).toBe("/workers/a%2520b");
      expect(safeNextParam("/workers/a%09b")).toBe("/workers/a%09b");
      expect(safeNextParam("/x/..%2fadmin/donors")).toBe(
        "/x/..%2fadmin/donors",
      );
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
