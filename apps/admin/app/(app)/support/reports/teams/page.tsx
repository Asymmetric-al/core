import { TeamsReport } from "@/features/support-hub/components/reports";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportReportsTeamsPage() {
  return (
    <SupportWorkspaceShell
      section="reports"
      title="Teams"
      description="How many conversations created in the selected range are assigned to each team."
    >
      <TeamsReport />
    </SupportWorkspaceShell>
  );
}

export const metadata = { title: "Teams · Support reports" };
