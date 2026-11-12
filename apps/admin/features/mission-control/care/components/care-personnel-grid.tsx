"use client";

import {
  DataGridPanel,
  DataGridRowPrimary,
  DataGridSearch,
  DataGridSortSelect,
  DataGridToolbarSpacer,
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from "@asym/ui/components/shadcn/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { cn } from "@asym/ui/lib/utils";
import { Flag, SearchX, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  getLastContactDate,
  getPeopleNeedingAttention,
} from "../member-care.derived";
import { getDaysSince } from "../utils";
import {
  CARE_STATUS_LABELS,
  CARE_STATUS_ORDER,
  CarePersonAvatar,
  CareStatusBadge,
  careProfileHref,
  formatLastContact,
  isCheckInOverdue,
} from "./care-display";

import type {
  CareRequirement,
  MemberCareDerivationInput,
} from "../member-care.types";
import type { ActivityLogEntry, CarePersonnel, CarePriority } from "../types";

type DirectoryPerson = CarePersonnel & { followUpDue?: boolean };

function PersonStatus({ person }: { person: DirectoryPerson }) {
  return (
    <div className="flex flex-wrap gap-1">
      <CareStatusBadge status={person.status} />
      {person.manualAttention ? (
        <Badge variant="outline">
          <Flag aria-hidden="true" />
          Flagged
        </Badge>
      ) : null}
      {person.followUpDue ? (
        <Badge variant="outline">Follow-up due</Badge>
      ) : null}
    </div>
  );
}

type StatusFilter = CarePriority | "all";

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: "All statuses",
  ...CARE_STATUS_LABELS,
};

function PersonCell({ person }: { person: CarePersonnel }) {
  return (
    <DataGridRowPrimary render={<Link href={careProfileHref(person.id)} />}>
      <CarePersonAvatar person={person} size="sm" />
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            "truncate text-sm font-medium",
            person.nameMissing ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {person.name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {person.nameMissing
            ? `${person.role} · ${person.location}`
            : person.role}
        </span>
      </span>
    </DataGridRowPrimary>
  );
}

function LastContact({ lastCheckIn }: { lastCheckIn: string | null }) {
  return (
    <span
      className={cn(
        "text-sm tabular-nums",
        isCheckInOverdue(lastCheckIn)
          ? "font-medium text-destructive"
          : "text-muted-foreground",
      )}
    >
      {formatLastContact(lastCheckIn)}
    </span>
  );
}

const COLUMNS: DataGridColumnDef<DirectoryPerson>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <PersonCell person={row.original} />,
    size: 260,
    meta: { headerTitle: "Name" },
  },
  {
    accessorKey: "region",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Region" />
    ),
    cell: ({ row }) => (
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm">{row.original.region}</span>
        <span className="truncate text-xs text-muted-foreground">
          {row.original.location}
        </span>
      </span>
    ),
    size: 200,
    meta: { headerTitle: "Region" },
  },
  {
    id: "status",
    accessorFn: (person) => CARE_STATUS_ORDER.indexOf(person.status),
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <PersonStatus person={row.original} />,
    size: 150,
    meta: { headerTitle: "Status" },
  },
  {
    id: "lastCheckIn",
    accessorFn: (person) =>
      getDaysSince(person.lastCheckIn) ?? Number.MAX_SAFE_INTEGER,
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Last contact" />
    ),
    cell: ({ row }) => <LastContact lastCheckIn={row.original.lastCheckIn} />,
    size: 150,
    meta: { headerTitle: "Last contact" },
  },
  {
    id: "careGaps",
    accessorFn: (person) => person.careGaps.length,
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Open care needs" />
    ),
    cell: ({ row }) => {
      const gaps = row.original.careGaps;
      return gaps.length === 0 ? (
        <span className="text-sm text-muted-foreground">None</span>
      ) : (
        <span className="block truncate text-sm" title={gaps.join(", ")}>
          {gaps[0]}
          {gaps.length > 1 ? (
            <span className="text-muted-foreground">{` +${gaps.length - 1}`}</span>
          ) : null}
        </span>
      );
    },
    size: 240,
    meta: { headerTitle: "Open care needs" },
  },
];

