"use client";

import { siteConfig } from "@asym/config/site-client";
import {
  useMissionaryPortalSnapshot,
  usePendingFollowRequestCount,
} from "@asym/database/hooks";
import { buildMissionaryDashboardView } from "@asym/missionary/components/dashboard-view";
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
  useSidebar,
} from "@asym/ui/components/shadcn/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getNavGroups, type UserRole } from "./navigation-items";
import { SidebarAccountMenu } from "./sidebar-account-menu";

interface AppSidebarProps {
  role?: UserRole;
  tenantLogo?: string;
  tenantName?: string;
}

export function isActivePath(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/** Overdue open tasks, from the portal snapshot the dashboard already loads. */
function useOverdueTaskCount(enabled: boolean) {
  const portal = useMissionaryPortalSnapshot();
  if (!enabled || !portal.data) return 0;
  return buildMissionaryDashboardView(portal.data).pendingTasks.filter(
    (task) => task.overdue,
  ).length;
}

export function AppSidebar({
  role = "donor",
  tenantLogo,
  tenantName = siteConfig.name,
}: AppSidebarProps) {
  const pathname = usePathname();
  const groups = getNavGroups(role);
  const { isMobile, setOpenMobile } = useSidebar();
  const isMissionary = role === "missionary";
  const overdueTasks = useOverdueTaskCount(isMissionary);
  const followRequests =
    usePendingFollowRequestCount({ enabled: isMissionary }).data ?? 0;
  // Counts are always in words: a bare "4" beside Updates would read as four
  // updates. The spoken name says it in full and contains the visible words.
  const cues: Record<string, { shown: string; spoken: string } | null> = {
    "/tasks":
      overdueTasks > 0
        ? {
            shown: `${overdueTasks} overdue`,
            spoken: `${overdueTasks} overdue`,
          }
        : null,
    "/feed":
      isMissionary && followRequests > 0
        ? followRequests === 1
          ? { shown: "1 request", spoken: "1 request to follow you" }
          : {
              shown: `${followRequests} requests`,
              spoken: `${followRequests} requests to follow you`,
            }
        : null,
  };
  // The shell persists across routes, so the mobile sheet must close itself
  // when a destination is chosen.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <Link
          href="/"
          onClick={closeOnMobile}
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
      <SidebarContent
        className="px-2"
        role="navigation"
        aria-label="Missionary workspace"
      >
        {groups.map((group, index) => (
          <SidebarGroup key={group.label ?? index} className="p-0">
            {group.label ? (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const isActive = isActivePath(pathname, item.href);
                  const cue = cues[item.href] ?? null;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <Link
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}
                            aria-label={
                              cue ? `${item.title}, ${cue.spoken}` : undefined
                            }
                            onClick={closeOnMobile}
                          />
                        }
                        isActive={isActive}
                        tooltip={
                          cue ? `${item.title} · ${cue.spoken}` : item.title
                        }
                      >
                        <AppIcon icon={item.icon} animated={isActive} />
                        <span className="truncate">{item.title}</span>
                        {cue ? (
                          <span
                            aria-hidden="true"
                            className="ml-auto shrink-0 text-xs font-medium tabular-nums"
                          >
                            {cue.shown}
                          </span>
                        ) : null}
                      </SidebarMenuButton>
                      {/* Collapsed to icons, the words hide with the label:
                          this dot marks the icon and the tooltip names the
                          count. The menu item is the positioning parent. */}
                      {cue ? (
                        <span
                          data-attention-dot=""
                          aria-hidden="true"
                          className="pointer-events-none absolute top-1 right-1 hidden size-2 rounded-full bg-sidebar-primary ring-2 ring-sidebar group-data-[collapsible=icon]:block"
                        />
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="mt-auto p-2">
        {/* No shared VT name here: the sidebar persists across routes, so it
            can never form a legal unmount/mount pair with the profile page's
            avatar (names must be mounted one-at-a-time). */}
        <SidebarAccountMenu roleLabel={roleLabel} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
