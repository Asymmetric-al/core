"use client";

import { formatCurrency } from "@asym/lib/utils";
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
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { cn } from "@asym/ui/lib/utils";
import {
  CreditCard,
  Building2,
  FileText,
  Banknote,
  Globe,
  MoreHorizontal,
  Eye,
  Copy,
} from "lucide-react";

import {
  contributionStatusDotColor,
  formatContributionDate,
  getContributionDonorInitials,
  getContributionDonorName,
  getContributionReceiptDotColor,
  getContributionReceiptLabel,
} from "./display";

import type {
  Contribution,
  ContributionStatus,
  PaymentMethod,
  ContributionSource,
} from "./types";
import type { ColumnDef } from "@tanstack/react-table";

/* ------------------------------------------------------------------ */
/*  Payment method icons                                               */
/* ------------------------------------------------------------------ */

const paymentMethodIcons: Record<PaymentMethod, typeof CreditCard> = {
  "Credit Card": CreditCard,
  "Bank Transfer": Building2,
  Check: FileText,
  Cash: Banknote,
  PayPal: Globe,
  Other: CreditCard,
};

/* ------------------------------------------------------------------ */
/*  Source labels                                                       */
/* ------------------------------------------------------------------ */

const sourceLabels: Record<ContributionSource, string> = {
  Online: "Online",
  Mobile: "Mobile",
  "In-person": "In-person",
  Mail: "Mail",
  Phone: "Phone",
  Import: "Import",
};

/* ------------------------------------------------------------------ */
/*  Column factory                                                      */
/* ------------------------------------------------------------------ */

interface ColumnOptions {
  onViewContribution: (contribution: Contribution) => void;
}

export function getColumns({
  onViewContribution,
}: ColumnOptions): ColumnDef<Contribution>[] {
  return [
    /* ---- Donor ---- */
    {
      accessorKey: "donor",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Donor" />
      ),
      cell: ({ row }) => {
        const donor = row.original.donor;
        const isAnonymous = row.original.isAnonymous;

        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={donor.avatar} alt={donor.name} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                {getContributionDonorInitials(row.original)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => onViewContribution(row.original)}
                className="text-sm font-semibold text-foreground leading-none hover:underline decoration-foreground/30 underline-offset-4 transition-all text-left"
              >
                {getContributionDonorName(row.original)}
              </button>
              {!isAnonymous && donor.email && (
                <span className="text-xs text-muted-foreground truncate max-w-[180px] mt-0.5">
                  {donor.email}
                </span>
              )}
            </div>
          </div>
        );
      },
      enableSorting: true,
      filterFn: (row, _id, value) => {
        const donor = row.original.donor;
        const searchValue = (value as string).toLowerCase();
        return (
          donor.name.toLowerCase().includes(searchValue) ||
          donor.email.toLowerCase().includes(searchValue)
        );
      },
      meta: { label: "Donor" },
    },

    /* ---- Amount ---- */
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Amount"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        return (
          <div className="text-right font-mono text-sm font-semibold text-foreground tabular-nums">
            {formatCurrency(amount)}
          </div>
        );
      },
      enableSorting: true,
      meta: { label: "Amount" },
    },

    /* ---- Date ---- */
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formatContributionDate(row.getValue("date") as string)}
          </span>
        );
      },
      enableSorting: true,
      meta: { label: "Date" },
    },

    /* ---- Status ---- */
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as ContributionStatus;
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                contributionStatusDotColor[status],
              )}
            />
            <span className="text-sm font-medium text-foreground">
              {status}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return (value as string[]).includes(row.getValue(id));
      },
      enableSorting: true,
      meta: { label: "Status" },
    },

    /* ---- Type ---- */
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="secondary" className="text-xs font-medium">
            {type}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return (value as string[]).includes(row.getValue(id));
      },
      enableSorting: true,
      meta: { label: "Type" },
    },

    /* ---- Payment Method ---- */
    {
      accessorKey: "paymentMethod",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment" />
      ),
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as PaymentMethod;
        const Icon = paymentMethodIcons[method];

        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="size-4 shrink-0" />
            <span>{method}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return (value as string[]).includes(row.getValue(id));
      },
      enableSorting: true,
      meta: { label: "Payment" },
    },

    /* ---- Fund ---- */
    {
      accessorKey: "fundName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fund" />
      ),
      cell: ({ row }) => {
        const fundName = row.getValue("fundName") as string;
        const fundCode = row.original.fundCode;

        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {fundName}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {fundCode}
            </span>
          </div>
        );
      },
      enableSorting: true,
      meta: { label: "Fund" },
    },

    /* ---- Source ---- */
    {
      accessorKey: "source",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source" />
      ),
      cell: ({ row }) => {
        const source = row.getValue("source") as ContributionSource;
        return (
          <span className="text-sm text-muted-foreground">
            {sourceLabels[source]}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        return (value as string[]).includes(row.getValue(id));
      },
      enableSorting: true,
      enableHiding: true,
      meta: { label: "Source" },
    },

    /* ---- Receipt ---- */
    {
      accessorKey: "receiptSent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Receipt" />
      ),
      cell: ({ row }) => {
        const sent = row.getValue("receiptSent") as boolean;
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                getContributionReceiptDotColor(sent),
              )}
            />
            <span className="text-sm text-muted-foreground">
              {getContributionReceiptLabel(sent)}
            </span>
          </div>
        );
      },
      enableSorting: true,
      meta: { label: "Receipt" },
    },

    /* ---- Transaction ID (hidden by default) ---- */
    {
      accessorKey: "transactionId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => {
        const txnId = row.getValue("transactionId") as string;
        return (
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {txnId}
          </span>
        );
      },
      enableHiding: true,
      enableSorting: false,
      meta: { label: "Transaction ID" },
    },

    /* ---- Actions ---- */
    {
      id: "actions",
      cell: ({ row }) => {
        const contribution = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(contribution.transactionId)
                  }
                >
                  <Copy className="mr-2 size-4" />
                  Copy Transaction ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onViewContribution(contribution)}
                >
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
