import type { Metadata } from "next";

import { LabelsSettingsPanel } from "@/features/support-hub/components/settings/labels/LabelsSettingsPanel";

export const metadata: Metadata = {
  title: "Labels · Support settings",
};

export default function SupportSettingsLabelsPage() {
  return (
    <>
      <LabelsSettingsPanel />
    </>
  );
}
