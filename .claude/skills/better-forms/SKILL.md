---
name: better-forms
description: Complete guide for building accessible, high-UX forms in modern stacks (React/Next.js, Tailwind, Zod). Includes specific patterns for clickable areas, range sliders, output-inspired design, and WCAG compliance.
version: 2.1.0
---

# Better Forms Guide

A collection of specific UX patterns, accessibility standards, and implementation techniques for modern web forms. This guide bridges the gap between raw HTML/CSS tips and component-based architectures (React, Tailwind, Headless UI).

## 1. High-Impact UX Patterns (The "Why" & "How")

### Avoid "Dead Zones" in Lists

**Concept**: Small gaps between clickable list items create frustration.
**Implementation (Tailwind)**: Use a pseudo-element to expand the hit area without affecting layout.

```tsx
// Do this for list items or radio groups
<div className="relative group">
  <input type="radio" className="..." />
  <label className="... after:absolute after:inset-y-[-10px] after:left-0 after:right-0 after:content-['']">
    Option Label
  </label>
</div>
```

### Range Sliders > Min/Max Inputs

**Concept**: "From $10 to $1000" text inputs are tedious.
**Implementation**: Use a dual-thumb slider component (like Radix UI / Shadcn Slider) for ranges.

- **Why**: Cognitive load reduction and immediate visual feedback.
- **A11y**: Ensure the slider supports arrow key navigation.

### "Output-Inspired" Design

**Concept**: The form inputs should visually resemble the final result card/page.

- **Hierarchy**: If the output title is `text-2xl font-bold`, the input for it should be `text-2xl font-bold`.
- **Placement**: If the image goes on the left in the listing, the upload button goes on the left in the form.
- **Empty States**: Preview what the empty card looks like while filling it.

### Descriptive Action Buttons

**Concept**: Never use "Submit" or "Send". The button should complete the sentence "I want to..."

- Avoid: `Submit`
- Prefer: `Create Account`, `Publish Listing`, `Update Profile`
  **Tip**: Update button text dynamically based on form state (e.g., "Saving..." vs "Save Changes").

### "Optional" Label > Asterisks

**Concept**: Red asterisks (\*) are aggressive and ambiguous (sometimes meaning "error").
**Implementation**: Mark required fields by default (no indicator) and explicitly label optional ones.

```tsx
<Label>
  Phone Number{" "}
  <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
</Label>
```

### Show/Hide Password

**Concept**: Masking passwords by default prevents error correction.
**Implementation**: Always include a toggle button inside the input wrapper.

- **A11y**: The toggle button must have `type="button"` and `aria-label="Show password"`.

### Field Sizing as Affordance

**Concept**: The width of the input suggests the expected data length.

- **Zip Code**: `w-20` or `w-24` (not full width).
- **CVV**: Small width.
- **Street Address**: Full width.

## 2. Advanced UX Patterns

### Input Masking & Formatting

**Concept**: Auto-format data as the user types to reduce errors and cognitive load.

```tsx
// Phone number formatting with react-number-format
import { PatternFormat } from "react-number-format";

<PatternFormat
  format="(###) ###-####"
  mask="_"
  allowEmptyFormatting
  customInput={Input} // Your styled input component
  onValueChange={(values) => {
    // values.value = "1234567890" (raw)
    // values.formattedValue = "(123) 456-7890"
    form.setValue("phone", values.value);
  }}
/>;

// Credit card with automatic spacing
<PatternFormat
  format="#### #### #### ####"
  customInput={Input}
  onValueChange={(values) => form.setValue("cardNumber", values.value)}
/>;

// Currency input
import { NumericFormat } from "react-number-format";

<NumericFormat
  thousandSeparator=","
  prefix="$"
  decimalScale={2}
  fixedDecimalScale
  customInput={Input}
  onValueChange={(values) => form.setValue("amount", values.floatValue)}
/>;
```

**Key Principle**: Store raw values, display formatted values. Never validate formatted strings.

