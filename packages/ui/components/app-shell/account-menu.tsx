"use client";

import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import { Button } from "../shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";

import type { LucideIcon } from "lucide-react";

export type AccountMenuLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Opens outside the app (another site), in a new tab. */
  external?: boolean;
};

export type AccountMenuProps = {
  /** Display name; falls back to the email while loading. */
  name: string;
  /** Second line under the name: email or role. */
  detail?: string;
  avatarUrl?: string | null;
  links: AccountMenuLink[];
  onSignOut: () => void;
  signingOut?: boolean;
  /** Show the name beside the avatar on wide screens. */
  showName?: boolean;
  className?: string;
};

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0], parts.at(-1)] : parts;
  return (
    letters
      .map((part) => part?.charAt(0) ?? "")
      .join("")
      .toUpperCase() || "··"
  );
}

/**
 * The signed-in person's menu: who they are, where their account settings
 * live, and the one place to sign out.
 */
export function AccountMenu({
  name,
  detail,
  avatarUrl,
  links,
  onSignOut,
  signingOut = false,
  showName = true,
  className,
}: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={className}
            aria-label={`Account menu for ${name}`}
            data-testid="account-menu"
          >
            <Avatar className="size-8">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarFallback>{initialsFor(name)}</AvatarFallback>
            </Avatar>
            {showName ? (
              <span className="hidden max-w-40 truncate text-sm font-medium lg:inline">
                {name}
              </span>
            ) : null}
            <ChevronDown
              aria-hidden
              className="hidden size-4 text-muted-foreground lg:block"
            />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate text-sm font-medium text-foreground">
              {name}
            </span>
            {detail ? (
              <span className="block truncate text-xs font-normal">
                {detail}
              </span>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <DropdownMenuItem
                key={link.href}
                render={
                  link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ) : (
                    <Link href={link.href} />
                  )
                }
              >
                <Icon aria-hidden />
                {link.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            data-testid="auth-signout"
            disabled={signingOut}
            onClick={onSignOut}
          >
            <LogOut aria-hidden />
            {signingOut ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
