"use client";

import {
  createDataGridSelectionColumn,
  DataGridRowPrimary,
  type DataGridColumnDef,
} from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";

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

const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 } as const;

/**
 * Conversation columns on Core's shared ReUI grid. The subject is the row's
 * primary control, so keyboard users open a conversation the same way a
 * row click does.
 */
export function createSupportConversationColumns(
  onOpen: (id: string) => void,
): DataGridColumnDef<SupportConversation>[] {
  return [
    createDataGridSelectionColumn<SupportConversation>({
      getRowLabel: (row) =>
        `${row.subject} from ${row.externalContactName ?? row.externalContactEmail}`,
    }) as DataGridColumnDef<SupportConversation>,
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => (
        <DataGridRowPrimary onClick={() => onOpen(row.original.id)}>
          <SubjectCell row={row.original} />
        </DataGridRowPrimary>
      ),
      enableHiding: false,
      size: 240,
      meta: { headerTitle: "Subject" },
    },
    {
      id: "donor",
      accessorFn: (row) => row.externalContactName ?? row.externalContactEmail,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Donor" />
      ),
      cell: ({ row }) => <DonorCell row={row.original} />,
      size: 170,
      meta: { headerTitle: "Donor" },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusCell status={row.original.status} />,
      size: 100,
      meta: { headerTitle: "Status" },
    },
    {
      id: "priority",
      accessorFn: (row) => PRIORITY_ORDER[row.priority],
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => <PriorityCell priority={row.original.priority} />,
      size: 90,
      meta: { headerTitle: "Priority" },
    },
    {
      id: "assignee",
      accessorFn: (row) => row.assignee?.name ?? "",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Assignee" />
      ),
      cell: ({ row }) => <AssigneeCell assignee={row.original.assignee} />,
      size: 140,
      meta: { headerTitle: "Assignee" },
    },
    {
      id: "labels",
      accessorFn: (row) => row.labels.map((label) => label.name).join(", "),
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Labels" />
      ),
      // While the Priority column shows, a label of the same name would
      // repeat it (the board drops it too); hidden, the label stays.
      cell: ({ row, table }) => (
        <LabelsCell
          labels={row.original.labels}
          shownPriority={
            table.getColumn("priority")?.getIsVisible()
              ? row.original.priority
              : undefined
          }
        />
      ),
      enableSorting: false,
      size: 150,
      meta: { headerTitle: "Labels" },
    },
    {
      accessorKey: "lastMessageAt",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Last activity" />
      ),
      cell: ({ row }) => (
        <RelativeTimeCell value={row.original.lastMessageAt} />
      ),
      size: 110,
      meta: { headerTitle: "Last activity" },
    },
    {
      id: "waitingTime",
      accessorFn: (row) => row.lastCustomerMessageAt ?? row.lastMessageAt ?? "",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Waiting" />
      ),
      cell: ({ row }) => <WaitingTimeCell row={row.original} />,
      size: 120,
      meta: { headerTitle: "Waiting" },
    },
    {
      accessorKey: "inboxId",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Inbox" />
      ),
      cell: ({ row }) => <InboxCell inboxId={row.original.inboxId} />,
      size: 160,
      meta: { headerTitle: "Inbox" },
    },
    {
      // The reference staff quote to each other; hidden until asked for.
      accessorKey: "id",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.id.replace(/^conv-/, "")}
        </span>
      ),
      size: 120,
      meta: { headerTitle: "ID" },
    },
  ];
}
