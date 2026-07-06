/**
 * Server-side donor-identity redaction for missionary + public surfaces.
 * Source: DONOR_ANONYMITY_GUEST_GIVING_SPEC §7.2 (missionary), §7.3 (public), §8.2 (per-gift vs donor default).
 *
 * LAW (§12.1): anonymity is enforced HERE, in the server-side projection, never
 * only in React. A redacted payload contains ZERO donor identifiers
 * (name/email/phone/avatar/location/tags). A donor is named ONLY when they have
 * NOT chosen anonymity toward that surface. Default is fail-safe: absent a clear
 * signal we still only reveal when explicitly not-anonymous.
 *
 * Signal precedence (spec §8.2): unknown_offline ⇒ always anonymous; else a
 * per-gift flag (Track B `donations.anonymous_to_recipient`, optional until that
 * migration lands) wins; else the donor-level default in `donors.giving_preferences`.
 */

export const ANONYMOUS_DONOR_LABEL = "Anonymous donor";

export type GivingPreferences = {
  defaultAnonymousToRecipient?: boolean | null;
  defaultAnonymousToPublic?: boolean | null;
} | null;

function readPreferences(value: unknown): GivingPreferences {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as GivingPreferences;
  }
  return null;
}

interface AnonymitySignal {
  givingPreferences?: unknown;
  /** Per-gift override from Track B; only honored when it is an explicit boolean. */
  giftAnonymousToRecipient?: boolean | null;
  giftAnonymousToPublic?: boolean | null;
  donorIdentityStatus?: string | null;
}

export function isAnonymousToRecipient(signal: AnonymitySignal): boolean {
  if (signal.donorIdentityStatus === "unknown_offline") return true;
  if (typeof signal.giftAnonymousToRecipient === "boolean") {
    return signal.giftAnonymousToRecipient;
  }
  return (
    readPreferences(signal.givingPreferences)?.defaultAnonymousToRecipient !==
    false
  );
}

export function isAnonymousToPublic(signal: AnonymitySignal): boolean {
  if (signal.donorIdentityStatus === "unknown_offline") return true;
  if (typeof signal.giftAnonymousToPublic === "boolean") {
    return signal.giftAnonymousToPublic;
  }
  return Boolean(
    readPreferences(signal.givingPreferences)?.defaultAnonymousToPublic,
  );
}

/** Fields that must be scrubbed on a redacted donor relationship. */
export interface RedactableDonorRelationship {
  displayName: string;
  email: string | null;
  phone: string | null;
  preferredContact: string;
  avatarUrl: string | null;
  location: string | null;
  tags: string[];
}

/**
 * Missionary donor relationship (§7.2): when anonymous, replace the identity
 * with "Anonymous donor" and null every identifier. Aggregate support stats
 * (amount/date/frequency/count/status) are intentionally preserved.
 */
export function redactDonorRelationshipForMissionary<
  T extends RedactableDonorRelationship,
>(relationship: T, anonymous: boolean): T {
  if (!anonymous) return relationship;
  return {
    ...relationship,
    displayName: ANONYMOUS_DONOR_LABEL,
    email: null,
    phone: null,
    avatarUrl: null,
    location: null,
    preferredContact: "anonymous",
    tags: [],
  };
}

/** Gift (§7.2): break donor correlation by nulling donorId for anonymous gifts. */
export function redactGiftForMissionary<T extends { donorId: string | null }>(
  gift: T,
  anonymous: boolean,
): T {
  if (!anonymous) return gift;
  return { ...gift, donorId: null };
}

/** Task donor join (§7.2): scrub name/email/avatar; keep id for task linkage. */
export function redactTaskDonorForMissionary<
  T extends { name: string; email: string | null; avatar_url: string | null },
>(donor: T | null, anonymous: boolean): T | null {
  if (!donor) return null;
  if (!anonymous) return donor;
  return {
    ...donor,
    name: ANONYMOUS_DONOR_LABEL,
    email: null,
    avatar_url: null,
  };
}

/**
 * Public/campaign surface (§7.3): resolve a display name only — never expose
 * contact identifiers on public payloads. Ready for the public giving views to
 * consume when they move off mock data.
 */
export function projectPublicDonorDisplayName(
  donorName: string | null,
  anonymousToPublic: boolean,
): string {
  if (anonymousToPublic || !donorName) return ANONYMOUS_DONOR_LABEL;
  return donorName;
}
