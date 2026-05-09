"use client";

import { SignatureList } from "@/features/support-hub/components/settings/signatures/SignatureList";
import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";

export default function SupportSettingsSignaturesPage() {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Signatures"
      description="Default signatures per agent and for the workspace."
    >
      <SignatureList />
    </SupportWorkspaceShell>
  );
}
