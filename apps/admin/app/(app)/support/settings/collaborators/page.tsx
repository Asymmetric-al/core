"use client";

import { AgentsList } from "@/features/support-hub/components/settings/collaborators/AgentsList";
import { TeamList } from "@/features/support-hub/components/settings/collaborators/TeamList";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsCollaboratorsPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Collaborators"
      description="Support team membership and grouping."
    >
      <div className="flex flex-col gap-4">
        <AgentsList />
        <TeamList />
      </div>
    </SupportWorkspaceShell>
  );
}
