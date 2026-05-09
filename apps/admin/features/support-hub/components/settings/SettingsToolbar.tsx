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
        "flex items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-2",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2 text-[11px] font-medium",
          isDirty ? "text-amber-700" : "text-zinc-500",
        )}
      >
        {isDirty ? (
          <>
            <AlertCircle className="size-3.5" />
            You have unsaved changes.
          </>
        ) : (
          <>
            <Check className="size-3.5 text-emerald-600" />
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
          className="h-8 rounded-lg px-3 text-[11px] font-medium"
        >
          Discard
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!isDirty || isSaving}
          onClick={onSave}
          className="h-8 rounded-lg px-3 text-[11px] font-black uppercase tracking-wider"
        >
          {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Save changes
        </Button>
      </div>
    </div>
  );
}
