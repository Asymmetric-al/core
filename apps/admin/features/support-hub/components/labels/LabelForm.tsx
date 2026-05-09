"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label as UiLabel } from "@asym/ui/components/shadcn/label";
import { cn } from "@asym/ui/lib/utils";
import { Check } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useSaveSupportLabel } from "../../hooks/use-support-mutations";
import {
  SUPPORT_LABEL_TONES,
  type SupportLabel,
  type SupportLabelTone,
} from "../../types";

interface LabelFormProps {
  /** When set, the form edits an existing label; otherwise it creates one. */
  label?: SupportLabel | null;
  onSaved: () => void;
  onCancel: () => void;
}

const TONE_PREVIEW_CLASSES: Record<SupportLabelTone, string> = {
  zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

const TONE_DOT_CLASSES: Record<SupportLabelTone, string> = {
  zinc: "bg-zinc-400",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
};

/**
 * Inline form used inside `<LabelManagerDialog />`. Saves through the Phase 5
 * `useSaveSupportLabel` mutation (additive over the Phase 2 collection
 * writer) so the optimistic flow + cache invalidation is identical to every
 * other support-hub mutation.
 */
export function LabelForm({ label, onSaved, onCancel }: LabelFormProps) {
  const saveLabel = useSaveSupportLabel();
  const [name, setName] = React.useState(label?.name ?? "");
  const [description, setDescription] = React.useState(
    label?.description ?? "",
  );
  const [tone, setTone] = React.useState<SupportLabelTone>(
    label?.tone ?? "zinc",
  );

  const trimmedName = name.trim();

  const handleSave = async () => {
    if (trimmedName.length === 0) {
      toast.info("Give the label a name first.");
      return;
    }
    try {
      await saveLabel.mutateAsync({
        id: label?.id,
        name: trimmedName,
        slug: label?.slug ?? slugify(trimmedName),
        tone,
        description: description.trim().length > 0 ? description.trim() : null,
      });
      toast.success(label ? "Label updated." : "Label created.");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the label.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3">
      <div className="space-y-2">
        <UiLabel htmlFor="support-label-name">Name</UiLabel>
        <Input
          id="support-label-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Finance"
          maxLength={80}
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <UiLabel htmlFor="support-label-description">Description</UiLabel>
        <Input
          id="support-label-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What kind of donor questions belong here?"
          maxLength={140}
        />
      </div>
      <div className="space-y-2">
        <UiLabel className="block">Tone</UiLabel>
        <div className="flex flex-wrap items-center gap-2">
          {SUPPORT_LABEL_TONES.map((option) => {
            const isActive = option === tone;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTone(option)}
                aria-pressed={isActive}
                aria-label={`Use ${option} tone`}
                className={cn(
                  "flex h-8 items-center gap-1 rounded-md border px-2 text-[11px] font-semibold uppercase tracking-wider",
                  isActive
                    ? "border-zinc-900"
                    : "border-zinc-200 hover:border-zinc-300",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-2 rounded-full",
                    TONE_DOT_CLASSES[option],
                  )}
                />
                {option}
                {isActive ? <Check className="size-3 text-zinc-900" /> : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <UiLabel className="block">Preview</UiLabel>
        <span
          className={cn(
            "inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset",
            TONE_PREVIEW_CLASSES[tone],
          )}
        >
          {trimmedName.length > 0 ? trimmedName : "Label preview"}
        </span>
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
          onClick={handleSave}
          disabled={saveLabel.isPending || trimmedName.length === 0}
          className="h-8 rounded-lg px-3 text-xs"
        >
          {label ? "Save changes" : "Create label"}
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
