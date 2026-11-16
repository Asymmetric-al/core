"use client";

import { formatCurrency } from "@asym/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  type Column,
  type ColumnDef,
} from "@asym/ui/components/shadcn/data-table/tanstack";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ChevronsUpDown, Download } from "lucide-react";
import Link from "next/link";

import { GIFT_TYPE_LABELS, STATUS_VARIANTS, type Transaction } from "./types";

import { makeDisplayDate } from "@/lib/dates";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "?"
  );
}

const SORT_STATE = {
  asc: { icon: ArrowUp, label: ", sorted ascending" },
  desc: { icon: ArrowDown, label: ", sorted descending" },
} as const;

function SortableHeader({
  column,
  title,
  align = "start",
}: {
  column: Column<Transaction, unknown>;
  title: string;
  align?: "start" | "end";
}) {
  const sorted = column.getIsSorted();
  const state = sorted ? SORT_STATE[sorted] : null;
  const Icon = state?.icon ?? ChevronsUpDown;
  return (
    <Button
      variant="ghost"
      size="xs"
      className={align === "end" ? "-mr-2" : "-ml-2"}
      onClick={column.getToggleSortingHandler()}
    >
      {title}
      {state ? <span className="sr-only">{state.label}</span> : null}
      <Icon aria-hidden data-icon="inline-end" />
    </Button>
  );
}

function receiptLabel(tx: Transaction) {
  const date = format(makeDisplayDate(tx.date), "MMM d, yyyy");
  return `Download receipt for ${tx.recipient}, ${date}, ${formatCurrency(tx.amount)}`;
}

/** Only paid gifts have a receipt; a refunded gift's receipt no longer counts. */
export function ReceiptLink({ tx }: { tx: Transaction }) {
  if (tx.status !== "Paid") {
    return <span className="sr-only">No receipt</span>;
  }
  return (
    <a
      href={tx.receiptUrl}
      download
      aria-label={receiptLabel(tx)}
      className={buttonVariants({ variant: "ghost", size: "sm" })}
    >
      <Download data-icon="inline-start" aria-hidden />
      Receipt
    </a>
  );
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => <SortableHeader column={column} title="Date" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-foreground">
        {format(makeDisplayDate(row.getValue("date")), "MMM d, yyyy")}
      </span>
    ),
    meta: { label: "Date" },
  },
  {
    accessorKey: "recipient",
    header: ({ column }) => <SortableHeader column={column} title="Gift to" />,
    cell: ({ row }) => {
      const tx = row.original;
      return (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            {tx.recipientAvatar ? (
              <AvatarImage src={tx.recipientAvatar} alt="" />
            ) : null}
            <AvatarFallback>{initials(tx.recipient)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {tx.recipient}
            </p>
            {tx.type === "Recurring" ? (
              <Link
                href="/donor-dashboard/pledges"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {GIFT_TYPE_LABELS.Recurring}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                {GIFT_TYPE_LABELS["One-Time"]}
              </p>
            )}
          </div>
        </div>
      );
    },
    meta: { label: "Gift to" },
  },
  {
    accessorKey: "fund",
    header: ({ column }) => <SortableHeader column={column} title="Fund" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.fund ?? "General support"}
      </span>
    ),
    meta: { label: "Fund" },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="flex justify-end">
        <SortableHeader column={column} title="Amount" align="end" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="text-right text-sm font-medium tabular-nums text-foreground">
        {formatCurrency(row.getValue("amount"))}
      </p>
    ),
    meta: { label: "Amount" },
  },
  {
    accessorKey: "method",
    header: ({ column }) => <SortableHeader column={column} title="Payment" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {row.original.method}
      </span>
    ),
    meta: { label: "Payment" },
  },
  {
    accessorKey: "type",
    header: "Type",
    enableHiding: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    meta: { label: "Type" },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    meta: { label: "Status" },
  },
  {
    id: "receipt",
    header: () => <span className="sr-only">Receipt</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ReceiptLink tx={row.original} />
      </div>
    ),
    // Keep the receipt in view when the table scrolls sideways.
    meta: { label: "Receipt", sticky: "right" },
  },
];
