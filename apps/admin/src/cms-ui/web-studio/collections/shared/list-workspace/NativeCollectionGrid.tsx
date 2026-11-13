"use client";

import {
  DataGridPanel,
  DataGridResetFilters,
  DataGridRowPrimary,
  DataGridSearch,
  DataGridSelectionBar,
  DataGridToolbarSpacer,
  createDataGridSelectionColumn,
  dataGridFeatures,
  useTable,
} from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  FilterBuilder,
  createEmptyFilterState,
  type AdvancedFilterState,
} from "@asym/ui/components/shadcn/data-table";
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
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import {
  useListQuery,
  useRouteTransition,
  useSelection,
  useTableColumns,
} from "@payloadcms/ui";
import { FileSearch, ListFilter, Plus, SearchX, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { GridBulkActions, type GridBulkOptions } from "./grid-bulk-actions";
import { GridGroupByMenu } from "./grid-group-by-menu";
import { GridSortMenu } from "./grid-sort-menu";
import { GridViewMenu } from "./grid-view-menu";
import {
  activeAccessors,
  columnFieldType,
  gridColumnSizeWithHeading,
  columnLabel,
  countWhereConditions,
  defaultSortLabel,
  isDataColumn,
  isEmptyCell,
  isReferenceId,
  isSortableField,
  LIST_DATE_OPTIONS,
  PRIMARY_COLUMN_SIZE,
  listDateValue,
  PAYLOAD_FALLBACK_SORT,
  parsePayloadSort,
  plainCellValue,
  resolveDocumentThumbnail,
  STATUS_COLUMN_SIZE,
  toPayloadSort,
  visibilityFromColumns,
} from "./payload-list-grid";
import {
  canEditWhere,
  filterStateToWhere,
  payloadFilterFields,
  payloadGroupByFields,
  whereToFilterState,
  type RelationshipFilterOptions,
} from "./payload-where-filters";
import { ReferenceId } from "./reference-id";
import {
  isNamedReferenceColumn,
  referenceColumnTitle,
  useReferenceLabels,
} from "./reference-labels";
import {
  filterableRelationships,
  relationshipLabel,
  useRelationshipFilterOptions,
} from "./relationship-filter-options";
import { Link, useRouter } from "../../../routing";
import { ViewerDate } from "../../../shell/viewer-date";

import type { ColumnVisibility, PayloadListColumn } from "./payload-list-grid";
import type {
  DataGridColumnDef,
  DataGridRow,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@asym/ui/components/data-grid-panel";
import type { ClientField, ListViewGroup } from "payload";
import type { ReactNode } from "react";

type GridRow = {
  id: string;
  index: number;
  doc: Record<string, unknown>;
};

export type NativeCollectionGridProps = {
  /** Plural label, also the grid's accessible name. */
  title: string;
  /** One document ("Page"), for the selection count. */
  singularTitle?: string;
  useAsTitle: string;
  hasDrafts: boolean;
  listPath: string;
  createHref?: string | null;
  createLabel?: string;
  /** Client fields; the filterable ones feed the shared filter builder. */
  fields: ClientField[];
  /**
   * Payload's server-rendered grouped tables, shown while the list query has
   * a `groupBy` (the ReUI grid shows one flat page of documents).
   */
  groupedTable?: ReactNode;
  /**
   * Payload's grouped documents (one page per group), shown on Core's grid
   * group by group; Payload's own tables are the fallback without it.
   */
  groupedData?: ListViewGroup[];
  /** Payload's trash view: rows open their trash page; no create action. */
  trash?: boolean;
  /** Whether the collection keeps deleted documents in trash. */
  trashEnabled?: boolean;
  /**
   * Payload's bulk actions for this list (row selection on). The list view
   * provides Payload's `SelectionProvider` when this is set.
   */
  bulk?: GridBulkOptions | null;
};

const PAGE_SIZES = [10, 25, 50, 100];

function resolveUpdater<T>(updater: T | ((previous: T) => T), previous: T): T {
  return typeof updater === "function"
    ? (updater as (previous: T) => T)(previous)
    : updater;
}

function documentTitle(doc: Record<string, unknown>, useAsTitle: string) {
  const value = doc[useAsTitle];
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "number") return String(value);
  return `Untitled (${String(doc.id)})`;
}

const STATUS_BADGES = {
  changed: { label: "Changed", variant: "warning" },
  draft: { label: "Draft", variant: "info" },
  published: { label: "Published", variant: "success" },
} as const;

function DocumentStatusBadge({ doc }: { doc: Record<string, unknown> }) {
  const status = doc._displayStatus ?? doc._status;
  if (status !== "changed" && status !== "draft" && status !== "published") {
    return null;
  }
  const badge = STATUS_BADGES[status];
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
}

function DocumentThumbnail({ doc }: { doc: Record<string, unknown> }) {
  const src = resolveDocumentThumbnail(doc);
  if (!src) return null;
  return (
    <Image
      alt=""
      src={src}
      width={32}
      height={32}
      unoptimized
      className="size-8 shrink-0 rounded-md border object-cover"
    />
  );
}

/**
 * One Payload column's cell. The grid lays columns out by content, so every
 * secondary cell stays on one line with a width cap: dates in a compact
 * format, raw reference IDs by both ends with a copy button for the full
 * value, and other values (Payload's field-aware rendering) truncated.
 */
/** A select field's option label for a stored value ("standard" → "Standard page"). */
function selectOptionLabel(field: unknown, value: unknown): string | null {
  const options = (field as { options?: unknown[] } | undefined)?.options;
  if (!Array.isArray(options) || typeof value !== "string") return null;
  for (const option of options) {
    if (typeof option === "string" && option === value) return option;
    if (
      option &&
      typeof option === "object" &&
      (option as { value?: unknown }).value === value
    ) {
      const label = (option as { label?: unknown }).label;
      return typeof label === "string" ? label : value;
    }
  }
  return null;
}

function PayloadCell({
  column,
  row,
  relationshipOptions,
}: {
  column: PayloadListColumn;
  row: GridRow;
  /**
   * Loaded labels by column: related documents Payload did not render, and
   * the missionary or fund behind a reference ID.
   */
  relationshipOptions?: RelationshipFilterOptions;
}) {
  const value = row.doc[column.accessor];
  const type = columnFieldType(column.field);
  if (type === "date") {
    const iso = listDateValue(value);
    if (iso) {
      return (
        <ViewerDate
          value={iso}
          options={LIST_DATE_OPTIONS}
          className="whitespace-nowrap tabular-nums"
        />
      );
    }
  }
  if (type === "text" && isReferenceId(value)) {
    return (
      <ReferenceId
        value={value}
        label={columnLabel(column.field, column.accessor)}
        name={relationshipLabel(value, relationshipOptions?.[column.accessor])}
      />
    );
  }
  if (isEmptyCell(row.doc, column.accessor, type)) {
    return <span className="text-muted-foreground">—</span>;
  }
  // A related document or select option is named from what the grid has
  // already loaded: Payload's relationship cell fetches on its own and shows
  // "Loading..." until it does.
  const named =
    type === "relationship"
      ? relationshipLabel(value, relationshipOptions?.[column.accessor])
      : type === "select"
        ? selectOptionLabel(column.field, value)
        : // Payload's checkbox cell prints a raw `true` in code type.
          type === "checkbox" && typeof value === "boolean"
          ? plainCellValue(value)
          : null;
  // Payload renders cells for the flat page only; grouped rows (index -1)
  // never borrow another row's cell.
  const rendered =
    named === null && row.index >= 0 ? column.renderedCells?.[row.index] : null;
  if (rendered !== undefined && rendered !== null) {
    return (
      <span className="block max-w-60 truncate">{rendered as ReactNode}</span>
    );
  }
  const plain = named ?? plainCellValue(value);
  return plain ? (
    <span title={plain} className="block max-w-60 truncate">
      {plain}
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}

/**
 * A column's heading: the field's label in the Studio's sentence case, and
 * for a reference ID whose names have loaded the record its cells name
 * ("Missionary", "Fund").
 */
function gridColumnTitle(
  column: PayloadListColumn,
  labels: RelationshipFilterOptions | undefined,
): string {
  return (
    referenceColumnTitle(column.accessor, labels) ??
    columnLabel(column.field, column.accessor)
  );
}

/**
 * What a column's sort orders by, when that is not its heading: Payload
 * orders a named reference column ("Missionary") by the stored ID, so its
 * sort choice keeps the field's own label ("Missionary ID").
 */
function referenceSortTitle(
  columns: readonly PayloadListColumn[],
  id: string,
  labels: RelationshipFilterOptions,
): string | undefined {
  const column = columns.find((candidate) => candidate.accessor === id);
  return column && isNamedReferenceColumn(column.accessor, labels)
    ? columnLabel(column.field, column.accessor)
    : undefined;
}

function useGridColumns({
  columns,
  hasDrafts,
  listPath,
  primaryAccessor,
  useAsTitle,
  relationshipOptions,
}: {
  relationshipOptions?: RelationshipFilterOptions;
  columns: PayloadListColumn[];
  hasDrafts: boolean;
  listPath: string;
  primaryAccessor: string;
  useAsTitle: string;
}): DataGridColumnDef<GridRow>[] {
  const primaryColumn = columns.find(
    (column) => column.accessor === primaryAccessor,
  );
  const primary: DataGridColumnDef<GridRow> = {
    id: primaryAccessor,
    accessorFn: (row) => row.doc[primaryAccessor],
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={columnLabel(primaryColumn?.field, primaryAccessor)}
      />
    ),
    cell: ({ row }) => (
      <DataGridRowPrimary
        render={
          <Link href={`${listPath}/${encodeURIComponent(row.original.id)}`} />
        }
      >
        <DocumentThumbnail doc={row.original.doc} />
        {/* The record's name is never clipped: it wraps when the table is
            tight, holding a readable minimum width (about 16 characters). */}
        <span className="min-w-32 font-medium text-pretty">
          {documentTitle(row.original.doc, useAsTitle)}
        </span>
      </DataGridRowPrimary>
    ),
    enableHiding: false,
    enableSorting: primaryColumn ? isSortableField(primaryColumn.field) : true,
    size: PRIMARY_COLUMN_SIZE,
    meta: {
      headerTitle: columnLabel(primaryColumn?.field, primaryAccessor),
    },
  };

  const status: DataGridColumnDef<GridRow>[] = hasDrafts
    ? [
        {
          id: "_status",
          accessorFn: (row) => row.doc._status,
          header: ({ column }) => (
            <DataGridColumnHeader column={column} title="Status" />
          ),
          cell: ({ row }) => <DocumentStatusBadge doc={row.original.doc} />,
          enableHiding: false,
          size: STATUS_COLUMN_SIZE,
          meta: { headerTitle: "Status" },
        },
      ]
    : [];

  // Drafts collections get one status badge column; Payload's own
  // `_status` column would repeat it as plain text.
  const rest = columns
    .filter(
      (column) =>
        isDataColumn(column) &&
        column.accessor !== primaryAccessor &&
        !(hasDrafts && column.accessor === "_status"),
    )
    .map<DataGridColumnDef<GridRow>>((payloadColumn) => {
      const label = gridColumnTitle(payloadColumn, relationshipOptions);
      const named = isNamedReferenceColumn(
        payloadColumn.accessor,
        relationshipOptions,
      );
      return {
        id: payloadColumn.accessor,
        accessorFn: (row) => row.doc[payloadColumn.accessor],
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            // Payload sorts a named reference column by the stored ID, which
            // does not follow the names shown, so an active sort says so.
            title={named && column.getIsSorted() ? `${label} (by ID)` : label}
          />
        ),
        cell: ({ row }) => (
          <PayloadCell
            column={payloadColumn}
            row={row.original}
            relationshipOptions={relationshipOptions}
          />
        ),
        enableSorting: isSortableField(payloadColumn.field),
        size: gridColumnSizeWithHeading(
          payloadColumn.field,
          payloadColumn.accessor,
          label,
          isSortableField(payloadColumn.field),
        ),
        meta: { headerTitle: label },
      };
    });

  return [primary, ...status, ...rest];
}

