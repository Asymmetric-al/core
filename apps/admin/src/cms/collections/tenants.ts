import { publicTenantReadAccess } from "../access/public-read";
import { superAdminOnlyAccess } from "../access/staff-access";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";

import type { CollectionConfig } from "payload";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  versions: false,
  admin: {
    useAsTitle: "name",
  },
  access: {
    // Public reads see only the resolved, active tenant document; staff
    // behavior (self-tenant, super-admin all) is unchanged inside the policy.
    read: publicTenantReadAccess(),
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