### OTP / 2FA Code Inputs

**Concept**: 6-digit verification codes need special handling for paste, auto-focus, and keyboard navigation.

```tsx
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  ClipboardEvent,
  KeyboardEvent,
} from "react";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
}

export function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Keep state aligned with dynamic length changes.
  useEffect(() => {
    setValues((prev) => {
      if (prev.length === length) return prev;
      const next = prev.slice(0, length);
      while (next.length < length) next.push("");
      return next;
    });
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const focusInput = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, length - 1));
      inputRefs.current[clampedIndex]?.focus();
    },
    [length],
  );

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newValues = [...values];
    newValues[index] = value.slice(-1); // Take last digit only
    setValues(newValues);

    if (value && index < length - 1) {
      focusInput(index + 1);
    }

    const code = newValues.join("");
    if (code.length === length) {
      onComplete(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Backspace":
        if (!values[index] && index > 0) {
          focusInput(index - 1);
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusInput(index - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        focusInput(index + 1);
        break;
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (pastedData) {
      const newValues = [...values];
      pastedData.split("").forEach((char, i) => {
        newValues[i] = char;
      });
      setValues(newValues);
      focusInput(pastedData.length - 1);

      if (pastedData.length === length) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="flex gap-2" role="group" aria-label="Verification code">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="h-12 w-12 text-center text-lg font-semibold border rounded-md
                     focus:ring-2 focus:ring-ring focus:border-transparent"
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  );
}
```

### Unsaved Changes Protection

**Concept**: Prevent accidental data loss when navigating away from a dirty form.

**Note (React 19)**: Don't confuse `useFormState` from `react-hook-form` with React DOM's `useFormState`, which was renamed to `useActionState` in React 19.

**Warning**: Monkey-patching `router.push` is fragile and may break across Next.js versions. There is no stable API for intercepting App Router navigation. The `beforeunload` approach is the only reliable part. Consider using `onBeforePopState` (Pages Router) or a route change event listener if your framework supports it.

```tsx
import { useEffect } from "react";
import { useFormState } from "react-hook-form";

export function useUnsavedChangesWarning(isDirty: boolean, message?: string) {
  const warningMessage =
    message ?? "You have unsaved changes. Are you sure you want to leave?";

  // Browser back/refresh — this is the reliable approach
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // For in-app navigation, consider a confirmation modal triggered
  // from your navigation components rather than monkey-patching the router.
}

// Usage with React Hook Form
function EditProfileForm() {
  const form = useForm<ProfileData>();
  const { isDirty } = useFormState({ control: form.control });

  useUnsavedChangesWarning(isDirty);

  return <form>...</form>;
}
```

### Multi-Step Forms (Wizards)

**Concept**: Break complex forms into digestible steps with proper state persistence and focus management.

```tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const MIN_WIZARD_STEP = 1;
const MAX_WIZARD_STEP = 3;

function clampStep(step: number) {
  if (!Number.isFinite(step)) return MIN_WIZARD_STEP;
  return Math.min(MAX_WIZARD_STEP, Math.max(MIN_WIZARD_STEP, step));
}

// Persist state to URL for refresh resilience
// Uses lazy state init to read from URL on first render (SSR-safe)
function useStepFromURL() {
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return MIN_WIZARD_STEP;
    const params = new URLSearchParams(window.location.search);
    return clampStep(parseInt(params.get("step") ?? String(MIN_WIZARD_STEP), 10));
  });

  const goToStep = useCallback((newStep: number) => {
    const clampedStep = clampStep(newStep);
    setStep(clampedStep);
    const url = new URL(window.location.href);
    url.searchParams.set("step", String(clampedStep));
    window.history.pushState({}, "", url);
  }, []);

  return { step, goToStep };
}

// Focus management on step change
function useStepFocus(step: number) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Focus the step heading for screen reader announcement
    headingRef.current?.focus();
  }, [step]);

  return headingRef;
}

// Example multi-step form
interface WizardFormData {
  // Step 1
  firstName: string;
  lastName: string;
  // Step 2
  email: string;
  phone?: string;
  // Step 3
  address: string;
  city: string;
}

const stepSchemas = {
  1: z.object({ firstName: z.string().min(1), lastName: z.string().min(1) }),
  2: z.object({ email: z.string().email(), phone: z.string().optional() }),
  3: z.object({ address: z.string().min(1), city: z.string().min(1) }),
};

export function WizardForm() {
  const { step, goToStep } = useStepFromURL();
  const headingRef = useStepFocus(step);
  const totalSteps = MAX_WIZARD_STEP;
  const canUseStorage =
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined";

  const form = useForm<WizardFormData>({
    resolver: zodResolver(stepSchemas[step as keyof typeof stepSchemas]),
    mode: "onBlur",
  });

  // Persist draft to localStorage
  useEffect(() => {
    if (!canUseStorage) return;
    const saved = localStorage.getItem("wizard-draft");
    if (saved) {
      form.reset(JSON.parse(saved));
    }
  }, [canUseStorage, form]);

  useEffect(() => {
    if (!canUseStorage) return;
    const subscription = form.watch((data) => {
      localStorage.setItem("wizard-draft", JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [canUseStorage, form]);

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid && step < totalSteps) {
      goToStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) goToStep(step - 1);
  };

  const onSubmit = (data: WizardFormData) => {
    console.log("Wizard submit", data);
    if (canUseStorage) {
      localStorage.removeItem("wizard-draft");
    }
  };

  const StepOne = () => (
    <div className="grid gap-4">
      <label>
        First name
        <input {...form.register("firstName")} />
      </label>
      <label>
        Last name
        <input {...form.register("lastName")} />
      </label>
    </div>
  );

  const StepTwo = () => (
    <div className="grid gap-4">
      <label>
        Email
        <input type="email" {...form.register("email")} />
      </label>
      <label>
        Phone (optional)
        <input type="tel" {...form.register("phone")} />
      </label>
    </div>
  );

  const StepThree = () => (
    <div className="grid gap-4">
      <label>
        Address
        <input {...form.register("address")} />
      </label>
      <label>
        City
        <input {...form.register("city")} />
      </label>
    </div>
  );

  return (
    <FormProvider {...form}>
      {/* Progress indicator */}
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        Step {step} of {totalSteps}
      </div>

      {/* Step heading - focused on navigation */}
      <h2 ref={headingRef} tabIndex={-1} className="outline-none">
        {step === 1 && "Personal Information"}
        {step === 2 && "Contact Details"}
        {step === 3 && "Address"}
      </h2>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {step === 1 && <StepOne />}
        {step === 2 && <StepTwo />}
        {step === 3 && <StepThree />}

        <div className="flex gap-4 mt-6">
          {step > 1 && (
            <button type="button" onClick={handleBack}>
              Back
            </button>
          )}
          {step < totalSteps ? (
            <button type="button" onClick={handleNext}>
              Continue
            </button>
          ) : (
            <button type="submit">Complete Registration</button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
```

## 3. Backend Integration Patterns

### Server-Side Error Mapping

**Concept**: Map API validation errors back to specific form fields.

```tsx
import { useForm, UseFormReturn } from "react-hook-form";

interface APIError {
  field: string;
  message: string;
}

interface APIResponse {
  success: boolean;
  errors?: APIError[];
}

// Usage: pass form instance and call inside component
function useServerErrorHandler<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
) {
  return async (data: T) => {
    const response = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result: APIResponse = await response.json();

    if (!result.success && result.errors) {
      // Map server errors to form fields
      result.errors.forEach((error) => {
        form.setError(error.field as keyof T & string, {
          type: "server",
          message: error.message,
        });
      });

      // Focus the first errored field
      const firstErrorField = result.errors[0]?.field;
      if (firstErrorField) {
        form.setFocus(firstErrorField as keyof T & string);
      }
      return;
    }

    // Success handling
  };
}

// For nested errors (e.g., "address.city")
function mapNestedError(form: UseFormReturn, path: string, message: string) {
  form.setError(path as any, { type: "server", message });
}
```

