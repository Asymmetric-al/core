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
import { ChevronRight } from "lucide-react";
import * as React from "react";

import {
  formatCurrency,
  getGiftTypeIcon,
  getStatusBadge,
} from "./donors-model";
import { parseDisplayDate } from "./donors-page-dates";

import type { Activity, Donor } from "./donor-types";

/**
 * Photo, name, whether they give monthly, where they are and what they've
 * given. Spans only, so it can sit inside a button.
 */
function PartnerSummary({
  donor,
  isSelected = false,
}: {
  donor: Donor;
  isSelected?: boolean;
}) {
  return (
    <span className="flex items-center gap-3 py-1">
      <span className="relative shrink-0">
        {/* The open partner's photo takes a primary edge; a filled disc
            would read as heavy as the keyboard focus ring. The name follows,
            so the photo and initials stay out of the control's name. */}
        <Avatar
          aria-hidden
          className={cn(
            "size-10 border-2",
            isSelected ? "border-primary" : "border-background shadow-sm",
          )}
        >
          <AvatarImage src={donor.avatar_url} />
          <AvatarFallback className="text-xs font-semibold text-muted-foreground">
            {donor.initials}
          </AvatarFallback>
        </Avatar>
      </span>
      <span className="block min-w-0 flex-1">
        {/* Table cells size to their content, so nowrap truncation would
            push Status off a narrow roster. Names wrap (two lines max) and
            locations clamp to one line instead. */}
        <span className="mb-0.5 flex items-start justify-between gap-1">
          <span className="line-clamp-2 whitespace-normal break-words font-semibold text-sm text-foreground">
            {donor.name}
          </span>
          {donor.has_active_pledge ? (
            <Badge variant="secondary" className="shrink-0">
              Monthly
            </Badge>
          ) : null}
        </span>
        <span className="flex items-center justify-between">
          <span className="line-clamp-1 min-w-0 whitespace-normal text-xs text-muted-foreground">
            {donor.location || (donor.is_anonymous ? "Private" : "No location")}
          </span>
          <span className="shrink-0 pl-2 text-xs font-semibold tabular-nums text-foreground">
            {/* Everything given, not a monthly figure beside "Monthly". */}
            {`${formatCurrency(donor.total_given, null)} given`}
          </span>
        </span>
      </span>
    </span>
  );
}

/**
 * The open partner and how to open one. Roster cells read them here:
 * rebuilding the columns on each selection would remount every cell and drop
 * focus from the button that was just pressed.
 */
export const RosterOpenPartnerContext = React.createContext<{
  openId: string | null;
  open: (id: string) => void;
}>({ openId: null, open: () => {} });

/**
 * A partner in the wide roster. The button gives keyboard users a tab stop
 * for every partner, and `aria-current` names the one that is open.
 */
function PartnerRowButton({ donor }: { donor: Donor }) {
  const { openId, open } = React.use(RosterOpenPartnerContext);
  const isSelected = openId === donor.id;
  return (
    <button
      type="button"
      aria-current={isSelected ? "true" : undefined}
      onClick={(event) => {
        // The row opens the partner on click too; open it once.
        event.stopPropagation();
        open(donor.id);
      }}
      className="block w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <PartnerSummary donor={donor} isSelected={isSelected} />
    </button>
  );
}

/** A partner on phones: the same summary, the status, and a way in. */
export function PartnerCard({
  donor,
  onOpen,
}: {
  donor: Donor;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="press-feedback flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted/50"
    >
      <span className="min-w-0 flex-1">
        <PartnerSummary donor={donor} />
      </span>
      {getStatusBadge(donor.status)}
      <ChevronRight
        aria-hidden
        className="size-4 shrink-0 text-muted-foreground"
      />
    </button>
  );
}

export function createDonorColumns(): ColumnDef<Donor>[] {
  return [
    {
      accessorKey: "name",
      // The Sort menu orders the roster; headers are plain titles.
      enableSorting: false,
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Partner" />
      ),
      cell: ({ row }) => <PartnerRowButton donor={row.original} />,
    },
    {
      accessorKey: "status",
      enableSorting: false,
      enableHiding: false,
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
          {formatCurrency(row.original.total_given, null)}
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
          {formatCurrency(row.original.amount, row.original.currency)}
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
            "font-semibold rounded-full uppercase tracking-widest border-0",
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
