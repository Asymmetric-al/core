export const TAGLINE_MAX_LENGTH = 100;
export const BIO_MIN_WORDS = 200;
export const BIO_MAX_WORDS = 600;
export const BIO_MAX_CHARS = 3500;

export const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face";
export const PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop";

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  ministryFocus: string;
  bio: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  website: string;
  avatarUrl: string;
  coverUrl: string;
}

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  website?: string;
  ministryFocus?: string;
  bio?: string;
}

export const initialProfile: ProfileData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  ministryFocus: "",
  bio: "",
  facebook: "",
  instagram: "",
  twitter: "",
  youtube: "",
  website: "",
  avatarUrl: "",
  coverUrl: "",
};

type JsonObject = Record<string, unknown>;

export function asObject(value: unknown): JsonObject | null {
  return typeof value === "object" && value !== null
    ? (value as JsonObject)
    : null;
}

export function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function mapApiProfileToProfileData(apiProfile: unknown): ProfileData {
  const profile = asObject(apiProfile);
  const missionary = asObject(profile?.missionary);
  const socialLinks = asObject(missionary?.social_links);

  return {
    firstName: asString(profile?.first_name),
    lastName: asString(profile?.last_name),
    email: asString(profile?.email),
    phone: asString(missionary?.phone),
    location: asString(missionary?.location),
    ministryFocus: asString(missionary?.tagline),
    bio: asString(missionary?.bio),
    facebook: asString(socialLinks?.facebook),
    instagram: asString(socialLinks?.instagram),
    twitter: asString(socialLinks?.twitter),
    youtube: asString(socialLinks?.youtube),
    website: asString(socialLinks?.website),
    avatarUrl: asString(profile?.avatar_url),
    coverUrl: asString(missionary?.cover_url),
  };
}

export function countWords(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}
