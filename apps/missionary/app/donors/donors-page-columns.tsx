"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  type ColumnDef,
  DataTableColumnHeader,
} from "@asym/ui/components/shadcn/data-table";
import { cn } from "@asym/ui/lib/utils";
import { format } from "date-fns";

import {
  formatCurrency,
  getGiftTypeIcon,
  getStatusBadge,
  getStatusColor,
} from "./donors-model";
import { parseDisplayDate } from "./donors-page-dates";

import type { Activity, Donor } from "./donor-types";

export function createDonorColumns(
  selectedDonorId: string | null,
): ColumnDef<Donor>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Partner" />
      ),
      cell: ({ row }) => {
        const donor = row.original;
        const isSelected = selectedDonorId === donor.id;

        return (
          <div className="flex items-center gap-3 py-1">
            <div className="relative shrink-0">
              <Avatar
                className={cn(
                  "size-10 border-2",
                  isSelected ? "border-primary" : "border-background shadow-sm",
                )}
              >
                <AvatarImage src={donor.avatar_url} />
                <AvatarFallback
                  className={cn(
                    "text-xs font-semibold",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {donor.initials}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2",
                  isSelected ? "border-primary" : "border-background",
                  getStatusColor(donor.status),
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-sm truncate text-foreground">
                  {donor.name}
                </span>
                {donor.has_active_pledge && (
                  <div
                    className="size-2 rounded-full shrink-0 ml-1 bg-primary/100"
                    title="Active recurring donation"
                  />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] truncate max-w-[100px] font-medium uppercase tracking-wider text-muted-foreground">
                  {donor.location || "Unknown"}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {formatCurrency(donor.total_given)}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "total_given",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader
            className="justify-end"
            column={column}
            title="Given"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-semibold text-foreground tabular-nums">
          {formatCurrency(row.original.total_given)}
        </div>
      ),
    },
    {
      accessorKey: "frequency",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Frequency" />
      ),
    },
  ];
}

export function createGivingHistoryColumns(): ColumnDef<Activity>[] {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) =>
        format(parseDisplayDate(row.original.date), "MMM d, yyyy"),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
    },
    {
      accessorKey: "gift_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Method" />
      ),
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {row.original.gift_type && getGiftTypeIcon(row.original.gift_type)}
          {row.original.gift_type || "Online"}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader
            className="justify-end"
            column={column}
            title="Amount"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-semibold text-foreground">
          {formatCurrency(row.original.amount || 0)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          className={cn(
            "font-semibold rounded-full text-[9px] uppercase tracking-widest border-0",
            row.original.status === "Failed"
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary",
          )}
        >
          {row.original.status || "Succeeded"}
        </Badge>
      ),
    },
  ];
}
