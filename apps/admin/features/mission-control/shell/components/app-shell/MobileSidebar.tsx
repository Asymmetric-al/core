"use client";
"use no memo";

import { useMC } from "@asym/lib/mission-control/context";
import {
  getMainNavItems,
  getToolsNavItems,
} from "@asym/lib/mission-control/nav";
import { resolveMissionControlHref } from "@asym/lib/mission-control/routes";
import { Button } from "@asym/ui/components/shadcn/button";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { Separator } from "@asym/ui/components/shadcn/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@asym/ui/components/shadcn/sheet";
import { cn } from "@asym/ui/lib/utils";
import { Menu, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useMemo, memo } from "react";

import { DynamicIcon } from "../icons";

import type { NavItem } from "@asym/config/navigation";

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  onNavigate: () => void;
}

const NavLink = memo(function NavLink({
  item,
  isActive,
  onNavigate,
}: NavLinkProps) {
  const href = resolveMissionControlHref(item.href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground",
      )}
    >
      <DynamicIcon name={item.icon} className="size-4 shrink-0" />
      <span>{item.title}</span>
    </Link>
  );
});

export const MobileSidebar = memo(function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useMC();

  const mainItems = useMemo(() => getMainNavItems(role), [role]);
  const toolsItems = useMemo(() => getToolsNavItems(role), [role]);

  const checkActive = useCallback(
    (href: string) => {
      const resolvedHref = resolveMissionControlHref(href);
      if (resolvedHref === "/") return pathname === "/";
      return pathname.startsWith(resolvedHref);
    },
    [pathname],
  );

  const handleNavigate = useCallback(() => setOpen(false), []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          className="size-9 lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="flex h-14 flex-row items-center border-b border-border px-4">
          <Link
            href={resolveMissionControlHref("/mc")}
            className="flex items-center gap-2"
            onClick={handleNavigate}
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="size-4" />
            </div>
            <SheetTitle className="font-semibold">Mission Control</SheetTitle>
          </Link>
        </SheetHeader>
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {mainItems.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                isActive={checkActive(item.href)}
                onNavigate={handleNavigate}
              />
            ))}
            {toolsItems.length > 0 && (
              <>
                <Separator className="my-2" />
                <span className="px-3 py-1 text-xs font-medium text-muted-foreground">
                  Tools
                </span>
                {toolsItems.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    isActive={checkActive(item.href)}
                    onNavigate={handleNavigate}
                  />
                ))}
              </>
            )}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
});
