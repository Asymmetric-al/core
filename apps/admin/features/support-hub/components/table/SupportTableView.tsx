"use client";

import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import { cn } from "@asym/ui/lib/utils";
import { LifeBuoy } from "lucide-react";
import * as React from "react";

import { useSupportBulkActions } from "./bulk-actions";
import { supportConversationColumns } from "./columns";
import { useSupportNow } from "../../lib/now";
import { formatRelative } from "../../lib/time";
import { SupportEmptySection } from "../workspace/SupportEmptySection";

import type { SupportConversation } from "../../types";
import type { Row } from "@asym/ui/components/shadcn/data-table/tanstack";

interface SupportTableViewProps {
  conversations: SupportConversation[];
  isLoading?: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

/**
 * Donor-care table built on the repo's Maia/Zinc `DataTableResponsive`
 * surface — sticky header, sortable + hideable columns, row selection,
 * bulk actions, mobile card view, and keyboard navigation are all already
 * inside the shared component, so this file mostly composes them.
 */
export function SupportTableView({
  conversations,
  isLoading,
  selectedConversationId,
  onSelectConversation,
}: SupportTableViewProps) {
  const { actions, overlays } = useSupportBulkActions();

  // Phase 7 perf: enable row virtualization once we cross 200 rows so the
  // table never tries to render the full set of donor conversations.
  // Smaller tables keep the existing pagination behavior — virtualization
  // adds layout cost that doesn't pay off until the row count is high.
  const enableVirtualization = conversations.length > 200;

  return (
    <>
      <DataTableResponsive<SupportConversation, unknown>
        columns={supportConversationColumns}
        data={conversations}
        devtoolsKey="support-hub-conversations"
        searchColumnId="subject"
        searchPlaceholder="Search subjects..."
        isLoading={isLoading}
        getRowId={(row) => row.id}
        onRowClick={(row) => onSelectConversation(row.original.id)}
        floatingBarActions={actions}
        enableVirtualization={enableVirtualization}
        config={{
          enableRowSelection: true,
          enableColumnVisibility: true,
          enablePagination: true,
          enableSorting: true,
          enableFilters: false,
          stickyHeader: true,
          enableKeyboardNavigation: true,
          enableViewToggle: true,
        }}
        initialState={{
          columnVisibility: {
            inboxId: false,
          },
        }}
        mobileCardConfig={{
          primaryField: "subject",
          secondaryField: "donor",
          renderCard: (row) => (
            <SupportConversationMobileCard
              row={row}
              conversation={row.original}
              isSelected={row.original.id === selectedConversationId}
              onSelect={onSelectConversation}
            />
          ),
        }}
        emptyState={
          <SupportEmptySection
            icon={<LifeBuoy />}
            title="No conversations match your filters"
            description="Adjust the view, status, or label filters above to widen the search."
          />
        }
      />
      {overlays}
    </>
  );
}

interface SupportConversationMobileCardProps {
  row: Row<SupportConversation>;
  conversation: SupportConversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function SupportConversationMobileCard({
  row,
  conversation,
  isSelected,
  onSelect,
}: SupportConversationMobileCardProps) {
  const nowIso = useSupportNow();
  return (
    <div className="flex items-start gap-2">
      <label className="flex min-h-9 shrink-0 items-center px-2">
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(checked) => row.toggleSelected(checked)}
          onClick={(event) => event.stopPropagation()}
        />
        <span className="sr-only">
          Select conversation {conversation.id}: {conversation.subject}
        </span>
      </label>
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={() => onSelect(conversation.id)}
        className={cn(
          "min-w-0 flex-1 space-y-2 rounded-xl px-3 py-3 text-left transition-colors",
          "hover:bg-muted/40 focus-visible:outline-none focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring",
          isSelected && "bg-muted/40 ring-1 ring-border",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-foreground">
            {conversation.externalContactName ??
              conversation.externalContactEmail}
          </span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {formatRelative(conversation.lastMessageAt, nowIso)}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-foreground">
          {conversation.subject}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{conversation.status}</span>
          <span aria-hidden>·</span>
          <span className="capitalize">{conversation.priority}</span>
          {conversation.escalatedAt ? (
            <>
              <span aria-hidden>·</span>
              <span className="text-destructive">Escalated</span>
            </>
          ) : null}
        </div>
      </button>
    </div>
  );
}
