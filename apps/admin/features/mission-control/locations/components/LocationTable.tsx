"use client";

import {
  DataGridPanel,
  DataGridRowPrimary,
  DataGridSearch,
  DataGridSortSelect,
  dataGridFeatures,
  useTable,
  type DataGridColumnDef,
  type DataGridPanelError,
  type DataGridRow,
  type PaginationState,
  type SortingState,
} from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
} from "@asym/ui/components/shadcn/item";
import {
  Activity,
  Edit2,
  Globe,
  MapPin,
  MoreHorizontal,
  SearchX,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

import { getLocationTypeLabel } from "../location-labels";

import type { Location } from "../hooks/use-locations";

const PAGE_SIZE = 10;
// The pager's own default list starts at 5; this grid keeps Core's 10 floor.
const PAGE_SIZES = [10, 25, 50, 100];

const TYPE_ICONS: Record<Location["type"], typeof User> = {
  missionary: User,
  project: Activity,
  custom: Globe,
  partner: User,
};

const STATUS_LABELS: Record<Location["status"], string> = {
  published: "Published",
  draft: "Draft",
};

/** The card view's sorts: the same ones the table's column headers offer. */
const LOCATION_SORT_LABELS: Record<string, string> = {
  "title:asc": "Location: A–Z",
  "title:desc": "Location: Z–A",
  "type:asc": "Type: A–Z",
  "type:desc": "Type: Z–A",
  // Status sorts by its stored value, so drafts come before published.
  "status:asc": "Status: drafts first",
  "status:desc": "Status: published first",
  "updated_at:desc": "Last updated: newest",
  "updated_at:asc": "Last updated: oldest",
};

function formatUpdated(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function formatCoordinates(location: Location) {
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
}

function StatusBadge({ status }: { status: Location["status"] }) {
  return (
    <Badge variant={status === "published" ? "success" : "secondary"}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

function locationColumns(
  onEdit: (location: Location) => void,
  onDelete: (id: string) => void,
): DataGridColumnDef<Location>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted">
            <MapPin
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <DataGridRowPrimary onClick={() => onEdit(row.original)}>
              <span className="truncate text-sm font-medium text-foreground">
                {row.original.title}
              </span>
            </DataGridRowPrimary>
            <span className="truncate text-xs tabular-nums text-muted-foreground">
              {formatCoordinates(row.original)}
            </span>
          </div>
        </div>
      ),
      size: 300,
      meta: { headerTitle: "Location" },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const Icon = TYPE_ICONS[row.original.type] ?? MapPin;
        return (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon aria-hidden="true" className="size-3.5" />
            {getLocationTypeLabel(row.original.type)}
          </span>
        );
      },
      size: 150,
      meta: { headerTitle: "Type" },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 130,
      meta: { headerTitle: "Status" },
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Last updated" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatUpdated(row.original.updated_at)}
        </span>
      ),
      size: 150,
      meta: { headerTitle: "Last updated" },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${row.original.title}`}
                >
                  <MoreHorizontal />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Edit2 aria-hidden="true" /> Edit
              </DropdownMenuItem>
              {/* The page confirms before anything is deleted. */}
              <DropdownMenuItem
                onClick={() => onDelete(row.original.id)}
                variant="destructive"
              >
                <Trash2 aria-hidden="true" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      size: 56,
      meta: { headerTitle: "Actions" },
    },
  ];
}

function LocationMobileRow({
  location,
  onEdit,
}: {
  location: Location;
  onEdit: (location: Location) => void;
}) {
  return (
    // The name button stretches over the card, so the whole card opens it.
    <div className="relative rounded-md transition-colors hover:bg-accent/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <Item variant="outline" size="sm" render={<div />}>
        <ItemContent className="min-w-0">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <DataGridRowPrimary
              className="after:absolute after:inset-0"
              onClick={() => onEdit(location)}
            >
              <span className="truncate text-sm font-medium">
                {location.title}
              </span>
            </DataGridRowPrimary>
            <StatusBadge status={location.status} />
          </div>
          <ItemDescription>
            {getLocationTypeLabel(location.type)} ·{" "}
            {formatCoordinates(location)}
          </ItemDescription>
          <ItemDescription className="tabular-nums">
            Last updated {formatUpdated(location.updated_at)}
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}

interface LocationTableProps {
  data: Location[];
  isLoading?: boolean;
  error?: DataGridPanelError | null;
  onAdd?: () => void;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
}

/** Every map location on Core's shared record grid: search, sort and actions. */
export function LocationTable({
  data,
  isLoading = false,
  error,
  onAdd,
  onEdit,
  onDelete,
}: LocationTableProps) {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "title", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const query = search.trim().toLowerCase();
  const rows = query
    ? data.filter((location) =>
        [
          location.title,
          getLocationTypeLabel(location.type),
          STATUS_LABELS[location.status],
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : data;

  // A delete can leave the page in view empty; show the last page that still
  // has rows instead, so nothing sits on a page the pager may no longer show.
  const lastPageIndex = Math.max(
    0,
    Math.ceil(rows.length / pagination.pageSize) - 1,
  );
  const page =
    pagination.pageIndex > lastPageIndex
      ? { ...pagination, pageIndex: lastPageIndex }
      : pagination;

  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns: locationColumns(onEdit, onDelete),
    getRowId: (location) => location.id,
    state: { sorting, pagination: page },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  return (
    <DataGridPanel
      // Cards when the columns would not fit, not a sideways scroll.
      view="auto"
      table={table}
      recordCount={rows.length}
      label="Locations"
      isLoading={isLoading}
      error={error ?? undefined}
      // Against the size in use, not the default: rows past it need the pager.
      pagination={
        rows.length > Math.min(page.pageSize, PAGE_SIZE)
          ? { sizes: PAGE_SIZES }
          : false
      }
      onRowClick={onEdit}
      renderMobileRow={(row: DataGridRow<Location>) => (
        <LocationMobileRow location={row.original} onEdit={onEdit} />
      )}
      empty={
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {query ? <SearchX /> : <MapPin />}
            </EmptyMedia>
            <EmptyTitle>
              {query ? "No locations match" : "No locations yet"}
            </EmptyTitle>
            <EmptyDescription>
              {query
                ? "Try another title, type or status."
                : "Use Add location to put the first one on the map."}
            </EmptyDescription>
          </EmptyHeader>
          {!query && onAdd ? (
            <EmptyContent>
              <Button onClick={onAdd}>Add location</Button>
            </EmptyContent>
          ) : null}
        </Empty>
      }
      toolbar={
        <>
          <DataGridSearch
            label="Search locations"
            placeholder="Search by title, type or status…"
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            }}
          />
          {/* Cards have no column headers to sort by, so they get this. */}
          <DataGridSortSelect
            whenCards
            label="Sort locations"
            options={LOCATION_SORT_LABELS}
            fallback="title:asc"
            sorting={sorting}
            onSortingChange={(next) => {
              setSorting(next);
              setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            }}
          />
        </>
      }
    />
  );
}
