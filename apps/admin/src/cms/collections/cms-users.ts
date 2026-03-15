import { superAdminOnlyAccess } from "../access/staff-access";
import {
  tenantScopedReadAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";
import { createSupabaseAuthStrategy } from "../auth/supabase-strategy";
import { CMS_USERS_SLUG } from "../constants";

import type { CollectionConfig } from "payload";

export const CmsUsers: CollectionConfig = {
  slug: CMS_USERS_SLUG,
  admin: {
    useAsTitle: "email",
  },
  access: {
    read: tenantScopedReadAccess("tenantId"),
    create: superAdminOnlyAccess,
    update: tenantScopedUpdateAccess("tenantId"),
    delete: superAdminOnlyAccess,
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [createSupabaseAuthStrategy()],
  },
  fields: [
    {
      name: "email",
      type: "email",
      index: true,
      required: true,
      unique: true,
    },
    {
      name: "supabaseUserId",
      type: "text",
      index: true,
      unique: true,
    },
    {
      name: "tenantId",
      type: "text",
      index: true,
    },
    {
      name: "role",
      type: "select",
      defaultValue: "staff",
      options: [
        { label: "Staff", value: "staff" },
        { label: "Admin", value: "admin" },
        { label: "Super Admin", value: "super_admin" },
      ],
    },
  ],
};
