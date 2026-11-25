import { afterEach, describe, expect, it } from "vitest";

import {
  APP_BASE_PATHS,
  appBasePath,
  appPathname,
  crossAppHref,
  isServeUnderPathsEnabled,
  withAppBasePath,
} from "../../../packages/database/document-reload";

const ORIGINAL_BASE = process.env.CORE_APP_BASE_PATH;
const ORIGINAL_SWITCH = process.env.CORE_SERVE_UNDER_PATHS;

afterEach(() => {
  if (ORIGINAL_BASE === undefined) delete process.env.CORE_APP_BASE_PATH;
  else process.env.CORE_APP_BASE_PATH = ORIGINAL_BASE;
  if (ORIGINAL_SWITCH === undefined) delete process.env.CORE_SERVE_UNDER_PATHS;
  else process.env.CORE_SERVE_UNDER_PATHS = ORIGINAL_SWITCH;
});

describe("app base-path helpers in document-reload", () => {
  it("defines dashboard prefixes once", () => {
    expect(APP_BASE_PATHS).toEqual({
      admin: "/admin",
      missionary: "/missionary",
      donor: "",
    });
  });

  it("is a complete no-op when the switch is off", () => {
    delete process.env.CORE_APP_BASE_PATH;
    delete process.env.CORE_SERVE_UNDER_PATHS;

    expect(isServeUnderPathsEnabled()).toBe(false);
    expect(appBasePath()).toBe("");
    expect(appPathname("/admin/donors")).toBe("/admin/donors");
    expect(appPathname("/")).toBe("/");
    expect(withAppBasePath("/")).toBe("/");
    expect(withAppBasePath("/login")).toBe("/login");
    expect(withAppBasePath("/settings/teams")).toBe("/settings/teams");
    expect(crossAppHref("admin", "/invite/s")).toBe("/invite/s");
    expect(crossAppHref("missionary", "/invite/s")).toBe("/invite/s");
    expect(crossAppHref("donor", "/donor-dashboard/pledges")).toBe(
      "/donor-dashboard/pledges",
    );
  });

  it("strips and prefixes under /admin when on, never skipping /admin/ globally", () => {
    process.env.CORE_SERVE_UNDER_PATHS = "1";
    process.env.CORE_APP_BASE_PATH = "/admin";

    expect(isServeUnderPathsEnabled()).toBe(true);
    expect(appBasePath()).toBe("/admin");

    expect(appPathname("/admin")).toBe("/");
    expect(appPathname("/admin/")).toBe("/");
    expect(appPathname("/admin/donors")).toBe("/donors");
    expect(appPathname("/admin/settings/teams")).toBe("/settings/teams");
    expect(appPathname("/admin/admin/example")).toBe("/admin/example");
    expect(appPathname("/administration")).toBe("/administration");
    expect(appPathname("/donors")).toBe("/donors");

    expect(withAppBasePath("/")).toBe("/admin");
    expect(withAppBasePath("/?tab=open")).toBe("/admin?tab=open");
    expect(withAppBasePath("/#top")).toBe("/admin#top");
    expect(withAppBasePath("/login?next=%2Fdonors")).toBe(
      "/admin/login?next=%2Fdonors",
    );
    expect(withAppBasePath("/settings/teams")).toBe("/admin/settings/teams");
    expect(withAppBasePath("/settings/eve")).toBe("/admin/settings/eve");
    expect(withAppBasePath("/admin/example")).toBe("/admin/admin/example");
    expect(withAppBasePath("//evil.test/x")).toBe("//evil.test/x");
    expect(withAppBasePath("https://other.test/x")).toBe(
      "https://other.test/x",
    );
    expect(withAppBasePath("?page=2")).toBe("?page=2");
    expect(withAppBasePath("pages/7")).toBe("pages/7");

    expect(crossAppHref("admin", "/invite/abc")).toBe("/admin/invite/abc");
    expect(crossAppHref("missionary", "/invite/abc")).toBe(
      "/missionary/invite/abc",
    );
    expect(crossAppHref("donor", "/donor-dashboard/pledges")).toBe(
      "/donor-dashboard/pledges",
    );
    expect(crossAppHref("admin", "/")).toBe("/admin");
    expect(crossAppHref("missionary", "/")).toBe("/missionary");
    expect(crossAppHref("donor", "/")).toBe("/");
  });

  it("keeps donor own-app paths unprefixed while crossAppHref prefixes dashboards when on", () => {
    process.env.CORE_SERVE_UNDER_PATHS = "1";
    process.env.CORE_APP_BASE_PATH = "";

    expect(isServeUnderPathsEnabled()).toBe(true);
    expect(appBasePath()).toBe("");
    expect(withAppBasePath("/login")).toBe("/login");
    expect(crossAppHref("admin", "/web-studio")).toBe("/admin/web-studio");
    expect(crossAppHref("missionary", "/invite/s")).toBe(
      "/missionary/invite/s",
    );
    expect(crossAppHref("donor", "/donor-dashboard")).toBe("/donor-dashboard");
  });
});
