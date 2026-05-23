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
import { AppIcon } from "@asym/ui/components/shadcn/icons/AppIcon";
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@asym/ui/components/shadcn/sidebar";
import ActivityDialog from "@asym/ui/components/shadcn-studio/blocks/dialog-activity";
import SearchDialog from "@asym/ui/components/shadcn-studio/blocks/dialog-search";
import LanguageDropdown from "@asym/ui/components/shadcn-studio/blocks/dropdown-language";
import NotificationDropdown from "@asym/ui/components/shadcn-studio/blocks/dropdown-notification";
import ProfileDropdown, {
  type ProfileDropdownMenuItem,
} from "@asym/ui/components/shadcn-studio/blocks/dropdown-profile";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  CheckSquare,
  ChevronRight,
  DollarSign,
  FileText,
  Globe,
  Heart,
  Info,
  Languages,
  LifeBuoy,
  LogOut,
  Mail,
  PenTool,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { MCBootstrapState } from "@asym/lib/mission-control/bootstrap";
import type { ReactNode } from "react";

import { ClientOnly } from "@/features/mission-control/components/client-only";
import { ThemeProvider } from "@/lib/theme-provider";

/* ------------------------------------------------------------------ */
/*  Navigation data                                                    */
/* ------------------------------------------------------------------ */

interface NavItem {
  title: string;
  href: string;
  icon: typeof DollarSign;
  items?: { title: string; href: string }[];
}

const mainNav: NavItem[] = [{ title: "Dashboard", href: "/", icon: BarChart3 }];

const moduleNav: NavItem[] = [
  { title: "CRM", href: "/crm", icon: Users },
  { title: "Contributions", href: "/contributions", icon: DollarSign },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  {
    title: "Ministry Updates",
    href: "/feed",
    icon: Activity,
    items: [
      { title: "Moderation", href: "/feed" },
      { title: "Org Updates", href: "/feed/org-updates" },
    ],
  },
  { title: "Member Care", href: "/care", icon: Heart },
  { title: "Mobilize", href: "/mobilize", icon: Rocket },
];

const toolNav: NavItem[] = [
  { title: "Web Studio", href: "/web-studio", icon: Globe },
  { title: "Email Studio", href: "/email", icon: Mail },
  { title: "PDF Studio", href: "/pdf", icon: FileText },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Support Hub", href: "/support", icon: LifeBuoy },
  { title: "Event Hub", href: "/events", icon: Calendar },
  { title: "Sign Studio", href: "/sign", icon: PenTool },
  { title: "Automations", href: "/automations", icon: Sparkles },
];

const systemNav: NavItem[] = [{ title: "Admin", href: "/admin", icon: Shield }];

const adminProfileMenuItems: readonly ProfileDropdownMenuItem[] = [
  { label: "Administration", href: "/admin", icon: Shield },
  { label: "Manage team", href: "/admin/teams", icon: Users },
  { label: "About", href: "/help/about", icon: Info },
];

/* ------------------------------------------------------------------ */
/*  Nav section component                                              */
/* ------------------------------------------------------------------ */

