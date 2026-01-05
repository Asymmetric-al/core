'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { CheckCircle2, XCircle, Clock, MoreHorizontal, DownloadCloud, ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { cn, formatCurrency } from '@/lib/utils'
import type { Transaction } from './types'
import { STATUS_COLORS } from './types'

const getStatusIcon = (status: Transaction['status']) => {
  switch (status) {
    case 'Succeeded': return <CheckCircle2 className="w-3.5 h-3.5" />
    case 'Processing': return <Clock className="w-3.5 h-3.5" />
    case 'Failed': return <XCircle className="w-3.5 h-3.5" />
    default: return null
  }
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground whitespace-nowrap">
        {format(new Date(row.getValue("date")), "MMM d, yyyy")}
      </span>
    ),
    meta: {
      label: "Date",
    },
  },
  {
    accessorKey: "recipient",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Recipient" />,
    cell: ({ row }) => {
      const tx = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={tx.recipientAvatar} alt={tx.recipient} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
              {tx.recipient[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-semibold text-foreground leading-none mb-1">{tx.recipient}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">{tx.type}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{tx.method} ••{tx.last4}</span>
            </div>
          </div>
        </div>
      )
    },
    meta: {
      label: "Recipient",
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] uppercase font-semibold tracking-wide shadow-none rounded-lg">
        {row.getValue("category")}
      </Badge>
    ),
    enableHiding: true,
    meta: {
      label: "Category",
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Amount" className="justify-end" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono font-bold text-foreground tabular-nums">
        {formatCurrency(row.getValue("amount"))}
      </div>
    ),
    meta: {
      label: "Amount",
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    enableHiding: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: {
      label: "Type",
      filterVariant: "select",
      filterOptions: [
        { label: "Recurring", value: "Recurring" },
        { label: "One-Time", value: "One-Time" },
      ],
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as Transaction['status']
      return (
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] uppercase font-semibold tracking-wide pl-1.5 pr-2.5 h-6 gap-1.5 shadow-none rounded-lg border-transparent",
            STATUS_COLORS[status]
          )}
        >
          {getStatusIcon(status)}
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: {
      label: "Status",
      filterVariant: "select",
      filterOptions: [
        { label: "Succeeded", value: "Succeeded" },
        { label: "Processing", value: "Processing" },
        { label: "Failed", value: "Failed" },
      ],
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tx = row.original
      return (
        <div className="flex justify-end gap-2">
          {tx.status === 'Succeeded' && (
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg">
              <DownloadCloud className="w-3.5 h-3.5 mr-1.5" /> Receipt
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem className="rounded-lg">View Details</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">Manage Recurring</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg">
                <ExternalLink className="w-3 h-3 mr-2" /> Open Statement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
