"use client";

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

  const [agentId, setAgentId] = React.useState<string | null>(
    currentAgentId ?? agents[0]?.id ?? null,
  );

  const existing = agentId ? preferences.for(agentId) : null;

  const [draft, setDraft] =
    React.useState<SupportNotificationPreferences | null>(existing ?? null);

  React.useEffect(() => {
    setDraft(existing ?? null);
  }, [existing]);

  React.useEffect(() => {
    if (agentId === null && agents[0]?.id) {
      setAgentId(agents[0].id);
    }
  }, [agentId, agents]);

  if (!agentId) {
    return (
      <SettingsPanel
        title="Notification preferences"
        description="Pick an agent to manage their notification channels."
      >
        <p className="text-[12px] text-zinc-500">No agents yet.</p>
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
        label="Agent"
        description="Notification preferences are stored per agent."
      >
        <Select value={agentId} onValueChange={(value) => setAgentId(value)}>
          <SelectTrigger className="h-9 max-w-sm text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>

      <div className="rounded-xl border border-zinc-100">
        <div className="border-b border-zinc-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          Email
        </div>
        <div className="flex flex-col divide-y divide-zinc-100">
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

      <div className="rounded-xl border border-zinc-100">
        <div className="border-b border-zinc-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          In-app
        </div>
        <div className="flex flex-col divide-y divide-zinc-100">
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
        <span className="text-[12px] font-semibold text-zinc-900">{label}</span>
        <span className="text-[11px] text-zinc-500">{description}</span>
      </div>
      <Switch checked={value} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
