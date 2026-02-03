"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import {
  UserIcon,
  SettingsIcon,
  UsersIcon,
  SquarePenIcon,
  CirclePlusIcon,
  LogOutIcon,
} from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@asym/ui/components/shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";

type Props = {
  trigger: ReactNode;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
  user?: {
    name?: string;
    email?: string;
    avatarUrl?: string | null;
  } | null;
  onSignOut?: () => void;
};

const ProfileDropdown = ({
  trigger,
  defaultOpen,
  align = "end",
  user,
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
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
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

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="px-3 py-1.5 text-sm cursor-pointer"
          >
            <Link href="/mc/admin">
              <UserIcon className="text-muted-foreground size-4" />
              <span>My account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="px-3 py-1.5 text-sm cursor-pointer"
          >
            <Link href="/mc/admin">
              <SettingsIcon className="text-muted-foreground size-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="px-3 py-1.5 text-sm cursor-pointer"
          >
            <Link href="/mc/admin/teams">
              <UsersIcon className="text-muted-foreground size-4" />
              <span>Manage team</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="px-3 py-1.5 text-sm cursor-pointer"
          >
            <Link href="/mc/admin">
              <SquarePenIcon className="text-muted-foreground size-4" />
              <span>Customization</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="px-3 py-1.5 text-sm cursor-pointer"
          >
            <Link href="/mc/admin/teams">
              <CirclePlusIcon className="text-muted-foreground size-4" />
              <span>Add team account</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

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
