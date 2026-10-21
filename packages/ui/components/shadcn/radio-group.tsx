"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleIcon } from "lucide-react";

import { mergeBaseUIClassName } from "../../lib/base-ui";

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={mergeBaseUIClassName("grid gap-3", className)}
      {...props}
    />
  );
}

const radioGroupItemVariants = cva(
  "shrink-0 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "aspect-square size-4 rounded-full border border-input text-primary shadow-xs dark:bg-input/30",
        amount:
          "w-full h-24 rounded-2xl border-2 font-semibold font-display text-2xl press-feedback data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-checked:shadow-sm data-checked:ring-4 data-checked:ring-ring/15 data-unchecked:border-border data-unchecked:bg-muted data-unchecked:text-foreground data-unchecked:hover:border-border data-unchecked:hover:bg-accent",
        "amount-compact":
          "aspect-auto h-auto w-full py-2.5 rounded-xl border text-sm font-semibold shadow-none press-feedback border-border data-checked:bg-background data-checked:text-foreground data-unchecked:bg-card data-unchecked:text-muted-foreground data-unchecked:hover:border-border data-unchecked:hover:text-foreground data-unchecked:hover:bg-background",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function RadioGroupItem({
  className,
  variant = "default",
  children,
  ...props
}: RadioPrimitive.Root.Props & VariantProps<typeof radioGroupItemVariants>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={mergeBaseUIClassName(
        radioGroupItemVariants({ variant }),
        className,
      )}
      {...props}
    >
      {variant === "default" ? (
        <RadioPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="flex size-full items-center justify-center"
        >
          <CircleIcon className="size-2 fill-primary" />
        </RadioPrimitive.Indicator>
      ) : (
        children
      )}
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
