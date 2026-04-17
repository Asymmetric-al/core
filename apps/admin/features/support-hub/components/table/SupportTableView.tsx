"use client";

import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import { cn } from "@asym/ui/lib/utils";
import { LifeBuoy } from "lucide-react";
import * as React from "react";

import { useSupportBulkActions } from "./bulk-actions";
import { supportConversationColumns } from "./columns";
import { useSupportNow } from "../../lib/now";
import { formatRelative } from "../../lib/time";

import type { SupportConversation } from "../../types";

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

  return (
    <>
      <DataTableResponsive<SupportConversation, unknown>
        columns={supportConversationColumns}
        data={conversations}
        searchColumnId="subject"
        searchPlaceholder="Search subjects..."
        isLoading={isLoading}
        getRowId={(row) => row.id}
        onRowClick={(row) => onSelectConversation(row.original.id)}
        floatingBarActions={actions}
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
              conversation={row.original}
              isSelected={row.original.id === selectedConversationId}
              onSelect={onSelectConversation}
            />
          ),
        }}
        emptyState={
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100">
              <LifeBuoy className="size-5 text-zinc-300" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">
              No conversations match your filters
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Adjust the view, status, or label filters above to widen the
              search.
            </p>
          </div>
        }
      />
      {overlays}
    </>
  );
}

interface SupportConversationMobileCardProps {
  conversation: SupportConversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function SupportConversationMobileCard({
  conversation,
  isSelected,
  onSelect,
}: SupportConversationMobileCardProps) {
  const nowIso = useSupportNow();
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "w-full space-y-2 rounded-xl px-3 py-3 text-left transition-colors",
        "hover:bg-zinc-50 focus-visible:outline-none focus-visible:bg-zinc-50",
        isSelected && "bg-zinc-50 ring-1 ring-zinc-200",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-medium text-zinc-900">
          {conversation.externalContactName ??
            conversation.externalContactEmail}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-zinc-400">
          {formatRelative(conversation.lastMessageAt, nowIso)}
        </span>
      </div>
      <p className="line-clamp-2 text-[13px] text-zinc-700">
        {conversation.subject}
      </p>
      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
        <span className="capitalize">{conversation.status}</span>
        <span aria-hidden>·</span>
        <span className="capitalize">{conversation.priority}</span>
        {conversation.escalatedAt ? (
          <>
            <span aria-hidden>·</span>
            <span className="text-rose-600">Escalated</span>
          </>
        ) : null}
      </div>
    </button>
  );
}
