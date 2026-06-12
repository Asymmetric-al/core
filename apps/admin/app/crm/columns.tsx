"use client";

import { formatCurrency } from "@asym/lib/utils";
import {
  crmRecordAvatarTransitionName,
  crmRecordTitleTransitionName,
} from "@asym/lib/view-transitions";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";

import { PORTAL_BADGE_CLASS, type CrmGridRow } from "./types";

import type { DataTableFilterOption } from "@asym/ui/components/shadcn/data-table";

const EMPTY_CELL_VALUE = "N/A";

function formatShortDate(value: string | null | undefined) {
  if (!value) return EMPTY_CELL_VALUE;
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return EMPTY_CELL_VALUE;
  }
}

const LIFECYCLE_BADGE_CLASS: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

interface ColumnOptions {
  onViewRecord: (row: CrmGridRow) => void;
  tagOptions: DataTableFilterOption[];
}

export function getCrmColumns({
  onViewRecord,
  tagOptions,
}: ColumnOptions): ColumnDef<CrmGridRow>[] {
  return [
    {
      id: "displayName",
      accessorFn: (row) => row.displayName ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name / Entity" />
      ),
      cell: ({ row }) => {
        const record = row.original;
        const name = record.displayName || "Unnamed";
        const initial = name.trim()[0] ?? "?";
        return (
          <div className="flex min-w-[220px] items-center gap-3 py-1">
            <SharedNamedViewTransition
              name={crmRecordAvatarTransitionName(record.id)}
            >
              <Avatar className="size-9 rounded-xl border border-border">
                <AvatarImage src={record.avatarUrl ?? undefined} />
                <AvatarFallback className="rounded-xl bg-primary text-[10px] font-semibold text-primary-foreground">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </SharedNamedViewTransition>
            <div className="flex flex-col min-w-0">
              <SharedNamedViewTransition
                name={crmRecordTitleTransitionName(record.id)}
              >
                <span className="font-semibold text-sm text-foreground leading-none truncate">
                  {name}
                </span>
              </SharedNamedViewTransition>
              {record.primaryOrganization ? (
                <span className="mt-1 truncate text-xs font-medium text-muted-foreground">
                  {record.primaryOrganization}
                </span>
              ) : null}
            </div>
          </div>
        );
      },
      meta: {
        label: "Name / Entity",
      },
    },
    {
      accessorKey: "recordType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Record type" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium capitalize text-foreground">
          {row.original.recordType ?? EMPTY_CELL_VALUE}
        </span>
      ),
      filterFn: (row, id, value) => {
        const v = row.getValue(id) as string | null;
        return Array.isArray(value) && v ? value.includes(v) : true;
      },
      meta: {
        label: "Record type",
        filterVariant: "select",
        filterOptions: [
          { label: "Individual", value: "individual" },
          { label: "Organization", value: "Organization" },
          { label: "Church", value: "Church" },
        ],
      },
    },
    {
      accessorKey: "assignedMissionaryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Owner" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-muted-foreground">
          {row.original.assignedMissionaryName ?? EMPTY_CELL_VALUE}
        </span>
      ),
      meta: {
        label: "Owner",
      },
    },
    {
      accessorKey: "primaryContactLine",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Primary contact" />
      ),
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[200px] text-sm text-muted-foreground">
          {row.original.primaryContactLine ?? EMPTY_CELL_VALUE}
        </span>
      ),
      meta: {
        label: "Primary contact",
      },
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[160px] text-xs text-muted-foreground">
          {row.original.location ?? EMPTY_CELL_VALUE}
        </span>
      ),
      meta: {
        label: "Location",
      },
    },
    {
      accessorKey: "lifecycleStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "border text-[10px] font-semibold shadow-none",
            LIFECYCLE_BADGE_CLASS[
              row.original.lifecycleStatus?.toLowerCase() ?? ""
            ] ?? "border-border bg-background text-muted-foreground",
          )}
        >
          {row.original.lifecycleStatus ?? EMPTY_CELL_VALUE}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        const v = row.getValue(id) as string | null;
        return Array.isArray(value) && v ? value.includes(v) : true;
      },
      meta: {
        label: "Relationship status",
        filterVariant: "select",
        filterOptions: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    },
    {
      accessorKey: "lastGiftAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last gift" />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {formatShortDate(row.original.lastGiftAt)}
        </span>
      ),
      meta: {
        label: "Last gift",
      },
    },
    {
      accessorKey: "lifetimeGiving",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader
            column={column}
            title="Lifetime giving"
            className="justify-end"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono text-sm font-semibold tabular-nums text-foreground">
          {formatCurrency(row.original.lifetimeGiving)}
        </div>
      ),
      meta: {
        label: "Lifetime giving",
      },
    },
    {
      accessorKey: "fundsGivenToSummary",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Funds" />
      ),
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[180px] text-xs text-muted-foreground">
          {row.original.fundsGivenToSummary ?? EMPTY_CELL_VALUE}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: "Funds given to",
      },
    },
    {
      accessorKey: "lastTouchAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last touch" />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {formatShortDate(row.original.lastTouchAt)}
        </span>
      ),
      meta: {
        label: "Last touch",
      },
    },
    {
      accessorKey: "nextTaskSummary",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Next task" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.nextTaskSummary ?? EMPTY_CELL_VALUE}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: "Next task",
      },
    },
    {
      accessorKey: "portalAccessLabel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Portal" />
      ),
      cell: ({ row }) => {
        const label = row.original.portalAccessLabel;
        return (
          <Badge
            variant="outline"
            className={cn(
              "border text-[10px] font-semibold shadow-none",
              PORTAL_BADGE_CLASS[label],
            )}
          >
            {label === "linked" ? "Linked" : "No portal"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const v = row.getValue(id) as string;
        return Array.isArray(value) ? value.includes(v) : true;
      },
      meta: {
        label: "Portal / auth",
        filterVariant: "select",
        filterOptions: [
          { label: "Portal linked", value: "linked" },
          { label: "No portal", value: "none" },
        ],
      },
    },
    {
      accessorKey: "tags",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {(row.original.tags ?? []).length === 0 ? (
            <span className="text-xs text-muted-foreground">
              {EMPTY_CELL_VALUE}
            </span>
          ) : (
            row.original.tags.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="h-5 px-1.5 text-[10px] font-medium"
              >
                {t}
              </Badge>
            ))
          )}
        </div>
      ),
      filterFn: (row, _id, value) => {
        const tags = row.original.tags ?? [];
        if (!Array.isArray(value) || value.length === 0) return true;
        return value.some((v: string) => tags.includes(v));
      },
      enableSorting: false,
      meta: {
        label: "Tags",
        filterVariant: "select",
        filterOptions: tagOptions,
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    aria-label={`Open actions for ${record.displayName ?? "CRM record"}`}
                    variant="ghost"
                    className="size-8 p-0 text-muted-foreground hover:text-foreground rounded-xl"
                  />
                }
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {record.email ? (
                  <DropdownMenuItem
                    onClick={() =>
                      void navigator.clipboard.writeText(record.email ?? "")
                    }
                    className="rounded-lg"
                  >
                    Copy email
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onViewRecord(record)}
                  className="rounded-lg"
                >
                  Open details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableHiding: false,
      enableSorting: false,
      meta: {
        label: "Actions",
      },
    },
  ];
}
