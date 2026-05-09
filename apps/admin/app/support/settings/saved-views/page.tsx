"use client";

import { SavedViewsList } from "@/features/support-hub/components/settings/saved-views/SavedViewsList";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsSavedViewsPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Saved views"
      description="Named filter presets team members can deep-link to."
    >
      <SavedViewsList />
    </SupportWorkspaceShell>
  );
}
