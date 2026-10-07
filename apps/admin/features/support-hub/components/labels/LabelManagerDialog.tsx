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
  zinc: "bg-muted-foreground",
  blue: "bg-info",
  amber: "bg-warning",
  rose: "bg-destructive",
  emerald: "bg-success",
  violet: "bg-chart-3",
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* The popup unmounts while closed, so the editing state below starts
            fresh on every open without a reset effect. */}
        <LabelManagerDialogBody onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function LabelManagerDialogBody({ onDone }: { onDone: () => void }) {
  const { data: labels } = useSupportLabels();
  const deleteLabel = useDeleteSupportLabel();
  const [editing, setEditing] = React.useState<SupportLabel | "new" | null>(
    null,
  );

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
    <>
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
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center">
            <span className="flex size-8 items-center justify-center rounded-lg bg-card shadow-sm ring-1 ring-border">
              <Tag className="size-4 text-muted-foreground" />
            </span>
            <p className="text-xs font-medium text-foreground">No labels yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Create the first label to start triaging donor questions.
            </p>
          </div>
        ) : (
          <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {labels.map((label) => (
              <li
                key={label.id}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/40"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      "size-2 rounded-full",
                      TONE_DOT_CLASSES[label.tone],
                    )}
                  />
                  <span className="text-xs font-medium text-foreground">
                    {label.name}
                  </span>
                  {label.description ? (
                    <span className="truncate text-xs text-muted-foreground">
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
                    className="size-7 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleDelete(label)}
                    aria-label={`Delete ${label.name}`}
                    className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
          aria-label="Close label manager"
          onClick={onDone}
          className="h-8 rounded-lg px-3 text-xs"
        >
          Close
        </Button>
      </DialogFooter>
    </>
  );
}
