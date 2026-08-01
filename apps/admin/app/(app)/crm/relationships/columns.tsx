"use client";

import { formatCurrency } from "@asym/lib/utils";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table";
import { cn } from "@asym/ui/lib/utils";
import { format } from "date-fns";

import type { CrmRelationshipRow } from "@asym/database/types";
import type { ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";

function formatShortDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function formatCommitment(row: CrmRelationshipRow) {
  if (row.commitmentAmountCents == null) {
    return "—";
  }

  const amount = formatCurrency(row.commitmentAmountCents);
  return row.commitmentFrequency
    ? `${amount} ${row.commitmentFrequency}`
    : amount;
}

const DOMAIN_BADGE_CLASS: Record<CrmRelationshipRow["domain"], string> = {
  activity: "border-sky-200 bg-sky-50 text-sky-700",
  churches: "border-violet-200 bg-violet-50 text-violet-700",
  households: "border-teal-200 bg-teal-50 text-teal-700",
  organizations: "border-indigo-200 bg-indigo-50 text-indigo-700",
  people: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pledges: "border-amber-200 bg-amber-50 text-amber-700",
};

const AUTHORITY_BADGE_CLASS: Record<
  CrmRelationshipRow["authorityScope"],
  string
> = {
  care_excluded: "border-rose-200 bg-rose-50 text-rose-700",
  crm_relationship: "border-zinc-200 bg-zinc-50 text-zinc-700",
  finance_summary: "border-amber-200 bg-amber-50 text-amber-700",
};

export function getCrmRelationshipColumns(): ColumnDef<CrmRelationshipRow>[] {
  return [
    {
      id: "displayName",
      accessorFn: (row) => row.displayName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Relationship" />
      ),
      cell: ({ row }) => {
        const relationship = row.original;
        return (
          <div className="min-w-[220px]">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold">
                {relationship.displayName}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "h-5 rounded-md text-[9px] font-semibold uppercase shadow-none",
                  DOMAIN_BADGE_CLASS[relationship.domain],
                )}
              >
                {relationship.domain}
              </Badge>
            </div>
            {relationship.secondaryLabel ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {relationship.secondaryLabel}
              </p>
            ) : null}
          </div>
        );
      },
      meta: {
        label: "Relationship",
      },
    },
    {
      accessorKey: "sourceSystem",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <span className="text-xs font-medium">
            {row.original.sourceSystem}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "block h-auto w-fit rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase shadow-none",
              AUTHORITY_BADGE_CLASS[row.original.authorityScope],
            )}
          >
            {row.original.authorityScope === "finance_summary"
              ? "Payment truth in Asym"
              : row.original.authorityScope === "care_excluded"
                ? "Care truth in Asym"
                : "CRM context"}
          </Badge>
        </div>
      ),
      enableSorting: false,
      meta: {
        label: "Source",
      },
    },
    {
      accessorKey: "primaryContactName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[180px] text-xs text-muted-foreground">
          {row.original.primaryContactName ?? "—"}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: "Contact",
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.status ?? "—"}
        </span>
      ),
      meta: {
        label: "Status",
      },
    },
    {
      accessorKey: "memberCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Members" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {row.original.memberCount ?? "—"}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: "Members",
      },
    },
    {
      accessorKey: "commitmentAmountCents",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commitment" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold tabular-nums">
          {formatCommitment(row.original)}
        </span>
      ),
      meta: {
        label: "Commitment",
      },
    },
    {
      accessorKey: "lastActivityAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last activity" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatShortDate(row.original.lastActivityAt)}
        </span>
      ),
      meta: {
        label: "Last activity",
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatShortDate(row.original.updatedAt)}
        </span>
      ),
      meta: {
        label: "Updated",
      },
    },
  ];
}
