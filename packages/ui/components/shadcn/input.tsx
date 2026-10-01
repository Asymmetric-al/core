"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";

import { mergeBaseUIClassName } from "../../lib/base-ui";
import { inputStyles } from "../../lib/input-styles";

function Input({ className, type, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={mergeBaseUIClassName(inputStyles, className)}
      {...props}
    />
  );
}

export { Input };
