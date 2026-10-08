"use client";

import { motion, useReducedMotion } from "@asym/lib/motion";
import { propsHeroEntrance } from "@asym/lib/motion-presets";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";

import type * as React from "react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  /** Render `value` in tabular-nums (Geist Mono) — useful for time-style metrics. */
  mono?: boolean;
  /** Subtle accent dot to the left of the label (Maia/Zinc tones only). */
  tone?: "zinc" | "amber" | "rose" | "emerald";
  /** Stagger delay in seconds for the row entrance animation. */
  delay?: number;
}

const TONE_DOT_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  zinc: "bg-muted-foreground",
  amber: "bg-warning",
  rose: "bg-destructive",
  emerald: "bg-success",
};

/**
 * Single stat tile shared by the support-hub stats strip. Mirrors the Maia
 * pattern from `apps/admin/app/(app)/contributions/main-body.tsx` so the page reads
 * as part of Mission Control rather than a pasted donor block.
 */
export function StatCard({
  label,
  value,
  hint,
  mono = false,
  tone = "zinc",
  delay = 0,
}: StatCardProps) {
  const reduceMotion = useReducedMotion();
  const motionProps = propsHeroEntrance(reduceMotion, delay, 12);

  return (
    <motion.div
      initial={motionProps.initial}
      animate={motionProps.animate}
      transition={motionProps.transition}
    >
      <Card className="h-full">
        <CardContent>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT_CLASSES[tone])}
            />
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
          </div>
          <p
            className={cn(
              "mt-2 text-3xl font-semibold tracking-tight text-foreground",
              mono ? "font-mono tabular-nums" : "tabular-nums",
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
