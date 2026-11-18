// @vitest-environment jsdom
import { act, cleanup, render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Keys in browser storage carry the person and the tenant (plan 5.2, "The
 * browser data layer is scoped…"; WP2b, AL-2675). Switching organization
 * loads a new document; local storage survives that load, so draft rows
 * stored under one organization must not appear under another.
 */

const PERSON = "00000000-0000-4000-8000-0000000000a1";
const A = {
  userId: PERSON,
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: "/00000000-0000-0000-0000-000000000001",
};
const B = {
  userId: PERSON,
  tenantId: "00000000-0000-0000-0000-000000000002",
  assignmentId: "00000000-0000-4000-8000-000000000102",
  addressPrefix: "/00000000-0000-0000-0000-000000000002",
};

/** A new document with `scope`: fresh modules, and the provider rendered. */
async function loadDocument(scope: typeof A | null) {
  cleanup();
  vi.resetModules();
  const { DocumentScopeProvider } =
    await import("../../../../packages/database/document-scope");
  if (scope) render(createElement(DocumentScopeProvider, { scope }, null));
  return import("../../../../packages/lib/hooks/use-email-studio");
}

/** jsdom's Storage lists its methods under Object.keys; use key(i). */
function storedKeys(): string[] {
  return Array.from({ length: localStorage.length }, (_, index) =>
    localStorage.key(index),
  ).filter((key): key is string => key !== null);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("email studio draft storage", () => {
  it("shows no draft saved in another organization after switching", async () => {
    const inA = await loadDocument(A);
    const a = renderHook(() => inA.useEmailTemplates());
    await act(async () => {
      await a.result.current.createTemplate("Year-end appeal", {}, null);
    });
    expect(a.result.current.templates.map((row) => row.name)).toEqual([
      "Year-end appeal",
    ]);
    a.unmount();

    const inB = await loadDocument(B);
    const b = renderHook(() => inB.useEmailTemplates());
    expect(b.result.current.templates).toEqual([]);
  });

  it("keys each draft by the person and the tenant", async () => {
    const inA = await loadDocument(A);
    const a = renderHook(() => inA.useEmailTemplates());
    await act(async () => {
      await a.result.current.createTemplate("Year-end appeal", {}, null);
    });
    const keys = storedKeys();
    expect(keys).toHaveLength(1);
    expect(keys[0]).toContain(PERSON);
    expect(keys[0]).toContain(A.tenantId);
  });

  it("stores nothing for a document with no scope", async () => {
    const outside = await loadDocument(null);
    const view = renderHook(() => outside.useEmailTemplates());
    await act(async () => {
      await view.result.current.createTemplate("Year-end appeal", {}, null);
    });
    expect(storedKeys()).toEqual([]);
  });
});
