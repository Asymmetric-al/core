"use client";

import { LabelsSettingsPanel } from "@/features/support-hub/components/settings/labels/LabelsSettingsPanel";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsLabelsPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Labels"
      description="Maintain the donor care label library used across the inbox."
    >
      <LabelsSettingsPanel />
    </SupportWorkspaceShell>
  );
}
