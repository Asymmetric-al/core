"use client";

import Link from "next/link";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@asym/lib/utils";

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
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/40",
        className,
      )}
    >
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:border-zinc-900">
          <Icon className="h-6 w-6 text-zinc-900 transition-colors group-hover:text-white" />
        </div>
        <h3 className="mt-5 text-lg font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-premium">
          {name}
        </h3>
        <p className="mt-2 text-xs font-medium leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-50 pt-4 transition-colors group-hover:border-zinc-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 transition-colors group-hover:text-zinc-900">
          Access Module
        </span>
        <ArrowUpRight className="h-4 w-4 text-zinc-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-900" />
      </div>

      {/* Subtle background glow on hover */}
      <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-zinc-100 opacity-0 blur-3xl transition-opacity group-hover:opacity-50" />
    </Link>
  );
}
