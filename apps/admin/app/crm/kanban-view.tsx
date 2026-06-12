"use client";

import { formatCurrency } from "@asym/lib/utils";
import {
  crmRecordAvatarTransitionName,
  crmRecordTitleTransitionName,
} from "@asym/lib/view-transitions";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { MoreHorizontal } from "lucide-react";
import { useMemo } from "react";

import { EMPTY_CELL_VALUE } from "./crm-detail-shared";

import type { CrmGridRow } from "./types";

export function KanbanView({
  rows,
  onSelectRow,
}: {
  rows: CrmGridRow[];
  onSelectRow: (row: CrmGridRow) => void;
}) {
  const columns = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      set.add(r.lifecycleStatus ?? "Unknown");
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground text-sm">
        Load records in table view first, or adjust filters, nothing to show on
        the board yet.
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto flex p-4 md:p-6 gap-4 items-start">
      {columns.map((status) => (
        <div
          key={status}
          className="flex-shrink-0 w-80 flex flex-col h-full bg-muted/30 rounded-xl border border-border/50 overflow-hidden"
        >
          <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between">
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] rounded shadow-none border"
            >
              {status}
            </Badge>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {
                rows.filter((r) => (r.lifecycleStatus ?? "Unknown") === status)
                  .length
              }
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {rows
              .filter((r) => (r.lifecycleStatus ?? "Unknown") === status)
              .map((c) => {
                const name = c.displayName || "Unnamed";
                const org = c.primaryOrganization ?? "";
                const orgInitial = org.trim()[0] ?? "?";
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectRow(c)}
                    className="w-full bg-card p-3 rounded-lg border border-border shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <SharedNamedViewTransition
                        name={crmRecordTitleTransitionName(c.id)}
                      >
                        <span className="font-semibold text-foreground text-xs truncate leading-none inline-block max-w-[85%]">
                          {name}
                        </span>
                      </SharedNamedViewTransition>
                      <MoreHorizontal
                        className="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-4 rounded bg-muted flex items-center justify-center text-[8px] font-semibold text-muted-foreground border border-border">
                        {orgInitial}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium truncate">
                        {org || EMPTY_CELL_VALUE}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-muted">
                      <span className="text-[10px] font-semibold text-foreground tabular-nums">
                        {formatCurrency(c.lifetimeGiving)}
                      </span>
                      <SharedNamedViewTransition
                        name={crmRecordAvatarTransitionName(c.id)}
                      >
                        <Avatar className="size-4">
                          <AvatarImage src={c.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-[8px] font-semibold">
                            {name[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                      </SharedNamedViewTransition>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
