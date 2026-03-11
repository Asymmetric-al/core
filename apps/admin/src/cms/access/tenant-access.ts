import { getTenantContext, isStaffRole, isSuperAdmin } from "./tenant-context";

import type { Access } from "payload";

type TenantFieldName = string;

export const tenantScopedReadAccess = (
  tenantField: TenantFieldName = "tenant",
): Access => {
  return ({ req }) => {
    const context = getTenantContext(req);

    if (!context.isAuthenticated || !isStaffRole(context)) {
      return false;
    }

    if (isSuperAdmin(context)) {
      return true;
    }

    if (!context.tenantId) {
      return false;
    }

    return {
      [tenantField]: {
        equals: context.tenantId,
      },
    };
  };
};

export const tenantScopedUpdateAccess = (
  tenantField: TenantFieldName = "tenant",
): Access => tenantScopedReadAccess(tenantField);

export const tenantScopedDeleteAccess = (
  tenantField: TenantFieldName = "tenant",
): Access => tenantScopedReadAccess(tenantField);

export const tenantScopedCreateAccess = (
  tenantField: TenantFieldName = "tenant",
): Access => {
  return ({ req, data }) => {
    const context = getTenantContext(req);

    if (!context.isAuthenticated || !isStaffRole(context)) {
      return false;
    }

    if (isSuperAdmin(context)) {
      return true;
    }

    if (!context.tenantId) {
      return false;
    }

    const tenantFromRequest =
      typeof data?.[tenantField] === "string"
        ? data[tenantField]
        : data?.[tenantField]?.id;

    if (!tenantFromRequest) {
      return true;
    }

    return tenantFromRequest === context.tenantId;
  };
};
