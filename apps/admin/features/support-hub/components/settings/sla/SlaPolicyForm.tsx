"use client";

import { FieldError } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import * as React from "react";
import { toast } from "sonner";

import { DurationField } from "./DurationField";
import { useSupportBusinessHours } from "../../../hooks/use-support-inbox-settings";
import { useSaveSupportSlaPolicy } from "../../../hooks/use-support-mutations";
import { durationPartsToMinutes, toDurationParts } from "../../../lib/duration";
import { SettingsEditorForm } from "../SettingsEditorSheet";
import { SettingsRow } from "../SettingsRow";

import type { SupportSlaPolicy } from "../../../types";

interface SlaPolicyFormProps {
  policy?: SupportSlaPolicy | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function SlaPolicyForm({
  policy,
  onSaved,
  onCancel,
}: SlaPolicyFormProps) {
  const save = useSaveSupportSlaPolicy();
  const formRef = React.useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const businessHours = useSupportBusinessHours();

  const [name, setName] = React.useState(policy?.name ?? "");
  const [description, setDescription] = React.useState(
    policy?.description ?? "",
  );
  const [first, setFirst] = React.useState(() =>
    toDurationParts(policy?.firstResponseMinutes ?? 480),
  );
  const [next, setNext] = React.useState(() =>
    toDurationParts(policy?.nextResponseMinutes ?? 720),
  );
  const [resolution, setResolution] = React.useState(() =>
    toDurationParts(policy?.resolutionMinutes ?? 5 * 24 * 60),
  );
  const [businessHoursId, setBusinessHoursId] = React.useState<string | null>(
    policy?.businessHoursId ?? null,
  );
  const [isDefault, setIsDefault] = React.useState(policy?.isDefault ?? false);

  const isDirty = React.useMemo(
    () =>
      !policy ||
      name !== policy.name ||
      description !== (policy.description ?? "") ||
      durationPartsToMinutes(first) !== policy.firstResponseMinutes ||
      durationPartsToMinutes(next) !== policy.nextResponseMinutes ||
      durationPartsToMinutes(resolution) !== policy.resolutionMinutes ||
      businessHoursId !== policy.businessHoursId ||
      isDefault !== policy.isDefault,
    [
      businessHoursId,
      description,
      first,
      isDefault,
      name,
      next,
      policy,
      resolution,
    ],
  );

  const handleSave = async () => {
    setSubmitted(true);
    const firstMinutes = durationPartsToMinutes(first);
    const nextMinutes = durationPartsToMinutes(next);
    const resolutionMinutes = durationPartsToMinutes(resolution);
    if (
      !name.trim() ||
      firstMinutes === null ||
      nextMinutes === null ||
      resolutionMinutes === null
    ) {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    try {
      await save.mutateAsync({
        id: policy?.id,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        firstResponseMinutes: firstMinutes,
        nextResponseMinutes: nextMinutes,
        resolutionMinutes,
        businessHoursId,
        isDefault,
      });
      toast.success(policy ? "SLA policy updated." : "SLA policy created.");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the SLA policy.",
      );
    }
  };

  return (
    <SettingsEditorForm
      draft={{
        name,
        description,
        first,
        next,
        resolution,
        businessHoursId,
        isDefault,
      }}
      canSave={isDirty}
      isNew={!policy}
      isSaving={save.isPending}
      noun="policy"
      onSave={() => void handleSave()}
      onCancel={onCancel}
    >
      <div ref={formRef} className="contents">
        <SettingsRow label="Name" htmlFor="sla-name">
          <Input
            id="sla-name"
            aria-invalid={submitted && !name.trim()}
            aria-describedby={
              submitted && !name.trim() ? "sla-name-error" : undefined
            }
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
          />
          {submitted && !name.trim() ? (
            <FieldError id="sla-name-error">Enter a name.</FieldError>
          ) : null}
        </SettingsRow>
        <SettingsRow label="Description" htmlFor="sla-desc">
          <Input
            id="sla-desc"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={140}
            placeholder="When does this policy apply?"
          />
        </SettingsRow>
        <SettingsRow
          label="First reply"
          description="Time from a donor’s first message to the first reply."
          htmlFor="sla-first"
        >
          <DurationField
            id="sla-first"
            label="First reply"
            value={first}
            onChange={setFirst}
            invalid={submitted && durationPartsToMinutes(first) === null}
          />
        </SettingsRow>
        <SettingsRow
          label="Next reply"
          description="Time to answer each later message from the donor."
          htmlFor="sla-next"
        >
          <DurationField
            id="sla-next"
            label="Next reply"
            value={next}
            onChange={setNext}
            invalid={submitted && durationPartsToMinutes(next) === null}
          />
        </SettingsRow>
        <SettingsRow
          label="Resolution"
          description="Time from a donor’s first message to resolving the conversation."
          htmlFor="sla-resolution"
        >
          <DurationField
            id="sla-resolution"
            label="Resolution"
            value={resolution}
            onChange={setResolution}
            invalid={submitted && durationPartsToMinutes(resolution) === null}
          />
        </SettingsRow>
        <SettingsRow
          control
          label="Business hours"
          description="Stored with the policy for when SLA timers run."
        >
          <SearchableSelect
            items={[
              { value: "none", label: "24/7 coverage" },
              ...businessHours.data.map((row) => ({
                value: row.id,
                label: row.name,
              })),
            ]}
            value={businessHoursId ?? "none"}
            onValueChange={(value) => {
              if (value === null) return;
              setBusinessHoursId(value === "none" ? null : value);
            }}
            aria-label="Business hours"
            className="h-9 max-w-sm"
          />
        </SettingsRow>
        <SettingsRow
          control
          label="Workspace default"
          description="Stores the workspace default marker; it does not attach this policy to conversations yet."
        >
          <div className="flex items-center gap-2">
            <Switch
              checked={isDefault}
              onCheckedChange={setIsDefault}
              aria-label="Default SLA policy"
            />
            <span className="text-xs text-muted-foreground">
              {isDefault ? "Workspace default" : "Not default"}
            </span>
          </div>
        </SettingsRow>
      </div>
    </SettingsEditorForm>
  );
}
