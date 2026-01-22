"use client";
"use no memo";

import { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@asym/ui/lib/utils";
import { useMC } from "@/lib/mission-control/context";
import { getMainNavItems, getToolsNavItems } from "@/lib/mission-control/nav";
import {
  DynamicIcon,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "../icons";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@asym/ui/components/shadcn/tooltip";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import type { NavItem } from "@asym/config/navigation";

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
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-slate-100 text-slate-900 font-semibold"
          : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-900",
        collapsed && "justify-center px-2",
      )}
    >
      <DynamicIcon
        name={item.icon}
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive
            ? "text-slate-900"
            : "text-slate-400 group-hover:text-slate-900",
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
        <span className="mb-2 mt-6 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400/80">
          {label}
        </span>
      )}
      {label && collapsed && <div className="my-2 mx-2 h-px bg-slate-100" />}
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
        "flex h-16 items-center",
        collapsed ? "justify-center px-2" : "justify-between px-4",
      )}
    >
      {!collapsed ? (
        <Link href="/mc" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/5">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Mission Control
          </span>
        </Link>
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <LayoutDashboard className="h-5 w-5" />
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
    <div className="border-t border-slate-100 p-3">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-xl h-9",
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
          "flex flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-[70px]" : "w-[260px]",
        )}
      >
        <SidebarHeader collapsed={sidebarCollapsed} />
        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-1 py-4">
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
