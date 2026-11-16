"use client";

import Link from "next/link";

import { cn } from "../../lib/utils";

import type { LucideIcon } from "lucide-react";

export type MobileTabItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** A small count (follow requests, overdue tasks). Hidden when 0. */
  count?: number;
};

const COLUMNS: Record<number, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

/**
 * Phone navigation: up to five labelled destinations fixed to the bottom of
 * the screen, where thumbs reach. Hidden from md up, where the app's own
 * header or sidebar takes over. Pages need bottom padding (`pb-24 md:pb-*`)
 * so content never sits under it.
 */
export function MobileTabBar({
  items,
  isActive,
  label,
}: {
  items: MobileTabItem[];
  isActive: (href: string) => boolean;
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className="safe-area-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden"
    >
      <ul className={cn("grid", COLUMNS[items.length] ?? "grid-cols-5")}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-xs font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  <Icon
                    aria-hidden
                    className="size-5"
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  {item.count ? (
                    <span className="absolute -top-1.5 -right-2.5 min-w-4 rounded-full bg-destructive px-1 text-center text-xs leading-4 font-semibold text-destructive-foreground">
                      {item.count > 9 ? "9+" : item.count}
                      <span className="sr-only"> new</span>
                    </span>
                  ) : null}
                </span>
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
