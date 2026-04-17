"use client";

import { TeamsReport } from "@/features/support-hub/components/reports";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportReportsTeamsPage() {
  return (
    <SupportWorkspaceShell
      section="reports"
      title="Teams"
      description="Conversation volume across donor care teams."
    >
      <TeamsReport />
    </SupportWorkspaceShell>
  );
}
