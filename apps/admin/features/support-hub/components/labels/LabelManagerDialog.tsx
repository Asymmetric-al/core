"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/ui/lib/utils";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { LabelForm } from "./LabelForm";
import { useSupportLabels } from "../../hooks/use-support-labels";
import { useDeleteSupportLabel } from "../../hooks/use-support-mutations";

import type { SupportLabel, SupportLabelTone } from "../../types";

interface LabelManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TONE_DOT_CLASSES: Record<SupportLabelTone, string> = {
  zinc: "bg-zinc-400",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
};

/**
 * Dialog reachable from `<LabelFilter />` and the command palette. Lists every
 * label and lets the agent create / rename / re-tone / delete. Deletes also
 * scrub the label off any conversation that still carries it (handled inside
 * `useDeleteSupportLabel`).
 */
export function LabelManagerDialog({
  open,
  onOpenChange,
}: LabelManagerDialogProps) {
  const { data: labels } = useSupportLabels();
  const deleteLabel = useDeleteSupportLabel();
  const [editing, setEditing] = React.useState<SupportLabel | "new" | null>(
    null,
  );

  React.useEffect(() => {
    if (!open) setEditing(null);
  }, [open]);

  const handleDelete = async (label: SupportLabel) => {
    if (
      !window.confirm(
        `Remove the "${label.name}" label? It will be stripped from every conversation that still has it.`,
      )
    ) {
      return;
    }
    try {
      await deleteLabel.mutateAsync({ id: label.id });
      toast.success("Label deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the label.",
      );
    }
  };

  const editingLabel = editing && editing !== "new" ? editing : null;
  const isFormOpen = editing !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage labels</DialogTitle>
          <DialogDescription>
            Labels organize donor conversations across the inbox, board, and
            reports. Tones are restricted to the Maia palette so the inbox stays
            calm.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          {labels.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/40 px-4 py-6 text-center">
              <span className="flex size-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-zinc-100">
                <Tag className="size-4 text-zinc-300" />
              </span>
              <p className="text-[12px] font-medium text-zinc-700">
                No labels yet
              </p>
              <p className="max-w-xs text-[11px] text-zinc-500">
                Create the first label to start triaging donor questions.
              </p>
            </div>
          ) : (
            <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {labels.map((label) => (
                <li
                  key={label.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className={cn(
                        "size-2 rounded-full",
                        TONE_DOT_CLASSES[label.tone],
                      )}
                    />
                    <span className="text-[13px] font-medium text-zinc-900">
                      {label.name}
                    </span>
                    {label.description ? (
                      <span className="truncate text-[11px] text-zinc-500">
                        {label.description}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(label)}
                      aria-label={`Edit ${label.name}`}
                      className="size-7 text-zinc-500 hover:text-zinc-900"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleDelete(label)}
                      aria-label={`Delete ${label.name}`}
                      className="size-7 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {isFormOpen ? (
            <LabelForm
              label={editingLabel}
              onSaved={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </div>
        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing("new")}
            className="h-8 gap-1.5 rounded-lg px-3 text-xs"
          >
            <Plus className="size-3.5" />
            New label
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 rounded-lg px-3 text-xs"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
