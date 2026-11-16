"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { ButtonGroup } from "@asym/ui/components/shadcn/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { SupportSavedView } from "../../types";

interface SavedViewItemProps {
  view: SupportSavedView;
  isActive: boolean;
  onSelect: () => void;
  onRename?: () => void;
  onDelete?: () => void;
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
    // One shared button group: apply the view, or open its actions. The
    // applied view is announced (aria-pressed) and filled, not only outlined.
    <ButtonGroup aria-label={`Saved view ${view.name}`}>
      <Button
        type="button"
        variant={isActive ? "secondary" : "outline"}
        size="sm"
        aria-pressed={isActive}
        onClick={onSelect}
      >
        <span className="max-w-40 truncate">{view.name}</span>
      </Button>
      {(onRename || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant={isActive ? "secondary" : "outline"}
                size="icon-sm"
                aria-label={`Saved view actions for ${view.name}`}
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {onRename && (
              <DropdownMenuItem closeOnClick={false} onClick={onRename}>
                <Pencil aria-hidden="true" />
                Rename or change scope
              </DropdownMenuItem>
            )}
            {onRename && onDelete && <DropdownMenuSeparator />}
            {onDelete && (
              <DropdownMenuItem
                variant="destructive"
                closeOnClick={false}
                onClick={onDelete}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </ButtonGroup>
  );
}
