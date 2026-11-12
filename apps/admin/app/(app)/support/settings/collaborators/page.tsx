import type { Metadata } from "next";

import { AgentsList } from "@/features/support-hub/components/settings/collaborators/AgentsList";
import { TeamList } from "@/features/support-hub/components/settings/collaborators/TeamList";

export const metadata: Metadata = {
  title: "Collaborators · Support settings",
};

export default function SupportSettingsCollaboratorsPage() {
  return (
    <>
      <div className="flex flex-col gap-4">
        <AgentsList />
        <TeamList />
      </div>
    </>
  );
}
