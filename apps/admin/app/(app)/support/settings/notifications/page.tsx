import type { Metadata } from "next";

import { NotificationPreferencesForm } from "@/features/support-hub/components/settings/notifications/NotificationPreferencesForm";

export const metadata: Metadata = {
  title: "Notifications · Support settings",
};

export default function SupportSettingsNotificationsPage() {
  return (
    <>
      <NotificationPreferencesForm />
    </>
  );
}
