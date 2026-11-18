import { contextCapabilities } from "@asym/auth/context";

import {
  formatRequiredCapabilities,
  isContributionCapability,
  isProviderGranularContributionAction,
  requiredCapabilitiesForContributionAction,
} from "./action-capabilities";
import { ApiHttpError } from "../../shared/api-http-error";

import type { ContributionCapability } from "./action-capabilities";
import type { ContributionActionType, ContributionPermission } from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";

/**
 * The server-side contribution checks: they read the caller's capabilities
 * from the request's auth context (`@asym/auth/context`, which needs
 * `next/headers`), so this module is server-only. What each action requires
 * lives in `./action-capabilities`, which client code may import; it is
 * re-exported here for the server modules that already import it from this
 * file (AL-2675).
 */
export {
  APPROVE_CORRECTION_CAPABILITY,
  REQUEST_CORRECTION_CAPABILITY,
  directContributionCapabilityForAction,
  isProviderGranularContributionAction,
  requiredCapabilitiesForContributionAction,
  type ContributionCapability,
} from "./action-capabilities";

/**
 * The legacy `finance:manage_contributions` permission is the registry's
 * `contributions.apply_corrections`: both are held by finance staff and the
 * tenant administrator and by no other sub-role (AL-2675).
 */
export function hasContributionPermission(
  auth: AuthenticatedContext,
  permission: ContributionPermission,
): boolean {
  if (permission !== "finance:manage_contributions") {
    return false;
  }

  return resolveContributionCapabilities(auth).includes(
    "contributions.apply_corrections",
  );
}

export function assertContributionPermission(
  auth: AuthenticatedContext,
  permission: ContributionPermission,
): void {
  if (!hasContributionPermission(auth, permission)) {
    throw new ApiHttpError(403, `Forbidden: requires ${permission}`);
  }
}

export function assertContributionActionPermission(
  auth: AuthenticatedContext,
  actionType: ContributionActionType,
  options: { mode?: "direct" | "request" } = {},
): void {
  const requiredCapabilities = requiredCapabilitiesForContributionAction(
    actionType,
    options,
  );
  const actorCapabilities = resolveContributionCapabilities(auth);
  const requiresEveryCapability =
    isProviderGranularContributionAction(actionType) &&
    options.mode === "request";
  const hasRequiredCapabilities = requiresEveryCapability
    ? requiredCapabilities.every((capability) =>
        actorCapabilities.includes(capability),
      )
    : requiredCapabilities.some((capability) =>
        actorCapabilities.includes(capability),
      );

  if (hasRequiredCapabilities) {
    return;
  }

  throw new ApiHttpError(
    403,
    `Forbidden: requires ${formatRequiredCapabilities(
      requiredCapabilities,
      requiresEveryCapability ? "and" : "or",
    )}`,
  );
}

/**
 * The contribution capabilities of the one membership the request acts
 * under, read from the code registry: the sub-role's bundle and, with the
 * tenant-administrator flag, the tenant administrator's (plan 5.1). This
 * module's own role-keyed table is retired (AL-2675).
 */
export function resolveContributionCapabilities(
  auth: AuthenticatedContext,
): ContributionCapability[] {
  return contextCapabilities(auth).filter(isContributionCapability);
}
