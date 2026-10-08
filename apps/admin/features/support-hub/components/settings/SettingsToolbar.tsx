"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import * as React from "react";

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
 * unsaved work.
 */
export function SettingsToolbar({
  isDirty,
  isSaving,
  onSave,
  onCancel,
  savedLabel = "Saved",
  className,
}: SettingsToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2 text-xs font-medium",
          isDirty ? "text-warning" : "text-muted-foreground",
        )}
      >
        {isDirty ? (
          <>
            <AlertCircle className="size-3.5" />
            You have unsaved changes.
          </>
        ) : (
          <>
            <Check className="size-3.5 text-success" />
            {savedLabel}
          </>
        )}
      </span>
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
          {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Save changes
        </Button>
      </div>
    </div>
  );
}
