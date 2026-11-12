"use client";

import {
  crmRecordAvatarTransitionName,
  crmRecordTitleTransitionName,
} from "@asym/lib/view-transitions";
import {
  DataGridRowPrimary,
  filterFn_includesString,
} from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenuGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import { Link2, MoreHorizontal, UserRound } from "lucide-react";
import { toast } from "sonner";

import {
  CrmEmptyValue,
  CrmStatusBadge,
  CRM_RECORD_TYPE_OPTIONS,
  CRM_STATUS_OPTIONS,
  crmInitials,
  formatCrmDate,
  formatCrmMoneyCents,
  normalizeCrmVocabulary,
  toCrmLabel,
} from "./crm-display";

import type { CrmGridRow } from "./types";
import type { DataGridColumnDef } from "@asym/ui/components/data-grid-panel";

// The vocabulary lives in crm-display; re-exported for existing imports.
export { CRM_RECORD_TYPE_OPTIONS, CRM_STATUS_OPTIONS };

/**
 * Columns hidden until the viewer turns them on in the View menu, so the
 * default set fits a desktop panel without horizontal scrolling.
 */
export const CRM_DEFAULT_HIDDEN_COLUMNS = {
  primaryContactLine: false,
  location: false,
  portalAccessLabel: false,
} as const;

/** Medium panels also start without Updated and tags. */
export const CRM_MEDIUM_HIDDEN_COLUMNS = {
  ...CRM_DEFAULT_HIDDEN_COLUMNS,
  lastTouchAt: false,
  tags: false,
} as const;

/** Narrow panels also start without the owner. */
export const CRM_NARROW_HIDDEN_COLUMNS = {
  ...CRM_MEDIUM_HIDDEN_COLUMNS,
  assignedMissionaryName: false,
} as const;

/**
 * Compact panels also start without the record type (the Type filter and the
 * drawer still carry it). A sorted or filtered column stays visible in every
 * tier, so this is also the tier that makes room for the default Updated
 * sort on a narrow desktop panel.
 */
export const CRM_COMPACT_HIDDEN_COLUMNS = {
  ...CRM_NARROW_HIDDEN_COLUMNS,
  recordType: false,
} as const;

/**
 * Minimal panels (a 1024px window with the sidebar open, about 758px) also
 * start without the last gift date, so the kept Updated sort column and
 * the row actions still fit beside the name and lifetime giving.
 */
export const CRM_MINIMAL_HIDDEN_COLUMNS = {
  ...CRM_COMPACT_HIDDEN_COLUMNS,
  lastGiftAt: false,
} as const;

/** Default column sets, widest first; the grid uses the first that fits. */
export const CRM_COLUMN_TIERS = [
  CRM_DEFAULT_HIDDEN_COLUMNS,
  CRM_MEDIUM_HIDDEN_COLUMNS,
  CRM_NARROW_HIDDEN_COLUMNS,
  CRM_COMPACT_HIDDEN_COLUMNS,
  CRM_MINIMAL_HIDDEN_COLUMNS,
];

/** The name column takes the width the other visible columns leave. */
export const CRM_FILL_COLUMN_ID = "displayName";

export const CRM_PORTAL_OPTIONS = [
  { label: "Portal linked", value: "linked" },
  { label: "No portal", value: "none" },
];

/**
 * Filtering runs on the server (`manualFiltering`); these functions only keep
 * the column definitions valid for TanStack's client filter stage.
 */
function cellIsOneOf(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: unknown,
) {
  const value = row.getValue(columnId);
  return Array.isArray(filterValue) && typeof value === "string"
    ? filterValue.includes(normalizeCrmVocabulary(value))
    : true;
}

function cellTagsIncludeAny(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: unknown,
) {
  const tags = row.getValue(columnId);
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return Array.isArray(tags) && tags.some((tag) => filterValue.includes(tag));
}

interface ColumnOptions {
  onViewRecord: (row: CrmGridRow) => void;
  /** Retained for callers; tag filter options now live in the toolbar. */
  tagOptions?: Array<{ label: string; value: string }>;
}

function TextCell({ value }: { value: string | null | undefined }) {
  return value ? (
    <span
      className="block truncate text-sm text-muted-foreground"
      title={value}
    >
      {value}
    </span>
  ) : (
    <CrmEmptyValue />
  );
}

function DateCell({ value }: { value: string | null | undefined }) {
  const formatted = formatCrmDate(value);
  return formatted ? (
    <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
      {formatted}
    </span>
  ) : (
    <CrmEmptyValue />
  );
}

/**
 * The "·" between subline parts. Its margin does the spacing: a space at the
 * edge of a flex item is dropped, which read as "Individual·".
 */
function CrmSublineSeparator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="crm-subline-separator"
      className={cn("mx-1", className)}
    >
      ·
    </span>
  );
}

