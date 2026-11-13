"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Pencil, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { MacroForm } from "./MacroForm";
import { useSupportMacros } from "../../../hooks/use-support-macros";
import { useDeleteSupportMacro } from "../../../hooks/use-support-mutations";
import { MacroPreviewLine } from "../../macros/MacroPreviewLine";
import { useConfirm } from "../../workspace/confirm-provider";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsEditorSheet } from "../SettingsEditorSheet";
import {
  SettingsListState,
  isSettingsListPending,
  settingsHeaderAction,
} from "../SettingsListState";
import { SettingsNotAppliedNote } from "../SettingsNotAppliedNote";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsIconButton } from "../SettingsRowActions";
import { useSettingsEditor } from "../use-settings-editor";

import type { SupportMacro } from "../../../types";

export function MacroList() {
  const query = useSupportMacros();
  const macros = query.data;
  const listState = {
    isLoading: query.isLoading,
    isError: query.isError,
    itemCount: macros.length,
  };
  const deleteMacro = useDeleteSupportMacro();
  const editor = useSettingsEditor<SupportMacro>();
  const editingMacro = editor.record;

  const confirm = useConfirm();
  const handleDelete = async (macro: SupportMacro) => {
    await confirm({
      title: `Delete the ${macro.name} macro?`,
      confirmLabel: "Delete macro",
      action: async () => {
        try {
          await deleteMacro.mutateAsync({ id: macro.id });
          toast.success("Macro deleted.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not delete the macro.",
          );
          throw error;
        }
      },
    });
  };

  const createButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isSettingsListPending(listState)}
      onClick={editor.openNew}
    >
      <Plus data-icon="inline-start" aria-hidden="true" />
      New macro
    </Button>
  );

  const skipsTeamStep = macros.some((macro) =>
    macro.actions.some((action) => action.kind === "assign_team"),
  );

  return (
    <div className="flex flex-col gap-4">
      {skipsTeamStep ? (
        <SettingsNotAppliedNote>
          Assign team steps are skipped when a macro runs, because conversations
          can’t be assigned to a team yet.
        </SettingsNotAppliedNote>
      ) : null}
      <SettingsPanel
        title="Macros"
        description="Steps an agent runs on a conversation at once, from the reply composer or the command palette."
        actions={settingsHeaderAction(listState, createButton)}
      >
        <SettingsListState noun="macros" {...listState} onRetry={query.refetch}>
          {macros.length === 0 ? (
            <SupportEmptySection
              icon={<Wand2 className="size-4" />}
              title="No macros yet"
              description="Create a macro for steps you repeat, such as adding a label and resolving."
              action={createButton}
            />
          ) : (
            <ItemGroup className="gap-2">
              {macros.map((macro) => (
                <Item key={macro.id} variant="outline" size="sm">
                  <ItemMedia variant="icon">
                    <Wand2 aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle>{macro.name}</ItemTitle>
                    {macro.description ? (
                      <ItemDescription>{macro.description}</ItemDescription>
                    ) : null}
                    <MacroPreviewLine actions={macro.actions} />
                  </ItemContent>
                  <ItemActions>
                    <SettingsIconButton
                      label={`Edit ${macro.name}`}
                      tooltip="Edit"
                      onClick={() => editor.openRecord(macro)}
                    >
                      <Pencil aria-hidden="true" />
                    </SettingsIconButton>
                    <SettingsIconButton
                      label={`Delete ${macro.name}`}
                      tooltip="Delete"
                      onClick={() => void handleDelete(macro)}
                    >
                      <Trash2 aria-hidden="true" />
                    </SettingsIconButton>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </SettingsListState>
      </SettingsPanel>

      <SettingsEditorSheet
        editor={editor}
        wide
        title={editingMacro ? `Edit “${editingMacro.name}”` : "New macro"}
        description="The steps run in order on the conversation it’s used on."
      >
        <MacroForm
          key={editingMacro?.id ?? "new-macro"}
          macro={editingMacro}
          onSaved={editor.close}
          onCancel={editor.requestClose}
        />
      </SettingsEditorSheet>
    </div>
  );
}
