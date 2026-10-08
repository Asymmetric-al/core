"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table/data-table-column-header";
import { DataTableWrapper } from "@asym/ui/components/shadcn/data-table/data-table-wrapper";
import { type ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
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
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted border border-border">
            <MapPin className="size-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground truncate tracking-tight">
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
            {type === "missionary" && (
              <User className="size-3 text-muted-foreground" />
            )}
            {type === "project" && (
              <Activity className="size-3 text-muted-foreground" />
            )}
            {type === "custom" && (
              <Globe className="size-3 text-muted-foreground" />
            )}
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
          <Badge variant={status === "published" ? "success" : "secondary"}>
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
                  size="icon-sm"
                  aria-label={`Open actions for ${row.original.title}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Edit2 /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(row.original.id)}
                variant="destructive"
              >
                <Trash2 /> Delete
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
