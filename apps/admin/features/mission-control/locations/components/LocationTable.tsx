"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table/data-table-column-header";
import { DataTableWrapper } from "@asym/ui/components/shadcn/data-table/data-table-wrapper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { cn } from "@asym/ui/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  MapPin,
  Globe,
  User,
  Activity,
  Trash2,
  Edit2,
} from "lucide-react";
import React from "react";

import type { Location } from "../hooks/use-locations";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

interface LocationTableProps {
  data: Location[];
  isLoading?: boolean;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
}

export function LocationTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: LocationTableProps) {
  const getRowId = React.useCallback((location: Location) => location.id, []);

  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200">
            <MapPin className="size-4 text-zinc-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-zinc-900 truncate tracking-tight">
              {row.original.title}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {row.original.lat.toFixed(4)}, {row.original.lng.toFixed(4)}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <div className="flex items-center gap-2">
            {type === "missionary" && <User className="size-3 text-zinc-400" />}
            {type === "project" && (
              <Activity className="size-3 text-zinc-400" />
            )}
            {type === "custom" && <Globe className="size-3 text-zinc-400" />}
            <span className="text-xs font-semibold text-muted-foreground capitalize">
              {type}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant="outline"
            className={cn(
              "h-5 px-2.5 rounded-full border shadow-none text-[11px] font-medium capitalize",
              status === "published"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-zinc-100 text-zinc-500",
            )}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Updated" />
      ),
      cell: ({ row }) => (
        <div className="text-xs font-medium text-muted-foreground tabular-nums">
          {makeDisplayDate(row.original.updated_at).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            },
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg"
                  aria-label={`Open actions for ${row.original.title}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl border-zinc-100 shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => onEdit(row.original)}
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 focus:text-zinc-900"
              >
                <Edit2 className="mr-2 size-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(row.original.id)}
                className="text-[10px] font-bold uppercase tracking-widest text-red-600 focus:text-red-700"
              >
                <Trash2 className="mr-2 size-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTableWrapper
      columns={columns}
      data={data}
      isLoading={isLoading}
      getRowId={getRowId}
      searchColumnId="title"
      searchPlaceholder="Search locations..."
      config={{
        enableRowSelection: false,
        enableColumnVisibility: false,
        enablePagination: true,
        enableFilters: false,
        enableSorting: true,
      }}
      emptyState={{
        title: "No locations found",
        description: "Add a location on the map to get started.",
      }}
    />
  );
}
