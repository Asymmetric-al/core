"use client";

import { CannedResponseList } from "@/features/support-hub/components/settings/canned-responses/CannedResponseList";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsCannedResponsesPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Canned responses"
      description="Reusable reply templates inserted with / in the composer."
    >
      <CannedResponseList />
    </SupportWorkspaceShell>
  );
}
