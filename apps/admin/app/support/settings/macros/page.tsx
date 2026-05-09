"use client";

import { MacroList } from "@/features/support-hub/components/settings/macros/MacroList";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsMacrosPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Macros"
      description="One-click action sequences for donor care work."
    >
      <MacroList />
    </SupportWorkspaceShell>
  );
}
