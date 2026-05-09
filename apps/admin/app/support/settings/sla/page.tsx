"use client";

import { SlaPolicyList } from "@/features/support-hub/components/settings/sla/SlaPolicyList";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsSlaPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="SLA policies"
      description="Response and resolution targets for donor care conversations."
    >
      <SlaPolicyList />
    </SupportWorkspaceShell>
  );
}
