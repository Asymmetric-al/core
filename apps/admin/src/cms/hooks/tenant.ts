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

    return {
      ...data,
      [tenantField]: context.tenantId,
    };
  };
};
