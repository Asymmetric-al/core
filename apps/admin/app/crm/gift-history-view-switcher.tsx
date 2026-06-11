import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 max-w-36 gap-1 truncate text-xs"
          aria-label="Gift history views"
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
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
                {view.name}
                {view.isDefault ? (
                  <DropdownMenuShortcut>Default</DropdownMenuShortcut>
                ) : null}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        ) : (
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            No saved views yet.
          </DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSaveCurrentAs}>
          Save current as view…
        </DropdownMenuItem>
        {activeView ? (
          <>
            <DropdownMenuItem onSelect={() => onRename(activeView)}>
              Rename “{activeView.name}”…
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate(activeView)}>
              Duplicate
            </DropdownMenuItem>
            {activeView.isDefault ? null : (
              <DropdownMenuItem onSelect={() => onSetDefault(activeView)}>
                Set as default
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => onResetToSaved(activeView)}>
              Reset to saved view
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(activeView)}
            >
              Delete view…
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
