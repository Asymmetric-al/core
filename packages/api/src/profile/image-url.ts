import { getSupabasePublicConfig } from "@asym/database/supabase/config";

import { ApiHttpError } from "../shared/api-http-error";

export type ProfileImagePurpose = "avatars" | "covers";

const PUBLIC_BUCKET_PATH = "/storage/v1/object/public/profiles/";

/**
 * Origin of the configured `NEXT_PUBLIC_SUPABASE_URL` (the base storage public
 * URLs are built from), or null when it is unset or not an http(s) URL.
 */
export function getProfileImageOrigin(): string | null {
  const configured = getSupabasePublicConfig().url;
  if (!configured) return null;
  try {
    const { origin, protocol } = new URL(configured);
    return protocol === "https:" || protocol === "http:" ? origin : null;
  } catch {
    return null;
  }
}

function isNormalizedSegment(segment: string): boolean {
  if (!segment || /%(2f|5c)/i.test(segment)) return false;
  try {
    const decoded = decodeURIComponent(segment);
    return decoded !== "." && decoded !== "..";
  } catch {
    return false;
  }
}

/**
 * True only for an exact public object URL of this project's `profiles`
 * bucket inside the caller's own folder:
 * `{origin}/storage/v1/object/public/profiles/{purpose}/{tenantId}/{userId}/{rest}`.
 * All comparisons are exact strings. The URL must already be in canonical
 * form (no query, fragment, credentials, default port, dot segments or
 * encoded slashes), so what is stored is exactly what storage serves.
 */
export function isOwnProfileImageUrl(
  url: string,
  expected: {
    purpose: ProfileImagePurpose;
    tenantId: string;
    userId: string;
    origin: string;
  },
): boolean {
  if (!url || /[?#\\]/.test(url)) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (
    parsed.href !== url ||
    parsed.origin !== expected.origin ||
    parsed.username ||
    parsed.password ||
    !parsed.pathname.startsWith(PUBLIC_BUCKET_PATH)
  ) {
    return false;
  }
  const [purpose, tenantId, userId, ...rest] = parsed.pathname
    .slice(PUBLIC_BUCKET_PATH.length)
    .split("/");
  return (
    Boolean(expected.tenantId && expected.userId) &&
    purpose === expected.purpose &&
    tenantId === expected.tenantId &&
    userId === expected.userId &&
    rest.length > 0 &&
    rest.every(isNormalizedSegment)
  );
}

/**
 * Applies the #2406 rule to one image URL field before any write. Returns
 * whether the value must be written: `undefined` (absent) and a value equal
 * to a stored value (OQ2) are not written; `null` clears the field. A new
 * value must be an own-folder public URL of the `profiles` bucket (400), and
 * cannot be checked without the public Supabase URL (503).
 */
export function checkProfileImageUrl(
  value: string | null | undefined,
  input: {
    purpose: ProfileImagePurpose;
    tenantId: string;
    userId: string;
    stored: readonly (string | null | undefined)[];
  },
): boolean {
  if (value === undefined) return false;
  if (value === null) return true;
  if (input.stored.includes(value)) return false;
  const origin = getProfileImageOrigin();
  if (!origin) {
    throw new ApiHttpError(503, "Profile image storage is not configured");
  }
  if (!isOwnProfileImageUrl(value, { ...input, origin })) {
    throw new ApiHttpError(
      400,
      `Image URL must be an uploaded ${input.purpose === "avatars" ? "avatar" : "cover"} in your own profile folder`,
    );
  }
  return true;
}
