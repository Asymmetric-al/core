"use client";

import { DataGridRowPrimary } from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@asym/ui/components/shadcn/badge";
import Link from "next/link";

import { CrmEmptyValue, formatCrmDate } from "../crm-display";

import type { CrmNoteRow } from "@asym/database/hooks";
import type { DataGridColumnDef } from "@asym/ui/components/data-grid-panel";

/** Below the widest tier, the author column starts hidden (View restores it). */
export const CRM_NOTE_COLUMN_TIERS: Array<Record<string, boolean>> = [
  {},
  { authorName: false },
];

/** The note column takes the width the other visible columns leave. */
export const CRM_NOTE_FILL_COLUMN_ID = "title";

/** Linked record types that are CRM records (donor profiles and organizations). */
const CRM_RECORD_LINK_TYPES = new Set(["donor_profile", "organization"]);

/** `/crm?donor=` for notes linked to a CRM record; null otherwise. */
export function crmNoteLinkedRecordHref(note: CrmNoteRow): string | null {
  return note.linkedRecordId &&
    note.linkedRecordType &&
    CRM_RECORD_LINK_TYPES.has(note.linkedRecordType)
    ? `/crm?donor=${encodeURIComponent(note.linkedRecordId)}`
    : null;
}

export function CrmNoteLinkedRecord({ note }: { note: CrmNoteRow }) {
  if (!note.linkedRecordLabel) return <CrmEmptyValue />;
  const href = crmNoteLinkedRecordHref(note);
  return href ? (
    <Link
      href={href}
      title={note.linkedRecordLabel}
      // Two lines before clamping: long names stay readable in the list.
      className="line-clamp-2 text-sm font-medium wrap-break-word text-foreground underline decoration-muted-foreground/50 underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {note.linkedRecordLabel}
    </Link>
  ) : (
    <span
      title={note.linkedRecordLabel}
      className="line-clamp-2 text-sm wrap-break-word text-muted-foreground"
    >
      {note.linkedRecordLabel}
    </span>
  );
}

/** Restricted notes are admin-only; standard notes carry no badge. */
export function CrmNoteRestrictedBadge({ note }: { note: CrmNoteRow }) {
  return note.visibility === "restricted" ? (
    <Badge variant="warning">Restricted</Badge>
  ) : null;
}

export function CrmNoteVisibility({ note }: { note: CrmNoteRow }) {
  return note.visibility === "restricted" ? (
    <Badge variant="warning">Restricted</Badge>
  ) : (
    <span className="text-sm text-muted-foreground">Standard</span>
  );
}

export function getCrmNoteColumns({
  onOpenNote,
}: {
  onOpenNote: (note: CrmNoteRow) => void;
}): DataGridColumnDef<CrmNoteRow>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => {
        const note = row.original;
        return (
          <div className="flex min-w-0 flex-col gap-0.5 py-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <DataGridRowPrimary onClick={() => onOpenNote(note)}>
                <span className="truncate text-sm font-medium text-foreground underline-offset-4 hover:underline">
                  {note.title}
                </span>
              </DataGridRowPrimary>
              <CrmNoteRestrictedBadge note={note} />
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {note.bodyPreview}
            </p>
          </div>
        );
      },
      size: 300,
      minSize: 240,
      enableHiding: false,
      meta: { headerTitle: "Note" },
    },
    {
      accessorKey: "authorName",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="block truncate text-sm text-muted-foreground">
          {row.original.authorName || "Mission Control"}
        </span>
      ),
      enableSorting: false,
      size: 140,
      meta: { headerTitle: "Author" },
    },
    {
      accessorKey: "linkedRecordLabel",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => <CrmNoteLinkedRecord note={row.original} />,
      enableSorting: false,
      size: 190,
      meta: { headerTitle: "Linked record" },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          {formatCrmDate(row.original.updatedAt) ?? "—"}
        </span>
      ),
      size: 112,
      meta: { headerTitle: "Updated" },
    },
  ];
}
