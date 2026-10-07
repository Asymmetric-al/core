import { Button as ButtonPrimitive } from "@base-ui/react/button";

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

export { Button };
