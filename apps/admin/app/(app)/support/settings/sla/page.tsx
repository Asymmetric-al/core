import type { Metadata } from "next";

import { SlaPolicyList } from "@/features/support-hub/components/settings/sla/SlaPolicyList";

export const metadata: Metadata = {
  title: "SLA policies · Support settings",
};

export default function SupportSettingsSlaPage() {
  return (
    <>
      <SlaPolicyList />
    </>
  );
}
