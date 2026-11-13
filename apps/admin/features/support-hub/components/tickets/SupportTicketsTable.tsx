"use client";
import { useLocaleFormat } from "@asym/lib/hooks/use-locale-format";
import {
  DataGridPanel,
  DataGridRowPrimary,
  dataGridFeatures,
  useTable,
  type DataGridColumnDef,
  type SortingState,
  type PaginationState,
} from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import Link from "next/link";
import * as React from "react";

import { SUPPORT_TICKET_STATUS_LABELS } from "../../../../app/(app)/support/support-hub.derived";
import { supportHubRoutes } from "../../../../app/(app)/support/support-hub.routes";
import { CONVERSATION_PRIORITY_LABELS } from "../../lib/status-labels";
import { SupportEmptySection } from "../workspace/SupportEmptySection";

import type {
  SupportTicket,
  SupportQueue,
} from "../../../../app/(app)/support/support-hub.types";

function TicketSubject({ ticket }: { ticket: SupportTicket }) {
  return (
    <div className="space-y-1">
      <DataGridRowPrimary
        render={<Link href={supportHubRoutes.ticket(ticket.id)} />}
      >
        {ticket.subject}
      </DataGridRowPrimary>
      <p className="text-sm text-muted-foreground">{ticket.summary}</p>
      <p className="font-mono text-xs text-muted-foreground">{ticket.id}</p>
    </div>
  );
}
function TicketTime({ value }: { value?: string }) {
  const { formatDateTime } = useLocaleFormat();
  return value ? (
    <time dateTime={value}>{formatDateTime(value)}</time>
  ) : (
    <>Not scheduled</>
  );
}
export function SupportTicketsTable({
  tickets,
  queues,
  filtered,
}: {
  tickets: SupportTicket[];
  queues: SupportQueue[];
  filtered: boolean;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const trackLabel = React.useCallback(
    (ticket: SupportTicket) =>
      queues.find((queue) => queue.id === ticket.queueId)?.label ??
      "Track unavailable",
    [queues],
  );
  const columns = React.useMemo<DataGridColumnDef<SupportTicket>[]>(
    () => [
      {
        accessorKey: "subject",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Ticket" />
        ),
        cell: ({ row }) => <TicketSubject ticket={row.original} />,
        enableHiding: false,
        size: 280,
      },
      {
        id: "email",
        accessorFn: (ticket) =>
          ticket.contactEmail ??
          ticket.contactEmailSnapshot ??
          "No email recorded",
        header: "Email",
        size: 200,
      },
      { id: "track", accessorFn: trackLabel, header: "Track", size: 140 },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => SUPPORT_TICKET_STATUS_LABELS[row.original.status],
        size: 100,
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => CONVERSATION_PRIORITY_LABELS[row.original.priority],
        size: 90,
      },
      {
        accessorKey: "followUpAt",
        header: "Follow-up",
        cell: ({ row }) => <TicketTime value={row.original.followUpAt} />,
        size: 160,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Updated" />
        ),
        cell: ({ row }) => <TicketTime value={row.original.updatedAt} />,
        size: 160,
      },
    ],
    [trackLabel],
  );
  const table = useTable({
    features: dataGridFeatures,
    data: tickets,
    columns,
    getRowId: (ticket) => ticket.id,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });
  return (
    <DataGridPanel
      table={table}
      label="Support tickets"
      recordCount={tickets.length}
      view="auto"
      pagination={tickets.length > 0 ? { sizes: [25, 50, 100] } : false}
      empty={
        <SupportEmptySection
          title={
            filtered
              ? "No tickets match your filters"
              : "No support tickets yet"
          }
          description={
            filtered
              ? "Change the search, track or status to find a ticket."
              : "Create a ticket to capture a support request."
          }
        />
      }
      renderMobileRow={({ original: ticket }) => (
        <div className="space-y-3 p-4">
          <TicketSubject ticket={ticket} />
          <p className="break-words text-sm">
            {ticket.contactEmail ??
              ticket.contactEmailSnapshot ??
              "No email recorded"}
          </p>
          <p className="text-sm">
            {trackLabel(ticket)} · {SUPPORT_TICKET_STATUS_LABELS[ticket.status]}{" "}
            · {CONVERSATION_PRIORITY_LABELS[ticket.priority]}
          </p>
          <dl className="text-xs text-muted-foreground">
            <dt>Follow-up</dt>
            <dd>
              <TicketTime value={ticket.followUpAt} />
            </dd>
            <dt>Updated</dt>
            <dd>
              <TicketTime value={ticket.updatedAt} />
            </dd>
          </dl>
        </div>
      )}
    />
  );
}
