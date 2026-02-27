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
  ActivityIcon,
  BellIcon,
  ChartPieIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  DollarSignIcon,
  LanguagesIcon,
  LayoutGridIcon,
  LogOutIcon,
  MailIcon,
  SearchIcon,
  SettingsIcon,
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
import Link from "next/link";

import type { ComponentType, ReactNode } from "react";

import { ClientOnly } from "@/features/mission-control/components/client-only";
import { ThemeProvider } from "@/lib/theme-provider";

/* ------------------------------------------------------------------ */
/*  Menu data                                                          */
/* ------------------------------------------------------------------ */

type MenuSubItem = {
  label: string;
  href: string;
  badge?: string;
};

type MenuItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
} & (
  | { href: string; badge?: string; items?: never }
  | { href?: never; badge?: never; items: MenuSubItem[] }
);

const menuItems: MenuItem[] = [
  { icon: ChartPieIcon, label: "Dashboard", href: "/" },
];

const modulesItems: MenuItem[] = [
  { icon: DollarSignIcon, label: "Contributions", href: "/contributions" },
  { icon: UsersIcon, label: "CRM", href: "/crm" },
  { icon: HeartHandshakeIcon, label: "Member Care", href: "/care" },
  { icon: CalendarIcon, label: "Events", href: "/events" },
  { icon: FileTextIcon, label: "Reports", href: "/reports" },
  {
    icon: ActivityIcon,
    label: "Ministry Updates",
    items: [
      { label: "Content Moderation", href: "/feed" },
      { label: "Org Updates", href: "/feed/org-updates" },
    ],
  },
  { icon: SparklesIcon, label: "Tasks", href: "/tasks" },
  { icon: LayoutGridIcon, label: "Mobilize", href: "/mobilize" },
];

const toolsItems: MenuItem[] = [
  { icon: MailIcon, label: "Email Studio", href: "/email" },
  { icon: GlobeIcon, label: "Web Studio", href: "/web-studio" },
  { icon: PenToolIcon, label: "Sign", href: "/sign" },
  { icon: FileTextIcon, label: "PDF", href: "/pdf" },
  { icon: SparklesIcon, label: "Automations", href: "/automations" },
];

