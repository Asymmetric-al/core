"use client";

import { OTPField } from "@base-ui/react/otp-field";
import { MinusIcon } from "lucide-react";

import { mergeBaseUIClassName } from "../../lib/base-ui";
import { cn } from "../../lib/utils";

import type * as React from "react";

function InputOTP({ className, ...props }: OTPField.Root.Props) {
  return (
    <OTPField.Root
      data-slot="input-otp"
      className={mergeBaseUIClassName(
        "flex items-center gap-2 has-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function InputOTPSlot({ className, ...props }: OTPField.Input.Props) {
  return (
    <OTPField.Input
      data-slot="input-otp-slot"
      className={mergeBaseUIClassName(
        "relative h-9 w-9 border-y border-r border-input bg-transparent text-center text-sm shadow-xs outline-none first:rounded-l-md first:border-l last:rounded-r-md focus:z-10 focus:border-ring focus:ring-[3px] focus:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPSeparator({
  className,
  children,
  ...props
}: OTPField.Separator.Props) {
  return (
    <OTPField.Separator
      data-slot="input-otp-separator"
      role="presentation"
      aria-hidden="true"
      className={mergeBaseUIClassName(
        "flex items-center justify-center [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children ?? <MinusIcon aria-hidden="true" />}
    </OTPField.Separator>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
