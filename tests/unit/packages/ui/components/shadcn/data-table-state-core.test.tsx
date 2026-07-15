/** @vitest-environment jsdom */

/**
 * Characterization tests for `useDataTableStateCore`.
 *
 * These pin the CURRENT behavior of the shared table-state hook ahead of the
 * TanStack Table v8 -> v9 engine migration. They exercise the hook through its
 * public interface only (options in, state/setters out) so they must keep
 * passing unchanged after the engine swap.
 */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDataTableStateCore } from "../../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-state";

import type { UseDataTableStateCoreOptions } from "../../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-state";

afterEach(() => {
  cleanup();
});

function renderStateCore(initialProps: UseDataTableStateCoreOptions = {}) {
  return renderHook(
    (props: UseDataTableStateCoreOptions) => useDataTableStateCore(props),
    { initialProps },
  );
}

describe("useDataTableStateCore initial state", () => {
  it("uses built-in defaults when no initialState is provided", () => {
    const { result } = renderStateCore();

    expect(result.current.sorting).toEqual([]);
    expect(result.current.columnFilters).toEqual([]);
    expect(result.current.columnVisibility).toEqual({});
    expect(result.current.rowSelection).toEqual({});
    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 10 });
    expect(result.current.isUrlStatePending).toBe(false);
  });

  it("applies initialState overrides for every state slice", () => {
    const { result } = renderStateCore({
      initialState: {
        sorting: [{ id: "name", desc: true }],
        columnFilters: [{ id: "role", value: "admin" }],
        columnVisibility: { age: false },
        rowSelection: { "row-1": true },
        pagination: { pageIndex: 2, pageSize: 25 },
      },
    });

    expect(result.current.sorting).toEqual([{ id: "name", desc: true }]);
    expect(result.current.columnFilters).toEqual([
      { id: "role", value: "admin" },
    ]);
    expect(result.current.columnVisibility).toEqual({ age: false });
    expect(result.current.rowSelection).toEqual({ "row-1": true });
    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 25 });
  });

  it("exposes a state mirror that matches the top-level slices", () => {
    const { result } = renderStateCore({
      initialState: {
        sorting: [{ id: "name", desc: false }],
        pagination: { pageIndex: 1, pageSize: 20 },
      },
    });

    expect(result.current.state).toEqual({
      sorting: result.current.sorting,
      columnFilters: result.current.columnFilters,
      columnVisibility: result.current.columnVisibility,
      rowSelection: result.current.rowSelection,
      pagination: result.current.pagination,
    });
  });
});

describe("useDataTableStateCore updaters", () => {
  it("setSorting accepts a direct value and notifies onSortingChange", () => {
    const onSortingChange = vi.fn();
    const { result } = renderStateCore({ onSortingChange });

    act(() => {
      result.current.setSorting([{ id: "name", desc: false }]);
    });

    expect(result.current.sorting).toEqual([{ id: "name", desc: false }]);
    expect(onSortingChange).toHaveBeenCalledTimes(1);
    expect(onSortingChange).toHaveBeenCalledWith([{ id: "name", desc: false }]);
  });

  it("setSorting functional updater receives the current sorting and can toggle direction", () => {
    const { result } = renderStateCore();

    act(() => {
      result.current.setSorting([{ id: "name", desc: false }]);
    });
    act(() => {
      result.current.setSorting((current) =>
        current.map((sort) => ({ ...sort, desc: !sort.desc })),
      );
    });

    expect(result.current.sorting).toEqual([{ id: "name", desc: true }]);
  });

  it("setColumnFilters accepts direct and functional updates and notifies onFiltersChange", () => {
    const onFiltersChange = vi.fn();
    const { result } = renderStateCore({ onFiltersChange });

    act(() => {
      result.current.setColumnFilters([{ id: "name", value: "ada" }]);
    });

    expect(result.current.columnFilters).toEqual([
      { id: "name", value: "ada" },
    ]);
    expect(onFiltersChange).toHaveBeenLastCalledWith([
      { id: "name", value: "ada" },
    ]);

    act(() => {
      result.current.setColumnFilters((current) => [
        ...current,
        { id: "role", value: "admin" },
      ]);
    });

    expect(result.current.columnFilters).toEqual([
      { id: "name", value: "ada" },
      { id: "role", value: "admin" },
    ]);
  });

  it("pagination updates flow through the handlers object used by the table", () => {
    const onPaginationChange = vi.fn();
    const { result } = renderStateCore({ onPaginationChange });

    act(() => {
      result.current.handlers.onPaginationChange({
        pageIndex: 3,
        pageSize: 50,
      });
    });

    expect(result.current.pagination).toEqual({ pageIndex: 3, pageSize: 50 });
    expect(onPaginationChange).toHaveBeenLastCalledWith({
      pageIndex: 3,
      pageSize: 50,
    });

    act(() => {
      result.current.handlers.onPaginationChange((current) => ({
        ...current,
        pageIndex: current.pageIndex + 1,
      }));
    });

    expect(result.current.pagination).toEqual({ pageIndex: 4, pageSize: 50 });
  });

  it("does NOT reset pageIndex when column filters change (reset is the table engine's job)", () => {
    const { result } = renderStateCore();

    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 10 });
    });
    act(() => {
      result.current.setColumnFilters([{ id: "name", value: "ada" }]);
    });

    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 10 });
  });

  it("setRowSelection updates the selection map and notifies onRowSelectionChange", () => {
    const onRowSelectionChange = vi.fn();
    const { result } = renderStateCore({ onRowSelectionChange });

    act(() => {
      result.current.setRowSelection({ "row-1": true, "row-2": true });
    });

    expect(result.current.rowSelection).toEqual({
      "row-1": true,
      "row-2": true,
    });
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({
      "row-1": true,
      "row-2": true,
    });

    act(() => {
      result.current.setRowSelection((current) => {
        const next = { ...current };
        delete next["row-1"];
        return next;
      });
    });

    expect(result.current.rowSelection).toEqual({ "row-2": true });
  });

  it("setColumnVisibility updates the visibility map and notifies onColumnVisibilityChange", () => {
    const onColumnVisibilityChange = vi.fn();
    const { result } = renderStateCore({ onColumnVisibilityChange });

    act(() => {
      result.current.setColumnVisibility({ age: false });
    });

    expect(result.current.columnVisibility).toEqual({ age: false });
    expect(onColumnVisibilityChange).toHaveBeenLastCalledWith({ age: false });

    act(() => {
      result.current.setColumnVisibility((current) => ({
        ...current,
        role: false,
      }));
    });

    expect(result.current.columnVisibility).toEqual({
      age: false,
      role: false,
    });
  });
});