const adminItems: MenuItem[] = [
  { icon: ShieldCheckIcon, label: "Admin", href: "/admin" },
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
    <SidebarGroup className="px-2 py-1">
      {groupLabel && (
        <SidebarGroupLabel className="text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 px-3 mb-1 h-6">
          {groupLabel}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {data.map((item) =>
            item.items ? (
              <Collapsible className="group/collapsible" key={item.label}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.label}
                      className="h-9 px-3 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
                    >
                      <item.icon className="size-4" />
                      <span className="text-[11px] font-semibold tracking-wide">
                        {item.label}
                      </span>
                      <ChevronRightIcon className="ml-auto size-3.5 text-sidebar-foreground/30 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
                    <SidebarMenuSub className="ml-[22px] border-l border-sidebar-border/60 gap-0.5 py-1">
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.label}>
                          <SidebarMenuSubButton
                            className="h-8 px-3 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
                            asChild
                          >
                            <a href={subItem.href}>
                              <span className="text-[11px] font-medium">
                                {subItem.label}
                              </span>
                              {subItem.badge && (
                                <span className="bg-primary/10 text-primary flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-bold">
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
                  className="h-9 px-3 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
                >
                  <a href={item.href}>
                    <item.icon className="size-4" />
                    <span className="text-[11px] font-semibold tracking-wide">
                      {item.label}
                    </span>
                  </a>
                </SidebarMenuButton>
                {item.badge && (
                  <SidebarMenuBadge className="bg-primary/10 text-primary rounded-full text-[9px] font-bold">
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

/* ------------------------------------------------------------------ */
/*  Sidebar footer — user profile                                      */
/* ------------------------------------------------------------------ */

function SidebarUserFooter() {
  const { user, signOut } = useMC();

  return (
    <SidebarFooter className="p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-12 px-2 rounded-xl hover:bg-sidebar-accent transition-all duration-150 data-[state=open]:bg-sidebar-accent"
              >
                <Avatar className="size-8 rounded-lg border border-sidebar-border">
                  <AvatarImage
                    src={
                      user?.avatarUrl ||
                      "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                    }
                  />
                  <AvatarFallback className="rounded-lg text-[10px] font-bold bg-sidebar-accent text-sidebar-foreground">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="text-[11px] font-bold text-sidebar-foreground truncate">
                    {user?.name || "User Name"}
                  </span>
                  <span className="text-[10px] text-sidebar-foreground/50 truncate">
                    {user?.email || "user@givehope.org"}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4 text-sidebar-foreground/30 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-xl"
              side="top"
              align="start"
              sideOffset={8}
            >
              <div className="flex items-center gap-3 p-3">
                <Avatar className="size-9 rounded-lg border border-border">
                  <AvatarImage
                    src={
                      user?.avatarUrl ||
                      "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                    }
                  />
                  <AvatarFallback className="rounded-lg text-xs font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid leading-tight">
                  <span className="text-sm font-bold truncate">
                    {user?.name || "User Name"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email || "user@givehope.org"}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg py-2 gap-2.5 cursor-pointer">
                <SettingsIcon className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="rounded-lg py-2 gap-2.5 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOutIcon className="size-4" />
                <span className="text-xs font-medium">Sign Out</span>
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
          <SidebarTrigger className="-ml-1 size-8 [&_svg]:!size-4 touch-target text-muted-foreground hover:text-foreground transition-colors" />
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <SearchDialog
            trigger={
              <>
                <Button
                  variant="ghost"
                  className="hidden h-8 w-56 justify-start px-3 text-muted-foreground hover:bg-muted/50 sm:flex rounded-lg"
                >
                  <SearchIcon className="mr-2 size-3.5" />
                  <span className="text-[11px] font-medium text-muted-foreground/70">
                    Search...
                  </span>
                  <kbd className="pointer-events-none ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded-md border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 sm:hidden touch-target"
                >
                  <SearchIcon className="size-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </>
            }
          />
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageDropdown
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hidden sm:inline-flex text-muted-foreground hover:text-foreground transition-colors rounded-lg"
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
                className="size-8 hidden sm:inline-flex text-muted-foreground hover:text-foreground transition-colors rounded-lg"
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
                className="relative size-8 touch-target text-muted-foreground hover:text-foreground transition-colors rounded-lg"
              >
                <BellIcon className="size-4" />
                <span className="bg-rose-500 absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2 ring-background" />
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
                <Avatar className="size-7 rounded-lg">
                  <AvatarImage
                    src={
                      user?.avatarUrl ||
                      "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                    }
                  />
                  <AvatarFallback className="text-[10px] rounded-lg font-bold">
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
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          {/* Branding header */}
          <SidebarHeader className="h-12 border-b border-sidebar-border px-2 flex items-center">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  className="gap-2.5 !bg-transparent h-10 px-2"
                  asChild
                >
                  <Link href="/">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white font-black text-xs shadow-sm shrink-0">
                      G
                    </div>
                    <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden min-w-0">
                      <span className="text-xs font-black tracking-widest uppercase leading-none truncate text-sidebar-foreground">
                        Give Hope
                      </span>
                      <span className="text-[8px] font-bold text-sidebar-foreground/40 tracking-[0.2em] uppercase leading-none mt-0.5 truncate">
                        Mission Control
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent className="scrollbar-none pt-2">
            <SidebarNavGroup data={menuItems} />
            <SidebarNavGroup data={modulesItems} groupLabel="Modules" />
            <SidebarNavGroup data={toolsItems} groupLabel="Tools" />
            <SidebarNavGroup data={adminItems} groupLabel="System" />
          </SidebarContent>

          {/* User footer */}
          <ClientOnly fallback={null}>
            <SidebarUserFooter />
          </ClientOnly>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <ClientOnly
            fallback={
              <div className="h-12 border-b border-sidebar-border bg-background/95" />
            }
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

/* ------------------------------------------------------------------ */
/*  Root shell export                                                  */
/* ------------------------------------------------------------------ */

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
