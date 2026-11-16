import { superAdminOnlyAccess } from "../access/staff-access";
import {
  tenantScopedReadAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";
import { createSupabaseAuthStrategy } from "../auth/supabase-strategy";
import { CMS_USERS_SLUG } from "../constants";

import type { CollectionConfig, FieldAccess } from "payload";

/**
 * The sign-in sync (supabase-strategy findOrSyncCmsUser) rewrites these from
 * Mission Control on every authenticated request, with overrideAccess; an
 * edit here would be undone, so nobody edits them here.
 */
const SYNCED_FROM_MISSION_CONTROL = "Set from Mission Control at each sign-in.";
const syncedOnly: FieldAccess = () => false;

export const CmsUsers: CollectionConfig = {
  slug: CMS_USERS_SLUG,
  // Payload derives "Cms Users" from the slug; staff see "Users".
  labels: { singular: "User", plural: "Users" },
  authorship: false,
  versions: false,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role"],
    components: {
      views: {
        list: {
          Component:
            "/src/cms-ui/web-studio/collections/shared/list-workspace/AdministrationListViews.tsx#UsersListView",
        },
      },
    },
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
      access: { update: syncedOnly },
      admin: { readOnly: true, description: SYNCED_FROM_MISSION_CONTROL },
    },
    {
      name: "supabaseUserId",
      label: "Sign-in ID",
      type: "text",
      index: true,
      unique: true,
      access: { update: syncedOnly },
      admin: { readOnly: true, description: SYNCED_FROM_MISSION_CONTROL },
    },
    {
      name: "tenantId",
      label: "Organization ID",
      type: "text",
      index: true,
      access: { update: syncedOnly },
      admin: { readOnly: true, description: SYNCED_FROM_MISSION_CONTROL },
    },
    {
      name: "role",
      type: "select",
      defaultValue: "staff",
      access: { update: syncedOnly },
      admin: { readOnly: true, description: SYNCED_FROM_MISSION_CONTROL },
      options: [
        { label: "Staff", value: "staff" },
        { label: "Admin", value: "admin" },
        { label: "Super admin", value: "super_admin" },
      ],
    },
  ],
};
