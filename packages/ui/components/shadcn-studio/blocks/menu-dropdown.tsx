"use client";

import { ChevronRightIcon, CircleSmallIcon } from "lucide-react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
} from "@asym/ui/components/shadcn/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { cn } from "@asym/ui/lib/utils";

import type { ReactElement, ReactNode } from "react";

export type NavigationItem = {
  title: string;
  href: string;
};

export type NavigationSection = {
  title: string;
  icon?: ReactNode;
} & (
  | {
      items: NavigationItem[];
      href?: never;
    }
  | {
      items?: never;
      href: string;
    }
);

type Props = {
  trigger: ReactElement;
  navigationData: NavigationSection[];
  align?: "center" | "end" | "start";
};

/**
 * The expandable section is toggled by a regular menu item rather than a
 * CollapsibleTrigger render composition: Base UI's trigger would overwrite
 * the item's `menuitem` role and roving tabIndex with button semantics.
 */
function CollapsibleMenuSection({ navItem }: { navItem: NavigationSection }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      render={<DropdownMenuGroup />}
    >
      <DropdownMenuItem
        closeOnClick={false}
        aria-expanded={open}
        className="justify-between"
        onClick={() => setOpen((previous) => !previous)}
      >
        {navItem.icon}
        <span className="flex-1">{navItem.title}</span>
        <ChevronRightIcon
          className={cn("shrink-0 transition-transform", open && "rotate-90")}
        />
      </DropdownMenuItem>
      <CollapsibleContent className="pl-2">
        {navItem.items?.map((item) => (
          <DropdownMenuItem key={item.title} render={<a href={item.href} />}>
            <CircleSmallIcon />
            <span>{item.title}</span>
          </DropdownMenuItem>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

const MenuDropdown = ({ trigger, navigationData, align = "start" }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent className="w-56" align={align}>
        {navigationData.map((navItem) => {
          if (navItem.href) {
            return (
              <DropdownMenuItem
                key={navItem.title}
                render={<a href={navItem.href} />}
              >
                {navItem.icon}
                {navItem.title}
              </DropdownMenuItem>
            );
          }

          return (
            <CollapsibleMenuSection key={navItem.title} navItem={navItem} />
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MenuDropdown;
