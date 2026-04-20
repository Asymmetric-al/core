"use client";

import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "../shadcn/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../shadcn/field";
import { Input } from "../shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn/select";
import { Switch } from "../shadcn/switch";
import { Textarea } from "../shadcn/textarea";

type AsymFieldError = {
  message?: string;
};

type AsymFieldBaseProps = {
  className?: string;
  contentClassName?: string;
  description?: React.ReactNode;
  descriptionClassName?: string;
  errorClassName?: string;
  label?: React.ReactNode;
  labelClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
};

type AsymTextFieldProps = AsymFieldBaseProps & {
  autoComplete?: React.ComponentProps<typeof Input>["autoComplete"];
  disabled?: boolean;
  id?: string;
  inputClassName?: string;
  inputMode?: React.ComponentProps<typeof Input>["inputMode"];
  name?: string;
  placeholder?: string;
  type?: React.ComponentProps<typeof Input>["type"];
};

type AsymNumberFieldProps = AsymFieldBaseProps & {
  allowEmpty?: boolean;
  disabled?: boolean;
  id?: string;
  inputClassName?: string;
  max?: number;
  min?: number;
  name?: string;
  placeholder?: string;
  step?: number | "any";
};

type AsymTextareaFieldProps = AsymFieldBaseProps & {
  disabled?: boolean;
  id?: string;
  inputClassName?: string;
  name?: string;
  placeholder?: string;
  rows?: number;
};

export type AsymSelectOption = {
  disabled?: boolean;
  label: React.ReactNode;
  value: string;
};

type AsymSelectFieldProps = AsymFieldBaseProps & {
  disabled?: boolean;
  id?: string;
  name?: string;
  options: readonly AsymSelectOption[];
  placeholder?: string;
  triggerClassName?: string;
};

type AsymSwitchFieldProps = AsymFieldBaseProps & {
  checkedLabel?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  name?: string;
  switchClassName?: string;
};

type AsymSubmitButtonProps = React.ComponentProps<typeof Button> & {
  pendingChildren?: React.ReactNode;
};

function flattenFieldErrors(errors: unknown[]): AsymFieldError[] {
  if (!errors.length) {
    return [];
  }

  const messages = new Set<string>();

  for (const error of errors) {
    if (!error) {
      continue;
    }

    if (typeof error === "string") {
      messages.add(error);
      continue;
    }

    if (typeof error === "object" && "message" in error) {
      const message = error.message;
      if (typeof message === "string" && message.length > 0) {
        messages.add(message);
        continue;
      }
    }

    messages.add(String(error));
  }

  return [...messages].map((message) => ({ message }));
}

const {
  fieldContext: asymFieldContext,
  formContext: asymFormContext,
  useFieldContext: useAsymFieldContext,
  useFormContext: useAsymFormContext,
} = createFormHookContexts();

function useAsymFieldMeta(description?: React.ReactNode, id?: string) {
  const field = useAsymFieldContext<unknown>();
  const reactId = React.useId();

  const controlId =
    id ??
    `${field.name.replace(/[^a-zA-Z0-9_-]/g, "-")}-${reactId.replace(/[:]/g, "")}`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const errors =
    field.state.meta.isTouched || field.form.state.submissionAttempts > 0
      ? flattenFieldErrors(field.state.meta.errors)
      : [];
  const isInvalid = errors.length > 0;
  const describedBy = [
    description ? descriptionId : undefined,
    isInvalid ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    controlId,
    describedBy: describedBy || undefined,
    descriptionId,
    errorId,
    errors,
    field,
    isInvalid,
  };
}

function AsymFieldShell({
  children,
  className,
  contentClassName,
  description,
  descriptionClassName,
  errorClassName,
  errors,
  isInvalid,
  label,
  labelClassName,
  orientation = "vertical",
}: AsymFieldBaseProps & {
  children: React.ReactNode;
  errors: AsymFieldError[];
  isInvalid: boolean;
}) {
  return (
    <Field
      className={className}
      data-invalid={isInvalid}
      orientation={orientation}
    >
      {label ? (
        <FieldLabel className={labelClassName}>{label}</FieldLabel>
      ) : null}
      <FieldContent className={contentClassName}>
        {children}
        {description ? (
          <FieldDescription className={descriptionClassName}>
            {description}
          </FieldDescription>
        ) : null}
        <FieldError className={errorClassName} errors={errors} />
      </FieldContent>
    </Field>
  );
}

