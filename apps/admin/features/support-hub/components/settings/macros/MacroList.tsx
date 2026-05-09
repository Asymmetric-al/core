"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Pencil, Plus, Trash2, Wand2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { MacroForm } from "./MacroForm";
import { useSupportMacros } from "../../../hooks/use-support-macros";
import { useDeleteSupportMacro } from "../../../hooks/use-support-mutations";
import { MacroPreviewLine } from "../../macros/MacroPreviewLine";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsPanel } from "../SettingsPanel";

import type { SupportMacro } from "../../../types";

export function MacroList() {
  const { data: macros } = useSupportMacros();
  const deleteMacro = useDeleteSupportMacro();
  const [editing, setEditing] = React.useState<SupportMacro | "new" | null>(
    null,
  );

  const editingMacro = editing && editing !== "new" ? editing : null;

  const handleDelete = async (macro: SupportMacro) => {
    if (!window.confirm(`Delete macro "${macro.name}"?`)) return;
    try {
      await deleteMacro.mutateAsync({ id: macro.id });
      toast.success("Macro deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the macro.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel
        title="Macros"
        description="One-click multi-step actions for the conversation header + command palette."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing("new")}
            className="h-8 gap-1.5 rounded-lg px-3 text-xs"
          >
            <Plus className="size-3.5" />
            New macro
          </Button>
        }
      >
        {macros.length === 0 ? (
          <SupportEmptySection
            icon={<Wand2 className="size-4" />}
            title="No macros yet"
            description="Create a macro to automate common donor-care sequences."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100">
            {macros.map((macro) => (
              <li
                key={macro.id}
                className="flex flex-wrap items-start gap-3 py-3"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                  <Wand2 className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[13px] font-semibold text-zinc-900">
                    {macro.name}
                  </span>
                  {macro.description ? (
                    <span className="text-[11px] text-zinc-500">
                      {macro.description}
                    </span>
                  ) : null}
                  <MacroPreviewLine actions={macro.actions} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(macro)}
                  aria-label={`Edit ${macro.name}`}
                  className="size-8 text-zinc-500 hover:text-zinc-900"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(macro)}
                  aria-label={`Delete ${macro.name}`}
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
        <MacroForm
          macro={editingMacro}
          onSaved={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
