"use client";

import { AgentsReport } from "@/features/support-hub/components/reports";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportReportsAgentsPage() {
  return (
    <SupportWorkspaceShell
      section="reports"
      title="Agents"
      description="Workload and throughput per donor care agent."
    >
      <AgentsReport />
    </SupportWorkspaceShell>
  );
}
