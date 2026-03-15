import type { UserRole } from "@asym/database/types";

export const E2E_AUTH_COOKIE_NAME = "asym_e2e_auth";
const E2E_AUTH_BYPASS_VALUES = new Set(["1", "true"]);
const USER_ROLES: readonly UserRole[] = [
  "donor",
  "missionary",
  "admin",
  "staff",
  "super_admin",
];
const USER_ROLE_SET = new Set(USER_ROLES);

export interface E2EAuthSession {
  userId: string;
  role: UserRole;
  tenantId: string | null;
}

export function isE2EAuthBypassEnabled() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const value = process.env.E2E_AUTH_BYPASS?.trim().toLowerCase();
  return value ? E2E_AUTH_BYPASS_VALUES.has(value) : false;
}

export function createE2EAuthCookieValue(session: E2EAuthSession) {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export function parseE2EAuthCookieValue(
  value: string | null | undefined,
): E2EAuthSession | null {
  if (!value) return null;

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as Partial<E2EAuthSession>;

    if (
      typeof parsed.userId !== "string" ||
      !parsed.userId ||
      typeof parsed.role !== "string" ||
      !USER_ROLE_SET.has(parsed.role as UserRole)
    ) {
      return null;
    }

    return {
      userId: parsed.userId,
      role: parsed.role as UserRole,
      tenantId:
        typeof parsed.tenantId === "string"
          ? parsed.tenantId
          : parsed.tenantId
            ? null
            : null,
    };
  } catch {
    return null;
  }
}
