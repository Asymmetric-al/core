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
