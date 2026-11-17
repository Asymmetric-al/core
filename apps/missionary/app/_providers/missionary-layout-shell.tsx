"use client";

import { useRoutePathname } from "@asym/auth/tenant-navigation";

import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { MissionaryNavigationSearch } from "@/components/navigation-search";
import { isMissionaryWorkspacePath } from "@/lib/route-policy";

/** Account screens own their full-page frame and main landmark. */
const ACCOUNT_SCREENS = [
  "/login",
  "/register",
  "/forgot-password",
  "/no-access",
  "/choose-organization",
];

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
  if (ACCOUNT_SCREENS.includes(pathname)) return children;
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
