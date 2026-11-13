import type {
  ColumnFiltersState,
  SortingState,
} from "@asym/ui/components/shadcn/data-table/tanstack";

export type CrmView = "table" | "kanban";

/** The part of the records list a link, reload or Back should restore. */
export interface CrmUrlState {
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
  view: CrmView;
}

const DEFAULT_SORT = { id: "lastTouchAt", desc: true } as const;

/** Columns the records API can sort by (see `mapSortField` in the hook). */
const SORTABLE_COLUMN_IDS = new Set([
  "lastTouchAt",
  "displayName",
  "recordType",
  "lifecycleStatus",
  "lifetimeGiving",
  "lastGiftAt",
  "createdAt",
]);

const SEARCH_FILTER_ID = "displayName";

/** Multi-value filters: grid column id to address parameter. */
const LIST_FILTER_PARAMS = [
  ["recordType", "recordType"],
  ["lifecycleStatus", "status"],
  ["tags", "tag"],
  ["portalAccessLabel", "portal"],
] as const;

const OWNED_PARAMS = [
  "q",
  "sort",
  "dir",
  "view",
  ...LIST_FILTER_PARAMS.map(([, param]) => param),
];

export function readCrmUrlState(params: URLSearchParams): CrmUrlState {
  const columnFilters: ColumnFiltersState = [];
  const search = params.get("q")?.trim();
  if (search) {
    columnFilters.push({ id: SEARCH_FILTER_ID, value: search });
  }
  for (const [columnId, param] of LIST_FILTER_PARAMS) {
    const values = params.getAll(param).filter(Boolean);
    if (values.length > 0) {
      columnFilters.push({ id: columnId, value: values });
    }
  }

  const sortId = params.get("sort");
  const sorting =
    sortId && SORTABLE_COLUMN_IDS.has(sortId)
      ? [{ id: sortId, desc: params.get("dir") !== "asc" }]
      : [{ ...DEFAULT_SORT }];

  return {
    columnFilters,
    sorting,
    view: params.get("view") === "board" ? "kanban" : "table",
  };
}

/**
 * The address with the list state written in. Parameters the list does not
 * own (donor, gift, email) are kept; defaults are left out.
 */
export function writeCrmUrlState(
  current: URLSearchParams,
  state: CrmUrlState,
): URLSearchParams {
  const params = new URLSearchParams(current);
  for (const param of OWNED_PARAMS) {
    params.delete(param);
  }

  const valueOf = (id: string) =>
    state.columnFilters.find((filter) => filter.id === id)?.value;
  const search = valueOf(SEARCH_FILTER_ID);
  if (typeof search === "string" && search.trim()) {
    params.set("q", search.trim());
  }
  for (const [columnId, param] of LIST_FILTER_PARAMS) {
    const values = valueOf(columnId);
    if (Array.isArray(values)) {
      for (const value of values) {
        params.append(param, String(value));
      }
    }
  }

  const sort = state.sorting[0];
  if (
    sort &&
    SORTABLE_COLUMN_IDS.has(sort.id) &&
    !(sort.id === DEFAULT_SORT.id && sort.desc === DEFAULT_SORT.desc)
  ) {
    params.set("sort", sort.id);
    params.set("dir", sort.desc ? "desc" : "asc");
  }
  if (state.view === "kanban") {
    params.set("view", "board");
  }
  return params;
}

/** One string per distinct list state, for telling address and state apart. */
export function crmUrlStateKey(state: CrmUrlState): string {
  return writeCrmUrlState(new URLSearchParams(), state).toString();
}
