"use client";

import { AssignmentRulesForm } from "@/features/support-hub/components/settings/assignment/AssignmentRulesForm";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsAssignmentPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Assignment rules"
      description="How new donor conversations are routed across the team."
    >
      <AssignmentRulesForm />
    </SupportWorkspaceShell>
  );
}
