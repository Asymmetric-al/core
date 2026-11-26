import { describe, expect, it } from "vitest";

import {
  describeWebStudioStockRoute,
  isWebStudioNativeTemplateRoute,
  documentCrumbFromStepNav,
} from "../../../apps/admin/src/cms-ui/web-studio/shell/native-routes";

describe("Web Studio native template routes", () => {
  it.each([
    "/web-studio",
    "/web-studio/",
    "/web-studio/collections/pages",
    "/web-studio/collections/pages/42",
    "/web-studio/collections/pages/create",
    "/web-studio/collections/media/7",
    "/web-studio/collections/navigation",
    "/web-studio/collections/pages/trash",
    "/web-studio/account",
  ])("treats %s as a Mission Control native screen", (pathname) => {
    expect(isWebStudioNativeTemplateRoute(pathname)).toBe(true);
  });

  it.each([
    "/web-studio/collections/missionary-giving-pages",
    "/web-studio/collections/cms-users",
    "/web-studio/collections/tenants",
    "/web-studio/collections/principal-links",
    "/web-studio/collections/site-presentations",
    "/web-studio/collections/pages/42/versions",
    "/web-studio/collections/pages/42/api",
    "/web-studio/collections/pages/42/preview",
    // A trashed document keeps Payload's restore / delete-permanently view.
    "/web-studio/collections/pages/trash/42",
    "/crm",
  ])(
    "leaves %s to the stock Payload view (D-18: WP6 part 2b retires the prototype collections and the Administration lists)",
    (pathname) => {
      expect(isWebStudioNativeTemplateRoute(pathname)).toBe(false);
    },
  );
});

describe("Web Studio stock route breadcrumbs", () => {
  it("names stock collections and document sub-views without guessing titles (D-18: WP6 part 2b drops the Administration titles with their lists)", () => {
    expect(
      describeWebStudioStockRoute(
        "/web-studio/collections/site-presentations",
        {
          "site-presentations": "Site Presentations",
        },
      ),
    ).toEqual({ sectionLabel: "Site Presentations" });
    expect(
      describeWebStudioStockRoute(
        "/web-studio/collections/site-presentations/7",
        { "site-presentations": "Site Presentations" },
      ),
    ).toEqual({
      sectionLabel: "Site Presentations",
      sectionHref: "/web-studio/collections/site-presentations",
      currentLabel: "Document",
    });
    expect(
      describeWebStudioStockRoute("/web-studio/collections/other-thing", {
        "other-thing": "Other Things",
      }),
    ).toEqual({ sectionLabel: "Other Things" });
    expect(
      describeWebStudioStockRoute("/web-studio/collections/pages/42/versions", {
        pages: "Pages",
      }),
    ).toEqual({
      sectionLabel: "Pages",
      sectionHref: "/web-studio/collections/pages",
      currentLabel: "Versions",
    });
    expect(
      describeWebStudioStockRoute("/web-studio/collections/pages/42/api", {}),
    ).toEqual({
      sectionLabel: "Pages",
      sectionHref: "/web-studio/collections/pages",
      currentLabel: "API",
    });
    expect(describeWebStudioStockRoute("/web-studio/account", {})).toEqual({
      sectionLabel: "Account",
    });
  });
});

describe("documentCrumbFromStepNav", () => {
  it("names the document a Versions or API view belongs to, from Payload's step nav", () => {
    expect(
      documentCrumbFromStepNav(
        [
          { label: "Pages", url: "/web-studio/collections/pages" },
          { label: "Local CMS Home", url: "/web-studio/collections/pages/42" },
          { label: "Versions" },
        ],
        "/web-studio/collections/pages/42/versions",
      ),
    ).toEqual({
      label: "Local CMS Home",
      href: "/web-studio/collections/pages/42",
    });
  });

  it("names nothing on the document itself or while Payload is still loading", () => {
    expect(
      documentCrumbFromStepNav(
        [{ label: "Pages", url: "/web-studio/collections/pages" }],
        "/web-studio/collections/pages/42/api",
      ),
    ).toBeNull();
    expect(
      documentCrumbFromStepNav(
        [{ label: "Local CMS Home", url: "/web-studio/collections/pages/42" }],
        "/web-studio/collections/pages/42",
      ),
    ).toBeNull();
  });
});
