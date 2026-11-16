import { OverviewReport } from "@/features/support-hub/components/reports";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportReportsOverviewPage() {
  return (
    <SupportWorkspaceShell
      section="reports"
      title="Reports overview"
      description="Volume, response time and resolution in the selected range, alongside conversations waiting now."
    >
      <OverviewReport />
    </SupportWorkspaceShell>
  );
}

export const metadata = { title: "Overview · Support reports" };
