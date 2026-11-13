"use client";

import { useIsMobile } from "@asym/lib/hooks/use-mobile";
import { AlertCircle, RotateCw } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@asym/ui/lib/utils";

import { DataGridPanelLayoutContext } from "./data-grid-panel-layout";
import { handleDataGridRowKeyDown } from "./data-grid-row-keyboard";
import { DataGrid, DataGridContainer } from "../reui/data-grid/data-grid";
import { DataGridPagination } from "../reui/data-grid/data-grid-pagination";
import { DataGridScrollArea } from "../reui/data-grid/data-grid-scroll-area";
import { DataGridTable } from "../reui/data-grid/data-grid-table";
import { DataGridTableVirtual } from "../reui/data-grid/data-grid-table-virtual";
import { Button } from "../shadcn/button";
import { Card } from "../shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../shadcn/empty";
import { Skeleton } from "../shadcn/skeleton";
import { Spinner } from "../shadcn/spinner";

import type { Row, Table } from "./data-grid-engine";
import type {
  DataGridFeatures,
  DataGridProps,
} from "../reui/data-grid/data-grid";
import type { ReactNode, RefObject } from "react";

type DataGridPanelLayout = NonNullable<
  DataGridProps<DataGridFeatures, object>["tableLayout"]
>;

export interface DataGridPanelError {
  title?: string;
  message: string;
  onRetry?: () => void;
  /**
   * Name of the error action; defaults to "Retry". Use it when the action
   * does something else, e.g. "Clear filters".
   */
  retryLabel?: string;
}

/**
 * Controls inside a row that act on their own. A click that starts on one
 * of them must not also open the row (`onRowClick`): a row menu trigger
 * would otherwise open the record and its modal would close the menu.
 */
const ROW_INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  '[role="button"]',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="switch"]',
  '[contenteditable="true"]',
].join(",");

function startsOnRowControl(target: EventTarget | null) {
  const element = target as Element | null;
  if (typeof element?.closest !== "function") return false;
  const control = element.closest(ROW_INTERACTIVE_SELECTOR);
  return Boolean(control && control.closest("tr, li"));
}

export interface DataGridPanelVirtualOptions {
  /** Estimated row height in pixels; match the real row to avoid jumps. */
  estimateSize?: number;
  /** Fixed scroll height for the grid body (sticky header scrolls inside). */
  height?: number | string;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onFetchMore?: () => void;
  fetchingMoreMessage?: ReactNode;
  allRowsLoadedMessage?: ReactNode;
}

export interface DataGridPanelProps<TData extends object> {
  /** TanStack v9 table built with `dataGridFeatures`. */
  table: Table<DataGridFeatures, TData>;
  /** Total records for the pagination summary (server total when paged). */
  recordCount: number;
  /**
   * Accessible name of the data region, e.g. "CRM records". It also names
   * the card list. When `labelledBy` is set, the region takes its name
   * from that element instead.
   */
  label: string;
  /** Id of a visible heading that names the region (aria-labelledby). */
  labelledBy?: string;
  /** Search, filters and view controls rendered above the grid. */
  toolbar?: ReactNode;
  /** Shown above the toolbar while rows are selected (bulk actions). */
  selectionBar?: ReactNode;
  isLoading?: boolean;
  /** Replaces the grid with an inline error and optional retry. */
  error?: DataGridPanelError | null;
  /** Empty state rendered inside the grid when there are no rows. */
  empty?: ReactNode;
  onRowClick?: (row: TData) => void;
  /** Client or manual pagination below the grid; omit for one long list. */
  pagination?: boolean | { sizes?: number[] };
  /** Virtualized body with optional infinite loading. */
  virtual?: DataGridPanelVirtualOptions;
  /**
   * Below the md breakpoint, rows render as this card instead of a table
   * row. Each card should include one `DataGridRowPrimary` control.
   */
  renderMobileRow?: (row: Row<DataGridFeatures, TData>) => ReactNode;
  /**
   * "list" renders the `renderMobileRow` cards at every width, as a
   * responsive grid of cards from md up. Pair it with `DataGridViewToggle`.
   * "auto" shows the table while its visible columns fit the panel and the
   * cards when they would not, so no column hides behind a sideways scroll.
   * Defaults to "table", which shows cards only below md.
   */
  view?: "table" | "list" | "auto";
  /**
   * "balanced" fits up to three cards per row from xl, widening trailing
   * pairs (or a sole result) to fill the row. At md, an odd last card fills
   * both columns. Defaults to two columns from md and three from 2xl.
   * Only applies while cards render; uses the displayed rows, not recordCount.
   */
  cardLayout?: "default" | "balanced";
  /** Extra table layout flags (dense, sticky header, pinning, ...). */
  tableLayout?: DataGridPanelLayout;
  /** Content below the grid inside the card (e.g. a totals line). */
  footer?: ReactNode;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The element's width, measured before paint and kept up to date. */
function usePanelWidth<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled: boolean,
) {
  const [width, setWidth] = useState<number | null>(null);
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const update = (next: number) => {
      if (next > 0) setWidth(Math.round(next));
    };
    update(element.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries.find((candidate) => candidate.target === element);
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, ref]);
  return width;
}

