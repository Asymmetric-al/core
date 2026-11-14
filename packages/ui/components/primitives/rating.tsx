"use client";

import { RatingItem, Rating as RatingRoot } from "@ui-sdk/react/rating";
import { StarIcon } from "lucide-react";

import { cn } from "@asym/ui/lib/utils";

import type { ComponentProps } from "react";

// Core's Base UI `FieldLabel` cannot name a UI SDK part, so callers must.
type RatingName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

export type RatingProps = Omit<
  ComponentProps<typeof RatingRoot>,
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "className"
  | "readOnly"
  | "render"
  | "step"
> & { className?: string } & RatingName;

/**
 * Collects a whole-star score. UI SDK owns the radio-group behavior (one tab
 * stop, arrow keys, form value, server rendering); this wrapper only adds Maia
 * tokens. It is Core's reference UI SDK integration: see
 * `docs/ai/skills/ui-sdk/SKILL.md` before adding another.
 */
export function Rating({ className, ...props }: RatingProps) {
  return (
    <RatingRoot
      className={cn(
        "inline-flex items-center gap-0.5 data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RatingItem className="group/star inline-flex size-6 pointer-coarse:size-11 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors data-filled:text-warning has-focus-visible:ring-3 has-focus-visible:ring-ring/50 *:data-[slot=rating-radio]:rounded-md *:data-[slot=rating-radio]:outline-none">
        <StarIcon
          aria-hidden="true"
          className="size-5 fill-transparent group-data-filled/star:fill-current"
        />
      </RatingItem>
    </RatingRoot>
  );
}