function NavSection({
  items,
  label,
  pathname,
}: {
  items: NavItem[];
  label?: string;
  pathname: string;
}) {
  return (
    <SidebarGroup className="p-0">
      {label && (
        <SidebarGroupLabel className="mb-1 h-6 px-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            if (item.items) {
              return (
                <Collapsible
                  key={item.title}
                  defaultOpen={item.items.some((sub) =>
                    pathname.startsWith(sub.href),
                  )}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={cn(
                          "h-8 rounded-md px-2 transition-colors",
                          isActive
                            ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm ring-1 ring-zinc-950/5"
                            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950",
                        )}
                      >
                        <AppIcon
                          icon={item.icon}
                          animated={isActive}
                          className={cn(
                            "size-4 shrink-0",
                            isActive ? "text-zinc-800" : "text-zinc-500",
                          )}
                        />
                        <span className="text-[13px] truncate">
                          {item.title}
                        </span>
                        <ChevronRight className="ml-auto size-3.5 text-zinc-500 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((sub) => {
                          const subActive = pathname === sub.href;
                          return (
                            <SidebarMenuSubItem key={sub.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subActive}
                                className={cn(
                                  "transition-colors",
                                  subActive
                                    ? "font-semibold text-zinc-950"
                                    : "text-zinc-600 hover:text-zinc-950",
                                )}
                              >
                                <Link href={sub.href}>
                                  <span className="text-[13px] truncate">
                                    {sub.title}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "h-8 rounded-md px-2 transition-colors",
                    isActive
                      ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm ring-1 ring-zinc-950/5"
                      : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950",
                  )}
                >
                  <Link href={item.href} className="flex items-center gap-2.5">
                    <AppIcon
                      icon={item.icon}
                      animated={isActive}
                      className={cn(
                        "size-4 shrink-0",
                        isActive ? "text-zinc-800" : "text-zinc-500",
                      )}
                    />
                    <span className="text-[13px] truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/* ------------------------------------------------------------------ */
/*  User footer                                                        */
/* ------------------------------------------------------------------ */

function UserFooter() {
  const { user } = useMC();

  return (
    <SidebarFooter className="p-3 border-t border-zinc-100">
      <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
        <Avatar className="size-7 rounded-md ring-1 ring-zinc-950/5">
          <AvatarImage
            src={
              user?.avatarUrl ||
              "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
            }
          />
          <AvatarFallback className="rounded-md bg-zinc-100 text-zinc-600 text-xs font-medium">
            {user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
          <span className="text-[13px] font-medium text-zinc-900 truncate leading-tight">
            {user?.name || "User Name"}
          </span>
          <span className="text-[11px] text-zinc-500 truncate">Missionary</span>
        </div>
      </div>
    </SidebarFooter>
  );
}

/* ------------------------------------------------------------------ */
/*  App sidebar                                                        */
/* ------------------------------------------------------------------ */

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-zinc-200/60 bg-white"
    >
      <SidebarHeader className="p-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex size-7 items-center justify-center rounded-md bg-zinc-900 text-white font-semibold text-xs shadow-sm ring-1 ring-zinc-950/5 group-hover:ring-zinc-950/10 transition-shadow">
            G
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-[13px] font-semibold text-zinc-900 leading-tight tracking-tight">
              Give Hope
            </span>
            <span className="text-[10px] leading-tight text-zinc-500">
              Mission Control
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavSection items={mainNav} pathname={pathname} />
        <NavSection items={moduleNav} label="Modules" pathname={pathname} />
        <NavSection items={toolNav} label="Tools" pathname={pathname} />
        <NavSection items={systemNav} label="System" pathname={pathname} />
      </SidebarContent>

      <ClientOnly fallback={null}>
        <UserFooter />
      </ClientOnly>

      <SidebarRail />
    </Sidebar>
  );
}

/* ------------------------------------------------------------------ */
/*  Top header                                                         */
/* ------------------------------------------------------------------ */

function AppHeader() {
  const { user, signOut } = useMC();
  const handleSignOut = () => {
    void signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <SearchDialog
            trigger={
              <>
                <Button
                  variant="ghost"
                  className="hidden h-8 w-56 justify-start px-3 text-muted-foreground hover:bg-muted/50 sm:flex gap-2"
                  aria-label="Open Mission Control search"
                >
                  <Search className="size-4" />
                  <span className="text-sm text-muted-foreground/60">
                    Search…
                  </span>
                  <kbd className="pointer-events-none ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 sm:hidden"
                  aria-label="Open Mission Control search"
                >
                  <Search className="size-4" />
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
                aria-label="Change language"
                className="size-8 hidden sm:inline-flex"
              >
                <Languages className="size-4" />
              </Button>
            }
          />
          <ActivityDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open activity"
                className="size-8 hidden sm:inline-flex"
              >
                <Activity className="size-4" />
              </Button>
            }
          />
          <NotificationDropdown
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open notifications"
                className="relative size-8"
              >
                <Bell className="size-4" />
                <span className="bg-rose-500 absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2 ring-background" />
              </Button>
            }
          />
          <ProfileDropdown
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open profile menu"
                className="size-8"
              >
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
            menuItems={adminProfileMenuItems}
            onSignOut={signOut}
          />
          <Button
            variant="ghost"
            size="sm"
            data-testid="auth-signout"
            className="h-8 px-2 text-xs hidden md:inline-flex"
            onClick={handleSignOut}
          >
            <LogOut className="mr-1 size-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Shell                                                              */
/* ------------------------------------------------------------------ */

function ApplicationShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ClientOnly
          fallback={<div className="h-12 border-b bg-background/95" />}
        >
          <AppHeader />
        </ClientOnly>
        <RouteMainViewTransitionBoundary className="flex-1 overflow-auto">
          {children}
        </RouteMainViewTransitionBoundary>
      </div>
    </SidebarProvider>
  );
}

export function MCShell({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: MCBootstrapState | null;
}) {
  const pathname = usePathname();
  const isPayloadAdmin =
    pathname === "/web-studio" || pathname.startsWith("/web-studio/");

  if (isPayloadAdmin) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <MCProvider initialState={initialState}>
        <ApplicationShell>{children}</ApplicationShell>
      </MCProvider>
    </ThemeProvider>
  );
}
