"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";

import { toggleVariants } from "./toggle-variants";
import { mergeBaseUIClassName } from "../../lib/base-ui";

import type { VariantProps } from "class-variance-authority";

function Toggle({
  className,
  variant,
  size,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={mergeBaseUIClassName(
        toggleVariants({ variant, size }),
        className,
      )}
      {...props}
    />
  );
}

export { Toggle };
