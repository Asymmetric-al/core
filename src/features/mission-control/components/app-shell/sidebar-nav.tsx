"use client";
"use no memo";

import { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@asym/lib/utils";
import { useMC } from "@/lib/mission-control/context";
import {
  getMainNavItems,
  getToolsNavItems,
  type NavItem,
} from "@asym/config/navigation";
import { ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@asym/ui/components/shadcn/tooltip";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";

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
          ? "bg-accent text-foreground font-semibold"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      <item.icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground/70 group-hover:text-foreground",
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
        <span className="mb-2 mt-6 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
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
        "flex h-16 items-center",
        collapsed ? "justify-center px-2" : "justify-between px-4",
      )}
    >
      {!collapsed ? (
        <Link href="/mc" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/5">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Mission Control
          </span>
        </Link>
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
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
    <div className="border-t border-border p-3">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl h-9",
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
          "flex flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-all duration-300 ease-in-out",
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
