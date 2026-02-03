"use client";
"use no memo";

import { useState, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@asym/ui/lib/utils";
import { useMC } from "@asym/lib/mission-control/context";
import {
  getMainNavItems,
  getToolsNavItems,
  type NavItem,
} from "@asym/config/navigation";
import { Menu, LayoutDashboard } from "lucide-react";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@asym/ui/components/shadcn/sheet";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { Separator } from "@asym/ui/components/shadcn/separator";

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
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
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
      if (href === "/mc") return pathname === "/mc" || pathname === "/mc/";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const handleNavigate = useCallback(() => setOpen(false), []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="flex h-14 flex-row items-center border-b border-border px-4">
          <Link
            href="/mc"
            className="flex items-center gap-2"
            onClick={handleNavigate}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
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
