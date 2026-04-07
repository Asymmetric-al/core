const PROFILE_CHANGE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "location",
  "ministryFocus",
  "bio",
  "facebook",
  "instagram",
  "twitter",
  "youtube",
  "website",
  "avatarUrl",
  "coverUrl",
] as const;

type ProfileChangeField = (typeof PROFILE_CHANGE_FIELDS)[number];

export type ProfileComparable = Record<ProfileChangeField, string>;

export function hasProfileChanges(
  currentProfile: ProfileComparable,
  originalProfile: ProfileComparable,
): boolean {
  return PROFILE_CHANGE_FIELDS.some(
    (field) => currentProfile[field] !== originalProfile[field],
  );
}
