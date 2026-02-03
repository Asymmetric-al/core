"use client";

import { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@asym/ui/lib/utils";
import { useMC } from "../context";
import {
  getMainNavItems,
  getToolsNavItems,
  type NavItem,
} from "@asym/config/navigation";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@asym/ui/components/shadcn/tooltip";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import { AppIcon } from "@asym/ui/components/shadcn/icons/AppIcon";

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

const NavLink = memo(function NavLink({
  item,
  isActive,
  collapsed,
}: NavLinkProps) {
  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      <AppIcon
        icon={item.icon}
        animated={isActive}
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={8}
          className="text-xs font-medium"
        >
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
});

const NavSection = memo(function NavSection({
  items,
  label,
  collapsed,
  checkActive,
}: {
  items: NavItem[];
  label?: string;
  collapsed: boolean;
  checkActive: (href: string) => boolean;
}) {
  if (items.length === 0) return null;

  return (
    <>
      {label && !collapsed && (
        <span className="mb-1.5 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {label}
        </span>
      )}
      {label && collapsed && <div className="my-2 mx-2 h-px bg-border" />}
      {items.map((item) => (
        <NavLink
          key={item.id}
          item={item}
          isActive={checkActive(item.href)}
          collapsed={collapsed}
        />
      ))}
    </>
  );
});

const SidebarHeader = memo(function SidebarHeader({
  collapsed,
}: {
  collapsed: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-14 items-center border-b border-border",
        collapsed ? "justify-center px-2" : "justify-between px-4",
      )}
    >
      {!collapsed ? (
        <Link href="/mc" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Mission Control
          </span>
        </Link>
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
          <LayoutDashboard className="h-4 w-4" />
        </div>
      )}
    </div>
  );
});

const CollapseButton = memo(function CollapseButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-border p-2">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full justify-center text-muted-foreground hover:text-foreground",
          !collapsed && "justify-start px-3",
        )}
        onClick={onToggle}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <>
            <ChevronLeft className="h-4 w-4 mr-2" />
            <span className="text-xs font-medium">Collapse</span>
          </>
        )}
      </Button>
    </div>
  );
});

export const SidebarNav = memo(function SidebarNav() {
  const pathname = usePathname();
  const { role, sidebarCollapsed, setSidebarCollapsed } = useMC();

  const mainItems = useMemo(() => getMainNavItems(role), [role]);
  const toolsItems = useMemo(() => getToolsNavItems(role), [role]);

  const checkActive = useCallback(
    (href: string) => {
      if (href === "/mc") return pathname === "/mc" || pathname === "/mc/";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const handleToggle = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-background transition-all duration-200 ease-out",
          sidebarCollapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        <SidebarHeader collapsed={sidebarCollapsed} />
        <ScrollArea className="flex-1 px-2">
          <nav className="flex flex-col gap-0.5 py-2">
            <NavSection
              items={mainItems}
              collapsed={sidebarCollapsed}
              checkActive={checkActive}
            />
            <NavSection
              items={toolsItems}
              label="Tools"
              collapsed={sidebarCollapsed}
              checkActive={checkActive}
            />
          </nav>
        </ScrollArea>
        <CollapseButton collapsed={sidebarCollapsed} onToggle={handleToggle} />
      </aside>
    </TooltipProvider>
  );
});
