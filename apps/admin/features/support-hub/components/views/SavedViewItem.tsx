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
        "inline-flex h-8 items-center gap-1 rounded-lg border bg-white px-1 text-[12px] font-medium",
        isActive
          ? "border-zinc-900 text-zinc-900 shadow-sm"
          : "border-zinc-200 text-zinc-600 hover:border-zinc-300",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "rounded-md px-2 py-0.5",
          isActive ? "text-zinc-900" : "text-zinc-600 hover:text-zinc-900",
        )}
      >
        <span className="truncate max-w-[160px] block">{view.name}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 rounded-md text-zinc-400 hover:text-zinc-700"
            aria-label={`Saved view actions for ${view.name}`}
          >
            <MoreHorizontal className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onRename();
            }}
            className="text-[12px]"
          >
            <Pencil className="size-3.5 text-zinc-500" />
            Rename / scope
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onDelete();
            }}
            className="text-[12px] text-rose-600 focus:text-rose-600"
          >
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
