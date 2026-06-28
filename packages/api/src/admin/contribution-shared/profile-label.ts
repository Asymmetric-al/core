export interface ContributionProfileLabelInput {
  display_name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export function resolveContributionProfileLabel(
  profile: ContributionProfileLabelInput | null | undefined,
  fallback: string | null = null,
): string | null {
  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    profile?.display_name?.trim() ||
    profile?.full_name?.trim() ||
    fullName ||
    profile?.email?.trim() ||
    fallback?.trim() ||
    null
  );
}
