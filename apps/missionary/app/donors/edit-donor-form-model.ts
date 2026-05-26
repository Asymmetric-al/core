import { z } from "zod";

const DONOR_TYPE_VALUES = ["Individual", "Organization", "Church"] as const;
const DONOR_STATUS_VALUES = ["Active", "Lapsed", "New", "At Risk"] as const;
const PREFERRED_CONTACT_VALUES = ["email", "phone", "text"] as const;

export const editDonorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string(),
  mobile: z.string(),
  work_phone: z.string(),
  preferred_contact: z.enum(PREFERRED_CONTACT_VALUES),
  type: z.enum(DONOR_TYPE_VALUES),
  status: z.enum(DONOR_STATUS_VALUES),
  frequency: z.string(),
  location: z.string(),
  website: z.string(),
  organization: z.string(),
  title: z.string(),
  spouse: z.string(),
  birthday: z.string(),
  anniversary: z.string(),
  notes: z.string(),
  street: z.string(),
  street2: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
});

export type EditDonorFormValues = z.infer<typeof editDonorSchema>;

export type EditDonorFormSource = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  work_phone?: string | null;
  preferred_contact?: "email" | "phone" | "text" | null;
  type?: "Individual" | "Organization" | "Church" | null;
  status?: "Active" | "Lapsed" | "New" | "At Risk" | null;
  frequency?: string | null;
  location?: string | null;
  website?: string | null;
  organization?: string | null;
  title?: string | null;
  spouse?: string | null;
  birthday?: string | null;
  anniversary?: string | null;
  notes?: string | null;
  address?: {
    street?: string | null;
    street2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  } | null;
};

export function createInitialEditDonorFormValues(
  donor?: EditDonorFormSource | null,
): EditDonorFormValues {
  return {
    name: donor?.name || "",
    email: donor?.email || "",
    phone: donor?.phone || "",
    mobile: donor?.mobile || "",
    work_phone: donor?.work_phone || "",
    preferred_contact: donor?.preferred_contact || "email",
    type: donor?.type || "Individual",
    status: donor?.status || "Active",
    frequency: donor?.frequency || "Monthly",
    location: donor?.location || "",
    website: donor?.website || "",
    organization: donor?.organization || "",
    title: donor?.title || "",
    spouse: donor?.spouse || "",
    birthday: donor?.birthday || "",
    anniversary: donor?.anniversary || "",
    notes: donor?.notes || "",
    street: donor?.address?.street || "",
    street2: donor?.address?.street2 || "",
    city: donor?.address?.city || "",
    state: donor?.address?.state || "",
    zip: donor?.address?.zip || "",
  };
}
