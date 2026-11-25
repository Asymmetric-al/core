import { isServeUnderPathsEnabled } from "@asym/database/app-base-path";
import {
  ASSIGNMENT_HEADER,
  SCOPE_REFUSED_HEADER,
  TENANT_HEADER,
} from "@asym/database/request-scope-headers";

import type { RoleClass } from "./principal/types";

export function requestOrigin(request: Request): string | null {
  const { headers } = request;
  const nextUrl = new URL(request.url);
  const authority = headers.get("host") ?? nextUrl.host;
  if (
    !["http:", "https:"].includes(nextUrl.protocol) ||
    !/^(?:[a-z\d.-]+|\[[a-f\d:.]+\])(?::\d+)?$/i.test(authority)
  )
    return null;
  try {
    return new URL(`${nextUrl.protocol}//${authority}`).origin;
  } catch {
    return null;
  }
}

export const STUDIO_ORIGIN_REFUSAL =
  "Web Studio only accepts changes made from Web Studio itself.";

export const UNSUPPORTED_MUTATION_TYPE = "Unsupported mutation content type.";

export function trustedMutationSource(
  request: Request,
  signed = false,
): boolean {
  const { headers } = request;
  const expected = requestOrigin(request);
  if (!expected) return false;
  const origin = headers.get("origin");
  if (origin !== null) return origin === expected;
  const site = headers.get("sec-fetch-site");
  if (site !== null && site !== "same-origin") return false;
  const referer = headers.get("referer");
  if (referer !== null) {
    try {
      return new URL(referer).origin === expected;
    } catch {
      return false;
    }
  }
  return (
    site === "same-origin" ||
    (!headers.has("cookie") &&
      (signed || /^Bearer \S+$/i.test(headers.get("authorization") ?? "")))
  );
}

export function mutationMediaType(request: Request): string | undefined {
  return request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
}

export function isSameOriginDownload(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site !== null) return site === "same-origin";
  const referer = request.headers.get("referer");
  try {
    return (
      referer !== null && new URL(referer).origin === requestOrigin(request)
    );
  } catch {
    return false;
  }
}

export const ROLE_CLASS_HEADER = "x-asym-role-class";
export { ASSIGNMENT_HEADER, SCOPE_REFUSED_HEADER, TENANT_HEADER };

export const ADDRESS_PREFIX_HEADER = "x-asym-address-prefix";

export const TENANT_REWRITE_HEADER = "x-asym-tenant-rewrite";

export const NAME_TENANT_HEADER = "x-asym-name-tenant";

export const PAGE_SCOPE_HEADERS = [
  TENANT_HEADER,
  ASSIGNMENT_HEADER,
  ADDRESS_PREFIX_HEADER,
  TENANT_REWRITE_HEADER,
  NAME_TENANT_HEADER,
] as const;

export type NameTenantState =
  | { readonly kind: "off" }
  | { readonly kind: "valid"; readonly tenantId: string }
  | { readonly kind: "absent" }
  | { readonly kind: "invalid" };

const NAME_TENANT_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function readNameTenantState(headers: {
  get(name: string): string | null;
}): NameTenantState {
  if (!isServeUnderPathsEnabled()) return { kind: "off" };
  const value = headers.get(NAME_TENANT_HEADER);
  if (value === null) return { kind: "absent" };
  return NAME_TENANT_ID.test(value)
    ? { kind: "valid", tenantId: value }
    : { kind: "invalid" };
}

export function isNameTenantRefused(state: NameTenantState): boolean {
  return state.kind === "invalid" || state.kind === "absent";
}

export function nameTenantIdOf(state: NameTenantState): string | null {
  return state.kind === "valid" ? state.tenantId : null;
}

const ROLE_CLASSES: readonly RoleClass[] = ["donor", "missionary", "staff"];

export function parseRoleClass(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return ROLE_CLASSES.find((roleClass) => roleClass === normalized) ?? null;
}
