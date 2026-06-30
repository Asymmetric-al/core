"use client";

import { signOutClientSession } from "@asym/auth/client-session";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { SidebarTrigger } from "@asym/ui/components/shadcn/sidebar";
import { Moon, Sun, Bell, LifeBuoy, LogOut } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useTransition } from "react";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { setTheme } = useTheme();
  const [isSigningOut, startSigningOut] = useTransition();

  const handleSignOut = () => {
    startSigningOut(() => {
      void signOutClientSession();
    });
  };

  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 size-8 touch-target flex items-center justify-center [&_svg]:!size-4" />
        <Separator orientation="vertical" className="h-4 hidden sm:block" />
        {title && (
          <h1 className="text-sm font-semibold tracking-tight hidden sm:block truncate max-w-[200px] lg:max-w-none">
            {title}
          </h1>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8 touch-target"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-zinc-900 border border-white" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 touch-target">
              <LifeBuoy className="size-4" />
              <span className="sr-only">Help</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/help/about">About</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 touch-target">
              <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          data-testid="auth-signout"
          className="h-8 px-2 text-xs"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="mr-1 size-3.5" />
          {isSigningOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </header>
  );
}
