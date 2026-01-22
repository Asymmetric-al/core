"use client";

import { cn } from "@asym/lib/utils";
import { brandConfig } from "@asym/config/site";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "muted";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 sm:h-12 sm:w-12 text-sm",
  lg: "h-14 w-14 sm:h-16 sm:w-16 text-base",
};

export function BrandLogo({
  size = "md",
  variant = "default",
  className,
}: BrandLogoProps) {
  const variantClasses =
    variant === "muted"
      ? "bg-muted text-muted-foreground"
      : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900";

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center font-bold tracking-tight shadow-sm border border-transparent",
        sizeClasses[size],
        variantClasses,
        className,
      )}
    >
      {brandConfig.shortName}
    </div>
  );
}

interface BrandAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandAvatar({ size = "md", className }: BrandAvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold tracking-tight bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md ring-2 ring-background",
        sizeClasses[size],
        className,
      )}
    >
      {brandConfig.shortName}
    </div>
  );
}

export function BrandName({ className }: { className?: string }) {
  return (
    <span className={cn("font-bold tracking-tight", className)}>
      {brandConfig.name}
    </span>
  );
}

export { brandConfig };
