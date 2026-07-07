/**
 * Donor settings form → PATCH body helpers.
 * The PATCH /api/donor/portal Zod schema is `.strict()`, so any unsupported key
 * makes the whole request throw. This builder guarantees only supported, defined
 * keys are sent. Business logic in packages/api; the settings page stays thin.
 */

/** Fields the PATCH schema accepts (mirrors DonorPortalPatch / the Zod schema). */
const SUPPORTED_KEYS = [
  "firstName",
  "lastName",
  "displayName",
  "phone",
  "avatarUrl",
  "preferredContact",
  "receiptEmailFrequency",
  "defaultUpdateFrequency",
  "preferredLanguage",
  "doNotContact",
  "doNotEmail",
  "givingPreferences",
] as const;

export type DonorSettingsPatch = Partial<
  Record<(typeof SUPPORTED_KEYS)[number], unknown>
>;

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

/**
 * Keep only PATCH-supported, defined keys. Unsupported fields (email, address,
 * per-category notification toggles, password/2FA) are dropped — they have no
 * server-side support and would trip the strict schema.
 */
export function buildDonorSettingsPatch(
  input: Record<string, unknown>,
): DonorSettingsPatch {
  const patch: DonorSettingsPatch = {};
  for (const key of SUPPORTED_KEYS) {
    const value = input[key];
    if (value !== undefined) {
      patch[key] = value;
    }
  }
  return patch;
}
