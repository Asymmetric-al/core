"use client";

import {
  useSupportBusinessHoursLive,
  useSupportSlaPoliciesLive,
} from "@asym/database/hooks";
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

import {
  useSupportInboxes,
  useSupportInboxSettings,
} from "../../../hooks/use-support-inbox-settings";
import { useSaveSupportInboxSettings } from "../../../hooks/use-support-mutations";
import { useSupportSignatures } from "../../../hooks/use-support-signatures";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";

import type { SupportInboxSettings } from "../../../types";

export function InboxSettingsForm() {
  const { data: inboxes } = useSupportInboxes();
  const { data: activeSettings } = useSupportInboxSettings();
  const { data: signatures } = useSupportSignatures();
  const slaPolicies = useSupportSlaPoliciesLive();
  const businessHours = useSupportBusinessHoursLive();
  const saveSettings = useSaveSupportInboxSettings();

  const [draft, setDraft] = React.useState<SupportInboxSettings | null>(
    activeSettings ?? null,
  );

  React.useEffect(() => {
    setDraft(activeSettings ?? null);
  }, [activeSettings]);

  if (!activeSettings) {
    return (
      <SettingsPanel
        title="Inbox identity"
        description="No default inbox configured yet."
      >
        <p className="text-[12px] text-zinc-500">
          Configure an inbox in the Mission Control integrations area first.
        </p>
      </SettingsPanel>
    );
  }

  if (!draft) return null;

  const isDirty = JSON.stringify(draft) !== JSON.stringify(activeSettings);
  const inboxName =
    inboxes.find((row) => row.id === draft.inboxId)?.name ?? "Donor Care";

  const handleSave = async () => {
    if (!isDirty) return;
    try {
      await saveSettings.mutateAsync({
        id: draft.id,
        inboxId: draft.inboxId,
        defaultSignatureId: draft.defaultSignatureId,
        defaultSlaPolicyId: draft.defaultSlaPolicyId,
        defaultBusinessHoursId: draft.defaultBusinessHoursId,
        roundRobinEnabled: draft.roundRobinEnabled,
        autoResolveAfterDays: draft.autoResolveAfterDays,
        showContactSidecar: draft.showContactSidecar,
      });
      toast.success("Inbox settings saved.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the inbox settings.",
      );
    }
  };

  return (
    <SettingsPanel
      title={`Inbox identity — ${inboxName}`}
      description="Default sender, signature, SLA, and off-hours behavior for this inbox."
    >
      <SettingsRow
        label="Default signature"
        description="Applied when an agent has no personal signature yet."
      >
        <Select
          value={draft.defaultSignatureId ?? "none"}
          onValueChange={(value) =>
            setDraft({
              ...draft,
              defaultSignatureId: value === "none" ? null : value,
            })
          }
        >
          <SelectTrigger className="h-9 max-w-sm text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No default signature</SelectItem>
            {signatures.map((sig) => (
              <SelectItem key={sig.id} value={sig.id}>
                {sig.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>
      <SettingsRow
        label="Default SLA policy"
        description="Timer applied to new conversations routed to this inbox."
      >
        <Select
          value={draft.defaultSlaPolicyId ?? "none"}
          onValueChange={(value) =>
            setDraft({
              ...draft,
              defaultSlaPolicyId: value === "none" ? null : value,
            })
          }
        >
          <SelectTrigger className="h-9 max-w-sm text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No SLA policy</SelectItem>
            {(slaPolicies.data ?? []).map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>
      <SettingsRow
        label="Business hours"
        description="Used by the reports business-hours filter + off-hours routing rules."
      >
        <Select
          value={draft.defaultBusinessHoursId ?? "none"}
          onValueChange={(value) =>
            setDraft({
              ...draft,
              defaultBusinessHoursId: value === "none" ? null : value,
            })
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
        label="Round-robin assignment"
        description="Automatically distribute new inbound conversations across available agents."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.roundRobinEnabled}
            onCheckedChange={(value) =>
              setDraft({ ...draft, roundRobinEnabled: value })
            }
            aria-label="Round-robin assignment"
          />
          <span className="text-[12px] text-zinc-500">
            {draft.roundRobinEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </SettingsRow>
      <SettingsRow
        label="Auto-resolve"
        description="Resolve conversations that are pending with no reply for this many days."
      >
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={365}
            value={draft.autoResolveAfterDays ?? ""}
            onChange={(event) =>
              setDraft({
                ...draft,
                autoResolveAfterDays: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }
            className="h-9 w-[120px] font-mono text-[12px]"
          />
          <span className="text-[12px] text-zinc-500">days</span>
        </div>
      </SettingsRow>
      <SettingsRow
        label="Contact sidecar"
        description="Show the donor CRM panel alongside the conversation detail."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.showContactSidecar}
            onCheckedChange={(value) =>
              setDraft({ ...draft, showContactSidecar: value })
            }
            aria-label="Contact sidecar"
          />
          <span className="text-[12px] text-zinc-500">
            {draft.showContactSidecar ? "Visible" : "Hidden"}
          </span>
        </div>
      </SettingsRow>

      <SettingsToolbar
        isDirty={isDirty}
        isSaving={saveSettings.isPending}
        onSave={handleSave}
        onCancel={() => setDraft(activeSettings)}
      />
    </SettingsPanel>
  );
}
