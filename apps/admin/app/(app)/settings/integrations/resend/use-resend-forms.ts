import { useAsymForm } from "@asym/ui/components/primitives/tanstack-form";

import {
  connectResendSchema,
  testResendEmailSchema,
  type ResendConnectFormValues,
  type ResendTestEmailValues,
} from "./resend-form-schema";

interface UseResendConnectFormOptions {
  onSubmit: (values: ResendConnectFormValues) => Promise<void> | void;
}

interface UseResendTestFormOptions {
  onSubmit: (values: ResendTestEmailValues) => Promise<void> | void;
}

export function useResendConnectForm({
  onSubmit,
}: UseResendConnectFormOptions) {
  return useAsymForm({
    defaultValues: {
      apiKey: "",
      fromEmail: "",
      fromName: "",
      replyToEmail: "",
    },
    validators: {
      onChange: connectResendSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });
}

export function useResendTestForm({ onSubmit }: UseResendTestFormOptions) {
  return useAsymForm({
    defaultValues: {
      testEmail: "",
    },
    validators: {
      onChange: testResendEmailSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });
}

export type ResendConnectFormApi = ReturnType<typeof useResendConnectForm>;
export type ResendTestFormApi = ReturnType<typeof useResendTestForm>;
