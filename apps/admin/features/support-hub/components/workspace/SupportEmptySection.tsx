"use client";

import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

interface SupportEmptySectionProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Quiet empty state used across the settings + reports surfaces. Relies on
 * tokens + borders (no loud colors) to stay on-brand with the Maia language.
 */
export function SupportEmptySection({
  icon,
  title,
  description,
  action,
  className,
}: SupportEmptySectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/40 px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-100 text-zinc-400">
          {icon}
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="text-[13px] font-semibold text-zinc-800">{title}</p>
        {description ? (
          <p className="mx-auto max-w-md text-[12px] text-zinc-500">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
