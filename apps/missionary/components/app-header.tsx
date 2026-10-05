"use client";

import { signOutClientSession } from "@asym/auth/client-session";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { SidebarTrigger } from "@asym/ui/components/shadcn/sidebar";
import { LifeBuoy, LogOut } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useId, useTransition } from "react";

interface AppHeaderProps {
  title?: string;
  navigation?: ReactNode;
}

export function AppHeader({ title, navigation }: AppHeaderProps) {
  const signOutLabelId = useId();
  const [isSigningOut, startSigningOut] = useTransition();

  const handleSignOut = () => {
    startSigningOut(async () => {
      await signOutClientSession();
    });
  };

  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 size-8 touch-target flex items-center justify-center [&_svg]:!size-4" />
        <span className="hidden sm:flex">
          <Separator orientation="vertical" className="h-4" />
        </span>
        {title && (
          <h1 className="text-sm font-semibold tracking-tight hidden sm:block truncate max-w-50 lg:max-w-none">
            {title}
          </h1>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {navigation}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="lg">
                <LifeBuoy aria-hidden data-icon="inline-start" />
                <span className="sr-only">Help</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/help/about" />}>
                About
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          data-testid="auth-signout"
          onClick={handleSignOut}
          disabled={isSigningOut}
          focusableWhenDisabled={isSigningOut}
          aria-labelledby={signOutLabelId}
        >
          <LogOut aria-hidden data-icon="inline-start" />
          <span id={signOutLabelId}>
            {isSigningOut ? "Signing out…" : "Sign out"}
          </span>
        </Button>
      </div>
    </header>
  );
}
