"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";

import { mergeBaseUIClassName } from "../../lib/base-ui";

function Progress({
  className,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value === undefined ? 0 : value}
      className={mergeBaseUIClassName(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Track data-slot="progress-track" className="size-full">
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="h-full bg-primary data-indeterminate:w-1/3 data-indeterminate:animate-pulse"
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
