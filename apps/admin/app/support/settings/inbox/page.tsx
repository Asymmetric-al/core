"use client";

import { InboxSettingsForm } from "@/features/support-hub/components/settings/inbox/InboxSettingsForm";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsInboxPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Inbox identity"
      description="Defaults applied to every donor conversation routed through this inbox."
    >
      <InboxSettingsForm />
    </SupportWorkspaceShell>
  );
}
