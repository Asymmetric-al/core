"use client";

import React from "react";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/lib/utils";
import { LucideIcon } from "lucide-react";

interface ImpactTileProps {
  title: string;
  value?: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  className?: string;
}

export function ImpactTile({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  className,
}: ImpactTileProps) {
  return (
    <Card
      className={cn(
        "border-zinc-100 shadow-sm hover:border-zinc-200 transition-all h-full bg-white overflow-hidden group rounded-xl",
        className,
      )}
    >
      <CardContent className="p-4 sm:p-5 text-left">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div
            className={cn(
              "p-1.5 sm:p-2 rounded-lg border shadow-sm transition-transform group-hover:scale-105",
              bgClass,
              colorClass,
              "border-current/10",
            )}
          >
            <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
        </div>
        <div>
          <h4 className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 sm:mb-1">
            {title}
          </h4>
          <p
            className={cn(
              "text-2xl sm:text-3xl font-bold tracking-tighter text-zinc-900",
            )}
          >
            {value || "---"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
