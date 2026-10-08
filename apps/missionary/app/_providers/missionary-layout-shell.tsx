"use client";

import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { MissionaryNavigationSearch } from "@/components/navigation-search";
import { isMissionaryWorkspacePath } from "@/lib/route-policy";

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
  // Account screens own their full-page frame and main landmark. This is a
  // presentation boundary only; public access and workspace search stay separate.
  if (
    ["/login", "/register", "/forgot-password", "/no-access"].includes(pathname)
  ) {
    return children;
  }
  return (
    <AppShell
      role="missionary"
      navigation={
        isMissionaryWorkspacePath(pathname) ? (
          <MissionaryNavigationSearch />
        ) : undefined
      }
    >
      {children}
    </AppShell>
  );
}
