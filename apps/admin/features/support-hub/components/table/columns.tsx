"use client";

import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table";

import {
  AssigneeCell,
  DonorCell,
  InboxCell,
  LabelsCell,
  PriorityCell,
  RelativeTimeCell,
  StatusCell,
  SubjectCell,
  WaitingTimeCell,
} from "./cells";

import type { SupportConversation } from "../../types";
import type { ColumnDef } from "@tanstack/react-table";

export const supportConversationColumns: ColumnDef<SupportConversation>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
        {row.original.id.replace(/^conv-/, "")}
      </span>
    ),
    enableSorting: true,
    enableHiding: true,
    size: 80,
    meta: { label: "ID" },
  },
  {
    id: "donor",
    accessorFn: (row) => row.externalContactName ?? row.externalContactEmail,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Donor" />
    ),
    cell: ({ row }) => <DonorCell row={row.original} />,
    enableSorting: true,
    enableHiding: true,
    size: 220,
    meta: { label: "Donor" },
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subject" />
    ),
    cell: ({ row }) => <SubjectCell row={row.original} />,
    enableSorting: true,
    enableHiding: false,
    size: 320,
    meta: { label: "Subject" },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <StatusCell status={row.original.status} />,
    enableSorting: true,
    enableHiding: true,
    size: 110,
    meta: { label: "Status" },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => <PriorityCell priority={row.original.priority} />,
    enableSorting: true,
    enableHiding: true,
    size: 100,
    meta: { label: "Priority" },
  },
  {
    id: "assignee",
    accessorFn: (row) => row.assignee?.name ?? "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assignee" />
    ),
    cell: ({ row }) => <AssigneeCell assignee={row.original.assignee} />,
    enableSorting: true,
    enableHiding: true,
    size: 180,
    meta: { label: "Assignee" },
  },
  {
    id: "labels",
    accessorFn: (row) => row.labels.map((label) => label.slug).join(","),
    header: "Labels",
    cell: ({ row }) => <LabelsCell labels={row.original.labels} />,
    enableSorting: false,
    enableHiding: true,
    size: 200,
    meta: { label: "Labels" },
  },
  {
    accessorKey: "lastMessageAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last activity" />
    ),
    cell: ({ row }) => <RelativeTimeCell value={row.original.lastMessageAt} />,
    enableSorting: true,
    enableHiding: true,
    size: 130,
    meta: { label: "Last activity" },
  },
  {
    id: "waitingTime",
    accessorFn: (row) => row.lastCustomerMessageAt ?? row.lastMessageAt ?? "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Waiting" />
    ),
    cell: ({ row }) => <WaitingTimeCell row={row.original} />,
    enableSorting: true,
    enableHiding: true,
    size: 110,
    meta: { label: "Waiting" },
  },
  {
    accessorKey: "inboxId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inbox" />
    ),
    cell: ({ row }) => <InboxCell inboxId={row.original.inboxId} />,
    enableSorting: true,
    enableHiding: true,
    size: 160,
    meta: { label: "Inbox" },
  },
];
