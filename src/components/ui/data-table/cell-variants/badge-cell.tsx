"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { BadgeCellProps, BadgeOption, BadgeVariant } from "./types"

const variantStyles: Record<BadgeVariant, string> = {
  default: "",
  secondary: "",
  destructive: "",
  outline: "",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  warning: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
}

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-primary",
  secondary: "bg-secondary-foreground",
  destructive: "bg-destructive",
  outline: "bg-foreground",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
}

export function BadgeCell<TData>({
  value,
  className,
  options,
  variant: defaultVariant = "default",
  showDot = false,
}: BadgeCellProps<TData>) {
  const resolvedOption = useMemo(() => {
    if (!options || !value) return null
    return options.find((opt) => opt.value === value)
  }, [options, value])

  const resolvedVariant = resolvedOption?.variant ?? defaultVariant
  const displayLabel = resolvedOption?.label ?? value
  const Icon = resolvedOption?.icon

  if (!value) {
    return (
      <span className={cn("block text-sm text-muted-foreground italic", className)}>
        —
      </span>
    )
  }

  const isCustomVariant = ["success", "warning", "info"].includes(resolvedVariant)
  const badgeVariant = isCustomVariant ? "outline" : resolvedVariant

  return (
    <Badge
      variant={badgeVariant as "default" | "secondary" | "destructive" | "outline"}
      className={cn(
        "text-xs font-medium px-2 py-0.5",
        isCustomVariant && variantStyles[resolvedVariant],
        resolvedOption?.className,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "size-1.5 rounded-full mr-1.5 shrink-0",
            dotColors[resolvedVariant]
          )}
        />
      )}
      {Icon && <Icon className="size-3 mr-1 shrink-0" />}
      {displayLabel}
    </Badge>
  )
}

export function createBadgeOptions(
  options: Array<{
    value: string
    label: string
    variant?: BadgeVariant
    icon?: React.ComponentType<{ className?: string }>
  }>
): BadgeOption[] {
  return options.map((opt) => ({
    value: opt.value,
    label: opt.label,
    variant: opt.variant ?? "default",
    icon: opt.icon,
  }))
}

export const STATUS_BADGE_OPTIONS: BadgeOption[] = [
  { value: "active", label: "Active", variant: "success" },
  { value: "inactive", label: "Inactive", variant: "secondary" },
  { value: "pending", label: "Pending", variant: "warning" },
  { value: "error", label: "Error", variant: "destructive" },
]

export const PRIORITY_BADGE_OPTIONS: BadgeOption[] = [
  { value: "low", label: "Low", variant: "secondary" },
  { value: "medium", label: "Medium", variant: "warning" },
  { value: "high", label: "High", variant: "destructive" },
  { value: "urgent", label: "Urgent", variant: "destructive" },
]
