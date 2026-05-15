"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { TeamForm } from "./TeamForm";
import { useSupportTeams } from "../../../hooks/use-support-agents";
import { useDeleteSupportTeam } from "../../../hooks/use-support-mutations";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsPanel } from "../SettingsPanel";

import type { SupportTeam } from "../../../types";

export function TeamList() {
  const teams = useSupportTeams();
  const deleteTeam = useDeleteSupportTeam();
  const [editing, setEditing] = React.useState<SupportTeam | "new" | null>(
    null,
  );

  const rows = (teams.data ?? []) as SupportTeam[];
  const editingTeam = editing && editing !== "new" ? editing : null;
  const isFormOpen = editing !== null;

  const handleDelete = async (team: SupportTeam) => {
    if (!window.confirm(`Remove team "${team.name}"?`)) return;
    try {
      await deleteTeam.mutateAsync({ id: team.id });
      toast.success("Team removed.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not remove the team.",
      );
    }
  };

  return (
    <SettingsPanel
      title="Teams"
      description="Group collaborators so automations and macros can route by function."
      actions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing("new")}
          className="h-8 gap-1.5 rounded-lg px-3 text-xs"
        >
          <Plus className="size-3.5" />
          New team
        </Button>
      }
    >
      {rows.length === 0 && !isFormOpen ? (
        <SupportEmptySection
          icon={<Users className="size-4" />}
          title="No teams yet"
          description="Create the first team to enable macro and automation team routing."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => setEditing("new")}
              className="h-8 rounded-lg px-3 text-xs"
            >
              Create a team
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-100">
          {rows.map((team) => (
            <li key={team.id} className="flex items-center gap-3 py-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-zinc-100 font-mono text-[11px] font-black uppercase tracking-wider text-zinc-700">
                {team.initials}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[13px] font-semibold text-zinc-900">
                  {team.name}
                </span>
                {team.description ? (
                  <span className="truncate text-[11px] text-zinc-500">
                    {team.description}
                  </span>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditing(team)}
                aria-label={`Edit ${team.name}`}
                className="size-8 text-zinc-500 hover:text-zinc-900"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void handleDelete(team)}
                aria-label={`Remove ${team.name}`}
                className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {isFormOpen ? (
        <TeamForm
          team={editingTeam}
          onSaved={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </SettingsPanel>
  );
}
