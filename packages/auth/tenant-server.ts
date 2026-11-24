import {
  isServeUnderPathsEnabled,
  withAppBasePath,
} from "@asym/database/document-reload";
import { headers } from "next/headers";
import { permanentRedirect, redirect, unstable_rethrow } from "next/navigation";

import {
  ADDRESS_PREFIX_HEADER,
  isNameTenantRefused,
  nameTenantIdOf,
  readNameTenantState,
  type NameTenantState,
} from "./request-headers";
import { parseTenantAddress, withTenantAddress } from "./tenant-address";

import type { AuthContext } from "./context";
import type { DocumentScope } from "@asym/database/document-scope";

export async function readAddressPrefix(): Promise<string | null> {
  const prefix = (await headers()).get(ADDRESS_PREFIX_HEADER);
  return prefix && parseTenantAddress(prefix)?.prefix === prefix
    ? prefix
    : null;
}

export async function readServerNameTenantState(): Promise<NameTenantState> {
  if (!isServeUnderPathsEnabled()) return { kind: "off" };
  try {
    return readNameTenantState(await headers());
  } catch (error) {
    unstable_rethrow(error);
    return { kind: "absent" };
  }
}

export async function readDocumentScope(
  auth: AuthContext,
): Promise<DocumentScope | null> {
  const name = await readServerNameTenantState();
  if (isNameTenantRefused(name)) {
    throw new Error("The request carries no verified name for this dashboard.");
  }
  const addressPrefix = await readAddressPrefix();
  if (!addressPrefix) return null;
  const { tenantId, subRole } = parseTenantAddress(addressPrefix)!;
  const { assignment } = auth;
  const nameTenantId = nameTenantIdOf(name);
  if (
    !auth.isAuthenticated ||
    !auth.userId ||
    !assignment ||
    assignment.tenantId !== tenantId ||
    auth.tenantId !== tenantId ||
    (nameTenantId !== null && nameTenantId !== tenantId) ||
    (subRole !== null && assignment.staffRole !== subRole)
  ) {
    throw new Error(
      `The resolved assignment does not match the page address "${addressPrefix}".`,
    );
  }
  return {
    userId: auth.userId,
    tenantId,
    assignmentId: assignment.assignmentId,
    addressPrefix,
  };
}

export function readPortalDocumentScope(
  auth: AuthContext,
): DocumentScope | null {
  const { assignment } = auth;
  if (
    !auth.isAuthenticated ||
    !auth.userId ||
    !assignment ||
    assignment.membershipRole !== "donor" ||
    assignment.tenantId !== auth.tenantId
  ) {
    return null;
  }
  return {
    userId: auth.userId,
    tenantId: assignment.tenantId,
    assignmentId: assignment.assignmentId,
    addressPrefix: "",
  };
}

export async function tenantHref(path: string): Promise<string> {
  return withTenantAddress(await readAddressPrefix(), path);
}

export async function redirectInTenant(path: string): Promise<never> {
  redirect(await tenantHref(path));
}

export async function permanentRedirectInTenant(path: string): Promise<never> {
  permanentRedirect(await tenantHref(path));
}

export async function redirectFromActionInTenant(path: string): Promise<never> {
  const target = await tenantHref(path);
  const requestHeaders = await headers();
  redirect(
    requestHeaders.has("next-action") ? target : withAppBasePath(target),
  );
}
