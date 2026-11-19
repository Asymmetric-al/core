// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Council round 2 on slice B, BR1 (record D-41): crossing a scope's
 * boundary is held by `DocumentScopeProvider` itself when it is given a
 * `segment`, so every document whose address names no tenant (the donor
 * portal's; Web Studio's, slice C) gets it by construction rather than by
 * copying the portal's effect. A scope is valid inside its segment and
 * nowhere else, and crossing the boundary is a document load, in and out.
 */

const reloadDocument = vi.hoisted(() => vi.fn());
vi.mock("../../../../packages/database/document-reload", () => ({
  reloadDocument,
}));

/** A scope whose address names no tenant, as the portal's is. */
const PORTAL = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-0000000000d1",
  addressPrefix: "",
};
const SEGMENT = "/donor-dashboard";

async function load() {
  vi.resetModules();
  return import("../../../../packages/database/document-scope");
}

/** The address the browser loaded this document at (the navigation entry). */
function documentLoadedAt(pathname: string) {
  vi.spyOn(performance, "getEntriesByType").mockImplementation((type) =>
    type === "navigation"
      ? ([{ name: `http://localhost:3005${pathname}` }] as PerformanceEntryList)
      : [],
  );
}

function at(pathname: string) {
  window.history.replaceState(null, "", pathname);
}

beforeEach(() => {
  vi.restoreAllMocks();
  reloadDocument.mockReset();
});

afterEach(() => {
  cleanup();
  at("/");
});

