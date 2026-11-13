"use client";

import { useLocaleFormat } from "@asym/lib/hooks/use-locale-format";
import {
  DataGridPanel,
  DataGridRowPrimary,
  DataGridSearch,
  DataGridSortSelect,
  DataGridToolbarSpacer,
  dataGridFeatures,
  useTable,
  type DataGridColumnDef,
  type SortingState,
} from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@asym/ui/components/shadcn/empty";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@asym/ui/components/shadcn/item";
import Link from "next/link";
import { useState } from "react";

import type { MissionControlNeedsAttentionItem } from "@asym/database/hooks";

import {
  attentionUrgency,
  followUpLink,
  FOLLOW_UP_NOT_LINKED,
} from "@/features/mission-control/needs-attention/attention-vocabulary";

const URGENCY_ORDER = { critical: 0, high: 1, normal: 2 };
const SORT_OPTIONS = {
  "urgency:asc": "Most urgent first",
  "urgency:desc": "Least urgent first",
  "firstSeenAt:asc": "Oldest flagged first",
  "firstSeenAt:desc": "Newest flagged first",
  "summary:asc": "Follow-up A–Z",
  "summary:desc": "Follow-up Z–A",
};

function Urgency({ item }: { item: MissionControlNeedsAttentionItem }) {
  const urgency = attentionUrgency(item.urgency);
  return <Badge variant={urgency.variant}>{urgency.label}</Badge>;
}

function FirstFlagged({ item }: { item: MissionControlNeedsAttentionItem }) {
  const { formatDate } = useLocaleFormat();
  return (
    <time dateTime={item.firstSeenAt}>
      {formatDate(item.firstSeenAt, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}
    </time>
  );
}

function FollowUpAction({ item }: { item: MissionControlNeedsAttentionItem }) {
  const link = followUpLink(item);
  return link ? (
    <DataGridRowPrimary
      render={<Link href={link.href} />}
      className="text-sm underline underline-offset-4"
    >
      {link.label}
    </DataGridRowPrimary>
  ) : (
    <span className="text-sm text-muted-foreground">
      {FOLLOW_UP_NOT_LINKED}
    </span>
  );
}

const COLUMNS: DataGridColumnDef<MissionControlNeedsAttentionItem>[] = [
  {
    id: "summary",
    accessorKey: "summary",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Follow-up" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium">{row.original.summary}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.issueLabel}
        </span>
      </div>
    ),
    sortFn: "text",
    size: 340,
    meta: { headerTitle: "Follow-up" },
  },
  {
    id: "urgency",
    accessorFn: (item) => URGENCY_ORDER[item.urgency],
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Urgency" />
    ),
    cell: ({ row }) => <Urgency item={row.original} />,
    size: 125,
    meta: { headerTitle: "Urgency" },
  },
  {
    id: "firstSeenAt",
    accessorKey: "firstSeenAt",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="First flagged" />
    ),
    cell: ({ row }) => <FirstFlagged item={row.original} />,
    size: 150,
    meta: { headerTitle: "First flagged" },
  },
  {
    id: "action",
    header: "Next step",
    cell: ({ row }) => <FollowUpAction item={row.original} />,
    enableSorting: false,
    size: 240,
    meta: { headerTitle: "Next step" },
  },
];

export function FollowUpsGrid({
  items,
}: {
  items: MissionControlNeedsAttentionItem[];
}) {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "urgency", desc: false },
    { id: "firstSeenAt", desc: false },
  ]);
  const term = search.trim().toLocaleLowerCase();
  const filtered = items.filter((item) =>
    `${item.summary} ${item.issueLabel}`.toLocaleLowerCase().includes(term),
  );
  const table = useTable({
    features: dataGridFeatures,
    data: filtered,
    columns: COLUMNS,
    getRowId: (item) => item.id,
    manualPagination: true,
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <DataGridPanel
      table={table}
      recordCount={filtered.length}
      label="Listed follow-ups"
      tableLayout={{ width: "auto" }}
      renderMobileRow={(row) => (
        <Item variant="outline" role="presentation">
          <ItemContent>
            <div className="flex items-start justify-between gap-3">
              <ItemTitle>{row.original.summary}</ItemTitle>
              <Urgency item={row.original} />
            </div>
            <ItemDescription>
              {row.original.issueLabel} · First flagged{" "}
              <FirstFlagged item={row.original} />
            </ItemDescription>
            <FollowUpAction item={row.original} />
          </ItemContent>
        </Item>
      )}
      toolbar={
        <>
          <DataGridSearch
            label="Search listed follow-ups"
            placeholder="Search follow-ups…"
            value={search}
            onValueChange={setSearch}
          />
          <DataGridToolbarSpacer />
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {items.length} listed
          </span>
          <DataGridSortSelect
            label="Sort follow-ups"
            options={SORT_OPTIONS}
            fallback="urgency:asc"
            sorting={sorting}
            onSortingChange={setSorting}
            whenCards
          />
        </>
      }
      empty={
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {items.length === 0
                ? "Nothing needs follow-up"
                : "No follow-ups match"}
            </EmptyTitle>
            <EmptyDescription>
              {items.length === 0
                ? "Failed receipts, refunds needing review and gifts missing information appear here."
                : "Try a different search. Only the loaded follow-ups are searched."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    />
  );
}
