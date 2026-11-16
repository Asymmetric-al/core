"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@asym/ui/lib/utils";

import { DATA_GRID_ROW_PRIMARY_ATTRIBUTE } from "./data-grid-row-keyboard";

import type { ComponentProps } from "react";

type DataGridRowPrimaryProps = useRender.ComponentProps<"button"> &
  Pick<ComponentProps<"button">, "onClick">;

const PRIMARY_CLASSES =
  "inline-flex max-w-full min-w-0 items-center gap-3 rounded-md text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * The control that opens a row's record. Render exactly one per row (table
 * cell or mobile card) with the record's name as its content or `aria-label`.
 * Row clicks elsewhere still work through the grid's `onRowClick`; this gives
 * keyboard and screen-reader users the same action and anchors the grid's
 * arrow-key navigation. Pass `render={<Link href="…" />}` for navigation.
 */
export function DataGridRowPrimary({
  className,
  render,
  ...props
}: DataGridRowPrimaryProps) {
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        type: render ? undefined : "button",
        className: cn(PRIMARY_CLASSES, className),
        // The row's own onRowClick would fire too; run the action once.
        onClick: (event) => event.stopPropagation(),
      },
      props,
      { [DATA_GRID_ROW_PRIMARY_ATTRIBUTE]: "" } as ComponentProps<"button">,
    ),
  });
}
