"use client";

import { MCProvider, useMC } from "@asym/lib/mission-control/context";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@asym/ui/components/shadcn/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Separator } from "@asym/ui/components/shadcn/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
} from "@asym/ui/components/shadcn/sidebar";
import ActivityDialog from "@asym/ui/components/shadcn-studio/blocks/dialog-activity";
import SearchDialog from "@asym/ui/components/shadcn-studio/blocks/dialog-search";
import LanguageDropdown from "@asym/ui/components/shadcn-studio/blocks/dropdown-language";
import NotificationDropdown from "@asym/ui/components/shadcn-studio/blocks/dropdown-notification";
import ProfileDropdown from "@asym/ui/components/shadcn-studio/blocks/dropdown-profile";
import {
  ChartPieIcon as ChartPieAnimated,
  DollarSignIcon as DollarSignAnimated,
  UsersIcon as UsersAnimated,
  HeartHandshakeIcon as HeartHandshakeAnimated,
  CalendarDaysIcon as CalendarAnimated,
  FileTextIcon as FileTextAnimated,
  ActivityIcon as ActivityAnimated,
  SparklesIcon as SparklesAnimated,
  PenToolIcon as PenToolAnimated,
  ShieldCheckIcon as ShieldCheckAnimated,
  SearchIcon as SearchAnimated,
  BellIcon as BellAnimated,
  SettingsIcon as SettingsAnimated,
  ChevronRightIcon as ChevronRightAnimated,
  ChevronsUpDownIcon as ChevronsUpDownAnimated,
} from "lucide-animated";
import {
  ActivityIcon,
  GlobeIcon,
  LanguagesIcon,
  LayoutGridIcon,
  LifeBuoyIcon,
  LogOutIcon,
  MailIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";

import type { ComponentType, ReactNode } from "react";

import { ClientOnly } from "@/features/mission-control/components/client-only";
import { ThemeProvider } from "@/lib/theme-provider";

/* ------------------------------------------------------------------ */
/*  Menu data                                                          */
/* ------------------------------------------------------------------ */

type MenuSubItem = { label: string; href: string; badge?: string };

type MenuItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
} & (
  | { href: string; badge?: string; items?: never }
  | { href?: never; badge?: never; items: MenuSubItem[] }
);

const menuItems: MenuItem[] = [
  { icon: ChartPieAnimated, label: "Dashboard", href: "/" },
];

const modulesItems: MenuItem[] = [
  { icon: DollarSignAnimated, label: "Contributions", href: "/contributions" },
  { icon: UsersAnimated, label: "CRM", href: "/crm" },
  { icon: HeartHandshakeAnimated, label: "Member Care", href: "/care" },
  { icon: CalendarAnimated, label: "Events", href: "/events" },
  { icon: FileTextAnimated, label: "Reports", href: "/reports" },
  {
    icon: ActivityAnimated,
    label: "Ministry Updates",
    items: [
      { label: "Content Moderation", href: "/feed" },
      { label: "Org Updates", href: "/feed/org-updates" },
    ],
  },
  { icon: SparklesAnimated, label: "Tasks", href: "/tasks" },
  { icon: LayoutGridIcon, label: "Mobilize", href: "/mobilize" },
];

const toolsItems: MenuItem[] = [
  { icon: MailIcon, label: "Email Studio", href: "/email" },
  { icon: GlobeIcon, label: "Web Studio", href: "/web-studio" },
  { icon: PenToolAnimated, label: "Sign", href: "/sign" },
  { icon: FileTextAnimated, label: "PDF", href: "/pdf" },
  { icon: SparklesAnimated, label: "Automations", href: "/automations" },
];

const adminItems: MenuItem[] = [
  { icon: ShieldCheckAnimated, label: "Admin", href: "/admin" },
  { icon: LifeBuoyIcon, label: "Support", href: "/support" },
];

/* ------------------------------------------------------------------ */
/*  Sidebar nav group                                                  */
/* ------------------------------------------------------------------ */

