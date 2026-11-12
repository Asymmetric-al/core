"use client";

import {
  DataGridPanel,
  DataGridRowPrimary,
  DataGridSelectionBar,
  DataGridToolbarSpacer,
  DataGridViewOptions,
  dataGridFeatures,
  useTable,
  type DataGridRow,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@asym/ui/components/data-grid-panel";
import { Button } from "@asym/ui/components/shadcn/button";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import { Item, ItemContent } from "@asym/ui/components/shadcn/item";
import { LifeBuoy } from "lucide-react";
import * as React from "react";

import { RelativeTime } from "../RelativeTime";
import { useSupportBulkActions } from "./bulk-actions";
import { PRIORITY_LABELS, StatusCell } from "./cells";
import { createSupportConversationColumns } from "./columns";
import { SupportEmptySection } from "../workspace/SupportEmptySection";

import type { SupportConversation } from "../../types";

/** Names a conversation for its selection checkbox: subject and donor. */
export function selectionLabel(row: SupportConversation) {
  return `${row.subject} from ${row.externalContactName ?? row.externalContactEmail}`;
}

interface SupportTableViewProps {
  conversations: SupportConversation[];
  isLoading?: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

/**
 * Donor-care conversations on Core's shared ReUI grid (the same panel as
 * CRM and Contributions): search, sortable headers, column visibility,
 * row selection with bulk actions, pagination and phone cards.
 */
export function SupportTableView({
  conversations,
  isLoading,
  selectedConversationId,
  onSelectConversation,
}: SupportTableViewProps) {
  const { actions, overlays } = useSupportBulkActions();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "lastMessageAt", desc: true },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    // Waiting time and inbox are one click away in View; labels drive
    // triage, so they show as they do on the board.
    React.useState<VisibilityState>({
      inboxId: false,
      waitingTime: false,
      id: false,
    });

  // The inbox toolbar's search (donor, subject or email) already filters
  // these rows; the grid adds no second search.
  const rows = conversations;

  const columns = React.useMemo(
    () => createSupportConversationColumns(onSelectConversation),
    [onSelectConversation],
  );
  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    state: { sorting, pagination, rowSelection, columnVisibility },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const selectedRows = conversations.filter((row) => rowSelection[row.id]);

  return (
    <>
      <DataGridPanel
        // Cards when the columns would not fit, not a sideways scroll.
        view="auto"
        table={table}
        recordCount={rows.length}
        label="Conversations"
        isLoading={isLoading}
        onRowClick={(row) => onSelectConversation(row.id)}
        pagination={rows.length > 0 ? { sizes: [25, 50, 100] } : false}
        selectionBar={
          <DataGridSelectionBar
            count={selectedRows.length}
            noun="conversation"
            onClear={() => setRowSelection({})}
          >
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  size="sm"
                  variant={
                    action.variant === "destructive" ? "destructive" : "outline"
                  }
                  onClick={() => {
                    action.onClick(selectedRows);
                    setRowSelection({});
                  }}
                >
                  {Icon ? <Icon aria-hidden="true" /> : null}
                  {action.label}
                </Button>
              );
            })}
          </DataGridSelectionBar>
        }
        // Search and filters live in the inbox toolbar above; here the
        // header says how many conversations match beside the column menu.
        toolbar={
          <>
            <p className="text-sm text-muted-foreground tabular-nums">
              {rows.length === 1
                ? "1 conversation"
                : `${rows.length} conversations`}
            </p>
            <DataGridToolbarSpacer />
            <DataGridViewOptions table={table} />
          </>
        }
        renderMobileRow={(row: DataGridRow<SupportConversation>) => (
          <SupportConversationMobileRow
            row={row}
            isOpen={row.original.id === selectedConversationId}
            onOpen={onSelectConversation}
          />
        )}
        empty={
          <SupportEmptySection
            icon={<LifeBuoy />}
            title="No conversations match your filters"
            description="Adjust the view, status or label filters above, or clear the search."
          />
        }
      />
      {overlays}
    </>
  );
}

function SupportConversationMobileRow({
  row,
  isOpen,
  onOpen,
}: {
  row: DataGridRow<SupportConversation>;
  /** This conversation is the one open in the detail pane. */
  isOpen: boolean;
  onOpen: (id: string) => void;
}) {
  const conversation = row.original;
  const donor =
    conversation.externalContactName ?? conversation.externalContactEmail;
  return (
    // The subject control stretches over the card, so the whole card opens it.
    <div className="relative rounded-md transition-colors hover:bg-accent/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <Item variant="outline" size="sm" render={<div />}>
        {/* Above the stretched subject control, so it stays clickable. */}
        <span className="relative z-10 flex pt-0.5">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
            aria-label={`Select ${selectionLabel(conversation)}`}
          />
        </span>
        <ItemContent className="min-w-0 gap-1">
          <DataGridRowPrimary
            className="flex-col items-start gap-0.5 text-left after:absolute after:inset-0"
            aria-pressed={isOpen}
            onClick={() => onOpen(conversation.id)}
          >
            <span className="truncate text-xs text-muted-foreground">
              {donor}
            </span>
            <span className="line-clamp-2 text-sm font-medium">
              {conversation.subject}
            </span>
          </DataGridRowPrimary>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <StatusCell status={conversation.status} />
            <span>{PRIORITY_LABELS[conversation.priority]} priority</span>
            <span className="tabular-nums">
              <RelativeTime value={conversation.lastMessageAt} compact />
            </span>
            {conversation.escalatedAt ? (
              <span className="text-destructive">Escalated</span>
            ) : null}
          </div>
        </ItemContent>
      </Item>
    </div>
  );
}
