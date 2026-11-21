// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useSavedFilters } from "../../../../packages/ui/components/shadcn/data-table/filters/saved-filters";
import { createEmptyFilterState } from "../../../../packages/ui/components/shadcn/data-table/filters/types";
import { renderDocumentScope } from "../database/scope-fixture";

// WP2b, AL-2675 (council round 1 on slice B, SB5): saved views are stored
// under a key that carries the document's person and tenant, and a document
// with no scope stores nothing. This page is given a scope, as a signed-in
// page has, and `fullKey` is that scoped key; every assertion is unchanged.
const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: "/00000000-0000-0000-0000-000000000001",
};
const storageKey = "ui-improvement-views";
const fullKey = `saved-filters-${storageKey}::${SCOPE.userId}::${SCOPE.tenantId}`;

beforeAll(async () => {
  await renderDocumentScope(SCOPE);
});
const persistedView = {
  id: "known-view",
  name: "Active partners",
  description: "Existing saved view",
  filter: createEmptyFilterState(),
  isDefault: true,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

beforeEach(() => {
  localStorage.clear();
  // React's uncached-snapshot diagnostics repeat before its bounded depth
  // error. Keep that expected baseline diagnostic out of unrelated output.
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("saved filter persistence", () => {
  it("mounts and retains a stable empty snapshot when storage has not changed", () => {
    const { result, rerender } = renderHook(() =>
      useSavedFilters({ storageKey }),
    );
    const initial = result.current.savedFilters;
    expect(initial).toEqual([]);
    rerender();
    expect(result.current.savedFilters).toBe(initial);
  });

  it("loads the existing serialized schema without an update loop", () => {
    localStorage.setItem(fullKey, JSON.stringify([persistedView]));
    const { result, rerender } = renderHook(() =>
      useSavedFilters({ storageKey }),
    );
    const initial = result.current.savedFilters;
    expect(initial).toEqual([persistedView]);
    expect(result.current.defaultFilter).toEqual(persistedView.filter);
    rerender();
    expect(result.current.savedFilters).toBe(initial);
  });

  it("shares local saves with another mounted consumer and keeps the stored schema", () => {
    const { result } = renderHook(() => ({
      first: useSavedFilters({ storageKey }),
      second: useSavedFilters({ storageKey }),
    }));
    const filter = createEmptyFilterState();
    act(() =>
      result.current.first.saveFilter(filter, "New view", "Review later"),
    );
    expect(result.current.second.savedFilters).toEqual(
      result.current.first.savedFilters,
    );
    expect(result.current.second.savedFilters).toHaveLength(1);
    const stored = JSON.parse(localStorage.getItem(fullKey)!);
    expect(stored).toEqual([
      {
        id: expect.any(String),
        name: "New view",
        description: "Review later",
        filter,
        isDefault: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]);
    const id = result.current.first.savedFilters[0]!.id;
    act(() => result.current.second.setDefault(id));
    expect(result.current.first.defaultFilter).toEqual(filter);
    act(() =>
      result.current.first.updateFilter(id, "Renamed", "Updated description"),
    );
    expect(result.current.second.savedFilters[0]?.name).toBe("Renamed");
    act(() => result.current.second.deleteFilter(id));
    expect(result.current.first.savedFilters).toEqual([]);
  });

  it("refreshes on cross-tab storage changes without reacting to unrelated keys", () => {
    const { result } = renderHook(() => useSavedFilters({ storageKey }));
    const initial = result.current.savedFilters;
    act(() =>
      window.dispatchEvent(new StorageEvent("storage", { key: "other-views" })),
    );
    expect(result.current.savedFilters).toBe(initial);
    act(() => {
      localStorage.setItem(fullKey, JSON.stringify([persistedView]));
      window.dispatchEvent(new StorageEvent("storage", { key: fullKey }));
    });
    expect(result.current.savedFilters).toEqual([persistedView]);
    act(() => {
      localStorage.removeItem(fullKey);
      window.dispatchEvent(new StorageEvent("storage", { key: fullKey }));
    });
    expect(result.current.savedFilters).toEqual([]);
  });
});
