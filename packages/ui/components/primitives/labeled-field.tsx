"use client";

import { Field } from "@base-ui/react/field";
import * as React from "react";

import { cn } from "../../lib/utils";
import { FieldLabel, FieldError } from "../shadcn/field";

/** Accessible relationships for one controlled input without another form state owner. */
export function LabeledField({
  label,
  children,
  error,
  description,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactElement;
  error?: string;
  description?: React.ReactNode;
  className?: string;
}) {
  const id = React.useId();
  const controlId = `${id}-control`;
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <Field.Root
      invalid={Boolean(error)}
      className={cn("flex flex-col gap-1.5", className)}
    >
      <Field.Label htmlFor={controlId} render={<FieldLabel />}>
        {label}
      </Field.Label>
      <Field.Control
        id={controlId}
        render={children}
        aria-invalid={Boolean(error)}
        aria-errormessage={error ? errorId : undefined}
        aria-describedby={
          error ? errorId : description ? descriptionId : undefined
        }
      />
      <div className="min-h-4">
        {error ? (
          <Field.Error id={errorId} match render={<FieldError />}>
            {error}
          </Field.Error>
        ) : description ? (
          <Field.Description id={descriptionId} render={<div />}>
            {description}
          </Field.Description>
        ) : null}
      </div>
    </Field.Root>
  );
}
