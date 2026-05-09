"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { BookmarkPlus, Folder } from "lucide-react";
import * as React from "react";

import { DeleteSavedViewConfirm } from "./DeleteSavedViewConfirm";
import { SavedViewItem } from "./SavedViewItem";
import { SaveViewDialog } from "./SaveViewDialog";
import { useSupportSavedViews } from "../../hooks/use-support-saved-views";
import { useSupportInboxState } from "../../lib/route-state";

import type { SupportSavedView } from "../../types";

/**
 * Strip rendered above the view tabs. Lists every saved view (workspace +
 * personal) and exposes a "Save current filter" affordance bound to the live
 * inbox state.
 */
export function SavedViewsBar() {
  const { state, setState } = useSupportInboxState();
  const { data: savedViews } = useSupportSavedViews();
  const [editing, setEditing] = React.useState<SupportSavedView | null>(null);
  const [deleting, setDeleting] = React.useState<SupportSavedView | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  const activeView = React.useMemo(
    () => findActiveSavedView(savedViews, state),
    [savedViews, state],
  );

  const apply = (view: SupportSavedView) => {
    setState({
      view: view.filter.view,
      layout: view.filter.layout,
      status: view.filter.status,
      q: view.filter.q,
      labelSlugs: view.filter.labelSlugs,
      assignee: view.filter.assignee,
    });
  };

  return (
    <section
      aria-label="Saved views"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        <Folder className="size-3" />
        Saved views
      </span>

      {savedViews.length === 0 ? (
        <span className="text-[12px] text-zinc-400">
          No saved views yet — save a filter to find it again.
        </span>
      ) : (
        savedViews.map((view) => (
          <SavedViewItem
            key={view.id}
            view={view}
            isActive={activeView?.id === view.id}
            onSelect={() => apply(view)}
            onRename={() => setEditing(view)}
            onDelete={() => setDeleting(view)}
          />
        ))
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsCreating(true)}
        className={cn(
          "h-8 gap-1.5 rounded-lg px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500",
          "hover:bg-zinc-100 hover:text-zinc-900",
        )}
      >
        <BookmarkPlus className="size-3.5" />
        Save filter
      </Button>

      <SaveViewDialog
        open={isCreating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditing(null);
          }
        }}
        routeState={state}
        editingView={editing}
      />
      <DeleteSavedViewConfirm
        view={deleting}
        onClose={() => setDeleting(null)}
      />
    </section>
  );
}

function findActiveSavedView(
  savedViews: SupportSavedView[],
  state: ReturnType<typeof useSupportInboxState>["state"],
): SupportSavedView | null {
  return (
    savedViews.find((view) => {
      const filter = view.filter;
      if (filter.view !== state.view) return false;
      if (filter.layout !== state.layout) return false;
      if (filter.status !== state.status) return false;
      if (filter.q !== state.q) return false;
      if (filter.assignee !== state.assignee) return false;
      if (filter.labelSlugs.length !== state.labelSlugs.length) return false;
      const stateLabels = new Set(state.labelSlugs);
      return filter.labelSlugs.every((slug) => stateLabels.has(slug));
    }) ?? null
  );
}
