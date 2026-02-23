import type { CollectionConfig } from "payload";

export const CmsUsers: CollectionConfig = {
  slug: "cms-users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [
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
