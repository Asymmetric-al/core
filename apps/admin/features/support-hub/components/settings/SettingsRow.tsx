"use client";

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldPrimitive,
  FieldTitle,
} from "@asym/ui/components/shadcn/field";
import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

type SettingsRowOrientation = "horizontal" | "vertical" | "inline";

interface SettingsRowProps {
  label: string;
  description?: React.ReactNode;
  /**
   * Id of a native control in the row, such as a Textarea. Base UI controls
   * (Input, Switch, Select, SearchableSelect) join the row's field on their
   * own, so they need no id.
   */
  htmlFor?: string;
  /** Inline validation message. Marks the control invalid and describes it. */
  error?: string;
  children: React.ReactNode;
  className?: string;
  /**
   * Set for button-like controls (Switch, Select, SearchableSelect) and for
   * rows that only show a value: the label is then not a native `<label>`.
   */
  control?: boolean;
  /**
   * `horizontal` puts the label beside the control from `sm` up (settings
   * cards), `vertical` stacks them, and `inline` keeps a switch at the end
   * of its label.
   */
  orientation?: SettingsRowOrientation;
}

const ROW_LAYOUT: Record<SettingsRowOrientation, string> = {
  horizontal:
    "grid gap-2 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-start",
  vertical: "flex flex-col gap-2",
  inline: "flex items-start justify-between gap-4",
};

const LABEL_LAYOUT: Record<SettingsRowOrientation, string> = {
  horizontal: "flex min-w-0 flex-col gap-1",
  vertical: "flex min-w-0 flex-col gap-1",
  inline: "flex min-w-0 flex-1 flex-col gap-1",
};

const CONTROL_LAYOUT: Record<SettingsRowOrientation, string> = {
  horizontal: "flex min-w-0 flex-col gap-2",
  vertical: "flex min-w-0 flex-col gap-2",
  inline: "flex shrink-0 flex-col items-end gap-2",
};

/**
 * Label, description and control for one support setting. Every row is a
 * Base UI field: the label names the control, and the description and any
 * error are announced with it instead of being folded into its name.
 */
export function SettingsRow({
  label,
  description,
  htmlFor,
  error,
  children,
  className,
  control = false,
  orientation = "horizontal",
}: SettingsRowProps) {
  return (
    <FieldPrimitive.Root
      invalid={error ? true : undefined}
      className={cn(ROW_LAYOUT[orientation], className)}
    >
      <div className={LABEL_LAYOUT[orientation]}>
        {control ? (
          <FieldPrimitive.Label nativeLabel={false} render={<FieldTitle />}>
            {label}
          </FieldPrimitive.Label>
        ) : (
          <FieldPrimitive.Label
            render={<FieldLabel />}
            {...(htmlFor ? { htmlFor } : {})}
          >
            {label}
          </FieldPrimitive.Label>
        )}
        {description ? (
          <FieldPrimitive.Description
            render={<FieldDescription className="text-xs" />}
          >
            {description}
          </FieldPrimitive.Description>
        ) : null}
      </div>
      <div className={CONTROL_LAYOUT[orientation]}>
        {children}
        {error ? (
          <FieldPrimitive.Error match render={<FieldError />}>
            {error}
          </FieldPrimitive.Error>
        ) : null}
      </div>
    </FieldPrimitive.Root>
  );
}
