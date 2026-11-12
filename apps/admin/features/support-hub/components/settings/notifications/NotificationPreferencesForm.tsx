"use client";

import { FieldLegend, FieldSet } from "@asym/ui/components/shadcn/field";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import * as React from "react";
import { toast } from "sonner";

import { useSupportAgents } from "../../../hooks/use-support-agents";
import { useSaveSupportNotificationPreferences } from "../../../hooks/use-support-mutations";
import { useSupportNotificationPreferences } from "../../../hooks/use-support-notification-preferences";
import { SUPPORT_AGENT_SETUP_MESSAGE } from "../../../lib/agent-setup";
import { useCurrentSupportAgentId } from "../../../lib/current-agent";
import { DEFAULT_IN_APP_PREFERENCES } from "../../../lib/in-app-alerts";
import { SettingsListState } from "../SettingsListState";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";

import type { SupportNotificationPreferences } from "../../../types";

// Only these two have a reader today (the inbox's For you note). The other
// stored choices (email mentions, assignments and digest; in-app mentions)
// have no sender, so the form never offers them and saves them unchanged.
const editablePreferenceKeys = [
  "inAppAssignments",
  "inAppSlaWarnings",
] as const;

type EditablePreferenceKey = (typeof editablePreferenceKeys)[number];

const PANEL_TITLE = "Notification preferences";
const PANEL_DESCRIPTION =
  "Choose what the For you note above the inbox’s conversations counts. Each agent has their own choices.";

/** An agent with no saved row reads these, the same as the For you note. */
function createNotificationDraft(
  agentId: string,
): SupportNotificationPreferences {
  return {
    id: `draft-${agentId}`,
    tenantId: "",
    agentId,
    emailMentions: true,
    emailAssignments: true,
    emailDailyDigest: false,
    ...DEFAULT_IN_APP_PREFERENCES,
    createdAt: "",
    updatedAt: "",
  };
}

function notificationPreferencesChanged(
  baseline: SupportNotificationPreferences,
  current: SupportNotificationPreferences,
) {
  return editablePreferenceKeys.some((key) => baseline[key] !== current[key]);
}

export function NotificationPreferencesForm() {
  const agentsQuery = useSupportAgents();
  const agents = agentsQuery.data;
  const currentAgentId = useCurrentSupportAgentId();
  const preferences = useSupportNotificationPreferences();
  const { access } = preferences;
  const save = useSaveSupportNotificationPreferences();

  // The server lets only support admins change other agents' preferences,
  // so everyone else edits their own and gets no picker.
  const defaultAgentId = access.canManageAll
    ? (currentAgentId ?? access.agentId ?? agents[0]?.id ?? null)
    : access.agentId;
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

  // Until saved preferences have loaded, defaults would read as the agent's
  // choices and a Save would overwrite the real ones.
  const preferencesUnknown =
    preferences.isLoading ||
    (preferences.isError && preferences.data.length === 0);
  const agentsUnknown =
    agents.length === 0 && (agentsQuery.isLoading || agentsQuery.isError);
  if (preferencesUnknown || agentsUnknown) {
    return (
      <>
        <SettingsPanel title={PANEL_TITLE} description={PANEL_DESCRIPTION}>
          <SettingsListState
            noun="notification preferences"
            isLoading={preferences.isLoading || agentsQuery.isLoading}
            isError={preferences.isError || agentsQuery.isError}
            itemCount={0}
            onRetry={() =>
              Promise.all([preferences.refetch(), agentsQuery.refetch()])
            }
          >
            {null}
          </SettingsListState>
        </SettingsPanel>
        <UnavailableAlerts />
      </>
    );
  }

  if (!agentId) {
    return (
      <>
        <SettingsPanel
          title={PANEL_TITLE}
          description={
            access.canManageAll
              ? "Pick an agent to manage their in-app alerts."
              : PANEL_DESCRIPTION
          }
        >
          <p className="text-xs text-muted-foreground">
            {access.canManageAll
              ? "No agents yet."
              : SUPPORT_AGENT_SETUP_MESSAGE}
          </p>
        </SettingsPanel>
        <UnavailableAlerts />
      </>
    );
  }

  const baseline = existing ?? createNotificationDraft(agentId);
  const current = draft ?? baseline;
  const isDirty = notificationPreferencesChanged(baseline, current);

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

  const toggle = (key: EditablePreferenceKey) => (value: boolean) => {
    setDraft({ ...current, [key]: value });
  };

  const isOwn = agentId === access.agentId;
  const agentName =
    agents.find((agent) => agent.id === agentId)?.name ?? "this agent";
  const assignee = isOwn ? "you" : agentName;
  const note = isOwn ? "your For you note" : `${agentName}’s For you note`;

  return (
    <>
      <SettingsPanel title={PANEL_TITLE} description={PANEL_DESCRIPTION}>
        {access.canManageAll ? (
          <SettingsRow
            control
            label="Agent"
            description="As a support admin, you can change any agent’s alerts."
          >
            <div className="w-full max-w-sm">
              <SearchableSelect
                items={agents.map((agent) => ({
                  value: agent.id,
                  label: agent.name,
                }))}
                value={agentId}
                onValueChange={(value) => {
                  if (value !== null) setAgentId(value);
                }}
                aria-label="Agent"
                className="w-full"
              />
            </div>
          </SettingsRow>
        ) : null}

        <FieldSet>
          <FieldLegend variant="label">In-app alerts</FieldLegend>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
            <PrefRow
              label="Assignments"
              description={`Unread conversations assigned to ${assignee}, counted in ${note}.`}
              value={current.inAppAssignments}
              onChange={toggle("inAppAssignments")}
            />
            <PrefRow
              label="SLA warnings"
              description={`Conversations assigned to ${assignee} that are overdue or due within the hour, counted in ${note}.`}
              value={current.inAppSlaWarnings}
              onChange={toggle("inAppSlaWarnings")}
            />
          </div>
        </FieldSet>

        <SettingsToolbar
          isDirty={isDirty}
          isSaving={save.isPending}
          savedLabel={existing ? "Saved" : "Using default preferences"}
          onSave={handleSave}
          onCancel={() => setDraft(existing ?? null)}
        />
      </SettingsPanel>
      <UnavailableAlerts />
    </>
  );
}

/**
 * A plain statement of the alerts Support Hub does not send yet. It holds no
 * controls: a switch for an alert nothing sends would change nothing.
 */
function UnavailableAlerts() {
  return (
    <SettingsPanel
      title="Not available yet"
      description="Support Hub does not send these alerts, so there is nothing to turn on or off."
    >
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
        <li>Email when a teammate mentions you in a private note</li>
        <li>Email when a conversation is assigned to you</li>
        <li>A daily digest email of donor conversations</li>
        <li>In-app alerts when a teammate mentions you</li>
      </ul>
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
    <div className="px-3 py-2">
      <SettingsRow
        control
        orientation="inline"
        label={label}
        description={description}
      >
        <Switch checked={value} onCheckedChange={onChange} aria-label={label} />
      </SettingsRow>
    </div>
  );
}
