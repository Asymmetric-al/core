"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { cn } from "@asym/ui/lib/utils";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { SupportSavedView } from "../../types";

interface SavedViewItemProps {
  view: SupportSavedView;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}

/**
 * Saved-view chip rendered inside `<SavedViewsBar />`. Clicking the body
 * applies the saved filter to the URL; the kebab opens rename / delete.
 */
export function SavedViewItem({
  view,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: SavedViewItemProps) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-lg border bg-card px-1 text-xs font-medium",
        isActive
          ? "border-primary text-foreground shadow-sm"
          : "border-border text-muted-foreground hover:border-border",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "rounded-md px-2 py-0.5",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span className="truncate max-w-40 block">{view.name}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-foreground"
              aria-label={`Saved view actions for ${view.name}`}
            >
              <MoreHorizontal className="size-3" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            closeOnClick={false}
            onClick={() => {
              onRename();
            }}
            className="text-xs"
          >
            <Pencil className="size-3.5 text-muted-foreground" />
            Rename / scope
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            closeOnClick={false}
            onClick={() => {
              onDelete();
            }}
            className="text-xs text-destructive focus:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
