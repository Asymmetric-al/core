"use client";

import { OverviewReport } from "@/features/support-hub/components/reports";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportReportsOverviewPage() {
  return (
    <SupportWorkspaceShell
      section="reports"
      title="Reports overview"
      description="High-level signal on donor care volume, response time, and resolution."
    >
      <OverviewReport />
    </SupportWorkspaceShell>
  );
}
