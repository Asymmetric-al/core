import type { Metadata } from "next";

import { BusinessHoursList } from "@/features/support-hub/components/settings/business-hours/BusinessHoursList";

export const metadata: Metadata = {
  title: "Business hours · Support settings",
};

export default function SupportSettingsBusinessHoursPage() {
  return (
    <>
      <BusinessHoursList />
    </>
  );
}
