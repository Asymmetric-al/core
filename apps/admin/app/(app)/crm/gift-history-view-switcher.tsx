"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Bookmark, ChevronDown } from "lucide-react";

import type { CrmNamedView } from "@asym/database/types";

/**
 * Compact named-view switcher near the gift-history toolbar (#273).
 * Views are personal-only; one can be the user's default.
 */
export function GiftHistoryViewSwitcher({
  views,
  activeViewId,
  onApplyView,
  onSaveCurrentAs,
  onRename,
  onDuplicate,
  onSetDefault,
  onResetToSaved,
  onDelete,
}: {
  views: CrmNamedView[];
  activeViewId: string | null;
  onApplyView: (view: CrmNamedView) => void;
  onSaveCurrentAs: () => void;
  onRename: (view: CrmNamedView) => void;
  onDuplicate: (view: CrmNamedView) => void;
  onSetDefault: (view: CrmNamedView) => void;
  onResetToSaved: (view: CrmNamedView) => void;
  onDelete: (view: CrmNamedView) => void;
}) {
  const activeView = views.find((view) => view.id === activeViewId) ?? null;
  const defaultView = views.find((view) => view.isDefault) ?? null;
  const viewName = activeView?.name ?? defaultView?.name ?? null;
  const label = viewName ?? "Views";

  return (
    <div className="flex max-w-44 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="max-w-full"
              // The visible view name is part of the name (WCAG 2.5.3).
              aria-label={
                viewName
                  ? `Gift history views: ${viewName}`
                  : "Gift history views"
              }
              title={label}
            >
              <Bookmark aria-hidden="true" />
              <span className="truncate">{label}</span>
              <ChevronDown aria-hidden="true" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Saved views</DropdownMenuLabel>
            {views.length > 0 ? (
              <DropdownMenuRadioGroup
                value={activeViewId ?? ""}
                onValueChange={(value) => {
                  const view = views.find(
                    (candidate) => candidate.id === value,
                  );
                  if (view) {
                    onApplyView(view);
                  }
                }}
              >
                {views.map((view) => (
                  <DropdownMenuRadioItem key={view.id} value={view.id}>
                    <span className="max-w-40 whitespace-normal wrap-anywhere">
                      {view.name}
                    </span>
                    {view.isDefault ? (
                      <DropdownMenuShortcut>Default</DropdownMenuShortcut>
                    ) : null}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            ) : (
              <div
                role="status"
                className="px-2 py-1.5 text-xs text-muted-foreground"
              >
                No saved views yet.
              </div>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSaveCurrentAs}>
            Save current as view…
          </DropdownMenuItem>
          {activeView ? (
            <>
              <DropdownMenuItem onClick={() => onRename(activeView)}>
                <span className="whitespace-normal wrap-anywhere">
                  Rename “{activeView.name}”…
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(activeView)}>
                Duplicate
              </DropdownMenuItem>
              {activeView.isDefault ? null : (
                <DropdownMenuItem onClick={() => onSetDefault(activeView)}>
                  Set as default
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onResetToSaved(activeView)}>
                Reset to saved view
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(activeView)}
              >
                Delete view…
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
