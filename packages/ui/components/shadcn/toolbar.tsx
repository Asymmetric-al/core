"use client";

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";

import { mergeBaseUIClassName } from "../../lib/base-ui";

import type { KeyboardEvent } from "react";

const TEXT_ENTRY =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]';

// Base UI's toolbar moves with the arrow keys only. Home and End jump to the
// first and last control; focusing one moves Base UI's tab stop with it.
// React bubbles keys from portaled content too, which is not the toolbar's.
function focusToolbarEdge(event: KeyboardEvent<HTMLElement>) {
  const target = event.target as Element;
  if (
    (event.key !== "Home" && event.key !== "End") ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    !event.currentTarget.contains(target) ||
    target.closest(TEXT_ENTRY)
  )
    return;
  const controls = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>("[tabindex]"),
  ).filter(
    (control) =>
      !control.matches(":disabled, [data-base-ui-focus-guard]") &&
      !control.closest('[aria-hidden="true"]'),
  );
  const edge = event.key === "Home" ? controls[0] : controls.at(-1);
  if (!edge) return;
  event.preventDefault();
  edge.focus();
}

function Toolbar({
  className,
  onKeyDown,
  ...props
}: ToolbarPrimitive.Root.Props) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      className={mergeBaseUIClassName(
        "flex items-center gap-1 data-[orientation=vertical]:flex-col",
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) focusToolbarEdge(event);
      }}
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
