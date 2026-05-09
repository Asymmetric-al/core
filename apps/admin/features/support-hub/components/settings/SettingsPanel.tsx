"use client";

import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

interface SettingsPanelProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Card-shaped panel primitive used across the support settings screens. Keeps
 * the Maia density consistent (bordered card, soft shadow, tight header).
 */
export function SettingsPanel({
  title,
  description,
  actions,
  children,
  className,
}: SettingsPanelProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-[13px] font-semibold text-zinc-900">{title}</h2>
          {description ? (
            <p className="text-[12px] text-zinc-500">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
