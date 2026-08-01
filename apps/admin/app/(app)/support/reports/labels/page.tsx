"use client";

import { LabelsReport } from "@/features/support-hub/components/reports";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportReportsLabelsPage() {
  return (
    <SupportWorkspaceShell
      section="reports"
      title="Labels"
      description="Which donor care labels drive the most activity."
    >
      <LabelsReport />
    </SupportWorkspaceShell>
  );
}
