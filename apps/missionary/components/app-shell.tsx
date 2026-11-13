"use client";

import {
  SidebarProvider,
  SidebarInset,
} from "@asym/ui/components/shadcn/sidebar";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";
import { usePathname } from "next/navigation";

import { AppHeader } from "./app-header";
import { AppSidebar, isActivePath } from "./app-sidebar";
import { getNavItems, type UserRole } from "./navigation-items";

interface AppShellProps {
  children: React.ReactNode;
  role?: UserRole;
  title?: string;
  tenantLogo?: string;
  tenantName?: string;
  navigation?: React.ReactNode;
}

export function AppShell({
  children,
  role = "donor",
  title,
  tenantLogo,
  tenantName,
  navigation,
}: AppShellProps) {
  const pathname = usePathname();
  const sectionLabel = getNavItems(role).find((item) =>
    isActivePath(pathname, item.href),
  )?.title;

  return (
    <SidebarProvider>
      <AppSidebar role={role} tenantLogo={tenantLogo} tenantName={tenantName} />
      <SidebarInset className="flex min-h-svh min-w-0 flex-col">
        <AppHeader
          title={title}
          sectionLabel={sectionLabel}
          navigation={navigation}
        />
        <RouteMainViewTransitionBoundary className="container-responsive flex-1 py-responsive-section">
          {children}
        </RouteMainViewTransitionBoundary>
      </SidebarInset>
    </SidebarProvider>
  );
}
