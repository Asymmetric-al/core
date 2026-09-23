"use client";

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";

import { mergeBaseUIClassName } from "../../lib/base-ui";

function Toolbar({ className, ...props }: ToolbarPrimitive.Root.Props) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      className={mergeBaseUIClassName(
        "flex items-center gap-1 data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarGroup({ className, ...props }: ToolbarPrimitive.Group.Props) {
  return (
    <ToolbarPrimitive.Group
      data-slot="toolbar-group"
      className={mergeBaseUIClassName(
        "flex items-center gap-0.5 data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

// Compose with Button, Toggle, or popup triggers through render so there is one
// toolbar item and the consumer retains its existing Maia visual variant.
const ToolbarButton = ToolbarPrimitive.Button;

function ToolbarSeparator({
  className,
  ...props
}: ToolbarPrimitive.Separator.Props) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={mergeBaseUIClassName(
        "shrink-0 bg-border data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        className,
      )}
      {...props}
    />
  );
}

export { Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator };
