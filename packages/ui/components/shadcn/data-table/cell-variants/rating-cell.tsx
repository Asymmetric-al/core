"use client";

import { StarIcon } from "lucide-react";
import { useState, useCallback, useMemo } from "react";

import { cn } from "@asym/ui/lib/utils";

import type { RowData } from "../tanstack";
import type { RatingCellProps } from "./types";

const sizeClasses = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
};

export function RatingCell<TData extends RowData>({
  value,
  isEditing = false,
  onValueChange,
  onEditComplete,
  className,
  disabled = false,
  max = 5,
  size = "md",
  allowHalf = false,
}: RatingCellProps<TData>) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const stars = useMemo(
    () =>
      Array.from({ length: max }, (_, index) => ({
        id: `star-${index + 1}`,
        index,
      })),
    [max],
  );

  const displayValue = hoverValue ?? value ?? 0;

  const handleClick = useCallback(
    (index: number) => {
      if (disabled || !isEditing) return;
      const newValue = index + 1;
      onValueChange?.(newValue === value ? 0 : newValue);
      onEditComplete?.();
    },
    [disabled, isEditing, value, onValueChange, onEditComplete],
  );

  const handleMouseEnter = useCallback(
    (index: number) => {
      if (disabled || !isEditing) return;
      setHoverValue(() => index + 1);
    },
    [disabled, isEditing],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        isEditing && !disabled && "cursor-pointer",
        className,
      )}
      onMouseLeave={handleMouseLeave}
    >
      {stars.map((star) => {
        const filled = star.index < displayValue;
        const halfFilled =
          allowHalf &&
          star.index === Math.floor(displayValue) &&
          displayValue % 1 >= 0.5;

        return (
          <button
            key={star.id}
            type="button"
            onClick={() => handleClick(star.index)}
            onMouseEnter={() => handleMouseEnter(star.index)}
            disabled={disabled || !isEditing}
            className={cn(
              "p-0 relative",
              isEditing &&
                !disabled &&
                "[@media(hover:hover)_and_(pointer:fine)]:hover:scale-110 transition-transform",
              disabled && "opacity-50",
            )}
          >
            <StarIcon
              className={cn(
                sizeClasses[size],
                "transition-colors",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40",
              )}
            />
            {halfFilled && (
              <StarIcon
                className={cn(
                  sizeClasses[size],
                  "absolute inset-0 fill-amber-400 text-amber-400",
                  "[clip-path:inset(0_50%_0_0)]",
                )}
              />
            )}
          </button>
        );
      })}
      {value !== null && value !== undefined && (
        <span className="ml-1 text-xs text-muted-foreground tabular-nums">
          {value.toFixed(allowHalf ? 1 : 0)}
        </span>
      )}
    </div>
  );
}
