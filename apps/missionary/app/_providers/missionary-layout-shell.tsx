"use client";

import { PASSWORD_RECOVERY_PATHS } from "@asym/auth/password-recovery";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { MissionaryNavigationSearch } from "@/components/navigation-search";
import { isMissionaryWorkspacePath } from "@/lib/route-policy";

const ACCOUNT_SCREEN_PATHS = ["/login", "/register", "/no-access"];

/** Every password recovery step is an account screen too. */
function isAccountScreenPath(pathname: string) {
  return (
    ACCOUNT_SCREEN_PATHS.includes(pathname) ||
    pathname === PASSWORD_RECOVERY_PATHS.request ||
    pathname.startsWith(`${PASSWORD_RECOVERY_PATHS.request}/`)
  );
}

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
  if (isAccountScreenPath(pathname)) {
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
