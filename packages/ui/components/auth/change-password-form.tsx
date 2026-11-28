"use client";

import { ownApiFetch } from "@asym/database/own-api";
import { readJsonBody } from "@asym/lib/http/fetch-result";
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

const SAVE_FALLBACK =
  "We couldn’t confirm whether your password changed. Sign in with your new password; if that doesn’t work, use your old one.";

const FIELD_REFUSALS: Record<string, Field> = {
  CURRENT_PASSWORD_REFUSED: "current",
  CURRENT_PASSWORD_REQUIRED: "current",
  PASSWORD_UNCHANGED: "next",
  PASSWORD_TOO_SHORT: "next",
};

type Outcome =
  | { kind: "saved" }
  | { kind: "field"; field: Field; message: string }
  | { kind: "form"; message: string };

async function changePasswordThroughCore(
  currentPassword: string,
  newPassword: string,
): Promise<Outcome> {
  try {
    const response = await ownApiFetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const { ok, body } = await readJsonBody<{
      ok?: boolean;
      code?: unknown;
      error?: unknown;
    }>(response);
    if (ok && body?.ok === true) return { kind: "saved" };
    const message =
      typeof body?.error === "string" && body.error.trim()
        ? body.error
        : SAVE_FALLBACK;
    const field =
      typeof body?.code === "string" ? FIELD_REFUSALS[body.code] : undefined;
    return field
      ? { kind: "field", field, message }
      : { kind: "form", message };
  } catch {
    return { kind: "form", message: SAVE_FALLBACK };
  }
}

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
      const outcome = await changePasswordThroughCore(
        values.current,
        values.next,
      );
      if (outcome.kind === "field") {
        setErrors({ [outcome.field]: outcome.message });
        focusField(outcome.field);
        return;
      }
      if (outcome.kind === "form") {
        setFormError(outcome.message);
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

      <p className="mt-3 text-sm text-muted-foreground">
        Changing it signs you out on your other devices.
      </p>

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
