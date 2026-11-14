"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { ArrowLeftRight, BookmarkPlus, Folder } from "lucide-react";
import * as React from "react";

import { DeleteSavedViewConfirm } from "./DeleteSavedViewConfirm";
import { SavedViewItem } from "./SavedViewItem";
import { SaveViewDialog } from "./SaveViewDialog";
import { useSupportSavedViews } from "../../hooks/use-support-saved-views";
import { useSupportInboxState } from "../../lib/route-state";
import { canManageSavedView } from "../../lib/settings-access";

import type { SupportSavedView } from "../../types";

/**
 * Strip rendered above the view tabs. Lists every saved view (workspace +
 * personal) and exposes a "Save current filter" affordance bound to the live
 * inbox state.
 */
export function SavedViewsBar() {
  const { state, setState } = useSupportInboxState();
  const { data: savedViews, access } = useSupportSavedViews();
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
    // On phones this is one row beside the view select: the chips scroll
    // sideways and the words "Saved views" and "Save filter" are read out
    // but shown as icons. From sm it shrinks to its row and wraps the chips,
    // so many saved views never push past the inbox column.
    <section
      aria-label="Saved views"
      className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:flex-wrap"
    >
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Folder aria-hidden="true" className="size-3" />
        <span className="sr-only sm:not-sr-only">Saved views</span>
      </span>

      {savedViews.length === 0 ? (
        // A third line on a phone, where Save filter says enough.
        <span className="hidden text-xs text-muted-foreground sm:inline">
          No saved views yet, save a filter to find it again.
        </span>
      ) : (
        // The vertical padding keeps focus rings clear of the scroll edge.
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 *:shrink-0 sm:contents">
          {savedViews.map((view) => (
            <SavedViewItem
              key={view.id}
              view={view}
              isActive={activeView?.id === view.id}
              onSelect={() => apply(view)}
              onRename={
                canManageSavedView(access, view)
                  ? () => setEditing(view)
                  : undefined
              }
              onDelete={
                canManageSavedView(access, view)
                  ? () => setDeleting(view)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {savedViews.length > 1 && (
        <ArrowLeftRight
          className="size-3 shrink-0 text-muted-foreground sm:hidden"
          aria-hidden="true"
        />
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsCreating(true)}
      >
        <BookmarkPlus aria-hidden="true" className="size-3.5" />
        <span className="sr-only sm:not-sr-only">Save filter</span>
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
