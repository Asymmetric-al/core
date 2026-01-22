"use client";

import { memo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityItemProps {
  initials: string;
  name: string;
  action: string;
  detail: string;
  time: string;
  colorVariant: "emerald" | "blue" | "violet" | "amber" | "rose";
  onClick?: () => void;
}

const colorClasses = {
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  violet: "bg-violet-50 text-violet-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
} as const;

export const ActivityItem = memo(function ActivityItem({
  initials,
  name,
  action,
  detail,
  time,
  colorVariant,
  onClick,
}: ActivityItemProps) {
  return (
    <div
      className="group flex cursor-pointer items-center gap-3 px-6 py-2.5 transition-colors hover:bg-zinc-50"
      onClick={onClick}
    >
      <Avatar className="size-8 border border-zinc-200">
        <AvatarFallback
          className={cn("text-xs font-medium", colorClasses[colorVariant])}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-zinc-900">{action}</p>
          <Badge
            variant="secondary"
            className="h-4 bg-zinc-100 border-0 px-1.5 text-[10px] font-medium text-zinc-600"
          >
            {time}
          </Badge>
        </div>
        <p className="text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">{detail}</span>
          {name && <span> from {name}</span>}
        </p>
      </div>
      <ChevronRightIcon className="size-4 text-zinc-400 transition-colors group-hover:text-zinc-600" />
    </div>
  );
});
