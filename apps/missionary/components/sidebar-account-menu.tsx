"use client";

// Adapted from ReUI public examples c-sidebar-1 (sidebar account menu) and
// c-skeleton-1 (loading row), MIT-licensed, rebuilt on Core's base-maia
// shadcn primitives.

import { signOutClientSession } from "@asym/auth/client-session";
import { useAuth } from "@asym/lib/hooks";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@asym/ui/components/shadcn/sidebar";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { ChevronsUpDown, Info, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";

import type { Profile } from "@asym/database/types";

/** Signed-in identity and account actions for the sidebar footer. */
export function SidebarAccountMenu({ roleLabel }: { roleLabel: string }) {
  const { profile, user, loading } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const [isSigningOut, startSigningOut] = useTransition();

  if (loading) {
    return (
      <div
        className="flex h-12 items-center gap-2 px-2 group-data-[collapsible=icon]:px-0"
        aria-hidden
      >
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  const name = displayNameFor(profile, user?.email ?? null);
  const secondary = profile?.email ?? user?.email ?? roleLabel;
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                aria-label={`Account menu for ${name}`}
                data-testid="account-menu"
              >
                <Avatar className="size-8">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt="" />
                  ) : null}
                  <AvatarFallback>{initialsFor(name)}</AvatarFallback>
                </Avatar>
                <span className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">{name}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {secondary}
                  </span>
                </span>
                <ChevronsUpDown className="ml-auto opacity-60" aria-hidden />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex min-w-48 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">
                    {name}
                  </span>
                  <span className="truncate text-xs font-normal">
                    {roleLabel}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href="/settings" />}
                onClick={closeOnMobile}
              >
                <Settings aria-hidden />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/help/about" />}
                onClick={closeOnMobile}
              >
                <Info aria-hidden />
                About this app
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                data-testid="auth-signout"
                disabled={isSigningOut}
                onClick={() => {
                  startSigningOut(async () => {
                    await signOutClientSession();
                  });
                }}
              >
                <LogOut aria-hidden />
                {isSigningOut ? "Signing out…" : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function displayNameFor(profile: Profile | null, email: string | null) {
  const display = profile?.display_name?.trim();
  if (display) return display;
  const full = [profile?.first_name, profile?.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  if (full) return full;
  return email ?? "Your account";
}

function initialsFor(name: string) {
  const letters = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return letters || "?";
}
