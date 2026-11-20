// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Record D-41 (WP2b, AL-2675; council round 1 on slice B, SB2): the donor
 * portal's address names no tenant, so its document scope is fixed with a
 * boundary, the portal's path. Outside it the scope functions return nothing,
 * so a call from the public site (the checkout's `/api/donate`, plan 5.2:
 * "never a header the caller sets") carries neither header, from the own-API
 * wrapper or the browser client.
 */

const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-0000000000d1",
  addressPrefix: "",
};

const fetchMock = vi.fn(async () => Response.json({}));

/** A new document at `path`, scoped as the portal's layout scopes it. */
async function loadPortalDocument(path: string) {
  cleanup();
  vi.resetModules();
  window.history.replaceState(null, "", path);
  const scopeModule =
    await import("../../../../packages/database/document-scope");
  render(
    createElement(
      scopeModule.DocumentScopeProvider,
      { scope: SCOPE, segment: "/donor-dashboard" },
      null,
    ),
  );
  const { ownApiFetch } = await import("../../../../packages/database/own-api");
  return { getDocumentScope: scopeModule.getDocumentScope, ownApiFetch };
}

function sentHeaders(call: number): Headers {
  return (fetchMock.mock.calls[call] as unknown as [string, RequestInit])[1]
    .headers as Headers;
}

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

describe("the donor portal's document scope, bounded by the portal's path", () => {
  it("is the document's under the portal's path, and nothing anywhere else", async () => {
    const { getDocumentScope } = await loadPortalDocument(
      "/donor-dashboard/history",
    );
    expect(getDocumentScope()).toEqual(SCOPE);

    window.history.pushState(null, "", "/checkout?amount=50");
    expect(getDocumentScope()).toBeNull();
    window.history.pushState(null, "", "/");
    expect(getDocumentScope()).toBeNull();
    // A path that only starts with the portal's name is outside it.
    window.history.pushState(null, "", "/donor-dashboards");
    expect(getDocumentScope()).toBeNull();

    window.history.pushState(null, "", "/donor-dashboard");
    expect(getDocumentScope()).toEqual(SCOPE);
  });

  it("sends neither header from the public site, and both from the portal", async () => {
    const { ownApiFetch } = await loadPortalDocument("/donor-dashboard");

    await ownApiFetch("/api/donor/portal");
    window.history.pushState(null, "", "/checkout?amount=50");
    await ownApiFetch("/api/donate", { method: "GET" });

    expect(sentHeaders(0).get("x-asym-tenant")).toBe(SCOPE.tenantId);
    expect(sentHeaders(0).get("x-asym-assignment")).toBe(SCOPE.assignmentId);
    expect(sentHeaders(1).has("x-asym-tenant")).toBe(false);
    expect(sentHeaders(1).has("x-asym-assignment")).toBe(false);
  });
});
