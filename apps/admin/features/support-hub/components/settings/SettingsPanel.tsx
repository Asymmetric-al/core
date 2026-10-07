"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@asym/ui/components/shadcn/card";
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
  const titleId = React.useId();
  return (
    <Card role="region" aria-labelledby={titleId} className={cn(className)}>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
