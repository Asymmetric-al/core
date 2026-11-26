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

  it("keeps collection rollback flags opt-out per native slice (D-18: WP6 part 2b leaves three native slices: media, navigation and pages)", () => {
    process.env.CMS_WEB_STUDIO_NATIVE_MEDIA = "false";
    process.env.CMS_WEB_STUDIO_NATIVE_NAVIGATION = "0";
    process.env.CMS_WEB_STUDIO_NATIVE_PAGES = "false";

    expect(isNativeCollectionWebStudioEnabled("media")).toBe(false);
    expect(isNativeCollectionWebStudioEnabled("navigation")).toBe(false);
    expect(isNativeCollectionWebStudioEnabled("pages")).toBe(false);
  });

  it("defaults each native slice to enabled when env unset (D-18: WP6 part 2b, the three remaining slices)", () => {
    delete process.env.CMS_WEB_STUDIO_NATIVE_MEDIA;
    delete process.env.CMS_WEB_STUDIO_NATIVE_NAVIGATION;
    delete process.env.CMS_WEB_STUDIO_NATIVE_PAGES;

    expect(isNativeCollectionWebStudioEnabled("media")).toBe(true);
    expect(isNativeCollectionWebStudioEnabled("navigation")).toBe(true);
    expect(isNativeCollectionWebStudioEnabled("pages")).toBe(true);
  });
});
