"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useSupportLabels } from "../../../hooks/use-support-labels";
import { useDeleteSupportLabel } from "../../../hooks/use-support-mutations";
import { LABEL_BADGE_VARIANTS } from "../../labels/label-badge-variants";
import { LabelForm } from "../../labels/LabelForm";
import { useConfirm } from "../../workspace/confirm-provider";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsDiscardConfirmation } from "../SettingsEditorSheet";
import {
  SettingsListState,
  isSettingsListPending,
  settingsHeaderAction,
} from "../SettingsListState";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsIconButton } from "../SettingsRowActions";
import { useSettingsEditor } from "../use-settings-editor";

import type { SupportLabel } from "../../../types";

export function LabelsSettingsPanel() {
  const query = useSupportLabels();
  const labels = query.data;
  const listState = {
    isLoading: query.isLoading,
    isError: query.isError,
    itemCount: labels.length,
  };
  const deleteLabel = useDeleteSupportLabel();
  const editor = useSettingsEditor<SupportLabel>();
  const editingLabel = editor.record;
  const updateGuard = editor.updateGuard;

  const confirm = useConfirm();
  const handleDelete = async (label: SupportLabel) => {
    await confirm({
      title: `Delete the ${label.name} label?`,
      description: "It is removed from every conversation that still has it.",
      confirmLabel: "Delete label",
      action: async () => {
        try {
          await deleteLabel.mutateAsync({ id: label.id });
          toast.success("Label deleted.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not delete the label.",
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
      New label
    </Button>
  );

  return (
    <>
      <SettingsPanel
        title="Labels"
        description="Tag donor conversations across the inbox, board, and reports."
        actions={settingsHeaderAction(listState, createButton)}
      >
        <SettingsListState noun="labels" {...listState} onRetry={query.refetch}>
          {labels.length === 0 ? (
            <SupportEmptySection
              icon={<Tag className="size-4" />}
              title="No labels yet"
              description="Create a label to sort donor conversations, such as receipts."
              action={createButton}
            />
          ) : (
            <ItemGroup className="gap-2">
              {labels.map((label) => (
                <Item key={label.id} variant="outline" size="sm">
                  <ItemContent className="min-w-0">
                    {/* The label as the inbox shows it, in its own colour. */}
                    <ItemTitle>
                      <Badge variant={LABEL_BADGE_VARIANTS[label.tone]}>
                        {label.name}
                      </Badge>
                    </ItemTitle>
                    {label.description ? (
                      <ItemDescription>{label.description}</ItemDescription>
                    ) : null}
                  </ItemContent>
                  <ItemActions>
                    <SettingsIconButton
                      label={`Edit ${label.name}`}
                      tooltip="Edit"
                      onClick={() => editor.openRecord(label)}
                    >
                      <Pencil aria-hidden="true" />
                    </SettingsIconButton>
                    <SettingsIconButton
                      label={`Delete ${label.name}`}
                      tooltip="Delete"
                      onClick={() => void handleDelete(label)}
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

      {/* The label form is the one the inbox's label manager uses, with its
          own Cancel and Save, so it sits in a small dialog. An outside click
          doesn't close it, so a half-typed label isn't lost by accident. */}
      <Dialog
        open={editor.open}
        onOpenChange={(open) => {
          if (!open) editor.requestClose();
        }}
        disablePointerDismissal
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLabel ? `Edit “${editingLabel.name}”` : "New label"}
            </DialogTitle>
            <DialogDescription>
              Labels tag conversations in the inbox, board and reports.
            </DialogDescription>
          </DialogHeader>
          {editor.hasTarget ? (
            <LabelForm
              key={editingLabel?.id ?? "new-label"}
              label={editingLabel}
              onSaved={editor.close}
              onCancel={editor.requestClose}
              onStateChange={updateGuard}
            />
          ) : null}
          <SettingsDiscardConfirmation editor={editor} />
        </DialogContent>
      </Dialog>
    </>
  );
}