function PersonnelMobileRow({ person }: { person: DirectoryPerson }) {
  return (
    <div className="relative rounded-md transition-colors hover:bg-accent/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <Item variant="outline" size="sm" render={<div />}>
        <ItemMedia>
          <CarePersonAvatar person={person} size="sm" />
        </ItemMedia>
        <ItemContent className="min-w-0">
          <DataGridRowPrimary
            className="after:absolute after:inset-0"
            render={<Link href={careProfileHref(person.id)} />}
          >
            <span
              className={cn(
                "text-sm font-medium wrap-anywhere",
                person.nameMissing && "text-muted-foreground",
              )}
            >
              {person.name}
            </span>
          </DataGridRowPrimary>
          <PersonStatus person={person} />
          <ItemDescription>
            {person.role} ·{" "}
            {person.nameMissing ? person.location : person.region}
          </ItemDescription>
          <LastContact lastCheckIn={person.lastCheckIn} />
          <ItemDescription>
            Open care needs:{" "}
            {person.careGaps.length ? person.careGaps.join(", ") : "None"}
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}

export function CarePersonnelGrid({
  personnel,
  activities = [],
  requirements = [],
  lastContacts,
  isLoading = false,
  error,
  pageSize = 10,
}: {
  personnel: CarePersonnel[];
  activities?: ActivityLogEntry[];
  requirements?: CareRequirement[];
  lastContacts?: MemberCareDerivationInput["lastContacts"];
  isLoading?: boolean;
  error?: DataGridPanelError | null;
  pageSize?: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [region, setRegion] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "status", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const regionLabels = useMemo(
    () => ({
      all: "All regions",
      ...Object.fromEntries(
        [...new Set(personnel.map((person) => person.region))]
          .filter(Boolean)
          .sort()
          .map((name) => [name, name]),
      ),
    }),
    [personnel],
  );

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const due = new Set(
      getPeopleNeedingAttention({
        personnel,
        activities,
        requirements,
        lastContacts,
      }).map((gap) => gap.personnelId),
    );
    return personnel
      .map((person) => ({
        ...person,
        lastCheckIn: getLastContactDate(person, activities, lastContacts),
        followUpDue: due.has(person.id),
      }))
      .filter(
        (person) =>
          (status === "all" || person.status === status) &&
          (region === "all" || person.region === region) &&
          (!query ||
            [person.name, person.role, person.location, person.region].some(
              (value) => value.toLowerCase().includes(query),
            )),
      );
  }, [
    personnel,
    activities,
    requirements,
    lastContacts,
    region,
    search,
    status,
  ]);

  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns: COLUMNS,
    getRowId: (person) => person.id,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });
  const filtering =
    search.trim() !== "" || status !== "all" || region !== "all";

  return (
    <DataGridPanel
      view="auto"
      table={table}
      recordCount={rows.length}
      label="Member Care personnel"
      isLoading={isLoading}
      error={error ?? undefined}
      pagination={personnel.length > pageSize}
      onRowClick={(person) => router.push(careProfileHref(person.id))}
      renderMobileRow={(row: DataGridRow<DirectoryPerson>) => (
        <PersonnelMobileRow person={row.original} />
      )}
      empty={
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {filtering ? <SearchX /> : <Users />}
            </EmptyMedia>
            <EmptyTitle>
              {filtering ? "No one matches" : "No personnel yet"}
            </EmptyTitle>
            <EmptyDescription>
              {filtering
                ? "Try another name, status or region."
                : "Field staff in member care appear here."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
      toolbar={
        <>
          <DataGridSearch
            label="Search personnel"
            placeholder="Search by name, role or place…"
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            }}
          />
          <DataGridSortSelect
            whenCards
            label="Sort personnel"
            options={{
              "status:asc": "Status: most urgent first",
              "status:desc": "Status: healthy first",
              "name:asc": "Name: A to Z",
              "name:desc": "Name: Z to A",
              "region:asc": "Region: A to Z",
              "region:desc": "Region: Z to A",
              "lastCheckIn:desc": "Last contact: oldest first",
              "lastCheckIn:asc": "Last contact: newest first",
              "careGaps:desc": "Most open care needs",
              "careGaps:asc": "Fewest open care needs",
            }}
            fallback="status:asc"
            sorting={sorting}
            onSortingChange={(next) => {
              setSorting(next);
              setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            }}
          />
          <DataGridToolbarSpacer />
          <Select<string>
            items={regionLabels}
            value={region}
            onValueChange={(value) => {
              setRegion(value ?? "all");
              setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            }}
          >
            <SelectTrigger size="sm" aria-label="Filter by region">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.entries(regionLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select<StatusFilter>
            items={STATUS_FILTER_LABELS}
            value={status}
            onValueChange={(value) => {
              setStatus(value ?? "all");
              setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            }}
          >
            <SelectTrigger size="sm" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map(
                (value) => (
                  <SelectItem key={value} value={value}>
                    {STATUS_FILTER_LABELS[value]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </>
      }
    />
  );
}
