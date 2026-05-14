import { afterEach, describe, expect, it } from "vitest";

import {
  isNativeCollectionWebStudioEnabled,
  isNativePagesWebStudioEnabled,
} from "../../../apps/admin/src/cms-ui/web-studio/feature-flags";

describe("Web Studio feature flags", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("defaults native pages to enabled when env unset", () => {
    delete process.env.CMS_WEB_STUDIO_NATIVE_PAGES;
    expect(isNativePagesWebStudioEnabled()).toBe(true);
  });

  it("disables native pages when env is false", () => {
    process.env.CMS_WEB_STUDIO_NATIVE_PAGES = "false";
    expect(isNativePagesWebStudioEnabled()).toBe(false);
  });

  it("keeps collection rollback flags opt-out per native slice", () => {
    process.env.CMS_WEB_STUDIO_NATIVE_MEDIA = "false";
    process.env.CMS_WEB_STUDIO_NATIVE_MISSIONARY_GIVING_PAGES = "0";
    process.env.CMS_WEB_STUDIO_NATIVE_MISSIONARY_PROFILES = "false";
    process.env.CMS_WEB_STUDIO_NATIVE_MINISTRY_UPDATES = "0";
    process.env.CMS_WEB_STUDIO_NATIVE_NAVIGATION = "false";
    process.env.CMS_WEB_STUDIO_NATIVE_PAGES = "0";
    process.env.CMS_WEB_STUDIO_NATIVE_PROJECT_PAGES = "false";
    process.env.CMS_WEB_STUDIO_NATIVE_PAGE_TEMPLATES = "0";

    expect(isNativeCollectionWebStudioEnabled("media")).toBe(false);
    expect(isNativeCollectionWebStudioEnabled("missionary-giving-pages")).toBe(
      false,
    );
    expect(isNativeCollectionWebStudioEnabled("missionary-profiles")).toBe(
      false,
    );
    expect(isNativeCollectionWebStudioEnabled("ministry-updates")).toBe(false);
    expect(isNativeCollectionWebStudioEnabled("navigation")).toBe(false);
    expect(isNativeCollectionWebStudioEnabled("pages")).toBe(false);
    expect(isNativeCollectionWebStudioEnabled("project-pages")).toBe(false);
    expect(isNativeCollectionWebStudioEnabled("page-templates")).toBe(false);
  });

  it("defaults new collections to enabled when env unset", () => {
    delete process.env.CMS_WEB_STUDIO_NATIVE_MISSIONARY_GIVING_PAGES;
    delete process.env.CMS_WEB_STUDIO_NATIVE_PROJECT_PAGES;
    delete process.env.CMS_WEB_STUDIO_NATIVE_PAGE_TEMPLATES;

    expect(isNativeCollectionWebStudioEnabled("missionary-giving-pages")).toBe(
      true,
    );
    expect(isNativeCollectionWebStudioEnabled("project-pages")).toBe(true);
    expect(isNativeCollectionWebStudioEnabled("page-templates")).toBe(true);
  });
});
