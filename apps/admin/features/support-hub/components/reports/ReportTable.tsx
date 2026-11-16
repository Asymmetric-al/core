"use client";

import { useMediaQuery } from "@asym/lib/hooks/use-mobile";
import {
  DataGridPanel,
  dataGridFeatures,
  useTable,
  type DataGridColumnDef,
  type SortingState,
} from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import { Label } from "@asym/ui/components/shadcn/label";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { useId, useMemo, useState } from "react";

import type {
  SupportReportBucket,
  SupportReportGroupBy,
  SupportReportSeries,
} from "../../types";

interface ReportTableProps {
  series: SupportReportSeries;
  /** What the table shows, e.g. "Conversations per agent". */
  caption: string;
  /** Column headers: what each row is, and what its number counts. */
  columns: [label: string, value: string];
  /** Formats a row's value; defaults to a plain count. */
  formatValue?: (bucket: SupportReportBucket) => string;
  /**
   * For a table of periods: offers "Hide days with no activity" (or weeks,
   * months). Wider screens list every period until someone turns it on;
   * phones start with it on, so a month is not 31 mostly empty rows. The
   * table says how many it hides; the chart and export keep them all.
   */
  periodUnit?: SupportReportGroupBy;
}

function defaultFormatValue(bucket: SupportReportBucket) {
  return bucket.value.toLocaleString("en-US");
}

/**
 * Tabular fallback for each chart, on Core's shared ReUI grid (as in the
 * Contributions and Funds grids). Always rendered alongside the chart so
 * screen reader users can navigate the same values without interacting
 * with Recharts SVG internals; the caption names the grid.
 */
export function ReportTable({
  series,
  caption,
  columns,
  formatValue = defaultFormatValue,
  periodUnit,
}: ReportTableProps) {
  const titleId = useId();
  const hideSwitchId = useId();
  // Until someone uses the switch, phones hide empty periods and wider
  // screens show them.
  const isPhone = useMediaQuery(PHONE_QUERY);
  const [hideEmptyChoice, setHideEmptyChoice] = useState<boolean | null>(null);
  const hideEmpty = hideEmptyChoice ?? isPhone;
  const emptyCount = periodUnit
    ? series.buckets.filter((bucket) => bucket.value === 0).length
    : 0;
  // Only when there is something to hide and something left to show.
  const canHideEmpty = emptyCount > 0 && emptyCount < series.buckets.length;
  const isHidingEmpty = canHideEmpty && hideEmpty;
  const rows = useMemo(
    () =>
      isHidingEmpty
        ? series.buckets.filter((bucket) => bucket.value !== 0)
        : series.buckets,
    [isHidingEmpty, series.buckets],
  );
  // No initial sort: the series order (a day axis, a ranking) stands until
  // someone sorts by a header.
  const [sorting, setSorting] = useState<SortingState>([]);
  const [labelTitle, valueTitle] = columns;
  const columnDefs = useMemo<DataGridColumnDef<SupportReportBucket>[]>(
    () => [
      {
        accessorKey: "label",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title={labelTitle} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.label}</span>
        ),
        size: 260,
        meta: { headerTitle: labelTitle },
      },
      {
        accessorKey: "value",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title={valueTitle} />
        ),
        cell: ({ row }) => (
          <span className="block text-right text-sm tabular-nums">
            {formatValue(row.original)}
          </span>
        ),
        size: 160,
        // Numbers right-aligned, as in the Contributions grid.
        meta: {
          headerTitle: valueTitle,
          headerClassName: "text-right [&>div]:justify-end [&>div]:-me-2",
        },
      },
    ],
    [labelTitle, valueTitle, formatValue],
  );
  const table = useTable({
    features: dataGridFeatures,
    // No pager: every row renders (the paginated row model would
    // otherwise stop at its default page of ten).
    manualPagination: true,
    data: rows,
    columns: columnDefs,
    getRowId: (bucket) => bucket.key,
    state: { sorting },
    onSortingChange: setSorting,
  });

  if (series.buckets.length === 0) {
    return null;
  }
  return (
    <DataGridPanel
      table={table}
      recordCount={rows.length}
      label={caption}
      labelledBy={titleId}
      // Two columns share the card's width instead of leaving a blank band.
      tableLayout={{ width: "auto" }}
      toolbar={
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p id={titleId} className="leading-none font-semibold">
            {caption}
          </p>
          {canHideEmpty && periodUnit ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {isHidingEmpty ? (
                <span className="text-xs text-muted-foreground" role="status">
                  {emptyCount} {pluralUnit(periodUnit, emptyCount)} with no
                  activity hidden
                </span>
              ) : null}
              <div className="flex items-center gap-2">
                <Switch
                  id={hideSwitchId}
                  checked={hideEmpty}
                  onCheckedChange={setHideEmptyChoice}
                />
                <Label htmlFor={hideSwitchId}>
                  Hide {pluralUnit(periodUnit, 2)} with no activity
                </Label>
              </div>
            </div>
          ) : null}
        </div>
      }
    />
  );
}

/** Below Tailwind's `sm` breakpoint. */
const PHONE_QUERY = "(max-width: 639px)";

function pluralUnit(unit: SupportReportGroupBy, count: number): string {
  return count === 1 ? unit : `${unit}s`;
}
