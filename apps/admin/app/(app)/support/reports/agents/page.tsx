import { AgentsReport } from "@/features/support-hub/components/reports";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportReportsAgentsPage() {
  return (
    <SupportWorkspaceShell
      section="reports"
      title="Agents"
      description="How many conversations created in the selected range are assigned to each agent."
    >
      <AgentsReport />
    </SupportWorkspaceShell>
  );
}

export const metadata = { title: "Agent workload · Support reports" };
