import { publicTenantReadAccess } from "../access/public-read";
import { superAdminOnlyAccess } from "../access/staff-access";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";

import type { CollectionConfig, FieldAccess } from "payload";

/**
 * The sign-in sync (supabase-strategy findOrCreateCmsTenant) finds a tenant
 * by slug and rewrites its name from Mission Control: a changed name is
 * undone and a changed slug would leave the tenant behind and create a new
 * one at the next sign-in, so nobody edits them here.
 */
const SYNCED_FROM_MISSION_CONTROL = "Set from Mission Control at each sign-in.";
const syncedOnly: FieldAccess = () => false;

export const Tenants: CollectionConfig = {
  slug: "tenants",
  labels: { singular: "Organization", plural: "Organizations" },
  authorship: false,
  versions: false,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "primaryDomain", "isActive", "updatedAt"],
    components: {
      views: {
        list: {
          Component:
            "/src/cms-ui/web-studio/collections/shared/list-workspace/AdministrationListViews.tsx#OrganizationsListView",
        },
      },
    },
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
      access: { update: syncedOnly },
      admin: { readOnly: true, description: SYNCED_FROM_MISSION_CONTROL },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      access: { update: syncedOnly },
      admin: { readOnly: true, description: SYNCED_FROM_MISSION_CONTROL },
    },
    {
      name: "primaryDomain",
      type: "text",
    },
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
