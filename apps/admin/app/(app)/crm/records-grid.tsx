"use client";

import { useAdminCrmTagOptions } from "@asym/database/hooks";
import { useIsMobile } from "@asym/lib/hooks/use-mobile";
import {
  DataGridPanel,
  DataGridResetFilters,
  DataGridRowPrimary,
  DataGridSearch,
  DataGridToolbarGroup,
  DataGridViewOptions,
  dataGridFeatures,
  useTable,
  DataGridSortSelect,
} from "@asym/ui/components/data-grid-panel";
import { DataGrid } from "@asym/ui/components/reui/data-grid/data-grid";
import { DataGridColumnFilter } from "@asym/ui/components/reui/data-grid/data-grid-column-filter";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
} from "@asym/ui/components/shadcn/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { Download, SearchX, Users } from "lucide-react";
import { useId, useMemo } from "react";

import {
  CRM_COLUMN_TIERS,
  CRM_FILL_COLUMN_ID,
  CRM_PORTAL_OPTIONS,
  CRM_RECORD_TYPE_OPTIONS,
  CRM_STATUS_OPTIONS,
  CrmRecordActions,
  CrmRecordSubline,
  getCrmColumns,
} from "./columns";
import {
  CrmRefreshButton,
  CrmStatusBadge,
  crmInitials,
  crmPanelError,
  formatCrmDate,
  formatCrmMoneyCents,
  toCrmLabel,
} from "./crm-display";
import { getCrmVirtualHeight, useCrmVirtualAllowance } from "./crm-virtual";
import { useCrmGridLayout } from "./use-crm-grid-layout";

import type { CrmGridRow } from "./types";
import type { useAdminCrmRecordsInfiniteGrid } from "@asym/database/hooks";
import type {
  DataGridRow,
  DataGridTableOf,
} from "@asym/ui/components/data-grid-panel";

type CrmRecordsGridState = ReturnType<typeof useAdminCrmRecordsInfiniteGrid>;

/**
 * The donor giving report (CSV attachment from the authenticated route). It
 * is not this grid's view: the report aggregates gifts per donor and its own
 * `q` matches donor names only, unlike the records search (name, email,
 * organization, phone), so the grid's search and filters are not passed on.
 */
export const CRM_DONOR_EXPORT_HREF =
  "/api/admin/crm/reports/export?slice=donors";

/** Server search filter id: the records API searches name, email, org, phone. */
export const CRM_SEARCH_FILTER_ID = "displayName";

/** Measured height of a record row (avatar + two text lines). */
const ROW_HEIGHT = 52;

export function getCrmSearchValue(
  columnFilters: CrmRecordsGridState["columnFilters"],
): string {
  const value = columnFilters.find(
    (filter) => filter.id === CRM_SEARCH_FILTER_ID,
  )?.value;
  return typeof value === "string" ? value : "";
}

export function withCrmSearch(
  columnFilters: CrmRecordsGridState["columnFilters"],
  search: string,
): CrmRecordsGridState["columnFilters"] {
  const rest = columnFilters.filter(
    (filter) => filter.id !== CRM_SEARCH_FILTER_ID,
  );
  return search ? [...rest, { id: CRM_SEARCH_FILTER_ID, value: search }] : rest;
}

/** Column ids the rows are sorted or filtered by (the search box excluded). */
export function getCrmKeptColumnIds(
  sorting: CrmRecordsGridState["sorting"],
  columnFilters: CrmRecordsGridState["columnFilters"],
): string[] {
  return [
    ...sorting.map((sort) => sort.id),
    ...columnFilters
      .filter((filter) => filter.id !== CRM_SEARCH_FILTER_ID)
      .map((filter) => filter.id),
  ];
}

/** Server sort choices for phones, where the table headers are not shown. */
const CRM_SORT_LABELS: Record<string, string> = {
  "lastTouchAt:desc": "Updated: newest",
  "lastTouchAt:asc": "Updated: oldest",
  "displayName:asc": "Name: A–Z",
  "displayName:desc": "Name: Z–A",
  "lifetimeGiving:desc": "Giving: highest",
  "lifetimeGiving:asc": "Giving: lowest",
  "lastGiftAt:desc": "Last gift: newest",
  "lastGiftAt:asc": "Last gift: oldest",
};

