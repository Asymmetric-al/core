"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import { cn } from "@asym/ui/lib/utils";
import { Check } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { LABEL_BADGE_VARIANTS } from "./label-badge-variants";
import { useSaveSupportLabel } from "../../hooks/use-support-mutations";
import {
  SUPPORT_LABEL_TONES,
  type SupportLabel,
  type SupportLabelTone,
} from "../../types/label";

interface LabelFormProps {
  /** When set, the form edits an existing label; otherwise it creates one. */
  label?: SupportLabel | null;
  onSaved: () => void;
  onCancel: () => void;
  onStateChange?: (state: { hasChanges: boolean; isSaving: boolean }) => void;
}

const TONE_LABELS: Record<SupportLabelTone, string> = {
  zinc: "Neutral",
  blue: "Blue",
  amber: "Amber",
  rose: "Red",
  emerald: "Green",
  violet: "Violet",
};
const TONE_DOT_CLASSES: Record<SupportLabelTone, string> = {
  zinc: "bg-muted-foreground",
  blue: "bg-info",
  amber: "bg-warning",
  rose: "bg-destructive",
  emerald: "bg-success",
  violet: "bg-chart-3",
};

/**
 * Inline form used inside `<LabelManagerDialog />`. Saves through the Phase 5
 * `useSaveSupportLabel` mutation (additive over the Phase 2 collection
 * writer) so the optimistic flow + cache invalidation is identical to every
 * other support-hub mutation.
 */
export function LabelForm({
  label,
  onSaved,
  onCancel,
  onStateChange,
}: LabelFormProps) {
  const saveLabel = useSaveSupportLabel();
  const [name, setName] = React.useState(label?.name ?? "");
  const [description, setDescription] = React.useState(
    label?.description ?? "",
  );
  const [tone, setTone] = React.useState<SupportLabelTone>(
    label?.tone ?? "zinc",
  );

  const nameRef = React.useRef<HTMLInputElement>(null);
  const hasChanges =
    name !== (label?.name ?? "") ||
    description !== (label?.description ?? "") ||
    tone !== (label?.tone ?? "zinc");
  React.useEffect(() => {
    onStateChange?.({ hasChanges, isSaving: saveLabel.isPending });
  }, [onStateChange, hasChanges, saveLabel.isPending]);
  React.useEffect(
    () => () => onStateChange?.({ hasChanges: false, isSaving: false }),
    [onStateChange],
  );
  const trimmedName = name.trim();
  const [nameError, setNameError] = React.useState("");

  const handleSave = async () => {
    if (trimmedName.length === 0) {
      setNameError("Enter a label name.");
      nameRef.current?.focus();
      return;
    }
    try {
      await saveLabel.mutateAsync({
        id: label?.id,
        name: trimmedName,
        slug:
          label?.slug ??
          (slugify(trimmedName) || `label-${crypto.randomUUID().slice(0, 8)}`),
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
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!saveLabel.isPending) void handleSave();
      }}
      className="flex flex-col gap-3"
    >
      <Field>
        <FieldLabel htmlFor="support-label-name">Name</FieldLabel>
        <Input
          id="support-label-name"
          ref={nameRef}
          value={name}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "support-label-name-error" : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setNameError("");
          }}
          placeholder="Finance"
          maxLength={80}
          autoFocus
        />
        <FieldError id="support-label-name-error">{nameError}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="support-label-description">Description</FieldLabel>
        <Input
          id="support-label-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What kind of donor questions belong here?"
          maxLength={140}
        />
      </Field>
      <div>
        <FieldLabel id="support-label-tone">Tone</FieldLabel>
        <ToggleGroup
          aria-labelledby="support-label-tone"
          value={[tone]}
          onValueChange={(values) => {
            const next = SUPPORT_LABEL_TONES.find(
              (option) => option === values[0],
            );
            if (next) setTone(next);
          }}
          spacing={2}
          size="sm"
          variant="outline"
          className="flex flex-wrap items-center gap-2"
        >
          {SUPPORT_LABEL_TONES.map((option) => {
            const isActive = option === tone;
            return (
              <ToggleGroupItem
                key={option}
                value={option}
                type="button"
                aria-label={`Use ${TONE_LABELS[option]} tone`}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-2 rounded-full",
                    TONE_DOT_CLASSES[option],
                  )}
                />
                {TONE_LABELS[option]}
                {isActive ? <Check aria-hidden="true" /> : null}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
      <div>
        <FieldLabel>Preview</FieldLabel>
        <Badge variant={LABEL_BADGE_VARIANTS[tone]}>
          {trimmedName.length > 0 ? trimmedName : "Label preview"}
        </Badge>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={saveLabel.isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={saveLabel.isPending}
          focusableWhenDisabled={saveLabel.isPending}
        >
          {label ? "Save changes" : "Create label"}
        </Button>
      </div>
    </form>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
