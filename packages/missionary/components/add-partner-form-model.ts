import { z } from "zod";

const PARTNER_TYPE_VALUES = ["Individual", "Organization", "Church"] as const;

const PARTNER_FREQUENCY_VALUES = [
  "Monthly",
  "One-Time",
  "Annually",
  "Irregular",
] as const;

export const partnerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phone: z.string(),
  type: z.enum(PARTNER_TYPE_VALUES),
  frequency: z.enum(PARTNER_FREQUENCY_VALUES),
  location: z.string().trim().min(2, "Location is required"),
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;

export type PartnerCommandBody = {
  name: string;
  email: string;
  phone: string | null;
  type: PartnerFormValues["type"];
  frequency: PartnerFormValues["frequency"];
  location: string;
};

export function createInitialPartnerFormValues(): PartnerFormValues {
  return {
    name: "",
    email: "",
    phone: "",
    type: "Individual",
    frequency: "Monthly",
    location: "",
  };
}

export function toPartnerCommandBody(
  values: PartnerFormValues,
): PartnerCommandBody {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    type: values.type,
    frequency: values.frequency,
    location: values.location.trim(),
  };
}

function sameText(value: string) {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

export function partnerIntent(values: PartnerFormValues): string {
  return JSON.stringify([
    sameText(values.name),
    sameText(values.email).toLowerCase(),
    sameText(values.phone) || null,
    values.type,
    values.frequency,
    sameText(values.location),
  ]);
}
