"use client";

import { createBrowserClient } from "@asym/database/supabase";
import { CircleCheck } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";
import { LabeledField } from "../primitives/labeled-field";
import { Button } from "../shadcn/button";
import { Input } from "../shadcn/input";

const MIN_LENGTH = 8;

type Field = "current" | "next" | "confirm";
type Errors = Partial<Record<Field, string>>;

const FIELD_NAMES: Record<Field, string> = {
  current: "currentPassword",
  next: "newPassword",
  confirm: "confirmPassword",
};

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  if (!values.current) errors.current = "Enter your current password.";
  if (values.next.length < MIN_LENGTH) {
    errors.next = `Use at least ${MIN_LENGTH} characters.`;
  } else if (values.next === values.current) {
    errors.next = "Choose a password you haven’t used here.";
  }
  if (values.confirm !== values.next) {
    errors.confirm = "The passwords don’t match.";
  }
  return errors;
}

/**
 * Change the signed-in person's password. The current password is checked
 * first (by signing in with it), so a borrowed, unlocked session can't
 * replace it. Errors sit next to the field they belong to.
 */
export function ChangePasswordForm({ className }: { className?: string }) {
  const [values, setValues] = React.useState<Record<Field, string>>({
    current: "",
    next: "",
    confirm: "",
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const focusField = (field: Field) => {
    const control = formRef.current?.elements.namedItem(FIELD_NAMES[field]);
    if (control instanceof HTMLElement) control.focus();
  };

  const update = (field: Field, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSaved(false);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
  };

  // The submit button is disabled while saving, which would drop focus to
  // the page. Focus waits on the form instead and returns to the button.
  const submitRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (isSaving) return;
    if (document.activeElement === formRef.current) submitRef.current?.focus();
  }, [isSaving]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setFormError(null);
    setSaved(false);

    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalid = (["current", "next", "confirm"] as const).find(
      (field) => nextErrors[field],
    );
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    if (document.activeElement === submitRef.current) {
      formRef.current?.focus({ preventScroll: true });
    }
    setIsSaving(true);
    try {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        setFormError("Sign in again, then change your password.");
        return;
      }

      const check = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.current,
      });
      if (check.error) {
        setErrors({ current: "That isn’t your current password." });
        focusField("current");
        return;
      }

      const result = await supabase.auth.updateUser({ password: values.next });
      if (result.error) {
        setFormError(
          result.error.message ||
            "Your password couldn’t be changed. Try again.",
        );
        return;
      }

      setValues({ current: "", next: "", confirm: "" });
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      ref={formRef}
      noValidate
      tabIndex={-1}
      aria-label="Change password"
      onSubmit={handleSubmit}
      className={cn("outline-none", className)}
    >
      <div className="grid gap-4">
        <LabeledField label="Current password" error={errors.current}>
          <Input
            name={FIELD_NAMES.current}
            type="password"
            autoComplete="current-password"
            value={values.current}
            onChange={(event) => update("current", event.target.value)}
          />
        </LabeledField>
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField
            label="New password"
            error={errors.next}
            description={`At least ${MIN_LENGTH} characters. A short phrase works well.`}
          >
            <Input
              name={FIELD_NAMES.next}
              type="password"
              autoComplete="new-password"
              value={values.next}
              onChange={(event) => update("next", event.target.value)}
            />
          </LabeledField>
          <LabeledField label="Confirm new password" error={errors.confirm}>
            <Input
              name={FIELD_NAMES.confirm}
              type="password"
              autoComplete="new-password"
              value={values.confirm}
              onChange={(event) => update("confirm", event.target.value)}
            />
          </LabeledField>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button ref={submitRef} type="submit" disabled={isSaving}>
          {isSaving ? "Changing password…" : "Change password"}
        </Button>
        <p role="status" className="text-sm text-muted-foreground">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <CircleCheck className="size-4 text-success" aria-hidden />
              Your password has been changed.
            </span>
          ) : null}
        </p>
      </div>
      {formError ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {formError}
        </p>
      ) : null}
    </form>
  );
}
