"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import * as React from "react";
import { toast } from "sonner";

import { useSaveSupportTeam } from "../../../hooks/use-support-mutations";

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
        slug: slug.trim() || slugify(trimmedName),
        initials: (
          initials.trim() || trimmedName.slice(0, 2).toUpperCase()
        ).slice(0, 4),
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
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="team-name">Name</Label>
          <Input
            id="team-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="team-initials">Initials</Label>
          <Input
            id="team-initials"
            value={initials}
            onChange={(event) => setInitials(event.target.value.toUpperCase())}
            maxLength={4}
            className="font-mono"
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
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 rounded-lg px-3 text-xs"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={saveTeam.isPending || name.trim().length === 0}
          onClick={handleSave}
          className="h-8 rounded-lg px-3 text-xs"
        >
          {team ? "Save changes" : "Create team"}
        </Button>
      </div>
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
