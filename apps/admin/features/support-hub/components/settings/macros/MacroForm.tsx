"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import * as React from "react";
import { toast } from "sonner";

import { useSaveSupportMacro } from "../../../hooks/use-support-mutations";
import { MacroPreviewLine } from "../../macros/MacroPreviewLine";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";
import { MacroActionEditor } from "./MacroActionEditor";

import type { SupportMacro, SupportMacroAction } from "../../../types";

interface MacroFormProps {
  macro?: SupportMacro | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function MacroForm({ macro, onSaved, onCancel }: MacroFormProps) {
  const save = useSaveSupportMacro();

  const [name, setName] = React.useState(macro?.name ?? "");
  const [description, setDescription] = React.useState(
    macro?.description ?? "",
  );
  const [actions, setActions] = React.useState<SupportMacroAction[]>(
    macro?.actions ?? [],
  );

  const isDirty = React.useMemo(
    () =>
      !macro ||
      name !== macro.name ||
      description !== (macro.description ?? "") ||
      JSON.stringify(actions) !== JSON.stringify(macro.actions),
    [actions, description, macro, name],
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.info("Give the macro a name first.");
      return;
    }
    if (actions.length === 0) {
      toast.info("Add at least one action.");
      return;
    }
    try {
      await save.mutateAsync({
        id: macro?.id,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        ownerAgentId: macro?.ownerAgentId ?? null,
        actions,
      });
      toast.success(macro ? "Macro updated." : "Macro created.");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the macro.",
      );
    }
  };

  return (
    <SettingsPanel
      title={macro ? `Edit "${macro.name}"` : "New macro"}
      description="Sequence of actions agents can run against a conversation with one click."
    >
      <SettingsRow label="Name" htmlFor="macro-name">
        <Input
          id="macro-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
        />
      </SettingsRow>
      <SettingsRow label="Description" htmlFor="macro-desc">
        <Textarea
          id="macro-desc"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          maxLength={240}
        />
      </SettingsRow>
      <SettingsRow label="Preview">
        <MacroPreviewLine actions={actions} />
      </SettingsRow>
      <MacroActionEditor actions={actions} onChange={setActions} />

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 rounded-lg px-3 text-xs"
        >
          Cancel
        </Button>
      </div>

      <SettingsToolbar
        isDirty={isDirty}
        isSaving={save.isPending}
        onSave={handleSave}
        onCancel={onCancel}
      />
    </SettingsPanel>
  );
}
