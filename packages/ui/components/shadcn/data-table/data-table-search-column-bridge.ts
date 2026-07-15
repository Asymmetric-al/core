import type { ColumnFiltersState } from "./tanstack";

/**
 * Splits URL-backed global search from other column filters so `nuqs` can store
 * search in the query param (`globalFilter`) while TanStack Table uses a column id.
 */
export function splitSearchColumnFilter(
  filters: ColumnFiltersState,
  searchColumnKey?: string,
): {
  searchValue: string;
  remainingFilters: ColumnFiltersState;
} {
  if (!searchColumnKey) {
    return {
      searchValue: "",
      remainingFilters: filters,
    };
  }

  const remainingFilters: ColumnFiltersState = [];
  let searchValue = "";

  for (const filter of filters) {
    if (filter.id === searchColumnKey) {
      searchValue =
        typeof filter.value === "string"
          ? filter.value
          : String(filter.value ?? "");
      continue;
    }

    remainingFilters.push(filter);
  }

  return {
    searchValue,
    remainingFilters,
  };
}

/**
 * Merges URL `globalFilter` into `columnFilters` under `searchColumnKey`.
 */
export function mergeSearchColumnFilter(
  filters: ColumnFiltersState,
  globalFilter: string,
  searchColumnKey?: string,
): ColumnFiltersState {
  if (!searchColumnKey) {
    return filters;
  }

  const mergedFilters = filters.filter(
    (filter) => filter.id !== searchColumnKey,
  );

  if (globalFilter) {
    mergedFilters.unshift({
      id: searchColumnKey,
      value: globalFilter,
    });
  }

  return mergedFilters;
}
