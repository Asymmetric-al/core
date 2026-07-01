"use client";

import { cn } from "@asym/ui/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { LucideIcon } from "lucide-react";

interface DashboardTileProps {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  className?: string;
}

export function DashboardTile({
  name,
  description,
  icon: Icon,
  href,
  className,
}: DashboardTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition-[border-color,box-shadow] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] hover:border-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-xl [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-zinc-200/40",
        className,
      )}
    >
      <div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm transition-[background-color,border-color] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] group-hover:bg-zinc-900 group-hover:border-zinc-900">
          <Icon className="size-6 text-zinc-900 transition-colors group-hover:text-white" />
        </div>
        <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-premium">
          {name}
        </h3>
        <p className="mt-2 text-xs font-medium leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-50 pt-4 transition-colors group-hover:border-zinc-100">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 transition-colors group-hover:text-zinc-900">
          Access Module
        </span>
        <ArrowUpRight className="size-4 text-zinc-300 transition-colors group-hover:text-zinc-900" />
      </div>

      {/* Subtle background glow on hover */}
      <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-zinc-100 opacity-0 blur-3xl transition-opacity group-hover:opacity-50" />
    </Link>
  );
}
