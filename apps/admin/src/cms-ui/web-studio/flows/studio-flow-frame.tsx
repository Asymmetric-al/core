"use client";

import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { FieldError, FieldLabel } from "@asym/ui/components/shadcn/field";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { AlertCircle } from "lucide-react";
import { useId, useState } from "react";
import { flushSync } from "react-dom";

import { Link } from "../routing";
import { StudioLayout } from "../shell/studio-layout";

import type { SearchableSelectOption } from "@asym/ui/components/shadcn/searchable-select";
import type { FormEvent, ReactNode } from "react";

/**
 * One focused create step: a single centred card with a title, one-line
 * description, the fields, an inline error and a Cancel + primary footer.
 * Every Web Studio create flow uses it so they read as one family. Field
 * problems show under their field (`StudioFieldError`); the `error` alert at
 * the end is for the server or the connection.
 */
export function StudioFlowFrame({
  sectionLabel,
  currentLabel,
  title,
  description,
  onSubmit,
  children,
  error,
  cancelHref,
  submitLabel = "Create draft",
  pendingLabel = "Creating draft…",
  isSubmitting,
  canSubmit,
}: {
  sectionLabel: string;
  currentLabel: string;
  title: string;
  description: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  error: string | null;
  cancelHref: string;
  submitLabel?: string;
  pendingLabel?: string;
  isSubmitting: boolean;
  canSubmit: boolean;
}) {
  return (
    <StudioLayout sectionLabel={sectionLabel} currentLabel={currentLabel}>
      <div className="flex justify-center px-4 py-8 sm:px-6 lg:py-12">
        <div className="w-full max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>
                <h1 className="text-xl font-semibold tracking-tight">
                  {title}
                </h1>
              </CardTitle>
              <CardDescription>{description}</CardDescription>
              {/* Controls carry `required`; this explains the mark to sight. */}
              <p aria-hidden="true" className="text-xs text-muted-foreground">
                <span className="text-destructive">*</span> Required
              </p>
            </CardHeader>
            <form
              className="flex flex-col gap-6"
              onSubmit={onSubmit}
              noValidate
            >
              <CardContent>
                <div className="flex flex-col gap-5">
                  {children}
                  {error ? (
                    <Alert variant="destructive">
                      <AlertCircle aria-hidden="true" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex w-full flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                  <Link
                    href={cancelHref}
                    className={buttonVariants({ variant: "ghost" })}
                  >
                    Cancel
                  </Link>
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    aria-busy={isSubmitting || undefined}
                  >
                    {isSubmitting ? <Spinner aria-hidden="true" /> : null}
                    {isSubmitting ? pendingLabel : submitLabel}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </StudioLayout>
  );
}

/** The required-field mark, as Payload's document form shows it. */
export function StudioRequiredMark() {
  return (
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
  );
}

/**
 * A required field's label text with its mark. Text and mark share one
 * inline run, so the mark sits beside the word as in Payload's form.
 */
export function StudioRequiredLabel({ children }: { children: ReactNode }) {
  return (
    <span>
      {children} <StudioRequiredMark />
    </span>
  );
}

/** The id of a field's inline error, for `aria-describedby`. */
export function studioFieldErrorId(fieldId: string): string {
  return `${fieldId}-error`;
}

/** A field's own validation message, announced and tied to the control. */
export function StudioFieldError({
  fieldId,
  message,
}: {
  fieldId: string;
  message: string | undefined;
}) {
  if (!message) return null;
  return <FieldError id={studioFieldErrorId(fieldId)}>{message}</FieldError>;
}

/** `aria-describedby` for a control: its description and any error. */
export function describedBy(
  ...ids: Array<string | false | null | undefined>
): string | undefined {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

/**
 * Per-field errors for a create flow. `report` shows a validation result
 * and, when anything failed, moves focus to the first invalid field (fields
 * are checked in the order `fieldIds` lists them, the order on screen).
 */
export function useStudioFieldErrors<K extends string>(
  fieldIds: Record<K, string>,
) {
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({});

  const report = (next: Partial<Record<K, string>>): boolean => {
    const invalid = (Object.keys(fieldIds) as K[]).filter((key) => next[key]);
    // Commit first so the field is already marked invalid when focused.
    flushSync(() => setErrors(next));
    const first = invalid[0];
    if (first) document.getElementById(fieldIds[first])?.focus();
    return invalid.length === 0;
  };

  const clear = (key: K) => {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  return { errors, report, clear };
}

/**
 * A searchable select with the same label treatment as the text fields, so
 * every create flow reads as one form. The label names the combobox; the
 * note under it (a hint, or why options are missing) and any error describe
 * it, as the text fields' descriptions do.
 */
export function StudioSelectField({
  id: idProp,
  label,
  items,
  value,
  onValueChange,
  disabled,
  placeholder,
  required = false,
  error,
  children,
}: {
  /** The control's id, for focusing it when invalid. */
  id?: string;
  label: string;
  items: readonly SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  required?: boolean;
  error?: string;
  /** Description or note rendered under the control. */
  children?: ReactNode;
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const labelId = `${id}-label`;
  const hasNote =
    children !== null && children !== undefined && children !== false;
  const noteId = hasNote ? `${id}-note` : null;
  return (
    <div
      className="flex flex-col gap-2"
      data-invalid={error ? "true" : undefined}
    >
      <FieldLabel id={labelId} htmlFor={id}>
        {required ? <StudioRequiredLabel>{label}</StudioRequiredLabel> : label}
      </FieldLabel>
      <SearchableSelect
        id={id}
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(noteId, error && studioFieldErrorId(id))}
        required={required}
        searchLabel={`Search ${label.toLowerCase()}`}
        items={items}
        value={value || null}
        onValueChange={(next) => {
          if (next !== null) onValueChange(next);
        }}
        disabled={disabled}
        placeholder={placeholder}
      />
      {noteId ? <div id={noteId}>{children}</div> : null}
      <StudioFieldError fieldId={id} message={error} />
    </div>
  );
}

/** Inline, non-blocking message under a field whose options failed to load. */
export function StudioFlowFieldNote({
  tone = "muted",
  children,
}: {
  tone?: "muted" | "error";
  children: ReactNode;
}) {
  return (
    <p
      className={
        tone === "error"
          ? "text-sm text-destructive"
          : "text-sm text-muted-foreground"
      }
    >
      {children}
    </p>
  );
}
