"use client";

import { FieldPrimitive } from "@asym/ui/components/shadcn/field";
import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

interface SettingsRowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  control?: boolean;
}

/**
 * Two-column label / control row used inside `SettingsPanel`. On mobile the
 * label stacks on top of the control.
 */
export function SettingsRow({
  label,
  description,
  htmlFor,
  children,
  className,
  control = false,
}: SettingsRowProps) {
  const rowClassName = cn(
    "flex flex-col gap-2 sm:flex-row sm:items-start",
    className,
  );
  if (control) {
    return (
      <FieldPrimitive.Root className={rowClassName}>
        <div className="flex min-w-0 flex-col gap-1 sm:w-60">
          <FieldPrimitive.Label
            nativeLabel={false}
            render={<div />}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </FieldPrimitive.Label>
          {description ? (
            <FieldPrimitive.Description className="text-xs text-muted-foreground">
              {description}
            </FieldPrimitive.Description>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-1">{children}</div>
      </FieldPrimitive.Root>
    );
  }
  return (
    <div className={rowClassName}>
      <label htmlFor={htmlFor} className="flex min-w-0 flex-col gap-1 sm:w-60">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </label>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-1">{children}</div>
    </div>
  );
}
