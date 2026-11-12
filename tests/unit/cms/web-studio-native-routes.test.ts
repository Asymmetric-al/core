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
    "/web-studio/collections/missionary-giving-pages",
    // The trash list renders the same native list view (one chrome).
    "/web-studio/collections/pages/trash",
    "/web-studio/collections/cms-users",
    "/web-studio/collections/tenants",
    "/web-studio/account",
  ])("treats %s as a Mission Control native screen", (pathname) => {
    expect(isWebStudioNativeTemplateRoute(pathname)).toBe(true);
  });

  it.each([
    "/web-studio/collections/tenants/3",
    "/web-studio/collections/pages/42/versions",
    "/web-studio/collections/pages/42/api",
    "/web-studio/collections/pages/42/preview",
    // A trashed document keeps Payload's restore / delete-permanently view.
    "/web-studio/collections/pages/trash/42",
    "/crm",
  ])("leaves %s to the stock Payload view", (pathname) => {
    expect(isWebStudioNativeTemplateRoute(pathname)).toBe(false);
  });
});

describe("Web Studio stock route breadcrumbs", () => {
  it("names stock collections and document sub-views without guessing titles", () => {
    // Administration lists read as the rail and Studio home name them, not
    // Payload's generated plural ("Cms Users").
    expect(
      describeWebStudioStockRoute("/web-studio/collections/cms-users", {
        "cms-users": "Cms Users",
      }),
    ).toEqual({ sectionLabel: "Users" });
    expect(
      describeWebStudioStockRoute("/web-studio/collections/cms-users/7", {
        "cms-users": "Cms Users",
      }),
    ).toEqual({
      sectionLabel: "Users",
      sectionHref: "/web-studio/collections/cms-users",
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
    expect(
      describeWebStudioStockRoute("/web-studio/collections/tenants/3", {
        tenants: "Tenants",
      }),
    ).toEqual({
      sectionLabel: "Organizations",
      sectionHref: "/web-studio/collections/tenants",
      currentLabel: "Document",
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