describe("useDataTableStateCore controlled state", () => {
  it("a controlled slice takes precedence and setters never write it to internal state", () => {
    const onSortingChange = vi.fn();
    const initialProps: UseDataTableStateCoreOptions = {
      initialState: { sorting: [{ id: "name", desc: false }] },
      state: { sorting: [{ id: "age", desc: true }] },
      onSortingChange,
    };
    const { result, rerender } = renderStateCore(initialProps);

    expect(result.current.sorting).toEqual([{ id: "age", desc: true }]);

    act(() => {
      result.current.setSorting([{ id: "role", desc: false }]);
    });

    // The callback is notified, but the controlled value still wins.
    expect(onSortingChange).toHaveBeenLastCalledWith([
      { id: "role", desc: false },
    ]);
    expect(result.current.sorting).toEqual([{ id: "age", desc: true }]);

    // Removing the controlled slice reveals untouched internal state.
    rerender({
      initialState: { sorting: [{ id: "name", desc: false }] },
      onSortingChange,
    });
    expect(result.current.sorting).toEqual([{ id: "name", desc: false }]);
  });

  it("functional updaters receive the controlled value as current state", () => {
    const onSortingChange = vi.fn();
    const { result } = renderStateCore({
      state: { sorting: [{ id: "age", desc: true }] },
      onSortingChange,
    });

    act(() => {
      result.current.setSorting((current) =>
        current.map((sort) => ({ ...sort, desc: !sort.desc })),
      );
    });

    expect(onSortingChange).toHaveBeenLastCalledWith([
      { id: "age", desc: false },
    ]);
  });

  it("partial controlled state leaves the other slices internally managed", () => {
    const { result } = renderStateCore({
      state: { sorting: [{ id: "name", desc: true }] },
    });

    act(() => {
      result.current.setPagination({ pageIndex: 1, pageSize: 20 });
    });

    expect(result.current.sorting).toEqual([{ id: "name", desc: true }]);
    expect(result.current.pagination).toEqual({ pageIndex: 1, pageSize: 20 });
  });

  it("the state prop replaces the deprecated controlledState wholesale, not per slice", () => {
    const { result } = renderStateCore({
      state: { pagination: { pageIndex: 4, pageSize: 25 } },
      controlledState: { sorting: [{ id: "name", desc: true }] },
    });

    // `state` wins as a whole object: controlledState.sorting is ignored
    // entirely, so sorting falls back to internal (empty) state.
    expect(result.current.pagination).toEqual({ pageIndex: 4, pageSize: 25 });
    expect(result.current.sorting).toEqual([]);
  });
});

describe("useDataTableStateCore default getRowId", () => {
  it("prefers id, then uuid, _id, key, slug, and finally the row index", () => {
    const { result } = renderStateCore();
    const { getRowId } = result.current;

    expect(getRowId({ id: "row-1" }, 9)).toBe("row-1");
    expect(getRowId({ uuid: "uuid-1" }, 9)).toBe("uuid-1");
    expect(getRowId({ _id: 7 }, 9)).toBe("7");
    expect(getRowId({ key: "key-1" }, 9)).toBe("key-1");
    expect(getRowId({ slug: "slug-1" }, 9)).toBe("slug-1");
    expect(getRowId({ id: "wins", uuid: "loses" }, 9)).toBe("wins");
    expect(getRowId({ name: "no identifier" }, 9)).toBe("9");
    expect(getRowId("not an object", 3)).toBe("3");
  });
});