function DataGridPanelErrorState({ error }: { error: DataGridPanelError }) {
  return (
    <div role="alert" className="mx-4 rounded-lg border border-dashed">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>{error.title ?? "Couldn't load records"}</EmptyTitle>
          <EmptyDescription>{error.message}</EmptyDescription>
        </EmptyHeader>
        {error.onRetry ? (
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={error.onRetry}>
              <RotateCw />
              {error.retryLabel ?? "Retry"}
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    </div>
  );
}

function DataGridPanelMobileList<TData extends object>({
  table,
  label,
  isLoading,
  empty,
  renderMobileRow,
  virtual,
  cards,
  cardLayout,
}: {
  table: Table<DataGridFeatures, TData>;
  label: string;
  isLoading?: boolean;
  empty?: ReactNode;
  renderMobileRow: (row: Row<DataGridFeatures, TData>) => ReactNode;
  virtual?: DataGridPanelVirtualOptions;
  /** Desktop card layout (list view) instead of the single phone column. */
  cards: boolean;
  cardLayout: DataGridPanelProps<TData>["cardLayout"];
}) {
  const rows = table.getRowModel().rows;
  const balancedCards = cards && cardLayout === "balanced";
  // A 3n + 1 result ends with two pairs rather than a stranded single card.
  const trailingPairCount = rows.length % 3 === 1 ? 4 : rows.length % 3;
  if (isLoading && rows.length === 0) {
    return (
      <div aria-busy="true" className="flex flex-col gap-2 px-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  if (rows.length === 0) {
    return <div className="px-4">{empty}</div>;
  }
  return (
    <div className="flex flex-col gap-3 px-4">
      <ul
        aria-label={label}
        className={
          cards
            ? cn(
                "grid grid-cols-1 gap-3 md:grid-cols-2",
                balancedCards ? "xl:grid-cols-6" : "2xl:grid-cols-3",
              )
            : "flex flex-col gap-2"
        }
      >
        {rows.map((row, index) => (
          <li
            key={row.id}
            data-slot="data-grid-panel-row"
            data-state={row.getIsSelected() ? "selected" : undefined}
            // A one-cell grid stretches the card to the row's height, so
            // cards side by side line up at the bottom. Its column is
            // minmax(0, 1fr): an implicit auto column would grow to a long
            // title's unwrapped width and push the card past its slot.
            className={
              cards
                ? cn(
                    "grid grid-cols-1",
                    balancedCards && [
                      rows.length % 2 === 1 &&
                        index === rows.length - 1 &&
                        "md:col-span-2",
                      rows.length === 1
                        ? "xl:col-span-6"
                        : index >= rows.length - trailingPairCount
                          ? "xl:col-span-3"
                          : "xl:col-span-2",
                    ],
                  )
                : undefined
            }
          >
            {renderMobileRow(row)}
          </li>
        ))}
      </ul>
      {virtual?.hasMore && virtual.onFetchMore ? (
        <Button
          variant="outline"
          size="sm"
          className="self-center"
          disabled={virtual.isFetchingMore}
          onClick={virtual.onFetchMore}
        >
          {virtual.isFetchingMore ? <Spinner /> : null}
          {virtual.isFetchingMore ? "Loading more" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Core's shared record grid: the ReUI data-grid inside a Maia Card, with the
 * toolbar above, pagination below, inline loading/empty/error states, a
 * mobile card list and roving keyboard navigation between row primaries.
 *
 * Composition follows ReUI c-data-grid-22 (CRUD admin in a Card).
 */
/** Core's sentence-case voice for ReUI's built-in labels. */
const PANEL_I18N = { labels: { toggleColumns: "Toggle columns" } };

export function DataGridPanel<TData extends object>({
  table,
  recordCount,
  label,
  labelledBy,
  toolbar,
  selectionBar,
  isLoading = false,
  error,
  empty,
  onRowClick,
  pagination = false,
  virtual,
  renderMobileRow,
  view = "table",
  cardLayout = "default",
  tableLayout,
  footer,
  className,
}: DataGridPanelProps<TData>) {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const panelWidth = usePanelWidth(
    sectionRef,
    view === "auto" && Boolean(renderMobileRow),
  );
  const columnsWidth = table
    .getVisibleLeafColumns()
    .reduce((sum, column) => sum + column.getSize(), 0);
  const columnsOverflow =
    view === "auto" && panelWidth !== null && columnsWidth > panelWidth;
  const showMobileList =
    Boolean(renderMobileRow) &&
    (isMobile === true || view === "list" || columnsOverflow);
  // No records means nothing to page through: no "0 - 0 of 0" pager.
  const showPagination = Boolean(pagination) && !error && recordCount > 0;
  // Set in the capture phase, read by the row's (bubble) click handler and
  // cleared once the click reaches the panel again.
  const clickStartedOnRowControl = useRef(false);
  const handleRowClick = onRowClick
    ? (row: TData) => {
        if (clickStartedOnRowControl.current) return;
        onRowClick(row);
      }
    : undefined;
  const enableRowSelection = Boolean(table.options.enableRowSelection);
  const paginationSizes =
    typeof pagination === "object" ? pagination.sizes : undefined;

  return (
    <DataGrid
      table={table}
      recordCount={recordCount}
      isLoading={isLoading}
      onRowClick={handleRowClick}
      emptyMessage={empty}
      fetchingMoreMessage={virtual?.fetchingMoreMessage}
      allRowsLoadedMessage={virtual?.allRowsLoadedMessage}
      i18n={PANEL_I18N}
      tableLayout={{
        headerBackground: true,
        headerSticky: Boolean(virtual),
        ...tableLayout,
      }}
    >
      <Card className={cn("min-w-0", className)}>
        <section
          ref={sectionRef}
          aria-label={labelledBy ? undefined : label}
          aria-labelledby={labelledBy}
          data-slot="data-grid-panel"
          className="flex min-w-0 flex-col gap-4"
          onClickCapture={(event) => {
            clickStartedOnRowControl.current = startsOnRowControl(event.target);
          }}
          onClick={() => {
            clickStartedOnRowControl.current = false;
          }}
          onKeyDown={(event) =>
            handleDataGridRowKeyDown(event, {
              onSelectAll: enableRowSelection
                ? () => table.toggleAllRowsSelected()
                : undefined,
            })
          }
        >
          {selectionBar}
          {toolbar ? (
            <div
              data-slot="data-grid-panel-toolbar"
              className="flex min-w-0 flex-wrap items-center gap-2 px-4"
            >
              {/* Column-only controls (View) read whether cards show. */}
              <DataGridPanelLayoutContext value={{ cards: showMobileList }}>
                {toolbar}
              </DataGridPanelLayoutContext>
            </div>
          ) : null}
          {error ? (
            <DataGridPanelErrorState error={error} />
          ) : showMobileList && renderMobileRow ? (
            <DataGridPanelMobileList
              table={table}
              label={label}
              isLoading={isLoading}
              empty={empty}
              renderMobileRow={renderMobileRow}
              virtual={virtual}
              cards={isMobile !== true}
              cardLayout={cardLayout}
            />
          ) : (
            // The bottom rule only separates the grid from pagination or a
            // footer. When the grid ends the card, the card edge closes it.
            <DataGridContainer
              className={cn(
                "border-t",
                (showPagination || Boolean(footer)) && "border-b",
              )}
            >
              {virtual ? (
                <DataGridTableVirtual
                  height={virtual.height}
                  estimateSize={virtual.estimateSize}
                  hasMore={virtual.hasMore}
                  isFetchingMore={virtual.isFetchingMore}
                  onFetchMore={virtual.onFetchMore}
                />
              ) : (
                <DataGridScrollArea orientation="horizontal">
                  <DataGridTable />
                </DataGridScrollArea>
              )}
            </DataGridContainer>
          )}
          {showPagination ? (
            <div data-slot="data-grid-panel-pagination" className="px-4">
              <DataGridPagination sizes={paginationSizes} />
            </div>
          ) : null}
          {footer ? <div className="px-4">{footer}</div> : null}
        </section>
      </Card>
    </DataGrid>
  );
}
