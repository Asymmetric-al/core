import type { Metadata } from "next";

import { CannedResponseList } from "@/features/support-hub/components/settings/canned-responses/CannedResponseList";

export const metadata: Metadata = {
  title: "Canned responses · Support settings",
};

export default function SupportSettingsCannedResponsesPage() {
  return (
    <>
      <CannedResponseList />
    </>
  );
}
