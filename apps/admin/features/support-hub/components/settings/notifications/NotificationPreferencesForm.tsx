"use client";

import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import * as React from "react";
import { toast } from "sonner";

import { useSupportAgents } from "../../../hooks/use-support-agents";
import { useSaveSupportNotificationPreferences } from "../../../hooks/use-support-mutations";
import { useSupportNotificationPreferences } from "../../../hooks/use-support-notification-preferences";
import { useCurrentSupportAgentId } from "../../../lib/current-agent";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";

import type { SupportNotificationPreferences } from "../../../types";

export function NotificationPreferencesForm() {
  const { data: agents } = useSupportAgents();
  const currentAgentId = useCurrentSupportAgentId();
  const preferences = useSupportNotificationPreferences();
  const save = useSaveSupportNotificationPreferences();

  const defaultAgentId = currentAgentId ?? agents[0]?.id ?? null;
  const [agentId, setAgentId] = React.useState<string | null>(defaultAgentId);
  if (agentId === null && defaultAgentId !== null) {
    setAgentId(defaultAgentId);
  }

  const existing = agentId ? preferences.for(agentId) : null;

  const [draft, setDraft] =
    React.useState<SupportNotificationPreferences | null>(existing ?? null);
  const preferencesVersion = JSON.stringify([agentId, existing]);
  const [draftVersion, setDraftVersion] = React.useState(preferencesVersion);

  // Scope drafts to the selected agent even when neither agent has saved
  // preferences, and retain edits across equivalent cache snapshots.
  if (draftVersion !== preferencesVersion) {
    setDraftVersion(preferencesVersion);
    setDraft(existing ?? null);
  }

  if (!agentId) {
    return (
      <SettingsPanel
        title="Notification preferences"
        description="Pick an agent to manage their notification channels."
      >
        <p className="text-xs text-muted-foreground">No agents yet.</p>
      </SettingsPanel>
    );
  }

  const current: SupportNotificationPreferences = draft ?? {
    id: `draft-${agentId}`,
    tenantId: "",
    agentId,
    emailMentions: true,
    emailAssignments: true,
    emailDailyDigest: false,
    inAppMentions: true,
    inAppAssignments: true,
    inAppSlaWarnings: true,
    createdAt: "",
    updatedAt: "",
  };

  const isDirty = !existing
    ? true
    : existing.emailMentions !== current.emailMentions ||
      existing.emailAssignments !== current.emailAssignments ||
      existing.emailDailyDigest !== current.emailDailyDigest ||
      existing.inAppMentions !== current.inAppMentions ||
      existing.inAppAssignments !== current.inAppAssignments ||
      existing.inAppSlaWarnings !== current.inAppSlaWarnings;

  const handleSave = async () => {
    try {
      await save.mutateAsync({
        agentId: current.agentId,
        emailMentions: current.emailMentions,
        emailAssignments: current.emailAssignments,
        emailDailyDigest: current.emailDailyDigest,
        inAppMentions: current.inAppMentions,
        inAppAssignments: current.inAppAssignments,
        inAppSlaWarnings: current.inAppSlaWarnings,
      });
      toast.success("Notification preferences saved.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save notification preferences.",
      );
    }
  };

  const toggle =
    (key: keyof SupportNotificationPreferences) => (value: boolean) => {
      setDraft({ ...current, [key]: value });
    };

  return (
    <SettingsPanel
      title="Notification preferences"
      description="Email + in-app channels for donor care alerts. Applied at the agent level."
    >
      <SettingsRow
        control
        label="Agent"
        description="Notification preferences are stored per agent."
      >
        <SearchableSelect
          items={[
            ...agents.map((agent) => ({ value: agent.id, label: agent.name })),
          ]}
          value={agentId}
          onValueChange={(value) => {
            if (value !== null) setAgentId(value);
          }}
          aria-label="Agent"
          className="h-9 max-w-sm"
        />
      </SettingsRow>

      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-3 py-2 text-sm font-medium text-muted-foreground">
          Email
        </div>
        <div className="flex flex-col divide-y divide-border">
          <PrefRow
            label="Mentions"
            description="Email me when a teammate @-mentions me in a private note."
            value={current.emailMentions}
            onChange={toggle("emailMentions")}
          />
          <PrefRow
            label="Assignments"
            description="Email me when a conversation is assigned to me."
            value={current.emailAssignments}
            onChange={toggle("emailAssignments")}
          />
          <PrefRow
            label="Daily digest"
            description="Summary of donor conversations each morning."
            value={current.emailDailyDigest}
            onChange={toggle("emailDailyDigest")}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-3 py-2 text-sm font-medium text-muted-foreground">
          In-app
        </div>
        <div className="flex flex-col divide-y divide-border">
          <PrefRow
            label="Mentions"
            description="Show a bell indicator when I am mentioned."
            value={current.inAppMentions}
            onChange={toggle("inAppMentions")}
          />
          <PrefRow
            label="Assignments"
            description="Show a bell indicator when a conversation is assigned to me."
            value={current.inAppAssignments}
            onChange={toggle("inAppAssignments")}
          />
          <PrefRow
            label="SLA warnings"
            description="Alert me when one of my conversations is at risk of breaching SLA."
            value={current.inAppSlaWarnings}
            onChange={toggle("inAppSlaWarnings")}
          />
        </div>
      </div>

      <SettingsToolbar
        isDirty={isDirty}
        isSaving={save.isPending}
        onSave={handleSave}
        onCancel={() => setDraft(existing ?? null)}
      />
    </SettingsPanel>
  );
}

function PrefRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <Switch checked={value} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