function SidebarNavGroup({
  data,
  groupLabel,
}: {
  data: MenuItem[];
  groupLabel?: string;
}) {
  return (
    <SidebarGroup>
      {groupLabel && (
        <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/40">
          {groupLabel}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {data.map((item) =>
            item.items ? (
              <Collapsible className="group/collapsible" key={item.label}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.label}>
                      <item.icon />
                      <span>{item.label}</span>
                      <ChevronRightAnimated className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.label}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.href}>
                              <span>{subItem.label}</span>
                              {subItem.badge && (
                                <span className="ml-auto bg-primary/10 text-primary flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-semibold">
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
                <SidebarMenuButton tooltip={item.label} asChild>
                  <a href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
                {item.badge && (
                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar footer — user profile                                      */
/* ------------------------------------------------------------------ */

function SidebarUserFooter() {
  const { user, signOut } = useMC();

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={
                      user?.avatarUrl ||
                      "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                    }
                  />
                  <AvatarFallback className="rounded-lg text-xs font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.name || "User Name"}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/50">
                    {user?.email || "user@givehope.org"}
                  </span>
                </div>
                <ChevronsUpDownAnimated className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={
                      user?.avatarUrl ||
                      "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                    }
                  />
                  <AvatarFallback className="rounded-lg text-xs font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.name || "User Name"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email || "user@givehope.org"}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <SettingsAnimated className="size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="gap-2 cursor-pointer"
              >
                <LogOutIcon className="size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

/* ------------------------------------------------------------------ */
/*  Top header bar                                                     */
/* ------------------------------------------------------------------ */

function AppHeader() {
  const { user, signOut } = useMC();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-12 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <SearchDialog
            trigger={
              <>
                <Button
                  variant="ghost"
                  className="hidden h-8 w-56 justify-start px-3 text-muted-foreground hover:bg-muted/50 sm:flex gap-2"
                >
                  <SearchAnimated className="size-4" />
                  <span className="text-sm text-muted-foreground/60">
                    Search...
                  </span>
                  <kbd className="pointer-events-none ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 sm:hidden"
                >
                  <SearchIcon className="size-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </>
            }
          />
        </div>
        <div className="flex items-center gap-1">
          <LanguageDropdown
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hidden sm:inline-flex"
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
                className="size-8 hidden sm:inline-flex"
              >
                <ActivityIcon className="size-4" />
              </Button>
            }
          />
          <NotificationDropdown
            trigger={
              <Button variant="ghost" size="icon" className="relative size-8">
                <BellAnimated className="size-4" />
                <span className="bg-rose-500 absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2 ring-background" />
              </Button>
            }
          />
          <ProfileDropdown
            trigger={
              <Button variant="ghost" size="icon" className="size-8">
                <Avatar className="size-7 rounded-lg">
                  <AvatarImage
                    src={
                      user?.avatarUrl ||
                      "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                    }
                  />
                  <AvatarFallback className="text-[10px] rounded-lg font-semibold">
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

/* ------------------------------------------------------------------ */
/*  Application shell                                                  */
/* ------------------------------------------------------------------ */

function ApplicationShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <Link href="/">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
                      G
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-bold">Give Hope</span>
                      <span className="truncate text-xs text-sidebar-foreground/50">
                        Mission Control
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarNavGroup data={menuItems} />
            <SidebarNavGroup data={modulesItems} groupLabel="Modules" />
            <SidebarNavGroup data={toolsItems} groupLabel="Tools" />
            <SidebarNavGroup data={adminItems} groupLabel="System" />
          </SidebarContent>

          <ClientOnly fallback={null}>
            <SidebarUserFooter />
          </ClientOnly>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <ClientOnly
            fallback={<div className="h-12 border-b bg-background/95" />}
          >
            <AppHeader />
          </ClientOnly>
          <main className="flex-1 flex flex-col min-h-0 overflow-auto">
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
