"use client";

import type { ComponentType, ReactNode } from "react";
import {
  ActivityIcon,
  BellIcon,
  ChartPieIcon,
  ChevronRightIcon,
  DollarSignIcon,
  LanguagesIcon,
  LayoutGridIcon,
  MailIcon,
  SearchIcon,
  UsersIcon,
  HeartHandshakeIcon,
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  PenToolIcon,
  SparklesIcon,
  LifeBuoyIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import SearchDialog from "@/components/shadcn-studio/blocks/dialog-search";
import LanguageDropdown from "@/components/shadcn-studio/blocks/dropdown-language";
import ActivityDialog from "@/components/shadcn-studio/blocks/dialog-activity";
import NotificationDropdown from "@/components/shadcn-studio/blocks/dropdown-notification";
import ProfileDropdown from "@/components/shadcn-studio/blocks/dropdown-profile";

import { MCProvider, useMC } from "@/lib/mission-control/context";
import { ThemeProvider } from "@/providers/theme-provider";
import { ClientOnly } from "@/features/mission-control/components/client-only";
import { DashboardFooter } from "@/components/dashboard-footer";

type MenuSubItem = {
  label: string;
  href: string;
  badge?: string;
};

type MenuItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
} & (
  | {
      href: string;
      badge?: string;
      items?: never;
    }
  | { href?: never; badge?: never; items: MenuSubItem[] }
);

const menuItems: MenuItem[] = [
  {
    icon: ChartPieIcon,
    label: "Dashboard",
    href: "/mc",
  },
];

const modulesItems: MenuItem[] = [
  {
    icon: DollarSignIcon,
    label: "Contributions",
    href: "/mc/contributions",
  },
  {
    icon: UsersIcon,
    label: "CRM",
    href: "/mc/crm",
  },
  {
    icon: HeartHandshakeIcon,
    label: "Member Care",
    href: "/mc/care",
  },
  {
    icon: CalendarIcon,
    label: "Events",
    href: "/mc/events",
  },
  {
    icon: FileTextIcon,
    label: "Reports",
    href: "/mc/reports",
  },
  {
    icon: ActivityIcon,
    label: "Ministry Updates",
    items: [
      { label: "Content Moderation", href: "/mc/feed" },
      { label: "Org Updates", href: "/mc/feed/org-updates" },
    ],
  },
  {
    icon: SparklesIcon,
    label: "Tasks",
    href: "/mc/tasks",
  },
  {
    icon: LayoutGridIcon,
    label: "Mobilize",
    href: "/mc/mobilize",
  },
];

const toolsItems: MenuItem[] = [
  {
    icon: MailIcon,
    label: "Email Studio",
    href: "/mc/email",
  },
  {
    icon: GlobeIcon,
    label: "Web Studio",
    href: "/mc/web-studio",
  },
  {
    icon: PenToolIcon,
    label: "Sign",
    href: "/mc/sign",
  },
  {
    icon: FileTextIcon,
    label: "PDF",
    href: "/mc/pdf",
  },
  {
    icon: SparklesIcon,
    label: "Automations",
    href: "/mc/automations",
  },
];

const adminItems: MenuItem[] = [
  {
    icon: ShieldCheckIcon,
    label: "Admin",
    href: "/mc/admin",
  },
  {
    icon: LifeBuoyIcon,
    label: "Support",
    href: "/mc/support",
  },
];