/** Header sorts a wide screen can set, labelled if a phone shows them. */
const CRM_EXTRA_SORT_LABELS: Record<string, string> = {
  "recordType:asc": "Type: A–Z",
  "recordType:desc": "Type: Z–A",
  "lifecycleStatus:asc": "Status: A–Z",
  "lifecycleStatus:desc": "Status: Z–A",
};

type CrmRecordsTable = DataGridTableOf<CrmGridRow>;

/**
 * The faceted server filters (Type, Status, Portal and Tags), shared by the
 * table toolbar and the board so either view can add or change a filter.
 */
function CrmRecordFilters({
  table,
  tagOptions,
}: {
  table: CrmRecordsTable;
  tagOptions: Array<{ label: string; value: string }>;
}) {
  return (
    <>
      <DataGridColumnFilter
        column={table.getColumn("recordType")}
        title="Type"
        options={CRM_RECORD_TYPE_OPTIONS}
      />
      <DataGridColumnFilter
        column={table.getColumn("lifecycleStatus")}
        title="Status"
        options={CRM_STATUS_OPTIONS}
      />
      <DataGridColumnFilter
        column={table.getColumn("portalAccessLabel")}
        title="Portal"
        options={CRM_PORTAL_OPTIONS}
      />
      {tagOptions.length > 0 ? (
        <DataGridColumnFilter
          column={table.getColumn("tags")}
          title="Tags"
          options={tagOptions}
        />
      ) : null}
    </>
  );
}

const noopOpenRecord = () => {};

/**
 * The table's faceted filters for the board. The board has no grid of its
 * own, so a filter-only table (the same columns and server column filters,
 * filtered on the server) drives the shared filter controls.
 */
export function CrmBoardFilters({
  rows,
  columnFilters,
  onFiltersChange,
}: {
  rows: CrmGridRow[];
  columnFilters: CrmRecordsGridState["columnFilters"];
  onFiltersChange: CrmRecordsGridState["onFiltersChange"];
}) {
  const columns = useMemo(
    () => getCrmColumns({ onViewRecord: noopOpenRecord }),
    [],
  );
  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns,
    getRowId: (row) => row.id,
    state: { columnFilters },
    onColumnFiltersChange: onFiltersChange,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });
  const tenantTags = useAdminCrmTagOptions().data;
  const tagOptions = useMemo(
    () => getTagOptions(rows, tenantTags),
    [rows, tenantTags],
  );
  return (
    <DataGrid table={table} recordCount={rows.length}>
      <CrmRecordFilters table={table} tagOptions={tagOptions} />
    </DataGrid>
  );
}

/** "60 records", or "60 loaded" while more pages remain. */
export function crmRecordsCountLabel(count: number, hasMore: boolean) {
  const formatted = count.toLocaleString("en-US");
  if (hasMore) return `${formatted} loaded`;
  return count === 1 ? "1 record" : `${formatted} records`;
}

const CRM_DONOR_REPORT_HINT =
  "Downloads every donor's giving as CSV. Search and filters don't apply.";

/**
 * The report's scope is in a tooltip (hover or focus) and its description.
 * `compact` (phones) keeps the same name on an icon button. `unavailable`
 * says why there is nothing to download (records failed to load, or there
 * are none); the control then stays focusable but disabled, with that reason
 * as its tooltip and description.
 */
function CrmDonorReportLink({
  compact = false,
  unavailable = null,
}: {
  compact?: boolean;
  unavailable?: string | null;
}) {
  const hintId = useId();
  const hint = unavailable ?? CRM_DONOR_REPORT_HINT;
  const className = buttonVariants({
    variant: "outline",
    size: compact ? "icon-sm" : "sm",
  });
  const content = (
    <>
      <Download aria-hidden="true" />
      {compact ? null : "Export donor report"}
    </>
  );
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            unavailable ? (
              <Button
                variant="outline"
                size={compact ? "icon-sm" : "sm"}
                disabled
                focusableWhenDisabled
                aria-label={compact ? "Export donor report" : undefined}
                aria-describedby={hintId}
              >
                {content}
              </Button>
            ) : (
              <a
                href={CRM_DONOR_EXPORT_HREF}
                download
                aria-label={compact ? "Export donor report" : undefined}
                aria-describedby={hintId}
                className={className}
              >
                {content}
              </a>
            )
          }
        />
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>
      <span id={hintId} className="sr-only">
        {hint}
      </span>
    </>
  );
}

