"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CircleCheck,
  XCircle,
  Clock,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  Building2,
  FileText,
  Banknote,
  Globe,
  MoreHorizontal,
  Mail,
  Receipt,
  Eye,
  Copy,
  RefreshCcw,
} from "lucide-react";
import { formatCurrency, cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import type {
  Contribution,
  ContributionStatus,
  PaymentMethod,
  ContributionSource,
} from "./types";

const statusConfig: Record<
  ContributionStatus,
  { icon: typeof CircleCheck; className: string }
> = {
  Succeeded: {
    icon: CircleCheck,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
  },
  Pending: {
    icon: Clock,
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  },
  Failed: {
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
  },
  Refunded: {
    icon: RotateCcw,
    className:
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/50 dark:text-slate-400 dark:border-slate-800",
  },
  Disputed: {
    icon: AlertTriangle,
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
  },
};

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

export const columns: ColumnDef<Contribution>[] = [
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
              {isAnonymous ? "?" : getInitials(donor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground">
              {isAnonymous ? "Anonymous" : donor.name}
            </span>
            {!isAnonymous && donor.email && (
              <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                {donor.email}
              </span>
            )}
          </div>
        </div>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      const donor = row.original.donor;
      const searchValue = value.toLowerCase();
      return (
        donor.name.toLowerCase().includes(searchValue) ||
        donor.email.toLowerCase().includes(searchValue)
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return (
        <div className="font-semibold text-foreground tabular-nums">
          {formatCurrency(amount)}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date") as string);
      return (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as ContributionStatus;
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
          <Icon className="h-3 w-3" />
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant="secondary" className="font-medium text-xs">
          {type}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
  },
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
          <Icon className="h-4 w-4" />
          <span>{method}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
  },
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
          <span className="text-xs text-muted-foreground">{fundCode}</span>
        </div>
      );
    },
    enableSorting: true,
  },
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
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
  },
  {
    accessorKey: "receiptSent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Receipt" />
    ),
    cell: ({ row }) => {
      const sent = row.getValue("receiptSent") as boolean;
      return (
        <div className="flex items-center gap-1.5">
          {sent ? (
            <Badge
              variant="outline"
              className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
            >
              <CircleCheck className="h-3 w-3" />
              Sent
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 bg-slate-50 text-slate-500 border-slate-200 text-xs"
            >
              <Clock className="h-3 w-3" />
              Pending
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contribution = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(contribution.transactionId)
              }
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Email Donor
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Receipt className="mr-2 h-4 w-4" />
              Send Receipt
            </DropdownMenuItem>
            {contribution.status === "Failed" && (
              <DropdownMenuItem>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry Payment
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
