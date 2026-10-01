"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";

import { mergeBaseUIClassName } from "../../lib/base-ui";
import { inputStyles, inputGroupInputStyles } from "../../lib/input-styles";
import { cn } from "../../lib/utils";

const Combobox = ComboboxPrimitive.Root;
const createComboboxItems = ComboboxPrimitive.createItems;
function ComboboxItemIndicator(props: ComboboxPrimitive.ItemIndicator.Props) {
  return (
    <ComboboxPrimitive.ItemIndicator
      data-slot="combobox-item-indicator"
      {...props}
    />
  );
}

function ComboboxTrigger(props: ComboboxPrimitive.Trigger.Props) {
  return <ComboboxPrimitive.Trigger data-slot="combobox-trigger" {...props} />;
}

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="input-group-control"
      className={mergeBaseUIClassName(
        cn(inputStyles, inputGroupInputStyles),
        className,
      )}
      {...(props["aria-label"] && !props["aria-labelledby"]
        ? { "aria-labelledby": undefined }
        : {})}
      {...props}
    />
  );
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "sideOffset" | "align" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={mergeBaseUIClassName(
            "relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-2xl bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/5 outline-hidden",
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={mergeBaseUIClassName(
        "max-h-72 scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxItem({ className, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={mergeBaseUIClassName(
        "relative flex w-full cursor-default items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxEmpty({
  children,
  className,
  ...props
}: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={mergeBaseUIClassName(
        "text-center text-xs text-muted-foreground [&:not(:empty)]:py-8",
        className,
      )}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Empty>
  );
}

export {
  Combobox,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxEmpty,
  createComboboxItems,
};
