import { getTenantContext, isSuperAdmin } from "../access/tenant-context";

import type { CollectionBeforeValidateHook } from "payload";

export const applyTenantFromContext = (
  tenantField: string = "tenant",
): CollectionBeforeValidateHook => {
  return ({ data, req }) => {
    const context = getTenantContext(req);

    if (isSuperAdmin(context) || !context.tenantId || !data) {
      return data;
    }

    const tenantIDType =
      req.payload?.collections?.tenants?.customIDType ??
      req.payload?.db?.defaultIDType;
    const numericTenantID = Number(context.tenantId);
    const tenantID =
      tenantIDType === "number" && Number.isSafeInteger(numericTenantID)
        ? numericTenantID
        : context.tenantId;

    return {
      ...data,
      [tenantField]: tenantID,
    };
  };
};
