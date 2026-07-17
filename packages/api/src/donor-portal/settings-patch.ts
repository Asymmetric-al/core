import { z } from "zod";

export const donorPortalPatchSchema = z
  .object({
    firstName: z.string().trim().max(120).optional(),
    lastName: z.string().trim().max(120).optional(),
    displayName: z.string().trim().max(240).optional(),
    phone: z.string().trim().max(80).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    preferredContact: z.string().trim().max(40).optional(),
    receiptEmailFrequency: z.string().trim().max(40).optional(),
    defaultUpdateFrequency: z.string().trim().max(40).nullable().optional(),
    preferredLanguage: z.string().trim().max(20).optional(),
    doNotContact: z.boolean().optional(),
    doNotEmail: z.boolean().optional(),
    givingPreferences: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type DonorSettingsPatch = z.infer<typeof donorPortalPatchSchema>;

/** Split a snapshot `displayName` into first/last for prefill (last = remainder). */
export function splitDisplayName(displayName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const trimmed = (displayName ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const [firstName = "", ...rest] = trimmed.split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

export interface DonorProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

/** Prefill the settings profile form from the live snapshot (splits displayName). */
export function buildProfileFormState(input: {
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}): DonorProfileFormState {
  const { firstName, lastName } = splitDisplayName(input.displayName);
  return {
    firstName,
    lastName,
    email: input.email ?? "",
    phone: input.phone ?? "",
    avatarUrl: input.avatarUrl ?? "",
  };
}

export function buildDonorSettingsPatch(
  input: DonorSettingsPatch,
): DonorSettingsPatch {
  const parsed = donorPortalPatchSchema.parse(input);
  const patch: DonorSettingsPatch = {};

  if (parsed.firstName !== undefined) patch.firstName = parsed.firstName;
  if (parsed.lastName !== undefined) patch.lastName = parsed.lastName;
  if (parsed.displayName !== undefined) patch.displayName = parsed.displayName;
  if (parsed.phone !== undefined) patch.phone = parsed.phone;
  if (parsed.avatarUrl !== undefined) patch.avatarUrl = parsed.avatarUrl;
  if (parsed.preferredContact !== undefined) {
    patch.preferredContact = parsed.preferredContact;
  }
  if (parsed.receiptEmailFrequency !== undefined) {
    patch.receiptEmailFrequency = parsed.receiptEmailFrequency;
  }
  if (parsed.defaultUpdateFrequency !== undefined) {
    patch.defaultUpdateFrequency = parsed.defaultUpdateFrequency;
  }
  if (parsed.preferredLanguage !== undefined) {
    patch.preferredLanguage = parsed.preferredLanguage;
  }
  if (parsed.doNotContact !== undefined) {
    patch.doNotContact = parsed.doNotContact;
  }
  if (parsed.doNotEmail !== undefined) patch.doNotEmail = parsed.doNotEmail;
  if (parsed.givingPreferences !== undefined) {
    patch.givingPreferences = parsed.givingPreferences;
  }

  return patch;
}

export type DonorProfileSettingsPatchResult =
  | { ok: true; patch: DonorSettingsPatch }
  | { ok: false; errorMessage: string };

export function buildDonorProfileSettingsPatch(input: {
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string;
}): DonorProfileSettingsPatchResult {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName) {
    return { ok: false, errorMessage: "First name is required." };
  }
  if (!lastName) {
    return { ok: false, errorMessage: "Last name is required." };
  }

  const patch = {
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`,
    phone: input.phone.trim() || null,
    avatarUrl: input.avatarUrl.trim() || null,
  };

  const parsedPatch = donorPortalPatchSchema.safeParse(patch);
  if (!parsedPatch.success) {
    return { ok: false, errorMessage: "Please check your profile details." };
  }

  return {
    ok: true,
    patch: buildDonorSettingsPatch(parsedPatch.data),
  };
}
