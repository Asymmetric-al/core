"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table";
import { cn } from "@asym/ui/lib/utils";

import type { CrmProjectionShadowRow } from "@asym/database/types";
import type { ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";

const DRIFT_BADGE_CLASS: Record<CrmProjectionShadowRow["driftStatus"], string> =
  {
    conflicting: "border-orange-200 bg-orange-50 text-orange-700",
    disabled: "border-zinc-200 bg-zinc-50 text-zinc-700",
    failed: "border-rose-200 bg-rose-50 text-rose-700",
    healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
    missing: "border-amber-200 bg-amber-50 text-amber-700",
    stale: "border-sky-200 bg-sky-50 text-sky-700",
  };

export function getCrmProjectionShadowColumns(): ColumnDef<CrmProjectionShadowRow>[] {
  return [
    {
      accessorKey: "label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Projection" />
      ),
      cell: ({ row }) => (
        <div className="min-w-[220px]">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {row.original.label}
            </span>
            <Badge
              variant="outline"
              className="h-5 rounded-md text-[9px] font-semibold uppercase shadow-none"
            >
              {row.original.targetSurface}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {row.original.roleScope.replace(/_/g, " ")}
          </p>
        </div>
      ),
      meta: {
        label: "Projection",
      },
    },
    {
      accessorKey: "driftStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Drift" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "h-6 rounded-md text-[10px] font-semibold uppercase shadow-none",
            DRIFT_BADGE_CLASS[row.original.driftStatus],
          )}
        >
          {row.original.driftStatus}
        </Badge>
      ),
      meta: {
        label: "Drift",
      },
    },
    {
      id: "parity",
      accessorFn: (row) => row.shadowMode.recordCountParity,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Parity" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <span className="text-xs font-semibold">
            {row.original.shadowMode.recordCountParity.replace(/_/g, " ")}
          </span>
          <p className="text-xs text-muted-foreground">
            {row.original.counts.projectedRecords}/
            {row.original.counts.sourceRecords} projected
          </p>
        </div>
      ),
      meta: {
        label: "Parity",
      },
    },
    {
      id: "findings",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Findings" />
      ),
      cell: ({ row }) => {
        const counts = row.original.counts;
        return (
          <div className="grid min-w-[220px] grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Missing CRM: {counts.missingInCrm}</span>
            <span>Missing Asym: {counts.missingInAsym}</span>
            <span>Stale: {counts.staleRecords}</span>
            <span>Failed: {counts.failedRecords}</span>
            <span>Conflicts: {counts.conflictingRecords}</span>
            <span>Duplicates: {counts.duplicateCandidates}</span>
          </div>
        );
      },
      enableSorting: false,
      meta: {
        label: "Findings",
      },
    },
    {
      id: "ownership",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source Of Truth" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[340px] space-y-1 text-xs">
          <p className="line-clamp-2 text-muted-foreground">
            {row.original.sourceOwnership.crm}
          </p>
          <p className="line-clamp-2 text-muted-foreground">
            {row.original.sourceOwnership.asym}
          </p>
        </div>
      ),
      enableSorting: false,
      meta: {
        label: "Source of truth",
      },
    },
  ];
}
