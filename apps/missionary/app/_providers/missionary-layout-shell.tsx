"use client";

import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

/**
 * Boneyard capture runs on public `/boneyard/*` routes. Skip the full app
 * chrome so viewport width matches in-app task surfaces more closely.
 */
export function MissionaryLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/boneyard" || pathname.startsWith("/boneyard/")) {
    return (
      <div className="min-h-svh bg-background p-4 sm:p-6 lg:p-8 pb-20">
        {children}
      </div>
    );
  }
  return <AppShell role="missionary">{children}</AppShell>;
}
