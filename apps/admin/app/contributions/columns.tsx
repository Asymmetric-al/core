"use client";

import {
  formatSharedContributionAmount,
  SHARED_PAYMENT_STATUS_LABELS,
  SHARED_RECEIPT_STATUS_LABELS,
  type SharedContributionReceiptStatus,
} from "@asym/api/admin/contribution-shared";
import { getInitials } from "@asym/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { cn } from "@asym/ui/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Banknote,
  Building2,
  CircleCheck,
  Clock,
  Copy,
  CreditCard,
  Eye,
  FileText,
  Globe,
  MoreHorizontal,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type {
  Contribution,
  ContributionSource,
  ContributionStatus,
  PaymentMethod,
} from "./types";

const statusConfig: Record<
  ContributionStatus,
  { icon: typeof CircleCheck; className: string }
> = {
  completed: {
    icon: CircleCheck,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
  },
  pending: {
    icon: Clock,
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  },
  processing: {
    icon: Clock,
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
  },
  failed: {
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
  },
  refunded: {
    icon: RotateCcw,
    className:
      "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-950/50 dark:text-zinc-400 dark:border-zinc-800",
  },
};

const receiptStatusConfig: Record<
  SharedContributionReceiptStatus,
  { icon: typeof CircleCheck; className: string }
> = {
  sent: {
    icon: CircleCheck,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
  },
  pending: {
    icon: Clock,
    className:
      "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-950/50 dark:text-zinc-400 dark:border-zinc-800",
  },
  failed: {
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
  },
  not_sent: {
    icon: Clock,
    className:
      "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-950/50 dark:text-zinc-400 dark:border-zinc-800",
  },
};

function paymentStatusLabel(status: ContributionStatus): string {
  if (status === "processing") {
    return "Processing";
  }
  return SHARED_PAYMENT_STATUS_LABELS[status];
}

const paymentMethodIcons: Record<PaymentMethod, typeof CreditCard> = {
  "Credit Card": CreditCard,
  "Bank Transfer": Building2,
  Check: FileText,
  Cash: Banknote,
  PayPal: Globe,
  Other: CreditCard,
};

const sourceLabels: Record<ContributionSource, string> = {
  Online: "Online",
  Mobile: "Mobile",
  "In-person": "In-person",
  Mail: "Mail",
  Phone: "Phone",
  Import: "Import",
};

export function getContributionColumns({
  onViewContribution,
}: {
  onViewContribution: (contribution: Contribution) => void;
}): ColumnDef<Contribution>[] {
  return [
    {
      accessorKey: "donorName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Donor / Entity" />
      ),
      cell: ({ row }) => {
        const contribution = row.original;
        const donorName = contribution.isAnonymous
          ? "Anonymous"
          : contribution.donorName;

        return (
          <div className="flex items-center gap-3 min-w-[240px]">
            <Avatar className="size-9 border border-border/60">
              <AvatarImage
                src={contribution.donorAvatar ?? undefined}
                alt={donorName}
              />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                {contribution.isAnonymous ? "?" : getInitials(donorName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-sm text-foreground">
                {donorName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {contribution.organizationName ||
                  contribution.donorEmail ||
                  contribution.donorType ||
                  "No donor details"}
              </span>
            </div>
          </div>
        );
      },
      enableSorting: false,
      meta: {
        label: "Donor / Entity",
        sticky: "left",
      },
    },
    {
      accessorKey: "amountGross",
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
        <div className="text-right font-semibold text-foreground tabular-nums">
          {formatSharedContributionAmount(
            row.original.shared.amountCents,
            row.original.shared.currencyCode,
          )}
        </div>
      ),
      enableSorting: true,
      meta: {
        label: "Amount",
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
      enableSorting: true,
      meta: {
        label: "Date",
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status as ContributionStatus;
        const config = statusConfig[status];
        const Icon = config.icon;

        return (
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 font-medium text-xs px-2 py-0.5",
              config.className,
            )}
          >
            <Icon className="size-3" />
            {paymentStatusLabel(status)}
          </Badge>
        );
      },
      enableSorting: true,
      meta: {
        label: "Status",
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium text-xs">
          {row.original.type}
        </Badge>
      ),
      enableSorting: false,
      meta: {
        label: "Type",
      },
    },
    {
      accessorKey: "fundName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fund / Designation" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {row.original.shared.designationSummary.fundName}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.fundCode || "GENERAL"}
          </span>
        </div>
      ),
      enableSorting: false,
      meta: {
        label: "Fund / Designation",
      },
    },
    {
      accessorKey: "missionaryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recipient" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.missionaryName || "Unassigned"}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: "Recipient",
      },
    },
    {
      accessorKey: "paymentMethod",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Method" />
      ),
      cell: ({ row }) => {
        const method = row.original.paymentMethod as PaymentMethod;
        const Icon = paymentMethodIcons[method];

        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="size-4" />
            <span>{method}</span>
          </div>
        );
      },
      enableSorting: true,
      meta: {
        label: "Payment Method",
      },
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {sourceLabels[row.original.source as ContributionSource]}
        </span>
      ),
      enableSorting: true,
      meta: {
        label: "Source",
      },
    },
    {
      accessorKey: "receiptStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Receipt" />
      ),
      cell: ({ row }) => {
        const receiptStatus = row.original.shared.receiptStatus;
        const config = receiptStatusConfig[receiptStatus];
        const Icon = config.icon;
        return (
          <Badge
            variant="outline"
            className={cn("gap-1 text-xs", config.className)}
          >
            <Icon className="size-3" />
            {SHARED_RECEIPT_STATUS_LABELS[receiptStatus]}
          </Badge>
        );
      },
      enableSorting: false,
      meta: {
        label: "Receipt",
      },
    },
    {
      accessorKey: "donorType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Donor Type" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground capitalize">
          {row.original.donorType || "individual"}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: "Donor Type",
      },
    },
    {
      accessorKey: "amountNet",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader
            className="justify-end"
            column={column}
            title="Net Amount"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-semibold text-foreground tabular-nums">
          {row.original.amountNet != null
            ? formatSharedContributionAmount(
                row.original.amountNet,
                row.original.shared.currencyCode,
              )
            : "Unavailable"}
        </div>
      ),
      enableSorting: false,
      meta: {
        label: "Net Amount",
      },
    },
    {
      accessorKey: "entryMethod",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Entry Method" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground capitalize">
          {row.original.entryMethod}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: "Entry Method",
      },
    },
    {
      accessorKey: "transactionId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.transactionId || "Unavailable"}
        </span>
      ),
      enableSorting: false,
      meta: {
        label: "Transaction ID",
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contribution = row.original;
        const donorName = contribution.isAnonymous
          ? "Anonymous"
          : contribution.donorName;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="size-8 p-0"
                aria-label={`Contribution actions for ${donorName}`}
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(
                    contribution.transactionId ?? contribution.id,
                  )
                }
              >
                <Copy className="mr-2 size-4" />
                Copy Transaction ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onViewContribution(contribution)}
              >
                <Eye className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      meta: {
        sticky: "right",
      },
    },
  ];
}
