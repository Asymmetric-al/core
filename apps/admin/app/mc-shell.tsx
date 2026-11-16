"use client";

import {
  findNavDestination,
  getNavItemsByRole,
  getNavSectionsByRole,
  type NavItem,
  type Role,
} from "@asym/config/navigation";
import { MCProvider, useMC } from "@asym/lib/mission-control/context";
import { ROLE_LABELS } from "@asym/lib/mission-control/roles";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@asym/ui/components/shadcn/breadcrumb";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@asym/ui/components/shadcn/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { AppIcon } from "@asym/ui/components/shadcn/icons/AppIcon";
import { Separator } from "@asym/ui/components/shadcn/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@asym/ui/components/shadcn/sidebar";
import ProfileDropdown, {
  initialsOf,
  type ProfileDropdownMenuItem,
} from "@asym/ui/components/shadcn-studio/blocks/dropdown-profile";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import { ChevronRight, Info, Shield, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { EveGlobalPanel } from "./eve/global-panel";

import type { MCBootstrapState } from "@asym/lib/mission-control/bootstrap";
import type { ReactNode } from "react";

import {
  ShellNavigationProvider,
  useShellNavigation,
} from "@/components/studio/shell-navigation-guard";
import { MissionControlNavigationSearch } from "@/features/mission-control/components/navigation-search";

type NavDestination = NonNullable<ReturnType<typeof findNavDestination>>;

const ABOUT_MENU_ITEM: ProfileDropdownMenuItem = {
  label: "About",
  href: "/help/about",
  icon: Info,
};

function profileMenuItems(role: Role): ProfileDropdownMenuItem[] {
  // Mirror the sidebar: the shortcuts are its Administration pages.
  const administration = getNavItemsByRole(role).find(
    (item) => item.id === "admin",
  );
  if (!administration) return [ABOUT_MENU_ITEM];
  const staffDirectory = administration.items?.find(
    (item) => item.id === "admin-teams",
  );
  return [
    { label: "Administration", href: "/admin", icon: Shield },
    ...(staffDirectory
      ? [
          {
            label: staffDirectory.title,
            href: staffDirectory.href,
            icon: Users,
          },
        ]
      : []),
    ABOUT_MENU_ITEM,
  ];
}

function NavIcon({ item, active }: { item: NavItem; active: boolean }) {
  return <AppIcon icon={item.icon} animated={active} />;
}

function useCloseMobileSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  return () => {
    if (isMobile) setOpenMobile(false);
  };
}

