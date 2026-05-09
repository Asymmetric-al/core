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
import { useSupportInboxSettings } from "../../../hooks/use-support-inbox-settings";
import { useSaveSupportInboxSettings } from "../../../hooks/use-support-mutations";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";

export function AssignmentRulesForm() {
  const { data: activeSettings } = useSupportInboxSettings();
  const { data: agents } = useSupportAgents();
  const saveSettings = useSaveSupportInboxSettings();

  const [roundRobin, setRoundRobin] = React.useState(
    activeSettings?.roundRobinEnabled ?? false,
  );
  const [fallbackAgent, setFallbackAgent] = React.useState<string>("");

  React.useEffect(() => {
    setRoundRobin(activeSettings?.roundRobinEnabled ?? false);
  }, [activeSettings?.roundRobinEnabled]);

  if (!activeSettings) {
    return (
      <SettingsPanel
        title="Auto assignment"
        description="No inbox settings available yet."
      >
        <p className="text-[12px] text-zinc-500">
          Configure the inbox first, then come back here to set assignment
          rules.
        </p>
      </SettingsPanel>
    );
  }

  const isDirty = roundRobin !== activeSettings.roundRobinEnabled;

  const handleSave = async () => {
    try {
      await saveSettings.mutateAsync({
        id: activeSettings.id,
        inboxId: activeSettings.inboxId,
        defaultSignatureId: activeSettings.defaultSignatureId,
        defaultSlaPolicyId: activeSettings.defaultSlaPolicyId,
        defaultBusinessHoursId: activeSettings.defaultBusinessHoursId,
        roundRobinEnabled: roundRobin,
        autoResolveAfterDays: activeSettings.autoResolveAfterDays,
        showContactSidecar: activeSettings.showContactSidecar,
      });
      toast.success("Assignment rules saved.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the assignment rules.",
      );
    }
  };

  return (
    <SettingsPanel
      title="Auto assignment"
      description="How the inbox distributes new donor conversations across the team."
    >
      <SettingsRow
        label="Round-robin"
        description="Assign new inbound conversations to the least-loaded agent."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={roundRobin}
            onCheckedChange={setRoundRobin}
            aria-label="Round-robin"
          />
          <span className="text-[12px] text-zinc-500">
            {roundRobin ? "Enabled" : "Disabled"}
          </span>
        </div>
      </SettingsRow>
      <SettingsRow
        label="Fallback agent"
        description="Pick an agent to receive a conversation if round-robin can't find anyone. (Applied by the Phase 7 server-side evaluator.)"
      >
        <Select value={fallbackAgent} onValueChange={setFallbackAgent} disabled>
          <SelectTrigger className="h-9 max-w-sm text-[12px]">
            <SelectValue placeholder="Configured in a later phase" />
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
      <SettingsToolbar
        isDirty={isDirty}
        isSaving={saveSettings.isPending}
        onSave={handleSave}
        onCancel={() => setRoundRobin(activeSettings.roundRobinEnabled)}
      />
    </SettingsPanel>
  );
}
