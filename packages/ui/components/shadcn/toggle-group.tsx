"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { toggleVariants } from "./toggle";
import { mergeBaseUIClassName } from "../../lib/base-ui";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    activeValue?: string;
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
});

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  style,
  children,
  value,
  defaultValue,
  onValueChange,
  multiple,
  disabled,
  ref,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    ref?: React.Ref<HTMLDivElement>;
  }) {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const groupValue = value !== undefined ? value : uncontrolledValue;
  // A single-select group behaves like a radio group, so its tab stop starts on
  // the pressed item; a multi-select group keeps starting on the first item.
  const activeValue = multiple || disabled ? undefined : groupValue?.[0];
  const contextValue = React.useMemo(
    () => ({ variant, size, spacing, activeValue }),
    [variant, size, spacing, activeValue],
  );

  // Base UI places the tab stop only when the items first register. A value
  // set from outside the group (such as a phone default chosen after
  // hydration) remounts the items so the tab stop follows it. A press inside
  // the group never does: the pressed item may not hold focus (Safari, touch).
  // The check waits a task, so code that moves focus into the group for the
  // same change keeps its element, and the tab stop follows that focus.
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const placedFor = React.useRef(activeValue);
  const pressed = React.useRef<string | undefined>(undefined);
  const [placement, setPlacement] = React.useState(0);
  React.useEffect(() => {
    if (placedFor.current === activeValue) return;
    placedFor.current = activeValue;
    const fromPress = pressed.current === activeValue;
    pressed.current = undefined;
    if (fromPress || activeValue === undefined) return;
    const timer = window.setTimeout(() => {
      if (!rootRef.current?.contains(document.activeElement)) {
        setPlacement((count) => count + 1);
      }
    });
    return () => window.clearTimeout(timer);
  }, [activeValue]);
  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const handleValueChange: ToggleGroupPrimitive.Props["onValueChange"] = (
    nextValue,
    eventDetails,
  ) => {
    pressed.current = nextValue[0];
    onValueChange?.(nextValue, eventDetails);
    if (!eventDetails.isCanceled) {
      setUncontrolledValue(nextValue);
    }
  };

  return (
    <ToggleGroupPrimitive
      key={placement}
      ref={setRoot}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      multiple={multiple}
      disabled={disabled}
      style={
        typeof style === "function"
          ? (state) =>
              ({ "--gap": spacing, ...style(state) }) as React.CSSProperties
          : ({ "--gap": spacing, ...style } as React.CSSProperties)
      }
      className={mergeBaseUIClassName(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={contextValue}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value,
  disabled,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.use(ToggleGroupContext);
  const isActive =
    !disabled && value !== undefined && value === context.activeValue;

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      // Base UI's composite root starts the roving tab stop on the item carrying
      // `data-composite-item-active` (Tabs and RadioGroup set it; Toggle does not).
      data-composite-item-active={isActive ? "" : undefined}
      value={value}
      disabled={disabled}
      className={mergeBaseUIClassName(
        cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
          "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        ),
        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
