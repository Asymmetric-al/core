"use client";

import { useMemo } from "react";
import { cn } from "@asym/ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../avatar";
import type { AvatarCellProps } from "./types";

const sizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
  }
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

export function AvatarCell<TData>({
  value,
  className,
  name,
  fallback,
  size = "md",
  showName = false,
  subtitle,
}: AvatarCellProps<TData>) {
  const initials = useMemo(() => {
    return fallback || getInitials(name);
  }, [fallback, name]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className={cn(sizeClasses[size], "shrink-0")}>
        {value && <AvatarImage src={value} alt={name ?? "Avatar"} />}
        <AvatarFallback className={textSizeClasses[size]}>
          {initials}
        </AvatarFallback>
      </Avatar>
      {showName && name && (
        <div className="flex flex-col min-w-0">
          <span className={cn("truncate font-medium", textSizeClasses[size])}>
            {name}
          </span>
          {subtitle && (
            <span className="text-xs text-muted-foreground truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