/**
 * Refresh and the donor report for the board's toolbar, as the table has
 * them. While the list has failed with nothing loaded, the error's Retry is
 * the one way to try again, so Refresh steps aside.
 */
export function CrmBoardActions({ state }: { state: CrmRecordsGridState }) {
  const isMobile = useIsMobile();
  const listFailed = state.tableError != null && state.rows.length === 0;
  return (
    <div className="flex items-center gap-2">
      {listFailed ? null : (
        <CrmRefreshButton
          compact={isMobile}
          refreshing={state.isLoading || state.isFetchingMore}
          onRefresh={state.onRefresh}
        />
      )}
      <CrmDonorReportLink
        compact={isMobile}
        unavailable={crmDonorReportUnavailableReason({
          tableError: state.tableError,
          rowCount: state.rows.length,
        })}
      />
    </div>
  );
}

/**
 * Why the donor report cannot be downloaded right now, or null when it can.
 * The report is built on the server from donations (including ones with no
 * donor record), not from this list, so only a list that failed with
 * nothing loaded (the CRM service is unreachable) withholds it.
 */
export function crmDonorReportUnavailableReason({
  tableError,
  rowCount,
}: {
  tableError: Error | null;
  rowCount: number;
}): string | null {
  if (tableError && rowCount === 0) {
    return "Unavailable while CRM records can't load.";
  }
  return null;
}

/**
 * Tag filter options: every tag in use across the tenant (from the tags
 * endpoint) plus any on the loaded rows, so tags on records not loaded yet
 * can still be chosen.
 */
function getTagOptions(rows: CrmGridRow[], tenantTags: readonly string[] = []) {
  const tags = new Set<string>(tenantTags);
  for (const row of rows) {
    for (const tag of row.tags ?? []) tags.add(tag);
  }
  return Array.from(tags)
    .sort((a, b) => a.localeCompare(b))
    .map((tag) => ({ label: tag, value: tag }));
}

/**
 * The card's date: the one the list is ordered by, so a phone shows why the
 * cards are in this order (last updated, the default, unless sorted by gift).
 */
export function crmRecordCardDate(
  record: CrmGridRow,
  sortId: string | undefined,
): string | null {
  if (sortId === "lastGiftAt") {
    const lastGift = formatCrmDate(record.lastGiftAt);
    return lastGift ? `Last gift ${lastGift}` : "No gift yet";
  }
  const updated = formatCrmDate(record.lastTouchAt);
  return updated ? `Updated ${updated}` : null;
}

