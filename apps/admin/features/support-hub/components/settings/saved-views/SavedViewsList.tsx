"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Bookmark, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { useDeleteSupportSavedView } from "../../../hooks/use-support-mutations";
import { useSupportSavedViews } from "../../../hooks/use-support-saved-views";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsPanel } from "../SettingsPanel";

import type { SupportSavedView } from "../../../types";

export function SavedViewsList() {
  const { data: savedViews } = useSupportSavedViews();
  const deleteView = useDeleteSupportSavedView();

  const handleDelete = async (view: SupportSavedView) => {
    if (!window.confirm(`Delete saved view "${view.name}"?`)) return;
    try {
      await deleteView.mutateAsync({ id: view.id });
      toast.success("Saved view deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete the saved view.",
      );
    }
  };

  return (
    <SettingsPanel
      title="Saved views"
      description="Named filters shared across the team. Create new views from the inbox toolbar."
    >
      {savedViews.length === 0 ? (
        <SupportEmptySection
          icon={<Bookmark className="size-4" />}
          title="No saved views yet"
          description="Save a filter from the inbox toolbar and it will show up here."
          action={
            <Link
              href="/support"
              className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-black uppercase tracking-wider text-primary-foreground"
            >
              Open inbox
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {savedViews.map((view) => (
            <li key={view.id} className="flex items-center gap-3 py-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Bookmark className="size-4" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-xs font-semibold text-foreground">
                  {view.name}
                  <span className="ml-2 inline-flex h-4 items-center rounded-md bg-muted px-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {view.scope}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  view:{view.filter.view} · status:{view.filter.status} ·
                  layout:{view.filter.layout}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void handleDelete(view)}
                aria-label={`Delete ${view.name}`}
                className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SettingsPanel>
  );
}
