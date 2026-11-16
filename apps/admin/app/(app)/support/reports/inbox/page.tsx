import { InboxReport } from "@/features/support-hub/components/reports";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportReportsInboxPage() {
  return (
    <SupportWorkspaceShell
      section="reports"
      title="Messages"
      description="Donor emails received, replies sent and conversations resolved in the selected range."
    >
      <InboxReport />
    </SupportWorkspaceShell>
  );
}

export const metadata = { title: "Messages · Support reports" };