describe("DocumentScopeProvider's segment", () => {
  it("refuses a scope whose address names no tenant without the segment that bounds it", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { DocumentScopeProvider } = await load();
    at(SEGMENT);
    expect(() =>
      render(
        <DocumentScopeProvider scope={PORTAL}>
          <p>page</p>
        </DocumentScopeProvider>,
      ),
    ).toThrow(/needs the segment that bounds it/);
  });

  it("refuses an empty segment", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { DocumentScopeProvider } = await load();
    at(SEGMENT);
    expect(() =>
      render(
        <DocumentScopeProvider scope={PORTAL} segment="">
          <p>page</p>
        </DocumentScopeProvider>,
      ),
    ).toThrow(/never empty/);
  });

  it("treats the same scope under another segment as another scope: nothing rendered, and a reload", async () => {
    const { DocumentScopeProvider, getDocumentScope } = await load();
    documentLoadedAt(SEGMENT);
    at(SEGMENT);
    render(
      <DocumentScopeProvider scope={PORTAL} segment={SEGMENT}>
        <p>portal page</p>
      </DocumentScopeProvider>,
    );
    expect(getDocumentScope()).toEqual(PORTAL);
    cleanup();
    reloadDocument.mockReset();

    at("/web-studio");
    render(
      <DocumentScopeProvider scope={PORTAL} segment="/web-studio">
        <p>studio page</p>
      </DocumentScopeProvider>,
    );

    expect(screen.queryByText("studio page")).toBeNull();
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("loads a new document when it unmounts at an address outside its segment", async () => {
    const { DocumentScopeProvider } = await load();
    documentLoadedAt(`${SEGMENT}/history`);
    at(`${SEGMENT}/history`);
    const view = render(
      <DocumentScopeProvider scope={PORTAL} segment={SEGMENT}>
        <p>portal page</p>
      </DocumentScopeProvider>,
    );

    // A soft navigation to the public site, in the app's one root layout.
    window.history.pushState(null, "", "/checkout?amount=50");
    view.unmount();

    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("renders nothing and loads a new document in a document loaded outside its segment", async () => {
    const { DocumentScopeProvider, getDocumentScope, isDocumentScopeFixed } =
      await load();
    // Loaded at the sign-in screen, then entered the segment softly.
    documentLoadedAt("/login");
    at(SEGMENT);
    render(
      <DocumentScopeProvider scope={PORTAL} segment={SEGMENT}>
        <p>portal page</p>
      </DocumentScopeProvider>,
    );

    expect(screen.queryByText("portal page")).toBeNull();
    expect(reloadDocument).toHaveBeenCalledTimes(1);
    expect(isDocumentScopeFixed()).toBe(false);
    expect(getDocumentScope()).toBeNull();
  });

  it("reloads nothing while the address stays inside its segment", async () => {
    const { DocumentScopeProvider } = await load();
    documentLoadedAt(SEGMENT);
    at(SEGMENT);
    const view = render(
      <DocumentScopeProvider scope={PORTAL} segment={SEGMENT}>
        <p>portal page</p>
      </DocumentScopeProvider>,
    );
    expect(screen.getByText("portal page")).toBeTruthy();

    window.history.pushState(null, "", `${SEGMENT}/history`);
    view.rerender(
      <DocumentScopeProvider scope={PORTAL} segment={SEGMENT}>
        <p>portal page</p>
      </DocumentScopeProvider>,
    );
    view.unmount();

    expect(reloadDocument).not.toHaveBeenCalled();
  });

  // Council on the joined release, JC1: Web Studio's chooser and its REST
  // routes are under /web-studio but are not its pages, so its segment
  // carries its own test of an address, the one the boundary and the router
  // adapter use. The chooser then answers no scope, and a soft landing on it
  // loads a new document.
  describe("a segment that carries its own test of an address", () => {
    const STUDIO = {
      name: "/web-studio",
      contains: (pathname: string) =>
        (pathname === "/web-studio" || pathname.startsWith("/web-studio/")) &&
        !pathname.startsWith("/web-studio/api/") &&
        pathname !== "/web-studio/organization" &&
        !pathname.startsWith("/web-studio/organization/"),
    };
    const studioScope = {
      ...PORTAL,
      tenantId: "00000000-0000-0000-0000-000000000002",
    };

    it("answers no scope at an address the segment leaves out, under the same path", async () => {
      const { DocumentScopeProvider, getDocumentScope } = await load();
      documentLoadedAt("/web-studio/collections/pages");
      at("/web-studio/collections/pages");
      render(
        <DocumentScopeProvider scope={studioScope} segment={STUDIO}>
          <p>studio page</p>
        </DocumentScopeProvider>,
      );
      expect(getDocumentScope()).toEqual(studioScope);

      at("/web-studio/organization");
      expect(getDocumentScope()).toBeNull();
    });

    it("loads a new document when it unmounts at the chooser", async () => {
      const { DocumentScopeProvider } = await load();
      documentLoadedAt("/web-studio/collections/pages");
      at("/web-studio/collections/pages");
      const view = render(
        <DocumentScopeProvider scope={studioScope} segment={STUDIO}>
          <p>studio page</p>
        </DocumentScopeProvider>,
      );

      // The gate's redirect, carried out by the client router.
      window.history.pushState(
        null,
        "",
        "/web-studio/organization?next=%2Fweb-studio",
      );
      view.unmount();

      expect(reloadDocument).toHaveBeenCalledTimes(1);
    });

    it("renders nothing and reloads in a document loaded at the chooser", async () => {
      const { DocumentScopeProvider, isDocumentScopeFixed } = await load();
      documentLoadedAt("/web-studio/organization");
      at("/web-studio");
      render(
        <DocumentScopeProvider scope={studioScope} segment={STUDIO}>
          <p>studio page</p>
        </DocumentScopeProvider>,
      );
      expect(screen.queryByText("studio page")).toBeNull();
      expect(reloadDocument).toHaveBeenCalledTimes(1);
      expect(isDocumentScopeFixed()).toBe(false);
    });

    it("is the same segment as another provider with its name, whatever object carries it", async () => {
      const { DocumentScopeProvider } = await load();
      documentLoadedAt("/web-studio");
      at("/web-studio");
      render(
        <>
          <DocumentScopeProvider scope={studioScope} segment={STUDIO}>
            <p>document</p>
          </DocumentScopeProvider>
          <DocumentScopeProvider scope={studioScope} segment={{ ...STUDIO }}>
            <p>page</p>
          </DocumentScopeProvider>
        </>,
      );
      expect(screen.getByText("document")).toBeTruthy();
      expect(screen.getByText("page")).toBeTruthy();
      expect(reloadDocument).not.toHaveBeenCalled();
    });
  });

  it("keeps a tenant's scope, which is bounded by its own address prefix, free of these rules", async () => {
    const { DocumentScopeProvider, getDocumentScope } = await load();
    const tenant = { ...PORTAL, addressPrefix: `/${PORTAL.tenantId}` };
    // TenantDocument guards the tenant's segment in the address itself.
    documentLoadedAt("/login");
    at(`${tenant.addressPrefix}/care`);
    const view = render(
      <DocumentScopeProvider scope={tenant}>
        <p>care page</p>
      </DocumentScopeProvider>,
    );
    expect(screen.getByText("care page")).toBeTruthy();
    expect(getDocumentScope()).toEqual(tenant);

    window.history.pushState(null, "", "/choose-organization");
    view.unmount();
    expect(reloadDocument).not.toHaveBeenCalled();
  });
});
