"use client";

import { NotificationPreferencesForm } from "@/features/support-hub/components/settings/notifications/NotificationPreferencesForm";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsNotificationsPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Notifications"
      description="Pick how you are alerted when donor care conversations need attention."
    >
      <NotificationPreferencesForm />
    </SupportWorkspaceShell>
  );
}
