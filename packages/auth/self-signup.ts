import type { UserRole } from "@asym/database/types";

export const SELF_SIGNUP_ROLES = ["donor", "missionary"] as const;

export type SelfSignupRole = (typeof SELF_SIGNUP_ROLES)[number];

export const SELF_SIGNUP_ROLE_OPTIONS: ReadonlyArray<{
  label: string;
  value: SelfSignupRole;
}> = [
  { label: "Donor", value: "donor" },
  { label: "Missionary", value: "missionary" },
];

const SELF_SIGNUP_ROLE_SET = new Set<SelfSignupRole>(SELF_SIGNUP_ROLES);

export function isSelfSignupRole(value: unknown): value is SelfSignupRole {
  return (
    typeof value === "string" &&
    SELF_SIGNUP_ROLE_SET.has(value as SelfSignupRole)
  );
}

export function normalizeSelfSignupRole(value: unknown): SelfSignupRole {
  return isSelfSignupRole(value) ? value : "donor";
}

export function getSelfSignupRedirectPath(role: UserRole | SelfSignupRole) {
  return role === "missionary" ? "/" : "/donor-dashboard";
}