function NavEntry({
  item,
  current,
}: {
  item: NavItem;
  current: NavDestination | null;
}) {
  const { state, isMobile } = useSidebar();
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const inModule = current?.item.id === item.id;
  const open = userOpen ?? inModule;
  const subItems = item.items ?? [];
  const closeMobileSidebar = useCloseMobileSidebar();

  if (subItems.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={item.href} onClick={closeMobileSidebar} />}
          isActive={inModule}
          aria-current={inModule ? "page" : undefined}
          tooltip={item.title}
        >
          <NavIcon item={item} active={inModule} />
          <span className="truncate">{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                isActive={inModule}
                tooltip={item.title}
                aria-label={`${item.title} pages`}
              >
                <NavIcon item={item} active={inModule} />
                <span className="truncate">{item.title}</span>
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link href={item.href} />}
                aria-current={
                  inModule && (!current?.sub || current.sub.href === item.href)
                    ? "page"
                    : undefined
                }
              >
                {item.title}
              </DropdownMenuItem>
              {subItems
                .filter((sub) => sub.href !== item.href)
                .map((sub) => (
                  <DropdownMenuItem
                    key={sub.id}
                    render={<Link href={sub.href} />}
                    aria-current={
                      current?.sub?.id === sub.id ? "page" : undefined
                    }
                  >
                    {sub.title}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setUserOpen}
      // The collapsible root IS the list item: a wrapper div inside the menu
      // <ul> breaks list semantics (axe list).
      render={<SidebarMenuItem />}
    >
      <SidebarMenuButton
        render={<Link href={item.href} onClick={closeMobileSidebar} />}
        isActive={inModule}
        tooltip={item.title}
      >
        <NavIcon item={item} active={inModule} />
        <span className="truncate">{item.title}</span>
      </SidebarMenuButton>
      <CollapsibleTrigger
        render={
          <SidebarMenuAction
            aria-label={`${open ? "Hide" : "Show"} ${item.title} pages`}
          >
            <ChevronRight className="transition-transform duration-200 in-data-panel-open:rotate-90" />
          </SidebarMenuAction>
        }
      />
      <CollapsibleContent>
        <SidebarMenuSub aria-label={`${item.title} pages`}>
          {subItems.map((sub) => {
            const subActive = current?.sub?.id === sub.id;
            return (
              <SidebarMenuSubItem key={sub.id}>
                <SidebarMenuSubButton
                  render={<Link href={sub.href} onClick={closeMobileSidebar} />}
                  isActive={subActive}
                  aria-current={subActive ? "page" : undefined}
                >
                  <span className="truncate">{sub.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

function organizationInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "M";
}

function AppSidebar() {
  const pathname = usePathname();
  const { role, tenant } = useMC();
  const current = findNavDestination(pathname);
  const tenantName = tenant?.name?.trim();
  const organization = tenantName || "Mission Control";
  const closeMobileSidebar = useCloseMobileSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" onClick={closeMobileSidebar} />}
              tooltip={organization}
            >
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
              >
                {organizationInitial(organization)}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold leading-tight">
                  {organization}
                </span>
                {/* Without a tenant name the title already says it. */}
                {tenantName && tenantName !== "Mission Control" ? (
                  <span className="truncate text-xs leading-tight text-muted-foreground">
                    Mission Control
                  </span>
                ) : null}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {getNavSectionsByRole(role).map((group) => (
          <SidebarGroup key={group.section} className="p-0">
            {group.label ? (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu
                className="gap-0.5"
                aria-label={group.label ?? "Home"}
              >
                {group.items.map((item) => (
                  <NavEntry key={item.id} item={item} current={current} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

const UNLISTED_PAGES: Array<{ href: string; title: string }> = [
  { href: "/help/about", title: "About" },
  { href: "/sign", title: "Sign Studio" },
];

function HeaderBreadcrumbs() {
  const pathname = usePathname();
  const current = findNavDestination(pathname);
  if (!current) {
    const page = UNLISTED_PAGES.find(
      (entry) =>
        pathname === entry.href || pathname.startsWith(`${entry.href}/`),
    );
    if (!page) return null;
    return (
      <div className="min-w-0">
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage>
                <span className="block truncate">{page.title}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  }

  const { item, sub } = current;
  const showSub = sub !== null && sub.href !== item.href;
  const moduleIsPage = !showSub && pathname === item.href;
  const subIsPage = showSub && pathname === sub.href;

  return (
    <div className="min-w-0">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className={cn("min-w-0", showSub && "max-sm:hidden")}>
            {moduleIsPage ? (
              <BreadcrumbPage>
                <span className="block truncate">{item.title}</span>
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link href={item.href} />}>
                <span className="block truncate">{item.title}</span>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {showSub ? (
            <>
              <BreadcrumbSeparator className="max-sm:hidden" />
              <BreadcrumbItem className="min-w-0">
                {subIsPage ? (
                  <BreadcrumbPage>
                    <span className="block truncate">{sub.title}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={sub.href} />}>
                    <span className="block truncate">{sub.title}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

function AppHeader() {
  const { user, signOut, role, tenant } = useMC();
  const router = useRouter();
  const roleLabel = ROLE_LABELS[role];
  const { requestAction } = useShellNavigation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-12 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 h-4" />
        <HeaderBreadcrumbs />
        <div className="ml-auto flex items-center gap-1">
          <MissionControlNavigationSearch
            role={role}
            onNavigate={(href) => requestAction(() => router.push(href))}
          />
          <EveGlobalPanel placement="header" />
          <ProfileDropdown
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open profile menu"
              >
                <Avatar size="sm">
                  {user?.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} />
                  ) : null}
                  <AvatarFallback>
                    {user?.name || user?.email ? (
                      initialsOf(user.name || user.email)
                    ) : (
                      <UserRound aria-hidden="true" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
            user={user}
            detail={[roleLabel, tenant?.name].filter(Boolean).join(" · ")}
            menuItems={profileMenuItems(role)}
            onSignOut={() => {
              requestAction(() => {
                void signOut();
              });
            }}
          />
        </div>
      </div>
    </header>
  );
}

function ApplicationShell({ children }: { children: ReactNode }) {
  const { fullscreen } = useShellNavigation();
  return (
    <SidebarProvider>
      {!fullscreen ? <AppSidebar /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        {!fullscreen ? (
          <AppHeader />
        ) : (
          <div inert aria-hidden="true" className="h-12 border-b" />
        )}
        <RouteMainViewTransitionBoundary className="flex min-w-0 flex-1 flex-col">
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
    <MCProvider initialState={initialState}>
      {isPayloadAdmin ? (
        <>
          {children}
          {/* Web Studio has no app header, so Eve floats there. */}
          <EveGlobalPanel placement="floating" />
        </>
      ) : (
        <ShellNavigationProvider>
          <ApplicationShell>{children}</ApplicationShell>
        </ShellNavigationProvider>
      )}
    </MCProvider>
  );
}
