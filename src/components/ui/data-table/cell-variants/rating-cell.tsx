"use client";

import { useState, useCallback } from "react";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RatingCellProps } from "./types";

const sizeClasses = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
};

export function RatingCell<TData>({
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
      setHoverValue(index + 1);
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
      {Array.from({ length: max }, (_, i) => {
        const filled = i < displayValue;
        const halfFilled =
          allowHalf &&
          i === Math.floor(displayValue) &&
          displayValue % 1 >= 0.5;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            disabled={disabled || !isEditing}
            className={cn(
              "p-0 relative",
              isEditing && !disabled && "hover:scale-110 transition-transform",
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
