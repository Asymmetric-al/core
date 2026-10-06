import { getTenantContext, isSuperAdmin } from "./tenant-context";

import type { Access } from "payload";

export const superAdminOnlyAccess: Access = ({ req }) => {
  const context = getTenantContext(req);
  return context.isAuthenticated && isSuperAdmin(context);
};
