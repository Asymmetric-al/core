import {
  tenantScopedCreateAccess,
  tenantScopedDeleteAccess,
  tenantScopedReadAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";
import { applyTenantFromContext } from "../hooks/tenant";

import type { CollectionConfig } from "payload";

export const MissionaryProfiles: CollectionConfig = {
  slug: "missionary-profiles",
  admin: {
    defaultColumns: ["fullName", "tenant", "updatedAt"],
    useAsTitle: "fullName",
  },
  access: {
    read: tenantScopedReadAccess("tenant"),
    create: tenantScopedCreateAccess("tenant"),
    update: tenantScopedUpdateAccess("tenant"),
    delete: tenantScopedDeleteAccess("tenant"),
  },
  hooks: {
    beforeValidate: [applyTenantFromContext("tenant")],
    afterChange: [logCmsChangeAudit],
    afterDelete: [logCmsDeleteAudit],
  },
  fields: [
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      index: true,
    },
    {
      name: "fullName",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "tagline",
      type: "text",
    },
    {
      name: "bio",
      type: "textarea",
    },
    {
      name: "location",
      type: "text",
    },
    {
      name: "portrait",
      type: "relationship",
      relationTo: "media",
    },
  ],
};
