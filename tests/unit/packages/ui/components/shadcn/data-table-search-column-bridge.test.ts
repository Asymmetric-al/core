import { describe, expect, it } from "vitest";

import {
  mergeSearchColumnFilter,
  splitSearchColumnFilter,
} from "../../../../../../packages/ui/components/shadcn/data-table/data-table-search-column-bridge";

describe("data-table search column bridge", () => {
  it("uses searchColumnKey distinct from URL param key: merge binds globalFilter to column id", () => {
    const urlColumnFilters = [{ id: "status", value: "open" }];
    const globalFilter = "needle";
    const searchColumnKey = "title";
    const merged = mergeSearchColumnFilter(
      urlColumnFilters,
      globalFilter,
      searchColumnKey,
    );
    expect(merged).toEqual([
      { id: "title", value: "needle" },
      { id: "status", value: "open" },
    ]);
  });

  it("round-trips merged filters: split extracts search column then merge restores", () => {
    const searchColumnKey = "nameCol";
    const urlBackedFilters = [{ id: "role", value: "admin" }];
    const globalFilter = "Ada";

    const merged = mergeSearchColumnFilter(
      urlBackedFilters,
      globalFilter,
      searchColumnKey,
    );
    const { searchValue, remainingFilters } = splitSearchColumnFilter(
      merged,
      searchColumnKey,
    );

    expect(searchValue).toBe("Ada");
    expect(remainingFilters).toEqual(urlBackedFilters);

    const roundTrip = mergeSearchColumnFilter(
      remainingFilters,
      searchValue,
      searchColumnKey,
    );
    expect(roundTrip).toEqual(merged);
  });

  it("when searchColumnKey is undefined, merge is a no-op and split leaves filters unchanged", () => {
    const filters = [{ id: "x", value: "y" }];
    expect(mergeSearchColumnFilter(filters, "q", undefined)).toEqual(filters);
    expect(splitSearchColumnFilter(filters, undefined)).toEqual({
      searchValue: "",
      remainingFilters: filters,
    });
  });
});
