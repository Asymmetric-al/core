"use client";

import { formatCurrency } from "@asym/lib/utils";
import {
  DataGridPanel,
  DataGridSearch,
  DataGridSortSelect,
  dataGridFeatures,
  dataGridSortValue,
  useTable,
  type DataGridColumnDef,
  type DataGridRow,
  type PaginationState,
  type SortingState,
} from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Item, ItemContent } from "@asym/ui/components/shadcn/item";
import { format, parseISO } from "date-fns";
import { SearchX } from "lucide-react";
import { useId, useState } from "react";

import type { FundRow } from "./report-model";

// One decimal everywhere ("7.0%", "45.7%"), so shares line up.
const SHARE = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function money(amountCents: number) {
  return formatCurrency(amountCents / 100);
}

function lastGift(value: string | null) {
  return value ? format(parseISO(value), "MMM d, yyyy") : "—";
}

/** The first column names the grouping: Fund, Missionary or Donor. */
function labelColumn(singular: string): DataGridColumnDef<FundRow> {
  const title = singular.charAt(0).toUpperCase() + singular.slice(1);
  return {
    accessorKey: "label",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title={title} />
    ),
    cell: ({ row }) => (
      <span className="truncate text-sm font-medium">{row.original.label}</span>
    ),
    size: 260,
    meta: { headerTitle: singular },
  };
}

const VALUE_COLUMNS: DataGridColumnDef<FundRow>[] = [
  {
    accessorKey: "amountCents",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Giving" />
    ),
    cell: ({ row }) => (
      <span className="block text-right text-sm tabular-nums">
        {money(row.original.amountCents)}
      </span>
    ),
    size: 150,
    // Numbers right-aligned, as in the Contributions grid.
    meta: {
      headerTitle: "Giving",
      headerClassName: "text-right [&>div]:justify-end [&>div]:-me-2",
    },
  },
  {
    accessorKey: "share",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Share" />
    ),
    cell: ({ row }) => (
      <span className="block text-right text-sm tabular-nums text-muted-foreground">
        {SHARE.format(row.original.share)}
      </span>
    ),
    size: 100,
    // Numbers right-aligned, as in the Contributions grid.
    meta: {
      headerTitle: "Share",
      headerClassName: "text-right [&>div]:justify-end [&>div]:-me-2",
    },
  },
  {
    accessorKey: "giftCount",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Gifts" />
    ),
    cell: ({ row }) => (
      <span className="block text-right text-sm tabular-nums">
        {row.original.giftCount.toLocaleString("en-US")}
      </span>
    ),
    size: 100,
    // Numbers right-aligned, as in the Contributions grid.
    meta: {
      headerTitle: "Gifts",
      headerClassName: "text-right [&>div]:justify-end [&>div]:-me-2",
    },
  },
  {
    accessorKey: "donorCount",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Donors" />
    ),
    cell: ({ row }) => (
      <span className="block text-right text-sm tabular-nums">
        {row.original.donorCount.toLocaleString("en-US")}
      </span>
    ),
    size: 100,
    // Numbers right-aligned, as in the Contributions grid.
    meta: {
      headerTitle: "Donors",
      headerClassName: "text-right [&>div]:justify-end [&>div]:-me-2",
    },
  },
  {
    accessorKey: "lastGiftAt",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Last gift" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {lastGift(row.original.lastGiftAt)}
      </span>
    ),
    size: 140,
    meta: { headerTitle: "Last gift" },
  },
];

