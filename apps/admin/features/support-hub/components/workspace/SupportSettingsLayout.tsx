"use client";

import { SupportWorkspaceShell } from "./SupportWorkspaceShell";

import type { ReactNode } from "react";

export function SupportSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <SupportWorkspaceShell
      section="settings"
      title="Support settings"
      description="Manage inbox routing, replies and team preferences."
    >
      {children}
    </SupportWorkspaceShell>
  );
}
