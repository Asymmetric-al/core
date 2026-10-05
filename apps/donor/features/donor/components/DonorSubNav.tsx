"use client";

import { signOutClientSession } from "@asym/auth/client-session";
import { NavigationCommandPalette } from "@asym/ui/components/primitives/navigation-command-palette";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  LayoutDashboard,
  History,
  Rss,
  RefreshCw,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId, useRef, useTransition } from "react";

const navItems = [
  { label: "Overview", href: "/donor-dashboard", icon: LayoutDashboard },
  {
    label: "Donation History",
    href: "/donor-dashboard/history",
    icon: History,
  },
  { label: "Ministry Updates", href: "/donor-dashboard/feed", icon: Rss },
  {
    label: "Recurring Giving",
    href: "/donor-dashboard/pledges",
    icon: RefreshCw,
  },
  { label: "Wallet", href: "/donor-dashboard/wallet", icon: Wallet },
  { label: "Settings", href: "/donor-dashboard/settings", icon: Settings },
];

export function DonorSubNav() {
  const pathname = usePathname();
  const router = useRouter();
  const signOutLabelId = useId();
  const signOutInFlight = useRef(false);
  const [isSigningOut, startSigningOut] = useTransition();

  const handleSignOut = () => {
    if (signOutInFlight.current) return;
    signOutInFlight.current = true;
    startSigningOut(async () => {
      await signOutClientSession().finally(() => {
        signOutInFlight.current = false;
      });
    });
  };

  return (
    <nav
      aria-label="Donor workspace"
      className="border-b border-border bg-background sticky top-16 z-40"
    >
      <div className="container-responsive">
        <div className="flex items-center gap-1 overflow-x-auto py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <NavigationCommandPalette
            title="Donor navigation"
            triggerLabel="Search donor pages"
            items={navItems}
            onNavigate={(href) => router.push(href)}
          />
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/donor-dashboard" &&
                pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={buttonVariants({
                  variant: isActive ? "secondary" : "ghost",
                  size: "lg",
                })}
              >
                <Icon aria-hidden data-icon="inline-start" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            type="button"
            data-testid="auth-signout"
            onClick={handleSignOut}
            disabled={isSigningOut}
            focusableWhenDisabled={isSigningOut}
            aria-busy={isSigningOut}
            aria-labelledby={signOutLabelId}
            className="ml-auto"
          >
            <LogOut aria-hidden data-icon="inline-start" />
            <span id={signOutLabelId}>
              {isSigningOut ? "Signing out…" : "Sign out"}
            </span>
          </Button>
          <span role="status" className="sr-only">
            {isSigningOut ? "Signing out…" : ""}
          </span>
        </div>
      </div>
    </nav>
  );
}
