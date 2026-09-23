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
    "grid gap-2 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-start",
    className,
  );
  if (control) {
    return (
      <FieldPrimitive.Root className={rowClassName}>
        <div className="flex flex-col gap-1">
          <FieldPrimitive.Label
            nativeLabel={false}
            render={<div />}
            className="text-[12px] font-semibold text-foreground"
          >
            {label}
          </FieldPrimitive.Label>
          {description ? (
            <FieldPrimitive.Description className="text-[11px] text-muted-foreground">
              {description}
            </FieldPrimitive.Description>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">{children}</div>
      </FieldPrimitive.Root>
    );
  }
  return (
    <div className={rowClassName}>
      <label htmlFor={htmlFor} className="flex flex-col gap-1">
        <span className="text-[12px] font-semibold text-foreground">
          {label}
        </span>
        {description ? (
          <span className="text-[11px] text-muted-foreground">
            {description}
          </span>
        ) : null}
      </label>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
