"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";

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
  const label = activeView?.name ?? defaultView?.name ?? "Views";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" aria-label="Gift history views">
            <span className="max-w-30 truncate">{label}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {views.length > 0 ? (
          <DropdownMenuRadioGroup
            value={activeViewId ?? ""}
            onValueChange={(value) => {
              const view = views.find((candidate) => candidate.id === value);
              if (view) {
                onApplyView(view);
              }
            }}
          >
            {views.map((view) => (
              <DropdownMenuRadioItem key={view.id} value={view.id}>
                <span className="max-w-40">{view.name}</span>
                {view.isDefault ? (
                  <DropdownMenuShortcut>Default</DropdownMenuShortcut>
                ) : null}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        ) : (
          <div
            role="status"
            className="px-2 py-1.5 text-xs font-normal text-muted-foreground"
          >
            No saved views yet.
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSaveCurrentAs}>
          Save current as view…
        </DropdownMenuItem>
        {activeView ? (
          <>
            <DropdownMenuItem onClick={() => onRename(activeView)}>
              <span className="max-w-56">Rename “{activeView.name}”…</span>
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
  );
}
