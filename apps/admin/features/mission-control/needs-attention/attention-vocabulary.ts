import type { Badge } from "@asym/ui/components/shadcn/badge";
import type { ComponentProps } from "react";

/**
 * How Mission Control follow-up urgency reads everywhere it appears (Home,
 * Contributions, Tasks), so one stored urgency never shows two labels or
 * two tones.
 */
export type AttentionUrgency = "critical" | "high" | "normal";

type AttentionBadgeVariant = NonNullable<
  ComponentProps<typeof Badge>["variant"]
>;

export const ATTENTION_URGENCY: Record<
  AttentionUrgency,
  { label: string; variant: AttentionBadgeVariant }
> = {
  // Solid: the subtle variant's neutral text read weaker than High's amber.
  critical: { label: "Critical", variant: "destructive" },
  high: { label: "High", variant: "warning" },
  normal: { label: "Normal", variant: "outline" },
};

function isAttentionUrgency(value: string): value is AttentionUrgency {
  return Object.hasOwn(ATTENTION_URGENCY, value);
}

/**
 * An urgency the vocabulary does not know yet shows as itself, so a new
 * stored value is never passed off as "Normal".
 */
export function attentionUrgency(value: string): {
  label: string;
  variant: AttentionBadgeVariant;
} {
  if (isAttentionUrgency(value)) {
    return ATTENTION_URGENCY[value];
  }
  return {
    label: value.charAt(0).toUpperCase() + value.slice(1),
    variant: "outline",
  };
}

/** Shown on a follow-up with no gift or donor to open. */
export const FOLLOW_UP_NOT_LINKED = "Not linked to a gift or donor yet";

/**
 * Where a follow-up can be acted on: its gift when it has one, otherwise its
 * donor's CRM record. Null when it points at neither.
 */
export function followUpLink(item: {
  contributionId: string | null;
  donorId: string | null;
}): { href: string; label: string } | null {
  if (item.contributionId) {
    return {
      href: `/contributions/${encodeURIComponent(item.contributionId)}`,
      label: "Open contribution",
    };
  }
  if (item.donorId) {
    return {
      href: `/crm?donor=${encodeURIComponent(item.donorId)}`,
      label: "Open donor",
    };
  }
  return null;
}
