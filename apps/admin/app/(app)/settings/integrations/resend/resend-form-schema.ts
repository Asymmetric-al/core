import { z } from "zod";

const resendApiKeySchema = z
  .string()
  .trim()
  .min(1, "Resend API key is required")
  .regex(/^re_/, "Resend API keys start with re_");

const emailFieldSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

const optionalEmailFieldSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || emailFieldSchema.safeParse(value).success,
    "Enter a valid email address",
  );

export const connectResendSchema = z.object({
  apiKey: resendApiKeySchema,
  fromEmail: emailFieldSchema,
  fromName: z.string().trim().min(1, "From name is required"),
  replyToEmail: optionalEmailFieldSchema,
});

export const testResendEmailSchema = z.object({
  testEmail: emailFieldSchema,
});

export type ResendConnectFormValues = z.infer<typeof connectResendSchema>;
export type ResendTestEmailValues = z.infer<typeof testResendEmailSchema>;

export function toResendConnectPayload(values: ResendConnectFormValues) {
  return {
    apiKey: values.apiKey,
    defaultFromEmail: values.fromEmail,
    defaultFromName: values.fromName,
    replyToEmail: values.replyToEmail || undefined,
  };
}