### Debounced Async Validation

**Concept**: Validate expensive fields (username availability) without API overload.

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";

// Custom hook for async field validation
// Uses ref for validateFn to keep debounce stable and avoid timer resets.
// Cancels in-flight debounced calls on unmount to prevent memory leaks.
function useAsyncValidation<T>(
  validateFn: (value: T) => Promise<string | null>,
  delay = 500,
) {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const validateFnRef = useRef(validateFn);
  validateFnRef.current = validateFn;

  const debouncedValidate = useMemo(
    () =>
      debounce(async (value: T) => {
        setIsValidating(true);
        try {
          const result = await validateFnRef.current(value);
          setError(result);
        } finally {
          setIsValidating(false);
        }
      }, delay),
    [delay],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => () => debouncedValidate.cancel(), [debouncedValidate]);

  return { validate: debouncedValidate, isValidating, error };
}

// Usage with React Hook Form
// Validation runs in the onChange handler (not via effects) to avoid
// race conditions and unnecessary re-renders.
function UsernameField() {
  const {
    register,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const [isChecking, setIsChecking] = useState(false);

  const checkUsername = async (value: string): Promise<string | null> => {
    if (!value || value.length < 3) return null;
    try {
      const response = await fetch(
        `/api/check-username?username=${encodeURIComponent(value)}`,
      );
      if (!response.ok) {
        return "Unable to validate username right now";
      }

      const { available } = (await response.json()) as { available?: boolean };
      if (typeof available !== "boolean") {
        return "Unable to validate username right now";
      }

      return available ? null : "This username is already taken";
    } catch {
      return "Unable to validate username right now";
    }
  };

  const { validate, isValidating, error } = useAsyncValidation(checkUsername);

  // Derive combined checking state
  const showChecking = isChecking || isValidating;

  // Clear the optimistic checking flag when async validation settles.
  useEffect(() => {
    if (!isValidating) {
      setIsChecking(false);
    }
  }, [isValidating]);

  // Reflect async availability result into RHF field error state.
  useEffect(() => {
    if (isValidating) return;
    if (error) {
      setError("username", { type: "validate", message: error });
    } else {
      clearErrors("username");
    }
  }, [error, isValidating, setError, clearErrors]);

  const { onChange: rhfOnChange, ...rest } = register("username", {
    onChange: (e) => {
      const value = e.target.value;
      if (value && value.length >= 3) {
        setIsChecking(true);
        validate(value);
      } else {
        setIsChecking(false);
        clearErrors("username");
      }
    },
    // Also validate via RHF's built-in async validate for submit-time
    validate: async (value) => {
      const result = await checkUsername(value);
      return result ?? true;
    },
  });

  return (
    <div>
      <input onChange={rhfOnChange} {...rest} />
      {showChecking && (
        <span className="text-muted-foreground">Checking...</span>
      )}
      {errors.username?.message && (
        <span className="text-destructive">
          {String(errors.username.message)}
        </span>
      )}
    </div>
  );
}
```

### Optimistic Updates

**Concept**: Show immediate feedback while the request is in flight.

```tsx
import { useTransition, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

function ProfileForm() {
  const [isPending, startTransition] = useTransition();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [optimisticData, setOptimisticData] = useState<ProfileData | null>(
    null,
  );

  async function handleSubmit(data: ProfileData) {
    // Immediately show optimistic update
    setOptimisticData(data);
    setSubmitState("submitting");

    startTransition(async () => {
      try {
        await updateProfile(data);
        setSubmitState("success");

        // Clear success state after delay
        setTimeout(() => setSubmitState("idle"), 2000);
      } catch (error) {
        // Revert optimistic update
        setOptimisticData(null);
        setSubmitState("error");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Show optimistic preview */}
      {optimisticData && (
        <div className="opacity-70">Preview: {optimisticData.name}</div>
      )}

      <button type="submit" disabled={isPending}>
        {submitState === "submitting" && "Saving..."}
        {submitState === "success" && "Saved!"}
        {submitState === "error" && "Try Again"}
        {submitState === "idle" && "Save Changes"}
      </button>
    </form>
  );
}
```

## 4. Complex Component Patterns

### Accessible File Upload (Drag & Drop)

**Concept**: Drag-and-drop zones are often inaccessible. Ensure keyboard and screen reader support.

```tsx
import { useCallback, useId, useState, useRef } from "react";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // bytes
  onUpload: (files: File[]) => void;
}

export function AccessibleFileUpload({
  accept,
  maxSize,
  onUpload,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneId = useId();
  const errorId = `${dropzoneId}-error`;

  const handleFiles = useCallback(
    (files: FileList | null) => {
      setError(null);
      if (!files?.length) return;

      const validFiles: File[] = [];
      const oversizedFiles: string[] = [];
      Array.from(files).forEach((file) => {
        if (maxSize && file.size > maxSize) {
          oversizedFiles.push(file.name);
          return;
        }
        validFiles.push(file);
      });

      if (oversizedFiles.length) {
        setError(
          oversizedFiles.length === 1
            ? `${oversizedFiles[0]} exceeds maximum size`
            : `${oversizedFiles.length} files exceed maximum size: ${oversizedFiles.join(", ")}`,
        );
      }

      if (validFiles.length) {
        onUpload(validFiles);
      }
    },
    [maxSize, onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div>
      {/* Hidden but accessible file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
        id={dropzoneId}
        aria-describedby={error ? errorId : undefined}
      />

      {/* Clickable and keyboard-accessible dropzone */}
      <label
        htmlFor={dropzoneId}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer",
          "hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring",
          isDragOver && "border-primary bg-primary/5",
          error && "border-destructive",
        )}
      >
        <UploadIcon className="h-10 w-10 text-muted-foreground mb-2" />
        <span className="text-sm font-medium">
          Drop files here or click to browse
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {accept && `Accepted: ${accept}`}
          {maxSize && ` (Max: ${formatBytes(maxSize)})`}
        </span>
      </label>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
```

### Accessible Combobox (Searchable Select)

**Concept**: Native `<select>` is limited. Use a proper combobox pattern for search/filter.

```tsx
import { useState, useRef, useId, KeyboardEvent } from "react";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const inputId = useId();
  const listboxId = `${inputId}-listbox`;

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase()),
  );

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (option: ComboboxOption) => {
    onChange(option.value);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex((prev) =>
            Math.min(prev + 1, filteredOptions.length - 1),
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && filteredOptions[activeIndex]) {
          handleSelect(filteredOptions[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setQuery("");
        break;
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-autocomplete="list"
        value={query || selectedOption?.label || ""}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border rounded-md"
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={cn(
                "px-3 py-2 cursor-pointer",
                index === activeIndex && "bg-accent",
                option.value === value && "font-medium",
              )}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {isOpen && filteredOptions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 px-3 py-2 bg-background border rounded-md">
          No results found
        </div>
      )}
    </div>
  );
}
```

### Date Picker Strategy

**Concept**: Choose the right approach based on use case and accessibility needs.

```tsx
// OPTION 1: Native input (Best for mobile, simple use cases)
// Pros: Native a11y, mobile keyboards, no JS
// Cons: Limited styling, inconsistent across browsers
<input
  type="date"
  min="2024-01-01"
  max="2025-12-31"
  className="px-3 py-2 border rounded-md"
/>

// OPTION 2: Three separate selects (Best for birthdays, fixed ranges)
// Pros: Accessible, no calendar needed for known dates
// Cons: More inputs to manage
function BirthdatePicker({ value, onChange }: DatePickerProps) {
  const [month, day, year] = value ? value.split("-") : ["", "", ""];

  return (
    <fieldset>
      <legend className="text-sm font-medium mb-2">Date of Birth</legend>
      <div className="flex gap-2">
        <select
          aria-label="Month"
          value={month}
          onChange={(e) => onChange(`${e.target.value}-${day}-${year}`)}
        >
          <option value="">Month</option>
          {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select aria-label="Day" value={day} onChange={...}>
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, "0")}>{i + 1}</option>
          ))}
        </select>
        <select aria-label="Year" value={year} onChange={...}>
          <option value="">Year</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </fieldset>
  );
}

// OPTION 3: Calendar picker (For date ranges, scheduling)
// Use a tested library: react-day-picker, @radix-ui/react-calendar
// Key a11y requirements:
// - Arrow key navigation
// - Announce selected date to screen readers
// - Trap focus within calendar when open
// - Close on Escape
// See: https://react-day-picker.js.org/guides/accessibility
```

## 5. Accessibility Deep Dive

### Reduced Motion Support

**Concept**: Respect user preferences for reduced animations.

```tsx
// Hook to detect preference
function usePrefersReducedMotion() {
  // Lazy init: read actual value on first render to avoid animation flash
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// Usage in validation animations
function ErrorMessage({ message }: { message: string }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <p
      role="alert"
      className={cn(
        "text-sm text-destructive",
        !prefersReducedMotion && "animate-shake", // Only animate if allowed
      )}
    >
      {message}
    </p>
  );
}

// Tailwind config for reduced motion
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        shake: "shake 0.3s ease-in-out",
      },
    },
  },
};

// In CSS, use motion-safe/motion-reduce variants
// <div className="motion-safe:animate-shake motion-reduce:animate-none">
```

### Forced Colors (High Contrast Mode)

**Concept**: Windows High Contrast mode removes background colors. Borders become critical.

```tsx
// Problem: Red border for errors disappears in High Contrast mode
// Solution: Use forced-colors variant and ensure visible borders

