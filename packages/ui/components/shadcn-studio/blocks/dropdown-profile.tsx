"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@asym/ui/components/shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";

import type { LucideIcon } from "lucide-react";
import type { ReactElement } from "react";

export type ProfileDropdownMenuItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

type Props = {
  trigger: ReactElement;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
  user?: {
    name?: string;
    email?: string;
    avatarUrl?: string | null;
  } | null;
  menuItems?: readonly ProfileDropdownMenuItem[];
  onSignOut?: () => void;
};

const ProfileDropdown = ({
  trigger,
  defaultOpen,
  align = "end",
  user,
  menuItems = [],
  onSignOut,
}: Props) => {
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent className="w-64" align={align || "end"}>
        <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2 font-normal">
          <div className="relative">
            <Avatar className="size-9">
              <AvatarImage
                src={
                  user?.avatarUrl ||
                  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                }
                alt={user?.name || "User"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2" />
          </div>
          <div className="flex flex-1 flex-col items-start overflow-hidden">
            <span className="text-foreground text-sm font-semibold truncate w-full">
              {user?.name || "User"}
            </span>
            <span className="text-muted-foreground text-xs truncate w-full">
              {user?.email || "user@example.com"}
            </span>
          </div>
        </DropdownMenuLabel>

        {menuItems.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <DropdownMenuItem
                    key={`${item.href}:${item.label}`}
                    render={<Link href={item.href} />}
                    className="px-3 py-1.5 text-sm cursor-pointer"
                  >
                    {Icon && <Icon className="text-muted-foreground size-4" />}
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="px-3 py-1.5 text-sm text-destructive focus:text-destructive cursor-pointer"
          onClick={onSignOut}
        >
          <LogOutIcon className="size-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
