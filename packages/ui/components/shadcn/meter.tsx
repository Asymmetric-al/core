"use client";

import { Meter as MeterPrimitive } from "@base-ui/react/meter";

import { mergeBaseUIClassName } from "../../lib/base-ui";

function Meter({ className, ...props }: MeterPrimitive.Root.Props) {
  return (
    <MeterPrimitive.Root
      data-slot="meter"
      className={mergeBaseUIClassName(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
      {...props}
    >
      <MeterPrimitive.Track data-slot="meter-track" className="size-full">
        <MeterPrimitive.Indicator
          data-slot="meter-indicator"
          className="h-full bg-primary"
        />
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  );
}

export { Meter };
