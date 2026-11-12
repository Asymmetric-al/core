import { LabelsReport } from "@/features/support-hub/components/reports";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportReportsLabelsPage() {
  return (
    <SupportWorkspaceShell
      section="reports"
      title="Labels"
      description="How many conversations created in the selected range carry each label."
    >
      <LabelsReport />
    </SupportWorkspaceShell>
  );
}

export const metadata = { title: "Labels · Support reports" };
