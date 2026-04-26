"use client";

import { VisuallyHidden as VisuallyHiddenPrimitive } from "radix-ui";
import * as React from "react";

function VisuallyHidden({
  ...props
}: React.ComponentProps<typeof VisuallyHiddenPrimitive.Root>) {
  return (
    <VisuallyHiddenPrimitive.Root data-slot="visually-hidden" {...props} />
  );
}

export { VisuallyHidden };
