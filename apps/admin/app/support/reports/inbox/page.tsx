"use client";

import { InboxReport } from "@/features/support-hub/components/reports";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportReportsInboxPage() {
  return (
    <SupportWorkspaceShell
      section="reports"
      title="Inbox"
      description="Message volume + resolution throughput for the donor care inbox."
    >
      <InboxReport />
    </SupportWorkspaceShell>
  );
}
