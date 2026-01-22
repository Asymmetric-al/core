"use client";

import { useMemo } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { cn } from "@asym/lib/utils";
import type { LinkCellProps } from "./types";

export function LinkCell<TData>({
  value,
  row,
  className,
  href,
  target = "_self",
  truncate = true,
  showIcon = false,
}: LinkCellProps<TData>) {
  const resolvedHref = useMemo(() => {
    if (!value && !href) return null;
    if (typeof href === "function") {
      return href(value, row.original);
    }
    return href ?? value;
  }, [value, href, row.original]);

  const displayText = value ?? resolvedHref;

  if (!displayText) {
    return (
      <span
        className={cn("block text-sm text-muted-foreground italic", className)}
      >
        —
      </span>
    );
  }

  if (!resolvedHref) {
    return (
      <span
        className={cn("block text-sm", truncate && "truncate", className)}
        title={displayText}
      >
        {displayText}
      </span>
    );
  }

  return (
    <a
      href={resolvedHref}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-2 transition-colors",
        truncate && "max-w-full",
        className,
      )}
      title={displayText}
    >
      <span className={cn(truncate && "truncate")}>{displayText}</span>
      {showIcon && target === "_blank" && (
        <ExternalLinkIcon className="size-3 shrink-0 opacity-70" />
      )}
    </a>
  );
}
