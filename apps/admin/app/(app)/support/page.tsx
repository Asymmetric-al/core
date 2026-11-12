import { SupportInbox } from "@/features/support-hub/components/SupportInbox";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportPage() {
  return (
    <SupportWorkspaceShell
      section="inbox"
      title="Support Hub"
      description="Answer donor, applicant and missionary email together in shared inboxes."
    >
      <SupportInbox />
    </SupportWorkspaceShell>
  );
}

export const metadata = { title: "Support inbox" };
