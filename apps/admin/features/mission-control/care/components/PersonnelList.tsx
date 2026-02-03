"use client";

import React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ChevronRight,
  Globe,
  ShieldAlert,
  HeartPulse,
  User,
} from "lucide-react";

import type { CarePersonnel } from "../types";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { DataTableWrapper } from "@asym/ui/components/shadcn/data-table/data-table-wrapper";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table/data-table-column-header";
import { type DataTableFilterField } from "@asym/ui/components/shadcn/data-table/types";
import { cn } from "@asym/ui/lib/utils";

interface PersonnelListProps {
  data: CarePersonnel[];
  isLoading?: boolean;
}

const columns: ColumnDef<CarePersonnel>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Personnel" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <Avatar className="h-9 w-9 border border-border/50 shadow-sm ring-2 ring-background">
          <AvatarImage src={row.original.avatarUrl} />
          <AvatarFallback className="text-[10px] font-black bg-primary text-primary-foreground">
            {row.original.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-primary truncate tracking-tight">
            {row.original.name}
          </span>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">
            {row.original.role}
          </span>
        </div>
      </div>
    ),
    meta: {
      label: "Personnel",
    },
  },
  {
    accessorKey: "region",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Globe className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {row.original.region}
        </span>
      </div>
    ),
    meta: {
      label: "Region",
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Wellness" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-black h-5 uppercase tracking-widest px-2.5 rounded-full border-none shadow-none",
            status === "Healthy"
              ? "bg-emerald-500/10 text-emerald-600"
              : status === "At Risk"
                ? "bg-amber-500/10 text-amber-600"
                : status === "Crisis"
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-muted text-muted-foreground",
          )}
        >
          {status === "Healthy" && <HeartPulse className="mr-1 h-3 w-3" />}
          {status === "Crisis" && <ShieldAlert className="mr-1 h-3 w-3" />}
          {status}
        </Badge>
      );
    },
    meta: {
      label: "Status",
    },
  },
  {
    accessorKey: "lastCheckIn",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Update" />
    ),
    cell: ({ row }) => (
      <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider tabular-nums">
        {new Date(row.original.lastCheckIn).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
    ),
    meta: {
      label: "Last Check-in",
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end pr-4">
        <Link href={`/mc/care/directory/${row.original.id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    ),
  },
];

const filterFields: DataTableFilterField<CarePersonnel>[] = [
  {
    id: "status",
    label: "Status",
    variant: "select",
    options: [
      { label: "Healthy", value: "Healthy" },
      { label: "At Risk", value: "At Risk" },
      { label: "Crisis", value: "Crisis" },
    ],
  },
  {
    id: "region",
    label: "Region",
    variant: "select",
    options: [
      { label: "Africa", value: "Africa" },
      { label: "SE Asia", value: "SE Asia" },
      { label: "Europe", value: "Europe" },
      { label: "Latin America", value: "Latin America" },
      { label: "Middle East", value: "Middle East" },
      { label: "North America", value: "North America" },
    ],
  },
];

export function PersonnelList({ data, isLoading }: PersonnelListProps) {
  return (
    <div className="px-1">
      <DataTableWrapper
        columns={columns}
        data={data}
        isLoading={isLoading}
        filterFields={filterFields}
        searchKey="name"
        searchPlaceholder="Find personnel..."
        config={{
          enableRowSelection: false,
          enableColumnVisibility: false,
          enablePagination: true,
          enableFilters: true,
          enableSorting: true,
        }}
        emptyState={{
          title: "No personnel found",
          description:
            "Try adjusting your search or filters to find team members.",
        }}
      />
    </div>
  );
}
