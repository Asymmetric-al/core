import { SupportInboxSkeleton } from "@/features/support-hub/components/SupportInboxSkeleton";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";
export default function Loading() {
  return (
    <SupportWorkspaceShell
      section="inbox"
      title="Support Hub"
      description="Answer donor, applicant and missionary email together in shared inboxes."
    >
      <SupportInboxSkeleton />
    </SupportWorkspaceShell>
  );
}
