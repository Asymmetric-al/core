"use client";

import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

interface SettingsRowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Two-column label / control row used inside `SettingsPanel`. On mobile the
 * label stacks on top of the control.
 */
export function SettingsRow({
  label,
  description,
  htmlFor,
  children,
  className,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-start",
        className,
      )}
    >
      <label htmlFor={htmlFor} className="flex flex-col gap-1">
        <span className="text-[12px] font-semibold text-zinc-900">{label}</span>
        {description ? (
          <span className="text-[11px] text-zinc-500">{description}</span>
        ) : null}
      </label>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