<input
  className={cn(
    "border rounded-md",
    error && "border-destructive",
    // High contrast fallback - ensure border is always visible
    "forced-colors:border-[CanvasText]",
    error && "forced-colors:border-[Mark]" // System highlight color
  )}
/>

// For icons that convey meaning, ensure they have forced-colors support
<CheckIcon
  className="text-success forced-colors:text-[Highlight]"
  aria-hidden="true"
/>

// Error indicators need text backup, not just color
{error && (
  <span className="flex items-center gap-1 text-destructive">
    <AlertIcon className="h-4 w-4 forced-colors:text-[Mark]" aria-hidden="true" />
    <span>{error}</span> {/* Text is always readable */}
  </span>
)}
```

### Live Regions for Global Feedback

**Concept**: Announce form success/error to screen readers using aria-live regions.

```tsx
import { createContext, useContext, useState, useCallback } from "react";

interface Announcement {
  message: string;
  type: "polite" | "assertive";
}

const AnnouncerContext = createContext<{
  announce: (message: string, type?: "polite" | "assertive") => void;
} | null>(null);

// Provider component - add to app root
export function AnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  const announce = useCallback(
    (message: string, type: "polite" | "assertive" = "polite") => {
      // Clear first to ensure re-announcement of same message
      setAnnouncement(null);
      requestAnimationFrame(() => {
        setAnnouncement({ message, type });
      });
    },
    [],
  );

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}

      {/* Visually hidden live regions */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement?.type === "polite" && announcement.message}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {announcement?.type === "assertive" && announcement.message}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnounce() {
  const context = useContext(AnnouncerContext);
  if (!context)
    throw new Error("useAnnounce must be used within AnnouncerProvider");
  return context.announce;
}

// Usage in form submission
function ContactForm() {
  const announce = useAnnounce();

  async function onSubmit(data: FormData) {
    try {
      await submitForm(data);
      announce(
        "Form submitted successfully. We'll be in touch soon.",
        "polite",
      );
    } catch (error) {
      announce(
        "Form submission failed. Please check the errors and try again.",
        "assertive",
      );
    }
  }
}

