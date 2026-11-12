"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { cn } from "@asym/ui/lib/utils";
import { AlertCircle, Check } from "lucide-react";

interface SettingsToolbarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  savedLabel?: string;
  className?: string;
}

/**
 * Persistent footer showing the dirty state + Save / Discard actions. Sits
 * at the bottom of each settings form so agents never lose track of
 * unsaved work. The status line is announced as it changes.
 */
export function SettingsToolbar({
  isDirty,
  isSaving,
  onSave,
  onCancel,
  savedLabel = "Saved",
  className,
}: SettingsToolbarProps) {
  const status = isSaving
    ? "Saving…"
    : isDirty
      ? "You have unsaved changes."
      : savedLabel;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p
        role="status"
        className={cn(
          "inline-flex items-center gap-2 text-xs font-medium",
          isDirty ? "text-warning" : "text-muted-foreground",
        )}
      >
        {isDirty ? (
          <AlertCircle aria-hidden="true" className="size-3.5" />
        ) : (
          <Check aria-hidden="true" className="size-3.5 text-success" />
        )}
        {status}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!isDirty || isSaving}
          onClick={onCancel}
        >
          Discard
        </Button>
        <Button
          focusableWhenDisabled={isSaving}
          type="button"
          size="sm"
          disabled={!isDirty || isSaving}
          onClick={onSave}
        >
          {/* Hidden: the status line above already says "Saving…". */}
          {isSaving ? (
            <Spinner aria-hidden="true" data-icon="inline-start" />
          ) : null}
          Save changes
        </Button>
      </div>
    </div>
  );
}
