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
  phone: z.string(),
  type: z.enum(PARTNER_TYPE_VALUES),
  frequency: z.enum(PARTNER_FREQUENCY_VALUES),
  location: z.string().trim().min(2, "Location is required"),
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;

export type PartnerCommandBody = {
  name: string;
  phone: string | null;
  type: PartnerFormValues["type"];
  frequency: PartnerFormValues["frequency"];
  location: string;
};

export function createInitialPartnerFormValues(): PartnerFormValues {
  return {
    name: "",
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
    phone: values.phone.trim() || null,
    type: values.type,
    frequency: values.frequency,
    location: values.location.trim(),
  };
}

const STRIPPED =
  /[\u0001-\u0008\u000E-\u001F\u007F-\u0084\u0086-\u009F\u00AD\u034F\u061C\u070F\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2800\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFFB\u{13430}-\u{1343F}\u{13441}-\u{13442}\u{1BCA0}-\u{1BCA3}\u{1D159}\u{1D173}-\u{1D17A}\u{E0000}-\u{E0FFF}]/gu;

const SPACES =
  /[\u0009-\u000D\u0020\u0085\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/gu;

function sameText(value: string) {
  return value
    .replace(STRIPPED, "")
    .normalize("NFC")
    .replace(SPACES, " ")
    .trim();
}

export function partnerIntent(values: PartnerFormValues): string {
  return JSON.stringify([
    sameText(values.name),
    sameText(values.phone) || null,
    values.type,
    values.frequency,
    sameText(values.location),
  ]);
}
