import type { Metadata } from "next";

import { InboxSettingsForm } from "@/features/support-hub/components/settings/inbox/InboxSettingsForm";

export const metadata: Metadata = {
  title: "Inbox identity · Support settings",
};

export default function SupportSettingsInboxPage() {
  return (
    <>
      <InboxSettingsForm />
    </>
  );
}
