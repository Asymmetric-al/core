"use client";

// Auth screens compose Core's base-maia owners (Card, Input, Label, Button,
// Checkbox, Alert) so sign-in looks like the rest of the product. The
// exported names stay stable for the donor, missionary and admin screens.

import { Loader2, LockKeyhole } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Alert, AlertDescription } from "../shadcn/alert";
import { Button } from "../shadcn/button";
import { Card } from "../shadcn/card";
import { Checkbox } from "../shadcn/checkbox";
import { Input } from "../shadcn/input";
import { Label } from "../shadcn/label";
import { Separator } from "../shadcn/separator";

/** The auth names for the shared Button variants. */
const AUTH_BUTTON_VARIANT = {
  primary: "default",
  secondary: "outline",
  ghost: "ghost",
  link: "link",
} as const;

export type AuthButtonVariant = keyof typeof AUTH_BUTTON_VARIANT;

export const AuthButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: AuthButtonVariant | null;
    loading?: boolean;
  }
>(
  (
    {
      className,
      variant,
      loading = false,
      disabled,
      children,
      type = "button",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...props
    },
    ref,
  ) => {
    const labelId = React.useId();
    // Submit controls must stay natively disabled while loading. Base UI's
    // focusableWhenDisabled path only sets aria-disabled, so Enter in a field
    // would still implicit-submit the form. Login and register also ignore a
    // second call via submissionInFlight; native disabled is the HTML lock.
    const focusableWhenDisabled = loading && type !== "submit";
    const buttonVariant = AUTH_BUTTON_VARIANT[variant ?? "primary"];
    return (
      <Button
        ref={ref}
        type={type}
        variant={buttonVariant}
        className={cn(buttonVariant !== "link" && "w-full", className)}
        disabled={loading || disabled}
        focusableWhenDisabled={focusableWhenDisabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : labelId)}
        {...props}
      >
        {loading ? (
          <Loader2 aria-hidden="true" className="animate-spin" />
        ) : null}
        <span id={labelId}>{children}</span>
      </Button>
    );
  },
);
AuthButton.displayName = "AuthButton";

/** Full-screen centred frame shared by every sign-in and access screen. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}

export function AuthCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <Card className={cn("w-full max-w-md", className)} {...props} />;
}

/**
 * The small icon tile above an auth card title. Neutral on purpose: the
 * organization is not known before sign-in, so no initials or logo. Takes an
 * element, not a component, so server pages can pass one across the client
 * boundary.
 */
export function AuthMark({
  icon = <LockKeyhole />,
}: {
  /** An icon element, e.g. `<KeyRound />`. Sized to 20px. */
  icon?: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className="mx-auto mb-1 grid size-10 place-items-center rounded-lg border bg-muted text-foreground [&_svg]:size-5"
    >
      {icon}
    </div>
  );
}

export function AuthCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative z-10 flex flex-col gap-1.5 px-6 pt-4 text-center",
        className,
      )}
      {...props}
    />
  );
}

export function AuthCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn("text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function AuthCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function AuthCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative z-10 flex flex-col gap-4 px-6 pb-4", className)}
      {...props}
    />
  );
}

export const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <Input ref={ref} {...props} />);
AuthInput.displayName = "AuthInput";

export const AuthLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>((props, ref) => <Label ref={ref} {...props} />);
AuthLabel.displayName = "AuthLabel";

export function AuthSeparator({ className }: { className?: string }) {
  return <Separator className={className} />;
}

/**
 * An inline result message. Errors interrupt (role="alert"); notices and
 * successes are polite (role="status").
 */
export function AuthMessage({
  id,
  tone,
  children,
}: {
  id?: string;
  tone: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  return (
    <Alert
      id={id}
      role={tone === "error" ? "alert" : "status"}
      variant={
        tone === "error"
          ? "destructive"
          : tone === "success"
            ? "success"
            : "info"
      }
    >
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export function AuthCheckbox({
  id,
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  disabled,
}: {
  id: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(value) => onCheckedChange?.(value === true)}
        disabled={disabled}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
