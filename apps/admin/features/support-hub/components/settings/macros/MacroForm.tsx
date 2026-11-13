"use client";

import { FieldError } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import * as React from "react";
import { toast } from "sonner";

import { useSaveSupportMacro } from "../../../hooks/use-support-mutations";
import { macroActionIssue } from "../../../lib/macro-action-validation";
import { MacroPreviewLine } from "../../macros/MacroPreviewLine";
import { createDraftRows } from "../draft-rows";
import { SettingsEditorForm } from "../SettingsEditorSheet";
import { SettingsRow } from "../SettingsRow";
import { MacroActionEditor } from "./MacroActionEditor";

import type { SupportMacro } from "../../../types";

interface MacroFormProps {
  macro?: SupportMacro | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function MacroForm({ macro, onSaved, onCancel }: MacroFormProps) {
  const save = useSaveSupportMacro();
  const formRef = React.useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const [name, setName] = React.useState(macro?.name ?? "");
  const [description, setDescription] = React.useState(
    macro?.description ?? "",
  );
  const [actionRows, setActionRows] = React.useState(() =>
    createDraftRows(macro?.actions ?? []),
  );
  const actions = React.useMemo(
    () => actionRows.map((row) => row.value),
    [actionRows],
  );

  const isDirty = React.useMemo(
    () =>
      !macro ||
      name !== macro.name ||
      description !== (macro.description ?? "") ||
      JSON.stringify(actions) !== JSON.stringify(macro.actions),
    [actions, description, macro, name],
  );

  const errors = actions.map(macroActionIssue);
  const handleSave = async () => {
    setSubmitted(true);
    if (!name.trim() || actions.length === 0 || errors.some(Boolean)) {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
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
    <SettingsEditorForm
      draft={{ name, description, actions }}
      canSave={isDirty}
      isNew={!macro}
      isSaving={save.isPending}
      noun="macro"
      onSave={() => void handleSave()}
      onCancel={onCancel}
    >
      <div ref={formRef} className="contents">
        <SettingsRow label="Name" htmlFor="macro-name">
          <Input
            id="macro-name"
            aria-invalid={submitted && !name.trim()}
            aria-describedby={
              submitted && !name.trim() ? "macro-name-error" : undefined
            }
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
          />
          {submitted && !name.trim() ? (
            <FieldError id="macro-name-error">Enter a name.</FieldError>
          ) : null}
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
        <SettingsRow control label="Preview">
          <MacroPreviewLine actions={actions} />
        </SettingsRow>
        <MacroActionEditor
          rows={actionRows}
          onChange={setActionRows}
          errors={submitted ? errors : undefined}
          emptyError={
            submitted && actions.length === 0
              ? "Add at least one action."
              : undefined
          }
        />
      </div>
    </SettingsEditorForm>
  );
}
