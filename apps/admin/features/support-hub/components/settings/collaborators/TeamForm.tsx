"use client";

import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import * as React from "react";
import { toast } from "sonner";

import { useSaveSupportTeam } from "../../../hooks/use-support-mutations";
import { SettingsEditorForm } from "../SettingsEditorSheet";

import type { SupportTeam } from "../../../types";

interface TeamFormProps {
  team?: SupportTeam | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function TeamForm({ team, onSaved, onCancel }: TeamFormProps) {
  const saveTeam = useSaveSupportTeam();
  const [name, setName] = React.useState(team?.name ?? "");
  const [slug] = React.useState(team?.slug ?? "");
  const [initials, setInitials] = React.useState(team?.initials ?? "");
  const [description, setDescription] = React.useState(team?.description ?? "");
  const isDirty =
    !team ||
    name !== team.name ||
    initials !== team.initials ||
    description !== (team.description ?? "");

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.info("Give the team a name first.");
      return;
    }
    try {
      await saveTeam.mutateAsync({
        id: team?.id,
        name: trimmedName,
        // The schema needs a non-empty slug, and names in non-Latin scripts
        // slugify to nothing.
        slug:
          slug.trim() ||
          slugify(trimmedName) ||
          `team-${crypto.randomUUID().slice(0, 8)}`,
        initials: (initials.trim() || trimmedName.slice(0, 2))
          .toUpperCase()
          .slice(0, 4),
        description: description.trim() ? description.trim() : null,
      });
      toast.success(team ? "Team updated." : "Team created.");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the team.",
      );
    }
  };

  return (
    <SettingsEditorForm
      draft={{ name, initials, description }}
      canSave={isDirty && name.trim().length > 0}
      isNew={!team}
      isSaving={saveTeam.isPending}
      noun="team"
      onSave={() => void handleSave()}
      onCancel={onCancel}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="team-name">Name</Label>
          <Input
            id="team-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="team-initials">Initials</Label>
          <Input
            id="team-initials"
            value={initials}
            onChange={(event) => setInitials(event.target.value.toUpperCase())}
            maxLength={4}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="team-description">Description</Label>
        <Input
          id="team-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={140}
          placeholder="What kind of donor questions belong here?"
        />
      </div>
    </SettingsEditorForm>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