function AsymTextField({
  autoComplete,
  className,
  contentClassName,
  description,
  descriptionClassName,
  disabled,
  errorClassName,
  id,
  inputClassName,
  inputMode,
  label,
  labelClassName,
  name,
  orientation,
  placeholder,
  type = "text",
}: AsymTextFieldProps) {
  const {
    controlId,
    describedBy,
    descriptionId,
    errorId,
    errors,
    field,
    isInvalid,
  } = useAsymFieldMeta(description, id);

  return (
    <AsymFieldShell
      className={className}
      contentClassName={contentClassName}
      description={
        description ? <span id={descriptionId}>{description}</span> : undefined
      }
      descriptionClassName={descriptionClassName}
      errorClassName={errorClassName}
      errors={errors}
      isInvalid={isInvalid}
      label={label}
      labelClassName={labelClassName}
      orientation={orientation}
    >
      <Input
        aria-describedby={describedBy}
        aria-errormessage={isInvalid ? errorId : undefined}
        aria-invalid={isInvalid}
        autoComplete={autoComplete}
        className={inputClassName}
        disabled={disabled}
        id={controlId}
        inputMode={inputMode}
        name={name ?? field.name}
        onBlur={field.handleBlur}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          field.handleChange(event.target.value)
        }
        placeholder={placeholder}
        type={type}
        value={String(field.state.value ?? "")}
      />
    </AsymFieldShell>
  );
}

function AsymNumberField({
  allowEmpty = false,
  className,
  contentClassName,
  description,
  descriptionClassName,
  disabled,
  errorClassName,
  id,
  inputClassName,
  label,
  labelClassName,
  max,
  min,
  name,
  orientation,
  placeholder,
  step = "any",
}: AsymNumberFieldProps) {
  const {
    controlId,
    describedBy,
    descriptionId,
    errorId,
    errors,
    field,
    isInvalid,
  } = useAsymFieldMeta(description, id);
  const [inputValue, setInputValue] = React.useState(() =>
    field.state.value === undefined ? "" : String(field.state.value),
  );

  React.useEffect(() => {
    setInputValue(
      field.state.value === undefined ? "" : String(field.state.value),
    );
  }, [field.state.value]);

  return (
    <AsymFieldShell
      className={className}
      contentClassName={contentClassName}
      description={
        description ? <span id={descriptionId}>{description}</span> : undefined
      }
      descriptionClassName={descriptionClassName}
      errorClassName={errorClassName}
      errors={errors}
      isInvalid={isInvalid}
      label={label}
      labelClassName={labelClassName}
      orientation={orientation}
    >
      <Input
        aria-describedby={describedBy}
        aria-errormessage={isInvalid ? errorId : undefined}
        aria-invalid={isInvalid}
        className={inputClassName}
        disabled={disabled}
        id={controlId}
        max={max}
        min={min}
        name={name ?? field.name}
        onBlur={() => {
          if (inputValue === "" && !allowEmpty) {
            setInputValue(
              field.state.value === undefined ? "" : String(field.state.value),
            );
          } else if (inputValue !== "" && Number.isNaN(Number(inputValue))) {
            setInputValue(
              field.state.value === undefined ? "" : String(field.state.value),
            );
          }

          field.handleBlur();
        }}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const rawValue = event.target.value;
          setInputValue(rawValue);

          if (rawValue === "") {
            if (allowEmpty) {
              field.handleChange(undefined as never);
            }
            return;
          }

          const numericValue = Number(rawValue);

          if (!Number.isNaN(numericValue)) {
            field.handleChange(numericValue as never);
          }
        }}
        placeholder={placeholder}
        step={step}
        type="number"
        value={inputValue}
      />
    </AsymFieldShell>
  );
}