/**
 * A muted line under a card title. Not ItemDescription: that is a `<p>`, and
 * Payload's rendered cells can be block elements, which a paragraph cannot
 * hold (a hydration error in React).
 */
function CardLine({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm leading-normal text-muted-foreground">
      {children}
    </div>
  );
}

function MobileRow({
  row,
  secondary,
  meta,
  listPath,
  useAsTitle,
  relationshipOptions,
  selectable = false,
}: {
  row: DataGridRow<GridRow>;
  secondary: PayloadListColumn | undefined;
  /**
   * Loaded relationship labels (tenant, author…). Cards read them directly:
   * Payload's lazy relationship cell prints "<No Tenant>" until it loads.
   */
  relationshipOptions: RelationshipFilterOptions;
  /** Shows the row's selection checkbox (bulk actions are available). */
  selectable?: boolean;
  /**
   * Labelled meta lines: the column the list is sorted by (when the card does
   * not show it yet) and identifying context such as the tenant.
   */
  meta: readonly PayloadListColumn[];
  listPath: string;
  useAsTitle: string;
}) {
  const { doc, id } = row.original;
  const thumbnail = resolveDocumentThumbnail(doc);
  return (
    <Item variant="outline" size="sm" render={<div />}>
      {selectable ? (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label={`Select ${documentTitle(doc, useAsTitle)}`}
        />
      ) : null}
      {thumbnail ? (
        <ItemMedia variant="image">
          <Image alt="" src={thumbnail} width={40} height={40} unoptimized />
        </ItemMedia>
      ) : null}
      <ItemContent className="min-w-0">
        <ItemTitle className="w-full">
          <DataGridRowPrimary
            render={<Link href={`${listPath}/${encodeURIComponent(id)}`} />}
          >
            {/* Two lines on a narrow card, so the title's end still shows. */}
            <span className="line-clamp-2 break-words">
              {documentTitle(doc, useAsTitle)}
            </span>
          </DataGridRowPrimary>
        </ItemTitle>
        {secondary ? (
          <CardLine>
            <span className="block truncate">
              <PayloadCell
                column={secondary}
                row={row.original}
                relationshipOptions={relationshipOptions}
              />
            </span>
          </CardLine>
        ) : null}
        {meta.map((column) => {
          const label =
            columnFieldType(column.field) === "relationship"
              ? relationshipLabel(
                  doc[column.accessor],
                  relationshipOptions[column.accessor],
                )
              : null;
          return (
            <CardLine key={column.accessor}>
              {/* The value wraps under its label on narrow cards rather than
                  cutting a date or tenant short. */}
              <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-xs">
                <span className="shrink-0">
                  {gridColumnTitle(column, relationshipOptions)}
                </span>
                <span
                  data-slot="card-meta-value"
                  className="min-w-0 break-words text-foreground"
                >
                  {label ?? (
                    <PayloadCell
                      column={column}
                      row={row.original}
                      relationshipOptions={relationshipOptions}
                    />
                  )}
                </span>
              </span>
            </CardLine>
          );
        })}
      </ItemContent>
      <ItemActions>
        <DocumentStatusBadge doc={doc} />
      </ItemActions>
    </Item>
  );
}