/** Type, then the owner, which truncates only when the line runs out. */
function CrmRecordSublineMeta({
  recordType,
  owner,
}: {
  recordType: string | null;
  owner: string | null | undefined;
}) {
  return (
    <>
      {recordType ? <span className="shrink-0">{recordType}</span> : null}
      {recordType && owner ? (
        <CrmSublineSeparator className="shrink-0" />
      ) : null}
      {owner ? (
        <span className="flex min-w-0 items-center gap-1">
          <UserRound aria-hidden="true" className="size-3 shrink-0" />
          <span className="truncate">
            <span className="sr-only">Owner: </span>
            {owner}
          </span>
        </span>
      ) : null}
    </>
  );
}

/**
 * A record's second line: type and owner first, then the title (or
 * organisation). Type and owner never give way to the title: the title starts
 * from a zero basis and grows only into spare room (up to its own width), so
 * it takes none of the overflow, and the owner truncates only once the title
 * is gone. The title ends the line, so its ellipsis never leaves a gap before
 * another part, and its full text is on hover. Spacing comes from the
 * separators' margins, not a flex gap. The table row and the phone card share it, so
 * both read in the same order; `stacked` (phone cards) gives the title its
 * own line, up to two, since one narrow line cut it to a few letters.
 */
export function CrmRecordSubline({
  recordType,
  owner,
  subline,
  stacked = false,
}: {
  recordType: string | null;
  owner: string | null | undefined;
  subline: string | null | undefined;
  stacked?: boolean;
}) {
  if (!subline && !recordType && !owner) return null;
  if (stacked) {
    return (
      <span className="flex min-w-0 flex-col gap-0.5 text-xs text-muted-foreground">
        {recordType || owner ? (
          <span
            data-slot="crm-subline-meta"
            className="flex min-w-0 items-center"
          >
            <CrmRecordSublineMeta recordType={recordType} owner={owner} />
          </span>
        ) : null}
        {subline ? (
          <span className="line-clamp-2 wrap-break-word" title={subline}>
            {subline}
          </span>
        ) : null}
      </span>
    );
  }
  return (
    <span className="flex min-w-0 items-center text-xs text-muted-foreground">
      <CrmRecordSublineMeta recordType={recordType} owner={owner} />
      {subline ? (
        <span
          className="max-w-fit min-w-0 grow basis-0 truncate"
          title={subline}
        >
          {recordType || owner ? <CrmSublineSeparator /> : null}
          {subline}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Avatar, name and organisation; the row's one primary control. While the
 * panel's width tier hides the Type or Owner column, `showType` and
 * `showOwner` put that value under the name instead.
 */
export function CrmRecordIdentity({
  record,
  onOpen,
  showType = false,
  showOwner = false,
}: {
  record: CrmGridRow;
  onOpen: (row: CrmGridRow) => void;
  showType?: boolean;
  showOwner?: boolean;
}) {
  const name = record.displayName || "Unnamed record";
  // An organization's record is usually named after it; skip the repeat.
  const subline =
    record.primaryOrganization && record.primaryOrganization !== name
      ? record.primaryOrganization
      : record.title;
  const recordType =
    showType && record.recordType ? toCrmLabel(record.recordType) : null;
  const owner = showOwner ? record.assignedMissionaryName : null;
  return (
    <DataGridRowPrimary onClick={() => onOpen(record)}>
      <SharedNamedViewTransition
        name={crmRecordAvatarTransitionName(record.id)}
      >
        <Avatar aria-hidden="true">
          <AvatarImage src={record.avatarUrl ?? undefined} alt="" />
          <AvatarFallback>{crmInitials(name)}</AvatarFallback>
        </Avatar>
      </SharedNamedViewTransition>
      <span className="flex min-w-0 flex-col">
        <SharedNamedViewTransition
          name={crmRecordTitleTransitionName(record.id)}
        >
          <span className="truncate text-sm font-medium text-foreground">
            {name}
          </span>
        </SharedNamedViewTransition>
        {/* The title's full text is also in the control's name. */}
        <CrmRecordSubline
          recordType={recordType}
          owner={owner}
          subline={subline}
        />
      </span>
    </DataGridRowPrimary>
  );
}

/** Row menu: open the record (the row's own action) or copy the email. */
export function CrmRecordActions({
  record,
  onViewRecord,
}: {
  record: CrmGridRow;
  onViewRecord: (row: CrmGridRow) => void;
}) {
  const email = record.email;
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`CRM actions for ${record.displayName ?? "CRM record"}`}
              variant="ghost"
              size="icon-sm"
              // The grid row opens the record on click. A press on the menu
              // trigger (mouse, or Enter's click) must only open the menu;
              // otherwise the record's modal sheet takes focus and closes it.
              // Menu items render in a portal, which the row already ignores.
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal aria-hidden="true" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewRecord(record)}>
              Open details
            </DropdownMenuItem>
            {email ? (
              <DropdownMenuItem
                onClick={() => {
                  void navigator.clipboard
                    .writeText(email)
                    .then(() => toast.success("Email copied."))
                    .catch(() => toast.error("Could not copy the email."));
                }}
              >
                Copy email
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function getCrmColumns({
  onViewRecord,
}: ColumnOptions): DataGridColumnDef<CrmGridRow>[] {
  return [
    {
      id: "displayName",
      accessorFn: (row) => row.displayName ?? "",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row, table }) => (
        <CrmRecordIdentity
          record={row.original}
          onOpen={onViewRecord}
          // Kept (sorted or filtered) columns stay visible, so their value
          // is never repeated here.
          showType={table.getColumn("recordType")?.getIsVisible() === false}
          showOwner={
            table.getColumn("assignedMissionaryName")?.getIsVisible() === false
          }
        />
      ),
      filterFn: filterFn_includesString,
      size: 260,
      // Record identity before tags: long organisation names stay readable,
      // so a 1440px viewport (panel 1172px) uses the tier without tags (still
      // in View). The name takes every pixel the other columns leave.
      minSize: 280,
      enableHiding: false,
      meta: { headerTitle: "Name" },
    },
    {
      accessorKey: "recordType",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => (
        <TextCell
          value={
            row.original.recordType ? toCrmLabel(row.original.recordType) : null
          }
        />
      ),
      filterFn: cellIsOneOf,
      size: 110,
      meta: { headerTitle: "Type" },
    },
    {
      accessorKey: "assignedMissionaryName",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => (
        <TextCell value={row.original.assignedMissionaryName} />
      ),
      size: 174,
      enableSorting: false,
      meta: { headerTitle: "Owner" },
    },
    {
      accessorKey: "primaryContactLine",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => <TextCell value={row.original.primaryContactLine} />,
      size: 200,
      enableSorting: false,
      meta: { headerTitle: "Primary contact" },
    },
    {
      accessorKey: "location",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => <TextCell value={row.original.location} />,
      size: 150,
      enableSorting: false,
      meta: { headerTitle: "Location" },
    },
    {
      accessorKey: "lifecycleStatus",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => (
        <CrmStatusBadge status={row.original.lifecycleStatus} />
      ),
      filterFn: cellIsOneOf,
      size: 94,
      meta: { headerTitle: "Status" },
    },
    {
      accessorKey: "lastGiftAt",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => <DateCell value={row.original.lastGiftAt} />,
      // Room for the sort icon before the next (right-aligned) header.
      size: 124,
      meta: { headerTitle: "Last gift" },
    },
    {
      accessorKey: "lifetimeGiving",
      header: ({ column }) => (
        <div className="flex justify-end">
          <DataGridColumnHeader column={column} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-end text-sm font-medium whitespace-nowrap text-foreground tabular-nums">
          {formatCrmMoneyCents(row.original.lifetimeGiving)}
        </div>
      ),
      size: 140,
      meta: { headerTitle: "Lifetime giving" },
    },
    {
      accessorKey: "lastTouchAt",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => <DateCell value={row.original.lastTouchAt} />,
      size: 112,
      // The record's last update (donors.updated_at), not its last
      // interaction. The id stays lastTouchAt for saved sorts and links.
      meta: { headerTitle: "Updated" },
    },
    {
      accessorKey: "portalAccessLabel",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) =>
        row.original.portalAccessLabel === "linked" ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
            <Link2 aria-hidden="true" className="size-3.5 text-success" />
            Linked
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">None</span>
        ),
      filterFn: cellIsOneOf,
      size: 100,
      enableSorting: false,
      meta: { headerTitle: "Portal" },
    },
    {
      accessorKey: "tags",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => {
        const tags = row.original.tags ?? [];
        if (tags.length === 0) return <CrmEmptyValue />;
        const [first, ...rest] = tags;
        return (
          <div
            className="flex min-w-0 items-center gap-1"
            title={tags.join(", ")}
          >
            <span className="flex min-w-0">
              <Badge variant="outline" className="max-w-full">
                <span className="truncate">{first}</span>
              </Badge>
            </span>
            {rest.length > 0 ? (
              <span className="relative shrink-0 text-xs text-muted-foreground tabular-nums">
                +{rest.length}
                <span className="sr-only"> more: {rest.join(", ")}</span>
              </span>
            ) : null}
          </div>
        );
      },
      filterFn: cellTagsIncludeAny,
      // Fits a typical tag ("monthly-donor") plus its "+1" count untruncated.
      size: 148,
      enableSorting: false,
      meta: { headerTitle: "Tags" },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <CrmRecordActions record={row.original} onViewRecord={onViewRecord} />
      ),
      size: 52,
      enableHiding: false,
      enableSorting: false,
      meta: { headerTitle: "Actions" },
    },
  ];
}
