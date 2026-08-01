"use client";

import { AutomationRuleList } from "@/features/support-hub/components/settings/automations/AutomationRuleList";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsAutomationsPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Automations"
      description="Typed event → condition → action rules. Dry-run every rule before saving."
    >
      <AutomationRuleList />
    </SupportWorkspaceShell>
  );
}
