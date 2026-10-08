"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { AppIcon } from "@asym/ui/components/shadcn/icons/AppIcon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@asym/ui/components/shadcn/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getNavItems, type UserRole } from "./navigation-items";

interface AppSidebarProps {
  role?: UserRole;
  tenantLogo?: string;
  tenantName?: string;
}

export function AppSidebar({
  role = "donor",
  tenantLogo,
  tenantName = "Give Hope",
}: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {tenantLogo ? (
            <Avatar className="size-8">
              <AvatarImage src={tenantLogo} alt={tenantName} />
              <AvatarFallback>{tenantName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {tenantName.charAt(0)}
            </div>
          )}
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold leading-tight tracking-tight text-sidebar-foreground">
              {tenantName}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                        />
                      }
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <AppIcon icon={item.icon} animated={isActive} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto p-3">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          {/* No shared VT name here: the sidebar persists across routes, so it
              can never form a legal unmount/mount pair with the profile page's
              avatar (names must be mounted one-at-a-time). */}
          <Avatar className="size-8">
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium leading-tight text-sidebar-foreground">
              User Name
            </span>
            <span className="truncate text-xs capitalize text-muted-foreground">
              {role}
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
