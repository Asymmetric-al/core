"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table";
import { cn, formatCurrency } from "@asym/lib/utils";
import type { Contact } from "./types";
import { STAGE_COLORS } from "./types";

interface ColumnOptions {
  onViewContact: (contact: Contact) => void;
}

export function getColumns({
  onViewContact,
}: ColumnOptions): ColumnDef<Contact>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={contact.avatar} />
              <AvatarFallback className="text-[10px] font-semibold bg-primary text-primary-foreground">
                {contact.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <button
                onClick={() => onViewContact(contact)}
                className="font-semibold text-sm text-foreground leading-none hover:text-primary hover:underline decoration-primary/30 underline-offset-4 transition-all text-left"
              >
                {contact.name}
              </button>
              <span className="text-xs text-muted-foreground mt-0.5">
                {contact.title}
              </span>
            </div>
          </div>
        );
      },
      meta: {
        label: "Name",
      },
    },
    {
      accessorKey: "company",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Company" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-medium">
          {row.getValue("company")}
        </span>
      ),
      meta: {
        label: "Company",
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("email")}
        </span>
      ),
      enableHiding: true,
      meta: {
        label: "Email",
      },
    },
    {
      accessorKey: "stage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stage" />
      ),
      cell: ({ row }) => {
        const stage = row.getValue("stage") as string;
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] uppercase font-semibold tracking-wide px-2.5 py-0.5 h-6 shadow-none rounded-lg border-transparent",
              STAGE_COLORS[stage as keyof typeof STAGE_COLORS],
            )}
          >
            {stage}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      meta: {
        label: "Stage",
        filterVariant: "select",
        filterOptions: [
          { label: "New", value: "New" },
          { label: "Contacted", value: "Contacted" },
          { label: "Meeting", value: "Meeting" },
          { label: "Proposal", value: "Proposal" },
          { label: "Won", value: "Won" },
        ],
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader
            column={column}
            title="Value"
            className="justify-end"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono font-bold text-foreground tabular-nums">
          {formatCurrency(row.getValue("value"))}
        </div>
      ),
      meta: {
        label: "Value",
      },
    },
    {
      accessorKey: "owner",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Owner" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("owner")}
        </span>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      meta: {
        label: "Owner",
        filterVariant: "select",
        filterOptions: [
          { label: "Me", value: "Me" },
          { label: "Sarah", value: "Sarah" },
        ],
      },
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {row.getValue("city")}
        </span>
      ),
      enableHiding: true,
      meta: {
        label: "City",
      },
    },
    {
      accessorKey: "lastActivity",
      header: "Last Activity",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.getValue("lastActivity")}
        </span>
      ),
      enableHiding: true,
      meta: {
        label: "Last Activity",
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-xl"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(contact.email)}
                  className="rounded-lg"
                >
                  Copy Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onViewContact(contact)}
                  className="rounded-lg"
                >
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg">
                  Log Activity
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg">
                  Schedule Meeting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
