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
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BusinessHoursForm } from "./BusinessHoursForm";
import { useSupportBusinessHours } from "../../../hooks/use-support-inbox-settings";
import { useDeleteSupportBusinessHours } from "../../../hooks/use-support-mutations";
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

import type { SupportBusinessHours } from "../../../types";

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function BusinessHoursList() {
  const query = useSupportBusinessHours();
  const deleteHours = useDeleteSupportBusinessHours();
  const editor = useSettingsEditor<SupportBusinessHours>();
  const editingHours = editor.record;

  const rows = query.data;
  const listState = {
    isLoading: query.isLoading,
    isError: query.isError,
    itemCount: rows.length,
  };

  const confirm = useConfirm();
  const handleDelete = async (row: SupportBusinessHours) => {
    await confirm({
      title: `Delete ${row.name}?`,
      description: "Its weekly schedule and holidays are removed.",
      confirmLabel: "Delete hours",
      action: async () => {
        try {
          await deleteHours.mutateAsync({ id: row.id });
          toast.success("Business hours deleted.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not delete business hours.",
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
      New schedule
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <SettingsNotAppliedNote>
        Only the reports business-hours filter uses the default schedule today,
        and it reads the times as UTC. SLA timers and off-hours automation don’t
        run yet.
      </SettingsNotAppliedNote>
      <SettingsPanel
        title="Business hours"
        description="When donor care staff are on the clock."
        actions={settingsHeaderAction(listState, createButton)}
      >
        <SettingsListState
          noun="business hours"
          {...listState}
          onRetry={query.refetch}
        >
          {rows.length === 0 ? (
            <SupportEmptySection
              icon={<Clock className="size-4" />}
              title="No business hours yet"
              description="Create a schedule to use the business-hours report filter."
              action={createButton}
            />
          ) : (
            <ItemGroup className="gap-2">
              {rows.map((row) => (
                <Item key={row.id} variant="outline" size="sm">
                  <ItemMedia variant="icon">
                    <Clock aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle>
                      {row.name}
                      {row.isDefault ? (
                        <Badge variant="secondary">Default</Badge>
                      ) : null}
                    </ItemTitle>
                    <ItemDescription>
                      {row.timezone} ·{" "}
                      {plural(
                        row.weeklySchedule.filter((entry) => entry.enabled)
                          .length,
                        "working day",
                      )}{" "}
                      · {plural(row.holidays.length, "holiday")}
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
        title={
          editingHours ? `Edit “${editingHours.name}”` : "New business hours"
        }
        description="Weekly schedule and holidays. The reports business-hours filter uses the workspace default."
      >
        <BusinessHoursForm
          key={editingHours?.id ?? "new-hours"}
          hours={editingHours}
          onSaved={editor.close}
          onCancel={editor.requestClose}
        />
      </SettingsEditorSheet>
    </div>
  );
}
