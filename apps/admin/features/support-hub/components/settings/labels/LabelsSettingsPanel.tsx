"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useSupportLabels } from "../../../hooks/use-support-labels";
import { useDeleteSupportLabel } from "../../../hooks/use-support-mutations";
import { LabelForm } from "../../labels/LabelForm";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsPanel } from "../SettingsPanel";

import type { SupportLabel, SupportLabelTone } from "../../../types";

const TONE_DOT: Record<SupportLabelTone, string> = {
  zinc: "bg-zinc-400",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
};

export function LabelsSettingsPanel() {
  const { data: labels } = useSupportLabels();
  const deleteLabel = useDeleteSupportLabel();
  const [editing, setEditing] = React.useState<SupportLabel | "new" | null>(
    null,
  );

  const editingLabel = editing && editing !== "new" ? editing : null;

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

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel
        title="Labels"
        description="Tag donor conversations across the inbox, board, and reports."
        actions={
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
        }
      >
        {labels.length === 0 ? (
          <SupportEmptySection
            icon={<Tag className="size-4" />}
            title="No labels yet"
            description="Create the first label to start triaging donor questions."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100">
            {labels.map((label) => (
              <li key={label.id} className="flex items-center gap-3 py-2">
                <span
                  aria-hidden
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    TONE_DOT[label.tone],
                  )}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13px] font-semibold text-zinc-900">
                    {label.name}
                  </span>
                  {label.description ? (
                    <span className="truncate text-[11px] text-zinc-500">
                      {label.description}
                    </span>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(label)}
                  aria-label={`Edit ${label.name}`}
                  className="size-8 text-zinc-500 hover:text-zinc-900"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(label)}
                  aria-label={`Delete ${label.name}`}
                  className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SettingsPanel>

      {editing ? (
        <LabelForm
          label={editingLabel}
          onSaved={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