function FundMobileRow({ fund }: { fund: FundRow }) {
  return (
    <Item variant="outline" size="sm" render={<div />}>
      <ItemContent className="min-w-0 gap-1">
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          {/* Two lines before clipping: long fund names stay readable. */}
          <span className="line-clamp-2 min-w-0 text-sm font-medium break-words">
            {fund.label}
          </span>
          <span className="shrink-0 text-sm tabular-nums">
            {money(fund.amountCents)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {SHARE.format(fund.share)} of giving ·{" "}
          {fund.giftCount.toLocaleString("en-US")} gifts ·{" "}
          {fund.donorCount.toLocaleString("en-US")} donors
        </p>
        {/* As on desktop: when the fund last received a gift. */}
        <p className="text-xs text-muted-foreground">
          Last gift {lastGift(fund.lastGiftAt)}
        </p>
      </ItemContent>
    </Item>
  );
}

/** Phone sort choices; cards have no sortable column headers. */
const FUND_SORT_LABELS: Record<string, string> = {
  "amountCents:desc": "Giving: largest",
  "amountCents:asc": "Giving: smallest",
  "label:asc": "Fund: A–Z",
  "label:desc": "Fund: Z–A",
  "giftCount:desc": "Gifts: most",
  "giftCount:asc": "Gifts: fewest",
  "donorCount:desc": "Donors: most",
  "donorCount:asc": "Donors: fewest",
  "lastGiftAt:desc": "Last gift: newest",
  "lastGiftAt:asc": "Last gift: oldest",
};

/** Header sorts a wide screen can set, labelled if a phone shows them. */
const FUND_EXTRA_SORT_LABELS: Record<string, string> = {
  "share:desc": "Share: largest",
  "share:asc": "Share: smallest",
};

/** How the funds list reads in each sort, by "columnId:asc|desc". */
const FUND_SORT_ORDER: Record<string, string> = {
  "amountCents:desc": "largest giving first",
  "amountCents:asc": "smallest giving first",
  "share:desc": "largest share first",
  "share:asc": "smallest share first",
  "label:asc": "by name from A to Z",
  "label:desc": "by name from Z to A",
  "giftCount:desc": "most gifts first",
  "giftCount:asc": "fewest gifts first",
  "donorCount:desc": "most donors first",
  "donorCount:asc": "fewest donors first",
  "lastGiftAt:desc": "most recent gift first",
  "lastGiftAt:asc": "oldest last gift first",
};

/**
 * The line under the Funds heading, in the order the list is sorted now.
 * Unsorted (or a sort it does not know), it claims no order.
 */
export function fundsSortDescription(sorting: SortingState): string {
  const order = sorting[0]
    ? FUND_SORT_ORDER[dataGridSortValue(sorting, "")]
    : undefined;
  return order
    ? `Every fund with completed giving, ${order}.`
    : "Every fund with completed giving.";
}

/** Every fund with its exact giving; the charts above show the largest. */
export function FundsGrid({
  funds,
  headingId: headingIdProp,
  group = { singular: "fund", plural: "funds", title: "Funds" },
}: {
  group?: { singular: string; plural: string; title: string };
  funds: FundRow[];
  /** A stable id for the heading, so a link can jump to the list. */
  headingId?: string;
}) {
  const generatedHeadingId = useId();
  const headingId = headingIdProp ?? generatedHeadingId;
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "amountCents", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const query = search.trim().toLowerCase();
  const rows = funds.filter(
    (fund) => !query || fund.label.toLowerCase().includes(query),
  );
  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns: [labelColumn(group.singular), ...VALUE_COLUMNS],
    getRowId: (fund) => fund.id,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2
          id={headingId}
          tabIndex={-1}
          className="scroll-mt-20 text-lg font-semibold outline-none"
        >
          {group.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {fundsSortDescription(sorting)
            .replace("Every fund", `Every ${group.singular}`)
            .replace("completed giving", "net giving")}
        </p>
      </div>
      <DataGridPanel
        // Cards when the columns would not fit, not a sideways scroll.
        view="auto"
        table={table}
        recordCount={rows.length}
        label={group.title}
        labelledBy={headingId}
        // Columns share the panel's width instead of leaving a blank band
        // past Last gift on wide screens.
        tableLayout={{ width: "auto" }}
        pagination={rows.length > 10}
        renderMobileRow={(row: DataGridRow<FundRow>) => (
          <FundMobileRow fund={row.original} />
        )}
        toolbar={
          <>
            <DataGridSearch
              label={`Search ${group.plural}`}
              placeholder={`Search ${group.plural}…`}
              value={search}
              onValueChange={(value) => {
                setSearch(value);
                setPagination((previous) => ({ ...previous, pageIndex: 0 }));
              }}
            />
            <DataGridSortSelect
              whenCards
              label={`Sort ${group.plural}`}
              options={FUND_SORT_LABELS}
              extraOptions={FUND_EXTRA_SORT_LABELS}
              fallback="amountCents:desc"
              sorting={sorting}
              onSortingChange={(next) => {
                setSorting(next);
                setPagination((previous) => ({ ...previous, pageIndex: 0 }));
              }}
            />
          </>
        }
        empty={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>No {group.plural} match</EmptyTitle>
              <EmptyDescription>
                Try another {group.singular} name.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      />
    </div>
  );
}
