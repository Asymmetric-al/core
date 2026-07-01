import { superAdminOnlyAccess } from "../access/staff-access";
import { getTenantContext, isSuperAdmin } from "../access/tenant-context";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";

import type { CollectionConfig } from "payload";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  versions: false,
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: ({ req }) => {
      const context = getTenantContext(req);

      if (!context.isAuthenticated) {
        return false;
      }

      if (isSuperAdmin(context)) {
        return true;
      }

      if (!context.tenantId) {
        return false;
      }

      return {
        id: {
          equals: context.tenantId,
        },
      };
    },
    create: superAdminOnlyAccess,
    update: superAdminOnlyAccess,
    delete: superAdminOnlyAccess,
  },
  hooks: {
    afterChange: [logCmsChangeAudit],
    afterDelete: [logCmsDeleteAudit],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "primaryDomain",
      type: "text",
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
