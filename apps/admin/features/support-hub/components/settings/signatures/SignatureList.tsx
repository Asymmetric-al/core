"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
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
import { Pencil, PenLine, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SignatureForm } from "./SignatureForm";
import { useSupportAgents } from "../../../hooks/use-support-agents";
import {
  useDeleteSupportSignature,
  useSetDefaultSupportSignature,
} from "../../../hooks/use-support-mutations";
import { useSupportSignatures } from "../../../hooks/use-support-signatures";
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

import type { SupportSignature } from "../../../types";

export function SignatureList() {
  const query = useSupportSignatures();
  const signatures = query.data;
  const listState = {
    isLoading: query.isLoading,
    isError: query.isError,
    itemCount: signatures.length,
  };
  const { data: agents } = useSupportAgents();
  const deleteSig = useDeleteSupportSignature();
  const setDefault = useSetDefaultSupportSignature();
  const editor = useSettingsEditor<SupportSignature>();
  const editingRow = editor.record;

  const ownerName = (ownerAgentId: string | null): string => {
    if (!ownerAgentId) return "Workspace";
    return agents.find((agent) => agent.id === ownerAgentId)?.name ?? "Unknown";
  };

  const confirm = useConfirm();
  const handleDelete = async (row: SupportSignature) => {
    await confirm({
      title: `Delete the ${row.name} signature?`,
      confirmLabel: "Delete signature",
      action: async () => {
        try {
          await deleteSig.mutateAsync({ id: row.id });
          toast.success("Signature deleted.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not delete the signature.",
          );
          throw error;
        }
      },
    });
  };

  const handleMakeDefault = async (row: SupportSignature) => {
    try {
      await setDefault.mutateAsync({ id: row.id });
      toast.success(
        row.ownerAgentId
          ? `Default signature for ${ownerName(row.ownerAgentId)} updated.`
          : "Workspace signature set as default.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the default.",
      );
    }
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
      New signature
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <SettingsNotAppliedNote>
        Replies currently sign with the agent’s name, title and email. Saved
        signatures aren’t added to replies yet.
      </SettingsNotAppliedNote>
      <SettingsPanel
        title="Signatures"
        description="Signatures for replies. An agent’s own default takes priority over the workspace default."
        actions={settingsHeaderAction(listState, createButton)}
      >
        <SettingsListState
          noun="signatures"
          {...listState}
          onRetry={query.refetch}
        >
          {signatures.length === 0 ? (
            <SupportEmptySection
              icon={<PenLine className="size-4" />}
              title="No signatures yet"
              description="Create a workspace signature first, then override per agent."
              action={createButton}
            />
          ) : (
            <ItemGroup className="gap-2">
              {signatures.map((row) => (
                <Item key={row.id} variant="outline" size="sm">
                  <ItemMedia variant="icon">
                    <PenLine aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle>
                      {row.name}
                      {row.isDefault ? (
                        <Badge variant="secondary">Default</Badge>
                      ) : null}
                    </ItemTitle>
                    <ItemDescription>
                      {ownerName(row.ownerAgentId)} · {row.bodyText}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <SettingsIconButton
                      label={`Edit ${row.name}`}
                      tooltip="Edit"
                      onClick={() => editor.openRecord(row)}
                    >
                      <Pencil aria-hidden="true" />
                    </SettingsIconButton>
                    {!row.isDefault ? (
                      <SettingsIconButton
                        label={`Make ${row.name} default`}
                        tooltip="Make default"
                        disabled={setDefault.isPending}
                        onClick={() => void handleMakeDefault(row)}
                      >
                        <Star aria-hidden="true" />
                      </SettingsIconButton>
                    ) : null}
                    <SettingsIconButton
                      label={`Delete ${row.name}`}
                      tooltip="Delete"
                      onClick={() => void handleDelete(row)}
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
        title={editingRow ? `Edit “${editingRow.name}”` : "New signature"}
        description="Saved for reference: replies don’t add saved signatures yet."
      >
        <SignatureForm
          key={editingRow?.id ?? "new-signature"}
          signature={editingRow}
          onSaved={editor.close}
          onCancel={editor.requestClose}
        />
      </SettingsEditorSheet>
    </div>
  );
}
