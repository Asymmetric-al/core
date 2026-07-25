"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table";
import { type ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";
import { Clock3, FileText } from "lucide-react";

import type { CrmNoteRow } from "@asym/database/hooks";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getCrmNoteColumns(): ColumnDef<CrmNoteRow>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Note" />
      ),
      cell: ({ row }) => {
        const note = row.original;
        return (
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 rounded-md bg-muted p-1.5 text-muted-foreground">
              <FileText className="size-3.5" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {note.title}
              </p>
              <p className="line-clamp-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
                {note.bodyPreview}
              </p>
            </div>
          </div>
        );
      },
      meta: { label: "Note" },
      size: 520,
    },
    {
      accessorKey: "authorName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Author" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.authorName ?? "Mission Control"}
        </span>
      ),
      enableSorting: false,
      meta: { label: "Author" },
      size: 180,
    },
    {
      accessorKey: "linkedRecordLabel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Linked record" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.linkedRecordLabel ?? "—"}
        </span>
      ),
      enableSorting: false,
      meta: { label: "Linked record" },
      size: 180,
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="State" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="h-5 rounded-md text-[10px] font-semibold uppercase tracking-wide shadow-none"
        >
          {row.original.source === "queued" ? "Queued" : "Synced"}
        </Badge>
      ),
      enableSorting: false,
      meta: { label: "State" },
      size: 110,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="size-3.5" />
          {formatDate(row.original.updatedAt)}
        </div>
      ),
      meta: { label: "Updated" },
      size: 140,
    },
  ];
}
