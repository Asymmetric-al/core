"use client";

import {
  SidebarProvider,
  SidebarInset,
} from "@asym/ui/components/shadcn/sidebar";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { DashboardFooter } from "./dashboard-footer";

type UserRole = "donor" | "missionary" | "admin";

interface AppShellProps {
  children: React.ReactNode;
  role?: UserRole;
  title?: string;
  tenantLogo?: string;
  tenantName?: string;
  showFooter?: boolean;
}

export function AppShell({
  children,
  role = "donor",
  title,
  tenantLogo,
  tenantName,
  showFooter = true,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} tenantLogo={tenantLogo} tenantName={tenantName} />
      <SidebarInset className="bg-zinc-50/50 flex flex-col min-h-svh">
        <AppHeader title={title} />
        <RouteMainViewTransitionBoundary className="container-responsive flex-1 py-responsive-section">
          {children}
        </RouteMainViewTransitionBoundary>
        {showFooter && <DashboardFooter />}
      </SidebarInset>
    </SidebarProvider>
  );
}