function CrmRecordMobileRow({
  record,
  sortId,
  onOpen,
}: {
  record: CrmGridRow;
  sortId: string | undefined;
  onOpen: (row: CrmGridRow) => void;
}) {
  const date = crmRecordCardDate(record, sortId);
  const owner = record.assignedMissionaryName;
  const name = record.displayName || "Unnamed record";
  const subline =
    record.primaryOrganization && record.primaryOrganization !== name
      ? record.primaryOrganization
      : record.title;
  const recordType = record.recordType ? toCrmLabel(record.recordType) : null;
  return (
    // The primary control stretches over the card, so the whole card opens
    // it; the row menu sits above it.
    <div className="relative rounded-md transition-colors hover:bg-accent/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <Item variant="outline" size="sm" render={<div />}>
        <ItemMedia>
          <Avatar aria-hidden="true">
            <AvatarImage src={record.avatarUrl ?? undefined} alt="" />
            <AvatarFallback>{crmInitials(name)}</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent className="min-w-0">
          {/* The name owns its line (wrapping to two) so long organization
              names stay readable; status and giving share the last line. */}
          <div className="flex min-w-0">
            <DataGridRowPrimary
              className="after:absolute after:inset-0"
              onClick={() => onOpen(record)}
            >
              <span className="line-clamp-2 text-sm font-medium">{name}</span>
            </DataGridRowPrimary>
          </div>
          {/* The table's order: type, owner, then the title on its own
              line, so a narrow card keeps both readable. */}
          <CrmRecordSubline
            recordType={recordType}
            owner={owner}
            subline={subline}
            stacked
          />
          {date ? (
            <p className="text-xs text-muted-foreground tabular-nums">{date}</p>
          ) : null}
          <div className="flex min-w-0 items-center justify-between gap-2 pt-1">
            <CrmStatusBadge status={record.lifecycleStatus} />
            <span className="flex shrink-0 items-baseline gap-1.5">
              <span className="text-xs text-muted-foreground">
                Lifetime giving
              </span>
              <span className="text-sm font-medium tabular-nums">
                {formatCrmMoneyCents(record.lifetimeGiving)}
              </span>
            </span>
          </div>
        </ItemContent>
        <ItemActions>
          <div className="relative">
            <CrmRecordActions record={record} onViewRecord={onOpen} />
          </div>
        </ItemActions>
      </Item>
    </div>
  );
}

