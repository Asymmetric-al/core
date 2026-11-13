"use client";

import { Avatar, AvatarFallback } from "@asym/ui/components/shadcn/avatar";
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
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { TeamForm } from "./TeamForm";
import { useSupportTeams } from "../../../hooks/use-support-agents";
import { useDeleteSupportTeam } from "../../../hooks/use-support-mutations";
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

import type { SupportTeam } from "../../../types";

export function TeamList() {
  const teams = useSupportTeams();
  const deleteTeam = useDeleteSupportTeam();
  const editor = useSettingsEditor<SupportTeam>();
  const editingTeam = editor.record;

  const rows = teams.data;
  const listState = {
    isLoading: teams.isLoading,
    isError: teams.isError,
    itemCount: rows.length,
  };

  const confirm = useConfirm();
  const handleDelete = async (team: SupportTeam) => {
    await confirm({
      title: `Delete the ${team.name} team?`,
      description: "Conversations assigned to the team keep their agent.",
      confirmLabel: "Delete team",
      action: async () => {
        try {
          await deleteTeam.mutateAsync({ id: team.id });
          toast.success("Team deleted.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not delete the team.",
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
      New team
    </Button>
  );

  return (
    <>
      <SettingsNotAppliedNote>
        Teams are saved, but conversations can’t be assigned to a team yet, so a
        macro’s Assign team step is skipped.
      </SettingsNotAppliedNote>
      <SettingsPanel
        title="Teams"
        description="Groups of collaborators, such as receipts or major gifts."
        actions={settingsHeaderAction(listState, createButton)}
      >
        <SettingsListState noun="teams" {...listState} onRetry={teams.refetch}>
          {rows.length === 0 ? (
            <SupportEmptySection
              icon={<Users className="size-4" />}
              title="No teams yet"
              description="Create a team to group collaborators by the work they do."
              action={createButton}
            />
          ) : (
            <ItemGroup className="gap-2">
              {rows.map((team) => (
                <Item key={team.id} variant="outline" size="sm">
                  {/* The name sits beside the initials, so they're decorative. */}
                  <ItemMedia>
                    <Avatar aria-hidden="true">
                      <AvatarFallback>{team.initials}</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle>{team.name}</ItemTitle>
                    {team.description ? (
                      <ItemDescription>{team.description}</ItemDescription>
                    ) : null}
                  </ItemContent>
                  <ItemActions>
                    <SettingsIconButton
                      label={`Edit ${team.name}`}
                      tooltip="Edit"
                      onClick={() => editor.openRecord(team)}
                    >
                      <Pencil aria-hidden="true" />
                    </SettingsIconButton>
                    <SettingsIconButton
                      label={`Delete ${team.name}`}
                      tooltip="Delete"
                      onClick={() => void handleDelete(team)}
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
        title={editingTeam ? `Edit “${editingTeam.name}”` : "New team"}
        description="A name, initials and a short note on the work the team does."
      >
        <TeamForm
          key={editingTeam?.id ?? "new-team"}
          team={editingTeam}
          onSaved={editor.close}
          onCancel={editor.requestClose}
        />
      </SettingsEditorSheet>
    </>
  );
}
