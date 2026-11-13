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
import { Gauge, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SlaPolicyForm } from "./SlaPolicyForm";
import { useSupportSlaPolicies } from "../../../hooks/use-support-inbox-settings";
import {
  useDeleteSupportSlaPolicy,
  useSetDefaultSupportSlaPolicy,
} from "../../../hooks/use-support-mutations";
import { formatSupportDuration } from "../../../lib/format-duration";
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

import type { SupportSlaPolicy } from "../../../types";

export function SlaPolicyList() {
  const query = useSupportSlaPolicies();
  const deletePolicy = useDeleteSupportSlaPolicy();
  const setDefault = useSetDefaultSupportSlaPolicy();
  const editor = useSettingsEditor<SupportSlaPolicy>();
  const editingRow = editor.record;

  const rows = query.data;
  const listState = {
    isLoading: query.isLoading,
    isError: query.isError,
    itemCount: rows.length,
  };

  const confirm = useConfirm();
  const handleDelete = async (row: SupportSlaPolicy) => {
    await confirm({
      title: `Delete the ${row.name} SLA policy?`,
      description: "The policy and its targets are removed.",
      confirmLabel: "Delete policy",
      action: async () => {
        try {
          await deletePolicy.mutateAsync({ id: row.id });
          toast.success("SLA policy deleted.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not delete the SLA policy.",
          );
          throw error;
        }
      },
    });
  };

  const handleMakeDefault = async (row: SupportSlaPolicy) => {
    try {
      await setDefault.mutateAsync({ id: row.id });
      toast.success(`"${row.name}" is now the default policy.`);
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
      New policy
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <SettingsNotAppliedNote>
        SLA policies are stored but not attached to conversations yet, so no
        timers run.
      </SettingsNotAppliedNote>
      <SettingsPanel
        title="SLA policies"
        description="First reply, next reply, and resolution targets for donor conversations."
        actions={settingsHeaderAction(listState, createButton)}
      >
        <SettingsListState
          noun="SLA policies"
          {...listState}
          onRetry={query.refetch}
        >
          {rows.length === 0 ? (
            <SupportEmptySection
              icon={<Gauge className="size-4" />}
              title="No SLA policies yet"
              description="Create a policy to set response and resolution targets."
              action={createButton}
            />
          ) : (
            <ItemGroup className="gap-2">
              {rows.map((row) => (
                <Item key={row.id} variant="outline" size="sm">
                  <ItemMedia variant="icon">
                    <Gauge aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle>
                      {row.name}
                      {row.isDefault ? (
                        <Badge variant="secondary">Workspace default</Badge>
                      ) : null}
                    </ItemTitle>
                    <ItemDescription>
                      First reply in{" "}
                      {formatSupportDuration(row.firstResponseMinutes)} · Next
                      reply in {formatSupportDuration(row.nextResponseMinutes)}{" "}
                      · Resolve in{" "}
                      {formatSupportDuration(row.resolutionMinutes)}
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
        title={editingRow ? `Edit “${editingRow.name}”` : "New SLA policy"}
        description="How quickly donor conversations should be answered and resolved. Timers don’t run on these targets yet."
      >
        <SlaPolicyForm
          key={editingRow?.id ?? "new-policy"}
          policy={editingRow}
          onSaved={editor.close}
          onCancel={editor.requestClose}
        />
      </SettingsEditorSheet>
    </div>
  );
}
