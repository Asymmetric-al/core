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
import LanguageDropdown from "@asym/ui/components/shadcn-studio/blocks/dropdown-language";
import NotificationDropdown from "@asym/ui/components/shadcn-studio/blocks/dropdown-notification";
import ProfileDropdown, {
  type ProfileDropdownMenuItem,
} from "@asym/ui/components/shadcn-studio/blocks/dropdown-profile";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";
import { ThemeProvider } from "@asym/ui/lib/theme-provider";
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
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { EveGlobalPanel } from "./eve/global-panel";

import type { MCBootstrapState } from "@asym/lib/mission-control/bootstrap";
import type { ReactNode } from "react";

import { ClientOnly } from "@/features/mission-control/components/client-only";
import { MissionControlNavigationSearch } from "@/features/mission-control/components/navigation-search";

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
        <SidebarGroupLabel className="mb-1 px-2 text-xs font-medium text-sidebar-foreground/70">
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
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={item.title}
                          className={cn(
                            "h-9 transition-colors",
                            isActive
                              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        >
                          <AppIcon
                            icon={item.icon}
                            animated={isActive}
                            className={cn(
                              "size-4 shrink-0",
                              isActive
                                ? "text-sidebar-accent-foreground"
                                : "text-muted-foreground",
                            )}
                          />
                          <span className="truncate text-sm">{item.title}</span>
                          <ChevronRight className="ml-auto size-3.5 text-muted-foreground transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      }
                    />
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((sub) => {
                          const subActive = pathname === sub.href;
                          return (
                            <SidebarMenuSubItem key={sub.href}>
                              <SidebarMenuSubButton
                                render={<Link href={sub.href} />}
                                isActive={subActive}
                                className={cn(
                                  "transition-colors",
                                  subActive
                                    ? "font-medium text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground",
                                )}
                              >
                                <span className="truncate text-sm">
                                  {sub.title}
                                </span>
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
                  render={
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5"
                    />
                  }
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "h-9 transition-colors",
                    isActive
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <AppIcon
                    icon={item.icon}
                    animated={isActive}
                    className={cn(
                      "size-4 shrink-0",
                      isActive
                        ? "text-sidebar-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="truncate text-sm">{item.title}</span>
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
    <SidebarFooter className="border-t border-sidebar-border p-3">
      <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
        <Avatar className="size-8 rounded-lg">
          <AvatarImage
            src={
              user?.avatarUrl ||
              "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
            }
          />
          <AvatarFallback className="rounded-lg bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
            {user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-medium leading-tight text-sidebar-foreground">
            {user?.name || "User Name"}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            Missionary
          </span>
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
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="p-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
            G
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-tight tracking-tight text-sidebar-foreground">
              Give Hope
            </span>
            <span className="text-xs leading-tight text-muted-foreground">
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
  const { user, signOut, role } = useMC();
  const router = useRouter();
  const handleNavigate = router.push;
  const handleSignOut = () => {
    void signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <MissionControlNavigationSearch
            role={role}
            onNavigate={handleNavigate}
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
                <span className="bg-destructive absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2 ring-background" />
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
                  <AvatarFallback className="text-xs rounded-lg font-semibold">
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
            className="px-2 text-xs hidden md:inline-flex"
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

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <MCProvider initialState={initialState}>
        {isPayloadAdmin ? (
          children
        ) : (
          <ApplicationShell>{children}</ApplicationShell>
        )}
        <EveGlobalPanel />
      </MCProvider>
    </ThemeProvider>
  );
}
