"use client";

import { Input } from "@asym/ui/components/shadcn/input";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import * as React from "react";
import { toast } from "sonner";

import {
  useSupportBusinessHours,
  useSupportInboxes,
  useSupportInboxSettings,
  useSupportSlaPolicies,
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
  const slaPolicies = useSupportSlaPolicies();
  const businessHours = useSupportBusinessHours();
  const saveSettings = useSaveSupportInboxSettings();

  const [draft, setDraft] = React.useState<SupportInboxSettings | null>(
    activeSettings ?? null,
  );
  const settingsVersion = JSON.stringify(activeSettings ?? null);
  const [draftVersion, setDraftVersion] = React.useState(settingsVersion);

  // Reset before committing a changed record, while keeping edits across
  // equivalent cache snapshots.
  if (draftVersion !== settingsVersion) {
    setDraftVersion(settingsVersion);
    setDraft(activeSettings ?? null);
  }

  if (!activeSettings) {
    return (
      <SettingsPanel
        title="Inbox identity"
        description="No default inbox configured yet."
      >
        <p className="text-xs text-muted-foreground">
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
      <InboxDefaultSelection
        label="Default signature"
        description="Applied when an agent has no personal signature yet."
        emptyLabel="No default signature"
        options={signatures}
        value={draft.defaultSignatureId}
        onChange={(defaultSignatureId) =>
          setDraft({ ...draft, defaultSignatureId })
        }
      />
      <InboxDefaultSelection
        label="Default SLA policy"
        description="Timer applied to new conversations routed to this inbox."
        emptyLabel="No SLA policy"
        options={slaPolicies.data ?? []}
        value={draft.defaultSlaPolicyId}
        onChange={(defaultSlaPolicyId) =>
          setDraft({ ...draft, defaultSlaPolicyId })
        }
      />
      <InboxDefaultSelection
        label="Business hours"
        description="Used by the reports business-hours filter + off-hours routing rules."
        emptyLabel="24/7 coverage"
        options={businessHours.data ?? []}
        value={draft.defaultBusinessHoursId}
        onChange={(defaultBusinessHoursId) =>
          setDraft({ ...draft, defaultBusinessHoursId })
        }
      />
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
          <span className="text-xs text-muted-foreground">
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
            className="w-30 font-mono"
          />
          <span className="text-xs text-muted-foreground">days</span>
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
          <span className="text-xs text-muted-foreground">
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

function InboxDefaultSelection({
  label,
  description,
  emptyLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  description: string;
  emptyLabel: string;
  options: ReadonlyArray<{ id: string; name: string }>;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <SettingsRow control label={label} description={description}>
      <SearchableSelect
        items={[
          { value: "none", label: emptyLabel },
          ...options.map((row) => ({ value: row.id, label: row.name })),
        ]}
        value={value ?? "none"}
        onValueChange={(nextValue) => {
          if (nextValue === null) return;
          onChange(nextValue === "none" ? null : nextValue);
        }}
        aria-label={label}
        className="h-9 max-w-sm"
      />
    </SettingsRow>
  );
}
