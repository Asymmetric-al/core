// @vitest-environment jsdom
import { act, cleanup, render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The data table's two storage helpers, saved filters and column sizes, key
 * browser storage by the person and the tenant (plan 5.2, "The browser data
 * layer is scoped…"; WP2b, AL-2675; council round 1 on slice B, SB5).
 * Switching organization loads a new document, and local storage survives
 * that load, so a key without the scope would hand one organization's saved
 * views to the next. With no scope nothing is stored.
 */

const PERSON = "00000000-0000-4000-8000-0000000000a1";
const A = {
  userId: PERSON,
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

/** A new document with `scope`: fresh modules, and the provider rendered. */
async function loadDocument(scope: typeof A | null) {
  cleanup();
  vi.resetModules();
  const { DocumentScopeProvider } =
    await import("../../../../packages/database/document-scope");
  if (scope) render(createElement(DocumentScopeProvider, { scope }, null));
  const [filters, resizing] = await Promise.all([
    import("../../../../packages/ui/components/shadcn/data-table/filters/saved-filters"),
    import("../../../../packages/ui/components/shadcn/data-table/hooks/use-column-resizing"),
  ]);
  return {
    useSavedFilters: filters.useSavedFilters,
    useColumnResizing: resizing.useColumnResizing,
  };
}

/** jsdom's Storage lists its methods under Object.keys; use key(i). */
function storedKeys(): string[] {
  return Array.from({ length: localStorage.length }, (_, index) =>
    localStorage.key(index),
  ).filter((key): key is string => key !== null);
}

const EMPTY_FILTER = { conditions: [], logic: "and" } as never;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("saved filters", () => {
  it("keys a saved view by the person and the tenant, and shows none of another organization's", async () => {
    const inA = await loadDocument(A);
    const a = renderHook(() => inA.useSavedFilters({ storageKey: "donors" }));
    act(() => a.result.current.saveFilter(EMPTY_FILTER, "Major donors"));
    expect(a.result.current.savedFilters.map((f) => f.name)).toEqual([
      "Major donors",
    ]);
    expect(storedKeys()).toEqual([
      `saved-filters-donors::${PERSON}::${A.tenantId}`,
    ]);
    a.unmount();

    const inB = await loadDocument(B);
    const b = renderHook(() => inB.useSavedFilters({ storageKey: "donors" }));
    expect(b.result.current.savedFilters).toEqual([]);
  });

  it("never reads a view stored under a key without the scope", async () => {
    localStorage.setItem(
      "saved-filters-donors",
      JSON.stringify([{ id: "old", name: "Unscoped", filter: EMPTY_FILTER }]),
    );
    const inA = await loadDocument(A);
    const a = renderHook(() => inA.useSavedFilters({ storageKey: "donors" }));
    expect(a.result.current.savedFilters).toEqual([]);
  });

  it("stores nothing for a document with no scope, and keeps the view for the page", async () => {
    const outside = await loadDocument(null);
    const view = renderHook(() =>
      outside.useSavedFilters({ storageKey: "donors" }),
    );
    act(() => view.result.current.saveFilter(EMPTY_FILTER, "Major donors"));
    expect(view.result.current.savedFilters.map((f) => f.name)).toEqual([
      "Major donors",
    ]);
    expect(storedKeys()).toEqual([]);
  });
});

describe("column sizes", () => {
  it("keys stored sizes by the person and the tenant", async () => {
    const inA = await loadDocument(A);
    const a = renderHook(() => inA.useColumnResizing({ persistKey: "grid" }));
    act(() => a.result.current.setColumnSizing({ name: 240 }));
    expect(storedKeys()).toEqual([
      `data-table-column-sizing-grid::${PERSON}::${A.tenantId}`,
    ]);
    a.unmount();

    const inB = await loadDocument(B);
    const b = renderHook(() => inB.useColumnResizing({ persistKey: "grid" }));
    expect(b.result.current.columnSizing).toEqual({});
  });

  it("stores nothing for a document with no scope", async () => {
    const outside = await loadDocument(null);
    const view = renderHook(() =>
      outside.useColumnResizing({ persistKey: "grid" }),
    );
    act(() => view.result.current.setColumnSizing({ name: 240 }));
    expect(view.result.current.columnSizing).toEqual({ name: 240 });
    expect(storedKeys()).toEqual([]);
  });
});