function SidebarGroupedMenuItems({
  data,
  groupLabel,
}: {
  data: MenuItem[];
  groupLabel?: string;
}) {
  return (
    <SidebarGroup className="py-0.5">
      {groupLabel && (
        <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-0.5 h-6">
          {groupLabel}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-px">
          {data.map((item) =>
            item.items ? (
              <Collapsible className="group/collapsible" key={item.label}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.label}
                      className="h-8 px-3"
                    >
                      <item.icon className="size-3.5" />
                      <span className="text-xs font-bold uppercase tracking-tight">
                        {item.label}
                      </span>
                      <ChevronRightIcon className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 border-l border-zinc-100 gap-px">
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.label}>
                          <SidebarMenuSubButton
                            className="justify-between h-7 px-3"
                            asChild
                          >
                            <a
                              href={subItem.href}
                              className="text-[11px] font-medium uppercase tracking-tight"
                            >
                              {subItem.label}
                              {subItem.badge && (
                                <span className="bg-primary/10 flex h-3.5 min-w-3.5 items-center justify-center rounded-full text-[9px]">
                                  {subItem.badge}
                                </span>
                              )}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  tooltip={item.label}
                  asChild
                  className="h-8 px-3"
                >
                  <a href={item.href}>
                    <item.icon className="size-3.5" />
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {item.label}
                    </span>
                  </a>
                </SidebarMenuButton>
                {item.badge && (
                  <SidebarMenuBadge className="bg-primary/10 rounded-full text-[9px]">
                    {item.badge}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function AppHeader() {
  const { user, signOut } = useMC();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarTrigger className="-ml-1 h-8 w-8 [&_svg]:!size-4 touch-target" />
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <SearchDialog
            trigger={
              <>
                <Button
                  variant="ghost"
                  className="hidden h-8 w-48 sm:w-64 justify-start px-2 font-normal text-muted-foreground hover:bg-muted/50 sm:flex"
                >
                  <SearchIcon className="mr-2 size-3.5" />
                  <span className="text-xs font-bold uppercase tracking-tight">
                    Search...
                  </span>
                  <kbd className="pointer-events-none ml-auto hidden sm:inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:hidden touch-target"
                >
                  <SearchIcon className="size-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </>
            }
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageDropdown
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:inline-flex"
              >
                <LanguagesIcon className="size-4" />
              </Button>
            }
          />
          <ActivityDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:inline-flex"
              >
                <ActivityIcon className="size-4" />
              </Button>
            }
          />
          <NotificationDropdown
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 touch-target"
              >
                <BellIcon className="size-4" />
                <span className="bg-rose-500 absolute top-2 right-2 size-1.5 rounded-full ring-2 ring-background" />
              </Button>
            }
          />
          <ProfileDropdown
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg touch-target"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={
                      user?.avatarUrl ||
                      "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                    }
                  />
                  <AvatarFallback className="text-[10px] rounded-lg">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
            user={user}
            onSignOut={signOut}
          />
        </div>
      </div>
    </header>
  );
}

function ApplicationShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-zinc-50/50">
      <SidebarProvider>
        <Sidebar
          collapsible="icon"
          className="border-r border-zinc-200/50 shadow-sm"
        >
          <SidebarHeader className="h-12 border-b border-zinc-200/50 px-3 sm:px-4 flex items-center justify-center">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="sm"
                  className="gap-2 sm:gap-2.5 !bg-transparent"
                  asChild
                >
                  <a href="/mc">
                    <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-xs shadow-sm shrink-0">
                      G
                    </div>
                    <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden min-w-0">
                      <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase leading-none truncate">
                        GIVE HOPE
                      </span>
                      <span className="text-[7px] sm:text-[8px] font-bold text-zinc-500 tracking-[0.2em] uppercase leading-none mt-0.5 truncate">
                        MISSION CONTROL
                      </span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="scrollbar-none">
            <SidebarGroupedMenuItems data={menuItems} />
            <SidebarGroupedMenuItems data={modulesItems} groupLabel="Modules" />
            <SidebarGroupedMenuItems data={toolsItems} groupLabel="Tools" />
            <SidebarGroupedMenuItems data={adminItems} groupLabel="System" />
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-hidden">
          <ClientOnly
            fallback={<div className="h-12 border-b bg-background/95" />}
          >
            <AppHeader />
          </ClientOnly>
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export function MCShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <MCProvider>
        <ApplicationShell>{children}</ApplicationShell>
      </MCProvider>
    </ThemeProvider>
  );
}