function CrmRecordsEmpty({
  filtered,
  onReset,
}: {
  filtered: boolean;
  onReset: () => void;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {filtered ? (
            <SearchX aria-hidden="true" />
          ) : (
            <Users aria-hidden="true" />
          )}
        </EmptyMedia>
        <EmptyTitle>
          {filtered ? "No matching records" : "No CRM records"}
        </EmptyTitle>
        <EmptyDescription>
          {filtered
            ? "No donors match this search or these filters."
            : "Donors appear here after their first gift or import."}
        </EmptyDescription>
      </EmptyHeader>
      {filtered ? (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onReset}>
            Clear search and filters
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

export function CrmRecordsGrid({
  state,
  onOpenRecord,
}: {
  state: CrmRecordsGridState;
  onOpenRecord: (row: CrmGridRow) => void;
}) {
  const {
    columnFilters,
    hasMore,
    isFetchingMore,
    isLoading,
    loadMore,
    onFiltersChange,
    onRefresh,
    onSortingChange,
    rows,
    sorting,
    tableError,
  } = state;
  const columns = useMemo(
    () => getCrmColumns({ onViewRecord: onOpenRecord }),
    [onOpenRecord],
  );
  // The sorted and filtered columns stay on screen at every panel width.
  const keepVisible = useMemo(
    () => getCrmKeptColumnIds(sorting, columnFilters),
    [sorting, columnFilters],
  );
  const { panelRef, columnVisibility, columnSizing, onColumnVisibilityChange } =
    useCrmGridLayout({
      columns,
      fillColumnId: CRM_FILL_COLUMN_ID,
      tiers: CRM_COLUMN_TIERS,
      keepVisible,
    });
  const virtualAllowance = useCrmVirtualAllowance(panelRef);
  const tenantTags = useAdminCrmTagOptions().data;
  const tagOptions = useMemo(
    () => getTagOptions(rows, tenantTags),
    [rows, tenantTags],
  );

  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, columnFilters, columnVisibility, columnSizing },
    onSortingChange,
    onColumnFiltersChange: onFiltersChange,
    onColumnVisibilityChange,
    manualSorting: true,
    manualFiltering: true,
    // Every loaded page renders; the virtual body asks for the next one.
    manualPagination: true,
  });

  const search = getCrmSearchValue(columnFilters);
  const filtered = columnFilters.length > 0;
  const resetFilters = () => onFiltersChange([]);
  const refreshing = isLoading || isFetchingMore;
  const isMobile = useIsMobile();
  const sortId = sorting[0]?.id;
  const countLabel =
    rows.length > 0 ? crmRecordsCountLabel(rows.length, hasMore) : null;
  const reportUnavailable = crmDonorReportUnavailableReason({
    tableError,
    rowCount: rows.length,
  });

  const searchBox = (
    <DataGridSearch
      label="Search CRM records"
      placeholder="Search records…"
      value={search}
      onValueChange={(value) =>
        onFiltersChange((current) => withCrmSearch(current, value))
      }
      // A little under the usual 16rem, so a filtered toolbar stays on one
      // row on a laptop screen.
      className={isMobile ? "min-w-0 flex-1" : "w-full min-w-0 sm:w-60"}
    />
  );
  // Phones keep Refresh and the report beside the search as named icon
  // buttons, so the filters start on the next row. While the list has failed
  // with nothing loaded, the error's Retry replaces Refresh.
  const refreshButton =
    tableError && rows.length === 0 ? null : (
      <CrmRefreshButton
        compact={isMobile}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );

  return (
    // Measured so the name column can take the width the others leave.
    <div ref={panelRef} className="min-w-0">
      <DataGridPanel
        table={table}
        recordCount={rows.length}
        label="CRM records"
        isLoading={isLoading}
        error={crmPanelError(tableError, {
          resource: "CRM records",
          onRetry: () => void onRefresh(),
        })}
        empty={<CrmRecordsEmpty filtered={filtered} onReset={resetFilters} />}
        onRowClick={onOpenRecord}
        // Fixed column widths keep the virtualized rows from reflowing; the
        // name column's width comes from the measured panel.
        tableLayout={{ width: "fixed" }}
        // Loading and empty states use the plain body (skeleton rows, a sized
        // empty state); loaded records use the virtual body, which asks for
        // the next page as the viewer nears the end.
        virtual={
          rows.length > 0
            ? {
                estimateSize: ROW_HEIGHT,
                height: getCrmVirtualHeight(rows.length, ROW_HEIGHT, {
                  allowance: virtualAllowance,
                  statusRow: hasMore,
                }),
                hasMore,
                isFetchingMore,
                // Only while pages remain: once all are loaded the toolbar
                // count says so, and an "All N loaded" row would repeat it.
                onFetchMore: hasMore ? loadMore : undefined,
                fetchingMoreMessage: "Loading more records…",
              }
            : undefined
        }
        renderMobileRow={(row: DataGridRow<CrmGridRow>) => (
          <CrmRecordMobileRow
            record={row.original}
            sortId={sortId}
            onOpen={onOpenRecord}
          />
        )}
        toolbar={
          <>
            {isMobile ? (
              <div className="flex w-full min-w-0 items-center gap-2">
                {searchBox}
                {refreshButton}
                <CrmDonorReportLink compact unavailable={reportUnavailable} />
              </div>
            ) : (
              searchBox
            )}
            <DataGridToolbarGroup>
              <CrmRecordFilters table={table} tagOptions={tagOptions} />
              {/* Phones get cards without headers, so sorting moves here. */}
              {isMobile ? (
                <DataGridSortSelect
                  label="Sort records"
                  options={CRM_SORT_LABELS}
                  extraOptions={CRM_EXTRA_SORT_LABELS}
                  fallback="lastTouchAt:desc"
                  sorting={sorting}
                  onSortingChange={onSortingChange}
                />
              ) : null}
              {/* Named in text: the search box has its own clear ×. */}
              <DataGridResetFilters visible={filtered} onReset={resetFilters} />
            </DataGridToolbarGroup>
            {isMobile ? (
              // Phones have no table footer, so the count closes the toolbar.
              countLabel ? (
                <span className="ms-auto text-xs text-muted-foreground tabular-nums">
                  {countLabel}
                </span>
              ) : null
            ) : (
              // ms-auto pushes the actions right; a grow spacer before them
              // would only add a gap and wrap a filtered row at 1440px.
              <div className="ms-auto flex flex-wrap items-center gap-2">
                {/* The count at rest, as Notes and Support show theirs;
                      it reads "N loaded" while more pages remain and
                      "N records" once all are loaded. */}
                {countLabel ? (
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {countLabel}
                  </span>
                ) : null}
                {refreshButton}
                <CrmDonorReportLink unavailable={reportUnavailable} />
                {/* Columns only exist in the table layout (md and up). */}
                <DataGridViewOptions table={table} />
              </div>
            )}
          </>
        }
      />
    </div>
  );
}
