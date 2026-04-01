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
  email: z.string().email("Invalid email address"),
  phone: z.string(),
  type: z.enum(PARTNER_TYPE_VALUES),
  frequency: z.enum(PARTNER_FREQUENCY_VALUES),
  location: z.string().trim().min(2, "Location is required"),
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;

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

export function toPartnerInsertPayload({
  missionaryId,
  values,
}: {
  missionaryId: string;
  values: PartnerFormValues;
}) {
  return {
    missionary_id: missionaryId,
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    type: values.type,
    frequency: values.frequency,
    location: values.location.trim(),
    status: "Active" as const,
    total_given: 0,
    last_gift_amount: 0,
    score: 70,
  };
}
