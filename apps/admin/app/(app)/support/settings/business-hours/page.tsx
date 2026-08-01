"use client";

import { BusinessHoursList } from "@/features/support-hub/components/settings/business-hours/BusinessHoursList";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsBusinessHoursPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Business hours"
      description="Weekly coverage + holidays for the donor care team."
    >
      <BusinessHoursList />
    </SupportWorkspaceShell>
  );
}