// Integration with Sonner/Radix Toast (ensure a11y)
import { toast } from "sonner";

// Sonner automatically handles aria-live, but verify:
toast.success("Profile updated", {
  description: "Your changes have been saved.",
  // Sonner uses role="status" which is aria-live="polite" by default
});

toast.error("Upload failed", {
  description: "The file was too large.",
  // For errors, consider if assertive is needed
});
```

## 6. Testing & Documentation

### Unit Testing with React Testing Library

**Concept**: Test user interactions, not implementation details.

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  it("shows validation errors on submit with empty fields", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /email is required/i,
    );
  });

  it("submits successfully with valid data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/message/i), "Hello world");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "test@example.com",
        message: "Hello world",
      });
    });
  });

  it("disables submit button while loading", async () => {
    const user = userEvent.setup();
    const slowSubmit = vi.fn(() => new Promise((r) => setTimeout(r, 100)));
    render(<ContactForm onSubmit={slowSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/message/i), "Hello");

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/sending/i);
  });

  it("handles server errors gracefully", async () => {
    const user = userEvent.setup();
    const failingSubmit = vi.fn().mockRejectedValue(new Error("Server error"));
    render(<ContactForm onSubmit={failingSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/message/i), "Hello");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /something went wrong/i,
    );
  });

  it("is keyboard accessible", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Tab through all fields
    await user.tab();
    expect(screen.getByLabelText(/email/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/message/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /send message/i })).toHaveFocus();
  });
});
```

### Storybook Documentation

**Concept**: Document all form component states for design system consistency.

```tsx
// SmartInput.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { SmartInput } from "./SmartInput";

const meta: Meta<typeof SmartInput> = {
  title: "Forms/SmartInput",
  component: SmartInput,
  parameters: {
    docs: {
      description: {
        component:
          "Accessible input component with built-in label, description, error handling, and password toggle.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "tel", "url"],
    },
    error: { control: "text" },
    description: { control: "text" },
    isOptional: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SmartInput>;

export const Default: Story = {
  args: {
    label: "Email Address",
    placeholder: "you@example.com",
  },
};

export const WithDescription: Story = {
  args: {
    label: "Username",
    description: "This will be your public display name",
    placeholder: "johndoe",
  },
};

export const WithError: Story = {
  args: {
    label: "Email Address",
    error: "Please enter a valid email address",
    defaultValue: "invalid-email",
  },
};

export const Optional: Story = {
  args: {
    label: "Phone Number",
    isOptional: true,
    placeholder: "(555) 123-4567",
  },
};

export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    description: "Must be at least 8 characters",
  },
};

export const Disabled: Story = {
  args: {
    label: "Email Address",
    disabled: true,
    defaultValue: "disabled@example.com",
  },
};

export const Loading: Story = {
  render: () => (
    <div className="space-y-4">
      <SmartInput label="Username" />
      <p className="text-sm text-muted-foreground">Checking availability...</p>
    </div>
  ),
};

// Sizing variations for "Field Sizing as Affordance"
export const FieldSizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <SmartInput label="CVV" widthClass="w-20" maxLength={4} />
      <SmartInput label="Zip Code" widthClass="w-28" />
      <SmartInput label="City" widthClass="w-48" />
    </div>
  ),
};

// Accessibility testing story
export const AccessibilityDemo: Story = {
  render: () => (
    <form className="space-y-4 max-w-md">
      <SmartInput label="Full Name" autoComplete="name" />
      <SmartInput label="Email" type="email" autoComplete="email" />
      <SmartInput
        label="Password"
        type="password"
        autoComplete="new-password"
        description="Minimum 8 characters"
      />
      <SmartInput
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        error="Passwords do not match"
      />
      <button type="submit" className="btn-primary">
        Create Account
      </button>
    </form>
  ),
  parameters: {
    a11y: {
      // Axe accessibility checks
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "label", enabled: true },
        ],
      },
    },
  },
};
```

