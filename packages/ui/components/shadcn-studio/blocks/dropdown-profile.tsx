"use client";

import { LogOutIcon, UserRound } from "lucide-react";
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
  /** A short line under the email, such as the role and organization. */
  detail?: string;
  menuItems?: readonly ProfileDropdownMenuItem[];
  onSignOut?: () => void;
};

/** Up to two initials from a name (or an email's local part). */
export function initialsOf(nameOrEmail: string) {
  const words = nameOrEmail
    .split("@")[0]!
    .split(/[\s._-]+/)
    .filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  return initials;
}

const ProfileDropdown = ({
  trigger,
  defaultOpen,
  align = "end",
  user,
  detail,
  menuItems = [],
  onSignOut,
}: Props) => {
  // With no name or email, the role and organisation say whose menu this is.
  const name = user?.name?.trim() || user?.email || detail || "Your account";
  const initials = initialsOf(user?.name?.trim() || user?.email || "");

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent className="w-64" align={align}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2 font-normal">
            <Avatar className="size-9">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt="" />
              ) : null}
              {/* Same fallback as the header trigger: initials, else a person. */}
              <AvatarFallback>
                {initials || <UserRound aria-hidden="true" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <span className="w-full truncate text-sm font-medium text-foreground">
                {name}
              </span>
              {user?.email && user.email !== name ? (
                <span className="w-full truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              ) : null}
              {detail && detail !== name ? (
                <span className="w-full truncate text-xs text-muted-foreground">
                  {detail}
                </span>
              ) : null}
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
                    >
                      {Icon && (
                        <Icon className="text-muted-foreground size-4" />
                      )}
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem data-testid="auth-signout" onClick={onSignOut}>
          <LogOutIcon className="text-muted-foreground size-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
