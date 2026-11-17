"use client";

import { PASSWORD_RECOVERY_PATHS } from "@asym/auth/password-recovery";
import { useRoutePathname } from "@asym/auth/tenant-navigation";

import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { MissionaryNavigationSearch } from "@/components/navigation-search";
import { isMissionaryWorkspacePath } from "@/lib/route-policy";

/** Account screens own their full-page frame and main landmark. */
const ACCOUNT_SCREEN_PATHS = [
  "/login",
  "/register",
  "/no-access",
  "/choose-organization",
];

/** Every password recovery step is an account screen too. */
function isAccountScreenPath(pathname: string) {
  return (
    ACCOUNT_SCREEN_PATHS.includes(pathname) ||
    pathname === PASSWORD_RECOVERY_PATHS.request ||
    pathname.startsWith(`${PASSWORD_RECOVERY_PATHS.request}/`)
  );
}

/**
 * Chooses the frame for a route. Account screens and the boneyard capture
 * pages render directly, so their own markup prerenders into the static
 * shell. Every other route is a signed-in workspace page and renders
 * `workspace`: the layout's request-time boundary, which gates the page and
 * fixes the document's tenant scope (see `MissionaryWorkspace` in
 * `app/layout.tsx`). The decision reads the route path, which is the same
 * when the shell is prerendered and in the browser under any tenant prefix.
 */
export function MissionaryLayoutShell({
  children,
  workspace,
}: {
  children: ReactNode;
  workspace: ReactNode;
}) {
  const pathname = useRoutePathname();
  // Boneyard capture skips the app chrome so viewport width matches in-app
  // task surfaces more closely.
  if (pathname === "/boneyard" || pathname.startsWith("/boneyard/")) {
    return (
      <div className="min-h-svh bg-background p-4 sm:p-6 lg:p-8 pb-20">
        {children}
      </div>
    );
  }
  // Account screens own their full-page frame and main landmark. This is a
  // presentation boundary only; public access and workspace search stay separate.
  if (isAccountScreenPath(pathname)) return children;
  return workspace;
}

/** The workspace chrome: sidebar, header and navigation search. */
export function MissionaryWorkspaceChrome({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = useRoutePathname();
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