## 7. Accessibility & Validation (Modern Stack)

### Integration with React Hook Form & Zod

Don't rely on browser defaults alone. Connect library state to ARIA attributes.

```tsx
// Example of connecting RHF errors to ARIA
<input
  {...register("email")}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>;
{
  errors.email && (
    <span id="email-error" role="alert">
      {errors.email.message}
    </span>
  );
}
```

### Mobile Optimization

- **Input Modes**: Critical for triggering the right keyboard on iOS/Android.
  - Numbers (codes): `inputMode="numeric"` pattern="[0-9]\*"
  - Email: `inputMode="email"`
  - Search: `inputMode="search"` (adds "Go" button)
- **Touch Targets**: Min `44px` height (`h-11` in Tailwind default config usually works well).

## 8. Component Implementation Recipe

Here is a `shadcn/ui` style Field component that implements these principles automatically.

```tsx
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// React 19: ref is a regular prop, no forwardRef needed
interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
  label: string;
  error?: string;
  description?: string;
  isOptional?: boolean;
  widthClass?: string; // For "Field Sizing as Affordance"
}

export const SmartInput = ({
  ref,
  label,
  error,
  description,
  isOptional,
  widthClass = "w-full",
  className,
  type = "text",
  ...props
}: SmartInputProps) => {
  const id = useId();
  const descriptionId = `${id}-desc`;
  const errorId = `${id}-error`;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={cn("space-y-2", widthClass)}>
      <div className="flex justify-between items-baseline">
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {isOptional && (
            <span className="ml-2 text-muted-foreground font-normal text-xs">
              (Optional)
            </span>
          )}
        </label>
      </div>

      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={inputType}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={
            [description && descriptionId, error && errorId]
              .filter(Boolean)
              .join(" ") || undefined
          }
          {...props}
        />

        {/* Password Toggle Pattern */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {/* Description linked via ARIA */}
      {description && !error && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {/* Error Message with role="alert" */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
};
```

## Checklist for Review

### Layout & UX

- [ ] **Single Column**: Is the form mostly single column? (Exceptions: City/Zip, First/Last Name)
- [ ] **Labels**: Are placeholder labels avoided? (Labels must remain visible while typing)
- [ ] **Buttons**: Does the submit button say what it does? (e.g. "Create Account" vs "Submit")
- [ ] **Affordance**: Are short inputs (CVV) actually short on screen?
- [ ] **Input Masking**: Are formatted fields (phone, credit card, currency) using proper masking?
- [ ] **Unsaved Changes**: Is navigation blocked when form has unsaved changes?

### Accessibility & Code

- [ ] **Focus**: Is the focus ring visible? (Tailwind `focus-visible:ring`)
- [ ] **Click Areas**: Do lists/radios have expanded hit areas? (`inset` tricks)
- [ ] **Semantics**: Are errors linked with `aria-describedby`?
- [ ] **Keyboard**: Can you fill the form without a mouse? (Check password toggles and custom sliders)
- [ ] **Reduced Motion**: Are animations disabled for `prefers-reduced-motion`?
- [ ] **High Contrast**: Do error states work in Windows High Contrast mode? (`forced-colors:`)
- [ ] **Live Regions**: Are success/error messages announced to screen readers?
- [ ] **File Uploads**: Is the drag-and-drop zone keyboard accessible?

### Performance & Backend

- [ ] **Validation**: Is heavy validation (API checks) debounced?
- [ ] **Submission**: Does the button show a loading state and disable to prevent double-submit?
- [ ] **Server Errors**: Are backend validation errors mapped to specific form fields?
- [ ] **Optimistic UI**: Does the form show immediate feedback during submission?

### Testing & Documentation

- [ ] **Unit Tests**: Are critical paths tested with React Testing Library?
- [ ] **Storybook**: Are all component states documented (default, error, loading, disabled)?
- [ ] **A11y Tests**: Are axe or similar tools integrated in tests/Storybook?
