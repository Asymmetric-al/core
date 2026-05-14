"use client";

import { signOutClientSession } from "@asym/auth/client-session";
import { cn } from "@asym/ui/lib/utils";
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
import { usePathname } from "next/navigation";
import { useTransition } from "react";

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
  const [isSigningOut, startSigningOut] = useTransition();

  const handleSignOut = () => {
    startSigningOut(() => {
      void signOutClientSession();
    });
  };

  return (
    <nav className="border-b border-zinc-200 bg-white sticky top-16 z-40">
      <div className="container-responsive">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
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
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all rounded-lg",
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            data-testid="auth-signout"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="ml-auto flex items-center gap-2 rounded-lg px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-60"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">
              {isSigningOut ? "Signing out…" : "Sign out"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
