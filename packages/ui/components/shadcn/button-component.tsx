"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { useRender } from "@base-ui/react/use-render";

import { buttonVariants } from "./button-variants";
import { mergeBaseUIClassName } from "../../lib/base-ui";

import type { VariantProps } from "class-variance-authority";

function Button({
  className,
  variant = "default",
  size = "default",
  disabled,
  focusableWhenDisabled,
  type,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={mergeBaseUIClassName(
        buttonVariants({ variant, size }),
        className,
      )}
      {...props}
      type={type}
      disabled={disabled}
      focusableWhenDisabled={
        type === "submit" && disabled ? false : focusableWhenDisabled
      }
    />
  );
}

// Links share Maia presentation without ButtonPrimitive's button semantics.
function ButtonLink({
  className,
  variant = "default",
  size = "default",
  render,
  ref,
  ...props
}: useRender.ComponentProps<
  "a",
  {
    slot: string;
    variant: VariantProps<typeof buttonVariants>["variant"];
    size: VariantProps<typeof buttonVariants>["size"];
  }
> &
  VariantProps<typeof buttonVariants>) {
  return useRender({
    defaultTagName: "a",
    ref,
    render,
    state: { slot: "button-link", variant, size },
    props: {
      ...props,
      className: mergeBaseUIClassName(
        buttonVariants({ variant, size }),
        className,
      ),
    },
  });
}

export { Button, ButtonLink };
