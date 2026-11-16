"use client";

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
import { SettingsListState } from "../SettingsListState";
import { SettingsNotAppliedNote } from "../SettingsNotAppliedNote";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";

import type { SupportInboxSettings } from "../../../types";

export function InboxSettingsForm() {
  const { data: inboxes } = useSupportInboxes();
  const inboxSettings = useSupportInboxSettings();
  const activeSettings = inboxSettings.data;
  const signatures = useSupportSignatures();
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
    // Settings load as an empty list first, so "no inbox" waits for a
    // successful load.
    return (
      <SettingsPanel title="Inbox defaults">
        <SettingsListState
          noun="inbox settings"
          isLoading={inboxSettings.isLoading}
          isError={inboxSettings.isError}
          itemCount={0}
          onRetry={inboxSettings.refetch}
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm text-foreground">
              No support inbox exists for your organization yet.
            </p>
            <p className="text-xs text-muted-foreground">
              These settings appear once a support inbox has been set up.
              Inboxes can’t be created here yet, so ask a support admin to set
              one up.
            </p>
          </div>
        </SettingsListState>
      </SettingsPanel>
    );
  }

  if (!draft) return null;

  const isDirty = JSON.stringify(draft) !== JSON.stringify(activeSettings);
  const inboxName = inboxes.find((row) => row.id === draft.inboxId)?.name;

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
    <div className="flex flex-col gap-4">
      <SettingsNotAppliedNote>
        The default signature, SLA policy and business hours are saved for this
        inbox, but replies, SLA timers and reports don’t use them yet.
      </SettingsNotAppliedNote>
      <SettingsPanel
        title={inboxName ? `${inboxName} inbox` : "Inbox defaults"}
      >
        <InboxDefaultSelection
          label="Default signature"
          description="The signature this inbox’s replies would use."
          emptyLabel="No default signature"
          options={signatures.data}
          noun="signatures"
          loadState={signatures}
          value={draft.defaultSignatureId}
          onChange={(defaultSignatureId) =>
            setDraft({ ...draft, defaultSignatureId })
          }
        />
        <InboxDefaultSelection
          label="Default SLA policy"
          description="The response targets new conversations in this inbox would get."
          emptyLabel="No SLA policy"
          options={slaPolicies.data}
          noun="SLA policies"
          loadState={slaPolicies}
          value={draft.defaultSlaPolicyId}
          onChange={(defaultSlaPolicyId) =>
            setDraft({ ...draft, defaultSlaPolicyId })
          }
        />
        <InboxDefaultSelection
          label="Business hours"
          description="The working hours this inbox would follow."
          emptyLabel="No default schedule"
          options={businessHours.data}
          noun="business hours"
          loadState={businessHours}
          value={draft.defaultBusinessHoursId}
          onChange={(defaultBusinessHoursId) =>
            setDraft({ ...draft, defaultBusinessHoursId })
          }
        />
        <SettingsRow
          control
          label="Donor panel"
          description="Show the donor's CRM record beside each conversation."
        >
          <div className="flex items-center gap-2">
            <Switch
              checked={draft.showContactSidecar}
              onCheckedChange={(value) =>
                setDraft({ ...draft, showContactSidecar: value })
              }
              aria-label="Donor panel"
            />
            <span className="text-xs text-muted-foreground">
              {draft.showContactSidecar ? "Shown" : "Hidden"}
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
    </div>
  );
}

function InboxDefaultSelection({
  label,
  description,
  emptyLabel,
  options,
  noun,
  loadState,
  value,
  onChange,
}: {
  label: string;
  description: string;
  emptyLabel: string;
  options: ReadonlyArray<{ id: string; name: string }>;
  noun: string;
  loadState: { isLoading: boolean; isError: boolean; refetch: () => unknown };
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <SettingsRow control label={label} description={description}>
      <SettingsListState
        noun={noun}
        isLoading={loadState.isLoading}
        isError={loadState.isError}
        itemCount={loadState.isError ? 0 : options.length}
        onRetry={loadState.refetch}
      >
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
      </SettingsListState>
    </SettingsRow>
  );
}
