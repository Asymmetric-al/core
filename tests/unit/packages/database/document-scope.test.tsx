// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The document scope (plan 5.2, "The browser data layer is scoped"; AL-2675):
 * one scope for each document, fixed when the page loads, holding the
 * person, the tenant and the selected assignment.
 */

const reloadDocument = vi.hoisted(() => vi.fn());
vi.mock("../../../../packages/database/document-reload", () => ({
  reloadDocument,
}));

const A = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: "/00000000-0000-0000-0000-000000000001",
};
const B = {
  ...A,
  tenantId: "00000000-0000-0000-0000-000000000002",
  assignmentId: "00000000-0000-4000-8000-000000000102",
  addressPrefix: "/00000000-0000-0000-0000-000000000002",
};

async function load() {
  vi.resetModules();
  return import("../../../../packages/database/document-scope");
}

function ScopeProbe({
  useDocumentScope,
}: {
  useDocumentScope: () => { tenantId: string } | null;
}) {
  const scope = useDocumentScope();
  return <p>{`tenant ${scope?.tenantId ?? "none"}`}</p>;
}

beforeEach(() => {
  reloadDocument.mockReset();
  // The bounded reload's claim lives in session storage: no case inherits
  // another's (check of the fix lists, JR11).
  window.sessionStorage.clear();
  // A signed-in page is served at its tenant address.
  window.history.replaceState(null, "", `${A.addressPrefix}/care`);
});

afterEach(() => {
  cleanup();
});

describe("DocumentScopeProvider", () => {
  it("gives the subtree, and module code in the browser, the document's scope", async () => {
    const { DocumentScopeProvider, getDocumentScope, useDocumentScope } =
      await load();
    expect(getDocumentScope()).toBeNull();

    render(
      <DocumentScopeProvider scope={A}>
        <ScopeProbe useDocumentScope={useDocumentScope} />
      </DocumentScopeProvider>,
    );

    expect(screen.getByText(`tenant ${A.tenantId}`)).toBeTruthy();
    expect(getDocumentScope()).toEqual(A);
    expect(reloadDocument).not.toHaveBeenCalled();
  });

  it.each([
    ["another tenant", B],
    ["another assignment", { ...A, assignmentId: B.assignmentId }],
    [
      "another person",
      { ...A, userId: "00000000-0000-4000-8000-0000000000a2" },
    ],
  ])(
    "renders nothing and reloads when %s reaches the same document",
    async (_label, changed) => {
      const { DocumentScopeProvider, getDocumentScope, useDocumentScope } =
        await load();
      const { rerender } = render(
        <DocumentScopeProvider scope={A}>
          <ScopeProbe useDocumentScope={useDocumentScope} />
        </DocumentScopeProvider>,
      );

      rerender(
        <DocumentScopeProvider scope={changed}>
          <ScopeProbe useDocumentScope={useDocumentScope} />
        </DocumentScopeProvider>,
      );

      expect(screen.queryByText(/tenant/)).toBeNull();
      expect(reloadDocument).toHaveBeenCalledTimes(1);
      // The document keeps the scope it was loaded with until it reloads.
      expect(getDocumentScope()).toEqual(A);
    },
  );

  it("does the same when a later mount in the document brings another scope", async () => {
    const { DocumentScopeProvider, useDocumentScope } = await load();
    const first = render(
      <DocumentScopeProvider scope={A}>
        <ScopeProbe useDocumentScope={useDocumentScope} />
      </DocumentScopeProvider>,
    );
    first.unmount();

    render(
      <DocumentScopeProvider scope={B}>
        <ScopeProbe useDocumentScope={useDocumentScope} />
      </DocumentScopeProvider>,
    );

    expect(screen.queryByText(/tenant/)).toBeNull();
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });
});

// Council round 1, A8: the contract slices B and C build on. Outside the
// scope's tenant segment both functions return null; a crossing is a
// document load, and this holds even before that load happens.
describe("the scope belongs to its tenant segment", () => {
  it("getDocumentScope returns null once the address leaves the segment, as useDocumentScope does there", async () => {
    const { DocumentScopeProvider, getDocumentScope, isDocumentScopeFixed } =
      await load();
    render(
      <DocumentScopeProvider scope={A}>
        <p>page</p>
      </DocumentScopeProvider>,
    );
    expect(getDocumentScope()).toEqual(A);

    for (const outside of [
      "/web-studio",
      "/choose-organization",
      "/login",
      "/",
      `${B.addressPrefix}/care`,
      // Another segment of the same tenant: a sub-role is its own segment.
      `${A.addressPrefix}~finance/care`,
      // A prefix glued to more characters is not the segment.
      `${A.addressPrefix}0/care`,
    ]) {
      window.history.pushState(null, "", outside);
      expect(getDocumentScope(), outside).toBeNull();
      // The document still fixed A: it never takes another scope.
      expect(isDocumentScopeFixed()).toBe(true);
    }

    for (const inside of [A.addressPrefix, `${A.addressPrefix}/support/x`]) {
      window.history.pushState(null, "", inside);
      expect(getDocumentScope(), inside).toEqual(A);
    }
    expect(reloadDocument).not.toHaveBeenCalled();
  });

  it("reports whether a scope was fixed, wherever the address is", async () => {
    const { DocumentScopeProvider, isDocumentScopeFixed } = await load();
    expect(isDocumentScopeFixed()).toBe(false);
    render(
      <DocumentScopeProvider scope={A}>
        <p>page</p>
      </DocumentScopeProvider>,
    );
    window.history.pushState(null, "", "/web-studio");
    expect(isDocumentScopeFixed()).toBe(true);
  });
});

describe("on the server", () => {
  it("renders with the scope it is given and fixes nothing shared between requests", async () => {
    const { DocumentScopeProvider, useDocumentScope } = await load();
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "window",
    );
    // Server rendering has no window.
    Reflect.deleteProperty(globalThis, "window");
    try {
      expect(
        renderToString(
          <DocumentScopeProvider scope={A}>
            <ScopeProbe useDocumentScope={useDocumentScope} />
          </DocumentScopeProvider>,
        ),
      ).toContain(`tenant ${A.tenantId}`);
      expect(
        renderToString(
          <DocumentScopeProvider scope={B}>
            <ScopeProbe useDocumentScope={useDocumentScope} />
          </DocumentScopeProvider>,
        ),
      ).toContain(`tenant ${B.tenantId}`);
    } finally {
      Object.defineProperty(globalThis, "window", windowDescriptor!);
    }
    expect(reloadDocument).not.toHaveBeenCalled();
  });
});
