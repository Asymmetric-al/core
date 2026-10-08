"use client";

import {
  SidebarProvider,
  SidebarInset,
} from "@asym/ui/components/shadcn/sidebar";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { DashboardFooter } from "./dashboard-footer";

import type { UserRole } from "./navigation-items";

interface AppShellProps {
  children: React.ReactNode;
  role?: UserRole;
  title?: string;
  tenantLogo?: string;
  tenantName?: string;
  showFooter?: boolean;
  navigation?: React.ReactNode;
}

export function AppShell({
  children,
  role = "donor",
  title,
  tenantLogo,
  tenantName,
  showFooter = true,
  navigation,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} tenantLogo={tenantLogo} tenantName={tenantName} />
      <SidebarInset className="flex min-h-svh min-w-0 flex-col">
        <AppHeader title={title} navigation={navigation} />
        <RouteMainViewTransitionBoundary className="container-responsive flex-1 py-responsive-section">
          {children}
        </RouteMainViewTransitionBoundary>
        {showFooter && <DashboardFooter />}
      </SidebarInset>
    </SidebarProvider>
  );
}
