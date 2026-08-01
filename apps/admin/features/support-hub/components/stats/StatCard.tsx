"use client";

import { motion, useReducedMotion } from "@asym/lib/motion";
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
  zinc: "bg-zinc-300",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  emerald: "bg-emerald-400",
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
  const motionProps = reduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.25,
          ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
          delay,
        },
      };

  return (
    <motion.div
      {...motionProps}
      className="rounded-2xl border border-zinc-100 bg-white px-5 py-4 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT_CLASSES[tone])}
        />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-2 text-3xl font-black tracking-tight text-zinc-900",
          mono ? "font-mono tabular-nums" : "tabular-nums",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs font-medium text-zinc-500">{hint}</p>
      ) : null}
    </motion.div>
  );
}
