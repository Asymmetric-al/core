// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthContext } from "../../../packages/auth/context";

/**
 * The donor portal's document scope (plan 12, WP2, "Interim rules until WP3":
 * the donor app takes the tenant from the person's one live donor membership,
 * through the resolver, for the proxy check, server reads and the browser
 * header; WP2b, AL-2675). Its pages get a document scope from that
 * membership, so the same own-API wrapper and browser data layer work there
 * with no second code path.
 */

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

// jsdom cannot load a new document; the reload is observed instead.
const reload = vi.hoisted(() => ({ reloadDocument: vi.fn() }));
vi.mock("@asym/database/document-reload", () => reload);
vi.mock("../../../packages/database/document-reload", () => reload);

const TENANT = "00000000-0000-0000-0000-000000000001";
const ASSIGNMENT = "00000000-0000-4000-8000-0000000000d1";
const USER = "00000000-0000-4000-8000-0000000000a1";

function donorContext(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    userId: USER,
    email: null,
    tenantId: TENANT,
    role: "donor",
    memberships: [
      {
        tenantId: TENANT,
        role: "donor",
        staffRole: null,
        isActive: true,
        isTenantAdmin: false,
      },
    ],
    assignment: {
      assignmentId: ASSIGNMENT,
      userId: USER,
      tenantId: TENANT,
      revision: "1",
      membershipRole: "donor",
      staffRole: null,
      isTenantAdmin: false,
    },
    assignmentDenial: null,
    profileId: "profile-1",
    isAuthenticated: true,
    ...overrides,
  };
}

afterEach(cleanup);

describe("readPortalDocumentScope", () => {
  it("scopes a donor portal document to the person's resolved donor membership", async () => {
    const { readPortalDocumentScope } =
      await import("../../../packages/auth/tenant-server");
    expect(readPortalDocumentScope(donorContext())).toEqual({
      userId: USER,
      tenantId: TENANT,
      assignmentId: ASSIGNMENT,
      // The portal's address carries no tenant until WP3.
      addressPrefix: "",
    });
  });

  it.each([
    ["no resolved assignment", { assignment: null, isAuthenticated: false }],
    [
      "a refused person (two donor memberships)",
      {
        assignment: null,
        isAuthenticated: false,
        assignmentDenial: "ambiguous" as const,
      },
    ],
    [
      "an assignment of another class",
      {
        assignment: {
          assignmentId: ASSIGNMENT,
          userId: USER,
          tenantId: TENANT,
          revision: "1",
          membershipRole: "missionary" as const,
          staffRole: null,
          isTenantAdmin: false,
        },
      },
    ],
  ])("gives no scope for %s", async (_label, overrides) => {
    const { readPortalDocumentScope } =
      await import("../../../packages/auth/tenant-server");
    expect(readPortalDocumentScope(donorContext(overrides))).toBeNull();
  });
});

describe("PortalDocument", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    reload.reloadDocument.mockClear();
  });

  it("fixes the scope for the document, so the wrapper and the data layer read it", async () => {
    // Record D-41 (council round 1 on slice B, SB2): the portal's scope
    // applies under the portal's path, so the page is at a portal address.
    window.history.replaceState(null, "", "/donor-dashboard");
    vi.resetModules();
    const { PortalDocument } =
      await import("../../../packages/auth/portal-document");
    const { getDocumentScope, useDocumentScope } =
      await import("../../../packages/database/document-scope");
    const scope = {
      userId: USER,
      tenantId: TENANT,
      assignmentId: ASSIGNMENT,
      addressPrefix: "",
    };
    function Probe() {
      return <p>{`tenant ${useDocumentScope()?.tenantId ?? "none"}`}</p>;
    }

    const { container } = render(
      <PortalDocument scope={scope}>
        <Probe />
      </PortalDocument>,
    );

    expect(screen.getByText(`tenant ${TENANT}`)).toBeTruthy();
    expect(getDocumentScope()).toEqual(scope);
    expect(
      container
        .querySelector("[data-tenant-assignment]")
        ?.getAttribute("data-tenant-assignment"),
    ).toBe(ASSIGNMENT);
  });

  /** A portal page at `path`, as the portal's layout renders it. */
  async function renderPortalAt(path: string) {
    window.history.replaceState(null, "", path);
    vi.resetModules();
    const { PortalDocument } =
      await import("../../../packages/auth/portal-document");
    const scopeModule =
      await import("../../../packages/database/document-scope");
    const scope = {
      userId: USER,
      tenantId: TENANT,
      assignmentId: ASSIGNMENT,
      addressPrefix: "",
    };
    const view = render(
      <PortalDocument scope={scope}>
        <p>portal page</p>
      </PortalDocument>,
    );
    return { view, scope, ...scopeModule };
  }

  it("leaves no scope outside the portal: both scope functions return nothing there (record D-41)", async () => {
    const { getDocumentScope, useDocumentScope, scope } = await renderPortalAt(
      "/donor-dashboard/history",
    );
    expect(getDocumentScope()).toEqual(scope);

    // A soft navigation to the public site, in the donor app's one root layout.
    window.history.pushState(null, "", "/checkout?amount=50");
    expect(getDocumentScope()).toBeNull();
    function PublicProbe() {
      return <p>{`public scope ${useDocumentScope()?.tenantId ?? "none"}`}</p>;
    }
    render(<PublicProbe />);
    expect(screen.getByText("public scope none")).toBeTruthy();
  });

  it("makes leaving the portal a document load (record D-41)", async () => {
    const { view } = await renderPortalAt("/donor-dashboard");

    window.history.pushState(null, "", "/workers");
    view.unmount();

    expect(reload.reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("does not reload while the address is still in the portal", async () => {
    const { view } = await renderPortalAt("/donor-dashboard/history");

    view.unmount();

    expect(reload.reloadDocument).not.toHaveBeenCalled();
  });
});
