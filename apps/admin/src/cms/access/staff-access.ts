import { getTenantContext, isStaffRole, isSuperAdmin } from "./tenant-context";

import type { Access } from "payload";

export const staffOnlyAccess: Access = ({ req }) => {
  const context = getTenantContext(req);
  return context.isAuthenticated && isStaffRole(context);
};

export const superAdminOnlyAccess: Access = ({ req }) => {
  const context = getTenantContext(req);
  return context.isAuthenticated && isSuperAdmin(context);
};