function AsymTextareaField({
  className,
  contentClassName,
  description,
  descriptionClassName,
  disabled,
  errorClassName,
  id,
  inputClassName,
  label,
  labelClassName,
  name,
  orientation,
  placeholder,
  rows,
}: AsymTextareaFieldProps) {
  const {
    controlId,
    describedBy,
    descriptionId,
    errorId,
    errors,
    field,
    isInvalid,
  } = useAsymFieldMeta(description, id);

  return (
    <AsymFieldShell
      className={className}
      contentClassName={contentClassName}
      description={
        description ? <span id={descriptionId}>{description}</span> : undefined
      }
      descriptionClassName={descriptionClassName}
      errorClassName={errorClassName}
      errors={errors}
      isInvalid={isInvalid}
      label={label}
      labelClassName={labelClassName}
      orientation={orientation}
    >
      <Textarea
        aria-describedby={describedBy}
        aria-errormessage={isInvalid ? errorId : undefined}
        aria-invalid={isInvalid}
        className={inputClassName}
        disabled={disabled}
        id={controlId}
        name={name ?? field.name}
        onBlur={field.handleBlur}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
          field.handleChange(event.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        value={String(field.state.value ?? "")}
      />
    </AsymFieldShell>
  );
}

function AsymSelectField({
  className,
  contentClassName,
  description,
  descriptionClassName,
  disabled,
  errorClassName,
  id,
  label,
  labelClassName,
  name,
  options,
  orientation,
  placeholder,
  triggerClassName,
}: AsymSelectFieldProps) {
  const {
    controlId,
    describedBy,
    descriptionId,
    errorId,
    errors,
    field,
    isInvalid,
  } = useAsymFieldMeta(description, id);

  return (
    <AsymFieldShell
      className={className}
      contentClassName={contentClassName}
      description={
        description ? <span id={descriptionId}>{description}</span> : undefined
      }
      descriptionClassName={descriptionClassName}
      errorClassName={errorClassName}
      errors={errors}
      isInvalid={isInvalid}
      label={label}
      labelClassName={labelClassName}
      orientation={orientation}
    >
      <Select
        disabled={disabled}
        name={name ?? field.name}
        onOpenChange={(open: boolean) => {
          if (!open) {
            field.handleBlur();
          }
        }}
        onValueChange={(value: string) => field.handleChange(value)}
        value={(field.state.value as string | undefined) ?? undefined}
      >
        <SelectTrigger
          aria-describedby={describedBy}
          aria-errormessage={isInvalid ? errorId : undefined}
          aria-invalid={isInvalid}
          className={triggerClassName}
          id={controlId}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              disabled={option.disabled}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AsymFieldShell>
  );
}

function AsymSwitchField({
  checkedLabel,
  className,
  contentClassName,
  description,
  descriptionClassName,
  disabled,
  errorClassName,
  id,
  label,
  labelClassName,
  name,
  orientation = "horizontal",
  switchClassName,
}: AsymSwitchFieldProps) {
  const {
    controlId,
    describedBy,
    descriptionId,
    errorId,
    errors,
    field,
    isInvalid,
  } = useAsymFieldMeta(description, id);
  const isChecked = Boolean(field.state.value);

  return (
    <AsymFieldShell
      className={cn("items-center justify-between", className)}
      contentClassName={cn(
        orientation === "horizontal" ? "items-end" : undefined,
        contentClassName,
      )}
      description={
        description ? <span id={descriptionId}>{description}</span> : undefined
      }
      descriptionClassName={descriptionClassName}
      errorClassName={errorClassName}
      errors={errors}
      isInvalid={isInvalid}
      label={
        checkedLabel && isChecked ? (
          <span className="flex items-center gap-2">
            {label}
            <span className="text-muted-foreground text-xs font-normal">
              {checkedLabel}
            </span>
          </span>
        ) : (
          label
        )
      }
      labelClassName={labelClassName}
      orientation={orientation}
    >
      <Switch
        aria-describedby={describedBy}
        aria-errormessage={isInvalid ? errorId : undefined}
        aria-invalid={isInvalid}
        checked={isChecked}
        className={switchClassName}
        disabled={disabled}
        id={controlId}
        name={name ?? field.name}
        onBlur={field.handleBlur}
        onCheckedChange={(checked: boolean) =>
          field.handleChange(checked as never)
        }
      />
    </AsymFieldShell>
  );
}

function AsymSubmitButton({
  children,
  disabled,
  pendingChildren,
  ...props
}: AsymSubmitButtonProps) {
  const form = useAsymFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ canSubmit, isSubmitting }) => (
        <Button
          disabled={disabled || !canSubmit || isSubmitting}
          type="submit"
          {...props}
        >
          {isSubmitting ? (pendingChildren ?? children) : children}
        </Button>
      )}
    </form.Subscribe>
  );
}

const asymFieldComponents = {
  NumberField: AsymNumberField,
  SelectField: AsymSelectField,
  SwitchField: AsymSwitchField,
  TextField: AsymTextField,
  TextareaField: AsymTextareaField,
};

const asymFormComponents = {
  SubmitButton: AsymSubmitButton,
};

export function createAsymFormHook<
  const TFieldComponents extends Record<
    string,
    React.ComponentType<Record<string, unknown>>
  > = Record<never, never>,
  const TFormComponents extends Record<
    string,
    React.ComponentType<Record<string, unknown>>
  > = Record<never, never>,
>({
  fieldComponents,
  formComponents,
}: {
  fieldComponents?: TFieldComponents;
  formComponents?: TFormComponents;
} = {}) {
  return createFormHook({
    fieldComponents: {
      ...asymFieldComponents,
      ...fieldComponents,
    } as typeof asymFieldComponents & TFieldComponents,
    fieldContext: asymFieldContext,
    formComponents: {
      ...asymFormComponents,
      ...formComponents,
    } as typeof asymFormComponents & TFormComponents,
    formContext: asymFormContext,
  });
}

const defaultAsymFormHook = createAsymFormHook();

const useAsymForm = defaultAsymFormHook.useAppForm;
const withAsymForm = defaultAsymFormHook.withForm;
const withAsymFieldGroup = defaultAsymFormHook.withFieldGroup;

export {
  AsymNumberField,
  AsymSelectField,
  AsymSubmitButton,
  AsymSwitchField,
  AsymTextField,
  AsymTextareaField,
  asymFieldComponents,
  asymFormComponents,
  useAsymFieldContext,
  useAsymForm,
  useAsymFormContext,
  withAsymFieldGroup,
  withAsymForm,
};