function GridEmptyState({
  createHref,
  createLabel,
  filtered,
  onClear,
  title,
  trash = false,
  trashEnabled = false,
}: {
  createHref?: string | null;
  createLabel?: string;
  filtered: boolean;
  onClear: () => void;
  title: string;
  trash?: boolean;
  trashEnabled?: boolean;
}) {
  const noun = title.toLowerCase();
  if (trash && !filtered) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Trash2 aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            {trashEnabled ? "Trash is empty" : "Trash isn't turned on"}
          </EmptyTitle>
          <EmptyDescription>
            {trashEnabled
              ? `Deleted ${noun} appear here until they are restored or deleted permanently.`
              : `Deleting one of these ${noun} removes it permanently.`}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  if (filtered) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No matching {noun}</EmptyTitle>
          <EmptyDescription>
            Try a different search or clear the filters.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        </EmptyContent>
      </Empty>
    );
  }
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileSearch aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No {noun} yet</EmptyTitle>
        <EmptyDescription>
          {createHref
            ? `Create the first one to see it here.`
            : `Documents will appear here once they exist.`}
        </EmptyDescription>
      </EmptyHeader>
      {createHref && createLabel ? (
        <EmptyContent>
          <Link
            href={createHref}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Plus aria-hidden="true" />
            {createLabel}
          </Link>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

/**
 * A Payload collection list rendered with Core's ReUI grid. Payload stays the
 * source of truth: rows, totals and field-aware cells come from its list
 * query and column state, and every sort, page, size, search, filter and
 * column change goes back through Payload's own handlers (URL + preferences).
 */
export function NativeCollectionGrid({
  title,
  useAsTitle,
  hasDrafts,
  listPath,
  createHref,
  createLabel,
  fields,
  groupedTable,
  groupedData,
  trash = false,
  trashEnabled = false,
  bulk = null,
  singularTitle,
}: NativeCollectionGridProps) {
  const {
    data,
    defaultSort,
    handlePageChange,
    handlePerPageChange,
    handleSearchChange,
    handleSortChange,
    handleWhereChange,
    hasActiveFilters,
    query,
    refineListData,
  } = useListQuery();
  const {
    columns: payloadColumns,
    setActiveColumns,
    setColumns,
  } = useTableColumns();
  const { isTransitioning } = useRouteTransition();
  const router = useRouter();
  const filtersId = useId();
  const [filtersOpen, setFiltersOpen] = useState(() =>
    Boolean(hasActiveFilters),
  );
  // The data object a refinement was requested from; loading lasts until
  // Payload's server render replaces it.
  const [refiningFrom, setRefiningFrom] = useState<unknown>(null);

  const columns = (payloadColumns ?? []) as PayloadListColumn[];
  const dataColumns = columns.filter(isDataColumn);
  const primaryAccessor = dataColumns.some(
    (column) => column.accessor === useAsTitle,
  )
    ? useAsTitle
    : (dataColumns[0]?.accessor ?? useAsTitle);

  const rows: GridRow[] = (data?.docs ?? []).map((doc, index) => {
    const record = doc as Record<string, unknown>;
    return { id: String(record.id), index, doc: record };
  });
  const totalDocs = data?.totalDocs ?? 0;
  const pagination: PaginationState = {
    pageIndex: Math.max((data?.page ?? 1) - 1, 0),
    pageSize: data?.limit ?? Number(query?.limit ?? PAGE_SIZES[0]),
  };
  // Cells also name the missionary or fund behind a reference ID.
  const referenceLabels = useReferenceLabels(
    dataColumns.map((column) => column.accessor),
  );
  // Payload's order when no column is chosen: the collection's default sort,
  // else newest first.
  const fallbackSort =
    typeof defaultSort === "string" && defaultSort
      ? defaultSort
      : PAYLOAD_FALLBACK_SORT;
  const sorting: SortingState = parsePayloadSort(query?.sort);
  const currentSort = toPayloadSort(sorting);
  const sortDefault = {
    label: defaultSortLabel(fallbackSort),
    active: currentSort === null || currentSort === fallbackSort,
  };
  const columnVisibility: ColumnVisibility = {
    ...visibilityFromColumns(dataColumns),
    [primaryAccessor]: true,
    ...(hasDrafts ? { _status: true } : {}),
  };
  const search = typeof query?.search === "string" ? query.search : "";
  const whereCount = countWhereConditions(query?.where);
  const filtered = search.length > 0 || whereCount > 0;

  const refine = (run: (() => Promise<void>) | undefined) => {
    if (!run) return;
    setRefiningFrom(data ?? null);
    void run();
  };
  // Filters: Core's shared builder edits local state; complete conditions
  // reach Payload's query (URL + server render) after a short pause, so
  // typing a value does not re-render the list on every keystroke.
  // Relationship fields (Tenant…) filter by the related document; their
  // options load from Payload with the viewer's access.
  const relationshipOptions = useRelationshipFilterOptions(fields);
  // With one organization every row names the same one, so the grid and its
  // cards leave that column out; it stays in Payload's saved columns, the
  // filters and Group by, and returns once there is a second organization.
  const soleOrganizationColumns = new Set(
    filterableRelationships(fields)
      .filter(
        ({ name, relationTo }) =>
          relationTo === "tenants" && relationshipOptions[name]?.length === 1,
      )
      .map(({ name }) => name),
  );
  const shownColumns = dataColumns.filter(
    (column) => !soleOrganizationColumns.has(column.accessor),
  );
  // Reference columns keep Payload's text filter on the stored ID.
  const cellLabels = useMemo(
    () => ({ ...relationshipOptions, ...referenceLabels }),
    [relationshipOptions, referenceLabels],
  );
  const filterFields = useMemo(
    () => payloadFilterFields(fields, { hasDrafts, relationshipOptions }),
    [fields, hasDrafts, relationshipOptions],
  );
  const groupByFields = useMemo(
    () => payloadGroupByFields(fields, { hasDrafts }),
    [fields, hasDrafts],
  );
  const groupBy = typeof query?.groupBy === "string" ? query.groupBy : "";
  const [filterState, setFilterState] = useState<AdvancedFilterState>(() =>
    whereToFilterState(query?.where, filterFields),
  );
  const pendingWhere = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (pendingWhere.current) clearTimeout(pendingWhere.current);
    },
    [],
  );
  const whereEditable =
    whereCount === 0 || canEditWhere(query?.where, filterFields);
  const appliedWhere = JSON.stringify(
    whereCount > 0 ? (query?.where ?? {}) : {},
  );
  const changeFilters = (next: AdvancedFilterState) => {
    setFilterState(next);
    if (pendingWhere.current) clearTimeout(pendingWhere.current);
    const where = filterStateToWhere(next, filterFields);
    if (JSON.stringify(where) === appliedWhere) return;
    pendingWhere.current = setTimeout(() => {
      pendingWhere.current = null;
      refine(() => handleWhereChange?.(where) ?? Promise.resolve());
    }, 400);
  };

  // Trashed documents open Payload's trash document view (restore, delete
  // permanently), not the editor.
  const rowPath = trash ? `${listPath}/trash` : listPath;
  const baseColumns = useGridColumns({
    columns: shownColumns,
    hasDrafts,
    listPath: rowPath,
    primaryAccessor,
    useAsTitle,
    relationshipOptions: cellLabels,
  });

  // Selection drives Payload's own selection (SelectionProvider), so its bulk
  // actions (edit, publish, unpublish, delete many) act on these documents.
  // Payload's own grouped tables (the fallback) carry their own checkboxes,
  // and trash has its own actions.
  const selection = useSelection();
  const usesPayloadGroupedTables =
    groupBy !== "" && groupedData == null && groupedTable != null;
  const selectable = bulk !== null && !trash && !usesPayloadGroupedTables;
  const gridColumns = useMemo(
    () =>
      selectable
        ? [
            createDataGridSelectionColumn<GridRow>({
              getRowLabel: (row) => documentTitle(row.doc, useAsTitle),
            }),
            ...baseColumns,
          ]
        : baseColumns,
    [baseColumns, selectable, useAsTitle],
  );
  // Column order is Payload's (saved with its column preferences). The
  // selection, title and status columns stay first; the others move from
  // the View panel, one step at a time.
  const isFixedColumn = (id: string) =>
    id === "select" || id === primaryAccessor || id === "_status";
  const movableIds = gridColumns
    .map((column) => column.id ?? "")
    .filter((id) => id && !isFixedColumn(id));
  const moveColumn = (id: string, direction: "up" | "down") => {
    const from = movableIds.indexOf(id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from === -1 || to < 0 || to >= movableIds.length) return;
    const order = [...movableIds];
    [order[from], order[to]] = [order[to]!, order[from]!];
    const movable = new Set(order);
    const byAccessor = new Map(
      columns.map((column) => [column.accessor, column]),
    );
    let next = 0;
    const reordered = columns.map((column) =>
      movable.has(column.accessor)
        ? (byAccessor.get(order[next++]!) ?? column)
        : column,
    );
    void setColumns(reordered as never);
  };
  const rowSelection: RowSelectionState = selectable
    ? Object.fromEntries(
        rows
          .filter((row) => selection.selected.get(row.doc.id as never))
          .map((row) => [row.id, true]),
      )
    : {};

  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns: gridColumns,
    getRowId: (row) => row.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: totalDocs,
    enableRowSelection: selectable,
    state: { pagination, sorting, columnVisibility, rowSelection },
    onRowSelectionChange: (updater) => {
      const next = resolveUpdater(updater, rowSelection);
      for (const row of rows) {
        if (Boolean(next[row.id]) !== Boolean(rowSelection[row.id])) {
          selection.setSelection(row.doc.id as never);
        }
      }
    },
    onPaginationChange: (updater) => {
      const next = resolveUpdater(updater, pagination);
      if (next.pageSize !== pagination.pageSize) {
        refine(() => handlePerPageChange?.(next.pageSize) ?? Promise.resolve());
      } else if (next.pageIndex !== pagination.pageIndex) {
        refine(
          () => handlePageChange?.(next.pageIndex + 1) ?? Promise.resolve(),
        );
      }
    },
    onSortingChange: (updater) => {
      const next = resolveUpdater<SortingState>(updater, sorting);
      const sort = toPayloadSort(next) ?? fallbackSort;
      refine(() => handleSortChange?.(sort) ?? Promise.resolve());
    },
    onColumnVisibilityChange: (updater) => {
      const next = resolveUpdater(updater, columnVisibility);
      void setActiveColumns(
        activeAccessors(dataColumns, next, primaryAccessor),
      );
    },
  });

  // One refinement: Payload merges each call into the render-time query, so
  // clearing search and filters in two calls would restore the old search.
  const clearFilters = () => {
    if (pendingWhere.current) clearTimeout(pendingWhere.current);
    pendingWhere.current = null;
    setFilterState(createEmptyFilterState());
    refine(() => refineListData({ search: undefined, where: {} }));
  };

  // The card's second line: the address when there is one, else the last
  // update, else the next visible column.
  const visibleOthers = shownColumns.filter(
    (column) => column.accessor !== primaryAccessor && column.active,
  );
  const secondaryColumn =
    visibleOthers.find((column) => column.accessor === "slug") ??
    visibleOthers.find((column) => column.accessor === "updatedAt") ??
    visibleOthers[0];
  // Sorting by a value the card leaves out (tenant, a date) adds it as the
  // card's meta line, so the order the cards are in can be seen. Status is
  // already the card's badge.
  const sortedColumn = sortDefault.active
    ? undefined
    : visibleOthers.find(
        (column) =>
          column.accessor === sorting[0]?.id &&
          column.accessor !== secondaryColumn?.accessor &&
          !(hasDrafts && column.accessor === "_status"),
      );
  // Records with the same title differ by tenant, so a shown Tenant column
  // stays on the card.
  const tenantColumn = visibleOthers.find(
    (column) =>
      column.accessor === "tenant" &&
      column.accessor !== secondaryColumn?.accessor &&
      column.accessor !== sortedColumn?.accessor,
  );
  // When the slug is the card's second line, "Updated" still shows, as it
  // does in the table.
  const updatedColumn = visibleOthers.find(
    (column) =>
      column.accessor === "updatedAt" &&
      column.accessor !== secondaryColumn?.accessor &&
      column.accessor !== sortedColumn?.accessor,
  );
  const cardMeta = [sortedColumn, tenantColumn, updatedColumn].filter(
    (column): column is PayloadListColumn => column !== undefined,
  );
  const pageSizes = PAGE_SIZES.includes(pagination.pageSize)
    ? PAGE_SIZES
    : [...PAGE_SIZES, pagination.pageSize].sort((a, b) => a - b);
  const noun = title.toLowerCase();

  // Payload groups on the server; while grouped, one grid per group (or
  // Payload's own tables, without grouped data) replaces the flat grid
  // under the same toolbar.
  const grouped =
    groupBy !== "" && (groupedData != null || groupedTable != null);
  const toolbar = (
    <>
      <DataGridSearch
        label={`Search ${noun}`}
        placeholder={`Search ${noun}…`}
        value={search}
        debounceMs={300}
        onValueChange={(value) =>
          refine(() => handleSearchChange?.(value) ?? Promise.resolve())
        }
      />
      {/* When filters hide every document the empty state offers Clear
          filters; a second Reset here would do the same thing. */}
      <DataGridResetFilters
        visible={filtered && !(data && totalDocs === 0)}
        onReset={clearFilters}
      />
      <DataGridToolbarSpacer />
      <Button
        variant="outline"
        size="sm"
        aria-expanded={filtersOpen}
        // The filter group only exists while open; never point at nothing.
        aria-controls={filtersOpen ? filtersId : undefined}
        onClick={() => setFiltersOpen((open) => !open)}
      >
        <ListFilter aria-hidden="true" />
        Filters
        {whereCount > 0 ? <Badge variant="outline">{whereCount}</Badge> : null}
      </Button>
      <GridGroupByMenu
        fields={groupByFields}
        groupBy={groupBy}
        onGroupByChange={(next) =>
          refine(() => refineListData({ groupBy: next, page: 1 }))
        }
      />
      {/* Sort and columns apply to Payload's grouped tables too. */}
      <GridSortMenu
        table={table}
        defaultSort={sortDefault}
        sortLabel={(id) => referenceSortTitle(dataColumns, id, cellLabels)}
      />
      <GridViewMenu
        columns={table
          .getAllColumns()
          .filter((column) => column.id !== "select")
          .map((column) => ({
            id: column.id,
            label:
              (column.columnDef.meta as { headerTitle?: string } | undefined)
                ?.headerTitle ?? column.id,
            visible: column.getIsVisible(),
            canHide: column.getCanHide() && column.id !== primaryAccessor,
            movable: !isFixedColumn(column.id),
          }))}
        onToggle={(id, visible) =>
          table.getColumn(id)?.toggleVisibility(visible)
        }
        onMove={moveColumn}
      />
      {filtersOpen ? (
        <div
          id={filtersId}
          role="group"
          aria-label={`Filter ${noun}`}
          data-web-studio-where-builder=""
          className="w-full basis-full border-t pt-3"
        >
          {whereEditable ? (
            // Payload's where is an OR of AND groups, so the builder edits
            // groups ("(A and B) or C"), as Payload's own filter did.
            <FilterBuilder
              allowGroups
              variant="inline"
              fields={filterFields}
              value={filterState}
              onChange={changeFilters}
            />
          ) : (
            // A filter from a link or a saved preference the builder
            // cannot show exactly: editing it would change its meaning.
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                This list is filtered in a way the filter panel can&apos;t show.
                Clear the filters to build new ones.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </>
  );

  // Without trash nothing can ever be listed here, so the search, filters,
  // grouping and pagination would only be dead controls around the message.
  if (trash && !trashEnabled) {
    return (
      <Card className="min-w-0" aria-label={title}>
        <CardContent>
          <GridEmptyState
            trash
            trashEnabled={false}
            createHref={null}
            createLabel={createLabel}
            filtered={false}
            onClear={clearFilters}
            title={title}
          />
        </CardContent>
      </Card>
    );
  }

  // Payload's bulk actions for the selection, from the grid's checkboxes or
  // (grouped) Payload's own table checkboxes: both use its SelectionProvider.
  const selectionBar =
    bulk !== null && !trash ? (
      <DataGridSelectionBar
        count={selection.count ?? 0}
        noun={(singularTitle ?? title.replace(/s$/, "")).toLowerCase()}
        onClear={() => selection.toggleAll()}
      >
        <GridBulkActions bulk={bulk} onDeleted={() => router.refresh()} />
      </DataGridSelectionBar>
    ) : undefined;

  const renderCard = (row: DataGridRow<GridRow>) => (
    <MobileRow
      row={row}
      selectable={selectable}
      secondary={secondaryColumn}
      meta={cardMeta}
      listPath={rowPath}
      useAsTitle={useAsTitle}
      relationshipOptions={cellLabels}
    />
  );

  if (grouped && groupedData) {
    return (
      <div className="flex min-w-0 flex-col gap-6">
        {selectionBar}
        {/* In a card, as the toolbar is above the flat list. */}
        <Card className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 px-4">
            {toolbar}
          </div>
        </Card>
        {groupedData.length === 0 ? (
          <Card className="min-w-0">
            <CardContent>
              <GridEmptyState
                trash={trash}
                trashEnabled={trashEnabled}
                createHref={trash ? null : createHref}
                createLabel={createLabel}
                filtered={filtered}
                onClear={clearFilters}
                title={title}
              />
            </CardContent>
          </Card>
        ) : (
          groupedData.map((group) => (
            <GroupGrid
              key={group.value}
              group={group}
              title={title}
              columns={gridColumns}
              columnVisibility={columnVisibility}
              sorting={sorting}
              selectable={selectable}
              isLoading={refiningFrom === data && isTransitioning}
              renderCard={renderCard}
              onSortingChange={(next) => {
                const sort = toPayloadSort(next) ?? fallbackSort;
                refine(() => handleSortChange?.(sort) ?? Promise.resolve());
              }}
              onPageChange={(page, limit) =>
                refine(() =>
                  refineListData({
                    queryByGroup: { [group.value]: { page, limit } },
                  } as never),
                )
              }
            />
          ))
        )}
      </div>
    );
  }

  if (grouped) {
    return (
      <Card className="min-w-0" aria-label={`${title}, grouped`}>
        {/* Phones: Payload's tables get the card's full width. */}
        <CardContent className="flex flex-col gap-4 px-2 sm:px-4">
          {selectionBar}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {toolbar}
          </div>
          <div
            data-web-studio-grouped-list=""
            className="min-w-0 overflow-x-auto"
          >
            {groupedTable}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DataGridPanel
      // Cards when the visible columns would not fit (a 1024px window), so
      // Updated at is never clipped behind a sideways scroll.
      view="auto"
      table={table}
      recordCount={totalDocs}
      label={title}
      isLoading={refiningFrom === data && isTransitioning}
      // Columns size to their content (Payload decides which are shown), so
      // the name gets the room and short values never stretch.
      tableLayout={{ width: "auto" }}
      // Retry asks Payload for the same list again; clearing the search
      // and filters stays its own named control ("Reset" in the toolbar).
      error={
        data
          ? null
          : {
              title: `Couldn't load ${noun}`,
              message: filtered
                ? "This search or filter couldn't be applied. Reset it to see every document, or retry."
                : "Payload didn't return this list. Retry, or reload the page.",
              onRetry: () => router.refresh(),
            }
      }
      pagination={{ sizes: pageSizes }}
      selectionBar={selectionBar}
      renderMobileRow={renderCard}
      empty={
        <GridEmptyState
          trash={trash}
          trashEnabled={trashEnabled}
          createHref={trash ? null : createHref}
          createLabel={createLabel}
          filtered={filtered}
          onClear={clearFilters}
          title={title}
        />
      }
      toolbar={toolbar}
    />
  );
}

/**
 * One group of a grouped list on Core's grid: its heading and count, the
 * same columns, sort and selection as the flat list, cards on narrow
 * panels, and its own pages through Payload's per-group query.
 */
function GroupGrid({
  group,
  title,
  columns,
  columnVisibility,
  sorting,
  selectable,
  isLoading,
  renderCard,
  onSortingChange,
  onPageChange,
}: {
  group: ListViewGroup;
  title: string;
  columns: DataGridColumnDef<GridRow>[];
  columnVisibility: ColumnVisibility;
  sorting: SortingState;
  selectable: boolean;
  isLoading: boolean;
  renderCard: (row: DataGridRow<GridRow>) => ReactNode;
  onSortingChange: (next: SortingState) => void;
  onPageChange: (page: number, limit: number) => void;
}) {
  const headingId = useId();
  const selection = useSelection();
  const docs = (group.data?.docs ?? []) as Record<string, unknown>[];
  // index -1: Payload rendered no cells for grouped rows.
  const rows: GridRow[] = docs.map((doc) => ({
    id: String(doc.id),
    index: -1,
    doc,
  }));
  const total = group.data?.totalDocs ?? rows.length;
  const limit = group.data?.limit ?? Math.max(rows.length, 1);
  const pagination: PaginationState = {
    pageIndex: Math.max((group.data?.page ?? 1) - 1, 0),
    pageSize: limit,
  };
  const rowSelection: RowSelectionState = selectable
    ? Object.fromEntries(
        rows
          .filter((row) => selection.selected.get(row.doc.id as never))
          .map((row) => [row.id, true]),
      )
    : {};
  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns,
    getRowId: (row) => row.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: total,
    enableRowSelection: selectable,
    state: { pagination, sorting, columnVisibility, rowSelection },
    onRowSelectionChange: (updater) => {
      const next = resolveUpdater(updater, rowSelection);
      for (const row of rows) {
        if (Boolean(next[row.id]) !== Boolean(rowSelection[row.id])) {
          selection.setSelection(row.doc.id as never);
        }
      }
    },
    onPaginationChange: (updater) => {
      const next = resolveUpdater(updater, pagination);
      if (next.pageSize !== pagination.pageSize) {
        onPageChange(1, next.pageSize);
      } else if (next.pageIndex !== pagination.pageIndex) {
        onPageChange(next.pageIndex + 1, next.pageSize);
      }
    },
    onSortingChange: (updater) => {
      onSortingChange(resolveUpdater<SortingState>(updater, sorting));
    },
  });
  const sizes = PAGE_SIZES.includes(limit)
    ? PAGE_SIZES
    : [...PAGE_SIZES, limit].sort((a, b) => a - b);

  return (
    <section aria-labelledby={headingId} className="min-w-0">
      <DataGridPanel
        view="auto"
        table={table}
        recordCount={total}
        label={`${title}: ${group.heading}`}
        isLoading={isLoading}
        // The heading is the card's top row (no empty band above the
        // column headers), and fixed widths line every group's columns up.
        toolbar={
          <h3
            id={headingId}
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            {group.heading}
            <Badge variant="secondary">{total.toLocaleString("en-US")}</Badge>
          </h3>
        }
        tableLayout={{ width: "fixed" }}
        pagination={total > limit ? { sizes } : false}
        renderMobileRow={renderCard}
      />
    </section>
  );
}
