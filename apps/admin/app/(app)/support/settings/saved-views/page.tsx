import type { Metadata } from "next";

import { SavedViewsList } from "@/features/support-hub/components/settings/saved-views/SavedViewsList";

export const metadata: Metadata = {
  title: "Saved views · Support settings",
};

export default function SupportSettingsSavedViewsPage() {
  return (
    <>
      <SavedViewsList />
    </>
  );
}
