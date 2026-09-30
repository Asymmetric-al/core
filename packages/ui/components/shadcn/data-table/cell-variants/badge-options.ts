import type { BadgeOption, BadgeVariant } from "./types";

export function createBadgeOptions(
  options: Array<{
    value: string;
    label: string;
    variant?: BadgeVariant;
    icon?: React.ComponentType<{ className?: string }>;
  }>,
): BadgeOption[] {
  return options.map((opt) => ({
    value: opt.value,
    label: opt.label,
    variant: opt.variant ?? "default",
    icon: opt.icon,
  }));
}

export const STATUS_BADGE_OPTIONS: BadgeOption[] = [
  { value: "active", label: "Active", variant: "success" },
  { value: "inactive", label: "Inactive", variant: "secondary" },
  { value: "pending", label: "Pending", variant: "warning" },
  { value: "error", label: "Error", variant: "destructive" },
];

export const PRIORITY_BADGE_OPTIONS: BadgeOption[] = [
  { value: "low", label: "Low", variant: "secondary" },
  { value: "medium", label: "Medium", variant: "warning" },
  { value: "high", label: "High", variant: "destructive" },
  { value: "urgent", label: "Urgent", variant: "destructive" },
];
