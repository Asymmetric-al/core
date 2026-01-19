"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Heart,
  Settings,
  BarChart3,
  UserCircle,
  CreditCard,
  FileText,
  Newspaper,
  CheckSquare,
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/icons/AppIcon";

type UserRole = "donor" | "missionary" | "admin";

interface NavItem {
  title: string;
  href: string;
  icon: typeof Home;
}

interface AppSidebarProps {
  role?: UserRole;
  tenantLogo?: string;
  tenantName?: string;
}

const donorNavItems: NavItem[] = [
  { title: "Dashboard", href: "/donor-dashboard", icon: Home },
  { title: "Ministry Updates", href: "/donor-dashboard/feed", icon: Newspaper },
  { title: "My Giving", href: "/donor-dashboard/pledges", icon: Heart },
  { title: "Wallet", href: "/donor-dashboard/wallet", icon: CreditCard },
  { title: "History", href: "/donor-dashboard/history", icon: FileText },
  { title: "Settings", href: "/donor-dashboard/settings", icon: Settings },
];

const missionaryNavItems: NavItem[] = [
  { title: "Dashboard", href: "/missionary-dashboard", icon: Home },
  { title: "Donors", href: "/missionary-dashboard/donors", icon: Users },
  {
    title: "Ministry Updates",
    href: "/missionary-dashboard/feed",
    icon: Newspaper,
  },
  {
    title: "Analytics",
    href: "/missionary-dashboard/analytics",
    icon: BarChart3,
  },
  { title: "Tasks", href: "/missionary-dashboard/tasks", icon: CheckSquare },
  { title: "Profile", href: "/missionary-dashboard/profile", icon: UserCircle },
  { title: "Settings", href: "/missionary-dashboard/settings", icon: Settings },
];

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "donor":
      return donorNavItems;
    case "missionary":
      return missionaryNavItems;
    default:
      return donorNavItems;
  }
}

export function AppSidebar({
  role = "donor",
  tenantLogo,
  tenantName = "Give Hope",
}: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-zinc-200/60 bg-white"
    >
      <SidebarHeader className="px-3 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          {tenantLogo ? (
            <Avatar className="size-7 rounded-md shadow-sm ring-1 ring-zinc-950/5 group-hover:ring-zinc-950/10 transition-all">
              <AvatarImage src={tenantLogo} alt={tenantName} />
              <AvatarFallback className="rounded-md bg-zinc-900 text-white font-semibold text-xs">
                {tenantName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex size-7 items-center justify-center rounded-md bg-zinc-900 text-white font-semibold text-xs shadow-sm ring-1 ring-zinc-950/5 group-hover:ring-zinc-950/10 transition-all">
              {tenantName.charAt(0)}
            </div>
          )}
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-[13px] font-semibold text-zinc-900 leading-tight tracking-tight">
              {tenantName}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 px-2 mb-1 h-6">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-8 px-2 rounded-md transition-colors",
                        isActive
                          ? "bg-zinc-100 text-zinc-900 font-medium"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50",
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-2.5"
                      >
                        <AppIcon
                          icon={item.icon}
                          animated={isActive}
                          className={cn(
                            "size-4 shrink-0",
                            isActive ? "text-zinc-700" : "text-zinc-400",
                          )}
                        />
                        <span className="text-[13px] truncate">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 py-3 mt-auto border-t border-zinc-100">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-7 rounded-md ring-1 ring-zinc-950/5">
            <AvatarFallback className="rounded-md bg-zinc-100 text-zinc-600 text-xs font-medium">
              UN
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-[13px] font-medium text-zinc-900 truncate leading-tight">
              User Name
            </span>
            <span className="text-[11px] text-zinc-500 truncate capitalize">
              {role}
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
