"use client";

import { SupportInbox } from "@/features/support-hub/components/SupportInbox";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportPage() {
  return (
    <SupportWorkspaceShell
      section="inbox"
      title="Support Hub"
      description="Route donor-care conversations through the persistent Mission Control inbox."
    >
      <SupportInbox />
    </SupportWorkspaceShell>
  );
}
