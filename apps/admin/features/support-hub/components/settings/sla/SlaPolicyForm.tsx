"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import * as React from "react";
import { toast } from "sonner";

import { useSupportBusinessHours } from "../../../hooks/use-support-inbox-settings";
import { useSaveSupportSlaPolicy } from "../../../hooks/use-support-mutations";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";

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
  const businessHours = useSupportBusinessHours();

  const [name, setName] = React.useState(policy?.name ?? "");
  const [description, setDescription] = React.useState(
    policy?.description ?? "",
  );
  const [first, setFirst] = React.useState(policy?.firstResponseMinutes ?? 480);
  const [next, setNext] = React.useState(policy?.nextResponseMinutes ?? 720);
  const [resolution, setResolution] = React.useState(
    policy?.resolutionMinutes ?? 5 * 24 * 60,
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
      first !== policy.firstResponseMinutes ||
      next !== policy.nextResponseMinutes ||
      resolution !== policy.resolutionMinutes ||
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
    if (!name.trim()) {
      toast.info("Give the policy a name first.");
      return;
    }
    try {
      await save.mutateAsync({
        id: policy?.id,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        firstResponseMinutes: first,
        nextResponseMinutes: next,
        resolutionMinutes: resolution,
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
    <SettingsPanel
      title={policy ? `Edit "${policy.name}"` : "New SLA policy"}
      description="How quickly donor conversations must be answered and resolved."
    >
      <SettingsRow label="Name" htmlFor="sla-name">
        <Input
          id="sla-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
        />
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
        label="First response (min)"
        description="Target minutes from inbound email to first agent reply."
        htmlFor="sla-first"
      >
        <Input
          id="sla-first"
          type="number"
          min={1}
          value={first}
          onChange={(event) => setFirst(Number(event.target.value))}
          className="max-w-[140px] font-mono text-[12px]"
        />
      </SettingsRow>
      <SettingsRow
        label="Next response (min)"
        description="Target minutes between subsequent replies."
        htmlFor="sla-next"
      >
        <Input
          id="sla-next"
          type="number"
          min={1}
          value={next}
          onChange={(event) => setNext(Number(event.target.value))}
          className="max-w-[140px] font-mono text-[12px]"
        />
      </SettingsRow>
      <SettingsRow
        label="Resolution (min)"
        description="Target minutes from inbound to resolution."
        htmlFor="sla-resolution"
      >
        <Input
          id="sla-resolution"
          type="number"
          min={1}
          value={resolution}
          onChange={(event) => setResolution(Number(event.target.value))}
          className="max-w-[140px] font-mono text-[12px]"
        />
      </SettingsRow>
      <SettingsRow
        label="Business hours"
        description="SLA timers pause outside of these hours when set."
      >
        <Select
          value={businessHoursId ?? "none"}
          onValueChange={(value) =>
            setBusinessHoursId(value === "none" ? null : value)
          }
        >
          <SelectTrigger className="h-9 max-w-sm text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">24/7 coverage</SelectItem>
            {(businessHours.data ?? []).map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>
      <SettingsRow
        label="Default"
        description="Applied to new conversations when no other rule matches."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={isDefault}
            onCheckedChange={setIsDefault}
            aria-label="Default SLA policy"
          />
          <span className="text-[12px] text-zinc-500">
            {isDefault ? "Default" : "Not default"}
          </span>
        </div>
      </SettingsRow>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 rounded-lg px-3 text-xs"
        >
          Cancel
        </Button>
      </div>

      <SettingsToolbar
        isDirty={isDirty}
        isSaving={save.isPending}
        onSave={handleSave}
        onCancel={onCancel}
      />
    </SettingsPanel>
  );
}
