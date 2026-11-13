import type { Metadata } from "next";

import { AutomationRuleList } from "@/features/support-hub/components/settings/automations/AutomationRuleList";

export const metadata: Metadata = {
  title: "Inbox rules · Support settings",
};

export default function SupportSettingsAutomationsPage() {
  return (
    <>
      <AutomationRuleList />
    </>
  );
}
